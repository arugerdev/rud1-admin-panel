import { spawn, execSync } from 'child_process';
import fs from "fs/promises";


async function getUniqueIdentifier() {
    try {
        // Obtener dirección MAC de eth0 (si no hay, prueba wlan0)
        let mac = execSync("cat /sys/class/net/eth0/address || cat /sys/class/net/wlan0/address", { encoding: 'utf-8' }).trim();
        if (!mac) {
            throw new Error("No se encontró MAC Address");
        }
        // Convertir la MAC en un hash corto (más seguro y único)
        const encoder = new TextEncoder();
        const macBytes = encoder.encode(mac);
        let hash = 0;

        for (let i = 0; i < macBytes.length; i++) {
            hash = (hash * 31 + macBytes[i]) % 0xFFFFFF; // Generar un número único
        }

        return hash.toString(16).padStart(6, '0').toUpperCase();
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

    try {
        const data = await fs.readFile(CONFIG_PATH, "utf-8");
        const config = JSON.parse(data);
        const uniqueId = await getUniqueIdentifier();
        const hostname = `RUD1-${config.device.name}-${uniqueId}`;

        const tailscaleProcess = spawn(`tailscale up --hostname "${hostname}" --accept-routes --advertise-exit-node --advertise-routes 10.0.0.0/8,192.168.0.0/16,172.0.0.0/8`, { shell: true });

        let responded = false;
        const timeout = setTimeout(() => {
            if (!responded) {
                responded = true;
                res.status(500).json({ success: false, error: "Timeout esperando la URL de autenticación." });
                tailscaleProcess.kill();
            }
        }, 10000); // Timeout de 10 segundos

        tailscaleProcess.stderr.on('data', (data) => {
            const output = data.toString();
            const urlMatch = output.match(/https:\/\/login.tailscale.com\/.*\b/);
            if (urlMatch && !responded) {
                responded = true;
                clearTimeout(timeout);
                res.status(200).json({ success: true, url: urlMatch[0] });
            }
        });

        tailscaleProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        tailscaleProcess.on('close', (code) => {
            if (!responded) {
                responded = true;
                clearTimeout(timeout);
                res.status(500).json({ success: false, error: "No se encontró una URL de autenticación." });
            }
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: "Error al leer la configuración o iniciar tailscale." });
    }
    return;
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
