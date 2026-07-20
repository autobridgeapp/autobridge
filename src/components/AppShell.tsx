"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: { href: string; label: string }[] = [
  { href: "/", label: "Browse" },
  { href: "/sell", label: "Sell" },
  { href: "/inbox", label: "Inbox" },
  { href: "/profile", label: "Profile" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isListing = pathname?.startsWith("/listing/");

  return (
    <div className="w-full max-w-[400px] bg-bg rounded-[22px] overflow-hidden relative flex flex-col min-h-[720px] shadow-[0_12px_40px_rgba(16,17,18,0.18)]">
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <Link href="/" className="font-display italic font-black text-[21px] tracking-[-0.02em]">
          AUTO<span className="text-accent">BRIDGE</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto relative">{children}</div>
      {!isListing && (
        <div className="flex border-t border-line bg-white">
          {TABS.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="flex-1 pt-[13px] pb-[15px] text-center font-extrabold text-[13px] -mt-px"
                style={{
                  color: active ? "#101112" : "#A0A09A",
                  borderTop: active ? "2.5px solid #FF4400" : "2.5px solid transparent",
                }}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
