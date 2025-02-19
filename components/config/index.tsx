"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { cn } from "@/lib/utils";

type FormValues = {
    deviceName: string;
    networkConfig: {
        ipAddress: string;
        gateway: string;
        dns: string[];
    };
    simConfig: {
        pin: string;
    };
};

export default function ConfigPage() {
    const [config, setConfig] = useState<FormValues | null>(null);

    const { toast } = useToast();
    const form = useForm<FormValues>({
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

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "networkConfig.dns",
        rules: { minLength: 1, maxLength: 5 }
    })

    useEffect(() => {
        fetch("/api/config")
            .then((res) => res.json())
            .then((data) => {
                setConfig(data);
                form.reset(data);
            })
            .catch((err) => console.error("Error cargando la configuración:", err));
    }, [form]);

    useEffect(() => {
        if (config) {
            console.log({ config });
        }
    }, [config]);
    useEffect(() => {
        if (fields) {
            console.log({ fields });
        }
    }, [fields]);

    const onSubmit = async (values: any) => {
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
    if (!form) return <p>Error al cargar el formulario</p>;
    if (!config.deviceName) return <p>Error: no se ha podido cargar la configuración</p>

    return (
        <section className="flex flex-col items-start gap-8 px-16 w-full h-full">
            <section className="flex flex-col gap-0 p-0 m-0">
                <h1 className="text-xl font-bold">{config.deviceName}</h1>
                <h2 className="text-sm">{config.tailscale.website}</h2>
            </section>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 w-full h-full">
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
                    <section className="flex flex-row">
                        <section className="flex flex-col w-1/2 gap-4">
                            <h1 className="font-extrabold text-xl">Configuración de Red</h1>
                            <Alert variant="destructive" >
                                <AlertTitle>Espera!</AlertTitle>
                                <AlertDescription>
                                    Antes de cambiar la configuración de red, asegúrate de que los valores son correctos para cada situación. Si no estás seguro, consulta con el administrador de red.
                                </AlertDescription>
                            </Alert>
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


                            <div>
                                {fields.map((d, i) => (
                                    <FormField
                                        control={form.control}
                                        key={d.id}
                                        name={`networkConfig.dns`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={cn(i !== 0 && "sr-only")}>
                                                    DNS
                                                </FormLabel>
                                                <FormDescription className={cn(i !== 0 && "sr-only")}>
                                                    Add DNS for system
                                                </FormDescription>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => append({ value: "" })}
                                >
                                    Añadir DNS
                                </Button>
                            </div>


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
                        </section>
                        <section className="flex flex-col w-1/2">

                        </section>
                    </section>
                    <section className="flex flex-row justify-end w-full pt-4">
                        <Button type="submit">Guardar</Button>
                    </section>
                </form>
            </Form>
        </section>
    );
}
