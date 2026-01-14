#!/bin/bash
# Test rate limiting (send 12 requests to trigger limit)
# Note: Ensure the server is running on localhost:3000 and Upstash keys are valid.

echo "Sending 12 requests to /api/convert..."

for i in {1..12}; do
  echo -n "Request $i: "
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/convert \
    -H "Content-Type: application/json" \
    -d '{"wordwallUrl":"https://wordwall.net/resource/123", "attestOwnership": true}'
  
  # Upstash might be fast, but sometimes we need a tiny delay or just hammer it.
  # sleep 0.1
done

echo "Done. Expecting 429 on the 11th/12th request."
