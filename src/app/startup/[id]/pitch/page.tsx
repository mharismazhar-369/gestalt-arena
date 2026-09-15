import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PitchDeckViewer from "@/components/pitch/PitchDeckViewer";
import { Presentation } from "lucide-react";

export default async function PitchDeckPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // The [id] in the route is the startup's user/profile ID.
    // We look up their actual pitch deck UUID here before passing it to the viewer.
    const { data: pitchDeck, error } = await supabase
        .from("pitch_decks")
        .select("id")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error || !pitchDeck) {
        return (
            <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
                <Navbar />
                <main className="flex-1 flex items-center justify-center px-6">
                    <div className="text-center space-y-4 neu-flat-base p-8 max-w-md w-full">
                        <Presentation size={48} className="mx-auto text-[var(--secondary)]/40" />
                        <h1 className="text-xl font-bold text-[var(--secondary)]">Pitch Deck Not Found</h1>
                        <p className="text-xs text-[var(--secondary)]/60 font-medium">This startup has not published an active pitch deck yet.</p>
                        <Link href="/dashboard" className="neu-btn px-6 py-2.5 inline-block text-xs font-bold">Return to Dashboard</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-4 md:px-6 mx-auto max-w-6xl w-full relative z-10">
                {/* 
                  The Viewer now handles everything: the Neumorphic UI, 
                  view counting, ratings, and embedded investor actions. 
                */}
                <PitchDeckViewer pitchId={pitchDeck.id} />
            </main>

            <Footer />
        </div>
    );
}