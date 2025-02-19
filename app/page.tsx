"use client"

import ConfigPage from "@/components/config";
import HomePage from "@/components/home";
import { Navbar } from "@/components/navbar";
import { useState } from "react";

export default function Home() {
  const [page, setPage] = useState('general');
  return (
    <div className="flex flex-col items-start justify-start gap-16 font-[family-name:var(--font-geist-sans)]">
      <Navbar setPage={setPage} />
      <main className="flex flex-col gap-8 items-center h-full w-full">
        {(page === 'general') && <HomePage />}
        {(page === 'config') && <ConfigPage />}
        {(page === 'services') && <h1>Panel de servicios</h1>}
        {(page === 'details') && <h1>Detalles</h1>}
        {(page === 'help') && <h1>Ayuda</h1>}
        {(page === 'actions') && <h1>Acciones</h1>}
      </main>

    </div>
  );
}
