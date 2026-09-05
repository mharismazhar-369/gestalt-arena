"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface CommentBoxProps {
  postId: string;
  currentUserId?: string;
  postOwnerId?: string; // Required for notifications
  onCommentAdded?: () => void;
}

export default function CommentBox({ postId, currentUserId, postOwnerId, onCommentAdded }: CommentBoxProps) {
  const [comment, setComment] = useState("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoadingComments(true);
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id, content, created_at, author_id,
        author:profiles(nickname, company_name, role)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data && !error) setCommentsList(data);
    setLoadingComments(false);
  };

  const submitComment = async () => {
    if (!currentUserId) return setErrorMsg("You must be signed in to comment.");
    if (!comment.trim()) return setErrorMsg("Comment cannot be empty.");

    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: currentUserId,
      content: comment.trim(),
    });

    if (error) {
      setErrorMsg("Failed to post comment: " + error.message);
      setLoading(false);
      return;
    }

    // Trigger Notification to Post Owner with reference_id for clickable links
    if (postOwnerId && postOwnerId !== currentUserId) {
      await supabase.from("notifications").insert({
        user_id: postOwnerId,
        actor_id: currentUserId,
        type: "comment",
        message: "commented on your post.",
        reference_id: postId
      });
    }

    setComment("");
    fetchComments();
    if (onCommentAdded) onCommentAdded();
    setLoading(false);
  };

  return (
    <div className="mt-4 border-t border-[var(--secondary)]/10 pt-4 space-y-4">
      {loadingComments ? (
        <p className="text-xs text-[var(--secondary)]/50 font-bold">Loading comments...</p>
      ) : commentsList.length > 0 ? (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {commentsList.map((c) => {
            const authorName = c.author?.nickname || c.author?.company_name || "Arena Member";
            return (
              <div key={c.id} className="neu-pressed-base border-transparent p-3 text-sm space-y-1 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--secondary)] text-[11px] uppercase tracking-wider">{authorName}</span>
                  <span className="text-[10px] text-[var(--secondary)]/50 font-bold">
                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[var(--secondary)]/80 leading-relaxed font-medium">{c.content}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[var(--secondary)]/50 font-medium">No comments yet. Step into the arena and be the first!</p>
      )}

      <div>
        {errorMsg && <p className="text-xs text-rose-600 mb-1 font-bold">{errorMsg}</p>}
        <textarea
          rows={2}
          className="w-full rounded-xl border-transparent bg-transparent p-3 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/50 focus:outline-none transition resize-none neu-pressed-base shadow-inner font-medium"
          placeholder="Write your thoughts..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={submitComment}
            className="neu-btn px-4 py-1.5 text-xs disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>
    </div>
  );
}