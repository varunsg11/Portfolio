import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/content";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: profile.name,
  description: profile.metaDescription,
  openGraph: {
    title: `${profile.name} — Agentic AI Developer`,
    description:
      "Incoming MCS student at Texas A&M. 3+ years building multi-agent AI systems at SAP Labs. Seeking Summer 2027 internships in AI/ML/SWE.",
    type: "website",
    url: "https://varunsg.dev",
    images: [{ url: "https://varunsg.dev/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Agentic AI Developer`,
    description:
      "Incoming MCS student at Texas A&M. 3+ years building multi-agent AI systems at SAP Labs. Seeking Summer 2027 internships.",
    images: ["https://varunsg.dev/api/og"],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
