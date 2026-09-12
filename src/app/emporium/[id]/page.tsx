import React from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ArrowLeft, BarChart3, Settings, Eye, MousePointer, TrendingUp, Users, CheckCircle2, Globe, Mail } from 'lucide-react';
import { updateCampaignConfig } from '../actions';

export const dynamic = 'force-dynamic';

export default async function CampaignDetailPage({
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    // 1. Fetch campaign details and telemetry events in parallel
    const [campaignRes, eventsRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', id).single(),
        supabase.from('campaign_events').select('event_type').eq('campaign_id', id)
    ]);

    if (campaignRes.error || !campaignRes.data) {
        notFound();
    }

    const campaign = campaignRes.data;
    const events = eventsRes.data || [];

    // 2. Calculate real-time metrics
    const impressions = events.filter((e: any) => e.event_type === 'impression').length;
    const clicks = events.filter((e: any) => e.event_type === 'click').length;
    const conversions = events.filter((e: any) => e.event_type === 'conversion').length;
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

    const isOwner = campaign.user_id === user.id;

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-[1440px] w-full relative z-10 space-y-8">

                {/* Back Navigation */}
                <div>
                    <Link
                        href="/emporium"
                        className="neu-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Emporium Dashboard
                    </Link>
                </div>

                {/* Header Card */}
                <div className="neu-flat-base p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg neu-pressed-base text-[var(--accent)]">
                                {campaign.category || 'Campaign'}
                            </span>
                            <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-md ${campaign.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                                campaign.status === 'paused' ? 'bg-blue-500/10 text-blue-600' :
                                    'bg-amber-500/10 text-amber-600'
                                }`}>
                                {campaign.status}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-[var(--secondary)] tracking-tight">{campaign.title}</h1>
                        <p className="text-xs text-[var(--secondary)]/60 font-mono">Campaign ID: {campaign.id}</p>
                    </div>

                    <div className="neu-pressed-base px-6 py-4 rounded-2xl flex flex-col items-end justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary)]/50">Payment Status</span>
                        <span className="text-xs font-extrabold text-[var(--accent)] capitalize mt-1">{campaign.payment_status || 'Paid'}</span>
                    </div>
                </div>

                {/* Live Analytics & Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="neu-flat-base p-6 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-[var(--secondary)]/60">
                            <span className="text-xs font-bold uppercase tracking-wider">Impressions</span>
                            <Eye className="w-4 h-4 text-[var(--accent)]" />
                        </div>
                        <div className="text-3xl font-black text-[var(--secondary)]">{impressions}</div>
                        <p className="text-[10px] text-[var(--secondary)]/50">Real-time database metrics</p>
                    </div>

                    <div className="neu-flat-base p-6 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-[var(--secondary)]/60">
                            <span className="text-xs font-bold uppercase tracking-wider">Clicks</span>
                            <MousePointer className="w-4 h-4 text-[var(--accent)]" />
                        </div>
                        <div className="text-3xl font-black text-[var(--secondary)]">{clicks}</div>
                        <p className="text-[10px] text-[var(--secondary)]/50">Destination clicks</p>
                    </div>

                    <div className="neu-flat-base p-6 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-[var(--secondary)]/60">
                            <span className="text-xs font-bold uppercase tracking-wider">CTR</span>
                            <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                        </div>
                        <div className="text-3xl font-black text-[var(--secondary)]">{ctr}%</div>
                        <p className="text-[10px] text-[var(--secondary)]/50">Click-through ratio</p>
                    </div>

                    <div className="neu-flat-base p-6 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-[var(--secondary)]/60">
                            <span className="text-xs font-bold uppercase tracking-wider">Conversions</span>
                            <Users className="w-4 h-4 text-[var(--accent)]" />
                        </div>
                        <div className="text-3xl font-black text-[var(--secondary)]">{conversions}</div>
                        <p className="text-[10px] text-[var(--secondary)]/50">Action completions</p>
                    </div>
                </div>

                {/* Configuration / Edit Section for Owner */}
                {isOwner && (
                    <div className="neu-flat-base p-8 rounded-3xl space-y-6">
                        <div className="border-b border-[var(--secondary)]/10 pb-4 flex items-center gap-3">
                            <Settings className="w-5 h-5 text-[var(--accent)]" />
                            <h3 className="text-xl font-black text-[var(--secondary)]">Campaign Configuration</h3>
                        </div>

                        <form action={async (formData) => {
                            'use server';
                            await updateCampaignConfig(campaign.id, formData);
                        }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-2 block">Campaign Title</label>
                                    <input
                                        name="title"
                                        defaultValue={campaign.title}
                                        required
                                        className="w-full neu-pressed-base rounded-xl px-4 py-3 text-xs text-[var(--secondary)] focus:outline-none font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-2 block">Destination URL</label>
                                    <input
                                        name="ctaUrl"
                                        type="url"
                                        defaultValue={campaign.cta_url || ''}
                                        required
                                        className="w-full neu-pressed-base rounded-xl px-4 py-3 text-xs text-[var(--secondary)] focus:outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-2 block">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={campaign.description || ''}
                                    rows={4}
                                    required
                                    className="w-full neu-pressed-base rounded-xl p-4 text-xs text-[var(--secondary)] focus:outline-none resize-none font-medium"
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-[var(--secondary)]/10">
                                <button
                                    type="submit"
                                    className="neu-btn px-8 py-3 text-xs font-black text-[var(--accent)] flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </main>

            <Footer />
        </div>
    );
}