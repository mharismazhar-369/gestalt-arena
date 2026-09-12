import React from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { processCheckout } from '../../actions';
import { Rocket, ShieldCheck, AlertTriangle, ArrowLeft, Store } from 'lucide-react';
import GestaltCoin from '@/components/ui/GestaltCoin';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

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
        supabaseAdmin.from('campaigns').select('id, title, tier, company_name').eq('id', id).single(),
        supabaseAdmin.from('user_wallets').select('balance').eq('user_id', user?.id).single()
    ]);

    const campaign = campaignRes.data;
    const realBalance = walletRes.data?.balance || 0;

    const tierRes = await supabaseAdmin.from('platform_tiers').select('price_credits').eq('id', campaign?.tier).single();
    const price = tierRes.data?.price_credits || 50;

    if (!campaign) {
        return (
            <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="neu-flat-base p-8 rounded-3xl text-center space-y-4 max-w-md w-full">
                        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
                        <h1 className="text-xl font-black">Campaign Not Found</h1>
                        <p className="text-xs text-[var(--secondary)]/70 font-medium">This payload does not exist or you do not have permission to view it.</p>
                        <Link href="/emporium" className="neu-btn inline-flex items-center gap-2 px-6 py-3 text-xs font-bold mt-4">
                            <ArrowLeft className="w-4 h-4" /> Return to Emporium
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const remainingBalance = realBalance - price;
    const isSufficient = remainingBalance >= 0;

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-xl w-full relative z-10 flex items-center justify-center">
                <div className="neu-flat-base p-8 md:p-10 rounded-3xl w-full space-y-8 relative overflow-hidden shadow-2xl">

                    {/* Top Navigation & Balance Card */}
                    <div className="flex items-center justify-between gap-4">
                        <Link
                            href="/emporium"
                            className="neu-btn p-3 text-[var(--secondary)]/70 hover:text-[var(--accent)] transition-all flex items-center justify-center rounded-2xl"
                            title="Back to Emporium"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        <div className="neu-pressed-base px-5 py-3 rounded-2xl flex items-center gap-3 flex-1 justify-end">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--secondary)]/60">Available Balance:</span>
                            <div className="flex items-center gap-1.5 text-lg font-black text-[var(--secondary)]">
                                <GestaltCoin className="w-5 h-5 text-[var(--accent)]" />
                                <span className={realBalance === 0 ? "text-rose-500" : ""}>{realBalance}</span>
                            </div>
                        </div>
                    </div>

                    {/* Title Section */}
                    <div className="text-center space-y-2">
                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg neu-pressed-base text-[var(--accent)] inline-block">
                            Secure Checkout
                        </span>
                        <h1 className="text-3xl font-black text-[var(--secondary)] tracking-tight">Activate Campaign</h1>
                        <p className="text-xs text-[var(--secondary)]/60 font-medium">Campaign ID: <span className="font-mono text-[var(--secondary)] font-bold">{campaign.id}</span></p>
                    </div>

                    {/* Order Breakdown Box */}
                    <div className="neu-pressed-base p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[var(--secondary)]/60 font-bold uppercase tracking-wider">Company / Title</span>
                            <strong className="text-[var(--secondary)] truncate max-w-[200px]">{campaign.company_name || campaign.title}</strong>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[var(--secondary)]/60 font-bold uppercase tracking-wider">Targeting Tier</span>
                            <span className="text-[var(--accent)] capitalize font-black">{campaign.tier}</span>
                        </div>

                        <div className="pt-4 border-t border-[var(--secondary)]/10 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-wider text-[var(--secondary)]">Total Due</span>
                            <div className="flex items-center gap-1.5 text-2xl font-black text-[var(--accent)]">
                                <GestaltCoin className="w-6 h-6 text-[var(--accent)]" />
                                {price}
                            </div>
                        </div>
                    </div>

                    {/* Checkout Form */}
                    <form action={processCheckout} className="space-y-6">
                        <input type="hidden" name="campaignId" value={campaign.id} />

                        <button
                            type="submit"
                            disabled={!isSufficient}
                            className="neu-btn w-full flex items-center justify-center gap-2 py-4 font-black text-xs text-[var(--accent)] disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Rocket className="w-4 h-4" />
                            {isSufficient ? 'Initialize Deployment' : 'Insufficient Gestalt Credits'}
                        </button>
                    </form>

                    {/* Status Footer */}
                    <div className="flex items-center justify-center text-xs font-semibold">
                        {isSufficient ? (
                            <div className="flex items-center gap-2 neu-pressed-base px-4 py-2.5 rounded-xl w-full justify-center">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-[var(--secondary)]/70">
                                    Remaining balance after checkout:
                                    <strong className="text-[var(--secondary)] ml-1.5 inline-flex items-center gap-1 font-black">
                                        <GestaltCoin className="w-3.5 h-3.5 text-[var(--accent)]" />{remainingBalance}
                                    </strong>
                                </span>
                            </div>
                        ) : (
                            <span className="text-rose-500 neu-pressed-base bg-rose-500/10 px-4 py-3 rounded-xl border border-rose-500/20 text-center w-full font-bold">
                                Insufficient balance. Please acquire more Gestalt Credits to proceed with deployment.
                            </span>
                        )}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}