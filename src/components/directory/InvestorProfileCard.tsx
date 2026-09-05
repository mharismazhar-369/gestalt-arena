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
    <div className="neu-flat-base flex flex-col justify-between p-6 rounded-3xl transition-all hover:-translate-y-1 h-full">

      {/* Top Header Row - Tags and Tier */}
      <div className="flex justify-between items-start">
        <div className="flex gap-2 flex-wrap">
          <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full text-[var(--accent)]">
            {investor.type}
          </span>
          {investor.verified && (
            <span className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-600">
              <ShieldCheck size={12} /> Verified
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-[var(--secondary)]/50 uppercase tracking-wider border border-[var(--secondary)]/10 px-3 py-1 rounded-full">
          {investor.tier} Tier
        </span>
      </div>

      {/* Main Content - Name, Location, Description */}
      <div className="space-y-3 mt-4 flex-grow">
        <div className="flex justify-between items-start group">
          <h3 className="text-xl md:text-2xl font-black text-[var(--secondary)] group-hover:text-[var(--accent)] transition line-clamp-1">
            {investor.name}
          </h3>
          <ExternalLink size={16} className="text-[var(--secondary)]/40 group-hover:text-[var(--accent)] transition flex-shrink-0 mt-1" />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-[var(--secondary)]/60">
          <span className="flex items-center gap-1"><MapPin size={12} className="text-[var(--accent)]" /> {investor.location}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Briefcase size={12} className="text-[var(--accent)]" /> {investor.portfolioCount} Investments</span>
        </div>

        <p className="text-sm text-[var(--secondary)]/70 font-medium leading-relaxed line-clamp-3">
          {investor.description}
        </p>

        {/* Sector / Stage Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[...investor.sectors, ...investor.stageFocus].slice(0, 4).map((tag, i) => (
            <span key={i} className="px-2 py-1 rounded-md neu-pressed-base border-transparent shadow-inner text-[10px] font-bold text-[var(--secondary)]/70 whitespace-nowrap">
              {tag}
            </span>
          ))}
          {investor.sectors.length + investor.stageFocus.length > 4 && (
            <span className="px-2 py-1 rounded-md neu-pressed-base border-transparent shadow-inner text-[10px] font-bold text-[var(--secondary)]/50">
              +{investor.sectors.length + investor.stageFocus.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between border-t border-[var(--secondary)]/10 pt-4 mt-6">
        <div className="space-y-1">
          <span className="text-[10px] text-[var(--secondary)]/50 font-bold uppercase tracking-wider block">Ticket Size Range</span>
          <div className="flex items-baseline gap-1 text-[var(--accent)] font-black text-sm">
            {investor.investmentRange}
          </div>
        </div>

        <Link
          href={`/profile/${investor.id}`}
          className="neu-btn flex justify-center items-center gap-1.5 px-4 py-2 text-xs"
        >
          <User size={14} /> View Profile
        </Link>
      </div>
    </div>
  );
}