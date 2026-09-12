// Location: SRC/app/emporium/page.tsx

import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { getCampaignsFromDB, getEmporiumConfig } from './queries';
import EmporiumClientBoard from '@/components/emporium/EmporiumClientBoard';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

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

    const { data: { user }, error } = await supabase.auth.getUser();

    // SECURITY FIX: Redirect unauthenticated/non-registered users to login immediately
    if (error || !user) {
        redirect('/login?next=/emporium');
    }

    const [campaigns, config] = await Promise.all([
        getCampaignsFromDB(),
        getEmporiumConfig()
    ]);

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-[1440px] w-full relative z-10">
                <EmporiumClientBoard
                    initialCampaigns={campaigns}
                    config={config}
                    currentUserId={user.id}
                />
            </main>

            <Footer />
        </div>
    );
}