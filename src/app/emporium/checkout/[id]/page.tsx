import React from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { processCheckout } from '../actions';
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

    // 1. Verify User Session securely
    const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { }, // Read-only on server pages
            },
        }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();

    // 2. Fetch REAL Database Data (Bypass RLS for server-side read)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch campaign, user wallet, and tier pricing in parallel
    const [campaignRes, walletRes] = await Promise.all([
        supabaseAdmin.from('campaigns').select('id, title, tier').eq('id', id).single(),
        supabaseAdmin.from('user_wallets').select('balance').eq('user_id', user?.id).single()
    ]);

    const campaign = campaignRes.data;
    const realBalance = walletRes.data?.balance || 0; // Defaults to 0 if wallet row is missing

    // Fetch the exact price based on the selected tier
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
            <div className="max-w-md w-full bg-zinc-950 p-8 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">

                <div className="flex justify-between items-center mb-6 p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
                    <div className="text-xs font-semibold text-zinc-400">Real Available Balance</div>
                    <div className="flex items-center gap-1.5 text-lg font-extrabold text-white">
                        <GestaltCoin className="w-5 h-5 text-zinc-300" />
                        <span className={realBalance === 0 ? "text-red-400" : ""}>{realBalance}</span>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-white">Activate Campaign</h1>
                    <p className="text-sm text-zinc-400">Deploying ID: <span className="font-mono text-zinc-300">{campaign.id}</span></p>
                </div>

                <div className="p-5 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Targeting Tier</span>
                        <span className="text-zinc-200 capitalize font-medium">{campaign.tier}</span>
                    </div>

                    <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                        <span className="text-sm font-bold text-zinc-300">Total Due</span>
                        <div className="flex items-center gap-1 text-xl font-extrabold text-orange-400">
                            <GestaltCoin className="w-5 h-5" />
                            {price}
                        </div>
                    </div>
                </div>

                <form action={processCheckout}>
                    <input type="hidden" name="campaignId" value={campaign.id} />
                    <input type="hidden" name="amount" value={price} />

                    <button
                        type="submit"
                        disabled={!isSufficient}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Rocket className="w-4 h-4" />
                        {isSufficient ? 'Pay with Gestalt Credits' : 'Insufficient Credits'}
                    </button>
                </form>

                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
                    {isSufficient ? (
                        <>
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span>
                                Remaining balance after deployment:
                                <strong className="text-zinc-300 ml-1 inline-flex items-center gap-0.5">
                                    <GestaltCoin className="w-2.5 h-2.5" />{remainingBalance}
                                </strong>
                            </span>
                        </>
                    ) : (
                        <span className="text-red-400/80">
                            You must acquire more Gestalt Credits to deploy this campaign.
                        </span>
                    )}
                </div>
            </div>
        </main>
    );
}