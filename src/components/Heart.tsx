"use client";

export default function Heart({
  filled,
  onClick,
  size = 30,
}: {
  filled: boolean;
  onClick: () => void;
  size?: number;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={filled ? "Unlike" : "Like"}
      className="rounded-full border-none cursor-pointer bg-white/90 flex items-center justify-center p-0 shadow-[0_1px_3px_rgba(16,17,18,0.15)]"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.55}
        height={size * 0.55}
        fill={filled ? "#FF4400" : "none"}
        stroke={filled ? "#FF4400" : "#101112"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
