import { MY_CAR } from "@/lib/constants";

export default function FitBadge({ compact }: { compact?: boolean }) {
  return (
    <span
      className="font-mono inline-block bg-fit text-white font-semibold rounded whitespace-nowrap tracking-wider"
      style={{
        fontSize: compact ? 9 : 10,
        padding: compact ? "3px 6px" : "4px 8px",
      }}
    >
      FITS YOUR {MY_CAR.short.toUpperCase()}
    </span>
  );
}
