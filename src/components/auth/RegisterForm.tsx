"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (password.length < 10) {
      setError("Password must contain at least 10 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">

      <h1 className="mb-8 text-center text-4xl font-black text-white">
        Create Account
      </h1>

      <form onSubmit={handleRegister} className="space-y-6">

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white"
        />

        <input
          type="password"
          required
          placeholder="Minimum 10 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white"
        />

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-cyan-400 p-4 font-bold text-black"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

      </form>

      <p className="mt-8 text-center text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan-400">
          Login
        </Link>
      </p>

    </div>
  );
}