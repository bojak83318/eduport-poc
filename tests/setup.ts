import fs from 'fs'
import path from 'path'
import { loadEnvConfig } from '@next/env'

// Load standard Next.js envs (handles .env.test, etc)
loadEnvConfig(process.cwd())

// Manually load .env.local for integration tests if in test mode
if (process.env.NODE_ENV === 'test') {
    const localEnvPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(localEnvPath)) {
        console.log('[setup] Loading .env.local manually for test environment')
        const content = fs.readFileSync(localEnvPath, 'utf-8')
        content.split(/\r?\n/).forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/)
            if (match) {
                const key = match[1].trim()
                const value = match[2].trim().replace(/^["']|["']$/g, '')
                if (!process.env[key]) {
                    process.env[key] = value
                }
            }
        })
    }
}

console.log('[setup] Environment variables loaded')
