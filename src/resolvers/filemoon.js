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
        console.log(`[Filemoon] Resolviendo Directo (v2.1): ${url}`);
        
        // El Referer DEBE ser la propia URL del embed para que Filemoon nos de el JS real
        const res = await fetch(url, {
            headers: {
                'User-Agent': UA,
                'Referer': url,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            }
        });
        const html = await res.text();

        // Escaneo global de todos los bloques eval(...)
        const evalMatches = html.matchAll(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/g);
        
        for (const match of evalMatches) {
            const p = match[1];
            const a = parseInt(match[2]);
            const c = parseInt(match[3]);
            const k = match[4].split('|');
            
            const unpacked = unpack(p, a, c, k, 0, {});
            
            // Buscamos la URL del video en este bloque desempaquetado
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
        
        console.log("[Filemoon] No se encontro el bloque packed con el video.");
        return null;
    } catch (e) {
        console.error(`[Filemoon] Error en resolutor: ${e.message}`);
        return null;
    }
}
