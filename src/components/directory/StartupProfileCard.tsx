import Link from "next/link";
import { MapPin, Users, CheckCircle2, FileText, User } from "lucide-react";

export interface Startup {
  id: string; // The User UUID
  name: string;
  tagline: string;
  industry: string;
  stage: string;
  requiredFunding: string | number;
  valuation: string | number;
  location: string;
  teamSize: string | number;
  pitchSummary: string;
  tags: string[];
  verified: boolean;
  tier: "freemium" | "gold" | "platinum";
  pitchDeckId?: string | null; // Used to conditionally render the pitch button
}

export default function StartupProfileCard({ startup }: { startup: Startup }) {
  return (
    <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-4 hover:border-violet-500/40 transition flex flex-col h-full shadow-lg bg-black/40">
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {startup.industry}
            </span>
            {startup.verified && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 size={12} /> Verified
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-lg line-clamp-1">{startup.name}</h3>
          <p className="text-xs text-cyan-400 font-medium line-clamp-1">{startup.tagline}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 block mb-1">
            Ask: {typeof startup.requiredFunding === "number" ? `$${startup.requiredFunding.toLocaleString()}` : startup.requiredFunding}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed flex-grow">
        {startup.pitchSummary}
      </p>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
          <MapPin size={12} className="text-violet-400 shrink-0" /> {startup.location}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
          <Users size={12} className="text-cyan-400 shrink-0" /> {startup.teamSize} Employees
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10 mt-auto">
        <Link
          href={`/profile/${startup.id}`}
          className="flex-1 flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition"
        >
          <User size={14} /> View Profile
        </Link>

        {startup.pitchDeckId && (
          <Link
            href={`/startup/${startup.pitchDeckId}/pitch`}
            className="flex-1 flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-xs font-bold text-violet-300 border border-violet-500/30 transition"
          >
            <FileText size={14} /> View Pitch Deck
          </Link>
        )}
      </div>
    </div>
  );
}