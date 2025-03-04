"use client"

import { useState, useEffect } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert } from "../ui/alert";

type FormValues = {
    deviceName: string;
    networkConfig: {
        interfaces: {
            name: string;
            type: string;
            method: string;
            ssid?: string;
            password?: string;
        }[];
        ipAddress: string;
        gateway: string;
        dns: string[];
    };
    simConfig: {
        pin: string;
    };
    tailscale: {
        public_ip: string;
    };
};

export default function ServicesPage() {
    const [config, setConfig] = useState<FormValues | null>(null);

    useEffect(() => {
        fetch("/api/config")
            .then((res) => res.json())
            .then((data) => {
                setConfig(data);
            })
            .catch((err) => console.error("Error cargando la configuración:", err));
    }, []);

    return (
        <section className="flex flex-col w-full items-start justify-start px-24 font-[family-name:var(--font-geist-sans)]">
            <section className="flex flex-col px-8 md:px-0 w-full gap-4">
                <h1 className="text-2xl font-bold">Servicios</h1>
                {/* Lista de servicios con check de activacion o desactivacion, deben de ser dropdown para ajustes extras */}

                <Accordion type="single" collapsible>
                    <AccordionItem value="nodered">
                        <AccordionTrigger className="flex flex-row gap-4 w-full items-center justify-start">
                            <Checkbox disabled checked />
                            <p>NodeRed - Dum1</p>
                        </AccordionTrigger>
                        <AccordionContent className="w-full flex flex-col gap-4">
                            <Alert>Servicio de automatización de recojidas de datos de dispositivos industriales como PLC, HMI y otras tareas automatizadas.</Alert>

                            {config?.tailscale.public_ip &&
                                <a href={`http://${config?.tailscale.public_ip}:1880`} target="_blank" className="w-full text-[#33F] underline font-extrabold">Ir al panel</a>
                            }
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </section>
        </section>

    );
}
