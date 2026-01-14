# Agent 32: Frontend Engineer - Legal Pages

**Agent Role:** @eduport/frontend-engineer  
**Task ID:** FE-005  
**Batch:** 6  
**Priority:** High  
**Deadline:** Jan 14, 11:30 PM

---

## Context

Legal compliance requires Terms of Service, Privacy Policy, and DMCA takedown process. These protect both users and the platform.

---

## Task

Create three legal pages with proper content structure.

---

## Pages to Create

### 1. Terms of Service

**File:** `/app/legal/terms/page.tsx`

```tsx
export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 prose">
      <h1>Terms of Service</h1>
      <p className="text-gray-500">Last updated: January 14, 2026</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using EduPort ("Service"), you agree to be bound by these 
        Terms of Service. If you do not agree, do not use the Service.
      </p>
      
      <h2>2. Description of Service</h2>
      <p>
        EduPort provides a tool to convert Wordwall activities to H5P format. 
        The Service is provided "as is" without warranties of any kind.
      </p>
      
      <h2>3. User Responsibilities</h2>
      <ul>
        <li>You must own or have permission to convert the Wordwall content</li>
        <li>You must not use the Service for illegal purposes</li>
        <li>You must not attempt to bypass rate limits or security measures</li>
      </ul>
      
      <h2>4. Intellectual Property</h2>
      <p>
        You retain ownership of your converted content. EduPort does not claim 
        any rights to your H5P files. However, you are responsible for ensuring 
        you have the rights to convert and use the original Wordwall content.
      </p>
      
      <h2>5. DMCA Compliance</h2>
      <p>
        We respect intellectual property rights. If you believe content infringes 
        your copyright, please see our <a href="/legal/dmca">DMCA Policy</a>.
      </p>
      
      <h2>6. Limitation of Liability</h2>
      <p>
        EduPort shall not be liable for any indirect, incidental, special, or 
        consequential damages arising from your use of the Service.
      </p>
      
      <h2>7. Changes to Terms</h2>
      <p>
        We may modify these terms at any time. Continued use after changes 
        constitutes acceptance of the new terms.
      </p>
      
      <h2>8. Contact</h2>
      <p>
        Questions about these Terms? Contact us at legal@eduport.app
      </p>
    </div>
  )
}
```

### 2. Privacy Policy

**File:** `/app/legal/privacy/page.tsx`

```tsx
export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 prose">
      <h1>Privacy Policy</h1>
      <p className="text-gray-500">Last updated: January 14, 2026</p>
      
      <h2>1. Information We Collect</h2>
      <h3>Account Information</h3>
      <ul>
        <li>Email address (from OAuth provider)</li>
        <li>Name (optional, from OAuth provider)</li>
        <li>OAuth provider (Google or GitHub)</li>
      </ul>
      
      <h3>Usage Data</h3>
      <ul>
        <li>Wordwall URLs you convert</li>
        <li>Conversion timestamps and status</li>
        <li>IP address for rate limiting</li>
      </ul>
      
      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide the conversion service</li>
        <li>Enforce rate limits and quotas</li>
        <li>Send service-related communications</li>
        <li>Improve our service through analytics</li>
      </ul>
      
      <h2>3. Data Retention</h2>
      <p>
        We retain conversion records for 90 days. You may request deletion 
        of your data at any time by contacting privacy@eduport.app.
      </p>
      
      <h2>4. Data Sharing</h2>
      <p>
        We do not sell your personal information. We may share data with:
      </p>
      <ul>
        <li>Service providers (hosting, analytics)</li>
        <li>Law enforcement when legally required</li>
      </ul>
      
      <h2>5. Your Rights (GDPR/CCPA)</h2>
      <ul>
        <li>Access your personal data</li>
        <li>Request data deletion</li>
        <li>Export your data</li>
        <li>Opt out of analytics</li>
      </ul>
      
      <h2>6. Cookies</h2>
      <p>
        We use essential cookies for authentication. We use Vercel Analytics 
        which collects anonymized usage data.
      </p>
      
      <h2>7. Contact</h2>
      <p>
        Data Protection Officer: privacy@eduport.app
      </p>
    </div>
  )
}
```

### 3. DMCA Policy

**File:** `/app/legal/dmca/page.tsx`

```tsx
'use client'

import { useState } from 'react'

export default function DmcaPage() {
  const [submitted, setSubmitted] = useState(false)
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    await fetch('/api/dmca', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: { 'Content-Type': 'application/json' },
    })
    
    setSubmitted(true)
  }
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">DMCA Takedown Request</h1>
      
      <div className="prose mb-8">
        <p>
          EduPort respects intellectual property rights. If you believe content 
          converted through our service infringes your copyright, please submit 
          a DMCA takedown notice below.
        </p>
        
        <h2>Required Information</h2>
        <ol>
          <li>Identification of the copyrighted work</li>
          <li>The Wordwall URL that was converted</li>
          <li>Your contact information</li>
          <li>A statement of good faith belief</li>
          <li>A statement of accuracy under penalty of perjury</li>
        </ol>
      </div>
      
      {submitted ? (
        <div className="bg-green-50 border border-green-300 p-4 rounded">
          <p className="text-green-800 font-semibold">
            ✅ Your DMCA notice has been submitted. We will respond within 48 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Your Email *</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="w-full border p-2 rounded"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Wordwall URL *</label>
            <input 
              type="url" 
              name="wordwallUrl" 
              required 
              placeholder="https://wordwall.net/resource/..."
              className="w-full border p-2 rounded"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Description of Copyrighted Work *</label>
            <textarea 
              name="description" 
              required 
              rows={4}
              className="w-full border p-2 rounded"
            />
          </div>
          
          <div>
            <label className="flex items-start gap-2">
              <input type="checkbox" name="goodFaith" required className="mt-1" />
              <span>
                I have a good faith belief that the use of the material is not 
                authorized by the copyright owner, its agent, or the law.
              </span>
            </label>
          </div>
          
          <div>
            <label className="flex items-start gap-2">
              <input type="checkbox" name="perjury" required className="mt-1" />
              <span>
                I swear, under penalty of perjury, that the information in this 
                notification is accurate and that I am the copyright owner or 
                authorized to act on behalf of the owner.
              </span>
            </label>
          </div>
          
          <button 
            type="submit"
            className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Submit DMCA Notice
          </button>
        </form>
      )}
    </div>
  )
}
```

### 4. DMCA API Endpoint

**File:** `/app/api/dmca/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const data = await request.json()
  
  // In production, send email to legal team
  console.log('DMCA Notice received:', data)
  
  // TODO: Send email via SendGrid/Resend
  // await sendEmail({
  //   to: 'legal@eduport.app',
  //   subject: 'DMCA Takedown Notice',
  //   body: JSON.stringify(data, null, 2),
  // })
  
  return NextResponse.json({ success: true })
}
```

---

## Acceptance Criteria

1. ✅ Terms page at `/app/legal/terms/page.tsx`
2. ✅ Privacy page at `/app/legal/privacy/page.tsx`
3. ✅ DMCA page at `/app/legal/dmca/page.tsx`
4. ✅ DMCA form submits to `/api/dmca`
5. ✅ Pages are styled and readable

---

## Verification

```bash
npm run dev
# Visit:
# - http://localhost:3000/legal/terms
# - http://localhost:3000/legal/privacy
# - http://localhost:3000/legal/dmca
```

---

## Deadline

**Jan 14, 11:30 PM**
