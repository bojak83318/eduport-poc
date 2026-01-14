# Agent 35: QA Engineer - Load Testing (Retry)

**Agent Role:** @eduport/qa-engineer  
**Task ID:** QA-005  
**Batch:** 7  
**Priority:** High  
**Deadline:** Jan 14, 11:30 PM

---

## Context

Load testing from Batch 6 encountered errors. This is a simplified retry focusing on validating basic performance thresholds.

---

## Task

Create and run a simplified k6 load test to verify P95 latency <5s.

---

## Simplified Test Script

**File:** `/tests/load/basic-load.k6.js`

```javascript
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
  const healthRes = http.get(`${BASE_URL}/api/health`)
  check(healthRes, {
    'health check ok': (r) => r.status === 200,
  })
  
  sleep(1)
  
  // Test convert endpoint with a simple URL
  const payload = JSON.stringify({
    url: 'https://wordwall.net/resource/12345678',
  })
  
  const convertRes = http.post(`${BASE_URL}/api/convert`, payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  
  check(convertRes, {
    'convert responds': (r) => r.status === 200 || r.status === 400 || r.status === 429,
  })
  
  sleep(2)
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'] || 0
  const passed = p95 < 5000
  
  console.log(`
====================================
LOAD TEST RESULTS
====================================
P95 Latency: ${p95.toFixed(0)}ms
Threshold:   <5000ms
Status:      ${passed ? '✅ PASS' : '❌ FAIL'}
====================================
`)
  
  return {
    'tests/load/results.json': JSON.stringify(data, null, 2),
  }
}
```

---

## Alternative: Manual Performance Test

If k6 installation fails, run a manual test:

```bash
# Create test script
cat > /tmp/perf-test.sh << 'EOF'
#!/bin/bash
echo "Running 20 sequential requests..."
total_time=0

for i in {1..20}; do
  start=$(date +%s%3N)
  curl -s -X POST http://localhost:3000/api/convert \
    -H "Content-Type: application/json" \
    -d '{"url":"https://wordwall.net/resource/12345678"}' > /dev/null
  end=$(date +%s%3N)
  elapsed=$((end - start))
  total_time=$((total_time + elapsed))
  echo "Request $i: ${elapsed}ms"
done

avg=$((total_time / 20))
echo "========================"
echo "Average latency: ${avg}ms"
echo "Target: <5000ms"
if [ $avg -lt 5000 ]; then
  echo "Status: ✅ PASS"
else
  echo "Status: ❌ FAIL"
fi
EOF

chmod +x /tmp/perf-test.sh
/tmp/perf-test.sh
```

---

## Results Documentation

Create `/docs/load-test-results.md`:

```markdown
# Load Test Results - January 14, 2026

## Summary
- **Tool:** k6 / Manual bash script
- **Users:** 50 concurrent (or 20 sequential)
- **Duration:** 2 minutes
- **Target:** P95 < 5s

## Results
| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| P95 Latency | Xms | <5000ms | ✅/❌ |
| Error Rate | X% | <5% | ✅/❌ |

## Bottlenecks
- [Document any identified bottlenecks]

## Recommendations
- [Performance improvement suggestions]
```

---

## Acceptance Criteria

1. ✅ Load test script created (k6 or bash alternative)
2. ✅ Test runs successfully
3. ✅ P95 latency documented
4. ✅ Results saved to `/docs/load-test-results.md`

---

## Verification

```bash
# Option 1: k6 (if installed)
k6 run tests/load/basic-load.k6.js

# Option 2: Manual test
bash /tmp/perf-test.sh
```

---

## Deadline

**Jan 14, 11:30 PM**
