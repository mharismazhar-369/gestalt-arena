'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EmporiumAdBuilder from './EmporiumAdBuilder';
import { updateCampaignStatus, softDeleteCampaign } from '@/app/emporium/actions';
import {
    Store, Plus, Search, ExternalLink, Trash2,
    Play, Pause, X, Mail, Building2, Layers, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
} as const;

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
} as const;

export default function EmporiumClientBoard({
    initialCampaigns,
    config,
    currentUserId
}: {
    initialCampaigns: any[];
    config: any;
    currentUserId: string;
}) {
    const router = useRouter();
    const [showBuilder, setShowBuilder] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedAd, setSelectedAd] = useState<any | null>(null);

    // Dynamically extract unique categories from server-side data
    const uniqueCategories = Array.from(
        new Set(initialCampaigns.map(ad => ad.category).filter(Boolean))
    );

    const activeCampaigns = initialCampaigns.filter(ad => ad.status !== 'archived');
    const filteredCampaigns = activeCampaigns.filter((ad) => {
        const matchesCategory = selectedCategory === 'All' || ad.category === selectedCategory;
        const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-12 relative w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8 pt-4">
                <div className="flex items-center gap-4">
                    {/* Integrated Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all shadow-lg flex items-center justify-center group"
                        title="Go back"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 shadow-xl">
                        <Store className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tighter">Emporium</h1>
                        <p className="text-sm text-zinc-400 mt-1 font-medium">Market Place to Showcase your Services and Solutions</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowBuilder(!showBuilder)}
                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-xl transition-all shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    {showBuilder ? 'Close Workspace' : 'Deploy Campaign'}
                </button>
            </div>

            <AnimatePresence>
                {showBuilder && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="pb-8">
                            <EmporiumAdBuilder config={config} onCancel={() => setShowBuilder(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-black/40 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-3 w-full md:w-auto px-4 py-2">
                    <Search className="w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm text-zinc-200 focus:outline-none w-full md:w-64 placeholder:text-zinc-600"
                    />
                </div>

                <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto p-1 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        All Categories
                    </button>
                    {/* Dynamically mapped categories from server data */}
                    {uniqueCategories.map((cat: any) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaign Grid */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCampaigns.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-zinc-600 text-sm border border-dashed border-white/10 rounded-3xl bg-black/20">
                        No active campaigns found.
                    </div>
                ) : (
                    filteredCampaigns.map((ad) => {
                        const isOwner = ad.userId === currentUserId;

                        return (
                            <motion.div variants={itemVariants} key={ad.id} className="flex flex-col justify-between p-6 rounded-3xl bg-black/60 border border-white/5 hover:border-white/10 backdrop-blur-md transition-all duration-300 group shadow-xl">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg bg-white/5 text-zinc-300">
                                            {ad.company_name || 'Sponsored'} • {ad.category}
                                        </span>
                                        <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md ${ad.status === 'pending_approval' ? 'bg-zinc-800 text-zinc-400' : ad.status === 'paused' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {ad.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">{ad.title}</h3>
                                        {ad.tagline && <p className="text-sm font-bold text-orange-400 mt-1">{ad.tagline}</p>}
                                    </div>

                                    <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                        {ad.description}
                                    </p>

                                    {/* POP-UP TRIGGER BUTTON */}
                                    <button
                                        onClick={() => setSelectedAd(ad)}
                                        className="inline-flex items-center justify-center w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm rounded-xl transition-all border border-white/10 gap-2 cursor-pointer"
                                    >
                                        {ad.ctaText || ad.cta_text || 'Explore Deal'} <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>

                                {isOwner && (
                                    <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                                        <Link href={`/emporium/${ad.id}`} className="text-sm text-zinc-400 hover:text-white font-semibold transition-colors">
                                            Manage Configuration
                                        </Link>

                                        <div className="flex items-center gap-2">
                                            {ad.status === 'pending_approval' ? (
                                                <Link href={`/emporium/checkout/${ad.id}`} className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-lg transition-all">
                                                    Complete Payment
                                                </Link>
                                            ) : (
                                                <button onClick={() => updateCampaignStatus(ad.id, ad.status === 'active' ? 'paused' : 'active')} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/5" title={ad.status === 'active' ? 'Pause' : 'Activate'}>
                                                    {ad.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                </button>
                                            )}

                                            <button
                                                onClick={() => { if (confirm('Delete campaign from active view?')) softDeleteCampaign(ad.id); }}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all border border-red-500/10"
                                                title="Delete Campaign"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </motion.div>

            {/* POP-UP DETAIL MODAL */}
            <AnimatePresence>
                {selectedAd && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-zinc-950 border border-white/10 p-8 rounded-3xl max-w-xl w-full space-y-6 relative shadow-2xl text-zinc-100"
                        >
                            <button
                                onClick={() => setSelectedAd(null)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-2">
                                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                    {selectedAd.category}
                                </span>
                                <h2 className="text-3xl font-black text-white tracking-tight">{selectedAd.title}</h2>
                                {selectedAd.tagline && <p className="text-sm font-bold text-orange-400">{selectedAd.tagline}</p>}
                            </div>

                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-zinc-300">
                                    <Building2 className="w-4 h-4 text-orange-500 shrink-0" />
                                    <span>Company: <strong className="text-white">{selectedAd.company_name || 'Verified Partner'}</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-zinc-300">
                                    <Layers className="w-4 h-4 text-orange-500 shrink-0" />
                                    <span>Product Type: <strong className="text-white">{selectedAd.product_type || 'Solution'}</strong></span>
                                </div>
                                {selectedAd.contact_email && (
                                    <div className="flex items-center gap-3 text-zinc-300">
                                        <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                                        <span>Direct Contact: <a href={`mailto:${selectedAd.contact_email}`} className="text-orange-400 underline">{selectedAd.contact_email}</a></span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Full Description</h4>
                                <p className="text-sm text-zinc-300 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5">
                                    {selectedAd.description}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex gap-4">
                                <button
                                    onClick={() => setSelectedAd(null)}
                                    className="w-1/2 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all"
                                >
                                    Close Window
                                </button>
                                <a
                                    href={selectedAd.ctaUrl || selectedAd.cta_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-1/2 flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                >
                                    {selectedAd.ctaText || selectedAd.cta_text || 'Visit Deal Site'} <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}