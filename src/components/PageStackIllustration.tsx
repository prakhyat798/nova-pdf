/** Simple SVG: overlapping page outlines — used in featured/wide bento cards */
export function PageStackIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Back page */}
      <rect
        x="14" y="8" width="52" height="68"
        rx="6"
        fill="#C4D9BC"
        opacity="0.45"
        transform="rotate(-6 14 8)"
      />
      {/* Mid page */}
      <rect
        x="10" y="14" width="52" height="68"
        rx="6"
        fill="#D4B896"
        opacity="0.4"
        transform="rotate(2 10 14)"
      />
      {/* Front page */}
      <rect x="8" y="18" width="54" height="68" rx="6" fill="#FEFCF8" />
      {/* Lines on front */}
      <rect x="18" y="30" width="34" height="2.5" rx="1.25" fill="#C4D9BC" />
      <rect x="18" y="38" width="26" height="2.5" rx="1.25" fill="#C4D9BC" />
      <rect x="18" y="46" width="30" height="2.5" rx="1.25" fill="#E8E4DD" />
      <rect x="18" y="54" width="20" height="2.5" rx="1.25" fill="#E8E4DD" />
      {/* Lime corner fold */}
      <path d="M50 18 L62 18 L62 30 Z" fill="#AAFF4D" opacity="0.7" />
    </svg>
  )
}
