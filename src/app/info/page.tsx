import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { infoPage } from "@/config/content";
import { InfoView } from "@/components/InfoView";

export const metadata: Metadata = {
  title: `${infoPage.title} | ${brand.name}`,
  description: infoPage.subtitle,
};

export default function InfoPage() {
  return <InfoView />;
}
