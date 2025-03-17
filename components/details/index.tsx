"use client"

import { useState, useEffect } from "react";

export default function DetailsPage() {
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {

        setInterval(() => {
            // Obtener la configuración desde la API
            fetch("/api/config")
                .then((res) => res.json())
                .then((data) => { setConfig(data); console.log({ data }) })
                .catch((err) => console.error("Error cargando la configuración:", err));
        }, 1000)
    }
        , []);

    if (!config) return <p>Cargando...</p>;

    return (
        <section className="flex flex-col w-full items-start justify-start px-8 md:ox-24 font-[family-name:var(--font-geist-sans)]">
            <section className="flex flex-col md:flex-row gap-2 w-full items-start justify-between">

                <section className="flex flex-col px-8 md:px-0 w-full gap-4">
                    <h1 className="text-2xl font-bold">Detalles del Sistema</h1>

                    {/* Información del dispositivo */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold">Información del Dispositivo</h2>
                        <p><b>Nombre:</b> {config.device.name}</p>
                        <p><b>Descripción:</b> {config.device.description}</p>
                        <p><b>Ubicación:</b> {config.device.location || "No especificada"}</p>
                        <p><b>Fabricante:</b> {config.device.manufacturer}</p>
                        <p><b>Modelo:</b> {config.device.model}</p>
                        <p><b>Número de serie:</b> {config.device.serial_number}</p>
                        <p><b>Versión del firmware:</b> {config.device.firmware_version}</p>
                    </section>

                    {/* Información del sistema operativo */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold">Sistema Operativo</h2>
                        <p><b>Nombre:</b> {config.device.os.name}</p>
                        <p><b>Versión:</b> {config.device.os.version}</p>
                        <p><b>Kernel:</b> {config.device.os.kernel}</p>
                    </section>


                </section>

                <section className="flex flex-col px-8 md:px-0 w-full gap-4">
                    {/* Información de red */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold">Red</h2>
                        {config.network.interfaces.map((int: any, i: number) => (
                            <div key={int.name + i} className="flex flex-col gap-2">
                                <h3 className="text-lg font-semibold">{int.name} ({int.type})</h3>
                                <p><b>IPv4:</b> {int.ipv4}</p>
                                <p><b>Máscara de red:</b> {int.netmask}</p>
                                <p><b>Puerta de enlace:</b> {int.gateway}</p>
                                {(int?.dns) &&
                                    <p><b>DNS:</b> {(int.dns.length > 1 ? int.dns.join(", ") : int.dns)}</p>
                                }
                                <p><b>Estado:</b> {int.status}</p>
                            </div>
                        ))}
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">Tailscale</h3>
                            <p><b>Estado:</b> {config.services.tailscale.status}</p>
                            <p><b>IP de Tailscale:</b> {config.services.tailscale.tailscale_ip}</p>
                        </div>
                    </section>

                </section>
                <section className="flex flex-col px-8 md:px-0 w-full gap-4">
                    {/* Servicios */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold">Servicios</h2>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">VirtualHere</h3>
                            <p><b>Estado:</b> {config.services.virtualhere.status}</p>
                            <p><b>Versión:</b> {config.services.virtualhere.version}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">DHCP</h3>
                            <p><b>Estado:</b> {config.services.dhcp.status}</p>
                            <p><b>Rango:</b> {config.services.dhcp.range}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">DNS</h3>
                            <p><b>Estado:</b> {config.services.dns.status}</p>
                            <p><b>Servidores:</b> {config.services.dns.servers.join(", ")}</p>
                        </div>
                    </section>
                </section>
                <section className="flex flex-col px-8 md:px-0 w-full gap-4">
                    {/* Información del sistema */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold">Estado del Sistema</h2>
                        <p><b>Estado:</b> {config.system.status}</p>
                        <p><b>Tiempo de actividad:</b> {config.system.uptime}</p>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">CPU</h3>
                            <p><b>Uso:</b> {config.system.cpu.usage_percent}%</p>
                            <p><b>Temperatura:</b> {config.system.cpu.temperature}°C</p>
                            <p><b>Carga promedio:</b> {config.system.cpu.load_average.join(", ")}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">Memoria</h3>
                            <p><b>Total:</b> {config.system.memory.total_mb} MB</p>
                            <p><b>Usada:</b> {config.system.memory.used_mb} MB</p>
                            <p><b>Libre:</b> {config.system.memory.free_mb} MB</p>
                            <p><b>Uso:</b> {config.system.memory.usage_percent}%</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">Disco</h3>
                            <p><b>Total:</b> {config.system.disk.total_gb} GB</p>
                            <p><b>Usado:</b> {config.system.disk.used_gb} GB</p>
                            <p><b>Libre:</b> {config.system.disk.free_gb} GB</p>
                            <p><b>Uso:</b> {config.system.disk.usage_percent}%</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">Uso de Red</h3>
                            <p><b>eth0 (RX/TX):</b> {config.system.network_usage.eth0.rx_bytes} / {config.system.network_usage.eth0.tx_bytes} bytes</p>
                            <p><b>wlan0 (RX/TX):</b> {config.system.network_usage.wlan0.rx_bytes} / {config.system.network_usage.wlan0.tx_bytes} bytes</p>
                        </div>
                    </section>
                </section>
                <section className="flex flex-col px-8 md:px-0 w-full gap-4">


                    {/* Logs */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold">Logs</h2>
                        <p><b>Logs del sistema:</b> {config.logs.system_logs}</p>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">Logs de Servicios</h3>
                            <p><b>Tailscale:</b> {config.logs.service_logs.tailscale}</p>
                            <p><b>VirtualHere:</b> {config.logs.service_logs.virtualhere}</p>
                            <p><b>Cloudflare Tunnel:</b> {config.logs.service_logs.cloudflare_tunnel}</p>
                        </div>
                    </section>

                    {/* Última actualización */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold">Última Actualización</h2>
                        <p>{config.last_updated}</p>
                    </section>
                </section>
            </section>
        </section>
    );
}