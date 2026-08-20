"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type TierType = "freemium" | "gold" | "platinum";

export interface TierCapabilities {
  name: string;
  badgeLabel: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  glowClass: string;
  maxPostsPer24h: number;
  maxCharsPerPost: number; // 500 for Freemium, 1000 for Gold, 5000 for Platinum
  maxArticlesPerDay: number; // 0 for Freemium, 5 for Gold, unlimited (-1) for Platinum
  maxInvestmentLimit: string; // "N/A" for Freemium, "$50,000" for Gold, "Unlimited" for Platinum
  canInteract: boolean;
  canPublishArticles: boolean;
  unlimitedAccess: boolean;
}

export const TIER_CONFIG: Record<TierType, TierCapabilities> = {
  freemium: {
    name: "Freemium",
    badgeLabel: "Free Member",
    color: "cyan",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-400",
    glowClass: "trionn-glow-cyan",
    maxPostsPer24h: 20,
    maxCharsPerPost: 500,
    maxArticlesPerDay: 0,
    maxInvestmentLimit: "N/A",
    canInteract: false,
    canPublishArticles: false,
    unlimitedAccess: false,
  },
  gold: {
    name: "Gold Tier",
    badgeLabel: "Gold Partner",
    color: "amber",
    borderColor: "border-amber-500/40",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    glowClass: "trionn-glow-gold",
    maxPostsPer24h: 50,
    maxCharsPerPost: 1000,
    maxArticlesPerDay: 5,
    maxInvestmentLimit: "$50,000",
    canInteract: true,
    canPublishArticles: true,
    unlimitedAccess: false,
  },
  platinum: {
    name: "Platinum Tier",
    badgeLabel: "Platinum Elite",
    color: "violet",
    borderColor: "border-violet-500/50",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-400",
    glowClass: "trionn-glow-violet",
    maxPostsPer24h: 9999, // unlimited
    maxCharsPerPost: 5000,
    maxArticlesPerDay: 9999, // unlimited
    maxInvestmentLimit: "Unlimited",
    canInteract: true,
    canPublishArticles: true,
    unlimitedAccess: true,
  },
};

interface UserTierContextType {
  tier: TierType;
  setTier: (tier: TierType) => void;
  capabilities: TierCapabilities;
  postsToday: number;
  incrementPostCount: () => boolean;
  articlesToday: number;
  incrementArticleCount: () => boolean;
  canPostMore: boolean;
  canPublishArticleMore: boolean;
}

const UserTierContext = createContext<UserTierContextType | undefined>(undefined);

export function UserTierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<TierType>("freemium");
  const [postsToday, setPostsToday] = useState<number>(3); // sample starting post count
  const [articlesToday, setArticlesToday] = useState<number>(1); // sample starting article count

  const capabilities = TIER_CONFIG[tier];

  const canPostMore = postsToday < capabilities.maxPostsPer24h;
  const canPublishArticleMore = capabilities.canPublishArticles && 
    (capabilities.maxArticlesPerDay >= 9999 || articlesToday < capabilities.maxArticlesPerDay);

  const incrementPostCount = (): boolean => {
    if (!canPostMore) return false;
    setPostsToday((prev) => prev + 1);
    return true;
  };

  const incrementArticleCount = (): boolean => {
    if (!canPublishArticleMore) return false;
    setArticlesToday((prev) => prev + 1);
    return true;
  };

  return (
    <UserTierContext.Provider
      value={{
        tier,
        setTier,
        capabilities,
        postsToday,
        incrementPostCount,
        articlesToday,
        incrementArticleCount,
        canPostMore,
        canPublishArticleMore,
      }}
    >
      {children}
    </UserTierContext.Provider>
  );
}

export function useUserTier() {
  const context = useContext(UserTierContext);
  if (!context) {
    throw new Error("useUserTier must be used within a UserTierProvider");
  }
  return context;
}
