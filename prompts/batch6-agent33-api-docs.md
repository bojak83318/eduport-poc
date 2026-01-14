# Agent 33: Frontend Engineer - API Documentation

**Agent Role:** @eduport/frontend-engineer  
**Task ID:** FE-006  
**Batch:** 6  
**Priority:** Medium  
**Deadline:** Jan 15, 12:00 AM

---

## Context

API documentation helps developers integrate with EduPort. We'll create an interactive Swagger UI page with OpenAPI 3.0 spec.

---

## Task

Create API documentation with Swagger UI at `/docs/api`.

---

## Implementation

### 1. Install Swagger UI

```bash
npm install --save swagger-ui-react
```

### 2. Create OpenAPI Spec

**File:** `/app/docs/api/openapi.json`

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "EduPort API",
    "description": "Convert Wordwall activities to H5P format",
    "version": "1.0.0",
    "contact": {
      "email": "api@eduport.app"
    }
  },
  "servers": [
    {
      "url": "https://eduport.app/api",
      "description": "Production"
    },
    {
      "url": "http://localhost:3000/api",
      "description": "Development"
    }
  ],
  "paths": {
    "/convert": {
      "post": {
        "summary": "Convert a Wordwall activity to H5P",
        "description": "Converts a single Wordwall URL to H5P format. Returns download URL.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ConvertRequest"
              },
              "example": {
                "url": "https://wordwall.net/resource/12345678"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful conversion",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ConvertResponse"
                }
              }
            }
          },
          "400": {
            "description": "Invalid request"
          },
          "429": {
            "description": "Rate limit exceeded"
          }
        }
      }
    },
    "/bulk": {
      "post": {
        "summary": "Bulk convert multiple URLs",
        "description": "Queue multiple Wordwall URLs for conversion. Returns job ID for polling.",
        "security": [
          { "BearerAuth": [] }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BulkRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Job created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BulkResponse"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      },
      "get": {
        "summary": "Check bulk job status",
        "parameters": [
          {
            "name": "jobId",
            "in": "query",
            "required": true,
            "schema": { "type": "string" }
          }
        ],
        "responses": {
          "200": {
            "description": "Job status"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "ConvertRequest": {
        "type": "object",
        "required": ["url"],
        "properties": {
          "url": {
            "type": "string",
            "pattern": "^https://wordwall\\.net/resource/\\d+$",
            "description": "Wordwall activity URL"
          }
        }
      },
      "ConvertResponse": {
        "type": "object",
        "properties": {
          "downloadUrl": {
            "type": "string",
            "description": "URL to download the H5P file"
          },
          "template": {
            "type": "string",
            "description": "Detected Wordwall template type"
          }
        }
      },
      "BulkRequest": {
        "type": "object",
        "required": ["urls"],
        "properties": {
          "urls": {
            "type": "array",
            "items": { "type": "string" },
            "maxItems": 1000
          },
          "webhookUrl": {
            "type": "string",
            "description": "Optional webhook for completion notification"
          }
        }
      },
      "BulkResponse": {
        "type": "object",
        "properties": {
          "jobId": { "type": "string" },
          "status": { "type": "string" },
          "urlCount": { "type": "integer" }
        }
      }
    },
    "securitySchemes": {
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer"
      }
    }
  }
}
```

### 3. Create Swagger UI Page

**File:** `/app/docs/api/page.tsx`

```tsx
'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold">EduPort API Documentation</h1>
      </div>
      <SwaggerUI url="/docs/api/openapi.json" />
    </div>
  )
}
```

### 4. Add Code Examples

Create a separate examples section:

**File:** `/app/docs/api/examples.tsx`

```tsx
export function CodeExamples() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Code Examples</h2>
      
      <h3 className="text-xl font-semibold mt-6">cURL</h3>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
{`curl -X POST https://eduport.app/api/convert \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://wordwall.net/resource/12345678"}'`}
      </pre>
      
      <h3 className="text-xl font-semibold mt-6">Python</h3>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
{`import requests

response = requests.post(
    "https://eduport.app/api/convert",
    json={"url": "https://wordwall.net/resource/12345678"}
)
data = response.json()
print(f"Download: {data['downloadUrl']}")`}
      </pre>
      
      <h3 className="text-xl font-semibold mt-6">Node.js</h3>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
{`const response = await fetch("https://eduport.app/api/convert", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: "https://wordwall.net/resource/12345678" })
});
const data = await response.json();
console.log(\`Download: \${data.downloadUrl}\`);`}
      </pre>
    </div>
  )
}
```

---

## Acceptance Criteria

1. ✅ OpenAPI 3.0 spec created at `/app/docs/api/openapi.json`
2. ✅ Swagger UI renders at `/docs/api`
3. ✅ "Try it out" button works for testing
4. ✅ Code examples for curl, Python, Node.js
5. ✅ All endpoints documented with schemas

---

## Verification

```bash
npm run dev
# Visit http://localhost:3000/docs/api
# Verify Swagger UI loads and "Try it out" works
```

---

## Deadline

**Jan 15, 12:00 AM**
