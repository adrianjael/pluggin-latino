/**
 * PelisGo Provider for Nuvio (V4.2 Stability-First)
 * Replicando la estructura HTTP de PelisPlus para evitar bloqueos.
 * Restauración: Búsqueda Normalizada + TMDB + Magi/Filemoon + v1.4.0.
 */

const BASE = "https://pelisgo.online";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_KEY = "2dca580c2a14b55200e784d157207b4d";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TARGET_SERVERS = ["buzzheavier", "pixeldrain"]; // Google Drive eliminado permanentemente

// Cabeceras estándar para evitar detecciones de bot
const COMMON_HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache"
};

/**
 * JS Unpacker (p,a,c,k,e,d)
 */
function unpack(p, a, c, k, e, d) {
    while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
    return p;
}

/**
 * VOE Decoder (8-step logic)
 */
function voeDecode(str) {
    try {
        // 1. ROT13
        let r13 = str.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
        // 2. Pattern Replace
        let pat = r13.replace(/@\$/g, 'p').replace(/\^\^/g, 'q').replace(/~@/g, 'r').replace(/!!/g, 's').replace(/\*\*/g, 't');
        // 3. Clear _
        let clr = pat.replace(/_/g, '');
        // 4. Base64 Decode
        let b64_1 = atob(clr);
        // 5. CharShift -3
        let shift = "";
        for (let i = 0; i < b64_1.length; i++) shift += String.fromCharCode(b64_1.charCodeAt(i) - 3);
        // 6. Reverse
        let rev = shift.split('').reverse().join('');
        // 7. Base64 Decode Final
        let final = atob(rev);
        return JSON.parse(final);
    } catch (e) { return null; }
}

async function fetchText(url, referer = BASE) {
    try {
        const headers = { ...COMMON_HEADERS };
        if (referer) headers["Referer"] = referer;
        const res = await fetch(url, { headers });
        return await res.text();
    } catch (e) {
        console.error(`[PelisGo HTTP] Error en ${url}: ${e.message}`);
        return "";
    }
}

async function fetchJson(url, headers = {}) {
    try {
        const res = await fetch(url, { headers: { ...COMMON_HEADERS, ...headers, "Accept": "application/json" } });
        return await res.json();
    } catch (e) { return null; }
}

/**
 * Normaliza títulos para comparación y búsqueda
 */
function normalizeTitle(t) {
    if (!t) return "";
    return t.toLowerCase()
        .replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e")
        .replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o")
        .replace(/[úùüû]/g, "u").replace(/ñ/g, "n")
        .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Obtiene info de TMDB
 */
async function getTmdbInfo(tmdbId, mediaType) {
    const type = (mediaType === 'movie' || mediaType === 'movies') ? 'movie' : 'tv';
    const url = `${TMDB_BASE}/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=es-ES`;
    try {
        const data = await fetchJson(url);
        if (!data) return { title: null, originalTitle: null };
        return {
            title: type === 'movie' ? data.title : data.name,
            originalTitle: type === 'movie' ? data.original_title : data.original_name
        };
    } catch (e) { return { title: null, originalTitle: null }; }
}

/**
 * Motor de búsqueda robusto e híbrido
 */
async function pelisgoSearch(query, type) {
    const url = `${BASE}/search?q=${encodeURIComponent(query)}`;
    const html = await fetchText(url);
    if (!html) return [];

    const results = [];
    const seen = new Set();
    const resolvedType = (type === 'movie' || type === 'movies') ? 'movies' : 'series';

    // 1. Intento por __NEXT_DATA__ (JSON Nativo) - Más confiable
    try {
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
        if (nextDataMatch) {
            const data = JSON.parse(nextDataMatch[1]);
            const items = data?.props?.pageProps?.data?.results || data?.props?.pageProps?.items || [];
            items.forEach(item => {
                const slug = item.slug || item.id;
                const itemType = (item.type || '').includes('movie') ? 'movies' : 'series';
                if (slug && itemType === resolvedType && !seen.has(slug)) {
                    seen.add(slug);
                    results.push(`/${itemType}/${slug}`);
                }
            });
        }
    } catch (e) {
        console.log(`[PelisGo] Error parseando NextData: ${e.message}`);
    }

    // 2. Intento por Regex Flexible (Fallback de HTML)
    const re = /href=["']?(\/(movies|series)\/([a-z0-9\-]+))["']?/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
        const fullPath = m[1];
        const itemType = m[2];
        const slug = m[3];
        if (fullPath.includes('/temporada/') || fullPath.includes('/episodio/')) continue;
        const isMatch = (type === 'movie' && itemType === 'movies') || (type === 'tv' && itemType === 'series');
        if (isMatch && !seen.has(slug)) {
            seen.add(slug);
            results.push(fullPath);
        }
    }
    
    console.log(`[PelisGo Search] "${query}" -> ${results.length} results found.`);
    return results;
}

/**
 * Resolutores estables (Pixeldrain/BuzzHeavier)
 */
async function resolveBuzzheavier(url) {
    const id = url.split('/').pop();
    const dlUrl = `https://buzzheavier.com/${id}/download`;
    try {
        const res = await fetch(dlUrl, {
            method: 'GET',
            headers: { "User-Agent": UA, "HX-Request": "true", "HX-Current-URL": `https://buzzheavier.com/${id}`, "Referer": `https://buzzheavier.com/${id}` },
            redirect: 'follow'
        });
        return res.headers.get('hx-redirect') || null;
    } catch (e) { return null; }
}

async function resolveFilemoon(url) {
    try {
        const html = await fetchText(url, BASE);
        const packed = html.match(/eval\(function\(p,a,c,k,e,d\).*\)/);
        if (!packed) return null;
        
        // Extraer argumentos del pack
        const argsRe = /\}\('(.*)',\s*(\d+),\s*(\d+),\s*'(.*)'\.split\('\|'\)/;
        const parts = packed[0].match(argsRe);
        if (!parts) return null;
        
        const unpacked = unpack(parts[1], parseInt(parts[2]), parseInt(parts[3]), parts[4].split('|'), 0, {});
        const linkMatch = unpacked.match(/file:"(.*?)"/);
        return linkMatch ? linkMatch[1] : null;
    } catch (e) { return null; }
}

async function resolveVoe(url) {
    try {
        const html = await fetchText(url, BASE);
        const sourceMatch = html.match(/const\s+sources\s*=\s*['"](.*?)['"]/);
        if (!sourceMatch) return null;
        const data = voeDecode(sourceMatch[1]);
        return data?.hls || data?.video || null;
    } catch (e) { return null; }
}

async function resolveOneId(id) {
    try {
        const data = await fetchJson(`${BASE}/api/download/${id}`);
        if (!data?.url) return null;
        const serverLower = (data.server || '').toLowerCase();
        if (!TARGET_SERVERS.some(s => serverLower.includes(s))) return null;

        let finalUrl = data.url;
        if (serverLower.includes('buzzheavier')) finalUrl = await resolveBuzzheavier(data.url);
        if (serverLower.includes('pixeldrain')) {
            const pid = data.url.split('/').pop();
            finalUrl = `https://pixeldrain.com/api/file/${pid}?download`;
        }
        return finalUrl ? { server: data.server, url: finalUrl, quality: data.quality || '1080p', language: data.language || 'Latino' } : null;
    } catch (e) { return null; }
}

/**
 * Función principal requerida por Nuvio
 */
async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        const resolvedType = (mediaType === 'tv' || mediaType === 'series') ? 'tv' : 'movie';
        console.log(`[PelisGo v1.4] Scann: "${title}" (${resolvedType})`);

        // Intento 1: Búsqueda Normal
        let paths = await pelisgoSearch(title, resolvedType);
        
        // Intento 2: Búsqueda Inteligente (Título Original) si falla el 1
        if (paths.length === 0 && tmdbId) {
            const info = await getTmdbInfo(tmdbId, resolvedType);
            if (info.originalTitle && normalizeTitle(info.originalTitle) !== normalizeTitle(title)) {
                console.log(`[PelisGo] Fallback: buscando por titulo original "${info.originalTitle}"`);
                paths = await pelisgoSearch(info.originalTitle, resolvedType);
            }
        }

        if (paths.length === 0) return [];

        const slug = paths[0].split('/')[2];
        const pageUrl = resolvedType === 'movie' 
            ? `${BASE}/movies/${slug}`
            : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;

        const html = await fetchText(pageUrl);
        if (!html) return [];
        
        // 1. ONLINE (Magi, VOE, Desu, Netu) - Extracción Directa
        const onlinePromises = [];
        const domainPatterns = [
            { domain: 'filemoon.sx', name: 'Magi (Filemoon)', resolver: resolveFilemoon },
            { domain: 'f75s.com', name: 'Magi (Filemoon)', resolver: resolveFilemoon },
            { domain: 'voe.sx', name: 'VOE', resolver: resolveVoe },
            { domain: 'hqq.ac', name: 'Netu' }
        ];

        domainPatterns.forEach(p => {
            const regex = new RegExp(`https?:[\\/\\/\\\\]+[^\\s"'<>\\\\]*${p.domain.replace(/\./g, '\\.')}[^\\s"'<>\\\\]+`, 'gi');
            const matches = html.match(regex) || [];
            [...new Set(matches)].forEach(url => {
                const cleanUrl = url.replace(/\\/g, '');
                if (p.resolver) {
                    onlinePromises.push((async () => {
                        const direct = await p.resolver(cleanUrl);
                        if (direct) {
                            return { 
                                name: 'PelisGo', 
                                title: `[Directo] \xB7 ${p.name}`, 
                                url: direct, 
                                quality: '1080p', 
                                isM3U8: direct.includes('.m3u8'),
                                headers: { 'User-Agent': UA, 'Referer': cleanUrl } 
                            };
                        }
                        return null;
                    })());
                } else {
                    onlinePromises.push(Promise.resolve({ 
                        name: 'PelisGo', 
                        title: `[Web] \xB7 ${p.name}`, 
                        url: cleanUrl, 
                        quality: '1080p', 
                        headers: { 'User-Agent': UA, 'Referer': BASE } 
                    }));
                }
            });
        });

        const onlineResults = await Promise.all(onlinePromises);
        const onlineStreams = onlineResults.filter(r => r !== null);

        // 2. DESCARGAS (Pixeldrain, BuzzHeavier)
        const downloadIds = (function(h) {
             const re = /\/download\/([a-z0-9]+)/g;
             const ids = []; let m;
             while ((m = re.exec(h)) !== null) ids.push(m[1]);
             return [...new Set(ids)];
        })(html);
        
        const downloadResults = await Promise.all(downloadIds.map(id => resolveOneId(id)));
        const downloadStreams = downloadResults.filter(r => r !== null).map(link => {
            const langLabel = link.language ? `[${link.language.toUpperCase()}] ` : '';
            return { 
                name: 'PelisGo', 
                title: `${langLabel}${link.server} \xB7 ${link.quality}`, 
                url: link.url, 
                quality: link.quality, 
                headers: { 'User-Agent': UA, 'Referer': `${BASE}/` } 
            };
        });

        const allStreams = [...onlineStreams, ...downloadStreams];
        console.log(`[PelisGo] Done: ${allStreams.length} stream(s) found.`);
        return allStreams;
    } catch (e) {
        console.error(`[PelisGo Error] ${e.message}`);
        return [];
    }
}

module.exports = { getStreams };
