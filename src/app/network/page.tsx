import { createClient } from '@/lib/supabase/server';
import { updateConnectionStatus } from '@/actions/connections';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Users, Clock, UserCheck, X } from "lucide-react";

export default async function NetworkPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // 1. Fetch pending inbound requests
    const { data: pendingRequests } = await supabase
        .from('connections')
        .select('id, requester_id, status')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

    // 2. Safely fetch profile data for the requesters
    let requestersProfiles: Record<string, any> = {};
    if (pendingRequests && pendingRequests.length > 0) {
        const requesterIds = pendingRequests.map(req => req.requester_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', requesterIds);

        if (profiles) {
            requestersProfiles = profiles.reduce((acc, profile) => {
                acc[profile.id] = profile;
                return acc;
            }, {});
        }
    }

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-[1024px] w-full flex-grow relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <Users size={28} className="text-[var(--accent)]" />
                    <h1 className="text-3xl font-black text-[var(--secondary)]">Network Dashboard</h1>
                </div>

                <div className="neu-flat-base p-8 space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--secondary)]/70 border-b border-[var(--secondary)]/10 pb-3 flex items-center gap-2">
                        <Clock size={16} /> Pending Requests
                    </h2>

                    <div className="space-y-4">
                        {pendingRequests && pendingRequests.length > 0 ? (
                            pendingRequests.map((req) => {
                                const profile = requestersProfiles[req.requester_id];
                                const displayName = profile?.nickname || profile?.company_name || "Arena Member";

                                return (
                                    <div key={req.id} className="neu-pressed-base p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-inner border-transparent">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--primary)] font-black text-lg uppercase shadow-inner">
                                                {displayName.slice(0, 2)}
                                            </div>
                                            <div>
                                                <Link href={`/profile/${req.requester_id}`} className="font-bold text-[var(--secondary)] hover:text-[var(--accent)] transition-colors">
                                                    {displayName}
                                                </Link>
                                                <p className="text-xs text-[var(--secondary)]/60 font-medium capitalize">
                                                    {profile?.role || "Member"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <form action={updateConnectionStatus.bind(null, req.id, 'accepted')}>
                                                <button type="submit" className="flex items-center gap-2 py-2 px-4 text-xs neu-btn border-transparent text-emerald-600 hover:border-emerald-600 transition-all w-full sm:w-auto">
                                                    <UserCheck size={14} /> Accept
                                                </button>
                                            </form>

                                            <form action={updateConnectionStatus.bind(null, req.id, 'rejected')}>
                                                <button type="submit" className="flex items-center gap-2 py-2 px-4 text-xs neu-btn border-transparent text-rose-600 hover:border-rose-600 transition-all w-full sm:w-auto">
                                                    <X size={14} /> Decline
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                                <Users size={32} className="mb-3 opacity-40" />
                                <p className="text-sm font-bold">No pending requests</p>
                                <p className="text-xs font-medium">Your inbound connection requests will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}