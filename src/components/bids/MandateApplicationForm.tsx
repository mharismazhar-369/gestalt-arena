"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Send, Loader2, CheckCircle, ShieldAlert } from "lucide-react";

/**
 * Utility to sanitize payloads before sending to Supabase.
 * - Converts empty strings to null for optional fields.
 * - Casts numeric strings to numbers where the schema expects a number.
 */
function sanitizePayload<T extends Record<string, any>>(payload: T): T {
  const cleaned: Partial<T> = {};
  for (const [key, value] of Object.entries(payload)) {
    let newVal = value as any;
    // Convert empty strings to null for optional fields
    if (newVal === "") {
      newVal = null;
    }
    // Cast numeric strings to numbers when the schema expects a number
    if (typeof newVal === "string" && !isNaN(Number(newVal))) {
      // Heuristic: keep string for UUID fields ending with _id
      if (!key.toLowerCase().endsWith("_id")) {
        newVal = Number(newVal);
      }
    }
    cleaned[key as keyof T] = newVal;
  }
  return cleaned as T;
}

interface PitchDeckOption {
  id: string;
  title: string;
  stage: string;
  funding_goal: number;
  target_bid_id?: string | null;
}

interface MandateApplicationFormProps {
  bidId: string;
  investorId: string;
  startupId: string;
  pitches: PitchDeckOption[];
}

export default function MandateApplicationForm({
  bidId,
  investorId,
  startupId,
  pitches,
}: MandateApplicationFormProps) {
  const router = useRouter();
  const availablePitches = pitches.filter((p) => !p.target_bid_id);
  const [selectedPitch, setSelectedPitch] = useState<string>(availablePitches[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!selectedPitch) return;
    setLoading(true);

    // 1. Lock the selected pitch deck to this bid (foreign key: target_bid_id)
    const { error: lockError } = await supabase
      .from("pitch_decks")
      .update({ target_bid_id: bidId })
      .eq("id", selectedPitch);

    if (lockError) {
      console.error("Error locking pitch deck:", lockError);
      setLoading(false);
      return;
    }

    // 2. Insert core deal negotiation (must occur before any child inserts)
    const payload = sanitizePayload({
      startup_id: startupId,
      investor_id: investorId,
      pitch_deck_id: selectedPitch,
      bid_deck_id: bidId,
      status: "Pending",
    });

    const { data: newDeal, error } = await supabase
      .from("deal_negotiations")
      .insert(payload)
      .select()
      .single();

    if (error || !newDeal) {
      console.error("Error creating deal negotiation:", error);
      setLoading(false);
      return;
    }

    // 3. Create notification without manually injecting primary key fields
    const notifPayload = sanitizePayload({
      user_id: investorId,
      actor_id: startupId,
      type: "deal_initiated",
      message: "submitted a pitch deck to your mandate.",
      reference_id: newDeal.id,
    });

    const { error: notifError } = await supabase.from("notifications").insert(notifPayload);
    if (notifError) {
      console.error("Error creating notification:", notifError);
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/startup/dashboard");
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-4 neu-pressed-base border-transparent shadow-inner text-emerald-600">
        <CheckCircle size={24} className="mb-2" />
        <span className="text-sm font-bold">Deal Thread Initiated</span>
        <span className="text-[10px] font-bold text-[var(--secondary)]/50 mt-1">
          Pitch is now locked to this mandate.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 neu-flat-base p-6">
      {availablePitches.length > 0 ? (
        <>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary)]/60">
              Select Pitch Deck (Locks upon submission)
            </label>
            <select
              value={selectedPitch}
              onChange={(e) => setSelectedPitch(e.target.value)}
              className="w-full bg-transparent neu-pressed-base border-transparent shadow-inner p-3 text-sm font-bold text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition"
            >
              {availablePitches.map((pitch) => (
                <option
                  key={pitch.id}
                  value={pitch.id}
                  className="bg-[var(--primary)] text-[var(--secondary)]"
                >
                  {pitch.title || "Untitled"} • {pitch.stage || "Pre-Seed"}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedPitch}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 neu-btn text-xs disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? "Initiating Deal..." : "Submit & Lock Selected Pitch"}
          </button>
        </>
      ) : (
        <div className="neu-pressed-base p-6 text-center border-transparent shadow-inner space-y-2">
          <ShieldAlert size={24} className="mx-auto text-rose-600 mb-2" />
          <p className="text-sm font-bold text-[var(--secondary)]">No Available Pitch Decks</p>
          <p className="text-[10px] font-medium text-[var(--secondary)]/60 leading-relaxed max-w-xs mx-auto">
            Your existing pitch decks are already locked to other active mandates. You must create a new pitch deck to apply for this bid.
          </p>
        </div>
      )}
    </div>
  );
}