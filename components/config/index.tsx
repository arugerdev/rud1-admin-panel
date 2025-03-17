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
    device: {
        name: string;
        description: string;
        location: string;
        manufacturer: string;
        model: string;
        serial_number: string;
        firmware_version: string;
        os: {
            name: string;
            version: string;
            kernel: string;
        };
    };
    network: {
        interfaces: {
            name: string;
            type: string;
            ipv4: string;
            netmask: string;
            gateway: string;
            dns: string[];
            status: string;
            mode?: string;
            ssid?: string;
            password?: string;
        }[];
    };
    services: {
        tailscale: {
            enabled: boolean;
            status: string;
            tailscale_ip: string;
        };
        virtualhere: {
            enabled: boolean;
            status: string;
            version: string;
        };
        dhcp: {
            enabled: boolean;
            status: string;
            range: string;
        };
        dns: {
            enabled: boolean;
            status: string;
            servers: string[];
        };
    };
    system: {
        status: string;
        uptime: string;
        cpu: {
            usage_percent: number;
            temperature: number;
            load_average: number[];
        };
        memory: {
            total_mb: number;
            used_mb: number;
            free_mb: number;
            usage_percent: number;
        };
        disk: {
            total_gb: number;
            used_gb: number;
            free_gb: number;
            usage_percent: number;
        };
        network_usage: {
            eth0: {
                rx_bytes: number;
                tx_bytes: number;
            };
            wlan0: {
                rx_bytes: number;
                tx_bytes: number;
            };
        };
    };
    logs: {
        system_logs: string;
        service_logs: {
            tailscale: string;
            virtualhere: string;
            cloudflare_tunnel: string;
        };
    };
    last_updated: string;
};

export default function ConfigPage() {
    const [config, setConfig] = useState<FormValues | null>(null);
    const [inactive, setInactive] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedInterface, setSelectedInterface] = useState<string>("eth0"); // Estado para la interfaz seleccionada

    const [wifiNetworks, setWifiNetworks] = useState<{ ssid: string; signal: string; security: string }[]>([]);
    const [selectedWifi, setSelectedWifi] = useState<string>("");

    const { toast } = useToast();
    const form = useForm<FormValues>({
        defaultValues: {
            device: {
                name: "",
                description: "",
                location: "",
                manufacturer: "",
                model: "",
                serial_number: "",
                firmware_version: "",
                os: {
                    name: "",
                    version: "",
                    kernel: "",
                },
            },
            network: {
                interfaces: [
                    {
                        name: "eth0",
                        type: "ethernet",
                        ipv4: "",
                        netmask: "",
                        gateway: "",
                        dns: [],
                        status: "",
                    },
                    {
                        name: "wlan0",
                        type: "wifi",
                        ipv4: "",
                        netmask: "",
                        gateway: "",
                        dns: [],
                        status: "",
                        mode: "",
                        ssid: "",
                        password: "",
                    }
                ]
            },
            services: {
                tailscale: {
                    enabled: false,
                    status: "",
                    tailscale_ip: "",
                },
                virtualhere: {
                    enabled: false,
                    status: "",
                    version: "",
                },
                dhcp: {
                    enabled: false,
                    status: "",
                    range: "",
                },
                dns: {
                    enabled: false,
                    status: "",
                    servers: [],
                },
            },
            system: {
                status: "",
                uptime: "",
                cpu: {
                    usage_percent: 0,
                    temperature: 0,
                    load_average: [],
                },
                memory: {
                    total_mb: 0,
                    used_mb: 0,
                    free_mb: 0,
                    usage_percent: 0,
                },
                disk: {
                    total_gb: 0,
                    used_gb: 0,
                    free_gb: 0,
                    usage_percent: 0,
                },
                network_usage: {
                    eth0: {
                        rx_bytes: 0,
                        tx_bytes: 0,
                    },
                    wlan0: {
                        rx_bytes: 0,
                        tx_bytes: 0,
                    },
                },
            },
            logs: {
                system_logs: "",
                service_logs: {
                    tailscale: "",
                    virtualhere: "",
                    cloudflare_tunnel: "",
                },
            },
            last_updated: "",
        },
    });

    const scanWifi = async () => {
        try {
            const response = await fetch("/api/execute?command=sudo nmcli dev wifi");
            const output = await response.json();

            // Procesar la salida del comando para obtener las redes WiFi
            const lines = await output.output.split("\n").slice(1); // Ignorar la primera línea (encabezados)
            const networks = lines.map((line: any) => {
                // Dividir la línea en columnas, teniendo en cuenta que SSID y SECURITY pueden contener espacios
                const columns = line.trim().split(/\s{2,}/); // Dividir por dos o más espacios
                if (columns.length < 8) return null; // Ignorar líneas mal formadas

                const [
                    inUse,
                    bssid,
                    ssid,
                    mode,
                    channel,
                    rate,
                    signal,
                    bars,
                    security,
                ] = columns;

                return {
                    inUse: inUse.trim() === "*", // Indica si la red está en uso
                    bssid: bssid.trim(),
                    ssid: ssid.trim(),
                    mode: mode.trim(),
                    channel: parseInt(channel.trim(), 10),
                    rate: rate.trim(),
                    signal: parseInt(signal.trim(), 10),
                    bars: bars.trim(),
                    security: security.trim(),
                };
            }).filter((network: any) => network !== null); // Filtrar líneas mal formadas


            setWifiNetworks(networks);
        } catch (error) {
            console.error("Error escaneando redes WiFi:", error);
            toast({ title: "Error escaneando redes WiFi", variant: "destructive" });
        }
    };

    const connectToWifi = async () => {
        if (!config) return;
        const password = form.getValues(`network.interfaces.${config.network.interfaces.findIndex(
            (int) => int.name === "wlan0"
        )}.password`);

        if (!selectedWifi || !password) {
            toast({ title: "Selecciona una red WiFi e ingresa la contraseña", variant: "destructive" });
            return;
        }

        try {
            const response = await fetch(`/api/execute?command=sudo nmcli dev wifi connect "${selectedWifi}" password "${password}"`);
            const output = await response.json();

            if (output.stderr) {
                throw new Error(output.stderr);
            }

            toast({ title: `Conectado a la red WiFi: ${selectedWifi}` });
        } catch (error) {
            console.error("Error conectando a la red WiFi:", error);
            toast({ title: "Error conectando a la red WiFi", variant: "destructive" });
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            scanWifi()
        }, 3000)

        return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }, [])

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

                fetch(`/api/execute?command=sudo hostnamectl set-hostname ${config?.device.name.toLocaleLowerCase().split(' ').join('-').toString()}`)
                    .then((res) => res.json())
                    .then((data) => { })
                    .catch((err) => {
                        toast({ title: `Error ejecutando el commando.`, variant: 'destructive', description: err });
                        setInactive(false);
                        setLoading(false);
                    });

                config?.network.interfaces.forEach(int => {
                    fetch(`/api/execute?command=sudo nmcli connection modify ${int.name} ipv4.method ${int.mode === 'dhcp' ? 'auto' : `manual ipv4.addresses ${int.ipv4} ipv4.gateway ${int.gateway} ipv4.dns ${int.dns}`}`)
                        .catch((err) => {
                            toast({ title: `Error ejecutando el commando.`, variant: 'destructive', description: err });
                            setInactive(false);
                            setLoading(false);
                        });

                    if (int.type === 'wifi') {
                        fetch(`/api/execute?command=sudo nmcli dev wifi connect ${int.ssid} password  ${int.password}`)
                            .catch((err) => {
                                toast({ title: `Error ejecutando el commando.`, variant: 'destructive', description: err });
                                setInactive(false);
                                setLoading(false);
                            });

                    }
                    fetch(`/api/execute?command=sudo nmcli connection down ${int.name} && sudo nmcli connection up ${int.name}`)
                        .catch((err) => {
                            toast({ title: `Error ejecutando el commando.`, variant: 'destructive', description: err });
                            setInactive(false);
                            setLoading(false);
                        });
                });

                toast({ title: "Configuración guardada y aplicada con éxito" });
                setInactive(false);
                setLoading(false);

                fetch(`/api/execute?command=sudo systemctl restart NetworkManager`)
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
    if (!config.device.name) return <p>Error: no se ha podido cargar la configuración</p>

    // Obtener la interfaz seleccionada
    const selectedInterfaceData = config.network.interfaces.find(
        (int) => int.name === selectedInterface
    );

    return (
        <section className="flex flex-col items-start gap-8 px-8 w-full h-full max-w-screen max-h-screen">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 w-full h-full flex flex-col justify-between pb-8">

                    <section className="flex flex-col md:flex-row gap-12 w-full">
                        <section className="flex flex-col w-full items-center md:items-start md:w-1/2 gap-4">
                            <section className="flex flex-col gap-0 p-0 m-0">
                                <h1 className="text-xl font-bold">{config.device.name}</h1>
                                <h2 className="text-sm">{config.services.tailscale.tailscale_ip}</h2>
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
                                name="device.name"
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

                            {/* Selector de interfaz */}
                            <FormItem>
                                <FormLabel>Interfaz de red:</FormLabel>
                                <Select
                                    value={selectedInterface}
                                    onValueChange={(value) => setSelectedInterface(value)}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Selecciona una interfaz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Interfaces</SelectLabel>
                                            {config.network.interfaces.map((int) => (
                                                <SelectItem key={int.name} value={int.name}>
                                                    {int.name} ({int.type})
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormItem>

                            {/* Configuración de red dinámica */}
                            {selectedInterfaceData && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name={`network.interfaces.${config.network.interfaces.findIndex(
                                            (int) => int.name === selectedInterface
                                        )}.ipv4`}
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
                                        name={`network.interfaces.${config.network.interfaces.findIndex(
                                            (int) => int.name === selectedInterface
                                        )}.gateway`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gateway:</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="192.168.0.1/24" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`network.interfaces.${config.network.interfaces.findIndex(
                                            (int) => int.name === selectedInterface
                                        )}.dns`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>DNS:</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="8.8.8.8, 8.8.4.4" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}


                        </section>

                        <section className="flex flex-col w-full items-center md:items-start md:w-1/2 h-full gap-4">

                            {/* Configuración de cada interfaz de red (Solo quiero configurar el tipo de metodo DHCP o ESTATICA) */}
                            <h1 className="font-extrabold text-xl">Interfaces de Red</h1>
                            <section className="flex flex-col gap-2">
                                {config.network.interfaces.map((int, i) => (
                                    <section key={int.name + i} className="flex flex-row gap-4">
                                        <h2 className="font-bold">{int.name} ({int.type})</h2>
                                        <FormField
                                            control={form.control}
                                            name={`network.interfaces.${i}.mode`}
                                            render={({ field }) => (
                                                <MethodSelect field={field} />
                                            )}
                                        />
                                    </section>
                                ))}
                            </section>

                            <section className="flex flex-col gap-4">
                                <h1 className="font-extrabold text-xl">Redes WiFi Disponibles</h1>
                                {loading ? <Loader className="animate-spin" /> : ""}

                                {wifiNetworks.length > 0 && (
                                    <Select onValueChange={(value) => setSelectedWifi(value)}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una red WiFi" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Redes WiFi</SelectLabel>
                                                {wifiNetworks.map((network) => (
                                                    <SelectItem key={network.ssid} value={network.ssid ?? 'RED NO IDENTIFICADA'}>
                                                        {network.ssid} (Señal: {network.signal}, Seguridad: {network.security})
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}

                                {selectedWifi && (
                                    <Button onClick={connectToWifi} disabled={loading}>
                                        {loading ? <Loader className="animate-spin" /> : `Conectar a ${selectedWifi}`}
                                    </Button>
                                )}
                            </section>

                            <h1 className="font-extrabold text-xl">Configuración Wifi</h1>

                            <FormField
                                control={form.control}
                                name={`network.interfaces.${config.network.interfaces.findIndex(
                                    (int) => int.name === "wlan0"
                                )}.ssid`}
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
                                name={`network.interfaces.${config.network.interfaces.findIndex(
                                    (int) => int.name === "wlan0"
                                )}.password`}
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
    );
};