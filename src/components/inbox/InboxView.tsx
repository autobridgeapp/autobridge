"use client";

import { useState } from "react";
import Link from "next/link";
import { ThreadPreview } from "@/lib/types";
import { formatRelativeTime } from "@/lib/time";

const SUBTABS = [
  ["messages", "Messages"],
  ["notifs", "Notifications"],
] as const;

type SubTab = (typeof SUBTABS)[number][0];

export default function InboxView({
  threads,
  currentUserId,
}: {
  threads: ThreadPreview[];
  currentUserId: string;
}) {
  const [sub, setSub] = useState<SubTab>("messages");
  const unreadThreadCount = threads.filter((t) => t.unreadCount > 0).length;

  return (
    <div className="pb-6">
      <div className="px-4 pt-[18px] pb-2.5">
        <h2 className="font-display italic font-black text-2xl tracking-[-0.02em]">
          Inbox
        </h2>
      </div>
      <div className="flex gap-2 px-4 pb-3">
        {SUBTABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            className="border-none cursor-pointer px-3.5 py-2 rounded-lg text-[13px] font-display font-bold"
            style={{
              background: sub === id ? "#101112" : "#fff",
              color: sub === id ? "#fff" : "#101112",
              boxShadow: sub === id ? "none" : "inset 0 0 0 1px #E4E4DF",
            }}
          >
            {label}
            {id === "messages" && unreadThreadCount > 0 && (
              <span className="font-mono ml-1.5 text-[10px] opacity-70">
                {unreadThreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {sub === "messages" && (
        <div className="px-4 flex flex-col gap-2">
          {threads.length === 0 && (
            <div className="text-center py-10 px-5 text-muted text-sm leading-relaxed">
              No conversations yet. Message a seller from a listing to start one.
            </div>
          )}
          {threads.map((t) => {
            const isBuyer = t.buyerId === currentUserId;
            const kind = isBuyer ? "BUYING" : "SELLING";
            const otherHandle = isBuyer ? t.sellerHandle : t.buyerHandle;
            const unread = t.unreadCount > 0;
            const lastFromMe = t.lastMessageSenderId === currentUserId;
            const preview = t.lastMessageBody
              ? `${lastFromMe ? "You: " : ""}${t.lastMessageBody}`
              : "Say hi to get started";

            return (
              <Link
                key={t.threadId}
                href={`/inbox/${t.threadId}`}
                className="flex gap-3 items-center bg-white rounded-xl ring-1 ring-cardline p-3 no-underline text-ink"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-base flex-shrink-0"
                  style={{
                    background: unread ? "#101112" : "#E4E4DF",
                    color: unread ? "#fff" : "#7A7A74",
                  }}
                >
                  {otherHandle[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[13.5px] ${unread ? "font-extrabold" : "font-semibold"}`}>
                      @{otherHandle}
                    </span>
                    <span
                      className="font-mono text-[8.5px] font-semibold tracking-wide text-white rounded px-1.5 py-0.5"
                      style={{ background: kind === "SELLING" ? "#FF4400" : "#101112" }}
                    >
                      {kind}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-muted mt-0.5 truncate">
                    {t.listingTitle}
                  </div>
                  <div
                    className={`text-[12.5px] mt-0.5 truncate ${unread ? "font-semibold text-ink" : "text-muted"}`}
                  >
                    {preview}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {t.lastMessageAt && (
                    <span className="font-mono text-[10px] text-muted">
                      {formatRelativeTime(t.lastMessageAt)}
                    </span>
                  )}
                  {unread && <span className="w-2 h-2 rounded-full bg-accent" />}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {sub === "notifs" && (
        <div className="text-center py-10 px-5 text-muted text-sm leading-relaxed">
          Notifications are coming soon.
        </div>
      )}
    </div>
  );
}
