# AutoBridge — standing rules

These apply to every session working in this repo.

1. **RLS on every table, on creation.** Any new Supabase table gets `alter table ... enable row level security;` plus explicit policies in the same migration that creates it. Never leave a table with RLS disabled or with no policies (which blocks all access) as a "come back to it later" step.
2. **`service_role` key is server-only.** It must never appear in client-side code, never be read via a `NEXT_PUBLIC_*` env var, and never ship to the browser. It only ever lives in a server-side env var (e.g. `SUPABASE_SERVICE_ROLE_KEY`, no `NEXT_PUBLIC_` prefix), read only from server components, route handlers, or server actions.
3. **New UI matches [design-reference/autobridge-prototype-v2.jsx](design-reference/autobridge-prototype-v2.jsx).** Use its tokens: bg `#F5F5F2`, ink `#101112`, accent `#FF4400`, fit-green `#00A868`, line `#E4E4DF`, card `#fff`; Archivo (display/mono weight 900 italic for wordmarks) + JetBrains Mono for labels/badges. Match its screens and component patterns (mobile-frame shell, bottom tab nav, card grid, pill filters) rather than introducing new visual language.
