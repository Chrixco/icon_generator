import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "🎮 Game Icon Generator - 2025 Edition",
  description: "Create magical game icons using AI with our cozy RPG-themed generator. Powered by Google AI and OpenAI.",
  keywords: ["game icons", "AI image generation", "icon creator", "game development", "DALL-E", "Google AI"],
  authors: [{ name: "Game Icon Generator" }],
  creator: "Game Icon Generator",
  publisher: "Game Icon Generator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "🎮 Game Icon Generator - 2025 Edition",
    description: "Create magical game icons using AI with our cozy RPG-themed generator",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "🎮 Game Icon Generator - 2025 Edition",
    description: "Create magical game icons using AI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <main className="relative">
          {children}
        </main>
      </body>
    </html>
  );
}
