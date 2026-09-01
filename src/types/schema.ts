export interface StartupProfile {
  profile_id: string;
  company_name?: string;
  website?: string;
  industry?: string;
  founded_year?: number;
  employee_count?: string;
  business_model?: string;
  headquarters?: string;
  description?: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export interface InvestorProfile {
  profile_id: string;
  firm_name?: string;
  website?: string;
  firm_type?: string;
  assets_under_management?: string;
  investment_thesis?: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export interface FundraisingOpportunity {
  id: string;
  startup_id: string;
  title: string;
  description?: string;
  funding_goal?: number;
  amount_raised: number;
  minimum_ticket?: number;
  valuation?: number;
  equity_offered?: number;
  stage?: string;
  status: 'draft' | 'active' | 'closed';
  pitch_deck_url?: string;
  use_of_funds?: string;
  traction_summary?: string;
  revenue?: number;
  growth_rate?: string;
  burn_rate?: number;
  runway_months?: number;
  created_at: string;
  updated_at: string;
}

export interface InvestorPreferences {
  id: string;
  investor_id: string;
  min_ticket?: number;
  max_ticket?: number;
  preferred_stages?: string[];
  industries?: string[];
  geographies?: string[];
  business_models?: string[];
  investment_types?: string[];
  lead_investment?: boolean;
  follow_on?: boolean;
  created_at: string;
  updated_at: string;
}
