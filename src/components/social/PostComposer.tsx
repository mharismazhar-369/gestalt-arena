"use client";

import { useState, useRef } from "react";
import { useUserTier } from "@/components/context/UserTierContext";
import { Send, AlertTriangle, ShieldCheck, Image as ImageIcon, Lock, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface PostComposerProps {
  // Updated to accept an optional mediaUrl
  onPostCreated?: (content: string, mediaUrl?: string) => void;
}

export default function PostComposer({ onPostCreated }: PostComposerProps) {
  const { session } = useAuth();
  const { tier, capabilities, postsToday, incrementPostCount, canPostMore } = useUserTier();

  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = content.length;
  const maxChars = capabilities.maxCharsPerPost;
  const charsRemaining = maxChars - charCount;
  const isOverCharLimit = charCount > maxChars;
  const percentage = Math.min(100, (charCount / maxChars) * 100);

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (e.g., max 5MB)
    if (!file.type.startsWith("image/")) {
      alert("Only image files are supported at this time.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !selectedFile) || isOverCharLimit || !canPostMore || !session?.user) return;

    setIsUploading(true);
    let finalMediaUrl = undefined;

    // 1. Upload image to Supabase Storage if one is selected
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('feed_media')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error("Upload failed:", uploadError);
        alert("Failed to upload image. Please try again.");
        setIsUploading(false);
        return;
      }

      // Retrieve the public URL for the newly uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('feed_media')
        .getPublicUrl(fileName);

      finalMediaUrl = publicUrl;
    }

    // 2. Submit Post via Context/Parent callback
    const success = incrementPostCount();
    if (success && onPostCreated) {
      onPostCreated(content, finalMediaUrl);
      setContent("");
      removeFile();
    }

    setIsUploading(false);
  };

  return (
    <div className="neu-flat-base p-6 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 text-[10px] font-bold capitalize flex items-center gap-1.5 text-[var(--accent)]">
            <ShieldCheck size={14} /> {capabilities.name}
          </span>
          <span className="text-xs text-[var(--secondary)]/60 font-bold">
            Char limit: <strong className="text-[var(--secondary)]">{maxChars} chars</strong>
          </span>
        </div>

        <div className="text-xs text-[var(--secondary)]/60 font-bold">
          Daily Posts: <strong className="text-[var(--secondary)]">{postsToday} / {capabilities.maxPostsPer24h >= 9999 ? "∞" : capabilities.maxPostsPer24h}</strong>
        </div>
      </div>

      {!canPostMore && (
        <div className="mb-4 rounded-xl neu-pressed-base border-transparent shadow-inner p-4 flex items-center gap-3 text-rose-600 text-xs font-bold">
          <Lock size={18} className="shrink-0" />
          <span>You have reached your 24-hour post limit ({capabilities.maxPostsPer24h} posts). Upgrade to a higher tier to expand daily limits.</span>
        </div>
      )}

      <form onSubmit={handlePost} className="space-y-4">
        <div className="relative">
          {/* Image Preview Block */}
          {previewUrl && (
            <div className="relative w-max mb-4">
              <img src={previewUrl} alt="Preview" className="max-h-48 rounded-xl object-cover border border-[var(--secondary)]/20 shadow-sm" />
              <button
                type="button"
                onClick={removeFile}
                className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-md hover:scale-110 transition"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!canPostMore || isUploading}
            placeholder={
              canPostMore
                ? `Share startup updates, investment thesis, or market insights (${capabilities.name}: max ${maxChars} chars)...`
                : "Post limit reached for current tier. Upgrade to post more."
            }
            rows={4}
            className={`w-full rounded-2xl border-transparent bg-transparent p-4 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/40 focus:outline-none transition resize-none neu-pressed-base shadow-inner font-medium ${isOverCharLimit
              ? "border-rose-600 focus:ring-1 focus:ring-rose-600"
              : "focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              }`}
          />

          {isOverCharLimit && (
            <div className="mt-2 rounded-xl bg-transparent border border-rose-600/30 p-2.5 flex items-center justify-between text-xs text-rose-600 font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Character limit exceeded by {Math.abs(charsRemaining)} characters!
              </span>
              <span className="font-mono">Locked</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-[var(--secondary)]/50 text-xs font-bold">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canPostMore || isUploading}
              className="p-2 bg-transparent border-transparent neu-btn shadow-none hover:text-[var(--accent)] transition rounded-lg disabled:opacity-50"
              title="Attach Image"
            >
              <ImageIcon size={16} />
            </button>
            <span className="hidden sm:inline">Supports Markdown & Images</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <svg className="h-10 w-10 transform -rotate-90">
                  <circle cx="20" cy="20" r={radius} className="stroke-[var(--secondary)]/10" strokeWidth="3" fill="transparent" />
                  <circle
                    cx="20" cy="20" r={radius} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                    className={`transition-all duration-300 ${isOverCharLimit ? "stroke-rose-600" : percentage > 80 ? "stroke-amber-500" : "stroke-[var(--accent)]"}`}
                    fill="transparent"
                  />
                </svg>
                <span className={`absolute text-[10px] font-mono font-bold ${isOverCharLimit ? "text-rose-600" : percentage > 80 ? "text-amber-500" : "text-[var(--secondary)]"}`}>
                  {charsRemaining}
                </span>
              </div>
              <span className="text-[11px] text-[var(--secondary)]/50 font-mono font-bold hidden md:inline">
                {charCount}/{maxChars}
              </span>
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && !selectedFile) || isOverCharLimit || !canPostMore || isUploading}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs neu-btn ${(!content.trim() && !selectedFile) || isOverCharLimit || !canPostMore || isUploading
                ? "opacity-50 cursor-not-allowed"
                : ""
                }`}
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isUploading ? "Uploading..." : "Post Feed"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}