export type UserRole =
  | "investor"
  | "startup"
  | "admin";

export interface UserProfile {
  // Existing fields
  id: string;
  nickname: string;
  email: string;
  role: UserRole;
  country: string;
  state: string;
  city: string;

  // Shared new fields
  profile_completed?: boolean;
  bio?: string;

  // Startup fields
  company_name?: string;
  elevator_pitch?: string;
  traction?: string;
  funding_goal?: string;
  stage?: string;
  pitch_deck_url?: string;

  // Investor fields
  investment_thesis?: string;
  ticket_size?: string;
  preferred_stages?: string[];
  industries_of_interest?: string[];
  firm_details?: string;
}