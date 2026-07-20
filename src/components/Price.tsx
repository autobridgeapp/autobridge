export default function Price({
  value,
  size = 18,
}: {
  value: number;
  size?: number;
}) {
  return (
    <span className="font-extrabold" style={{ fontSize: size }}>
      ${value.toLocaleString()}
    </span>
  );
}
