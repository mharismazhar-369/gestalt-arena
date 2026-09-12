// Location: SRC/components/emporium/EmporiumAdBuilder.tsx

'use client';

import React, { useState, useTransition } from 'react';
import { createCampaign } from '@/app/emporium/actions';
import { Rocket, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

        const payload = {
            title: formData.get('title') as string,
            tagline: formData.get('tagline') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            targetRole: formData.get('targetRole') as string,
            tier: formData.get('tier') as string,
            ctaText: formData.get('ctaText') as string,
            ctaUrl: formData.get('ctaUrl') as string,
            companyName: formData.get('companyName') as string,
            contactEmail: formData.get('contactEmail') as string,
            productType: formData.get('productType') as string,
        };

        startTransition(async () => {
            try {
                await createCampaign(payload);
            } catch (err: any) {
                setError(err.message || 'Failed to deploy campaign.');
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative neu-flat-base p-8 rounded-3xl overflow-hidden text-[var(--secondary)]"
        >
            <AnimatePresence>
                {isPending && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--primary)]/60 backdrop-blur-sm">
                        <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <h2 className="text-2xl font-bold text-[var(--secondary)] flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-[var(--accent)]" />
                    Expanded Campaign Details
                </h2>

                {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-1 block">Company / Brand Name *</label>
                        <input name="companyName" required className="w-full neu-pressed-base rounded-xl px-4 py-3 text-sm text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-1 block">Contact Email *</label>
                        <input name="contactEmail" type="email" required className="w-full neu-pressed-base rounded-xl px-4 py-3 text-sm text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-1 block">Campaign Title *</label>
                        <input name="title" required className="w-full neu-pressed-base rounded-xl px-4 py-3 text-sm text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-1 block">Tagline</label>
                        <input name="tagline" className="w-full neu-pressed-base rounded-xl px-4 py-3 text-sm text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-1 block">Category</label>
                        <select name="category" className="w-full neu-pressed-base rounded-xl px-4 py-3 text-sm text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] appearance-none">
                            {config?.categories?.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-1 block">Target Audience</label>
                        <select name="targetRole" className="w-full neu-pressed-base rounded-xl px-4 py-3 text-sm text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] appearance-none">
                            {config?.targetRoles?.map((role: any) => (
                                <option key={role.id} value={role.id}>{role.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-1 block">Product Type</label>
                        <input name="productType" defaultValue="SaaS Platform" className="w-full neu-pressed-base rounded-xl px-4 py-3 text-sm text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-1 block">Description & Value Prop *</label>
                    <textarea name="description" required rows={3} className="w-full neu-pressed-base rounded-xl px-4 py-3 text-sm text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-1 block">CTA Button Label</label>
                        <input name="ctaText" defaultValue="Explore Deal" className="w-full neu-pressed-base rounded-xl px-4 py-3 text-sm text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-1 block">Destination URL *</label>
                        <input name="ctaUrl" type="url" required placeholder="https://" className="w-full neu-pressed-base rounded-xl px-4 py-3 text-sm text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/60 mb-1 block">Sponsorship Tier</label>
                    <div className="grid grid-cols-3 gap-3">
                        {config?.tiers?.map((tier: any, index: number) => (
                            <label key={tier.id} className="cursor-pointer">
                                <input type="radio" name="tier" value={tier.id} defaultChecked={index === 1} className="peer sr-only" />
                                <div className="p-4 rounded-xl neu-flat-base text-[var(--secondary)]/60 peer-checked:neu-pressed-base peer-checked:text-[var(--accent)] transition-all">
                                    <div className="text-xs font-bold">{tier.label}</div>
                                    <div className="text-[10px] mt-1">{tier.description}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 justify-end pt-4 border-t border-[var(--secondary)]/10">
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="px-6 py-3 text-xs font-bold text-[var(--secondary)]/60 hover:text-[var(--secondary)] transition-colors">
                            Cancel
                        </button>
                    )}
                    <button type="submit" disabled={isPending} className="neu-btn flex items-center gap-2 px-8 py-3 text-xs font-extrabold text-[var(--accent)]">
                        <Rocket className="w-4 h-4" /> Proceed to Checkout
                    </button>
                </div>
            </form>
        </motion.div>
    );
}