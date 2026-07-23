"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="px-4 pt-6 pb-10">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="font-display italic font-black text-2xl tracking-[-0.02em]">
          Welcome back.
        </h2>
        <Link
          href="/signup"
          className="shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold bg-white whitespace-nowrap"
          style={{ boxShadow: "inset 0 0 0 1.5px #101112" }}
        >
          Sign up
        </Link>
      </div>
      <p className="text-sm text-muted mb-5">Sign in to buy, sell, and message.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full box-border px-3.5 py-3 rounded-[10px] border border-line bg-white text-sm font-display outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full box-border px-3.5 py-3 rounded-[10px] border border-line bg-white text-sm font-display outline-none"
        />
        {error && <p className="text-xs text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl border-none cursor-pointer bg-accent text-white font-extrabold text-sm disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-line" />
        <span className="font-mono text-[10px] text-muted tracking-widest">OR</span>
        <div className="flex-1 h-px bg-line" />
      </div>

      <button
        onClick={handleGoogle}
        className="w-full py-3.5 rounded-xl border-none cursor-pointer bg-white font-bold text-sm"
        style={{ boxShadow: "inset 0 0 0 1.5px #101112" }}
      >
        Continue with Google
      </button>
    </div>
  );
}
