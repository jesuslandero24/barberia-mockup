"use client";

import { Check } from "lucide-react";
import { reservation } from "@/config/content";

type StepProgressProps = {
  current: number;
  onStepClick: (step: number) => void;
};

export function StepProgress({ current, onStepClick }: StepProgressProps) {
  return (
    <div>
      <ol className="grid grid-cols-3 gap-2">
        {reservation.steps.map((label, index) => {
          const number = index + 1;
          const done = current > number;
          const active = current === number;
          const clickable = number < current;

          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => clickable && onStepClick(number)}
                disabled={!clickable}
                aria-current={active ? "step" : undefined}
                className={`flex w-full flex-col items-center gap-2 text-center ${
                  clickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`grid size-9 place-items-center rounded-full border text-xs font-semibold transition duration-200 ${
                    active
                      ? "neon-glow border-accent bg-accent text-background"
                      : done
                        ? "border-accent/50 bg-accent/10 text-accent"
                        : "border-border bg-surface text-muted"
                  }`}
                >
                  {done ? <Check size={16} /> : number}
                </span>
                <span
                  className={`text-sm font-medium leading-tight ${
                    active
                      ? "text-foreground"
                      : done
                        ? "text-accent"
                        : "text-muted"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="progress-fill h-full w-full rounded-full bg-accent"
          style={{
            transform: `scaleX(${current / reservation.steps.length})`,
          }}
        />
      </div>
    </div>
  );
}
