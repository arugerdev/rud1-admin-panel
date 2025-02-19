'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const key = urlParams.get("key");
      const device = urlParams.get("device");

      if (!key) {
        router.push("/unauthorized"); // Redirigir si no hay clave
        return;
      }

      const res = await fetch(`/api/auth?key=${key}&device=${device}`);
      const data = await res.json();
      console.log(data);
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        router.push("/unauthorized"); // Redirigir si la clave es inválida
      }
    };

    checkAuth();
  }, [router]);


  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        {(!isAuthenticated ? null : children)}
      </body>
    </html>
  );
}

