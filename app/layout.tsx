'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



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
        <Toaster />
        {children}
        <footer className="absolute bottom-0 w-full text-center text-xs p-2 flex flex-row gap-8">
          <a href="https://dashboard.rud1.es" className="w-full text-primary">www.rud1.es</a>
          <small>Version 1.1b 2025 - Rud1</small>
        </footer>
      </body>
    </html>
  );
}

