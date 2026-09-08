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
import LogoutButton from "@/components/auth/LogoutButton";
import { ShieldAlert } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";


export type PresenceStatus = "online" | "busy" | "away" | "banned" | "suspended";

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
            .select("presence_status, terms_accepted_at")
            .eq("id", newSession.user.id)
            .single();

          if (data?.presence_status) {
            setStatus(data.presence_status as PresenceStatus);
          }
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


  // ... inside AuthProvider component, right before return:
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if ((status === "banned" || status === "suspended") && pathname !== "/warning") {
      router.push("/warning");
    }
  }, [status, pathname, router]);

  return (
    <AuthContext.Provider value={{ session, loading, status, updateStatus, revokeConsent }}>
      {status === "banned" || status === "suspended" ? (
        <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-6 transition-colors duration-300">
          <div className="max-w-md w-full neu-flat-base p-10 text-center space-y-6 border border-rose-500/20 rounded-3xl relative overflow-hidden">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-8 shadow-[inset_0_0_20px_rgba(244,63,94,0.2)]">
              <ShieldAlert size={40} />
            </div>
            <h1 className="text-3xl font-black text-[var(--secondary)] uppercase tracking-wider">
              Access Restricted
            </h1>
            <p className="text-[var(--secondary)]/70 text-sm leading-relaxed font-medium">
              Your Gestalt Arena account has been <strong className="text-rose-500 uppercase">{status}</strong>.
              {status === 'suspended'
                ? " This is a temporary measure pending an administrative review of your account activities."
                : " This is a permanent action due to a severe violation of our Terms of Service."}
            </p>
            <div className="pt-8 mt-8 flex justify-center border-t border-[var(--secondary)]/10">
              <LogoutButton />
            </div>
          </div>
        </div>
      ) : (
        <>
          {children}
          {session?.user && hasConsented === false && (
            <ServiceAgreementGate
              userId={session.user.id}
              onAgreed={() => setHasConsented(true)}
            />
          )}
        </>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}