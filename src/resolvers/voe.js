import { fetchHtml, DEFAULT_UA } from '../utils/http.js';

function decodeBase64(input) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = String(input).replace(/=+$/, '');
    let output = '';
    for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
    }
    return output;
}

/**
 * Resuelve un enlace de VOE al streaming .m3u8 directo.
 */
export async function resolve(url) {
    try {
        console.log(`[VOE] Resolving: ${url}`);
        
        let html = await fetchHtml(url, { headers: { 'User-Agent': DEFAULT_UA } });

        // Manejar redirecciones internas de VOE
        if (html.includes('Redirecting') || html.length < 1500) {
            const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
            if (rm) {
                html = await fetchHtml(rm[1], { headers: { 'User-Agent': DEFAULT_UA } });
            }
        }

        const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[1].trim());
                let encText = Array.isArray(parsed) ? parsed[0] : parsed;
                if (typeof encText !== 'string') return null;

                // VOE Obfuscation: ROT13 + Noise + Base64 + Shift + Reverse
                let rot13 = encText.replace(/[a-zA-Z]/g, c =>
                    String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
                
                const noise = ['@$', '^^', '~@', '%?', '*~', '!!', '#&'];
                for (const n of noise) rot13 = rot13.split(n).join('');
                
                let b64_1 = decodeBase64(rot13);
                let shifted = "";
                for (let i = 0; i < b64_1.length; i++) shifted += String.fromCharCode(b64_1.charCodeAt(i) - 3);
                
                let reversed = shifted.split('').reverse().join('');
                let data = JSON.parse(decodeBase64(reversed));
                
                if (data && data.source) {
                    console.log(`[VOE] -> m3u8 encontrado: ${data.source.substring(0, 60)}...`);
                    return {
                        url: data.source,
                        quality: '1080p',
                        isM3U8: true,
                        headers: { 'User-Agent': UA, 'Referer': url }
                    };
                }
            } catch (ex) { console.error("[VOE] Decryption failed:", ex.message); }
        }

        // Fallback: buscar m3u8 directamente en el HTML
        const m3u8Match = html.match(/["'](https?:\/\/[^"']+?\.m3u8[^"']*?)["']/i);
        if (m3u8Match) {
            return {
                url: m3u8Match[1],
                quality: '1080p',
                isM3U8: true,
                headers: { 'User-Agent': UA, 'Referer': url }
            };
        }

        return null;
    } catch (e) {
        console.error(`[VOE] Error resolviedo: ${e.message}`);
        return null;
    }
}
