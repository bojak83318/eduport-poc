# Agent 30: QA Engineer - Load Testing

**Agent Role:** @eduport/qa-engineer  
**Task ID:** QA-005  
**Batch:** 6  
**Priority:** High  
**Deadline:** Jan 15, 12:00 AM

---

## Context

Load testing validates that the system can handle production traffic. We use k6 to simulate 500 concurrent users making conversion requests.

---

## Task

Create and run k6 load tests to verify performance thresholds.

---

## Test Script

**File:** `/tests/load/single-conversion.k6.js`

```javascript
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Trend } from 'k6/metrics'

// Custom metrics
const conversionErrors = new Counter('conversion_errors')
const conversionDuration = new Trend('conversion_duration')

export const options = {
  stages: [
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '1m', target: 500 },    // Ramp up to 500 users
    { duration: '3m', target: 500 },    // Stay at 500 users
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // P95 latency < 5s
    http_req_failed: ['rate<0.01'],      // Error rate < 1%
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Test Wordwall URLs (use real working URLs from corpus)
const TEST_URLS = [
  'https://wordwall.net/resource/12345678',
  'https://wordwall.net/resource/87654321',
  // Add more from test corpus
]

export default function () {
  const url = TEST_URLS[Math.floor(Math.random() * TEST_URLS.length)]
  
  const payload = JSON.stringify({
    url: url,
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
        const body = JSON.parse(r.body)
        return body.h5pJson !== undefined || body.downloadUrl !== undefined
      } catch {
        return false
      }
    },
  })
  
  if (!success) {
    conversionErrors.add(1)
    console.log(`Failed: ${res.status} - ${res.body?.substring(0, 100)}`)
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
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'] || 0
  const errorRate = data.metrics.http_req_failed?.values?.rate || 0
  const totalRequests = data.metrics.http_reqs?.values?.count || 0
  
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
```

---

## Run Instructions

### 1. Install k6

```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### 2. Run Load Test

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc

# Run against local dev server
npm run dev &
k6 run tests/load/single-conversion.k6.js

# Run against production
k6 run -e BASE_URL=https://eduport.app tests/load/single-conversion.k6.js
```

### 3. Generate Report

Create `/docs/load-test-results.md` with findings.

---

## Results Documentation

**File:** `/docs/load-test-results.md`

```markdown
# Load Test Results - [Date]

## Summary
- **Total Requests:** X
- **P95 Latency:** Xms (target: <5s)
- **Error Rate:** X% (target: <1%)
- **Peak Concurrent Users:** 500

## Thresholds
| Metric | Result | Threshold | Status |
|--------|--------|-----------|--------|
| P95 Latency | Xms | <5000ms | ✅/❌ |
| Error Rate | X% | <1% | ✅/❌ |

## Bottlenecks Identified
1. [Describe any bottlenecks]
2. [Proposed solutions]

## Recommendations
- [Performance improvements]
```

---

## Acceptance Criteria

1. ✅ k6 test script created at `/tests/load/single-conversion.k6.js`
2. ✅ Test runs with 500 concurrent users
3. ✅ P95 latency < 5s (or identify bottleneck)
4. ✅ Error rate < 1%
5. ✅ Results documented in `/docs/load-test-results.md`

---

## Verification

```bash
k6 run --vus 10 --duration 30s tests/load/single-conversion.k6.js
```

---

## Deadline

**Jan 15, 12:00 AM**
