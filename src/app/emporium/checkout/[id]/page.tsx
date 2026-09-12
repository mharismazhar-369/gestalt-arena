import React from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { processCheckout } from '../actions'; // Ensure this points to the right file
import { Rocket, ShieldCheck, AlertTriangle } from 'lucide-react';
import GestaltCoin from '@/components/ui/GestaltCoin';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const cookieStore = await cookies();

    const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { },
            },
        }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [campaignRes, walletRes] = await Promise.all([
        supabaseAdmin.from('campaigns').select('id, title, tier').eq('id', id).single(),
        supabaseAdmin.from('user_wallets').select('balance').eq('user_id', user?.id).single()
    ]);

    const campaign = campaignRes.data;
    const realBalance = walletRes.data?.balance || 0;

    const tierRes = await supabaseAdmin.from('platform_tiers').select('price_credits').eq('id', campaign?.tier).single();
    const price = tierRes.data?.price_credits || 50;

    if (!campaign) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                    <h1 className="text-xl font-bold">Campaign Not Found</h1>
                    <p className="text-sm text-zinc-400">This payload does not exist or you do not have permission to view it.</p>
                </div>
            </main>
        );
    }

    const remainingBalance = realBalance - price;
    const isSufficient = remainingBalance >= 0;

    return (
        <main className="min-h-screen bg-black text-zinc-100 p-6 md:p-12 flex items-center justify-center">
            <div className="max-w-md w-full bg-zinc-950 p-8 rounded-3xl border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.8)] space-y-8 relative overflow-hidden backdrop-blur-2xl">

                <div className="flex justify-between items-center mb-6 p-5 bg-black/50 rounded-2xl border border-white/10">
                    <div className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Available Balance</div>
                    <div className="flex items-center gap-2 text-xl font-extrabold text-white">
                        <GestaltCoin className="w-6 h-6 text-orange-500" />
                        <span className={realBalance === 0 ? "text-red-400" : ""}>{realBalance}</span>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Activate Campaign</h1>
                    <p className="text-sm text-zinc-500 font-medium">ID: <span className="text-zinc-300">{campaign.id}</span></p>
                </div>

                <div className="p-6 bg-black/30 rounded-2xl border border-white/5 space-y-5">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400 font-bold tracking-wide uppercase text-xs">Targeting Tier</span>
                        <span className="text-orange-400 capitalize font-extrabold">{campaign.tier}</span>
                    </div>

                    <div className="pt-5 border-t border-white/5 flex justify-between items-center">
                        <span className="text-sm font-bold tracking-wide uppercase text-zinc-400">Total Due</span>
                        <div className="flex items-center gap-1.5 text-2xl font-black text-white">
                            <GestaltCoin className="w-6 h-6 text-orange-500" />
                            {price}
                        </div>
                    </div>
                </div>

                <form action={processCheckout}>
                    {/* ONLY the ID is passed. The server determines the price. */}
                    <input type="hidden" name="campaignId" value={campaign.id} />

                    <button
                        type="submit"
                        disabled={!isSufficient}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                    >
                        <Rocket className="w-5 h-5" />
                        {isSufficient ? 'Initialize Deployment' : 'Insufficient Credits'}
                    </button>
                </form>

                <div className="flex items-center justify-center text-xs font-semibold text-zinc-500">
                    {isSufficient ? (
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>
                                Remaining balance:
                                <strong className="text-white ml-1 inline-flex items-center gap-1">
                                    <GestaltCoin className="w-3 h-3 text-orange-500" />{remainingBalance}
                                </strong>
                            </span>
                        </div>
                    ) : (
                        <span className="text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                            Acquire more Gestalt Credits to proceed.
                        </span>
                    )}
                </div>
            </div>
        </main>
    );
}