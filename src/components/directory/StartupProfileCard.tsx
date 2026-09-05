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
    <div className="neu-flat-base flex flex-col h-full p-6 rounded-3xl transition-all hover:-translate-y-1">

      {/* Top Header Row */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="neu-pressed-base border-transparent shadow-inner px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-[var(--accent)]">
              {startup.industry}
            </span>
            {startup.verified && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} /> Verified
              </span>
            )}
          </div>
          <h3 className="font-black text-[var(--secondary)] text-lg line-clamp-1">{startup.name}</h3>
          <p className="text-xs text-[var(--accent)] font-bold line-clamp-1 mt-0.5">{startup.tagline}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-mono text-emerald-600 font-black bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 block mb-1">
            Ask: {typeof startup.requiredFunding === "number" ? `$${startup.requiredFunding.toLocaleString()}` : startup.requiredFunding}
          </span>
        </div>
      </div>

      {/* Main Pitch Summary */}
      <p className="text-sm font-medium text-[var(--secondary)]/70 line-clamp-3 leading-relaxed mt-4 mb-4 flex-grow">
        {startup.pitchSummary}
      </p>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--secondary)]/10">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--secondary)]/60 font-bold uppercase tracking-wider truncate">
          <MapPin size={12} className="text-[var(--accent)] shrink-0" /> {startup.location}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--secondary)]/60 font-bold uppercase tracking-wider truncate">
          <Users size={12} className="text-[var(--accent)] shrink-0" /> {startup.teamSize} Employees
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--secondary)]/10 mt-4">
        <Link
          href={`/profile/${startup.id}`}
          className="neu-btn flex-1 flex justify-center items-center gap-1.5 py-2.5 text-xs"
        >
          <User size={14} /> View Profile
        </Link>

        {startup.pitchDeckId ? (
          <Link
            href={`/startup/${startup.pitchDeckId}/pitch`}
            className="neu-pressed-base border-transparent shadow-inner flex-1 flex justify-center items-center gap-1.5 py-2.5 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/5 transition"
          >
            <FileText size={14} /> View Pitch Deck
          </Link>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-[var(--secondary)]/40 cursor-not-allowed bg-[var(--secondary)]/5 rounded-xl border border-transparent shadow-inner">
            <FileText size={14} /> No Deck
          </div>
        )}
      </div>
    </div>
  );
}