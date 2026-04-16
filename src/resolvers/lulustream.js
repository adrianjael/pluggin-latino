const { getSessionUA } = require('../utils/http.js');
const { validateStream } = require('../utils/m3u8.js');

function unpackEval(payload, radix, symtab) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const unbase = (str) => {
        let result = 0;
        for (let i = 0; i < str.length; i++) {
            const pos = chars.indexOf(str[i]);
            if (pos === -1) return NaN;
            result = result * radix + pos;
        }
        return result;
    };
    return payload.replace(/\b([0-9a-zA-Z]+)\b/g, (match) => {
        const idx = unbase(match);
        if (isNaN(idx) || idx >= symtab.length) return match;
        return (symtab[idx] && symtab[idx] !== '') ? symtab[idx] : match;
    });
}

async function resolve(url) {
    try {
        const UA = getSessionUA();
        const urlObj = new URL(url);
        const origin = urlObj.origin;

        const response = await fetch(url, {
            headers: { 
                'User-Agent': UA,
                'Referer': url 
            }
        });

        if (!response.ok) return null;
        const html = await response.text();

        let m3u8Url = null;

        // 1. Buscar en fuentes directas (sources)
        const sourcesMatch = html.match(/sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/i);
        if (sourcesMatch) {
            m3u8Url = sourcesMatch[1];
        }

        // 2. Buscar en empaquetado (Packed)
        if (!m3u8Url) {
            const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
            if (packedMatch) {
                const unpacked = unpackEval(packedMatch[1], parseInt(packedMatch[2]), packedMatch[4].split('|'));
                const match = unpacked.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
                if (match) m3u8Url = match[0];
            }
        }

        // 3. Fallback simple regex
        if (!m3u8Url) {
            const fileMatch = html.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
            if (fileMatch) m3u8Url = fileMatch[1];
        }

        if (m3u8Url) {
            m3u8Url = m3u8Url.replace(/\\/g, '');
            if (m3u8Url.startsWith('/')) m3u8Url = origin + m3u8Url;

            const stream = {
                url: m3u8Url,
                quality: '1080p',
                serverName: 'LuluStream',
                headers: {
                    'Referer': url,
                    'Origin': origin,
                    'User-Agent': UA
                }
            };

            return await validateStream(stream);
        }

        return null;
    } catch (e) {
        console.error(`[LuluStream] error: ${e.message}`);
        return null;
    }
}

module.exports = { resolve };
