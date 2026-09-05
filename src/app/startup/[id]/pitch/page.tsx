import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PitchDeckViewer from "@/components/pitch/PitchDeckViewer";

export default async function PitchDeckPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-4 md:px-6 mx-auto max-w-6xl w-full relative z-10">
                {/* 
                  The Viewer now handles everything: the Neumorphic UI, 
                  view counting, ratings, and embedded investor actions. 
                */}
                <PitchDeckViewer pitchId={id} />
            </main>

            <Footer />
        </div>
    );
}