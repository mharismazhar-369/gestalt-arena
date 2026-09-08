"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ShieldAlert, Activity, Users, Ban, Trash2, Unlock, AlertTriangle, Terminal } from "lucide-react";
import { motion } from "framer-motion";

// --- Types based on your Schema ---
type AdminUser = {
  id: string;
  username: string | null;
  role: string;
  presence_status: string;
  created_at: string;
};

type TrafficData = { name: string; feed: number; investors: number; startups: number; articles: number };

export default function GestaltCommandCenter() {
  const { session } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeDeals, setActiveDeals] = useState(0);

  // --- Backend Data Fetching & Subscriptions ---
  useEffect(() => {
    fetchSystemTelemetry();

    // Properly instantiate and store the channel for cleanup
    const telemetryChannel = supabase
      .channel('admin-telemetry')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload: any) => {
        setSystemLogs(prev => [`[SYSTEM] Profile ${payload.eventType}: ${payload.new?.id || payload.old?.id}`, ...prev].slice(0, 15));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deal_negotiations' }, (payload: any) => {
        setSystemLogs(prev => [`[DEAL] New Negotiation Initiated: ${payload.new?.id}`, ...prev].slice(0, 15));
      });

    // Subscribe once
    telemetryChannel.subscribe();

    // Cleanup function removes the channel when the component unmounts
    return () => {
      supabase.removeChannel(telemetryChannel);
    };
  }, []);

  const fetchSystemTelemetry = async () => {
    // 1. Fetch Users for Moderation Panel
    const { data: profiles } = await supabase.from("profiles").select("id, username, role, presence_status, created_at").limit(50);
    if (profiles) setUsers(profiles);

    // 2. Fetch Aggregated Metrics
    const { count: uCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    setTotalUsers(uCount || 0);

    const { count: dCount } = await supabase.from("deal_negotiations").select("*", { count: "exact", head: true }).neq("status", "Cancelled");
    setActiveDeals(dCount || 0);

    // 3. Mocked Traffic Aggregation
    setTraffic([
      { name: "00:00", feed: 120, investors: 45, startups: 80, articles: 200 },
      { name: "04:00", feed: 80, investors: 30, startups: 50, articles: 150 },
      { name: "08:00", feed: 400, investors: 200, startups: 300, articles: 600 },
      { name: "12:00", feed: 850, investors: 450, startups: 600, articles: 900 },
      { name: "16:00", feed: 600, investors: 350, startups: 500, articles: 750 },
      { name: "20:00", feed: 300, investors: 150, startups: 200, articles: 400 },
    ]);
  };

  const addLog = (msg: string) => {
    setSystemLogs(prev => [msg, ...prev].slice(0, 15));
  };

  // --- Moderation Actions ---
  const handleModerateUser = async (userId: string, action: 'ban' | 'suspend' | 'restore' | 'delete') => {
    if (!window.confirm(`EXECUTE ${action.toUpperCase()} ON USER ${userId}?`)) return;

    try {
      if (action === 'delete') {
        addLog(`[WARN] Initiating hard delete for ${userId}`);
        await supabase.from("profiles").delete().eq("id", userId);
      } else {
        const newStatus = action === 'ban' ? 'banned' : action === 'suspend' ? 'suspended' : 'online';

        // 1. Update Profile Status
        await supabase.from("profiles").update({ presence_status: newStatus }).eq("id", userId);

        // 2. Dispatch System Notification to User
        if (session?.user?.id) {
          const message = action === 'ban' ? 'Your account has been permanently banned for violating platform guidelines.'
            : action === 'suspend' ? 'Your account has been temporarily suspended pending an administrative review.'
              : 'Your account access has been fully restored. Welcome back to the Arena.';

          await supabase.from("notifications").insert({
            user_id: userId,
            actor_id: session.user.id, // The Admin's ID
            type: "system_alert",
            message: message
          });
        }

        addLog(`[MOD] User ${userId} status updated to ${newStatus}`);
      }
      fetchSystemTelemetry();
    } catch (e: any) {
      addLog(`[ERROR] Execution failed: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00f3ff] font-mono selection:bg-[#00f3ff] selection:text-black overflow-hidden flex flex-col">
      {/* Top Telemetry Bar */}
      <header className="h-16 border-b border-[#00f3ff]/20 bg-[#0a0a0a] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-[#ff003c]" />
          <h1 className="text-xl font-black tracking-widest text-white uppercase">Gestalt <span className="text-[#00f3ff]">Command</span></h1>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex gap-8 text-xs font-bold tracking-wider">
            <div className="flex flex-col"><span className="text-gray-500">SYS_STATUS</span><span className="text-green-400">OPTIMAL</span></div>
            <div className="flex flex-col"><span className="text-gray-500">TOTAL_ENTITIES</span><span>{totalUsers}</span></div>
            <div className="flex flex-col"><span className="text-gray-500">ACTIVE_DEALS</span><span>{activeDeals}</span></div>
          </div>

          <Link
            href="/feed"
            className="ml-4 px-4 py-2 border border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-300 rounded-lg text-[10px] font-black tracking-widest uppercase transition"
          >
            Exit Matrix
          </Link>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">

        {/* Left Column: Metrics & Traffic */}
        <div className="col-span-8 flex flex-col gap-6">
          <div className="bg-[#0a0a0a] border border-[#00f3ff]/10 p-4 rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.05)] h-96 flex flex-col">
            <h2 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><Activity size={16} /> SECTOR TRAFFIC MATRIX (24H)</h2>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={traffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                <XAxis dataKey="name" stroke="#555" tick={{ fontSize: 10 }} />
                <YAxis stroke="#555" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00f3ff', color: '#fff' }} />
                <Line type="monotone" dataKey="feed" stroke="#00f3ff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="articles" stroke="#ff00fc" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="investors" stroke="#00ff88" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Management Grid */}
          <div className="bg-[#0a0a0a] border border-[#00f3ff]/10 p-4 rounded-xl flex-1 overflow-hidden flex flex-col">
            <h2 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><Users size={16} /> ENTITY MANAGEMENT PROTOCOL</h2>
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#0a0a0a] text-gray-500 border-b border-[#00f3ff]/20">
                  <tr>
                    <th className="py-2">UUID / ALIAS</th>
                    <th>ROLE</th>
                    <th>STATUS</th>
                    <th className="text-right">OVERRIDE</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={u.id} className="border-b border-gray-800/50 hover:bg-[#00f3ff]/5">
                      <td className="py-3 font-medium text-white">{u.username || 'UNKNOWN'}<br /><span className="text-[9px] text-gray-600">{u.id}</span></td>
                      <td className="uppercase text-[#ff00fc]">{u.role}</td>
                      <td>
                        <span className={`px-2 py-1 rounded bg-opacity-20 border ${u.presence_status === 'online' ? 'bg-green-500 border-green-500/50 text-green-400' : 'bg-red-500 border-red-500/50 text-red-400'}`}>
                          {u.presence_status}
                        </span>
                      </td>
                      <td className="text-right space-x-2">
                        <button onClick={() => handleModerateUser(u.id, 'suspend')} className="p-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black transition border border-yellow-500/20 rounded" title="Suspend"><AlertTriangle size={14} /></button>
                        <button onClick={() => handleModerateUser(u.id, 'ban')} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black transition border border-red-500/20 rounded" title="Ban"><Ban size={14} /></button>
                        <button onClick={() => handleModerateUser(u.id, 'restore')} className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black transition border border-green-500/20 rounded" title="Restore"><Unlock size={14} /></button>
                        <button onClick={() => handleModerateUser(u.id, 'delete')} className="p-1.5 bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white transition border border-gray-700 rounded" title="Purge Data"><Trash2 size={14} /></button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Terminal & Logs */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-[#050505] border border-[#ff003c]/30 rounded-xl p-4 flex-1 shadow-[inset_0_0_40px_rgba(255,0,60,0.05)]">
            <h2 className="text-sm font-bold text-[#ff003c] mb-4 flex items-center gap-2 border-b border-[#ff003c]/20 pb-2">
              <Terminal size={16} /> LIVE TELEMETRY LOG
            </h2>
            <div className="space-y-2 text-[10px] font-mono">
              {systemLogs.length === 0 ? <span className="text-gray-600 animate-pulse">Awaiting matrix input...</span> : null}
              {systemLogs.map((log, i) => (
                <div key={i} className={`${log.includes('[ERROR]') ? 'text-red-500' : log.includes('[WARN]') ? 'text-yellow-500' : 'text-gray-400'}`}>
                  <span className="opacity-50">{new Date().toISOString().split('T')[1].slice(0, -1)}</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}