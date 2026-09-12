'use client';

import React, { useTransition } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { updateCampaignConfig } from '@/app/emporium/actions';

export default function CampaignConfiguration({ campaign }: { campaign: any }) {
    const [isPending, startTransition] = useTransition();

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                await updateCampaignConfig(campaign.id, formData);
            } catch (error) {
                console.error(error);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Configuration</h2>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-70 text-zinc-400">Campaign Title</label>
                    <input
                        name="title"
                        defaultValue={campaign.title}
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-70 text-zinc-400">Destination URL</label>
                    <input
                        name="ctaUrl"
                        type="url"
                        defaultValue={campaign.cta_url}
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-70 text-zinc-400">Description / Copy</label>
                    <textarea
                        name="description"
                        defaultValue={campaign.description}
                        required
                        rows={4}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 resize-none transition-all"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm rounded-xl transition-all border border-white/10"
                    >
                        {isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Commit Changes
                    </button>
                </div>
            </form>
        </div>
    );
}