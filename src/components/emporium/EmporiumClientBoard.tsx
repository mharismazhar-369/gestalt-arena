'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import EmporiumAdBuilder from './EmporiumAdBuilder';
import { updateCampaignStatus } from '@/app/emporium/actions';
import { Store, Plus, Search, ExternalLink } from 'lucide-react';

export default function EmporiumClientBoard({
    initialCampaigns,
    config,
    currentUserId
}: {
    initialCampaigns: any[];
    config: any;
    currentUserId: string;
}) {
    const [showBuilder, setShowBuilder] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredCampaigns = initialCampaigns.filter((ad) => {
        const matchesCategory = selectedCategory === 'All' || ad.category === selectedCategory;
        const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-500">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Campaign Operations</h1>
                        <p className="text-xs text-zinc-400">Server-synchronized marketplace deployment.</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowBuilder(!showBuilder)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs rounded-xl transition-all"
                >
                    <Plus className="w-4 h-4" />
                    {showBuilder ? 'Close Builder' : 'Deploy Campaign'}
                </button>
            </div>

            {showBuilder && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <EmporiumAdBuilder config={config} onCancel={() => setShowBuilder(false)} />
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Search className="w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-xs text-zinc-200 focus:outline-none w-full md:w-64"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-zinc-800 text-orange-500 border border-orange-500/30' : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                    >
                        All Categories
                    </button>
                    {config?.categories?.map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'bg-zinc-800 text-orange-500 border border-orange-500/30' : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-2xl">
                        No active campaigns found in the database.
                    </div>
                ) : (
                    filteredCampaigns.map((ad) => {
                        const isOwner = ad.userId === currentUserId;

                        return (
                            <div key={ad.id} className="flex flex-col justify-between p-6 rounded-2xl bg-black border border-zinc-800 hover:border-orange-500/50 transition-all">
                                <div>
                                    <div className="flex justify-between items-center gap-2 mb-3">
                                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                            {ad.category}
                                        </span>
                                        <span className={`text-[10px] capitalize ${ad.status === 'pending_approval' ? 'text-zinc-500' : 'text-emerald-400'}`}>
                                            {ad.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-1">{ad.title}</h3>
                                    <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">{ad.description}</p>
                                </div>

                                {isOwner && (
                                    <div className="space-y-4 pt-4 border-t border-zinc-900">
                                        <div className="flex items-center justify-between text-xs">
                                            <Link
                                                href={`/emporium/${ad.id}`}
                                                className="text-orange-500 hover:text-orange-400 font-medium flex items-center gap-1"
                                            >
                                                Manage Config <ExternalLink className="w-3 h-3" />
                                            </Link>

                                            {ad.status === 'pending_approval' ? (
                                                <Link
                                                    href={`/emporium/checkout/${ad.id}`}
                                                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-[11px] rounded-lg transition-all"
                                                >
                                                    Complete Payment
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => updateCampaignStatus(ad.id, ad.status === 'active' ? 'paused' : 'active')}
                                                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-[11px] rounded-lg border border-zinc-800 transition-all"
                                                >
                                                    {ad.status === 'active' ? 'Pause' : 'Activate'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}