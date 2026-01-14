# Agent 24: Frontend Engineer - API Key Management

**Agent Role:** @eduport/frontend-engineer  
**Task ID:** FE-004  
**Batch:** 5  
**Priority:** Medium  
**Deadline:** Jan 14, 11:30 PM

---

## Context

Pro tier users need to generate API keys for programmatic access to the bulk conversion API. Keys should be revocable and copyable.

---

## Task

Build the API key management page.

**File:** `/app/settings/api-keys/page.tsx`

---

## UI Mockup

```
┌────────────────────────────────────────────────────────────┐
│  Settings > API Keys                                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🔑 Your API Keys (Pro Feature)                            │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Key                           │ Created    │ Action  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ sk_live_abc...xyz             │ Jan 10     │ [Revoke]│  │
│  │ sk_live_123...789             │ Jan 08     │ [Revoke]│  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  [+ Generate New Key]                                      │
│                                                            │
│  ⚠️ Keep your API keys secret. Never share them publicly.  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Implementation

```typescript
// app/settings/api-keys/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

interface ApiKey {
  id: string
  key_prefix: string // Only show first 8 chars
  created_at: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newKey, setNewKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  
  useEffect(() => {
    loadKeys()
  }, [])
  
  async function loadKeys() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data } = await supabase
      .from('api_keys')
      .select('id, key, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    setKeys(data?.map(k => ({
      id: k.id,
      key_prefix: k.key.substring(0, 12) + '...',
      created_at: k.created_at
    })) || [])
    setLoading(false)
  }
  
  async function generateKey() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const fullKey = `sk_live_${uuidv4().replace(/-/g, '')}`
    
    const { error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        key: fullKey
      })
    
    if (!error) {
      setNewKey(fullKey)
      loadKeys()
    }
  }
  
  async function revokeKey(keyId: string) {
    if (!confirm('Are you sure? This action cannot be undone.')) return
    
    await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
    
    loadKeys()
  }
  
  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }
  
  if (loading) {
    return <div className="p-6">Loading...</div>
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">API Keys</h1>
      <p className="text-gray-600 mb-6">
        Generate API keys for programmatic access to the bulk conversion API.
      </p>
      
      {/* New key display (only shown once) */}
      {newKey && (
        <div className="bg-green-50 border border-green-300 p-4 rounded mb-6">
          <p className="font-semibold text-green-800 mb-2">
            ✅ New API key created! Copy it now - you won't see it again.
          </p>
          <code className="block bg-green-100 p-2 rounded text-sm font-mono">
            {newKey}
          </code>
          <button 
            onClick={() => copyToClipboard(newKey)}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}
      
      {/* Keys table */}
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3 text-left">Key</th>
            <th className="border p-3 text-left">Created</th>
            <th className="border p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {keys.length === 0 ? (
            <tr>
              <td colSpan={3} className="border p-3 text-center text-gray-500">
                No API keys yet. Generate your first key below.
              </td>
            </tr>
          ) : (
            keys.map((k) => (
              <tr key={k.id}>
                <td className="border p-3 font-mono">{k.key_prefix}</td>
                <td className="border p-3">
                  {new Date(k.created_at).toLocaleDateString()}
                </td>
                <td className="border p-3">
                  <button 
                    onClick={() => revokeKey(k.id)}
                    className="text-red-600 hover:underline"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Generate button */}
      <button 
        onClick={generateKey}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + Generate New Key
      </button>
      
      {/* Warning */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
        <p className="text-yellow-800">
          ⚠️ <strong>Security Warning:</strong> Keep your API keys secret. 
          Never share them in public repositories or client-side code.
        </p>
      </div>
    </div>
  )
}
```

---

## Acceptance Criteria

1. ✅ Page created at `/app/settings/api-keys/page.tsx`
2. ✅ Lists existing API keys (prefix only)
3. ✅ Generate new key button creates UUID-based key
4. ✅ New key shown once with copy button
5. ✅ Revoke button deletes key after confirmation
6. ✅ Security warning displayed

---

## Output Artifacts

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/app/settings/api-keys/page.tsx`
2. **Summary:** Generate a summary of what was implemented

---

## Verification

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm run dev
# Navigate to http://localhost:3000/settings/api-keys
# Verify: Generate key, copy works, revoke works
```

---

## Deadline

**Jan 14, 11:30 PM**
