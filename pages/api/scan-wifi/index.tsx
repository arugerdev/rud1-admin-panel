import { exec } from 'child_process';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    exec("sudo nmcli dev wifi", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error escaneando redes WiFi: ${stderr}`);
            return res.status(500).json({ error: "Error escaneando redes WiFi" });
        }

        // Parsear la salida del comando nmcli
        const lines = stdout.split("\n").slice(1); // Ignorar la primera línea (encabezados)
        const networks = lines
            .map((line) => {
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
            })
            .filter((network) => network !== null); // Filtrar líneas mal formadas

        return res.json({ networks });
    });
}