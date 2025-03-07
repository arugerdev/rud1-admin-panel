import { spawn, execSync } from 'child_process';
import fs from "fs/promises";
import crypto from "crypto";


async function getUniqueIdentifier() {
    try {
        // Obtener dirección MAC de eth0 (si no hay, prueba wlan0)
        let mac = execSync("cat /sys/class/net/eth0/address || cat /sys/class/net/wlan0/address", { encoding: 'utf-8' }).trim();
        if (!mac) {
            throw new Error("No se encontró MAC Address");
        }
        // Convertir la MAC en un hash corto (más seguro y único)
        return crypto.createHash("md5").update(mac).digest("hex").slice(0, 6).toUpperCase();
    } catch (err) {
        console.error("Error obteniendo identificador único:", err);
        return "UNKNOWN";
    }
}

export default async function handler(req: any, res: any) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const once = url.searchParams.get("once");
    const tailscaleJoin = url.searchParams.get("tailscaleJoin");
    const command = url.searchParams.get("command") ?? "echo 'No se ha especificado un comando.'";


    // Manejo de comando tailscaleJoin
    if (tailscaleJoin === "true") {
        const CONFIG_PATH = "/etc/config.json";
        const filePath = process.cwd() + CONFIG_PATH;

        const data = await fs.readFile(filePath, "utf-8");
        const config = JSON.parse(data);

        const uniqueId = await getUniqueIdentifier();
        const hostname = `RUD1-${config.deviceName}-${uniqueId}`;
        // Usamos spawn para ejecutar tailscale up de manera no bloqueante
        const tailscaleProcess = spawn(`tailscale up --hostname "${hostname}" --exit-node-allow-lan-access --accept-routes --advertise-exit-node --advertise-routes 10.0.0.0/8,192.168.0.0/16,172.0.0.0/8`, { shell: true });

        let urlMatch: any[] | null = null;
        tailscaleProcess.stderr.on('data', (data) => {
            // Buscar la URL en la salida
            const output = data.toString();
            urlMatch = output.match(/https:\/\/login.tailscale.com\/.*\b/);
            if (urlMatch) {
                // Si encontramos la URL, la mandamos al frontend
                res.status(200).json(JSON.stringify({ success: true, url: urlMatch[0] }));
            }
        });

        // tailscaleProcess.stderr.on('data', (data) => {
        //     // Capturar cualquier error
        //     console.error(`stderr: ${data}`);
        // });

        tailscaleProcess.on('close', (code) => {
            // Si el proceso se cierra sin encontrar la URL
            if (!urlMatch) {
                res.status(500).json(JSON.stringify({ success: false, error: "No se encontró una URL de autenticación." }));
            }
        });

        return; // Terminamos el procesamiento aquí para no bloquear el flujo
    }

    // Manejo del parámetro once
    if (once === "true") {
        const commandProcess = spawn(command, { shell: true });

        commandProcess.on('close', (code: any) => {
            res.status(200).json(JSON.stringify({ success: true, message: "Comando ejecutado correctamente." }));
        });

        return; // Evitar continuar ejecutando el código después de procesar la respuesta
    }

    // Ejecutar el comando y devolver salida con execSync
    try {
        const output = execSync(command, { encoding: 'utf-8' });
        const filtered = output.split(/\r?\n/).filter((line: string) => line.trim() !== ''); // Filtrar líneas vacías
        res.status(200).json(JSON.stringify({ success: true, output: filtered }));
    } catch (err) {
        res.status(500).json(JSON.stringify({ success: false, error: "Error ejecutando el comando." }));
    }
}
