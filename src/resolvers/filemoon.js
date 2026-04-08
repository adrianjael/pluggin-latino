const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * Base64Url Decode compatible con Hermes/Node
 */
function base64UrlDecode(input) {
    let s = input.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    if (typeof Buffer !== 'undefined') return Buffer.from(s, 'base64');
    const bin = atob(s);
    return new Uint8Array(bin.split('').map(c => c.charCodeAt(0)));
}

/**
 * JS Unpacker (Dean Edwards) - Fallback
 */
function unpack(p, a, c, k, e, d) {
    while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
    return p;
}

import { decryptGCM } from '../utils/aes-gcm.js';

/**
 * Descifra el payload AES-256-GCM de la API Byse
 */
async function decryptByse(playback) {
    try {
        const keyArr = [];
        for (const p of playback.key_parts) {
            base64UrlDecode(p).forEach(b => keyArr.push(b));
        }
        const key = new Uint8Array(keyArr);
        const iv = base64UrlDecode(playback.iv);
        const ciphertextWithTag = base64UrlDecode(playback.payload);
        
        // Estrategia A: Subtle (Node/Browser) - Rapida
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            try {
                const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['decrypt']);
                const decryptedArr = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, cryptoKey, ciphertextWithTag);
                return JSON.parse(new TextDecoder().decode(decryptedArr));
            } catch (e) { console.log("[Byse] Subtle fail"); }
        }

        // Estrategia B: Pure JS (Hermes/App) - Compatible
        console.log("[Byse] Usando motor Pure-JS para Hermes...");
        const decryptedStr = decryptGCM(key, iv, ciphertextWithTag);
        return decryptedStr ? JSON.parse(decryptedStr) : null;
    } catch (e) {
        console.error(`[Byse Decrypt] Error: ${e.message}`);
        return null;
    }
}

/**
 * Resuelve un enlace de Filemoon al streaming .m3u8 directo.
 * Version 4.0: Universal (SubtleCrypto Detection + Robust ID).
 */
export async function resolve(url) {
    try {
        const idMatch = url.match(/\/e\/([a-zA-Z0-9]+)/);
        if (!idMatch) return null;
        const id = idMatch[1];
        console.log(`[Filemoon] Resolviendo Universal (v4.0): ${id}`);
        
        try {
            const hostname = new URL(url).hostname;
            const apiRes = await fetch(`https://${hostname}/api/videos/${id}`, {
                headers: { 'User-Agent': UA, 'Referer': url }
            });
            const data = await apiRes.json();
            
            if (data.playback) {
                const decrypted = await decryptByse(data.playback);
                if (decrypted && decrypted.sources) {
                    const best = decrypted.sources[0];
                    return {
                        url: best.url,
                        quality: best.height ? `${best.height}p` : '1080p',
                        isM3U8: true,
                        headers: {
                            'User-Agent': UA,
                            'Referer': 'https://arbitrarydecisions.com/',
                            'Origin': 'https://arbitrarydecisions.com'
                        }
                    };
                }
            }
        } catch (apiErr) {
            console.log(`[Filemoon] API Byse Failed: ${apiErr.message}`);
        }

        // Fallback Unpacker
        const res = await fetch(url, { headers: { 'User-Agent': UA, 'Referer': url } });
        const html = await res.text();
        const evalMatches = html.matchAll(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/g);
        
        for (const match of evalMatches) {
            const unpacked = unpack(match[1], parseInt(match[2]), parseInt(match[3]), match[4].split('|'), 0, {});
            const fm = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
            if (fm) return { 
                url: fm[1], 
                quality: '1080p', 
                isM3U8: true, 
                headers: { 
                    'User-Agent': UA, 
                    'Referer': 'https://arbitrarydecisions.com/',
                    'Origin': 'https://arbitrarydecisions.com'
                } 
            };
        }
        
        return null;
    } catch (e) {
        console.error(`[Filemoon] Error Global: ${e.message}`);
        return null;
    }
}
