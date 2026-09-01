"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { UserProfile } from "@/types/user";

export default function OnboardingWrapper() {
  const { session, loading } = useAuth();
  const router = useRouter();
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
    return () => { mounted = false; };
  }, [session, loading]);

  useEffect(() => {
    if (!profileLoading && profile && !profile.profile_completed) {
      if (profile.role === "investor") {
        router.push("/investor/dashboard"); // Route to dedicated investor builder
      } else if (profile.role === "startup") {
        router.push("/startup/dashboard"); // Route to dedicated startup builder
      }
    }
  }, [profile, profileLoading, router]);

  return null;
}