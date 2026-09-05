"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export type PresenceStatus = "online" | "busy" | "away";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  status: PresenceStatus;
  updateStatus: (newStatus: PresenceStatus) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  status: "online",
  updateStatus: async () => { },
});

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PresenceStatus>("online");

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session);
        setLoading(false);

        if (session?.user) {
          // Fetch initial status from the database
          const { data } = await supabase
            .from("profiles")
            .select("presence_status")
            .eq("id", session.user.id)
            .single();

          if (data?.presence_status) {
            setStatus(data.presence_status as PresenceStatus);
          }
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateStatus = async (newStatus: PresenceStatus) => {
    if (!session?.user) return;

    // Optimistic UI update
    setStatus(newStatus);

    // Sync to database
    await supabase
      .from("profiles")
      .update({ presence_status: newStatus })
      .eq("id", session.user.id);
  };

  return (
    <AuthContext.Provider value={{ session, loading, status, updateStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}