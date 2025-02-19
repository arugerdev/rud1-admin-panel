"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function ConfigPage() {
    const [config, setConfig] = useState(null);
    const { toast } = useToast();
    const form = useForm({
        defaultValues: {
            deviceName: "",
            networkConfig: {
                ipAddress: "",
                gateway: "",
                dns: ["", ""],
            },
            simConfig: {
                pin: "",
            },
        },
    });

    useEffect(() => {
        fetch("/api/config")
            .then((res) => res.json())
            .then((data) => {
                setConfig(data);
                form.reset(data);
            })
            .catch((err) => console.error("Error cargando la configuración:", err));
    }, [form]);

    const onSubmit = async (values) => {
        try {
            const res = await fetch("/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                toast({ title: "Configuración guardada con éxito" });
            } else {
                toast({ title: "Error al guardar", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error al enviar configuración:", error);
            toast({ title: "Error al guardar", variant: "destructive" });
        }
    };

    if (!config) return <p>Cargando...</p>;

    return (
        <section className="flex flex-col items-start px-16 w-full">
            <h1 className="text-xl font-bold">{config.deviceName}</h1>
            <h2 className="text-sm">{config.tailscale.website}</h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <h1 className="font-extrabold text-xl">Configuración General</h1>

                    <FormField
                        control={form.control}
                        name="deviceName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del dispositivo:</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <h1 className="font-extrabold text-xl">Configuración de Red</h1>
                    <FormField
                        control={form.control}
                        name="networkConfig.ipAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dirección IP:</FormLabel>
                                <FormControl>
                                    <Input placeholder="192.168.0.10/24" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="networkConfig.gateway"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gateway:</FormLabel>
                                <FormControl>
                                    <Input placeholder="192.168.0.1/24" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <h1 className="font-extrabold text-xl">Configuración de SIM</h1>
                    <FormField
                        control={form.control}
                        name="simConfig.pin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>PIN de la SIM:</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="0000" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button type="submit">Guardar</Button>
                </form>
            </Form>
        </section>
    );
}
