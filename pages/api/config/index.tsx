import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
const CONFIG_PATH = "/etc/config.json";
// const CONFIG_PATH = "C:/Users/usuario/Documentos/config.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log(process.cwd() )
    
    try {
        const data = await fs.readFile(process.cwd() + CONFIG_PATH, "utf-8");
        const json = JSON.parse(data);
        res.status(200).json(json);
    } catch (error) {
        res.status(500).json({ error: "No se pudo leer el archivo: " + error });
    }
}

