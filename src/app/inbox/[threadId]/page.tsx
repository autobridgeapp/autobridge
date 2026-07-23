import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMessages, getThread } from "@/lib/data";
import ThreadRoom from "@/components/inbox/ThreadRoom";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: { threadId: string };
}) {
  const threadId = Number(params.threadId);
  if (Number.isNaN(threadId)) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const thread = await getThread(threadId, user.id);
  if (!thread) notFound();

  const messages = await getMessages(threadId);

  return <ThreadRoom thread={thread} initialMessages={messages} currentUserId={user.id} />;
}
