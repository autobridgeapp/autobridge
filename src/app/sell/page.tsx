import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STEPS: [string, string, string][] = [
  ["1", "Snap photos", "Six angles. Damage close-ups build trust and cut disputes."],
  ["2", "Add the details", "Title, part number, condition, and price."],
  ["3", "Publish", "Your listing goes live on the browse feed immediately."],
  ["4", "Manage from your profile", "Edit or delete anytime from My Shop."],
];

export default async function SellPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="px-4 pt-5 pb-6">
      <h2 className="font-display italic font-black text-[26px] tracking-[-0.02em] mb-1.5">
        List a part in minutes.
      </h2>
      <p className="text-sm text-muted2 leading-relaxed mt-0">
        Add your part&apos;s details and photos, and it&apos;s live on the feed.
      </p>
      <div className="flex flex-col gap-2.5 mt-3.5">
        {STEPS.map(([n, t, d]) => (
          <div
            key={n}
            className="flex gap-3 bg-white rounded-xl ring-1 ring-cardline p-3.5"
          >
            <div className="font-mono w-[26px] h-[26px] rounded-full bg-accent text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {n}
            </div>
            <div>
              <div className="font-bold text-sm">{t}</div>
              <div className="text-xs text-muted mt-0.5 leading-relaxed">{d}</div>
            </div>
          </div>
        ))}
      </div>
      <Link
        href={user ? "/sell/new" : "/login"}
        className="block text-center w-full mt-4 py-[15px] rounded-xl border-none bg-accent text-white font-extrabold text-[15px]"
      >
        Start a listing
      </Link>
      <p className="font-mono text-center text-[10px] text-muted mt-2.5">
        NO FEES UNTIL IT SELLS
      </p>
    </div>
  );
}
