'use client';

import React from 'react';
import { BarChart3, MousePointerClick, Eye, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PerformanceAnalytics({ metrics }: { metrics: any }) {
    // These pull directly from the Supabase columns: impressions, clicks, conversions
    const actualImpressions = metrics.impressions || 0;
    const actualClicks = metrics.clicks || 0;
    const actualConversions = metrics.conversions || 0;

    // CTR Calculation
    const calculatedCTR = actualImpressions > 0
        ? ((actualClicks / actualImpressions) * 100).toFixed(2)
        : "0.00";

    const stats = [
        { label: 'Impressions', value: actualImpressions, icon: Eye },
        { label: 'Clicks', value: actualClicks, icon: MousePointerClick },
        { label: 'CTR', value: `${calculatedCTR}%`, icon: BarChart3 },
        { label: 'Conversions', value: actualConversions, icon: TrendingUp },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        whileHover={{ scale: 1.02 }}
                        className="bg-black/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-start gap-4 shadow-lg"
                    >
                        <div className="flex items-center gap-2 text-zinc-400">
                            <stat.icon className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <span className="text-4xl font-black text-white">
                            {stat.value}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Simulated Data Activity Wave - Styled Dark */}
            <div className="bg-black/40 border border-white/5 rounded-2xl h-40 w-full mt-6 p-4 flex items-end justify-between gap-1 overflow-hidden">
                {[...Array(24)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.random() * 80 + 20}%` }}
                        transition={{ duration: 1.5, delay: i * 0.05, type: 'spring' }}
                        className="w-full rounded-t-sm opacity-30 hover:opacity-100 transition-opacity bg-zinc-600"
                    />
                ))}
            </div>
        </div>
    );
}