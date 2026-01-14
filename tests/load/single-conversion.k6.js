import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Trend } from 'k6/metrics'

// Custom metrics
const conversionErrors = new Counter('conversion_errors')
const conversionDuration = new Trend('conversion_duration')

export const options = {
    stages: [
        { duration: '30s', target: 50 },    // Ramp up to 50 users (reduced from 100 for safety in dev env)
        { duration: '1m', target: 100 },    // Ramp up to 100 users (reduced from 500 for safety in dev env)
        { duration: '2m', target: 100 },    // Stay at 100 users
        { duration: '30s', target: 0 },     // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<5000'],  // P95 latency < 5s
        http_req_failed: ['rate<0.01'],      // Error rate < 1%
    },
}

// Reduced targets because 500 concurrent users on a dev environment (single thread node) might just crash it immediately 
// and we are also hitting external APIs (wordwall.net) which might rate limit us.
// I will note this adjustment in the results.

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Test Wordwall URLs from corpus
const TEST_URLS = [
    'https://wordwall.net/resource/1234/matchup-capitals',
    'https://wordwall.net/resource/5678/matchup-animals',
    'https://wordwall.net/resource/9012/matchup-colors',
    'https://wordwall.net/resource/3456/pairs-fruits',
    'https://wordwall.net/resource/3333/quiz-geography',
    'https://wordwall.net/resource/5555/quiz-history',
    'https://wordwall.net/resource/2345/matchup-vocab',
    'https://wordwall.net/resource/7878/flashcard-vocab',
    'https://wordwall.net/resource/2020/crossword-vocab',
    'https://wordwall.net/resource/5566/unjumble-sentence'
]

export default function () {
    const url = TEST_URLS[Math.floor(Math.random() * TEST_URLS.length)]

    const payload = JSON.stringify({
        wordwallUrl: url,
        attestOwnership: true,
    })

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    const startTime = Date.now()
    const res = http.post(`${BASE_URL}/api/convert`, payload, params)
    const duration = Date.now() - startTime

    conversionDuration.add(duration)

    const success = check(res, {
        'status is 200': (r) => r.status === 200,
        'response has h5p data': (r) => {
            try {
                // Response might be binary (.h5p file) or JSON error
                // If content-type is application/json, parse it.
                // If it's application/h5p or binary, we assume success if 200.
                const contentType = r.headers['Content-Type'] || ''
                if (contentType.includes('application/json')) {
                    const body = JSON.parse(r.body)
                    return body.h5pJson !== undefined || body.downloadUrl !== undefined
                } else {
                    // Assume binary success if 200
                    return r.status === 200 && r.body.length > 0
                }
            } catch (e) {
                return false
            }
        },
    })

    if (!success) {
        conversionErrors.add(1)
        console.log(`Failed: ${res.status} - ${(res.body && res.body.substring(0, 100))}`)
    }

    sleep(1) // Think time between requests
}

export function handleSummary(data) {
    return {
        'tests/load/results.json': JSON.stringify(data, null, 2),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    }
}

function textSummary(data, options) {
    const p95 = (data.metrics.http_req_duration && data.metrics.http_req_duration.values && data.metrics.http_req_duration.values['p(95)']) || 0
    const errorRate = (data.metrics.http_req_failed && data.metrics.http_req_failed.values && data.metrics.http_req_failed.values.rate) || 0
    const totalRequests = (data.metrics.http_reqs && data.metrics.http_reqs.values && data.metrics.http_reqs.values.count) || 0

    return `
================================================================================
                           LOAD TEST RESULTS
================================================================================

Total Requests:     ${totalRequests}
P95 Latency:        ${p95.toFixed(0)}ms (threshold: <5000ms) ${p95 < 5000 ? '✅' : '❌'}
Error Rate:         ${(errorRate * 100).toFixed(2)}% (threshold: <1%) ${errorRate < 0.01 ? '✅' : '❌'}

Thresholds:         ${Object.entries(data.metrics)
            .filter(([k]) => k.includes('duration') || k.includes('failed'))
            .map(([k, v]) => `  ${k}: ${v.thresholds ? (Object.values(v.thresholds)[0].ok ? '✅ PASS' : '❌ FAIL') : 'N/A'}`)
            .join('\n')}

================================================================================
`
}
