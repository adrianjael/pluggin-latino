const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function base64UrlDecode(input) {
    let s = input.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return typeof Buffer !== 'undefined' 
        ? Buffer.from(s, 'base64') 
        : new Uint8Array(atob(s).split('').map(c => c.charCodeAt(0)));
}

/**
 * JS Unpacker (Dean Edwards) - Fallback
 */
function unpack(p, a, c, k, e, d) {
    while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
    return p;
}

/**
 * Descifra el payload AES-256-GCM de la API Byse
 */
async function decryptByse(playback) {
    try {
        const keyParts = playback.key_parts;
        const keyBytes = [];
        for (const part of keyParts) {
            const decoded = base64UrlDecode(part);
            decoded.forEach(b => keyBytes.push(b));
        }
        
        const key = new Uint8Array(keyBytes);
        const iv = base64UrlDecode(playback.iv);
        const fullPayload = base64UrlDecode(playback.payload);
        
        // AES-GCM: Ultimos 16 bytes son el authTag
        const ciphertext = fullPayload.slice(0, -16);
        const tag = fullPayload.slice(-16);

        // Nuvio environment usually supports SubtleCrypto
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['decrypt']);
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv, tagLength: 128 },
                cryptoKey,
                fullPayload // SubtleCrypto espera [ciphertext + tag]
            );
            return JSON.parse(new TextDecoder().decode(decrypted));
        }
        return null;
    } catch (e) {
        console.error(`[Byse Decrypt] Error: ${e.message}`);
        return null;
    }
}

/**
 * Resuelve un enlace de Filemoon al streaming .m3u8 directo.
 * Version 3.0: Soporte completo Byse API (AES-GCM) + Fallback Unpacker.
 */
export async function resolve(url) {
    try {
        const id = url.split('/').pop().split('?')[0];
        console.log(`[Filemoon] Resolviendo Maestro (v3.0): ${id}`);
        
        // Estrategia 1: API de Byse (Cifrada)
        try {
            const hostname = new URL(url).hostname;
            const apiUrl = `https://${hostname}/api/videos/${id}`;
            const apiRes = await fetch(apiUrl, {
                headers: { 'User-Agent': UA, 'Referer': url }
            });
            const data = await apiRes.json();
            
            if (data.playback) {
                const decrypted = await decryptByse(data.playback);
                if (decrypted && decrypted.sources) {
                    const best = decrypted.sources[0];
                    console.log(`[Filemoon] -> m3u8 via API: ${best.url.substring(0, 50)}...`);
                    return {
                        url: best.url,
                        quality: best.height ? `${best.height}p` : '1080p',
                        isM3U8: true,
                        headers: { 'User-Agent': UA, 'Referer': url }
                    };
                }
            }
        } catch (apiErr) {
            console.log(`[Filemoon] API Strategy failed: ${apiErr.message}`);
        }

        // Estrategia 2: Fallback Unpacker (Legacy/SEO Mode)
        console.log("[Filemoon] Fallback a motor Unpacker...");
        const res = await fetch(url, {
            headers: { 'User-Agent': UA, 'Referer': url }
        });
        const html = await res.text();

        const evalMatches = html.matchAll(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/g);
        
        for (const match of evalMatches) {
            const unpacked = unpack(match[1], parseInt(match[2]), parseInt(match[3]), match[4].split('|'), 0, {});
            const fileMatch = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
            if (fileMatch) {
                return {
                    url: fileMatch[1],
                    quality: '1080p',
                    isM3U8: true,
                    headers: { 'User-Agent': UA, 'Referer': url }
                };
            }
        }
        
        return null;
    } catch (e) {
        console.error(`[Filemoon] Error Global: ${e.message}`);
        return null;
    }
}
