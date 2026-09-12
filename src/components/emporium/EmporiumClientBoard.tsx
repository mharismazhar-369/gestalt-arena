// Location: SRC/components/emporium/EmporiumClientBoard.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EmporiumAdBuilder from './EmporiumAdBuilder';
import { updateCampaignStatus, softDeleteCampaign } from '@/app/emporium/actions';
import {
    Store, Plus, Search, ExternalLink, Trash2,
    Play, Pause, X, Mail, Building2, Layers, ArrowLeft, User
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
        <div className="space-y-12 relative w-full text-[var(--secondary)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 neu-flat-base p-8 relative overflow-hidden">
                <div className="flex items-center gap-4">
                    {/* Integrated Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="neu-btn p-3 text-[var(--secondary)]/70 hover:text-[var(--accent)] transition-all flex items-center justify-center group rounded-2xl"
                        title="Go back"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="neu-pressed-base p-3 rounded-2xl text-[var(--accent)]">
                        <Store className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--secondary)] tracking-tight">Emporium</h1>
                        <p className="text-sm text-[var(--secondary)]/70 mt-1 font-medium">Market Place to Showcase your Services and Solutions</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowBuilder(!showBuilder)}
                    className="neu-btn flex items-center gap-2 px-6 py-3 text-xs shrink-0"
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
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center neu-flat-base p-4">
                <div className="flex items-center gap-3 w-full md:w-auto px-4 py-2.5 neu-pressed-base rounded-xl flex-1 max-w-md">
                    <Search className="w-5 h-5 text-[var(--secondary)]/50 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm text-[var(--secondary)] focus:outline-none w-full md:w-64 placeholder:text-[var(--secondary)]/50 font-medium"
                    />
                </div>

                <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto p-1 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'neu-pressed-base text-[var(--accent)]' : 'text-[var(--secondary)]/60 hover:text-[var(--secondary)]'}`}
                    >
                        All Categories
                    </button>
                    {/* Dynamically mapped categories from server data */}
                    {uniqueCategories.map((cat: any) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'neu-pressed-base text-[var(--accent)]' : 'text-[var(--secondary)]/60 hover:text-[var(--secondary)]'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaign Grid */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCampaigns.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-[var(--secondary)]/50 text-sm neu-pressed-base p-8">
                        No active campaigns found.
                    </div>
                ) : (
                    filteredCampaigns.map((ad) => {
                        const isOwner = ad.userId === currentUserId;

                        return (
                            <motion.div variants={itemVariants} key={ad.id} className="flex flex-col justify-between p-6 neu-flat-base transition-all duration-300 group">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg neu-pressed-base text-[var(--secondary)]/70">
                                            {ad.company_name || 'Sponsored'} • {ad.category}
                                        </span>
                                        <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md ${ad.status === 'pending_approval' ? 'bg-amber-500/10 text-amber-600' :
                                                ad.status === 'paused' ? 'bg-blue-500/10 text-blue-600' :
                                                    'bg-emerald-500/10 text-emerald-600'
                                            }`}>
                                            {ad.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--secondary)] tracking-tight">{ad.title}</h3>
                                        {ad.tagline && <p className="text-xs font-bold text-[var(--accent)] mt-1">{ad.tagline}</p>}
                                    </div>

                                    <p className="text-xs text-[var(--secondary)]/70 leading-relaxed line-clamp-3 neu-pressed-base p-4 rounded-xl font-medium">
                                        {ad.description}
                                    </p>

                                    {/* POP-UP TRIGGER BUTTON */}
                                    <button
                                        onClick={() => setSelectedAd(ad)}
                                        className="neu-btn flex items-center justify-center w-full py-3 font-bold text-xs gap-2 cursor-pointer"
                                    >
                                        {ad.ctaText || ad.cta_text || 'Explore Deal'} <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>

                                {isOwner && (
                                    <div className="mt-6 pt-4 border-t border-[var(--secondary)]/10 flex flex-wrap items-center justify-between gap-4">
                                        <Link href={`/emporium/${ad.id}`} className="text-xs text-[var(--secondary)]/60 hover:text-[var(--accent)] font-semibold transition-colors">
                                            Manage Configuration
                                        </Link>

                                        <div className="flex items-center gap-2">
                                            {ad.status === 'pending_approval' ? (
                                                <Link href={`/emporium/checkout/${ad.id}`} className="neu-btn px-4 py-2 text-[var(--accent)] font-bold text-xs">
                                                    Complete Payment
                                                </Link>
                                            ) : (
                                                <button onClick={() => updateCampaignStatus(ad.id, ad.status === 'active' ? 'paused' : 'active')} className="neu-btn p-2 hover:text-[var(--accent)] transition-all" title={ad.status === 'active' ? 'Pause' : 'Activate'}>
                                                    {ad.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                </button>
                                            )}

                                            <button
                                                onClick={() => { if (confirm('Delete campaign from active view?')) softDeleteCampaign(ad.id); }}
                                                className="neu-btn p-2 text-rose-600 transition-all"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[var(--primary)] border border-[var(--secondary)]/10 p-8 rounded-3xl max-w-xl w-full space-y-6 relative neu-flat-base text-[var(--secondary)]"
                        >
                            <button
                                onClick={() => setSelectedAd(null)}
                                className="absolute top-6 right-6 p-2 rounded-full neu-btn text-[var(--secondary)]/60 hover:text-[var(--accent)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-2">
                                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg neu-pressed-base text-[var(--accent)]">
                                    {selectedAd.category}
                                </span>
                                <h2 className="text-2xl font-black text-[var(--secondary)] tracking-tight">{selectedAd.title}</h2>
                                {selectedAd.tagline && <p className="text-xs font-bold text-[var(--accent)]">{selectedAd.tagline}</p>}
                            </div>

                            <div className="p-4 neu-pressed-base rounded-2xl space-y-3 text-xs font-medium">
                                <div className="flex items-center gap-3 text-[var(--secondary)]/80">
                                    <Building2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
                                    <span>Company: <strong className="text-[var(--secondary)]">{selectedAd.company_name || 'Verified Partner'}</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-[var(--secondary)]/80">
                                    <Layers className="w-4 h-4 text-[var(--accent)] shrink-0" />
                                    <span>Product Type: <strong className="text-[var(--secondary)]">{selectedAd.product_type || 'Solution'}</strong></span>
                                </div>
                                {selectedAd.contact_email && (
                                    <div className="flex items-center gap-3 text-[var(--secondary)]/80">
                                        <Mail className="w-4 h-4 text-[var(--accent)] shrink-0" />
                                        <span>Direct Contact: <a href={`mailto:${selectedAd.contact_email}`} className="text-[var(--accent)] underline">{selectedAd.contact_email}</a></span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary)]/60">Full Description</h4>
                                <p className="text-xs text-[var(--secondary)]/80 leading-relaxed neu-pressed-base p-4 rounded-xl font-medium">
                                    {selectedAd.description}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-[var(--secondary)]/10 flex gap-4">
                                <button
                                    onClick={() => setSelectedAd(null)}
                                    className="w-1/2 py-3 neu-btn text-[var(--secondary)] font-bold text-xs"
                                >
                                    Close Window
                                </button>
                                <Link
                                    href={`/profile/${selectedAd.userId || selectedAd.user_id}`}
                                    className="w-1/2 neu-btn flex items-center justify-center gap-2 py-3 font-extrabold text-xs text-[var(--accent)]"
                                >
                                    View Creator Profile <User className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}