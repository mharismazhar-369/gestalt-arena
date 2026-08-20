import { supabase } from "@/lib/supabase/client";

export async function getCurrentSession() {
  return supabase.auth.getSession();
}

export async function getCurrentUser() {
  return supabase.auth.getUser();
}

export async function signOut() {
  return supabase.auth.signOut();
}