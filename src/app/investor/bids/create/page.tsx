import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BidDeckBuilder from "@/components/investor/BidDeckBuilder";
import { Target } from "lucide-react";

export default async function CreateBidDeckPage() {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    // Ensure only authenticated investors can access this route
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role === "startup") {
        redirect("/startup/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10 space-y-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="rounded-2xl bg-cyan-500/10 border border-cyan-400/30 p-2.5 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            <Target size={24} />
                        </span>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                                Reverse Pitching
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black text-white">Create Bid Deck</h1>
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                        Broadcast your investment thesis and capital availability to the network. Startups matching your criteria will submit their pitch decks directly to this mandate.
                    </p>
                </div>

                <BidDeckBuilder investorId={user.id} />
            </main>

            <Footer />
        </div>
    );
}