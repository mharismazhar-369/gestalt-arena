export type UserRole =
  | "investor"
  | "startup"
  | "admin";

export interface UserProfile {
  id: string;

  nickname: string;

  email: string;

  role: UserRole;

  country: string;

  state: string;

  city: string;
}