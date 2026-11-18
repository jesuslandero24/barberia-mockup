import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/** Base común: solo contorno, hereda el color del texto (currentColor). */
function Base({ size = 64, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Navaja de barbero a medio abrir: mango abajo y hoja hacia arriba. */
export function RazorIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="14" y="42" width="46" height="10" rx="5" />
      <g transform="rotate(-62 22 47)">
        <path d="M22 43 H56 Q61 43 60 47 Q59 50.5 54 50.5 H22 Z" />
        <path d="M30 46.75 H52" />
      </g>
      <circle cx="22" cy="47" r="2.5" />
    </Base>
  );
}

/** Peine. */
export function CombIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="6" y="12" width="52" height="16" rx="5" />
      <path d="M12 20 H52" />
      <path d="M12 28 V48 M19 28 V50 M26 28 V48 M33 28 V50 M40 28 V48 M47 28 V50 M52 28 V48" />
    </Base>
  );
}

/** Máquina de cortar cabello. */
export function ClipperIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M22 6 H42 Q46 6 46 10 V38 Q46 42 42 42 H22 Q18 42 18 38 V10 Q18 6 22 6 Z" />
      <rect x="28.5" y="14" width="7" height="12" rx="3.5" />
      <path d="M32 31 V36" />
      <path d="M16 42 H48 V50 H16 Z" />
      <path d="M21 50 V57 M27 50 V57 M33 50 V57 M39 50 V57 M45 50 V57" />
    </Base>
  );
}

/** Poste de barbero en versión pequeña. */
export function PoleIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="19" y="6" width="26" height="7" rx="3" />
      <rect x="19" y="51" width="26" height="7" rx="3" />
      <rect x="22" y="13" width="20" height="38" rx="3" />
      <path d="M22 24 L42 16 M22 35 L42 27 M22 46 L42 38" />
    </Base>
  );
}
