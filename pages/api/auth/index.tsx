import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');

export const runtime = "edge";  // Añadir esta línea para habilitar el Edge runtime

export default async function handler(req: { url: string | URL; headers: { host: unknown; }; }) {
    // Obtener la clave de la URL
    const url = new URL(req.url, `http://${req.headers.host}`);

    const receivedKey = url.searchParams.get("key");
    const deviceKey = url.searchParams.get("device");


    const { data } = await supabase
        .from('devices')
        .select('secret_key')
        .eq('key', deviceKey)
        .single();
    if (receivedKey !== data?.secret_key) {
        return new Response(JSON.stringify({ error: "Acceso no autorizado" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
