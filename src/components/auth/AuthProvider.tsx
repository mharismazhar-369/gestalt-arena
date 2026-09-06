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
import ServiceAgreementGate from "@/components/auth/ServiceAgreementGate";

export type PresenceStatus = "online" | "busy" | "away";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  status: PresenceStatus;
  updateStatus: (newStatus: PresenceStatus) => Promise<void>;
  revokeConsent: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  status: "online",
  updateStatus: async () => { },
  revokeConsent: async () => { },
});

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PresenceStatus>("online");
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session);

        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("presence_status, terms_accepted_at")
            .eq("id", session.user.id)
            .single();

          if (data) {
            if (data.presence_status) {
              setStatus(data.presence_status as PresenceStatus);
            }
            setHasConsented(!!data.terms_accepted_at);
          }
        } else {
          setHasConsented(true); // Public visitors don't need the gate
        }

        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("terms_accepted_at")
            .eq("id", newSession.user.id)
            .single();

          setHasConsented(!!data?.terms_accepted_at);
        } else {
          setHasConsented(true);
        }

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

    setStatus(newStatus);

    await supabase
      .from("profiles")
      .update({ presence_status: newStatus })
      .eq("id", session.user.id);
  };

  const revokeConsent = async () => {
    if (!session?.user) return;

    setHasConsented(false);

    await supabase
      .from("profiles")
      .update({ terms_accepted_at: null, terms_version: null })
      .eq("id", session.user.id);
  };

  return (
    <AuthContext.Provider value={{ session, loading, status, updateStatus, revokeConsent }}>
      {children}
      {session?.user && hasConsented === false && (
        <ServiceAgreementGate
          userId={session.user.id}
          onAgreed={() => setHasConsented(true)}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}