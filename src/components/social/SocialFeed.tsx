"use client";

import { useState } from "react";
import PostComposer from "./PostComposer";
import PostCard, { Post } from "./PostCard";
import { MessageSquare, Sparkles, Filter } from "lucide-react";

export default function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "p1",
      authorName: "Sarah Jenkins",
      authorRole: "VC Partner",
      tier: "platinum",
      timestamp: "2 hours ago",
      content: "Evaluating AI infrastructure startups specializing in local agentic orchestration. We are seeing major shifts away from centralized LLM endpoints toward localized edge deployment for compliance & zero latency. DMs open for founders in Seed stage!",
      likesCount: 24,
      repostsCount: 5,
      commentsCount: 8,
      tags: ["VentureCapital", "AgenticAI", "DeepTech"],
    },
    {
      id: "p2",
      authorName: "Alex Rivera",
      authorRole: "Startup Founder",
      tier: "gold",
      timestamp: "5 hours ago",
      content: "Just crossed $15k MRR on NexusAI SDK with 45 Enterprise accounts! Huge milestone for our founding team. Raising our $250k Seed allocation on Gestalt Arena now.",
      likesCount: 42,
      repostsCount: 12,
      commentsCount: 14,
      tags: ["Milestone", "B2BSaaS", "Fundraising"],
    },
    {
      id: "p3",
      authorName: "David Sterling",
      authorRole: "Investor",
      tier: "freemium",
      timestamp: "1 day ago",
      content: "Excited to join Gestalt Arena window-shopping marketplace. Looking to connect with healthcare robotics and telemetry founders.",
      likesCount: 11,
      repostsCount: 2,
      commentsCount: 3,
      tags: ["AngelInvestor", "HealthTech"],
    },
  ]);

  const handlePostCreated = (newContent: string) => {
    const newPost: Post = {
      id: `p-${Date.now()}`,
      authorName: "You (Active User)",
      authorRole: "Startup Founder",
      tier: "gold",
      timestamp: "Just now",
      content: newContent,
      likesCount: 0,
      repostsCount: 0,
      commentsCount: 0,
      tags: ["GestaltArena"],
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="space-y-6">
      {/* Post Creation Area */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* Feed Filters Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare size={16} className="text-cyan-400" /> Platform Arena Feed
        </h3>
        <span className="text-xs text-slate-400">Live Realtime Updates</span>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
