"use client"

import { useState, useEffect } from "react";

export default function DetailsPage() {
    const [systemInfo, setSystemInfo] = useState<any>(null);
    const [cpuTemp, setCpuTemp] = useState<any>('');
    const [ramUsage, setRamUsage] = useState<any>('');
    const [diskUsage, setDiskUsage] = useState<any>('');

    useEffect(() => {
        const fetchSystemInfo = () => {
            // Obtener temperatura del CPU
            fetch("/api/execute?command=cat /sys/class/thermal/thermal_zone0/temp")
                .then((res) => res.json())
                .then((data) => setCpuTemp(parseInt(data.output[0]) / 1000 + "°C"))
                .catch((err) => console.error("Error al obtener la temperatura del CPU:", err));

            // Obtener uso de RAM
            fetch("/api/execute?command=free -h | grep Mem | awk '{print $3}'")
                .then((res) => res.json())
                .then((data) => setRamUsage((!data.success ? data.error : data.output[0])))
                .catch((err) => console.error("Error al obtener el uso de RAM:", err));

            // Obtener uso de disco
            fetch("/api/execute?command=df -h / | grep / | awk '{print $5}'")
                .then((res) => res.json())
                .then((data) => setDiskUsage((!data.success ? data.error : data.output[0])))
                .catch((err) => console.error("Error al obtener el uso de disco:", err));

            // Obtener información general del sistema
            fetch("/api/execute?command=hostnamectl")
                .then((res) => res.json())
                .then((data) => setSystemInfo((!data.success ? data.error : data.output[0])))
                .catch((err) => console.error("Error al obtener la información del sistema:", err));
        };

        fetchSystemInfo();
        setInterval(fetchSystemInfo, 1000);  // Actualizar cada 5 segundos
    }, []);

    return (
        <section className="flex flex-col w-full items-start justify-start px-24 font-[family-name:var(--font-geist-sans)]">
            <section className="flex flex-col px-8 md:px-0 w-full gap-4">
                <h1 className="text-2xl font-bold">Detalles del Sistema</h1>

                {/* Información general del sistema */}
                {systemInfo && (
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold">Información del Sistema</h2>
                        <div><b>Nombre del Host:</b> {systemInfo.hostname}</div>
                        <div><b>Operativo:</b> {systemInfo.operating_system}</div>
                        <div><b>Versión del Kernel:</b> {systemInfo.kernel}</div>
                    </section>
                )}

                {/* Temperatura del CPU */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold">Temperatura del CPU</h2>
                    <div>{cpuTemp ? cpuTemp : "Cargando..."}</div>
                </section>

                {/* Uso de RAM */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold">Uso de RAM</h2>
                    <div>{ramUsage ? ramUsage : "Cargando..."}</div>
                </section>

                {/* Uso de Disco */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold">Uso de Disco</h2>
                    <div>{diskUsage ? diskUsage : "Cargando..."}</div>
                </section>


            </section>
        </section>

    );
}
