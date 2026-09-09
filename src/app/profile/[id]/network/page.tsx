import { createClient } from '@/lib/supabase/server';
import { updateConnectionStatus } from '@/actions/connections';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Users, Clock, UserCheck, X, Send, ShieldCheck, UserMinus, Search, Globe } from "lucide-react";

export default async function NetworkPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: targetUserId } = await params;

    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) redirect('/login');

    const isOwnProfile = currentUser.id === targetUserId;

    // 1. Fetch Target User's Identity
    const { data: targetProfile } = await supabase
        .from('profiles')
        .select('nickname, company_name, role')
        .eq('id', targetUserId)
        .single();

    if (!targetProfile) redirect('/dashboard');

    const targetDisplayName = targetProfile.nickname || targetProfile.company_name || "Arena Member";

    // 2. Fetch ALL connection relationships for the target user
    const { data: allConnections } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`);

    const connections = allConnections || [];

    // 3. Segment the connections (Pending requests only visible to the profile owner)
    const activeConnections = connections.filter(c => c.status === 'accepted');
    const inboundPending = isOwnProfile ? connections.filter(c => c.receiver_id === targetUserId && c.status === 'pending') : [];
    const outboundPending = isOwnProfile ? connections.filter(c => c.requester_id === targetUserId && c.status === 'pending') : [];

    // 4. Extract unique IDs for the "other" users in these relationships
    const otherUserIds = new Set([
        ...inboundPending.map(c => c.requester_id),
        ...outboundPending.map(c => c.receiver_id),
        ...activeConnections.map(c => c.requester_id === targetUserId ? c.receiver_id : c.requester_id)
    ]);

    // 5. Batch fetch all required profiles
    let profileMap: Record<string, any> = {};
    if (otherUserIds.size > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nickname, company_name, role')
            .in('id', Array.from(otherUserIds));

        if (profiles) {
            profileMap = profiles.reduce((acc: any, profile: any) => {
                acc[profile.id] = profile;
                return acc;
            }, {});
        }
    }

    // Helper to render connection cards
    const renderUserCard = (connection: any, isTargetReceiver: boolean, actionControls?: React.ReactNode) => {
        const otherId = isTargetReceiver ? connection.receiver_id : connection.requester_id;
        const profile = profileMap[otherId];

        if (!profile) return null;

        const displayName = profile.nickname || profile.company_name || "Arena Member";

        return (
            <div key={connection.id} className="neu-pressed-base p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-transparent transition-all hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--primary)] font-black text-lg uppercase shadow-inner">
                        {displayName.slice(0, 2)}
                    </div>
                    <div>
                        <Link href={`/profile/${otherId}`} className="font-bold text-[var(--secondary)] hover:text-[var(--accent)] transition-colors">
                            {displayName}
                        </Link>
                        <p className="text-xs text-[var(--secondary)]/60 font-medium capitalize">
                            {profile.role || "Member"}
                        </p>
                    </div>
                </div>
                {actionControls && (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {actionControls}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-[1024px] w-full flex-grow relative z-10 space-y-8">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[var(--secondary)]/10 pb-6">
                    <div className="flex items-center gap-3">
                        {isOwnProfile ? <Users size={28} className="text-[var(--accent)]" /> : <Globe size={28} className="text-[var(--accent)]" />}
                        <div>
                            <h1 className="text-3xl font-black text-[var(--secondary)]">
                                {isOwnProfile ? "Network Command" : `${targetDisplayName}'s Network`}
                            </h1>
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--secondary)]/50 mt-1">
                                {activeConnections.length} Active {activeConnections.length === 1 ? 'Connection' : 'Connections'}
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--secondary)]/40" />
                        <input
                            type="text"
                            placeholder="Search this grid..."
                            className="w-full bg-transparent neu-pressed-base rounded-full py-2.5 pl-11 pr-4 text-sm font-medium text-[var(--secondary)] outline-none placeholder-[var(--secondary)]/40 focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Private Column: Requests (Only visible to profile owner) */}
                    {isOwnProfile && (
                        <div className="lg:col-span-1 space-y-8">
                            {/* Inbound Pending */}
                            <div className="neu-flat-base p-6 space-y-4">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/70 flex items-center gap-2 pb-2 border-b border-[var(--secondary)]/10">
                                    <Clock size={14} /> Action Required ({inboundPending.length})
                                </h2>
                                <div className="space-y-3">
                                    {inboundPending.length > 0 ? inboundPending.map(req => renderUserCard(req, false, (
                                        <>
                                            <form action={updateConnectionStatus} className="flex-1">
                                                <input type="hidden" name="connectionId" value={req.id} />
                                                <input type="hidden" name="status" value="accepted" />
                                                <button type="submit" className="flex justify-center items-center gap-2 py-2 px-3 text-[10px] uppercase font-bold neu-btn text-emerald-500 w-full">
                                                    <UserCheck size={14} />
                                                </button>
                                            </form>
                                            <form action={updateConnectionStatus} className="flex-1">
                                                <input type="hidden" name="connectionId" value={req.id} />
                                                <input type="hidden" name="status" value="rejected" />
                                                <button type="submit" className="flex justify-center items-center gap-2 py-2 px-3 text-[10px] uppercase font-bold neu-btn text-rose-500 w-full">
                                                    <X size={14} />
                                                </button>
                                            </form>
                                        </>
                                    ))) : (
                                        <p className="text-xs text-center opacity-50 py-4 font-medium">No pending requests.</p>
                                    )}
                                </div>
                            </div>

                            {/* Outbound Pending */}
                            <div className="neu-flat-base p-6 space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]/70 flex items-center gap-2 pb-2 border-b border-[var(--secondary)]/10">
                                    <Send size={14} /> Awaiting Response ({outboundPending.length})
                                </h2>
                                <div className="space-y-3">
                                    {outboundPending.length > 0 ? outboundPending.map(req => renderUserCard(req, true, (
                                        <form action={updateConnectionStatus} className="w-full">
                                            <input type="hidden" name="connectionId" value={req.id} />
                                            <input type="hidden" name="status" value="cancelled" />
                                            <button type="submit" className="flex justify-center items-center gap-2 py-2 px-4 text-xs font-bold neu-btn text-[var(--secondary)]/60 hover:text-rose-500 w-full">
                                                Cancel Request
                                            </button>
                                        </form>
                                    ))) : (
                                        <p className="text-xs text-center opacity-50 py-4 font-medium">No sent requests.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Public Column: Active Connections */}
                    <div className={`${isOwnProfile ? 'lg:col-span-2' : 'lg:col-span-3'} neu-flat-base p-8 space-y-6`}>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--secondary)]/70 border-b border-[var(--secondary)]/10 pb-3 flex items-center gap-2">
                            <ShieldCheck size={16} /> Active Grid
                        </h2>

                        <div className={`grid grid-cols-1 gap-4 ${isOwnProfile ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                            {activeConnections.length > 0 ? activeConnections.map(conn => {
                                const isTargetReceiver = conn.requester_id === targetUserId;

                                const actionControls = isOwnProfile ? (
                                    <form action={updateConnectionStatus}>
                                        <input type="hidden" name="connectionId" value={conn.id} />
                                        <input type="hidden" name="status" value="removed" />
                                        <button type="submit" title="Sever Connection" className="p-2 neu-btn text-[var(--secondary)]/40 hover:text-rose-500 rounded-lg">
                                            <UserMinus size={14} />
                                        </button>
                                    </form>
                                ) : undefined;

                                return renderUserCard(conn, isTargetReceiver, actionControls);
                            }) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-60">
                                    <Users size={48} className="mb-4 opacity-20" />
                                    <p className="text-base font-bold">Grid is empty</p>
                                    <p className="text-xs font-medium mt-1 max-w-sm">
                                        {isOwnProfile ? "Connect with investors and startups in the Arena to build your tactical network." : "This user has not established any active connections yet."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}