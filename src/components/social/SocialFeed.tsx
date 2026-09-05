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

  // Added dislikes fetch array. Ensure the dislikes table is created!
  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles(*),
        likes(id, user_id),
        dislikes(id, user_id),
        bookmarks(id, user_id),
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

      const channel = supabase
        .channel('public:posts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
          fetchPosts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [authLoading, session, fetchPosts]);

  const handlePostCreated = async (newContent: string) => {
    if (!session?.user) return;

    const { error } = await supabase.from("posts").insert({
      author_id: session.user.id,
      content: newContent,
    }).select();

    if (!error) {
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

      <PostComposer onPostCreated={handlePostCreated} />

      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2">
          <MessageSquare size={16} className="text-[var(--accent)]" /> Platform Arena Feed
        </h3>
        <span className="text-[10px] text-[var(--secondary)]/50 font-bold uppercase tracking-wider">Live Realtime Updates</span>
      </div>

      <div className="space-y-4">
        {posts.map((post) => {
          const formattedPost = {
            id: post.id,
            authorName: post.author?.nickname || post.author?.company_name || "Unknown User",
            authorRole: post.author?.role === "investor" ? "Investor" : "Startup Founder",
            tier: post.author?.tier || "freemium",
            timestamp: new Date(post.created_at).toLocaleDateString(),
            content: post.content,
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
              currentUserId={session?.user?.id}
              onUpdate={fetchPosts}
            />
          );
        })}

        {posts.length === 0 && (
          <div className="neu-flat-base p-12 text-center">
            <p className="text-[var(--secondary)]/50 font-bold text-sm">No posts yet. Be the first to enter the arena.</p>
          </div>
        )}
      </div>
    </div>
  );
}