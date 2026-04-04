import axios from 'axios';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function unpack(p, a, c, k, e, d) {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const decode = (r) => {
        let res = 0;
        for (let l = 0; l < r.length; l++) {
            let s = chars.indexOf(r[l]);
            if (s === -1) return NaN;
            res = res * a + s;
        }
        return res;
    };
    return p.replace(/\b([0-9a-zA-Z]+)\b/g, (match) => {
        let val = decode(match);
        return isNaN(val) || val >= k.length ? match : k[val] || match;
    });
}

const DOMAIN_MAP = { "hglink.to": "vibuxer.com" };

export async function resolve(url) {
    try {
        let targetUrl = url;
        for (const [old, replacement] of Object.entries(DOMAIN_MAP)) {
            if (targetUrl.includes(old)) { targetUrl = targetUrl.replace(old, replacement); break; }
        }
        
        console.log(`[HLSWish] Resolviendo: ${url}`);
        const baseOrigin = (targetUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
        
        const { data: html } = await axios.get(targetUrl, {
            headers: { "User-Agent": UA, Referer: "https://embed69.org/", Origin: "https://embed69.org" },
            timeout: 15000,
            maxRedirects: 5
        });

        let finalUrl = null;

        // Try file match
        const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
        if (fileMatch) {
            finalUrl = fileMatch[1];
            if (finalUrl.startsWith("/")) finalUrl = baseOrigin + finalUrl;
        }

        // Try packed eval
        if (!finalUrl) {
            const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
            if (packedMatch) {
                const unpacked = unpack(packedMatch[1], parseInt(packedMatch[2]), parseInt(packedMatch[3]), packedMatch[4].split('|'));
                const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
                if (m3u8Match) {
                    finalUrl = m3u8Match[1];
                    if (finalUrl.startsWith("/")) finalUrl = baseOrigin + finalUrl;
                }
            }
        }

        if (finalUrl) {
            console.log(`[HLSWish] URL encontrada: ${finalUrl.substring(0, 80)}...`);
            return { url: finalUrl, quality: "1080p", headers: { "User-Agent": UA, Referer: baseOrigin + "/" } };
        }
        
        return null;
    } catch (e) {
        console.log(`[HLSWish] Error: ${e.message}`);
        return null;
    }
}
