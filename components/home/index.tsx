"use client"

import { useState, useEffect } from "react";
import RUD1DEVICE from '@/public/images/rud1.png'
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import unsecuredCopyToClipboard from '@/app/utils/unsecuredCopy'
import { Button } from "../ui/button";
const copyToClipboard = (content: any) => {
    if (window.isSecureContext && navigator.clipboard) {
        navigator.clipboard.writeText(content);
    } else {
        unsecuredCopyToClipboard(content);
    }
};

export default function HomePage() {
    const [config, setConfig] = useState<any>(null);
    const [time, setTime] = useState<any>('');
    const [uptime, setUptime] = useState<any>('');
    const [tailscaleConnectURL, setTailscaleConnectURL] = useState<any>('');
    const [tailscaleStatus, setTailscaleStatus] = useState('unknow')
    const { toast } = useToast()

    useEffect(() => {
        fetch("/api/config")
            .then((res) => res.json())
            .then((data) => setConfig(data))
            .catch((err) => console.error("Error cargando la configuración:", err));
        setInterval(() => {
            fetch("/api/execute?command=tailscale status")
                .then((res) => res.json())
                .then((data) => { (data.toString().includes('offers exit node') ? setTailscaleStatus('active') : setTailscaleStatus('desactive')) })
                .catch((err) => { console.error("Error ejecutando el commando:", err); setTailscaleStatus('error') });
            fetch("/api/execute?command=uptime | awk '{print $1}' ")
                .then((res) => res.json())
                .then((data) => { setTime(JSON.parse(data)[0]) })
                .catch((err) => { console.error("Error ejecutando el commando:", err) });
            fetch("/api/execute?command=uptime | awk '{print $3, $4, $5}' ")
                .then((res) => res.json())
                .then((data) => { setUptime(JSON.parse(data)[0]) })
                .catch((err) => { console.error("Error ejecutando el commando:", err) });
        }, 1000)
    }, []);


    const connectToTailscale = () => {
        fetch(`/api/execute?command=sudo tailscale up --hostname ${config.deviceName} --accept-routes --advertise-exit-node --advertise-routes 192.168.0.0/16,172.0.0.0/8,10.0.0.0/8&tailscaleJoin=true`)
            .then((res) => res.json())
            .then((data) => { setTailscaleConnectURL(data.url) })
            .catch((err) => { console.error("Error ejecutando el commando:", err) });
    }


    if (!config) return <p>Cargando...</p>;
    return (
        <section className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start px-8 md:px-0 w-full gap-16 font-[family-name:var(--font-geist-sans)]">
            <section className="flex flex-col gap-0 items-center h-full w-full">
                <h1 className="text-xl font-bold p-0 m-0">{config?.deviceName}</h1>
                <h2 className="text-sm font-normal p-0 m-0">{config?.tailscale.public_ip}</h2>
                <Image src={RUD1DEVICE} alt="" className="px-8 max-w-[700px] w-full" />
            </section>
            <section className="flex flex-col gap-4 items-start h-full w-full">
                <h1 className="text-2xl font-extrabold p-0 m-0">General</h1>
                <section className="flex flex-col items-start justify-center">
                    <h2 className="text-xl font-bold p-0 m-0">Sistema</h2>
                    <div className="p-0 pl-4 m-0 cursor-pointer hover:underline hover:text-[#333]" onClick={() => {
                        copyToClipboard(time);
                        toast({
                            title: "Hora copiada correctamente",
                            description: time,
                        })
                    }}><b>Hora:</b> {time}
                    </div>
                    <div className="p-0 pl-4 m-0 cursor-pointer hover:underline hover:text-[#333]" onClick={() => {
                        copyToClipboard(uptime);
                        toast({
                            title: "Tipo de uso copiado correctamente",
                            description: uptime,
                        })
                    }}><b>Tipo de uso:</b> {uptime}
                    </div>

                </section>

                <section className="flex flex-col items-start justify-center">
                    <h2 className="text-xl font-bold p-0 m-0">Red</h2>
                    <div className="p-0 pl-4 m-0 cursor-pointer hover:underline hover:text-[#333]" onClick={() => {
                        copyToClipboard(config.networkConfig.ipAddress);
                        toast({
                            title: "IP Privada copiada correctamente",
                            description: config.networkConfig.ipAddress,
                        })
                    }}><b>IP Privada:</b> {config.networkConfig.ipAddress}
                    </div>
                    <div className="p-0 pl-4 m-0 cursor-pointer hover:underline hover:text-[#333]" onClick={() => {
                        copyToClipboard(config.networkConfig.gateway);
                        toast({
                            title: "Puerta de enlace copiado correctamente",
                            description: config.networkConfig.gateway,
                        })
                    }}><b>Puerta de enlace:</b> {config.networkConfig.gateway}
                    </div>
                    <div className="p-0 pl-4 m-0 cursor-pointer hover:underline hover:text-[#333]" onClick={() => {
                        copyToClipboard(config.networkConfig.dns);
                        toast({
                            title: "Puerta de enlace copiado correctamente",
                            description: config.networkConfig.dns,
                        })
                    }}><b>DNS:</b> {config.networkConfig.dns}
                    </div>
                    <section className="flex flex-col gap-0 mt-2">
                        {config.networkConfig.interfaces.map((int: any, i: number) => {
                            return <div className="p-0 pl-4 m-0" key={int.name + i}><b>{int.name} ({int.type})</b>: {int.method}</div>
                        })
                        }
                    </section>
                </section>
                <section className="flex flex-col items-start justify-center">
                    <h2 className="text-xl font-bold p-0 m-0">Tailscale</h2>
                    {tailscaleStatus === 'unknow' &&
                        <div className="flex flex-row gap-2 items-center justify-center"><span className="w-4 h-4 rounded-full bg-[#555]" /> Desconocido</div>
                    }
                    {tailscaleStatus === 'active' &&
                        <div className="flex flex-row gap-2 items-center justify-center"><span className="w-4 h-4 rounded-full bg-[#1A1]" /> Activado y conectado</div>
                    }
                    {tailscaleStatus === 'desactive' &&
                        <div className="flex flex-row gap-2 items-center justify-center"><span className="w-4 h-4 rounded-full bg-[#888]" /> Desactivado</div>
                    }
                    {tailscaleStatus === 'error' &&
                        <div className="flex flex-row gap-2 items-center justify-center"><span className="w-4 h-4 rounded-full bg-[#A11]" /> Error</div>
                    }
                    <div className="p-0 pl-4 m-0 cursor-pointer hover:underline hover:text-[#333]" onClick={() => {
                        copyToClipboard(config.tailscale.public_ip);
                        toast({
                            title: "IP Publica copiada correctamente",
                            description: config.tailscale.public_ip,
                        })
                    }}><b>IP Publica:</b> {config.tailscale.public_ip}
                    </div>
                    <div className="flex flex-col gap-2 pt-4">
                        <Button onClick={connectToTailscale} disabled={tailscaleStatus === 'active' || (tailscaleConnectURL && tailscaleConnectURL == '')}>Conectar a Tailscale</Button>
                        {(tailscaleConnectURL && tailscaleConnectURL != '') &&
                            <a href={tailscaleConnectURL} target="_blank">Haz clic aqui para conectar: {tailscaleConnectURL}</a>
                        }
                    </div>
                </section>
            </section>
        </section >
    );
}
