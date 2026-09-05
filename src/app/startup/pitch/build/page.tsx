import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PitchDeckBuilder from "@/components/startup/PitchDeckBuilder";
import { ArrowLeft, Rocket } from "lucide-react";

export default async function PitchBuilderPage({
    searchParams,
}: {
    searchParams: Promise<{ target_bid?: string; pitch_id?: string }>;
}) {
    // 1. Unwrap the searchParams Promise required by Next.js 15+[cite: 16]
    const { target_bid, pitch_id } = await searchParams;
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    let existingDeck = null;

    // 2. Only fetch an existing deck if explicitly requested via URL[cite: 16]
    if (pitch_id) {
        const { data } = await supabase
            .from("pitch_decks")
            .select("*")
            .eq("id", pitch_id)
            .eq("user_id", user.id)
            .single();

        existingDeck = data;
    }

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-5xl w-full relative z-10 space-y-8">

                {/* Dynamic Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--secondary)]/10">
                    <div className="space-y-2">
                        <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] inline-flex items-center gap-1.5 mb-1">
                            <Rocket size={12} />
                            {target_bid ? "Targeted Mandate Application" : existingDeck ? "Pitch Management" : "New Portfolio Asset"}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)] tracking-tight">
                            {existingDeck ? "Edit Pitch Deck" : "Pitch Deck Builder"}
                        </h1>
                        <p className="text-[var(--secondary)]/70 text-sm font-medium">
                            {target_bid
                                ? "Craft a tailored pitch specifically aligned with the investor's mandate."
                                : "Create a comprehensive summary of your startup to attract capital allocators."}
                        </p>
                    </div>

                    <Link
                        href="/startup/dashboard"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs neu-btn shrink-0"
                    >
                        <ArrowLeft size={14} /> Back to Dashboard
                    </Link>
                </div>

                {/* 3. Pass the targetBidId down so the builder knows to initiate a deal upon saving[cite: 16] */}
                <PitchDeckBuilder
                    existingDeck={existingDeck}
                    userId={user.id}
                    targetBidId={target_bid}
                />
            </main>

            <Footer />
        </div>
    );
}