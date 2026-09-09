"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  ShieldAlert, Activity, Users, Ban, Trash2, Unlock, AlertTriangle,
  Terminal, Presentation, BriefcaseBusiness, Eye, UserPlus, GitBranch,
  Star, HandCoins, Search, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { executeModeration } from "@/app/admin/actions";

type AdminUser = {
  id: string;
  username: string | null;
  email: string | null;
  role: string;
  is_admin: boolean | null;
  presence_status: string;
  created_at: string;
  profile_completed: boolean | null;
  tier: string | null;
  company_name: string | null;
  industry: string | null;
  country: string | null;
  city: string | null;
  verification_status: string | null;
  pitch_decks: number;
  solo_pitch_decks: number;
  open_bid_pitch_decks: number;
  investor_bid_decks: number;
  investor_interests: number;
  active_pipeline: number;
  investments: number;
  bid_submissions: number;
  pitch_views: number;
  pitch_interests_received: number;
};

type TrafficData = { name: string; visits: number; registrations: number };
type AdminLog = {
  id: string;
  admin_id: string | null;
  admin_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};
type ChartRow = { name: string; value: number };
type Metrics = {
  visits24h: number; registrations24h: number; pitchDecks: number;
  investorBids: number; interests: number; negotiations: number;
  investments: number; profileViews: number; opportunityViews: number;
};

const EMPTY_METRICS: Metrics = {
  visits24h: 0, registrations24h: 0, pitchDecks: 0, investorBids: 0,
  interests: 0, negotiations: 0, investments: 0, profileViews: 0,
  opportunityViews: 0
};

export default function GestaltCommandCenter() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [systemLogs, setSystemLogs] = useState<AdminLog[]>([]);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [roleDistribution, setRoleDistribution] = useState<ChartRow[]>([]);
  const [pitchActivity, setPitchActivity] = useState<ChartRow[]>([]);
  const [dealPipeline, setDealPipeline] = useState<ChartRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeDeals, setActiveDeals] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSystemTelemetry();

    const telemetryChannel = supabase
      .channel("admin-telemetry")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload: any) => {
        addLiveLog("SYSTEM", `Profile ${payload.eventType}: ${payload.new?.id || payload.old?.id}`, payload.eventType, payload.new?.id || payload.old?.id);
        fetchSystemTelemetry();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "deal_negotiations" }, (payload: any) => {
        addLiveLog("DEAL", `New Negotiation Initiated: ${payload.new?.id}`, "deal_negotiation_created", payload.new?.id);
        fetchSystemTelemetry();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_audit_logs" }, (payload: any) => {
        setSystemLogs((prev) => [payload.new as AdminLog, ...prev].slice(0, 100));
      });

    telemetryChannel.subscribe();
    return () => { supabase.removeChannel(telemetryChannel); };
  }, []);

  const fetchSystemTelemetry = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        // ADD is_admin TO THIS SELECT STATEMENT:
        .select("id, username, email, role, is_admin, presence_status, created_at, profile_completed, tier, company_name, industry, country, city")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!profiles) return;
      const ids = profiles.map((p: any) => p.id);

      const [startupRows, investorRows, pitchRows, bidRows, interestRows, pipelineRows, investmentRows, submissionRows] = await Promise.all([
        supabase.from("startup_profiles").select("profile_id, verification_status").in("profile_id", ids),
        supabase.from("investor_profiles").select("profile_id, verification_status").in("profile_id", ids),
        supabase.from("pitch_decks").select("id, user_id, target_bid_id").in("user_id", ids),
        supabase.from("investor_bid_decks").select("id, investor_id").in("investor_id", ids),
        supabase.from("pitch_deck_interests").select("id, investor_id").in("investor_id", ids),
        supabase.from("deal_pipeline").select("id, investor_id, stage").in("investor_id", ids),
        supabase.from("investments").select("id, investor_id").in("investor_id", ids),
        supabase.from("investor_bid_submissions").select("id, startup_id").in("startup_id", ids)
      ]);

      const pitchIds = (pitchRows.data || []).map((r: any) => r.id);
      const { data: interestReceivedData } = pitchIds.length
        ? await supabase.from("pitch_deck_interests").select("id, pitch_deck_id").in("pitch_deck_id", pitchIds)
        : { data: [] as any[] };
      const { data: pitchViewData } = pitchIds.length
        ? await supabase.from("pitch_deck_views").select("id, pitch_deck_id").in("pitch_deck_id", pitchIds)
        : { data: [] as any[] };

      const verification = new Map<string, string>();
      (startupRows.data || []).forEach((r: any) => verification.set(r.profile_id, r.verification_status));
      (investorRows.data || []).forEach((r: any) => verification.set(r.profile_id, r.verification_status));

      const pitchMap = new Map<string, { total: number; solo: number; bid: number }>();
      (pitchRows.data || []).forEach((r: any) => {
        const v = pitchMap.get(r.user_id) || { total: 0, solo: 0, bid: 0 };
        v.total += 1; r.target_bid_id ? v.bid += 1 : v.solo += 1; pitchMap.set(r.user_id, v);
      });
      const countBy = (rows: any[], key: string) => rows.reduce((m: Map<string, number>, r: any) => {
        m.set(r[key], (m.get(r[key]) || 0) + 1); return m;
      }, new Map<string, number>());
      const bidMap = countBy(bidRows.data || [], "investor_id");
      const interestMap = countBy(interestRows.data || [], "investor_id");
      const investmentMap = countBy(investmentRows.data || [], "investor_id");
      const submissionMap = countBy(submissionRows.data || [], "startup_id");
      const pitchViewMap = new Map<string, number>();
      (pitchViewData || []).forEach((r: any) => {
        const deck = (pitchRows.data || []).find((p: any) => p.id === r.pitch_deck_id);
        if (deck) pitchViewMap.set(deck.user_id, (pitchViewMap.get(deck.user_id) || 0) + 1);
      });
      const interestReceivedMap = new Map<string, number>();
      (interestReceivedData || []).forEach((r: any) => {
        const deck = (pitchRows.data || []).find((p: any) => p.id === r.pitch_deck_id);
        if (deck) interestReceivedMap.set(deck.user_id, (interestReceivedMap.get(deck.user_id) || 0) + 1);
      });
      const pipelineMap = new Map<string, number>();
      (pipelineRows.data || []).forEach((r: any) => {
        if (String(r.stage).toLowerCase() !== "passed") pipelineMap.set(r.investor_id, (pipelineMap.get(r.investor_id) || 0) + 1);
      });

      setUsers(profiles.map((p: any) => {
        const pitch = pitchMap.get(p.id) || { total: 0, solo: 0, bid: 0 };
        return {
          ...p,
          is_admin: p.is_admin || false,
          verification_status: verification.get(p.id) || null,
          pitch_decks: pitch.total,
          solo_pitch_decks: pitch.solo,
          open_bid_pitch_decks: pitch.bid,
          investor_bid_decks: bidMap.get(p.id) || 0,
          investor_interests: interestMap.get(p.id) || 0,
          active_pipeline: pipelineMap.get(p.id) || 0,
          investments: investmentMap.get(p.id) || 0,
          bid_submissions: submissionMap.get(p.id) || 0,
          pitch_views: pitchViewMap.get(p.id) || 0,
          pitch_interests_received: interestReceivedMap.get(p.id) || 0
        };
      }));

      const { count: uCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: dCount } = await supabase.from("deal_negotiations").select("*", { count: "exact", head: true }).neq("status", "Cancelled");
      setTotalUsers(uCount || 0);
      setActiveDeals(dCount || 0);

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [visits24, registrations24, pitchDeckCount, bidCount, interestCount, negotiationCount, investmentCount, profileViewCount, opportunityViewCount, roles, pitchRecent, pipelineAll, auditRows] = await Promise.all([
        supabase.from("site_visits").select("created_at", { count: "exact" }).gte("created_at", since).or("path.eq./,path.is.null"),
        supabase.from("profiles").select("created_at", { count: "exact" }).gte("created_at", since),
        supabase.from("pitch_decks").select("*", { count: "exact", head: true }),
        supabase.from("investor_bid_decks").select("*", { count: "exact", head: true }),
        supabase.from("pitch_deck_interests").select("*", { count: "exact", head: true }),
        supabase.from("deal_negotiations").select("*", { count: "exact", head: true }).neq("status", "Cancelled"),
        supabase.from("investments").select("*", { count: "exact", head: true }),
        supabase.from("profile_views").select("*", { count: "exact", head: true }),
        supabase.from("opportunity_views").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("role"),
        supabase.from("pitch_decks").select("created_at, target_bid_id").gte("created_at", since),
        supabase.from("deal_pipeline").select("stage"),
        supabase.from("admin_audit_logs").select("id, admin_id, admin_email, action, target_type, target_id, details, created_at").order("created_at", { ascending: false }).limit(100)
      ]);

      const buckets = Array.from({ length: 24 }, (_, i) => {
        const d = new Date(Date.now() - (23 - i) * 3600000);
        return { key: d.getHours(), name: `${String(d.getHours()).padStart(2, "0")}:00`, visits: 0, registrations: 0 };
      });
      (visits24.data || []).forEach((r: any) => {
        const b = buckets.find((x) => x.key === new Date(r.created_at).getHours()); if (b) b.visits++;
      });
      (registrations24.data || []).forEach((r: any) => {
        const b = buckets.find((x) => x.key === new Date(r.created_at).getHours()); if (b) b.registrations++;
      });
      setTraffic(buckets.map(({ name, visits, registrations }) => ({ name, visits, registrations })));

      setMetrics({
        visits24h: visits24.count || 0,
        registrations24h: registrations24.count || 0,
        pitchDecks: pitchDeckCount.count || 0,
        investorBids: bidCount.count || 0,
        interests: interestCount.count || 0,
        negotiations: negotiationCount.count || 0,
        investments: investmentCount.count || 0,
        profileViews: profileViewCount.count || 0,
        opportunityViews: opportunityViewCount.count || 0
      });

      const roleCounts = (roles.data || []).reduce((a: Record<string, number>, r: any) => { a[r.role] = (a[r.role] || 0) + 1; return a; }, {});
      setRoleDistribution(Object.entries(roleCounts).map(([name, value]) => ({ name, value: Number(value) })));

      const pc = (pitchRecent.data || []).reduce((a: Record<string, number>, r: any) => { const k = r.target_bid_id ? "OPEN_BID" : "SOLO"; a[k] = (a[k] || 0) + 1; return a; }, {});
      setPitchActivity([{ name: "SOLO", value: pc.SOLO || 0 }, { name: "OPEN_BID", value: pc.OPEN_BID || 0 }]);

      const dc = (pipelineAll.data || []).reduce((a: Record<string, number>, r: any) => { a[r.stage] = (a[r.stage] || 0) + 1; return a; }, {});
      setDealPipeline(Object.entries(dc).map(([name, value]) => ({ name: name.replaceAll("_", " ").toUpperCase(), value: Number(value) })));

      if (auditRows.data) setSystemLogs(auditRows.data as AdminLog[]);
    } finally { setLoading(false); }
  };

  const addLiveLog = (category: string, message: string, action = "system_event", targetId?: string) => {
    const row: AdminLog = {
      id: `live-${Date.now()}-${Math.random()}`,
      admin_id: session?.user?.id || null,
      admin_email: session?.user?.email || null,
      action: `${category}:${action}`,
      target_type: "system",
      target_id: targetId || null,
      details: { message },
      created_at: new Date().toISOString()
    };
    setSystemLogs((prev) => [row, ...prev].slice(0, 100));
  };

  const writeAuditLog = async (action: string, targetType: string, targetId: string | null, details: Record<string, unknown> = {}) => {
    if (!session?.user?.id) return;
    await supabase.rpc("log_admin_action", { p_action: action, p_target_type: targetType, p_target_id: targetId, p_details: details });
  };

  const handleModerateUser = async (userId: string, action: "ban" | "suspend" | "restore" | "delete") => {
    if (!window.confirm(`EXECUTE ${action.toUpperCase()} ON USER ${userId}?`)) return;
    try {
      const target = users.find((u) => u.id === userId);
      if (action === "delete") {
        addLiveLog("WARN", `Initiating hard delete for ${userId}`, action, userId);
        await writeAuditLog("user_delete_requested", "profile", userId, { username: target?.username, email: target?.email });
        await supabase.from("profiles").delete().eq("id", userId);
      } else {
        if (!session?.user?.id) throw new Error("Admin session lost");
        await executeModeration(session.user.id, userId, action);
        const newStatus = action === "ban" ? "banned" : action === "suspend" ? "suspended" : "online";
        addLiveLog("MOD", `User ${userId} status updated to ${newStatus}`, `user_${action}`, userId);
        await writeAuditLog(`user_${action}`, "profile", userId, { username: target?.username, email: target?.email, resulting_status: newStatus });
      }
      await fetchSystemTelemetry();
    } catch (e: any) {
      addLiveLog("ERROR", `Execution failed: ${e.message}`, "moderation_error", userId);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase(); if (!q) return true;
    return [u.id, u.username, u.email, u.company_name, u.role, u.industry, u.country, u.city].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
  });
  const conversion = metrics.visits24h ? ((metrics.registrations24h / metrics.visits24h) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-[#050505] text-[#00f3ff] font-mono selection:bg-[#00f3ff] selection:text-black overflow-hidden flex flex-col">
      <header className="h-16 border-b border-[#00f3ff]/20 bg-[#0a0a0a] flex items-center justify-between px-6">
        <div className="flex items-center gap-3"><ShieldAlert className="text-[#ff003c]" /><h1 className="text-xl font-black tracking-widest text-white uppercase">Gestalt <span className="text-[#00f3ff]">Command</span></h1></div>
        <div className="flex items-center gap-8">
          <div className="flex gap-8 text-xs font-bold tracking-wider">
            <div className="flex flex-col"><span className="text-gray-500">SYS_STATUS</span><span className="text-green-400">OPTIMAL</span></div>
            <div className="flex flex-col"><span className="text-gray-500">TOTAL_ENTITIES</span><span>{totalUsers}</span></div>
            <div className="flex flex-col"><span className="text-gray-500">ACTIVE_DEALS</span><span>{activeDeals}</span></div>
          </div>
          <button onClick={fetchSystemTelemetry} className="p-2 border border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-300 rounded-lg transition" title="Refresh telemetry"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /></button>
          <Link href="/feed" className="ml-4 px-4 py-2 border border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-300 rounded-lg text-[10px] font-black tracking-widest uppercase transition">Exit Matrix</Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          {[["VISITS_24H", metrics.visits24h, Eye], ["REG_24H", metrics.registrations24h, UserPlus], ["CONVERSION", `${conversion}%`, Activity], ["PITCH_DECKS", metrics.pitchDecks, Presentation], ["INVESTOR_BIDS", metrics.investorBids, BriefcaseBusiness], ["INTERESTS", metrics.interests, Star], ["NEGOTIATIONS", metrics.negotiations, GitBranch], ["INVESTMENTS", metrics.investments, HandCoins]].map(([label, value, Icon]: any) => (
            <div key={label} className="bg-[#0a0a0a] border border-[#00f3ff]/10 p-3 rounded-xl"><div className="text-gray-600 text-[9px] tracking-widest flex items-center gap-2"><Icon size={12} />{label}</div><div className="text-white text-lg font-black mt-1">{value}</div></div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
            <div className="bg-[#0a0a0a] border border-[#00f3ff]/10 p-4 rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.05)] h-96 flex flex-col">
              <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-bold text-gray-400 flex items-center gap-2"><Activity size={16} /> SECTOR TRAFFIC MATRIX (24H)</h2><span className="text-[9px] text-gray-600">LANDING VISITS → REGISTRATIONS</span></div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={traffic}><CartesianGrid strokeDasharray="3 3" stroke="#111" /><XAxis dataKey="name" stroke="#555" tick={{ fontSize: 10 }} /><YAxis stroke="#555" tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid #00f3ff", color: "#fff" }} /><Line type="monotone" dataKey="visits" name="Landing Visits" stroke="#00f3ff" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="registrations" name="Registrations" stroke="#00ff88" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartBox title="ENTITY DISTRIBUTION"><ResponsiveContainer width="100%" height="90%"><PieChart><Pie data={roleDistribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>{roleDistribution.map((_, i) => <Cell key={i} fill={["#00f3ff", "#ff00fc", "#00ff88"][i % 3]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid #00f3ff" }} /><Legend wrapperStyle={{ fontSize: 9 }} /></PieChart></ResponsiveContainer></ChartBox>
              <ChartBox title="PITCH DECK COMPOSITION"><ResponsiveContainer width="100%" height="90%"><BarChart data={pitchActivity}><CartesianGrid strokeDasharray="3 3" stroke="#111" /><XAxis dataKey="name" stroke="#555" tick={{ fontSize: 9 }} /><YAxis stroke="#555" tick={{ fontSize: 9 }} /><Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid #00f3ff" }} /><Bar dataKey="value" fill="#ff00fc" /></BarChart></ResponsiveContainer></ChartBox>
              <ChartBox title="DEAL PIPELINE"><ResponsiveContainer width="100%" height="90%"><BarChart data={dealPipeline} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#111" /><XAxis type="number" stroke="#555" tick={{ fontSize: 8 }} /><YAxis type="category" dataKey="name" width={80} stroke="#555" tick={{ fontSize: 8 }} /><Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid #00f3ff" }} /><Bar dataKey="value" fill="#00ff88" /></BarChart></ResponsiveContainer></ChartBox>
            </div>

            <div className="bg-[#0a0a0a] border border-[#00f3ff]/10 p-4 rounded-xl min-h-[520px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between gap-4 mb-4"><h2 className="text-sm font-bold text-gray-400 flex items-center gap-2"><Users size={16} /> ENTITY MANAGEMENT PROTOCOL</h2><div className="flex items-center gap-2 border border-gray-800 bg-black px-3 py-2 rounded-lg"><Search size={13} className="text-gray-600" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="UUID / email / company / role" className="bg-transparent outline-none text-[10px] text-white w-56 placeholder:text-gray-700" /></div></div>
              <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 pr-2">
                <table className="w-full text-left text-xs min-w-[1100px]"><thead className="sticky top-0 bg-[#0a0a0a] text-gray-500 border-b border-[#00f3ff]/20 z-10"><tr><th className="py-2">ENTITY</th><th>ROLE</th><th>STATUS</th><th>PROFILE</th><th>PITCH DECKS</th><th>INVESTOR ACTIVITY</th><th className="text-right">OVERRIDE</th></tr></thead>
                  <tbody>{filteredUsers.map((u) => <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={u.id} onClick={() => setSelectedUser(u)} className="border-b border-gray-800/50 hover:bg-[#00f3ff]/5 cursor-pointer">
                    <td className="py-3 font-medium text-white">{u.username || "UNKNOWN"}<br /><span className="text-[9px] text-gray-600">{u.email || "NO_EMAIL"}</span><br /><span className="text-[8px] text-gray-700">{u.id}</span></td>
                    <td className="uppercase text-[#ff00fc]">{u.role}</td>
                    <td><span className={`px-2 py-1 rounded bg-opacity-20 border ${u.presence_status === "online" ? "bg-green-500 border-green-500/50 text-green-400" : "bg-red-500 border-red-500/50 text-red-400"}`}>{u.presence_status}</span></td>
                    <td className="text-[9px] text-gray-400"><div>{u.company_name || "No company"}</div><div>{u.industry || "No industry"}</div><div>{u.country || "No country"}</div><div className="text-gray-600">{u.verification_status || "unverified"}</div></td>
                    <td className="text-[9px]"><div className="text-white">TOTAL: {u.pitch_decks}</div><div className="text-gray-500">SOLO: {u.solo_pitch_decks}</div><div className="text-gray-500">OPEN BID: {u.open_bid_pitch_decks}</div></td>
                    <td className="text-[9px]"><div>BIDS: {u.investor_bid_decks}</div><div>INTEREST: {u.investor_interests}</div><div>PIPELINE: {u.active_pipeline}</div><div>INVESTMENTS: {u.investments}</div></td>
                    <td className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleModerateUser(u.id, "suspend")} className="p-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black transition border border-yellow-500/20 rounded" title="Suspend"><AlertTriangle size={14} /></button>
                      <button onClick={() => handleModerateUser(u.id, "ban")} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black transition border border-red-500/20 rounded" title="Ban"><Ban size={14} /></button>
                      <button onClick={() => handleModerateUser(u.id, "restore")} className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black transition border border-green-500/20 rounded" title="Restore"><Unlock size={14} /></button>
                      <button onClick={() => handleModerateUser(u.id, "delete")} className="p-1.5 bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white transition border border-gray-700 rounded" title="Purge Data"><Trash2 size={14} /></button>
                    </td>
                  </motion.tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
            <div className="bg-[#050505] border border-[#ff003c]/30 rounded-xl p-4 h-[520px] shadow-[inset_0_0_40px_rgba(255,0,60,0.05)]">
              <h2 className="text-sm font-bold text-[#ff003c] mb-4 flex items-center gap-2 border-b border-[#ff003c]/20 pb-2"><Terminal size={16} /> LIVE TELEMETRY LOG</h2>
              <div className="space-y-2 text-[10px] font-mono overflow-y-auto h-[450px] pr-2">
                {systemLogs.length === 0 ? <span className="text-gray-600 animate-pulse">Awaiting matrix input...</span> : null}
                {systemLogs.map((log) => <div key={log.id} className={`border-b border-gray-900 pb-2 ${log.action.includes("ERROR") ? "text-red-500" : log.action.includes("delete") || log.action.includes("ban") ? "text-yellow-500" : "text-gray-400"}`}>
                  <div className="text-gray-700">{new Date(log.created_at).toISOString()}</div>
                  <div><span className="text-[#ff003c]">{log.admin_email || "SYSTEM"}</span> :: {log.action}</div>
                  <div className="text-gray-600 break-all">UUID: {log.admin_id || "SYSTEM"} → TARGET: {log.target_id || "N/A"}</div>
                  {log.details?.message ? <div className="text-gray-500">{String(log.details.message)}</div> : null}
                </div>)}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#00f3ff]/10 rounded-xl p-4 min-h-[390px]">
              <h2 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><Users size={16} /> ENTITY INSPECTOR</h2>
              {!selectedUser ? <div className="text-[10px] text-gray-700">Select an entity from the management grid.</div> : <EntityInspector user={selectedUser} />}
            </div>

            <div className="bg-[#0a0a0a] border border-[#00f3ff]/10 rounded-xl p-4"><h2 className="text-[11px] font-bold text-gray-400 mb-3">PLATFORM OBSERVATION MATRIX</h2><div className="grid grid-cols-2 gap-2"><Metric label="PROFILE VIEWS" value={metrics.profileViews} /><Metric label="OPPORTUNITY VIEWS" value={metrics.opportunityViews} /><Metric label="ACTIVE DEALS" value={activeDeals} /><Metric label="TOTAL ENTITIES" value={totalUsers} /></div></div>
          </div>
        </div>
      </div>

      {selectedUser ? <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setSelectedUser(null)}><div className="bg-[#0a0a0a] border border-[#00f3ff]/30 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between mb-6"><div><div className="text-[10px] text-gray-600">ENTITY RECORD</div><h3 className="text-white text-lg font-black">{selectedUser.username || selectedUser.email || "UNKNOWN"}</h3></div><button onClick={() => setSelectedUser(null)} className="px-3 py-1.5 border border-gray-700 text-gray-400 rounded text-[10px]">CLOSE</button></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"><Metric label="ROLE" value={selectedUser.role} /><Metric label="STATUS" value={selectedUser.presence_status} /><Metric label="TIER" value={selectedUser.tier || "—"} /><Metric label="VERIFICATION" value={selectedUser.verification_status || "UNVERIFIED"} /><Metric label="PITCH DECKS" value={selectedUser.pitch_decks} /><Metric label="SOLO DECKS" value={selectedUser.solo_pitch_decks} /><Metric label="OPEN BID DECKS" value={selectedUser.open_bid_pitch_decks} /><Metric label="INVESTOR BID DECKS" value={selectedUser.investor_bid_decks} /><Metric label="INTERESTS" value={selectedUser.investor_interests} /><Metric label="ACTIVE PIPELINE" value={selectedUser.active_pipeline} /><Metric label="INVESTMENTS" value={selectedUser.investments} /><Metric label="BID SUBMISSIONS" value={selectedUser.bid_submissions} /><Metric label="PITCH VIEWS" value={selectedUser.pitch_views} /><Metric label="INTEREST RECEIVED" value={selectedUser.pitch_interests_received} /><Metric label="PROFILE" value={selectedUser.profile_completed ? "COMPLETE" : "INCOMPLETE"} /></div><div className="border-t border-gray-900 pt-4 space-y-2 text-[10px]"><div className="text-gray-600">ACCOUNT</div><div className="text-gray-400">EMAIL: {selectedUser.email || "NOT AVAILABLE"}</div><div className="text-gray-400 break-all">UUID: {selectedUser.id}</div><div className="text-gray-400">COMPANY: {selectedUser.company_name || "NOT AVAILABLE"}</div><div className="text-gray-400">INDUSTRY: {selectedUser.industry || "NOT AVAILABLE"}</div><div className="text-gray-400">LOCATION: {[selectedUser.city, selectedUser.country].filter(Boolean).join(", ") || "NOT AVAILABLE"}</div><div className="text-gray-700">CREATED: {new Date(selectedUser.created_at).toISOString()}</div></div></div></div> : null}
    </div>
  );
}

function ChartBox({ title, children }: { title: string; children: ReactNode }) {
  return <div className="bg-[#0a0a0a] border border-[#00f3ff]/10 p-4 rounded-xl h-64"><h2 className="text-[11px] font-bold text-gray-400 mb-2">{title}</h2>{children}</div>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="border border-gray-900 bg-black/30 rounded-lg p-2"><div className="text-[8px] text-gray-600">{label}</div><div className="text-[11px] text-white font-bold truncate">{String(value)}</div></div>;
}

function EntityInspector({ user }: { user: AdminUser }) {
  return <div className="space-y-3 text-[10px]"><div><div className="text-gray-600">IDENTITY</div><div className="text-white break-all">{user.email || "NO EMAIL"}</div><div className="text-gray-600 break-all">{user.id}</div></div><div className="grid grid-cols-2 gap-2"><Metric label="ROLE" value={user.role} /><Metric label="TIER" value={user.tier || "—"} /><Metric label="PROFILE" value={user.profile_completed ? "COMPLETE" : "INCOMPLETE"} /><Metric label="VERIFY" value={user.verification_status || "UNVERIFIED"} /><Metric label="SOLO DECKS" value={user.solo_pitch_decks} /><Metric label="OPEN BID DECKS" value={user.open_bid_pitch_decks} /><Metric label="INVESTOR BIDS" value={user.investor_bid_decks} /><Metric label="INTERESTS" value={user.investor_interests} /><Metric label="PIPELINE" value={user.active_pipeline} /><Metric label="INVESTMENTS" value={user.investments} /><Metric label="BID SUBMISSIONS" value={user.bid_submissions} /><Metric label="PITCH VIEWS" value={user.pitch_views} /><Metric label="INTEREST RECEIVED" value={user.pitch_interests_received} /></div><div className="pt-2 border-t border-gray-900"><div className="text-gray-600 mb-1">ENTITY DETAILS</div><div className="text-gray-400">{user.company_name || "No company registered"}</div><div className="text-gray-500">{user.industry || "No industry"} · {user.country || "No country"}{user.city ? ` · ${user.city}` : ""}</div><div className="text-gray-700 mt-1">CREATED: {new Date(user.created_at).toISOString()}</div></div></div>;
}
