"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="border-none bg-white ring-1 ring-line rounded-lg px-3 py-2 text-xs font-bold cursor-pointer"
    >
      Sign out
    </button>
  );
}
