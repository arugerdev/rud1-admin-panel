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
    <html lang="en" className="h-screen w-screen">
      <body
        className={`w-full min-h-screen h-full flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        {children}
        <footer className="static mt-4 bottom-0 w-full text-center text-xs p-2 flex flex-row gap-8">
          <a href="https://dashboard.rud1.es" className="w-full text-[#55A] font-bold text-md">www.rud1.es</a>
          <small className="whitespace-nowrap">Version 1.5b 2025 - Rud1</small>
        </footer>
      </body>
    </html>
  );
}

