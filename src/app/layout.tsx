import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { brand } from "@/config/brand";
import { Header } from "@/components/Header";
import { DemoMenu } from "@/components/DemoMenu";
import { BackToTop } from "@/components/BackToTop";
import { MobileBookingBar } from "@/components/MobileBookingBar";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${brand.name} | Agenda tu cita`,
  description: brand.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${barlow.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Header />
        {children}
        <DemoMenu />
        <BackToTop />
        <MobileBookingBar />
      </body>
    </html>
  );
}
