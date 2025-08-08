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
  title: "VYSN Hub - Lighting Solutions",
  description: "Professional lighting products and solutions for electrical contractors",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#ffffff",
};

import MobileNav from '@/components/mobile-nav';
import AuthWrapper from '@/components/auth-wrapper';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black pb-20 md:pb-0 pt-18 md:pt-20`}
      >
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
        <AuthWrapper>
          {children}
          <MobileNav />
        </AuthWrapper>
      </body>
    </html>
  );
}
