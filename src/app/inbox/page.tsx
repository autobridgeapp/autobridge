import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getThreadPreviews } from "@/lib/data";
import InboxView from "@/components/inbox/InboxView";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const threads = await getThreadPreviews(user.id);

  return <InboxView threads={threads} currentUserId={user.id} />;
}
