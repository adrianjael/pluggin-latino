import axios from 'axios';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function unpackVidHide(script) {
    try {
        const match = script.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
        if (!match) return null;
        let [full, p, a, c, k] = match;
        a = parseInt(a); c = parseInt(c); k = k.split("|");
        const decode = (l, s) => {
            const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
            let res = "";
            for (; l > 0; ) { res = chars[l % s] + res; l = Math.floor(l / s); }
            return res || "0";
        };
        const unpacked = p.replace(/\b\w+\b/g, (l) => {
            const s = parseInt(l, 36);
            return s < k.length && k[s] ? k[s] : decode(s, a);
        });
        return unpacked;
    } catch { return null; }
}

export async function resolve(url) {
    try {
        console.log(`[VidHide] Resolviendo: ${url}`);
        const { data: html } = await axios.get(url, {
            timeout: 15000,
            maxRedirects: 10,
            headers: { "User-Agent": UA, Referer: "https://embed69.org/" }
        });

        const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
        if (!packedMatch) return console.log("[VidHide] No se encontró bloque eval"), null;

        const unpacked = unpackVidHide(packedMatch[0]);
        if (!unpacked) return console.log("[VidHide] No se pudo desempacar"), null;

        const hlsMatch = unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/);
        if (!hlsMatch) return console.log("[VidHide] No se encontró hls2/hls4"), null;

        let finalUrl = hlsMatch[1];
        if (!finalUrl.startsWith("http")) finalUrl = new URL(url).origin + finalUrl;

        console.log(`[VidHide] URL encontrada: ${finalUrl.substring(0, 80)}...`);
        const origin = new URL(url).origin;
        return { url: finalUrl, headers: { "User-Agent": UA, Referer: origin + "/", Origin: origin } };
    } catch (e) {
        console.log(`[VidHide] Error: ${e.message}`);
        return null;
    }
}
