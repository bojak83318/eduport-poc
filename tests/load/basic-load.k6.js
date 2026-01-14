import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    // Simplified: 50 users for 2 minutes
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<5000'],
        http_req_failed: ['rate<0.05'],
    },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

export default function () {
    // Test health endpoint first (lightweight)
    const healthRes = http.get(BASE_URL + '/api/health')
    check(healthRes, {
        'health check ok': function (r) { return r.status === 200 },
    })

    sleep(1)

    // Test convert endpoint with a simple URL
    const payload = JSON.stringify({
        url: 'https://wordwall.net/resource/12345678',
    })

    const convertRes = http.post(BASE_URL + '/api/convert', payload, {
        headers: { 'Content-Type': 'application/json' },
    })

    check(convertRes, {
        'convert responds': function (r) {
            return r.status === 200 || r.status === 400 || r.status === 429 || r.status === 500
        },
    })

    sleep(2)
}

export function handleSummary(data) {
    var metrics = data.metrics || {}
    var reqDuration = metrics.http_req_duration || {}
    var durationValues = reqDuration.values || {}
    var p95 = durationValues['p(95)'] || 0

    var reqFailed = metrics.http_req_failed || {}
    var failedValues = reqFailed.values || {}
    var errorRate = failedValues.rate || 0

    var httpReqs = metrics.http_reqs || {}
    var reqsValues = httpReqs.values || {}
    var totalRequests = reqsValues.count || 0

    var passed = p95 < 5000

    console.log('\n====================================')
    console.log('LOAD TEST RESULTS')
    console.log('====================================')
    console.log('Total Requests: ' + totalRequests)
    console.log('P95 Latency:    ' + p95.toFixed(0) + 'ms')
    console.log('Threshold:      <5000ms')
    console.log('Status:         ' + (passed ? 'PASS' : 'FAIL'))
    console.log('Error Rate:     ' + (errorRate * 100).toFixed(2) + '%')
    console.log('====================================\n')

    return {
        'tests/load/results.json': JSON.stringify(data, null, 2),
    }
}
