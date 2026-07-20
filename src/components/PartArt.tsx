import { Category } from "@/lib/types";

const stroke = "#101112";
const common = {
  fill: "none",
  stroke,
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function PartArt({
  cat,
  size = "100%",
}: {
  cat: Category;
  size?: string | number;
}) {
  let art: React.ReactNode = null;

  if (cat === "wheel") {
    art = (
      <g {...common}>
        <circle cx="60" cy="60" r="42" />
        <circle cx="60" cy="60" r="12" />
        {[0, 60, 120, 180, 240, 300].map((a) => {
          const rad = (a * Math.PI) / 180;
          const cos = Number(Math.cos(rad).toFixed(6));
          const sin = Number(Math.sin(rad).toFixed(6));
          return (
            <line
              key={a}
              x1={60 + 12 * cos}
              y1={60 + 12 * sin}
              x2={60 + 40 * cos}
              y2={60 + 40 * sin}
            />
          );
        })}
      </g>
    );
  } else if (cat === "coilover") {
    art = (
      <g {...common}>
        <line x1="60" y1="14" x2="60" y2="26" />
        <path d="M42 30 H78 M42 30 L78 40 M78 40 L42 50 M42 50 L78 60 M78 60 L42 70 M42 70 L78 80 M42 80 H78" />
        <rect x="52" y="84" width="16" height="22" rx="3" />
      </g>
    );
  } else if (cat === "seat") {
    art = (
      <g {...common}>
        <path d="M45 18 C68 14 78 22 76 40 L72 66 C71 74 64 78 56 78 L46 78 C40 78 36 74 37 68 L41 30 C42 22 42 19 45 18 Z" />
        <path d="M37 78 L34 96 C33 102 37 106 43 106 L70 106" />
        <line x1="48" y1="34" x2="68" y2="36" />
        <line x1="47" y1="46" x2="67" y2="48" />
      </g>
    );
  } else if (cat === "wing") {
    art = (
      <g {...common}>
        <path d="M14 46 C50 34 76 34 106 44 L106 54 C76 46 50 46 14 56 Z" />
        <line x1="38" y1="56" x2="38" y2="82" />
        <line x1="82" y1="52" x2="82" y2="82" />
        <line x1="28" y1="84" x2="48" y2="84" />
        <line x1="72" y1="84" x2="92" y2="84" />
      </g>
    );
  } else if (cat === "exhaust") {
    art = (
      <g {...common}>
        <path d="M14 74 H54 C66 74 66 58 78 58 H92" />
        <circle cx="100" cy="58" r="9" />
        <circle cx="100" cy="58" r="4" />
        <path d="M14 88 H60 C74 88 74 72 86 72" />
        <circle cx="100" cy="76" r="9" />
      </g>
    );
  } else if (cat === "turbo") {
    art = (
      <g {...common}>
        <circle cx="56" cy="60" r="26" />
        <path d="M56 60 m-14 0 a14 14 0 1 1 28 0 a14 14 0 1 1 -28 0" />
        <path d="M82 52 C96 48 102 54 104 62" />
        <path d="M56 34 L56 20 L74 20" />
        <circle cx="56" cy="60" r="4" fill={stroke} />
      </g>
    );
  }

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ opacity: 0.85 }}>
      {art}
    </svg>
  );
}
