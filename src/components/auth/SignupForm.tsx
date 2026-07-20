"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function SignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!USERNAME_RE.test(cleanUsername)) {
      setError("Username must be 3-20 characters: letters, numbers, underscores only.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: cleanUsername, name: cleanUsername } },
    });
    setLoading(false);

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        setError("That username is already taken.");
      } else {
        setError(error.message);
      }
      return;
    }

    if (data.session) {
      router.push("/profile");
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  }

  async function handleGoogle() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (checkEmail) {
    return (
      <div className="px-4 pt-10 text-center">
        <h2 className="font-display italic font-black text-2xl tracking-[-0.02em] mb-2">
          Check your email
        </h2>
        <p className="text-sm text-muted">
          We sent a confirmation link to {email}. Click it to finish creating your
          account.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-10">
      <h2 className="font-display italic font-black text-2xl tracking-[-0.02em] mb-1">
        Join AutoBridge.
      </h2>
      <p className="text-sm text-muted mb-5">Buy and sell enthusiast parts.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="w-full box-border px-3.5 py-3 rounded-[10px] border border-line bg-white text-sm font-display outline-none"
        />
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
          placeholder="Password (min 6 characters)"
          className="w-full box-border px-3.5 py-3 rounded-[10px] border border-line bg-white text-sm font-display outline-none"
        />
        {error && <p className="text-xs text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl border-none cursor-pointer bg-accent text-white font-extrabold text-sm disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
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

      <p className="text-center text-sm text-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-ink font-bold underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
