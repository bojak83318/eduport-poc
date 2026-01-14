'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/auth'

interface UserStats {
    email: string
    provider: string
    tier: 'free' | 'pro'
    conversions: number
    quota: number
}

export default function ProfilePage() {
    const router = useRouter()
    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadProfile() {
            try {
                // Get current user
                const { data: { user }, error } = await supabase.auth.getUser()

                if (error || !user) {
                    router.push('/login')
                    return
                }

                // Get conversion count for this month
                const startOfMonth = new Date()
                startOfMonth.setDate(1)
                startOfMonth.setHours(0, 0, 0, 0)

                const { data: conversions, error: convError } = await supabase
                    .from('conversions')
                    .select('id')
                    .eq('user_id', user.id)
                    .gte('created_at', startOfMonth.toISOString())

                if (convError) {
                    console.error('Conversion fetch error:', convError)
                }

                const tier = (user.app_metadata?.tier as 'free' | 'pro') || 'free'
                const quota = tier === 'pro' ? Infinity : 5

                setStats({
                    email: user.email || '',
                    provider: user.app_metadata?.provider || user.identities?.[0]?.provider || 'unknown',
                    tier,
                    conversions: conversions?.length || 0,
                    quota,
                })
            } catch (err) {
                console.error('Failed to load profile:', err)
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500 animate-pulse text-lg">Loading Profile...</div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md border border-red-100">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600">Failed to load profile data.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    const usagePercent = stats.quota === Infinity ? 0 : Math.round((stats.conversions / stats.quota) * 100)
    const remaining = stats.quota === Infinity ? Infinity : stats.quota - stats.conversions

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-8 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-white to-gray-50">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Profile</h1>
                            <p className="text-gray-500 mt-1">Manage your identity and subscription</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 rounded-xl transition-all duration-200 active:scale-95"
                        >
                            Sign Out
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* User Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xl">📧</span>
                                    <p className="text-lg font-medium text-gray-800">{stats.email}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Auth Provider</p>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xl">🔑</span>
                                    <p className="text-lg font-medium text-gray-800 capitalize">{stats.provider}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Plan</p>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xl">📊</span>
                                    <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                                        {stats.tier === 'pro' ? 'PRO' : 'FREE'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

                        {/* Usage Section */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Monthly Usage</h3>
                                    <p className="text-sm text-gray-500">Resetting on the 1st of next month</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-gray-900">{stats.conversions}</span>
                                    <span className="text-gray-400 font-medium"> / {stats.tier === 'pro' ? '∞' : stats.quota}</span>
                                </div>
                            </div>

                            {stats.tier === 'free' ? (
                                <div className="space-y-4">
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ease-out ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-orange-400' : 'bg-blue-600'
                                                }`}
                                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <p className={`${remaining <= 1 ? 'text-red-600' : 'text-gray-600'}`}>
                                            {remaining > 0 ? (
                                                <span className="flex items-center">
                                                    <span className="mr-1.5">⚠️</span>
                                                    {remaining} conversions remaining
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <span className="mr-1.5">🚫</span>
                                                    Monthly quota reached
                                                </span>
                                            )}
                                        </p>
                                        <span className="text-gray-400">{usagePercent}% used</span>
                                    </div>

                                    {usagePercent >= 80 && (
                                        <div className="mt-6 p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                                            <a
                                                href="/pricing"
                                                className="flex items-center justify-center space-x-2 w-full py-4 bg-transparent text-white font-bold hover:bg-white/10 transition-colors rounded-lg"
                                            >
                                                <span>Upgrade to Pro for Unlimited</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center space-x-3 text-green-700">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-semibold">Unlimited conversions active</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <p className="text-center text-gray-400 text-xs mt-8">
                    Need help? <a href="mailto:support@eduport.com" className="underline hover:text-gray-600">Contact Support</a>
                </p>
            </div>
        </div>
    )
}
