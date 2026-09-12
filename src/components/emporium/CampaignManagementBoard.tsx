'use client';

import React, { useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { BarChart3, Settings } from 'lucide-react';
import PerformanceAnalytics from './PerformanceAnalytics';
import CampaignConfiguration from './CampaignConfiguration';

const boardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, type: 'spring', damping: 24 } }
};

export default function CampaignManagementBoard({ campaign }: { campaign: any }) {
    const [activeView, setActiveView] = useState<'analytics' | 'config'>('analytics');

    return (
        <motion.div
            variants={boardVariants}
            initial="hidden"
            animate="show"
            className="bg-zinc-950/80 backdrop-blur-2xl p-8 md:p-10 w-full rounded-3xl border border-white/5 space-y-10 shadow-2xl"
        >
            <div className="flex justify-between items-start border-b border-white/10 pb-8">
                <div>
                    <motion.h1 variants={boardVariants} className="text-3xl font-extrabold tracking-tight text-white">
                        Campaign Management
                    </motion.h1>
                    <motion.p variants={boardVariants} className="text-sm font-mono mt-2 text-zinc-500">
                        ID: {campaign.id}
                    </motion.p>
                </div>

                <motion.div variants={boardVariants} className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-white border border-white/10 tracking-wide">
                    {campaign.status.replace('_', ' ')}
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    variants={boardVariants}
                    onClick={() => setActiveView('analytics')}
                    className={`p-6 rounded-2xl cursor-pointer transition-all border ${activeView === 'analytics'
                            ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                            : 'border-white/5 bg-black/40 hover:bg-white/5'
                        }`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <BarChart3 className={`w-5 h-5 ${activeView === 'analytics' ? 'text-orange-500' : 'text-zinc-400'}`} />
                        <h3 className={`font-bold ${activeView === 'analytics' ? 'text-orange-500' : 'text-white'}`}>
                            Performance Analytics
                        </h3>
                    </div>
                    <p className="text-sm text-zinc-500">Real-time database metrics.</p>
                </motion.div>

                <motion.div
                    variants={boardVariants}
                    onClick={() => setActiveView('config')}
                    className={`p-6 rounded-2xl cursor-pointer transition-all border ${activeView === 'config'
                            ? 'border-white/40 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                            : 'border-white/5 bg-black/40 hover:bg-white/5'
                        }`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Settings className={`w-5 h-5 ${activeView === 'config' ? 'text-white' : 'text-zinc-400'}`} />
                        <h3 className={`font-bold ${activeView === 'config' ? 'text-white' : 'text-white'}`}>
                            Configuration
                        </h3>
                    </div>
                    <p className="text-sm text-zinc-500">Edit form for campaign details.</p>
                </motion.div>
            </div>

            <div className="min-h-[400px] pt-4">
                <AnimatePresence mode="wait">
                    {activeView === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                            <PerformanceAnalytics metrics={campaign} />
                        </motion.div>
                    )}

                    {activeView === 'config' && (
                        <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                            <CampaignConfiguration campaign={campaign} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}