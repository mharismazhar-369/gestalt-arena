import React from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CampaignManagementBoard from '@/components/emporium/CampaignManagementBoard';

export const dynamic = 'force-dynamic';

export default async function CampaignDetailsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the real campaign data from the database
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

    if (!campaign) {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-black text-zinc-100 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-6">
                <Link
                    href="/emporium"
                    className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-orange-500 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Emporium Dashboard
                </Link>

                {/* Mounts the interactive Framer Motion component we built */}
                <CampaignManagementBoard campaign={campaign} />
            </div>
        </main>
    );
}