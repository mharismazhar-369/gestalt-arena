'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';

export default function CampaignDetailsPage() {
    const params = useParams();
    const campaignId = params.id as string;

    return (
        <main className="min-h-screen bg-black text-zinc-100 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-6">
                <Link
                    href="/emporium"
                    className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-amber-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Emporium Dashboard
                </Link>

                <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Campaign Management</h1>
                            <p className="text-sm text-zinc-400">ID: {campaignId}</p>
                        </div>
                        <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium">
                            Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                            <div className="flex items-center gap-2 mb-4 text-amber-400">
                                <BarChart3 className="w-5 h-5" />
                                <h2 className="font-bold">Performance Analytics</h2>
                            </div>
                            <p className="text-xs text-zinc-400">Detailed time-series metrics will render here.</p>
                        </div>

                        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                            <div className="flex items-center gap-2 mb-4 text-zinc-300">
                                <Settings className="w-5 h-5" />
                                <h2 className="font-bold">Configuration</h2>
                            </div>
                            <p className="text-xs text-zinc-400">Edit form for campaign details goes here.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}