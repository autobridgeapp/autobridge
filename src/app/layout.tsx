import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { getUnreadMessageCount } from "@/lib/data";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "AutoBridge",
  description: "A marketplace for used enthusiast car parts.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const unreadCount = user ? await getUnreadMessageCount(user.id) : 0;

  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${jetbrainsMono.variable} font-display bg-frame text-ink min-h-screen flex justify-center py-4`}
      >
        <AppShell isAuthed={!!user} currentUserId={user?.id ?? null} initialUnreadCount={unreadCount}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
