"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SocialFeed from "@/components/social/SocialFeed";
import BetaBadge from "@/components/shared/BetaBadge";
import { MessageSquare, Sparkles } from "lucide-react";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-3xl w-full relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <MessageSquare size={24} />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Arena Social Network
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-white">Live Post Feed</h1>
            </div>
          </div>
          <BetaBadge variant="pill" />
        </div>

        {/* Social Feed Component */}
        <SocialFeed />

      </main>

      <Footer />
    </div>
  );
}
