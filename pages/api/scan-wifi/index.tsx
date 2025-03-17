import { exec } from 'child_process'
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    exec("sudo nmcli dev wifi", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error escaneando redes WiFi: ${stderr}`);
            return res.status(500).json({ error: "Error escaneando redes WiFi" });
        }

        // Parsear la salida del comando nmcli
        const lines = stdout.split("\n").slice(1); // Ignorar la primera línea (encabezados)
        const networks = lines.map((line) => {
            const [ssid, mode, channel, rate, signal, security] = line.trim().split(/\s+/);
            return { ssid, mode, channel, rate, signal, security };
        });

        res.json({ networks });
    });
}
