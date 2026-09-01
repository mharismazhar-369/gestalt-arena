"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export type TierType = "freemium" | "gold" | "platinum";

export interface TierCapabilities {
  name: string;
  maxPostsPer24h: number;
  maxCharsPerPost: number;
  maxArticlesPerDay: number;
  investmentCap: number;
  canDirectMessage: boolean;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const TIER_CAPABILITIES: Record<TierType, TierCapabilities> = {
  freemium: {
    name: "Freemium",
    maxPostsPer24h: 20,
    maxCharsPerPost: 500,
    maxArticlesPerDay: 0,
    investmentCap: 0,
    canDirectMessage: false,
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    textColor: "text-cyan-400",
  },
  gold: {
    name: "Gold Tier",
    maxPostsPer24h: 50,
    maxCharsPerPost: 1000,
    maxArticlesPerDay: 5,
    investmentCap: 50000,
    canDirectMessage: true,
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/40",
    textColor: "text-amber-400",
  },
  platinum: {
    name: "Platinum Tier",
    maxPostsPer24h: 9999,
    maxCharsPerPost: 5000,
    maxArticlesPerDay: 9999,
    investmentCap: 999999999,
    canDirectMessage: true,
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/50",
    textColor: "text-violet-400",
  },
};

interface UserTierContextType {
  tier: TierType;
  capabilities: TierCapabilities;
  setTier: (tier: TierType) => Promise<void>;
  postsToday: number;
  articlesToday: number;
  incrementPostCount: () => boolean;
  incrementArticleCount: () => boolean;
  canPostMore: boolean;
  canPublishArticle: boolean;
}

const UserTierContext = createContext<UserTierContextType | undefined>(undefined);

export function UserTierProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [tier, setTierState] = useState<TierType>("freemium");
  const [postsToday, setPostsToday] = useState(0);
  const [articlesToday, setArticlesToday] = useState(0);

  // Synchronize tier with Supabase Database on load
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUserTier = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", session.user.id)
        .single();

      if (data?.tier) {
        setTierState(data.tier as TierType);
      }
    };

    fetchUserTier();
  }, [session]);

  // Update local state AND save to Database simultaneously
  const setTier = async (newTier: TierType) => {
    setTierState(newTier);
    if (session?.user?.id) {
      await supabase
        .from("profiles")
        .update({ tier: newTier })
        .eq("id", session.user.id);
    }
  };

  const capabilities = TIER_CAPABILITIES[tier];
  const canPostMore = postsToday < capabilities.maxPostsPer24h;
  const canPublishArticle = articlesToday < capabilities.maxArticlesPerDay;

  const incrementPostCount = () => {
    if (!canPostMore) return false;
    setPostsToday((prev) => prev + 1);
    return true;
  };

  const incrementArticleCount = () => {
    if (!canPublishArticle) return false;
    setArticlesToday((prev) => prev + 1);
    return true;
  };

  return (
    <UserTierContext.Provider value={{
      tier,
      capabilities,
      setTier,
      postsToday,
      articlesToday,
      incrementPostCount,
      incrementArticleCount,
      canPostMore,
      canPublishArticle
    }}>
      {children}
    </UserTierContext.Provider>
  );
}

export const useUserTier = () => {
  const context = useContext(UserTierContext);
  if (context === undefined) {
    throw new Error("useUserTier must be used within a UserTierProvider");
  }
  return context;
};