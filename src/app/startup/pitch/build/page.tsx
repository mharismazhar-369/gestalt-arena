import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PitchDeckBuilder from "@/components/startup/PitchDeckBuilder";

export default async function PitchBuilderPage({
    searchParams,
}: {
    searchParams: Promise<{ target_bid?: string; pitch_id?: string }>;
}) {
    // 1. Unwrap the searchParams Promise required by Next.js 15+
    const { target_bid, pitch_id } = await searchParams;
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    let existingDeck = null;

    // 2. Only fetch an existing deck if explicitly requested via URL
    // This prevents database errors now that founders can have multiple pitches
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
        <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10">
                {/* 3. Pass the targetBidId down so the builder knows to initiate a deal upon saving */}
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