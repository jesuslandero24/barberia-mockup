import { CheckCheck, MoreVertical, Phone, Video } from "lucide-react";
import { brand } from "@/config/brand";
import { reservation } from "@/config/content";

type WhatsAppPreviewProps = {
  title: string;
  message: string;
  time: string;
  direction: "outgoing" | "incoming";
  delay?: number;
};

export function WhatsAppPreview({
  title,
  message,
  time,
  direction,
  delay = 0,
}: WhatsAppPreviewProps) {
  const outgoing = direction === "outgoing";
  const initial = brand.name.trim().charAt(0).toUpperCase();

  return (
    <div>
      <p className="mb-3 text-sm leading-relaxed text-muted">{title}</p>

      <div className="mx-auto w-full max-w-[320px] rounded-[2.5rem] border border-border bg-[#0b141a] p-2 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.95)]">
        <div className="overflow-hidden rounded-[2rem] border border-white/10">
          <div className="flex items-center gap-2.5 bg-[#1f2c34] px-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#2a3942] font-display text-sm font-semibold text-white">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {brand.name}
              </p>
              <p className="text-xs text-white/60">
                {reservation.success.online}
              </p>
            </div>
            <Phone size={14} className="text-white/70" aria-hidden="true" />
            <Video size={14} className="text-white/70" aria-hidden="true" />
            <MoreVertical
              size={14}
              className="text-white/70"
              aria-hidden="true"
            />
          </div>

          <div className="min-h-[180px] space-y-2 bg-[#0b141a] bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.04),transparent_45%),radial-gradient(circle_at_78%_82%,rgba(255,255,255,0.03),transparent_42%)] px-3 py-4">
            <div
              className={`whatsapp-bubble max-w-[88%] px-3 py-2 text-[15px] leading-snug text-white/95 shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${
                outgoing
                  ? "ml-auto rounded-lg rounded-tr-none bg-[#005c4b]"
                  : "mr-auto rounded-lg rounded-tl-none bg-[#202c33]"
              }`}
              style={{ animationDelay: `${delay}ms` }}
            >
              <p>{message}</p>
              <p className="mt-1 flex items-center justify-end gap-1 text-xs text-white/60">
                {time}
                {outgoing ? (
                  <CheckCheck
                    size={13}
                    className="text-[#53bdeb]"
                    aria-hidden="true"
                  />
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
