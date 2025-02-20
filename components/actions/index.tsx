"use client"

import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export default function ActionsPage() {
    const { toast } = useToast()

    const onUpdate = () => {
        fetch("/api/execute?command=sudo nohup /home/rud1/update-code.sh > /dev/null 2>%261 %26&once=true")
            .then((res) => res.json())
            .then((data) => { toast({ title: `Actualización realizada correctamente.`, description: data }) })
            .catch((err) => { toast({ title: `Error ejecutando el commando.`, variant: 'destructive', description: err }); });

        toast({ title: `Actualización iniciada correctamente.` })
    }
    const onReboot = () => {
        fetch("/api/execute?command=sudo reboot now&once=true")
            .then((res) => res.json())
            .then((data) => { toast({ title: `Reinicio realizado correctamente.`, description: data }) })
            .catch((err) => { toast({ title: `Error ejecutando el commando.`, variant: 'destructive', description: err }); });

        toast({ title: `Reinicio iniciada correctamente.` })
    }

    return (
        <section className="flex flex-col items-center md:items-start justify-center md:justify-start px-8 md:px-8 w-full gap-8 font-[family-name:var(--font-geist-sans)]">
            <section className="flex flex-col gap-2 items-start h-full w-full">
                <Button onClick={onUpdate}>Actualizar dipositivo</Button>
                <Alert variant="destructive" className="max-w-2xl" >
                    <AlertTitle>Actualización</AlertTitle>
                    <AlertDescription>
                        Actualizar el dispositivo puede suponer una perdida de datos o de conectividad durante un breve periodo de tiempo, por favor, realize esta operación de manera segura y controlada. Si la actualización falla contacte con nosotros a traves de rud1.es
                    </AlertDescription>
                </Alert>
            </section>
            <section className="flex flex-col gap-2 items-start h-full w-full">
                <Button onClick={onReboot}>Reiniciar dipositivo</Button>
                <Alert variant="destructive" className="max-w-2xl" >
                    <AlertTitle>Reinicio</AlertTitle>
                    <AlertDescription>
                        Reiniciar el dispositivo puede suponer una perdida de datos o de conectividad durante un breve periodo de tiempo, por favor, realize esta operación de manera segura y controlada.
                    </AlertDescription>
                </Alert>
            </section>
        </section >
    );
}
