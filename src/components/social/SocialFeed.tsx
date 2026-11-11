// Location: SRC/components/social/SocialFeed.tsx

import PostComposer from "./PostComposer";
import PostCard from "./PostCard";
import { MessageSquare, Lock } from "lucide-react";
import Link from "next/link";
import React from "react";

function formatPostText(content: string) {
  if (!content) return content;
  const parts = content.split(/(#[A-Za-z0-9_]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      const tag = part.substring(1);
      return (
        <Link
          key={index}
          href={`/feed?tag=${tag}`}
          className="text-[var(--accent)] font-bold hover:underline inline-block"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

interface SocialFeedProps {
  initialPosts: any[];
  currentUserId?: string | null;
}

export default function SocialFeed({ initialPosts = [], currentUserId }: SocialFeedProps) {
  const safeUserId = currentUserId ?? undefined;

  return (
    <div className="space-y-6">

      {safeUserId ? (
        <PostComposer />
      ) : (
        <div className="neu-flat-base p-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--secondary)]">
            <Lock size={14} className="text-[var(--accent)]" /> Want to participate in discussions and broadcast updates?
          </div>
          <Link href="/login?next=/feed" className="neu-btn inline-block px-6 py-2.5 text-xs font-bold text-[var(--accent)]">
            Sign In / Register to Post
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2">
          <MessageSquare size={16} className="text-[var(--accent)]" /> Platform Arena Feed
        </h3>
        <span className="text-[10px] text-[var(--secondary)]/50 font-bold uppercase tracking-wider">Live Realtime Updates</span>
      </div>

      <div className="space-y-4">
        {initialPosts.map((post) => {
          const authorData = Array.isArray(post.author) ? post.author[0] : post.author;
          const formattedPost = {
            id: post.id,
            authorName: authorData?.nickname || authorData?.company_name || "Unknown User",
            authorRole: authorData?.role === "investor" ? "Investor" : "Startup Founder",
            tier: authorData?.tier || "freemium",
            timestamp: new Date(post.created_at).toLocaleDateString(),
            content: formatPostText(post.content),
            mediaUrl: post.media_url,
            likesCount: post.likes?.length || 0,
            dislikesCount: post.dislikes?.length || 0,
            repostsCount: 0,
            commentsCount: post.comments?.[0]?.count || 0,
            tags: [],
          };
          return (
            <PostCard
              key={post.id}
              post={formattedPost as any}
              dbPost={post}
              currentUserId={safeUserId}
            />
          );
        })}

        {initialPosts.length === 0 && (
          <div className="neu-flat-base p-12 text-center">
            <p className="text-[var(--secondary)]/50 font-bold text-sm">No posts yet. Be the first to enter the arena.</p>
          </div>
        )}
      </div>
    </div>
  );
}