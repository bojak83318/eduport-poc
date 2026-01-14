'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

export default function LoginButton() {
    const supabase = createClientComponentClient<Database>();

    const handleLogin = async (provider: 'google' | 'github') => {
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
            // Note: Scopes might be needed depending on requirements
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <button
                onClick={() => handleLogin('google')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Sign in with Google
            </button>
            <button
                onClick={() => handleLogin('github')}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
            >
                Sign in with GitHub
            </button>
        </div>
    );
}
