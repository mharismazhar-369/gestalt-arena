"use client";

import { useState, useEffect, useCallback } from "react";
import PostComposer from "./PostComposer";
import PostCard from "./PostCard";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";

export default function SocialFeed() {
  const { session, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Wrap in useCallback to prevent stale closures in the real-time subscription
  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles(*),
        likes(id, user_id),
        comments(count)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && session) {
      fetchPosts();

      // Subscribe to real-time inserts on the posts table
      const channel = supabase
        .channel('public:posts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
          // Re-fetch posts when a new one is inserted
          fetchPosts();
        })
        .subscribe();

      // Cleanup on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [authLoading, session, fetchPosts]);

  const handlePostCreated = async (newContent: string) => {
    if (!session?.user) return;

    // 2. Add .select() so PostgREST forces the DB to wait for the row to be fully inserted and readable
    const { error } = await supabase.from("posts").insert({
      author_id: session.user.id,
      content: newContent,
    }).select();

    if (!error) {
      // 3. Await the fetch to ensure sequential state updates
      await fetchPosts();
    } else {
      console.error("Failed to post to feed:", error.message);
    }
  };

  if (authLoading || loading) {
    return <RoleRoutingLoader message="Loading Live Feed..." />;
  }

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
        {posts.map((post) => {
          // Map DB schema to PostCard expected props
          const formattedPost = {
            id: post.id,
            authorName: post.author?.nickname || post.author?.company_name || "Unknown User",
            authorRole: post.author?.role === "investor" ? "Investor" : "Startup Founder",
            tier: "gold" as any, // Hardcoded tier or map from DB if available
            timestamp: new Date(post.created_at).toLocaleDateString(),
            content: post.content,
            likesCount: post.likes?.length || 0,
            repostsCount: 0,
            commentsCount: post.comments?.[0]?.count || 0,
            tags: [],
          };
          return (
            <PostCard
              key={post.id}
              post={formattedPost as any}
              dbPost={post}
              currentUserId={session?.user?.id}
              onUpdate={fetchPosts}
            />
          );
        })}

        {posts.length === 0 && (
          <div className="text-center p-12 border border-white/10 bg-white/5 rounded-3xl backdrop-blur-xl">
            <p className="text-zinc-400">No posts yet. Be the first to enter the arena.</p>
          </div>
        )}
      </div>
    </div>
  );
}