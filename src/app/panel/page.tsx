import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { panel } from "@/config/content";
import { PanelView } from "@/components/panel/PanelView";

export const metadata: Metadata = {
  title: `${panel.eyebrow} | ${brand.name}`,
  description: panel.intro,
};

export default function PanelPage() {
  return (
    <main className="flex-1">
      <PanelView />
    </main>
  );
}
