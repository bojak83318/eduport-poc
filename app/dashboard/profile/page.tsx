import { getUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const user = await getUser();

    if (!user) {
        redirect('/login');
    }

    const supabase = createServerComponentClient<Database>({ cookies });

    // Fetch user profile data
    const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    const profile = profileData as UserProfile | null;

    // Fetch usage stats
    const { count: totalConversions } = await supabase
        .from('conversions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const { count: monthlyConversions } = await supabase
        .from('conversions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', thisMonthStart.toISOString());

    const tier = profile?.subscription_tier || 'free';
    const monthlyLimit = tier === 'free' ? 5 : tier === 'pro' ? 999999 : 999999;
    const usagePercent = ((monthlyConversions || 0) / monthlyLimit) * 100;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Profile & Usage</h1>

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subscription:</span>
                            <span className="font-medium">
                                <span className={`px-3 py-1 rounded-full text-sm ${tier === 'pro' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {tier.toUpperCase()}
                                </span>
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Member Since:</span>
                            <span className="font-medium">
                                {new Date(profile?.created_at || '').toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Usage Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>

                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Monthly Conversions</span>
                            <span className="text-sm font-medium">
                                {monthlyConversions} / {tier === 'free' ? monthlyLimit : '∞'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${usagePercent > 80 ? 'bg-red-600' :
                                    usagePercent > 50 ? 'bg-yellow-600' : 'bg-green-600'
                                    }`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded">
                            <div className="text-2xl font-bold text-gray-900">{totalConversions || 0}</div>
                            <div className="text-sm text-gray-600">Total Conversions</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <div className="text-2xl font-bold text-gray-900">{monthlyConversions || 0}</div>
                            <div className="text-sm text-gray-600">This Month</div>
                        </div>
                    </div>

                    {tier === 'free' && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800 mb-2">
                                Want unlimited conversions?
                            </p>
                            <a
                                href="/dashboard/subscribe"
                                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Upgrade to Pro
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
