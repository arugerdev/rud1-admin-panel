
// import { execSync } from 'child_process';  // replace ^ if using ES modules
export default function handler(req: { url: string | URL; headers: { host: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: string): void; new(): any; }; }; }) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const once = url.searchParams.get("once");
    const tailscaleJoin = url.searchParams.get("tailscaleJoin");
    const command = url.searchParams.get("command");

    if (tailscaleJoin === "true") {
        const { exec } = require("child_process");
        exec(command, (error: any, stdout: any, stderr: any) => {
            if (error) {
                return res.status(500).json(JSON.stringify({ success: false, error: stderr }));
            }

            // Buscar la URL en la salida del comando
            const urlMatch = stdout.match(/https:\/\/login.tailscale.com\/.*\b/);
            if (urlMatch) {
                return res.status(200).json(JSON.stringify({ success: true, url: urlMatch[0] }));
            }

            res.status(500).json(JSON.stringify({ success: false, error: "No se encontró una URL de autenticación." }));
        });
        return res.status(200)
    }

    if (once === "true") {
        const { exec } = require("child_process");
        exec(command)
        return res.status(200)
    }

    const execSync = require('child_process').execSync;
    try {
        const output = execSync(command, { encoding: 'utf-8' });  // the default is 'buffer'
        const splitted = output.split(/\r?\n/);
        const filtered = splitted.filter((e: string) => {
            return e !== '';
        });

        res.status(200).json(JSON.stringify(filtered))
    }
    catch {
        res.status(500)
    }
}