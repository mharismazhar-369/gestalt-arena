'use client';

import React, { useState, useTransition } from 'react';
import { createCampaign } from '@/app/emporium/actions';
import { Rocket, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { EmporiumAd } from '@/lib/emporium/lifecycle';

export default function EmporiumAdBuilder({
    config,
    onCancel
}: {
    config: any;
    onCancel?: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Type assertion bypasses strict mismatch by confirming strings
        const payload: Partial<EmporiumAd> = {
            title: formData.get('title') as string,
            tagline: formData.get('tagline') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            targetRole: formData.get('targetRole') as string,
            tier: formData.get('tier') as string,
            ctaText: formData.get('ctaText') as string,
            ctaUrl: formData.get('ctaUrl') as string,
            durationDays: Number(formData.get('durationDays')),
        };

        startTransition(async () => {
            try {
                await createCampaign(payload);
            } catch (err) {
                setError('Failed to deploy campaign to the server.');
            }
        });
    };

    return (
        <div className="bg-black text-zinc-100 p-6 rounded-2xl border border-zinc-800 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                        Define Campaign Payload
                    </h2>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-red-200 text-xs">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Title *</label>
                        <input name="title" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Tagline</label>
                        <input name="tagline" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Industry Category</label>
                        <select name="category" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500">
                            {config?.categories?.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Audience</label>
                        <select name="targetRole" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500">
                            {config?.targetRoles?.map((role: any) => (
                                <option key={role.id} value={role.id}>{role.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Description *</label>
                    <textarea name="description" required rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">CTA Label</label>
                        <input name="ctaText" defaultValue="Explore Deal" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Destination URL *</label>
                        <input name="ctaUrl" type="url" required placeholder="https://" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500" />
                    </div>
                </div>

                {/* Duration configuration for the payload */}
                <input type="hidden" name="durationDays" value="30" />

                <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">Sponsorship Tier</label>
                    <div className="grid grid-cols-3 gap-3">
                        {config?.tiers?.map((tier: any, index: number) => (
                            <label key={tier.id} className="cursor-pointer">
                                <input type="radio" name="tier" value={tier.id} defaultChecked={index === 1} className="peer sr-only" />
                                <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 peer-checked:border-orange-500 peer-checked:bg-orange-500/10 peer-checked:text-orange-400 transition-all text-left">
                                    <div className="text-xs font-bold">{tier.label}</div>
                                    <div className="text-[10px] opacity-70 mt-1">{tier.description}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-900">
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                    )}
                    <button type="submit" disabled={isPending} className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs rounded-xl transition-all disabled:opacity-50">
                        {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                        Proceed to Checkout
                    </button>
                </div>
            </form>
        </div>
    );
}