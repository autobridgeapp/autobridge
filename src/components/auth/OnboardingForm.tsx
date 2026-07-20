"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function OnboardingForm() {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!USERNAME_RE.test(cleanUsername)) {
      setError("Username must be 3-20 characters: letters, numbers, underscores only.");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("Session expired, please sign in again.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ handle: cleanUsername, name: cleanUsername, username_set: true })
      .eq("user_id", user.id);

    setLoading(false);
    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        setError("That username is already taken.");
      } else {
        setError(error.message);
      }
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="px-4 pt-10 pb-10">
      <h2 className="font-display italic font-black text-2xl tracking-[-0.02em] mb-1">
        Pick a username.
      </h2>
      <p className="text-sm text-muted mb-5">
        This is how buyers and sellers will see you on AutoBridge.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="w-full box-border px-3.5 py-3 rounded-[10px] border border-line bg-white text-sm font-display outline-none"
        />
        {error && <p className="text-xs text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl border-none cursor-pointer bg-accent text-white font-extrabold text-sm disabled:opacity-60"
        >
          {loading ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
