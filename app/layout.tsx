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
  metadataBase: new URL("https://atlas-board-map.jazzy-fawn-1358.chatgpt.site"),
  title: "Atlas Board",
  description: "A placement map for dropping, dragging, and organizing items.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Atlas Board",
    description: "Place, drag, and organize items on a map.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Atlas Board placement map preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Board",
    description: "Place, drag, and organize items on a map.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
