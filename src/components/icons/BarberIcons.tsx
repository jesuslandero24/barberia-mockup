import type { SVGProps } from "react";

type BarberIconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function BarberRazorIcon(props: BarberIconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M10 50 27 33" />
      <path d="M22 38 43 17l7 7-21 21-7-7Z" />
      <path d="m43 17 6-6 7 7-6 6" />
      <circle cx="33" cy="34" r="2" />
    </svg>
  );
}

export function BarberCombIcon(props: BarberIconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="10" y="20" width="44" height="10" rx="3" />
      <path d="M16 30v14M22 30v11M28 30v14M34 30v11M40 30v14M46 30v11M52 30v14" />
    </svg>
  );
}

export function BarberClipperIcon(props: BarberIconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="21" y="21" width="22" height="31" rx="4" />
      <path d="M24 21v-6h16v6" />
      <path d="M26 15v-4M31 15v-4M36 15v-4M41 15v-4" />
      <path d="M27 31h10" />
      <circle cx="32" cy="43" r="3.5" />
    </svg>
  );
}

export function BarberPoleIcon(props: BarberIconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="24" y="13" width="16" height="38" rx="8" />
      <path d="M24 19h16M24 45h16" />
      <path d="m25 27 14-6M25 35l14-6M25 43l14-6" />
    </svg>
  );
}
