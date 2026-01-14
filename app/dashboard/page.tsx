import { getUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

type Conversion = Database['public']['Tables']['conversions']['Row'];

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const user = await getUser();

    if (!user) {
        redirect('/login');
    }

    const supabase = createServerComponentClient<Database>({ cookies });

    // Fetch recent conversions with explicit typing
    const { data, error } = await supabase
        .from('conversions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    const conversions: Conversion[] = data || [];

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold mb-6">Conversion History</h1>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {conversions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No conversions yet. Start by converting a Wordwall activity!</p>
                            <a
                                href="/"
                                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Convert Now
                            </a>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {conversions.map((conversion: Conversion) => (
                                <li key={conversion.id}>
                                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {conversion.template_type}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {conversion.wordwall_url}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(conversion.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${conversion.status === 'success' ? 'bg-green-100 text-green-800' :
                                                    conversion.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                        conversion.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {conversion.status}
                                                </span>
                                                {conversion.status === 'success' && conversion.h5p_package_url && (
                                                    <a
                                                        href={conversion.h5p_package_url}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                        download
                                                    >
                                                        Download
                                                    </a>
                                                )}
                                                {conversion.latency_ms && (
                                                    <span className="text-xs text-gray-400">
                                                        {(conversion.latency_ms / 1000).toFixed(2)}s
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {conversions.length >= 20 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Showing most recent 20 conversions
                    </div>
                )}
            </div>
        </div>
    );
}
