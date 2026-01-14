import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types'; // Assuming types generated

export async function getSession() {
    const supabase = createServerComponentClient<Database>({ cookies });
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        return session;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
}

export async function getUser() {
    const session = await getSession();
    return session?.user || null;
}
