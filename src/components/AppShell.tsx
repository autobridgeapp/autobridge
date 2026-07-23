"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const AUTH_ROUTES = ["/login", "/signup", "/onboarding"];

export default function AppShell({
  children,
  isAuthed,
  currentUserId,
  initialUnreadCount,
}: {
  children: React.ReactNode;
  isAuthed: boolean;
  currentUserId: string | null;
  initialUnreadCount: number;
}) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();

    async function refetchUnreadCount() {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .neq("sender_id", currentUserId)
        .is("read_at", null);
      setUnreadCount(count ?? 0);
    }

    const channel = supabase
      .channel("unread-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, refetchUnreadCount)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);
  const isListing = pathname?.startsWith("/listing/");
  const isThread = pathname?.startsWith("/inbox/");
  const isAuthRoute = AUTH_ROUTES.includes(pathname ?? "");
  const isGarage = pathname === "/garage";
  const hideNav = isListing || isThread || isAuthRoute || isGarage;
  const showSignup = !isAuthed && pathname !== "/signup";

  const tabs = [
    { href: "/", label: "Browse" },
    { href: "/sell", label: "Sell" },
    { href: "/inbox", label: "Inbox" },
    { href: isAuthed ? "/profile" : "/login", label: "Profile" },
  ];

  return (
    <div className="w-full max-w-[400px] bg-bg rounded-[22px] overflow-hidden relative flex flex-col min-h-[720px] shadow-[0_12px_40px_rgba(16,17,18,0.18)]">
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <Link href="/" className="font-display italic font-black text-[21px] tracking-[-0.02em]">
          AUTO<span className="text-accent">BRIDGE</span>
        </Link>
        {showSignup && (
          <Link
            href="/signup"
            className="font-mono text-[11px] font-bold tracking-wide bg-accent text-white rounded-full px-3 py-1.5 whitespace-nowrap"
          >
            Sign up
          </Link>
        )}
      </div>
      <div className="flex-1 overflow-y-auto relative">{children}</div>
      {!hideNav && (
        <div className="flex border-t border-line bg-white">
          {tabs.map((t) => {
            const active =
              pathname === t.href || (t.label === "Profile" && pathname?.startsWith("/profile"));
            return (
              <Link
                key={t.label}
                href={t.href}
                className="relative flex-1 pt-[13px] pb-[15px] text-center font-extrabold text-[13px] -mt-px"
                style={{
                  color: active ? "#101112" : "#A0A09A",
                  borderTop: active ? "2.5px solid #FF4400" : "2.5px solid transparent",
                }}
              >
                {t.label}
                {t.label === "Inbox" && unreadCount > 0 && (
                  <span
                    className="font-mono absolute top-1.5 text-[9px] font-semibold text-white bg-accent rounded-full px-[5px] py-[1px] leading-none"
                    style={{ left: "calc(50% + 10px)" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
