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

async function resolve(url, signal = null) {
    try {
        const UA = getSessionUA();
        const rawId = url.split('/').pop().replace(/\.html$/, '');
        const urlObj = new URL(url);

        const mirrors = [
            `https://hanerix.com/e/${rawId}`,
            `https://embedwish.com/e/${rawId}`,
            `https://hglink.to/e/${rawId}`,
            url,
            `https://streamwish.to/e/${rawId}`,
            `https://awish.pro/e/${rawId}`,
            `https://strwish.com/e/${rawId}`,
            `https://wishfast.top/e/${rawId}`,
            `https://sfastwish.com/e/${rawId}`
        ];

        console.log(`[StreamWish] Race-Resolving v7.9.4: ${rawId} (${mirrors.length} mirrors)`);

        const validResult = await new Promise((resolveRace) => {
            let resolved = false;
            let pending = mirrors.length;

            mirrors.forEach(async (mirror) => {
                try {
                    const mirrorObj = new URL(mirror);
                    const mirrorOrigin = mirrorObj.origin;

                    const resp = await fetch(mirror, { 
                        headers: { 'Referer': mirror, 'User-Agent': UA },
                        signal: signal
                    });
                    if (!resp.ok) throw new Error();
                    const html = await resp.text();

                    let m3u8Url = null;

                    // 1. Método Hash (/dl)
                    const hashMatch = html.match(/[0-9a-f]{32}/i);
                    if (hashMatch) {
                        const hash = hashMatch[0];
                        const dlUrl = `${mirrorOrigin}/dl?op=view&file_code=${rawId}&hash=${hash}&embed=1&referer=&adb=1&hls4=1`;
                        const dlResp = await fetch(dlUrl, {
                            headers: { 'User-Agent': UA, 'Referer': mirror, 'X-Requested-With': 'XMLHttpRequest' },
                            signal: signal
                        });
                        if (dlResp.ok) {
                            const dlData = await dlResp.text();
                            const match = dlData.match(/https?:\/\/[^"']+\.m3u8[^"']*/);
                            if (match) m3u8Url = match[0];
                        }
                    }

                    // 2. Método Fallback (Packed o File)
                    if (!m3u8Url) {
                        const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
                        if (packedMatch) {
                            const unpacked = unpackEval(packedMatch[1], parseInt(packedMatch[2]), packedMatch[4].split('|'));
                            const match = unpacked.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
                            if (match) m3u8Url = match[0];
                        }
                    }

                    if (!m3u8Url) {
                        const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
                        if (fileMatch) m3u8Url = fileMatch[1];
                    }

                    if (m3u8Url && !resolved) {
                        resolved = true;
                        m3u8Url = m3u8Url.replace(/\\/g, '');
                        if (m3u8Url.startsWith('/')) m3u8Url = mirrorOrigin + m3u8Url;
                        resolveRace({ url: m3u8Url, mirror: mirror });
                    }
                } catch (e) {
                } finally {
                    pending--;
                    if (pending === 0 && !resolved) resolveRace(null);
                }
            });

            setTimeout(() => { if (!resolved) { resolved = true; resolveRace(null); } }, 3500);
        });

        if (!validResult) return null;

        return {
            url: validResult.url,
            quality: '1080p',
            serverName: 'StreamWish',
            headers: {
                'Referer': validResult.mirror,
                'Origin': new URL(validResult.mirror).origin,
                'User-Agent': UA
            }
        };

    } catch (e) {
        return null;
    }
}

module.exports = { resolve };
