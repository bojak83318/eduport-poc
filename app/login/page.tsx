'use client'

import { useState } from 'react'
import { signInWithGoogle, signInWithGitHub } from '@/lib/supabase/auth'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError(null)
        try {
            await signInWithGoogle()
            // OAuth redirect happens automatically
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    const handleGitHubSignIn = async () => {
        setLoading(true)
        setError(null)
        try {
            await signInWithGitHub()
            // OAuth redirect happens automatically
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">🎓 EduPort Login</h1>
                    <p className="mt-2 text-gray-600">
                        Convert Wordwall to H5P in seconds.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        <span className="mr-2">🔵</span>
                        Sign in with Google
                    </button>

                    <button
                        onClick={handleGitHubSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        <span className="mr-2">⚫</span>
                        Sign in with GitHub
                    </button>
                </div>

                {loading && (
                    <p className="text-center text-sm text-gray-500 animate-pulse">Redirecting...</p>
                )}

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                        {error}
                    </div>
                )}

                <p className="text-center text-sm text-gray-500">
                    No password required.
                </p>
            </div>
        </div>
    )
}
