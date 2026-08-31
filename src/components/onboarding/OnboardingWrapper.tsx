"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import OnboardingModal from "./OnboardingModal";
import { UserProfile } from "@/types/user";

export default function OnboardingWrapper() {
  const { session, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (loading || !session?.user) return;

    let mounted = true;
    setProfileLoading(true);

    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session!.user.id)
        .single();

      if (mounted) {
        if (!error && data) {
          setProfile(data as UserProfile);
        }
        setProfileLoading(false);
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [session, loading]);

  if (loading || profileLoading || !session?.user || !profile) {
    return null; // or a tiny loading indicator
  }

  // If profile isn't completed, show the modal
  if (!(profile as any).profile_completed) {
    return <OnboardingModal user={session.user} profile={profile} />;
  }

  return null;
}
