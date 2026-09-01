import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PitchDeckBuilder from "@/components/startup/PitchDeckBuilder";

export default async function PitchBuilderPage() {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    // Fetch existing deck to allow editing
    const { data: existingDeck } = await supabase
        .from("pitch_decks")
        .select("*")
        .eq("user_id", user.id)
        .single();

    return (
        <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10">
                <PitchDeckBuilder existingDeck={existingDeck} userId={user.id} />
            </main>

            <Footer />
        </div>
    );
}