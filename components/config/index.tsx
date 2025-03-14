"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { set, useForm } from "react-hook-form";
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "../ui/select";
import { Loader } from "lucide-react";

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

export default function ConfigPage() {
    const [config, setConfig] = useState<FormValues | null>(null);
    const [inactive, setInactive] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const { toast } = useToast();
    const form = useForm<FormValues>({
        defaultValues: {
            deviceName: "",
            networkConfig: {
                ipAddress: "",
                gateway: "",
                dns: ["", ""],
                interfaces: [
                    { name: "eth0", type: "Ethernet", method: "dhcp" },
                    { name: "wlan0", type: "Wi-Fi", method: "dhcp", ssid: '', password: '' },
                ],
            },
            simConfig: {
                pin: "",
            },
            tailscale: {
                public_ip: ""
            }
        }
    });

    // const { fields, append, remove } = useFieldArray({
    //     control: form.control,
    //     name: NEVER,
    //     rules: { minLength: 1, maxLength: 5 }
    // })

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


    const onSubmit = async (values: any) => {
        setInactive(true);
        setLoading(true);
        try {
            const res = await fetch("/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                toast({ title: "Configuración guardada con éxito" });

                fetch(`/api/execute?command=sudo hostnamectl set-hostname ${config?.deviceName.toLocaleLowerCase().split(' ').join('-').toString()}`)
                    .then((res) => res.json())
                    .then((data) => { })
                    .catch((err) => {
                        toast({ title: `Error ejecutando el commando.`, variant: 'destructive', description: err });
                        setInactive(false);
                        setLoading(false);
                    });

                fetch("/api/execute?command=sudo python3 /etc/applyNetplan.py")
                    .then((res) => res.json())
                    .then((data) => {
                        fetch(`/api/execute?command=sudo systemctl restart NetworkManager`).finally(() => {
                            toast({ title: `Configuracion Aplicada`, description: data });
                            setInactive(false);
                            setLoading(false);
                        })
                    })
                    .catch((err) => {
                        toast({ title: `Error ejecutando el commando.`, variant: 'destructive', description: err });
                        setInactive(false);
                        setLoading(false);
                    });

            } else {
                toast({ title: "Error al guardar", description: res.statusText, variant: "destructive" });
                setInactive(false);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error al enviar configuración:", error);
            toast({ title: "Error al guardar", variant: "destructive" });
            setInactive(false);
            setLoading(false);
        }
    };

    if (!config) return <p>Cargando...</p>;
    if (!form) return <p>Error al cargar el formulario</p>;
    if (!config.deviceName) return <p>Error: no se ha podido cargar la configuración</p>

    return (
        <section className="flex flex-col items-start gap-8 px-8 w-full h-full max-w-screen max-h-screen">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 w-full h-full flex flex-col justify-between pb-8">

                    <section className="flex flex-col md:flex-row gap-12 w-full">
                        <section className="flex flex-col w-full items-center md:items-start md:w-1/2 gap-4">
                            <section className="flex flex-col gap-0 p-0 m-0">
                                <h1 className="text-xl font-bold">{config.deviceName}</h1>
                                <h2 className="text-sm">{config.tailscale.public_ip}</h2>
                            </section>
                            <Alert variant="destructive" >
                                <AlertTitle>Espera!</AlertTitle>
                                <AlertDescription>
                                    Antes de cambiar la configuración de red, asegúrate de que los valores son correctos para cada situación. Si no estás seguro, consulta con el administrador de red.
                                    <br />
                                    Al guardar y aplicar los cambios para la configuración de red, el dispositivo se reiniciará automáticamente.
                                </AlertDescription>
                            </Alert>
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


                            <div>
                                <FormField
                                    control={form.control}
                                    name={`networkConfig.dns`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                DNS
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>

                        </section>
                        <section className="flex flex-col w-full items-center md:items-start md:w-1/2 h-full gap-4">
                            {/* Configuración de cada interfaz de red (Solo quiero configurar el tipo de metodo DHCP o ESTATICA) */}
                            <h1 className="font-extrabold text-xl">Interfaces de Red</h1>
                            <section className="flex flex-col gap-2">
                                {config.networkConfig.interfaces.map((int, i) => (
                                    <section key={int.name + i} className="flex flex-row gap-4">
                                        <h2 className="font-bold">{int.name} ({int.type})</h2>
                                        <FormField
                                            control={form.control}
                                            name={`networkConfig.interfaces.${i}.method`}
                                            render={({ field }) => (
                                                <MethodSelect field={field} />
                                            )}
                                        />
                                    </section>
                                ))}
                            </section>
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
                            <h1 className="font-extrabold text-xl">Configuración Wifi</h1>

                            <FormField
                                control={form.control}
                                name="networkConfig.interfaces.1.ssid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SSID:</FormLabel>
                                        <FormControl>
                                            <Input placeholder="SSID" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="networkConfig.interfaces.1.password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña:</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Contraseña" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </section>
                    </section>
                    <section className="flex flex-col md:flex-row justify-end w-full mb-12 pt-4">
                        <Button type="submit" disabled={inactive} size={'lg'} className="text-xl">
                            {loading &&
                                <Loader className="animate-spin" />
                            }
                            Guardar</Button>
                    </section>
                </form>
            </Form>
        </section>
    );
}


const MethodSelect = ({ field }: { field: any }) => {
    return (
        <FormItem>

            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecciona un método" />
                    </SelectTrigger>
                </FormControl>

                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Metodos</SelectLabel>
                        <SelectItem value="dhcp">DHCP</SelectItem>
                        <SelectItem value="static">Estatica</SelectItem>
                        <SelectItem value="ppp">ppp</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </FormItem>
    )
}