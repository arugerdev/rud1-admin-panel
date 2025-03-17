import { exec } from 'child_process'
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { ssid, password } = req.body;

    if (!ssid || !password) {
        return res.status(400).json({ error: "SSID y contraseña son requeridos" });
    }

    const command = `sudo nmcli dev wifi connect "${ssid}" password "${password}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error conectando a la red WiFi: ${stderr}`);
            return res.status(500).json({ error: "Error conectando a la red WiFi" });
        }

        console.log(`Conectado a la red WiFi: ${stdout}`);
        res.json({ message: `Conectado a la red WiFi: ${ssid}` });
    });
}
