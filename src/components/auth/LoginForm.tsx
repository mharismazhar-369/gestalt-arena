"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/feed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Redirect to dashboard role resolver
    router.push(redirectPath);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setGoogleLoading(false);
      setError(error.message);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">

      <h1 className="mb-8 text-center text-4xl font-black text-white">
        Login
      </h1>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="mb-6 w-full rounded-xl border border-white/10 bg-white p-4 font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
      >
        {googleLoading ? "Connecting..." : "Continue with Google"}
      </button>

      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />

        <span className="text-sm text-zinc-500">
          OR
        </span>

        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleLogin} className="space-y-6">

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white outline-none focus:border-cyan-400"
        />

        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white outline-none focus:border-cyan-400"
        />

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-cyan-400 p-4 font-bold text-black transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Login"}
        </button>

      </form>

      <p className="mt-8 text-center text-zinc-400">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-cyan-400 hover:underline"
        >
          Register
        </Link>
      </p>

    </div>
  );
}