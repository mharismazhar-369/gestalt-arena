"use client";

import { useState } from "react";
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
      setErrorMsg("Failed to post comment.");
    } else {
      setComment("");
      if (onCommentAdded) onCommentAdded();
    }
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-3">
      {errorMsg && <p className="text-xs text-rose-500 mb-1">{errorMsg}</p>}
      <textarea
        rows={2}
        className="w-full rounded-md bg-white/5 p-2 text-sm text-white placeholder-gray-400 focus:outline-none"
        placeholder="Write a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={loading}
      />
      <button
        onClick={submitComment}
        className="mt-2 rounded bg-cyan-500 px-3 py-1 text-sm font-medium text-black hover:bg-cyan-400 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Posting..." : "Post Comment"}
      </button>
    </div>
  );
}
