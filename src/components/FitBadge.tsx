export default function FitBadge({
  vehicleLabel,
  compact,
}: {
  vehicleLabel: string;
  compact?: boolean;
}) {
  return (
    <span
      className="font-mono inline-block bg-fit text-white font-semibold rounded whitespace-nowrap tracking-wider"
      style={{
        fontSize: compact ? 9 : 10,
        padding: compact ? "3px 6px" : "4px 8px",
      }}
    >
      FITS YOUR {vehicleLabel.toUpperCase()}
    </span>
  );
}
