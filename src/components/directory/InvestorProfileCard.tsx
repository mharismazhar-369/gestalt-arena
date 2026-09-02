import Link from "next/link";
import { CheckCircle, MapPin, Briefcase, ExternalLink, ShieldCheck, User } from "lucide-react";

export interface Investor {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  investmentRange: string;
  stageFocus: string[];
  sectors: string[];
  portfolioCount: number;
  tier: string;
  verified: boolean;
}

export default function InvestorProfileCard({ investor }: { investor: Investor }) {
  return (
    <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 shadow-xl space-y-4 hover:border-cyan-400/50 transition group flex flex-col justify-between h-full relative overflow-hidden bg-black/40">

      {/* Top Header Row - Tags and Tier */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex gap-2">
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {investor.type}
          </span>
          {investor.verified && (
            <span className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck size={12} /> Verified
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-white/10 px-3 py-1 rounded-full">
          {investor.tier} Tier
        </span>
      </div>

      {/* Main Content - Name, Location, Description */}
      <div className="space-y-3 relative z-10 flex-grow">
        <div className="flex justify-between items-start group">
          <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-cyan-300 transition line-clamp-1">
            {investor.name}
          </h3>
          <ExternalLink size={16} className="text-slate-600 group-hover:text-cyan-400 transition flex-shrink-0 mt-1" />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-400" /> {investor.location}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Briefcase size={12} className="text-violet-400" /> {investor.portfolioCount} Investments</span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
          {investor.description}
        </p>

        {/* Sector / Stage Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[...investor.sectors, ...investor.stageFocus].slice(0, 4).map((tag, i) => (
            <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 whitespace-nowrap">
              {tag}
            </span>
          ))}
          {investor.sectors.length + investor.stageFocus.length > 4 && (
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500">
              +{investor.sectors.length + investor.stageFocus.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4 relative z-10">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ticket Size Range</span>
          <div className="flex items-baseline gap-1 text-cyan-400 font-black text-sm">
            {investor.investmentRange}
          </div>
        </div>

        <Link
          href={`/profile/${investor.id}`}
          className="flex justify-center items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10 shadow-lg"
        >
          <User size={14} /> View Profile
        </Link>
      </div>
    </div>
  );
}