"use client"

import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export default function ActionsPage() {
    const { toast } = useToast()


    fetch("/api/execute?command=sudo sh /home/rud1/update-code.sh")
        .then((res) => res.json())
        .then((data) => { toast({ title: `Actualización iniciada correctamente.`, description: data }) })
        .catch((err) => { toast({ title: `Error ejecutando el commando.`, variant: 'destructive', description: err }); });

    return (
        <section className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start px-8 md:px-0 w-full gap-16 font-[family-name:var(--font-geist-sans)]">
            <Button>Actualizar dipositivo</Button>
            <Alert variant="destructive" >
                <AlertTitle>Actualización</AlertTitle>
                <AlertDescription>
                    Actualizar el dispositivo puede suponer una perdida de datos o de conectividad durante un breve periodo de tiempo, por favor, realize esta operación de manera segura y controlada. Si la actualización falla contacte con nosotros a traves de rud1.es
                </AlertDescription>
            </Alert>
        </section >
    );
}
