"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface CommentBoxProps {
  postId: string;
  currentUserId?: string;
  onCommentAdded?: () => void;
}

export default function CommentBox({ postId, currentUserId, onCommentAdded }: CommentBoxProps) {
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

    // Fetch comments and left-join profiles safely
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        author_id,
        author:profiles(nickname, company_name, role)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data && !error) {
      setCommentsList(data);
    } else {
      console.error("Error fetching comments:", error?.message);
    }
    setLoadingComments(false);
  };

  const submitComment = async () => {
    if (!currentUserId) {
      setErrorMsg("You must be signed in to comment.");
      return;
    }
    if (!comment.trim()) {
      setErrorMsg("Comment cannot be empty.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: currentUserId,
      content: comment.trim(),
    });

    setLoading(false);

    if (error) {
      setErrorMsg("Failed to post comment: " + error.message);
    } else {
      setComment("");
      fetchComments();
      if (onCommentAdded) onCommentAdded();
    }
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4 space-y-4">

      {/* Display Existing Comments */}
      {loadingComments ? (
        <p className="text-xs text-slate-500">Loading comments...</p>
      ) : commentsList.length > 0 ? (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {commentsList.map((c) => {
            const authorName = c.author?.nickname || c.author?.company_name || "Arena Member";
            return (
              <div key={c.id} className="bg-white/5 rounded-xl p-3 text-sm border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 text-[11px] uppercase tracking-wider">
                    {authorName}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{c.content}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">No comments yet. Step into the arena and be the first!</p>
      )}

      {/* Comment Input Form */}
      <div>
        {errorMsg && <p className="text-xs text-rose-500 mb-1 font-semibold">{errorMsg}</p>}
        <textarea
          rows={2}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition resize-none"
          placeholder="Write your thoughts..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={submitComment}
            className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-cyan-400 disabled:opacity-50 transition"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>
    </div>
  );
}