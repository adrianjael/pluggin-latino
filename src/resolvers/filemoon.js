const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * JS Unpacker (Dean Edwards)
 */
function unpack(p, a, c, k, e, d) {
    while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
    return p;
}

/**
 * Resuelve un enlace de Filemoon al streaming .m3u8 directo.
 */
export async function resolve(url) {
    try {
        console.log(`[Filemoon] Resolviendo Directo: ${url}`);
        
        const res = await fetch(url, {
            headers: {
                'User-Agent': UA,
                'Referer': 'https://pelisgo.online/',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            }
        });
        const html = await res.text();

        // Buscar el bloque empaquetado eval(function(p,a,c,k,e,d)...)
        const packedMatch = html.match(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/);
        
        if (packedMatch) {
            const p = packedMatch[1];
            const a = parseInt(packedMatch[2]);
            const c = parseInt(packedMatch[3]);
            const k = packedMatch[4].split('|');
            
            const unpacked = unpack(p, a, c, k, 0, {});
            
            // Extraer el archivo de video (.m3u8) del JS desempaquetado
            const fileMatch = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
            if (fileMatch) {
                const streamUrl = fileMatch[1];
                console.log(`[Filemoon] -> m3u8 encontrado: ${streamUrl.substring(0, 60)}...`);
                
                return {
                    url: streamUrl,
                    quality: '1080p',
                    isM3U8: true,
                    headers: {
                        'User-Agent': UA,
                        'Referer': url,
                        'Origin': 'https://filemoon.sx'
                    }
                };
            }
        }
        
        console.log("[Filemoon] No se encontro el bloque packed o el m3u8.");
        return null;
    } catch (e) {
        console.error(`[Filemoon] Error en resolutor: ${e.message}`);
        return null;
    }
}
