"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Message, Thread } from "@/lib/types";
import { formatRelativeTime } from "@/lib/time";
import PartArt from "../PartArt";

export default function ThreadRoom({
  thread,
  initialMessages,
  currentUserId,
}: {
  thread: Thread;
  initialMessages: Message[];
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set(initialMessages.map((m) => m.id)));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    // Mark any messages from the other participant as read now that this
    // thread is open.
    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("thread_id", thread.id)
      .neq("sender_id", currentUserId)
      .is("read_at", null)
      .then();

    const channel = supabase
      .channel(`thread-${thread.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${thread.id}` },
        (payload) => {
          const row = payload.new as {
            id: number;
            thread_id: number;
            sender_id: string;
            body: string;
            created_at: string;
            read_at: string | null;
          };
          if (seenIds.current.has(row.id)) return;
          seenIds.current.add(row.id);
          setMessages((prev) => [
            ...prev,
            {
              id: row.id,
              threadId: row.thread_id,
              senderId: row.sender_id,
              body: row.body,
              createdAt: row.created_at,
              readAt: row.read_at,
            },
          ]);

          if (row.sender_id !== currentUserId) {
            supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", row.id)
              .then();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;

    setSending(true);
    setBody("");
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({ thread_id: thread.id, sender_id: currentUserId, body: text })
        .select("*")
        .single();
      if (error) throw error;

      seenIds.current.add(data.id);
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          threadId: data.thread_id,
          senderId: data.sender_id,
          body: data.body,
          createdAt: data.created_at,
          readAt: data.read_at,
        },
      ]);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to send message.");
      setBody(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 pt-3 pb-3 border-b border-cardline bg-white">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full border-none bg-bg cursor-pointer text-base font-bold flex-shrink-0"
        >
          ←
        </button>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: thread.listingTint }}
        >
          <div className="w-6 h-6">
            <PartArt cat={thread.listingCat} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">@{thread.otherHandle}</div>
          <div className="text-[11.5px] text-muted truncate">{thread.listingTitle}</div>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-center py-10 px-5 text-muted text-sm">
            Say hi to get the conversation started.
          </div>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug"
                style={
                  mine
                    ? { background: "#FF4400", color: "#fff" }
                    : { background: "#fff", boxShadow: "inset 0 0 0 1px #ECECE7" }
                }
              >
                <div>{m.body}</div>
                <div className="font-mono text-[9px] mt-1" style={{ opacity: 0.7 }}>
                  {formatRelativeTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="sticky bottom-0 flex items-center gap-2 px-4 py-3 border-t border-cardline bg-white"
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message"
          className="flex-1 box-border px-3.5 py-2.5 rounded-full border border-line bg-bg text-sm font-display outline-none"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="rounded-full px-4 py-2.5 border-none cursor-pointer bg-accent text-white font-extrabold text-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
