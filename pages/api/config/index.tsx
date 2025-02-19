import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";

const CONFIG_PATH = "/etc/config.json";
// const CONFIG_PATH = "C:/Users/usuario/Documentos/config.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const filePath = process.cwd() + CONFIG_PATH;

    if (req.method === "GET") {
        try {
            const data = await fs.readFile(filePath, "utf-8");
            const json = JSON.parse(data);
            return res.status(200).json(json);
        } catch (error) {
            return res.status(500).json({ error: "No se pudo leer el archivo: " + error });
        }
    }

    if (req.method === "POST") {
        try {
            await fs.writeFile(filePath, JSON.stringify(req.body, null, 2), "utf-8");
            return res.status(200).json({ message: "Configuración guardada con éxito" });
        } catch (error) {
            return res.status(500).json({ error: "No se pudo guardar la configuración: " + error });
        }
    }

    return res.status(405).json({ error: "Método no permitido" });
}
