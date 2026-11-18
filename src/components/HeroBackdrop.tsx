import type { ComponentType, CSSProperties, SVGProps } from "react";
import { Scissors } from "lucide-react";
import {
  BarberClipperIcon as ClipperIcon,
  BarberCombIcon as CombIcon,
  BarberRazorIcon as RazorIcon,
} from "@/components/icons/BarberIcons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type BackdropItem = {
  id: string;
  Icon: IconComponent;
  top: string;
  left: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  rotateStart: number;
  rotateEnd: number;
  desktopOnly?: boolean;
};

const backdropItems: BackdropItem[] = [
  {
    id: "razor-top-left",
    Icon: RazorIcon,
    top: "10%",
    left: "4%",
    size: 76,
    opacity: 0.07,
    duration: 18,
    delay: 0,
    rotateStart: -12,
    rotateEnd: 10,
  },
  {
    id: "comb-top-right",
    Icon: CombIcon,
    top: "6%",
    left: "83%",
    size: 92,
    opacity: 0.08,
    duration: 22,
    delay: -3,
    rotateStart: 8,
    rotateEnd: -10,
  },
  {
    id: "scissors-bottom-right",
    Icon: Scissors,
    top: "70%",
    left: "86%",
    size: 60,
    opacity: 0.06,
    duration: 26,
    delay: -6,
    rotateStart: -6,
    rotateEnd: 12,
  },
  {
    id: "clipper-middle-left",
    Icon: ClipperIcon,
    top: "42%",
    left: "2%",
    size: 64,
    opacity: 0.06,
    duration: 16,
    delay: -2,
    rotateStart: 12,
    rotateEnd: -8,
    desktopOnly: true,
  },
  {
    id: "razor-middle-right",
    Icon: RazorIcon,
    top: "38%",
    left: "60%",
    size: 112,
    opacity: 0.07,
    duration: 28,
    delay: -8,
    rotateStart: -10,
    rotateEnd: 8,
    desktopOnly: true,
  },
  {
    id: "comb-bottom",
    Icon: CombIcon,
    top: "80%",
    left: "34%",
    size: 120,
    opacity: 0.06,
    duration: 24,
    delay: -5,
    rotateStart: 10,
    rotateEnd: -12,
    desktopOnly: true,
  },
];

export function HeroBackdrop() {
  return (
    <div
      className="hero-backdrop-mask pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {backdropItems.map((item) => {
        const Icon = item.Icon;

        return (
          <div
            key={item.id}
            className={`hero-symbol absolute text-accent ${
              item.desktopOnly ? "hidden md:block" : ""
            }`}
            style={
              {
                top: item.top,
                left: item.left,
                width: item.size,
                height: item.size,
                opacity: item.opacity,
                animationDuration: `${item.duration}s`,
                animationDelay: `${item.delay}s`,
                "--symbol-rotate-start": `${item.rotateStart}deg`,
                "--symbol-rotate-end": `${item.rotateEnd}deg`,
              } as CSSProperties
            }
          >
            <Icon className="size-full" strokeWidth={1.5} />
          </div>
        );
      })}
    </div>
  );
}
