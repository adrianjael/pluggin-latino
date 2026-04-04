import axios from 'axios';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function base64Decode(e) {
    try {
        return typeof atob !== 'undefined' ? atob(e) : Buffer.from(e, 'base64').toString('utf8');
    } catch {
        return null;
    }
}

function voeDecode(e, t) {
    try {
        let i = t.replace(/^\[|\]$/g, "").split("','").map((c) => c.replace(/^'+|'+$/g, "")).map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), o = "";
        for (let c of e) {
            let u = c.charCodeAt(0);
            u > 64 && u < 91 ? u = (u - 52) % 26 + 65 : u > 96 && u < 123 && (u = (u - 84) % 26 + 97), o += String.fromCharCode(u);
        }
        for (let c of i) o = o.replace(new RegExp(c, "g"), "_");
        o = o.split("_").join("");
        let r = base64Decode(o);
        if (!r) return null;
        let a = "";
        for (let c = 0; c < r.length; c++) a += String.fromCharCode((r.charCodeAt(c) - 3 + 256) % 256);
        let l = a.split("").reverse().join(""), s = base64Decode(l);
        return s ? JSON.parse(s) : null;
    } catch (n) {
        console.log("[VOE] voeDecode error:", n.message);
        return null;
    }
}

async function getQuality(url, referer) {
    try {
        const { data } = await axios.get(url, {
            timeout: 5000,
            headers: { 'User-Agent': UA, 'Referer': referer },
            responseType: 'text'
        });
        if (!data.includes("#EXT-X-STREAM-INF")) return "1080p";
        let maxRes = 0;
        const lines = data.split('\n');
        for (const line of lines) {
            const match = line.match(/RESOLUTION=\d+x(\d+)/);
            if (match) {
                const res = parseInt(match[1]);
                if (res > maxRes) maxRes = res;
            }
        }
        return maxRes > 0 ? `${maxRes}p` : "1080p";
    } catch {
        return "1080p";
    }
}

export async function resolve(url) {
    try {
        console.log(`[VOE] Resolviendo: ${url}`);
        let res = await axios.get(url, {
            timeout: 15000,
            headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' },
            maxRedirects: 5
        });
        let html = String(res.data || "");

        if (/window\.location\.href\s*=\s*'([^']+)'/i.test(html)) {
            const redirect = html.match(/window\.location\.href\s*=\s*'([^']+)'/i)[1];
            res = await axios.get(redirect, { headers: { 'User-Agent': UA, 'Referer': url } });
            html = String(res.data || "");
        }

        const match = html.match(/json">\s*\[\s*['"]([^'"]+)['"]\s*\]\s*<\/script>\s*<script[^>]*src=['"]([^'"]+)['"]/i);
        if (match) {
            const encoded = match[1];
            const loader = match[2].startsWith("http") ? match[2] : new URL(match[2], url).href;
            const loaderRes = await axios.get(loader, { headers: { 'User-Agent': UA, 'Referer': url } });
            const loaderJs = String(loaderRes.data || "");
            const arrayMatch = loaderJs.match(/(\[(?:'[^']{1,10}'[\s,]*){4,12}\])/i) || loaderJs.match(/(\[(?:"[^"]{1,10}"[,\s]*){4,12}\])/i);
            if (arrayMatch) {
                const decoded = voeDecode(encoded, arrayMatch[1]);
                if (decoded && (decoded.source || decoded.direct_access_url)) {
                    const finalUrl = decoded.source || decoded.direct_access_url;
                    return { url: finalUrl, quality: await getQuality(finalUrl, url), headers: { Referer: url } };
                }
            }
        }

        // Fallback
        const sources = [...html.matchAll(/(?:mp4|hls)["']\s*:\s*["']([^"']+)["']/gi)];
        for (const s of sources) {
            let src = s[1];
            if (src.startsWith("aHR0")) src = base64Decode(src);
            if (src) return { url: src, quality: await getQuality(src, url), headers: { Referer: url } };
        }
        return null;
    } catch (e) {
        console.log(`[VOE] Error: ${e.message}`);
        return null;
    }
}
