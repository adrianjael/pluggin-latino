// ═══════════════════════════════════════════════════════════════
//  Embed69 Provider — embed69.org
//  Usa IMDB ID (obtenido desde TMDB) para obtener streams sin
//  necesidad de scrappear sololatino.net (Cloudflare WAF).
//  Flujo: TMDB → IMDB ID → embed69.org/f/{imdbId} → /api/decrypt → URLs
// ═══════════════════════════════════════════════════════════════

const EMBED69_BASE = 'https://embed69.org';
const EMBED69_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Servidores que podemos resolver directamente (Vimeos, VOE, StreamWish)
// Filemoon y Vidhide se intentan pero pueden fallar por protección
const SUPPORTED_SERVERS = ['streamwish', 'vidhide', 'voe', 'vimeos'];

// ─── Helpers ────────────────────────────────────────────────────

function unpackEval(payload, radix, symtab) {
    return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function (match) {
        let result = 0;
        const digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < match.length; i++) {
            let pos = digits.indexOf(match[i]);
            if (pos === -1 || pos >= radix) return match;
            result = result * radix + pos;
        }
        if (result >= symtab.length) return match;
        return symtab[result] && symtab[result] !== "" ? symtab[result] : match;
    });
}

function extractM3u8FromHtml(html) {
    let unpacked = "";
    const packMatch = html.match(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/);
    if (packMatch) {
        try { unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|")); }
        catch (e) { }
    } else {
        unpacked = html;
    }
    unpacked = unpacked.replace(/k:\/\//g, 'https://');
    const m = unpacked.match(/https?:\/\/[^"'\s\\]+?\.m3u8[^"'\s\\]*/i);
    if (m) return m[0].replace(/\\/g, '');
    return null;
}

async function fetchHtml(url, referer) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': EMBED69_UA,
            'Referer': referer || EMBED69_BASE,
            'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9'
        }
    });
    return res.text();
}

// ─── Server Resolvers ───────────────────────────────────────────

async function resolveStreamwish(embedUrl) {
    try {
        const body = await fetchHtml(embedUrl, EMBED69_BASE);
        return extractM3u8FromHtml(body);
    } catch (e) { return null; }
}

async function resolveVidhide(embedUrl) {
    try {
        const body = await fetchHtml(embedUrl, EMBED69_BASE);
        return extractM3u8FromHtml(body);
    } catch (e) { return null; }
}

async function resolveVoe(embedUrl) {
    try {
        const body = await fetchHtml(embedUrl, embedUrl);
        if (body.includes('Redirecting') || body.length < 1000) {
            const rm = body.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
            if (rm) return resolveVoe(rm[1]);
        }
        // Voe usa JSON-LD con script encriptado
        const jsonMatch = body.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
        if (jsonMatch) {
            try {
                let encText = JSON.parse(jsonMatch[1].trim())[0];
                let rot13 = encText.replace(/[a-zA-Z]/g, c =>
                    String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
                const noise = ['@$', '^^', '~@', '%?', '*~', '!!', '#&'];
                for (const n of noise) rot13 = rot13.split(n).join('');
                // Simple base64 decode
                const b64decode = (s) => {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                    let str = String(s).replace(/=+$/, ''), output = '';
                    for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0)
                        buffer = chars.indexOf(buffer);
                    return output;
                };
                let b64_1 = b64decode(rot13);
                let shifted = "";
                for (let i = 0; i < b64_1.length; i++) shifted += String.fromCharCode(b64_1.charCodeAt(i) - 3);
                let reversed = shifted.split('').reverse().join('');
                let data = JSON.parse(b64decode(reversed));
                if (data && data.source) return data.source;
            } catch (ex) { }
        }
        return extractM3u8FromHtml(body);
    } catch (e) { return null; }
}

// ─── Embed69 Main Resolver ──────────────────────────────────────

async function resolveEmbed69(imdbId, season, episode) {
    let embedUrl = `${EMBED69_BASE}/f/${imdbId}`;
    if (season && episode) embedUrl += `?season=${season}&episode=${episode}`;

    console.log(`[Embed69] Fetching embed69: ${embedUrl}`);

    const page = await fetchHtml(embedUrl, 'https://sololatino.net/');

    // Extraer dataLink del HTML
    const dlMatch = page.match(/let\s+dataLink\s*=\s*(\[[\s\S]*?\]);\s*\n/);
    if (!dlMatch) {
        console.log('[Embed69] No dataLink found in embed69 HTML');
        return [];
    }

    let dataLink;
    try { dataLink = JSON.parse(dlMatch[1]); }
    catch (e) { console.log('[Embed69] dataLink parse error:', e.message); return []; }

    // Recolectar todos los JWTs de todos los idiomas
    const allJwts = [];
    const linkMap = [];
    dataLink.forEach((file) => {
        (file.sortedEmbeds || []).forEach((embed) => {
            if (embed.link && embed.servername !== 'download') {
                allJwts.push(embed.link);
                linkMap.push({ lang: file.video_language || 'LAT', server: embed.servername });
            }
        });
    });

    if (allJwts.length === 0) {
        console.log('[Embed69] No JWTs found to decrypt');
        return [];
    }

    // Desencriptar JWTs via /api/decrypt
    const decryptRes = await fetch(`${EMBED69_BASE}/api/decrypt`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': EMBED69_UA,
            'Referer': embedUrl,
            'Origin': EMBED69_BASE
        },
        body: JSON.stringify({ links: allJwts })
    });

    const decryptData = await decryptRes.json();

    if (!decryptData.success || !Array.isArray(decryptData.links)) {
        console.log('[Embed69] Decrypt failed:', JSON.stringify(decryptData).slice(0, 200));
        return [];
    }

    // Construir lista de streams con sus URLs de embed (sin resolver todavía)
    const embedList = [];
    decryptData.links.forEach((linkObj, i) => {
        const mapping = linkMap[i];
        if (!mapping) return;

        let serverUrl = typeof linkObj === 'object' ? linkObj.link : linkObj;
        if (typeof serverUrl === 'string') serverUrl = serverUrl.replace(/`/g, '').trim();

        if (!serverUrl || !serverUrl.startsWith('http')) return;

        embedList.push({ lang: mapping.lang, server: mapping.server, url: serverUrl });
        console.log(`[Embed69] ${mapping.lang} | ${mapping.server}: ${serverUrl}`);
    });

    return embedList;
}

// ─── IMDB ID Resolver from TMDB ─────────────────────────────────

async function getImdbId(tmdbId, mediaType, title) {
    console.log(`[Embed69] Resolving ID for: TMDB=${tmdbId} | Title=${title}`);
    
    // Método 1: vidsrc.me API (Excelente resolver de TMDB -> IMDB para series/movies)
    try {
        const url = `https://vidsrc.me/api/ep?tmdb=${tmdbId}${mediaType === 'tv' ? '&s=1&e=1' : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.imdb_id) {
            return data.imdb_id;
        }
    } catch (e) {
        console.log('[Embed69] vidsrc resolver failed:', e.message);
    }

    // Método 2 Fallback: TVMaze para Series (si el anterior falla)
    if (mediaType === 'tv' && title) {
        try {
            const searchUrl = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`;
            const res = await fetch(searchUrl);
            const data = await res.json();
            if (data?.externals?.imdb) {
                return data.externals.imdb.startsWith('tt') ? data.externals.imdb : `tt${data.externals.imdb}`;
            }
        } catch (e) {
            console.log('[Embed69] TVMaze fallback failed:', e.message);
        }
    }

    return null;
}

// ─── Main Export ─────────────────────────────────────────────────

export async function extractStreams(tmdbId, mediaType, season, episode, title) {
    console.log(`[Embed69] Extracting: Title="${title}" | TMDB=${tmdbId} (${mediaType}) S${season}E${episode}`);

    try {
        // 1. Obtener IMDB ID
        const apiType = mediaType === 'movie' ? 'movie' : 'tv';
        const imdbId = await getImdbId(tmdbId, apiType, title);

        if (!imdbId) {
            console.log(`[Embed69] No IMDB ID found for ${title || tmdbId}`);
            return [];
        }


        console.log(`[Embed69] IMDB ID: ${imdbId}`);

        // 2. Obtener embeds de embed69
        const isTV = mediaType !== 'movie';
        const embedList = await resolveEmbed69(
            imdbId,
            isTV ? season : null,
            isTV ? episode : null
        );

        if (embedList.length === 0) return [];

        // 3. Filtrar solo idioma LAT y servidores compatibles
        const latStreams = embedList.filter(e =>
            e.lang === 'LAT' &&
            (e.server === 'streamwish' || e.server === 'vidhide' || e.server === 'voe' || e.server === 'vimeos')
        );

        console.log(`[Embed69] Resolving ${latStreams.length} LAT streams...`);

        // 4. Resolver cada embed a un .m3u8
        const streamPromises = latStreams.map(async (embed) => {
            let finalUrl = null;

            if (embed.server === 'streamwish') finalUrl = await resolveStreamwish(embed.url);
            else if (embed.server === 'vidhide') finalUrl = await resolveVidhide(embed.url);
            else if (embed.server === 'voe') finalUrl = await resolveVoe(embed.url);

            if (!finalUrl || !finalUrl.startsWith('http')) return null;

            const mobileUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";

            return {
                name: 'Embed69',
                title: `${embed.server} (Latino) HD`,
                url: finalUrl,
                quality: 'HD',
                headers: {
                    'User-Agent': mobileUA,
                    'Referer': embed.url,
                    'Origin': new URL(embed.url).origin
                }
            };
        });

        const results = await Promise.all(streamPromises);
        const streams = results.filter(s => s !== null);

        console.log(`[Embed69] Final streams: ${streams.length}`);
        return streams;

    } catch (error) {
        console.error(`[Embed69] Global Error: ${error.message}`);
        return [];
    }
}
