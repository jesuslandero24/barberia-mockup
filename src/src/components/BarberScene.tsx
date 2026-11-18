"use client";

import { useEffect, useState } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const initialTimer = window.setTimeout(() => setReduced(mq.matches), 0);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => {
      window.clearTimeout(initialTimer);
      mq.removeEventListener("change", onChange);
    };
  }, []);
  return reduced;
}

const STRIPE_COLORS = ["#A8323A", "#F2EBDD", "#1F3A5F"];

const STRIPES = Array.from({ length: 15 }, (_, i) => {
  const y = -40 + i * 40;
  return {
    key: i,
    color: STRIPE_COLORS[i % 3],
    points: `155,${y} 265,${y - 45} 265,${y - 5} 155,${y + 40}`,
  };
});

export default function BarberScene({ className = "" }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const animate = !reduced;

  return (
    <svg
      viewBox="0 0 420 600"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bs-gold" gradientUnits="userSpaceOnUse" x1="100" y1="50" x2="320" y2="560">
          <stop offset="0" stopColor="#F0D699" />
          <stop offset="0.5" stopColor="#D4A95A" />
          <stop offset="1" stopColor="#8A6B33" />
        </linearGradient>
        <linearGradient id="bs-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.5" />
          <stop offset="0.2" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="0.34" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="0.72" stopColor="#000" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="bs-glow" cx="210" cy="300" r="240" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#D4A95A" stopOpacity="0.22" />
          <stop offset="1" stopColor="#D4A95A" stopOpacity="0" />
        </radialGradient>
        <clipPath id="bs-pole-clip">
          <rect x="165" y="120" width="90" height="360" rx="8" />
        </clipPath>
      </defs>

      <circle cx="210" cy="300" r="240" fill="url(#bs-glow)" />

      {/* Anillo decorativo fijo */}
      <g opacity="0.55">
        <circle cx="210" cy="300" r="200" fill="none" stroke="#D4A95A" strokeWidth="1" opacity="0.5" />
        <circle
          cx="210"
          cy="300"
          r="186"
          fill="none"
          stroke="#D4A95A"
          strokeWidth="8"
          strokeDasharray="1.5 14"
          opacity="0.7"
        />
      </g>

      {/* Tijeras fijas detrás del poste */}
      <g opacity="0.62">
        <polygon points="62,70 222,303 198,317" fill="url(#bs-gold)" />
        <polygon points="358,70 198,303 222,317" fill="url(#bs-gold)" />
        <line x1="210" y1="310" x2="300" y2="428" stroke="url(#bs-gold)" strokeWidth="14" strokeLinecap="round" />
        <line x1="210" y1="310" x2="120" y2="428" stroke="url(#bs-gold)" strokeWidth="14" strokeLinecap="round" />
        <circle cx="322" cy="470" r="42" fill="none" stroke="url(#bs-gold)" strokeWidth="13" />
        <circle cx="98" cy="470" r="42" fill="none" stroke="url(#bs-gold)" strokeWidth="13" />
        <circle cx="210" cy="310" r="10" fill="#F0D699" />
        <circle cx="210" cy="310" r="4" fill="#0A0A0B" />
      </g>

      {/* Sombra bajo el poste */}
      <ellipse cx="210" cy="540" rx="72" ry="8" fill="#000" opacity="0.3" />

      {/* Cuerpo del poste: franjas que suben/bajan sin parar */}
      <g clipPath="url(#bs-pole-clip)">
        <rect x="165" y="120" width="90" height="360" fill="#F2EBDD" />
        <g>
          {STRIPES.map((s) => (
            <polygon key={s.key} points={s.points} fill={s.color} />
          ))}
          {animate && (
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="0 120"
              dur="9s"
              repeatCount="indefinite"
            />
          )}
        </g>
        {/* Efecto de vidrio */}
        <rect x="165" y="120" width="90" height="360" fill="url(#bs-glass)" />
        <rect x="181" y="130" width="6" height="340" rx="3" fill="#fff" opacity="0.3" />
      </g>

      {/* Tapas doradas */}
      <path d="M172 100 C172 60 248 60 248 100 Z" fill="url(#bs-gold)" />
      <circle cx="210" cy="64" r="7" fill="url(#bs-gold)" />
      <rect x="155" y="96" width="110" height="26" rx="8" fill="url(#bs-gold)" />
      <rect x="165" y="122" width="90" height="5" fill="#000" opacity="0.28" />
      <rect x="155" y="478" width="110" height="26" rx="8" fill="url(#bs-gold)" />
      <rect x="165" y="473" width="90" height="5" fill="#000" opacity="0.28" />
      <path d="M178 504 H242 L234 524 H186 Z" fill="url(#bs-gold)" />
      <rect x="160" y="100" width="100" height="3" rx="1.5" fill="#fff" opacity="0.35" />
    </svg>
  );
}
