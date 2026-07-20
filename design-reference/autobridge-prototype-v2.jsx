import React, { useState, useMemo } from "react";

/* ============================================================
   AUTOBRIDGE v0.2 — enthusiast parts marketplace prototype
   New in v0.2: Inbox (messages + notifications), Profile hub
   (My Shop / Sold / Purchases / Likes), likes across the app.
   Tokens: bg #F5F5F2 | ink #101112 | accent #FF4400
   fit-green #00A868 | card #FFF | line #E4E4DF
   ============================================================ */

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,800;1,900&family=JetBrains+Mono:wght@400;600&display=swap');
.ab-root { font-family: 'Archivo', sans-serif; }
.ab-mono { font-family: 'JetBrains Mono', monospace; }
.ab-display { font-family: 'Archivo', sans-serif; font-weight: 900; font-style: italic; letter-spacing: -0.02em; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

/* ---------------- data ---------------- */

const MY_CAR = { label: "2015 Subaru WRX", platform: "VA", short: "'15 WRX" };

const SELLERS = {
  parted_sd: { handle: "parted_out_sd", name: "Parted Out SD", rating: 4.9, sales: 212, blurb: "Parting out clean SoCal enthusiast cars. Everything tested before it ships.", location: "San Diego, CA" },
  wrxgrave: { handle: "wrx_graveyard", name: "WRX Graveyard", rating: 4.8, sales: 341, blurb: "VA/GD/GR Subaru specialist. OEM+ takeoffs and hard-to-find trim.", location: "Sacramento, CA" },
  trackday: { handle: "trackday_takeoffs", name: "Trackday Takeoffs", rating: 5.0, sales: 88, blurb: "Fresh takeoffs from track builds. Low miles, no stories.", location: "Phoenix, AZ" },
  eurobin: { handle: "euro_bin", name: "Euro Bin", rating: 4.7, sales: 156, blurb: "BMW & VW performance parts. Ask for fitment help anytime.", location: "Portland, OR" },
};

const ME = { handle: "mattsgarage", name: "Matt's Garage", location: "San Diego, CA", rating: 5.0, sales: 2 };

const LISTINGS = [
  { id: 1, cat: "wheel", tint: "#EDE9E1", title: "Volk TE37 Saga 18x9.5 +38 (set of 4)", price: 2450, cond: "Used — 8/10", pn: "WVDSAG38EA", seller: "parted_sd",
    fits: ["2015–2021 Subaru WRX / STI (VA)", "2008–2014 WRX (5x114.3 hub)", "Most 5x114.3 / 18\" clearance"], fitsMyCar: true,
    desc: "Genuine Rays TE37 Saga in bronze. Light rash on one lip (pictured), no bends, no repairs. Balanced last month. Tires not included.",
    specs: [["Size", "18x9.5"], ["Offset", "+38"], ["Bolt pattern", "5x114.3"], ["Weight", "18.7 lb"], ["Finish", "Bronze"]] },
  { id: 2, cat: "coilover", tint: "#E4E9EA", title: "Öhlins Road & Track DFV coilovers", price: 1850, cond: "Used — 9/10", pn: "SUS MI21S1", seller: "wrxgrave",
    fits: ["2015–2021 Subaru WRX / STI (VA)"], fitsMyCar: true,
    desc: "~6k street miles. No leaks, adjusters turn freely. Includes camber plates and original hardware. Removed for a full air setup.",
    specs: [["Spring rate F", "8 kg/mm"], ["Spring rate R", "7 kg/mm"], ["Adjustment", "Dual DFV"], ["Includes", "Camber plates"]] },
  { id: 3, cat: "seat", tint: "#EAE4E1", title: "Recaro Pole Position (FIA) — pair", price: 1600, cond: "Used — 7/10", pn: "070.77.0184", seller: "trackday",
    fits: ["Universal — side-mount brackets required"], fitsMyCar: false,
    desc: "FIA tags valid through 2027. Bolster wear on driver side, no tears. Sold as a pair with sliders. Brackets sold separately.",
    specs: [["Homologation", "FIA 8855-1999"], ["Shell", "Fiberglass"], ["Mount", "Side"], ["Tag valid", "2027"]] },
  { id: 4, cat: "wing", tint: "#E5E8E2", title: "APR GTC-300 carbon wing 67\"", price: 900, cond: "Used — 9/10", pn: "AS-106728", seller: "trackday",
    fits: ["2015–2021 Subaru WRX / STI (VA) — direct mount", "Universal with flat trunk mounting"], fitsMyCar: true,
    desc: "Real carbon, no cracks or delamination. Comes with trunk-specific mounts for VA chassis. Hardware included.",
    specs: [["Width", "67 in"], ["Material", "Carbon fiber"], ["Mounts", "VA trunk"], ["Adjustable", "Yes"]] },
  { id: 5, cat: "exhaust", tint: "#E9E6EC", title: "Tomei Expreme Ti catback (titanium)", price: 1100, cond: "Used — 8/10", pn: "TB6090-SB03C", seller: "wrxgrave",
    fits: ["2015–2021 Subaru WRX (VA, FA20DIT)"], fitsMyCar: true,
    desc: "Full titanium, burnt tips. Minor scuffs under the mid-pipe. All flanges straight, hangers intact. Loud — know what you're buying.",
    specs: [["Material", "Titanium"], ["Piping", "80mm"], ["Weight", "13.9 lb"], ["Sound", "Very loud"]] },
  { id: 6, cat: "wheel", tint: "#E3E7EB", title: "BMW M3 (G80) OEM 826M wheels + tires", price: 1700, cond: "Used — 9/10", pn: "36118093837", seller: "eurobin",
    fits: ["2021+ BMW M3 (G80) / M4 (G82)", "5x112 BMW fitments w/ clearance"], fitsMyCar: false,
    desc: "Staggered OEM takeoffs, ~2k miles. PS4S tires at 90%. Perfect winter-setup donor or OEM+ refresh.",
    specs: [["Front", "18x9.5 +23"], ["Rear", "19x10.5 +40"], ["Bolt pattern", "5x112"], ["Tires", "PS4S 90%"]] },
  { id: 7, cat: "turbo", tint: "#ECE7E0", title: "Garrett G25-660 turbo (fresh rebuild)", price: 1350, cond: "Refurb — 10/10", pn: "877895-5003S", seller: "parted_sd",
    fits: ["Universal — build dependent (T25 inlet)"], fitsMyCar: false,
    desc: "Rebuilt by Garrett-authorized shop, receipts included. Zero shaft play. Great base for a 450–500whp build.",
    specs: [["Rating", "350–660 hp"], ["Inlet", "T25"], ["Wastegate", "External"], ["Receipts", "Included"]] },
  { id: 8, cat: "seat", tint: "#E6EAE4", title: "OEM WRX STI front seats (VA, black/red)", price: 650, cond: "Used — 8/10", pn: "64010VA010", seller: "wrxgrave",
    fits: ["2015–2021 Subaru WRX / STI (VA) — plug and play"], fitsMyCar: true,
    desc: "Clean STI takeoffs, airbags intact, no rips. Direct swap into any VA chassis with factory harness.",
    specs: [["Chassis", "VA"], ["Airbags", "Intact"], ["Harness", "Plug & play"], ["Color", "Black / red"]] },
];

const MY_SHOP = [
  { id: 101, cat: "wheel", tint: "#E8E6E0", title: "Enkei RPF1 17x9 +35 (set of 4)", price: 780, views: 214, likes: 18, offers: 1 },
  { id: 102, cat: "exhaust", tint: "#E4E8EA", title: "Invidia N1 catback (GD STI)", price: 480, views: 96, likes: 7, offers: 0 },
];

const SOLD = [
  { title: "Cobb Accessport V3 (VA WRX)", price: 325, date: "Jul 12", buyer: "boostcreep", status: "Ship by Tue" },
  { title: "OEM VA STI trunk lid (WRB)", price: 400, date: "Jun 28", buyer: "va_owner_92", status: "Delivered ✓" },
];

const PURCHASES = [
  { title: "GrimmSpeed EBCS", price: 95, seller: "wrx_graveyard", status: "Delivered Jul 8" },
  { title: "Perrin pitch stop mount", price: 74, seller: "parted_out_sd", status: "In transit — arrives Mon" },
];

const THREADS = [
  { id: 1, kind: "SELLING", who: "boostcreep", item: "Enkei RPF1 17x9 +35", last: "Would you do $700 shipped?", time: "2m", unread: true },
  { id: 2, kind: "BUYING", who: "trackday_takeoffs", item: "APR GTC-300 carbon wing", last: "Yeah I can get you exact trunk measurements tonight", time: "1h", unread: true },
  { id: 3, kind: "SELLING", who: "daily_driven_dan", item: "Invidia N1 catback", last: "Is the flex section solid? No rasp?", time: "3h", unread: false },
  { id: 4, kind: "BUYING", who: "wrx_graveyard", item: "Öhlins DFV coilovers", last: "You: Sounds good, sending the offer now", time: "1d", unread: false },
];

const NOTIFS = [
  { tag: "OFFER", text: "@boostcreep sent an offer: $700 for your Enkei RPF1 17x9 +35", time: "2m", hot: true },
  { tag: "FITMENT", text: "New for your '15 WRX: Volk TE37 Saga 18x9.5 just listed — matches your wheel alert", time: "1h", hot: true },
  { tag: "LIKE", text: "@gd_chassis_gang liked your Invidia N1 catback", time: "4h", hot: false },
  { tag: "SOLD", text: "Payment cleared for Cobb Accessport V3 — ship by Tuesday for on-time rating", time: "1d", hot: false },
  { tag: "PRICE", text: "Price drop: Recaro Pole Position pair now $1,600 (was $1,850)", time: "2d", hot: false },
];

const CATS = [
  { id: "all", label: "All" }, { id: "wheel", label: "Wheels" }, { id: "coilover", label: "Suspension" },
  { id: "seat", label: "Seats" }, { id: "exhaust", label: "Exhaust" }, { id: "wing", label: "Aero" }, { id: "turbo", label: "Forced induction" },
];

/* ---------------- part illustrations ---------------- */

function PartArt({ cat, size = "100%" }) {
  const stroke = "#101112";
  const common = { fill: "none", stroke, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" };
  let art = null;
  if (cat === "wheel") {
    art = (<g {...common}><circle cx="60" cy="60" r="42" /><circle cx="60" cy="60" r="12" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <line key={a} x1={60 + 12 * Math.cos((a * Math.PI) / 180)} y1={60 + 12 * Math.sin((a * Math.PI) / 180)} x2={60 + 40 * Math.cos((a * Math.PI) / 180)} y2={60 + 40 * Math.sin((a * Math.PI) / 180)} />))}</g>);
  } else if (cat === "coilover") {
    art = (<g {...common}><line x1="60" y1="14" x2="60" y2="26" /><path d="M42 30 H78 M42 30 L78 40 M78 40 L42 50 M42 50 L78 60 M78 60 L42 70 M42 70 L78 80 M42 80 H78" /><rect x="52" y="84" width="16" height="22" rx="3" /></g>);
  } else if (cat === "seat") {
    art = (<g {...common}><path d="M45 18 C68 14 78 22 76 40 L72 66 C71 74 64 78 56 78 L46 78 C40 78 36 74 37 68 L41 30 C42 22 42 19 45 18 Z" /><path d="M37 78 L34 96 C33 102 37 106 43 106 L70 106" /><line x1="48" y1="34" x2="68" y2="36" /><line x1="47" y1="46" x2="67" y2="48" /></g>);
  } else if (cat === "wing") {
    art = (<g {...common}><path d="M14 46 C50 34 76 34 106 44 L106 54 C76 46 50 46 14 56 Z" /><line x1="38" y1="56" x2="38" y2="82" /><line x1="82" y1="52" x2="82" y2="82" /><line x1="28" y1="84" x2="48" y2="84" /><line x1="72" y1="84" x2="92" y2="84" /></g>);
  } else if (cat === "exhaust") {
    art = (<g {...common}><path d="M14 74 H54 C66 74 66 58 78 58 H92" /><circle cx="100" cy="58" r="9" /><circle cx="100" cy="58" r="4" /><path d="M14 88 H60 C74 88 74 72 86 72" /><circle cx="100" cy="76" r="9" /></g>);
  } else if (cat === "turbo") {
    art = (<g {...common}><circle cx="56" cy="60" r="26" /><path d="M56 60 m-14 0 a14 14 0 1 1 28 0 a14 14 0 1 1 -28 0" /><path d="M82 52 C96 48 102 54 104 62" /><path d="M56 34 L56 20 L74 20" /><circle cx="56" cy="60" r="4" fill={stroke} /></g>);
  }
  return (<svg viewBox="0 0 120 120" width={size} height={size} style={{ opacity: 0.85 }}>{art}</svg>);
}

/* ---------------- shared bits ---------------- */

function FitBadge({ compact }) {
  return (
    <span className="ab-mono" style={{ background: "#00A868", color: "#fff", fontSize: compact ? 9 : 10, fontWeight: 600, padding: compact ? "3px 6px" : "4px 8px", borderRadius: 4, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
      FITS YOUR {MY_CAR.short.toUpperCase()}
    </span>
  );
}

function Heart({ filled, onClick, size = 30 }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={filled ? "Unlike" : "Like"}
      style={{ width: size, height: size, borderRadius: 99, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, boxShadow: "0 1px 3px rgba(16,17,18,0.15)" }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill={filled ? "#FF4400" : "none"} stroke={filled ? "#FF4400" : "#101112"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}

function Price({ value, size = 18 }) {
  return <span style={{ fontWeight: 800, fontSize: size }}>${value.toLocaleString()}</span>;
}

function Card({ l, onOpen, liked, toggleLike }) {
  return (
    <div
      onClick={() => onOpen(l)}
      style={{ cursor: "pointer", background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 2px rgba(16,17,18,0.06), inset 0 0 0 1px #ECECE7" }}
    >
      <div style={{ background: l.tint, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ width: "68%" }}><PartArt cat={l.cat} /></div>
        {l.fitsMyCar && <div style={{ position: "absolute", top: 8, left: 8 }}><FitBadge compact /></div>}
        <div style={{ position: "absolute", bottom: 8, right: 8 }}>
          <Heart filled={liked} onClick={toggleLike} />
        </div>
      </div>
      <div style={{ padding: "10px 11px 12px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, minHeight: 33 }}>{l.title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
          <Price value={l.price} size={15} />
          <span className="ab-mono" style={{ fontSize: 9.5, color: "#7A7A74" }}>{l.cond.split(" — ")[1]}</span>
        </div>
        <div style={{ fontSize: 11, color: "#7A7A74", marginTop: 3 }}>@{SELLERS[l.seller].handle}</div>
      </div>
    </div>
  );
}

/* ---------------- screens ---------------- */

function HomeScreen({ onOpen, fitOnly, setFitOnly, cat, setCat, query, setQuery, liked, toggleLike }) {
  const results = useMemo(() => LISTINGS.filter((l) => {
    if (fitOnly && !l.fitsMyCar) return false;
    if (cat !== "all" && l.cat !== cat) return false;
    if (query && !l.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [fitOnly, cat, query]);

  return (
    <div>
      <div style={{ padding: "12px 16px 4px" }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search parts, brands, part numbers"
          style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #E4E4DF", background: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px 6px" }}>
        <button onClick={() => setFitOnly(!fitOnly)}
          style={{ display: "flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer", borderRadius: 999, padding: "8px 14px", background: fitOnly ? "#101112" : "#fff", color: fitOnly ? "#fff" : "#101112", boxShadow: fitOnly ? "none" : "inset 0 0 0 1px #E4E4DF", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: "#00A868", display: "inline-block" }} />
          {MY_CAR.label}
          <span className="ab-mono" style={{ fontSize: 10, opacity: 0.6, fontWeight: 400 }}>{fitOnly ? "FITMENT ON" : "SHOW ALL"}</span>
        </button>
      </div>
      <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "8px 16px 14px" }}>
        {CATS.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            style={{ border: "none", cursor: "pointer", whiteSpace: "nowrap", padding: "7px 13px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", fontWeight: 600, background: cat === c.id ? "#FF4400" : "#fff", color: cat === c.id ? "#fff" : "#101112", boxShadow: cat === c.id ? "none" : "inset 0 0 0 1px #E4E4DF" }}>
            {c.label}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px 24px" }}>
        {results.map((l) => (
          <Card key={l.id} l={l} onOpen={onOpen} liked={liked.has(l.id)} toggleLike={() => toggleLike(l.id)} />
        ))}
        {results.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", color: "#7A7A74", fontSize: 14 }}>
            No parts match. Turn off the fitment filter or try another search.
          </div>
        )}
      </div>
    </div>
  );
}

function ListingScreen({ listing, onBack, onSeller, liked, toggleLike }) {
  const s = SELLERS[listing.seller];
  const [offerSent, setOfferSent] = useState(false);
  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ background: listing.tint, aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 12, left: 12, width: 34, height: 34, borderRadius: 99, border: "none", background: "rgba(255,255,255,0.9)", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>←</button>
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <Heart filled={liked.has(listing.id)} onClick={() => toggleLike(listing.id)} size={34} />
        </div>
        <div style={{ width: "50%" }}><PartArt cat={listing.cat} /></div>
        <span className="ab-mono" style={{ position: "absolute", bottom: 10, right: 12, fontSize: 9, color: "#7A7A74" }}>PHOTOS 1/6 · PROTOTYPE ART</span>
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        {listing.fitsMyCar && <FitBadge />}
        <h2 style={{ fontSize: 19, fontWeight: 800, margin: "10px 0 4px", lineHeight: 1.25 }}>{listing.title}</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
          <Price value={listing.price} size={22} />
          <span style={{ fontSize: 13, color: "#7A7A74" }}>{listing.cond}</span>
        </div>
        <div className="ab-mono" style={{ fontSize: 11, color: "#7A7A74", marginTop: 4 }}>P/N {listing.pn}</div>
        <div style={{ marginTop: 16, background: "#fff", borderRadius: 12, boxShadow: "inset 0 0 0 1px #ECECE7", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #ECECE7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="ab-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "#7A7A74" }}>VERIFIED FITMENT</span>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: "#00A868" }} />
          </div>
          {listing.fits.map((f, i) => (
            <div key={i} style={{ padding: "10px 14px", fontSize: 13.5, borderBottom: i < listing.fits.length - 1 ? "1px solid #F3F3EF" : "none", fontWeight: f.includes("WRX") && listing.fitsMyCar ? 700 : 400 }}>{f}</div>
          ))}
        </div>
        <div style={{ marginTop: 12, background: "#fff", borderRadius: 12, boxShadow: "inset 0 0 0 1px #ECECE7", padding: "4px 14px" }}>
          {listing.specs.map(([k, v], i) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < listing.specs.length - 1 ? "1px solid #F3F3EF" : "none", fontSize: 13.5 }}>
              <span style={{ color: "#7A7A74" }}>{k}</span>
              <span className="ab-mono" style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: "#3A3A36", marginTop: 14 }}>{listing.desc}</p>
        <button onClick={onSeller}
          style={{ width: "100%", textAlign: "left", marginTop: 8, display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "none", cursor: "pointer", borderRadius: 12, boxShadow: "inset 0 0 0 1px #ECECE7", padding: 12, fontFamily: "inherit" }}>
          <div style={{ width: 42, height: 42, borderRadius: 99, background: "#101112", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>{s.name[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>@{s.handle}</div>
            <div style={{ fontSize: 12, color: "#7A7A74" }}>★ {s.rating} · {s.sales} sales · {s.location}</div>
          </div>
          <span style={{ color: "#7A7A74" }}>›</span>
        </button>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 16px 16px", background: "linear-gradient(transparent, #F5F5F2 30%)", display: "flex", gap: 10 }}>
        <button onClick={() => setOfferSent(true)}
          style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "#fff", boxShadow: "inset 0 0 0 1.5px #101112", fontWeight: 800, fontSize: 14, fontFamily: "inherit" }}>
          {offerSent ? "Offer sent ✓" : "Make offer"}
        </button>
        <button style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "#FF4400", color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "inherit" }}>Buy now</button>
      </div>
    </div>
  );
}

function SellerScreen({ sellerId, onBack, onOpen, liked, toggleLike }) {
  const s = SELLERS[sellerId];
  const items = LISTINGS.filter((l) => l.seller === sellerId);
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: "14px 16px 0" }}>
        <button onClick={onBack} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 700, padding: 0, fontFamily: "inherit" }}>← Back</button>
      </div>
      <div style={{ padding: "16px", display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 62, height: 62, borderRadius: 99, background: "#101112", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24 }}>{s.name[0]}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>@{s.handle}</div>
          <div style={{ fontSize: 13, color: "#7A7A74" }}>★ {s.rating} · {s.sales} sales · {s.location}</div>
        </div>
      </div>
      <p style={{ padding: "0 16px", fontSize: 14, lineHeight: 1.5, color: "#3A3A36", marginTop: 0 }}>{s.blurb}</p>
      <div style={{ display: "flex", gap: 10, padding: "6px 16px 16px" }}>
        <button style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#101112", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Follow</button>
        <button style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#fff", boxShadow: "inset 0 0 0 1.5px #101112", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Message</button>
      </div>
      <div className="ab-mono" style={{ padding: "0 16px 10px", fontSize: 10, letterSpacing: "0.1em", color: "#7A7A74" }}>{items.length} ACTIVE LISTING{items.length !== 1 ? "S" : ""}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px" }}>
        {items.map((l) => (
          <Card key={l.id} l={l} onOpen={onOpen} liked={liked.has(l.id)} toggleLike={() => toggleLike(l.id)} />
        ))}
      </div>
    </div>
  );
}

function SellScreen() {
  const steps = [
    ["1", "Snap photos", "Six angles. Damage close-ups build trust and cut disputes."],
    ["2", "Scan the part number", "We look up the part and pre-fill title, specs, and fitment."],
    ["3", "Confirm fitment", "Pick the years, makes, and models it fits. This is what gets you found."],
    ["4", "Set your price", "We show recent sold prices for the same part so you price to move."],
  ];
  return (
    <div style={{ padding: "20px 16px 24px" }}>
      <h2 className="ab-display" style={{ fontSize: 26, margin: "0 0 6px" }}>List a part in minutes.</h2>
      <p style={{ fontSize: 14, color: "#3A3A36", lineHeight: 1.5, marginTop: 0 }}>Part-number lookup does the typing for you. You confirm, we list.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {steps.map(([n, t, d]) => (
          <div key={n} style={{ display: "flex", gap: 12, background: "#fff", borderRadius: 12, boxShadow: "inset 0 0 0 1px #ECECE7", padding: 14 }}>
            <div className="ab-mono" style={{ width: 26, height: 26, borderRadius: 99, background: "#FF4400", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{n}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t}</div>
              <div style={{ fontSize: 12.5, color: "#7A7A74", marginTop: 2, lineHeight: 1.45 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
      <button style={{ width: "100%", marginTop: 16, padding: "15px 0", borderRadius: 12, border: "none", background: "#FF4400", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>Start a listing</button>
      <p className="ab-mono" style={{ textAlign: "center", fontSize: 10, color: "#7A7A74", marginTop: 10 }}>NO FEES UNTIL IT SELLS</p>
    </div>
  );
}

/* ---------------- inbox ---------------- */

function InboxScreen() {
  const [sub, setSub] = useState("messages");
  const tagColor = { OFFER: "#FF4400", FITMENT: "#00A868", LIKE: "#7A7A74", SOLD: "#101112", PRICE: "#7A7A74" };
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: "18px 16px 10px" }}>
        <h2 className="ab-display" style={{ fontSize: 26, margin: 0 }}>Inbox</h2>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 16px 12px" }}>
        {[["messages", "Messages"], ["notifs", "Notifications"]].map(([id, label]) => (
          <button key={id} onClick={() => setSub(id)}
            style={{ border: "none", cursor: "pointer", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "inherit", background: sub === id ? "#101112" : "#fff", color: sub === id ? "#fff" : "#101112", boxShadow: sub === id ? "none" : "inset 0 0 0 1px #E4E4DF" }}>
            {label}
            {id === "messages" && <span className="ab-mono" style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>{THREADS.filter((t) => t.unread).length}</span>}
          </button>
        ))}
      </div>

      {sub === "messages" && (
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {THREADS.map((t) => (
            <button key={t.id}
              style={{ display: "flex", gap: 12, alignItems: "center", textAlign: "left", background: "#fff", border: "none", cursor: "pointer", borderRadius: 12, boxShadow: "inset 0 0 0 1px #ECECE7", padding: 12, fontFamily: "inherit" }}>
              <div style={{ width: 44, height: 44, borderRadius: 99, background: t.unread ? "#101112" : "#E4E4DF", color: t.unread ? "#fff" : "#7A7A74", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                {t.who[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: t.unread ? 800 : 600, fontSize: 13.5 }}>@{t.who}</span>
                  <span className="ab-mono" style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: "0.08em", color: "#fff", background: t.kind === "SELLING" ? "#FF4400" : "#101112", padding: "2px 5px", borderRadius: 3 }}>{t.kind}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#7A7A74", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.item}</div>
                <div style={{ fontSize: 12.5, marginTop: 3, fontWeight: t.unread ? 600 : 400, color: t.unread ? "#101112" : "#7A7A74", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.last}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                <span className="ab-mono" style={{ fontSize: 10, color: "#7A7A74" }}>{t.time}</span>
                {t.unread && <span style={{ width: 9, height: 9, borderRadius: 99, background: "#FF4400" }} />}
              </div>
            </button>
          ))}
        </div>
      )}

      {sub === "notifs" && (
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {NOTIFS.map((n, i) => (
            <div key={i} style={{ display: "flex", gap: 12, background: "#fff", borderRadius: 12, boxShadow: "inset 0 0 0 1px #ECECE7", padding: 12, alignItems: "flex-start" }}>
              <span className="ab-mono" style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: "0.08em", color: "#fff", background: tagColor[n.tag], padding: "3px 6px", borderRadius: 3, flexShrink: 0, marginTop: 2 }}>{n.tag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, lineHeight: 1.45, fontWeight: n.hot ? 600 : 400 }}>{n.text}</div>
                <div className="ab-mono" style={{ fontSize: 10, color: "#7A7A74", marginTop: 4 }}>{n.time} ago</div>
              </div>
              {n.hot && <span style={{ width: 9, height: 9, borderRadius: 99, background: "#FF4400", flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- profile ---------------- */

function ProfileScreen({ liked, toggleLike, onOpen }) {
  const [sub, setSub] = useState("shop");
  const likedItems = LISTINGS.filter((l) => liked.has(l.id));
  const earned = SOLD.reduce((s, x) => s + x.price, 0);

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* header */}
      <div style={{ padding: "18px 16px 0", display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 62, height: 62, borderRadius: 99, background: "#FF4400", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24 }}>M</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>@{ME.handle}</div>
          <div style={{ fontSize: 13, color: "#7A7A74" }}>★ {ME.rating} · {ME.sales} sales · {ME.location}</div>
        </div>
        <button style={{ border: "none", background: "#fff", boxShadow: "inset 0 0 0 1px #E4E4DF", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
      </div>

      {/* garage strip */}
      <div style={{ margin: "14px 16px 0", background: "#101112", color: "#fff", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="ab-mono" style={{ fontSize: 9, letterSpacing: "0.12em", color: "#9a9a94" }}>MY GARAGE</div>
          <div style={{ fontWeight: 800, fontSize: 14, marginTop: 2 }}>{MY_CAR.label}</div>
        </div>
        <span className="ab-mono" style={{ fontSize: 10, color: "#00A868" }}>FITMENT ACTIVE ●</span>
      </div>

      {/* sub-nav */}
      <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "14px 16px 12px" }}>
        {[["shop", "My shop"], ["sold", "Sold"], ["purchases", "Purchases"], ["likes", "Likes"]].map(([id, label]) => (
          <button key={id} onClick={() => setSub(id)}
            style={{ border: "none", cursor: "pointer", whiteSpace: "nowrap", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "inherit", background: sub === id ? "#101112" : "#fff", color: sub === id ? "#fff" : "#101112", boxShadow: sub === id ? "none" : "inset 0 0 0 1px #E4E4DF" }}>
            {label}{id === "likes" && likedItems.length > 0 && <span className="ab-mono" style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>{likedItems.length}</span>}
          </button>
        ))}
      </div>

      {/* MY SHOP */}
      {sub === "shop" && (
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            {[["2", "active"], [String(SOLD.length), "sold"], ["$" + earned, "earned"]].map(([v, k]) => (
              <div key={k} style={{ flex: 1, background: "#fff", borderRadius: 10, boxShadow: "inset 0 0 0 1px #ECECE7", padding: "10px 0", textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{v}</div>
                <div className="ab-mono" style={{ fontSize: 9, letterSpacing: "0.1em", color: "#7A7A74", marginTop: 2 }}>{k.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {MY_SHOP.map((l) => (
              <div key={l.id} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "inset 0 0 0 1px #ECECE7" }}>
                <div style={{ background: l.tint, aspectRatio: "1.15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "60%" }}><PartArt cat={l.cat} /></div>
                </div>
                <div style={{ padding: "9px 10px 11px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{l.title}</div>
                  <div style={{ marginTop: 5 }}><Price value={l.price} size={14} /></div>
                  <div className="ab-mono" style={{ fontSize: 9, color: "#7A7A74", marginTop: 5 }}>
                    {l.views} VIEWS · {l.likes} ♥{l.offers > 0 ? ` · ${l.offers} OFFER` : ""}
                  </div>
                </div>
              </div>
            ))}
            <button style={{ border: "2px dashed #C9C9C2", background: "transparent", borderRadius: 14, cursor: "pointer", minHeight: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit", color: "#7A7A74" }}>
              <span style={{ fontSize: 26, fontWeight: 300 }}>+</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>New listing</span>
            </button>
          </div>
        </div>
      )}

      {/* SOLD */}
      {sub === "sold" && (
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {SOLD.map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, boxShadow: "inset 0 0 0 1px #ECECE7", padding: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, flex: 1, paddingRight: 8 }}>{s.title}</div>
                <Price value={s.price} size={15} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: "#7A7A74" }}>Sold to @{s.buyer} · {s.date}</span>
                <span className="ab-mono" style={{ fontSize: 10, fontWeight: 600, color: s.status.includes("✓") ? "#00A868" : "#FF4400" }}>{s.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
          <div style={{ background: "#101112", color: "#fff", borderRadius: 12, padding: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="ab-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "#9a9a94" }}>TOTAL EARNED</span>
            <span style={{ fontWeight: 800, fontSize: 17 }}>${earned.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* PURCHASES */}
      {sub === "purchases" && (
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {PURCHASES.map((p, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, boxShadow: "inset 0 0 0 1px #ECECE7", padding: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, flex: 1, paddingRight: 8 }}>{p.title}</div>
                <Price value={p.price} size={15} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: "#7A7A74" }}>From @{p.seller}</span>
                <span className="ab-mono" style={{ fontSize: 10, fontWeight: 600, color: p.status.includes("Delivered") ? "#00A868" : "#FF4400" }}>{p.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIKES */}
      {sub === "likes" && (
        <div style={{ padding: "0 16px" }}>
          {likedItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#7A7A74", fontSize: 14, lineHeight: 1.5 }}>
              Nothing liked yet. Tap the ♥ on any part to save it here — you'll get alerts if the price drops.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {likedItems.map((l) => (
                <Card key={l.id} l={l} onOpen={onOpen} liked={true} toggleLike={() => toggleLike(l.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- shell ---------------- */

export default function App() {
  const [tab, setTab] = useState("home");
  const [listing, setListing] = useState(null);
  const [sellerId, setSellerId] = useState(null);
  const [fitOnly, setFitOnly] = useState(false);
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState(new Set([2, 4]));

  const toggleLike = (id) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openListing = (l) => { setListing(l); setSellerId(null); };
  const unread = THREADS.filter((t) => t.unread).length;

  let body;
  if (listing && !sellerId) {
    body = <ListingScreen listing={listing} onBack={() => setListing(null)} onSeller={() => setSellerId(listing.seller)} liked={liked} toggleLike={toggleLike} />;
  } else if (sellerId) {
    body = <SellerScreen sellerId={sellerId} onBack={() => setSellerId(null)} onOpen={(l) => { setSellerId(null); setListing(l); }} liked={liked} toggleLike={toggleLike} />;
  } else if (tab === "home") {
    body = <HomeScreen onOpen={openListing} fitOnly={fitOnly} setFitOnly={setFitOnly} cat={cat} setCat={setCat} query={query} setQuery={setQuery} liked={liked} toggleLike={toggleLike} />;
  } else if (tab === "sell") {
    body = <SellScreen />;
  } else if (tab === "inbox") {
    body = <InboxScreen />;
  } else {
    body = <ProfileScreen liked={liked} toggleLike={toggleLike} onOpen={openListing} />;
  }

  const tabs = [
    ["home", "Browse"],
    ["sell", "Sell"],
    ["inbox", "Inbox"],
    ["profile", "Profile"],
  ];

  return (
    <div className="ab-root" style={{ minHeight: "100vh", background: "#DDDDD8", display: "flex", justifyContent: "center", padding: "18px 0", color: "#101112" }}>
      <style>{FONTS}</style>
      <div style={{ width: "100%", maxWidth: 400, background: "#F5F5F2", borderRadius: 22, overflow: "hidden", position: "relative", boxShadow: "0 12px 40px rgba(16,17,18,0.18)", display: "flex", flexDirection: "column", minHeight: 720 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 4px" }}>
          <div className="ab-display" style={{ fontSize: 21 }}>AUTO<span style={{ color: "#FF4400" }}>BRIDGE</span></div>
          <span className="ab-mono" style={{ fontSize: 9, letterSpacing: "0.12em", color: "#7A7A74" }}>PROTOTYPE V0.2</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>{body}</div>
        {!listing && !sellerId && (
          <div style={{ display: "flex", borderTop: "1px solid #E4E4DF", background: "#fff" }}>
            {tabs.map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); setListing(null); setSellerId(null); }}
                style={{ flex: 1, padding: "13px 0 15px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 13, color: tab === id ? "#101112" : "#A0A09A", borderTop: tab === id ? "2.5px solid #FF4400" : "2.5px solid transparent", marginTop: -1, position: "relative" }}>
                {label}
                {id === "inbox" && unread > 0 && (
                  <span className="ab-mono" style={{ position: "absolute", top: 7, right: "24%", background: "#FF4400", color: "#fff", fontSize: 9, fontWeight: 600, borderRadius: 99, padding: "2px 5px", lineHeight: 1 }}>{unread}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
