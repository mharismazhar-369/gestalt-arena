import React from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getCampaignsFromDB, getEmporiumConfig } from './queries';
import EmporiumClientBoard from '@/components/emporium/EmporiumClientBoard';

export const dynamic = 'force-dynamic';

export default async function EmporiumServerPage() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set({ name, value, ...options });
                        });
                    } catch (error) {
                        // Safe to ignore in Server Components
                    }
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const [campaigns, config] = await Promise.all([
        getCampaignsFromDB(),
        getEmporiumConfig()
    ]);

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <EmporiumClientBoard
                    initialCampaigns={campaigns}
                    config={config}
                    currentUserId={user?.id || ''}
                />
            </div>
        </main>
    );
}