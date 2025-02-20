import { spawn, execSync } from 'child_process';

export default function handler(req: { url: string | URL; headers: { host: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; url?: any; error?: string; message?: string; output?: any; }): void; new(): any; }; }; }) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const once = url.searchParams.get("once");
    const tailscaleJoin = url.searchParams.get("tailscaleJoin");
    const command = url.searchParams.get("command") ?? "echo 'No se ha especificado un comando.'";

    // Manejo de comando tailscaleJoin
    if (tailscaleJoin === "true") {
        // Usamos spawn para ejecutar tailscale up de manera no bloqueante
        const tailscaleProcess = spawn('sudo tailscale up', { shell: true });

        let urlMatch: any[] | null = null;
        tailscaleProcess.stderr.on('data', (data) => {
            // Buscar la URL en la salida
            const output = data.toString();
            urlMatch = output.match(/https:\/\/login.tailscale.com\/.*\b/);
            if (urlMatch) {
                // Si encontramos la URL, la mandamos al frontend
                res.status(200).json({ success: true, url: urlMatch[0] });
            }
        });

        // tailscaleProcess.stderr.on('data', (data) => {
        //     // Capturar cualquier error
        //     console.error(`stderr: ${data}`);
        // });

        tailscaleProcess.on('close', (code) => {
            // Si el proceso se cierra sin encontrar la URL
            if (!urlMatch) {
                res.status(500).json({ success: false, error: "No se encontró una URL de autenticación." });
            }
        });

        return; // Terminamos el procesamiento aquí para no bloquear el flujo
    }

    // Manejo del parámetro once
    if (once === "true") {
        const commandProcess = spawn(command, { shell: true });

        commandProcess.on('close', (code: any) => {
            res.status(200).json({ success: true, message: "Comando ejecutado correctamente." });
        });

        return; // Evitar continuar ejecutando el código después de procesar la respuesta
    }

    // Ejecutar el comando y devolver salida con execSync
    try {
        const output = execSync(command, { encoding: 'utf-8' });
        const filtered = output.split(/\r?\n/).filter((line: string) => line.trim() !== ''); // Filtrar líneas vacías
        res.status(200).json({ success: true, output: filtered });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error ejecutando el comando." });
    }
}
