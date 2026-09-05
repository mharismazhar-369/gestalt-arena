// src/lib/api.ts

/**
 * Centralised API wrapper for Supabase client‑side mutations.
 * This file groups related database operations to avoid scattering
 * raw `supabase.from(...).insert/delete` calls throughout the UI.
 *
 * All functions return the raw Supabase response so callers can
 * handle errors uniformly.
 */

import { supabase } from '@/lib/supabase/client';

/** Toggle a like for a post. */
export async function toggleLike(postId: string, userId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    // Unlike – delete the row
    return await supabase.from('likes').delete().match({ post_id: postId, user_id: userId });
  } else {
    // Like – insert the row
    return await supabase.from('likes').insert({ post_id: postId, user_id: userId });
  }
}

/** Toggle a dislike for a post. */
export async function toggleDislike(postId: string, userId: string, currentlyDisliked: boolean) {
  if (currentlyDisliked) {
    return await supabase.from('dislikes').delete().match({ post_id: postId, user_id: userId });
  } else {
    return await supabase.from('dislikes').insert({ post_id: postId, user_id: userId });
  }
}

/** Toggle a bookmark for a post. */
export async function toggleBookmark(postId: string, userId: string, currentlyBookmarked: boolean) {
  if (currentlyBookmarked) {
    return await supabase.from('bookmarks').delete().match({ post_id: postId, user_id: userId });
  } else {
    return await supabase.from('bookmarks').insert({ post_id: postId, user_id: userId });
  }
}

/** Helper to create a notification entry. */
export async function createNotification(params: {
  user_id: string;
  actor_id: string;
  type: string;
  message: string;
  reference_id?: string;
}) {
  return await supabase.from('notifications').insert(params);
}

/** Share a post – placeholder for future edge‑function logging. */
export async function sharePostLink(url: string, title: string, text: string) {
  // Currently the UI handles the native share API; this can be expanded later.
  return { data: null, error: null };
}
