import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aipi.jaroslawjanas.dev"),
  title: "AIPI Bench — AI Model Performance Monitor",
  description: "Monitor TTFT, TPS, and response times for AI model APIs",
  openGraph: {
    title: "AIPI Bench — AI Model Performance Monitor",
    description: "Monitor TTFT, TPS, and response times for AI model APIs",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIPI Bench — AI Model Performance Monitor",
    description: "Monitor TTFT, TPS, and response times for AI model APIs",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}