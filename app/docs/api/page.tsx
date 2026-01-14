'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'
import { CodeExamples } from './examples'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen">
            <div className="bg-gray-900 text-white p-4">
                <h1 className="text-2xl font-bold">EduPort API Documentation</h1>
            </div>
            <SwaggerUI url="/docs/api/openapi.json" />
            <CodeExamples />
        </div>
    )
}
