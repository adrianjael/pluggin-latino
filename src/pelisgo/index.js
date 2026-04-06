/**
 * PelisGo Provider for Nuvio (V1.6.7 - Ultra Direct Edition)
 * Reingeniería basada en 'videoLinks' y 'downloadLinks' de Next.js.
 * Resolución Instantánea para Buzzheavier y Pixeldrain.
 */

const BASE = "https://pelisgo.online";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_KEY = "2dca580c2a14b55200e784d157207b4d"; // TMDB API Key para traducciones

const COMMON_HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache"
};

/**
 * Normaliza títulos: elimina tildes y caracteres disruptivos.
 */
function cleanTitle(str) {
    if (!str) return "";
    return str.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // Quitar tildes
              .replace(/[^\w\s\-]/gi, '')      // Solo alfanuméricos
              .toLowerCase().trim();
}

/**
 * Obtiene el título en español de TMDB.
 */
async function getSpanishTitle(tmdbId, type) {
    try {
        const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=es-MX`;
        const res = await fetch(url);
        const data = await res.json();
        return data.title || data.name || null;
    } catch (e) { return null; }
}

/**
 * JS Unpacker (p,a,c,k,e,d)
 */
function unpack(p, a, c, k, e, d) {
    while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
    return p;
}

async function fetchText(url, referer = BASE) {
    try {
        const headers = { ...COMMON_HEADERS };
        if (referer) headers["Referer"] = referer;
        const res = await fetch(url, { headers });
        return await res.text();
    } catch (e) { return ""; }
}

/**
 * Resuelve IDs de descarga de PelisGo a URLs directas de servidor (Buzz/Pixel).
 */
async function resolvePelisGoDownload(id) {
    try {
        const res = await fetch(`https://pelisgo.online/api/download/${id}`, {
            headers: COMMON_HEADERS
        });
        const data = await res.json();
        return data.url || null;
    } catch (e) { return null; }
}

async function pelisgoSearch(query, type) {
    const searchStr = cleanTitle(query);
    const url = `${BASE}/search?q=${encodeURIComponent(searchStr)}`;
    const html = await fetchText(url);
    if (!html) return [];
    
    const re = /href="(\/(movies|series)\/([a-z0-9\-]+))"/gi;
    const results = [];
    const seen = new Set();
    let m;
    while ((m = re.exec(html)) !== null) {
        if (m[1].includes('/temporada/') || m[1].includes('/episodio/')) continue;
        const isMatch = (type === 'movie' && m[2] === 'movies') || (type === 'tv' && m[2] === 'series');
        if (isMatch && !seen.has(m[3])) {
            seen.add(m[3]);
            results.push(m[1]);
        }
    }
    return results;
}

/**
 * Resolutores Online (Magi/Filemoon)
 */
async function resolveFilemoon(url) {
    try {
        const html = await fetchText(url, BASE);
        const packed = html.match(/eval\(function\(p,a,c,k,e,d\).*\)/);
        if (!packed) return null;
        const parts = packed[0].match(/\}\('(.*)',\s*(\d+),\s*(\d+),\s*'(.*)'\.split\('\|'\)/);
        if (!parts) return null;
        const unpacked = unpack(parts[1], parseInt(parts[2]), parseInt(parts[3]), parts[4].split('|'), 0, {});
        const linkMatch = unpacked.match(/file:"(.*?)"/);
        return linkMatch ? linkMatch[1] : null;
    } catch (e) { return null; }
}

/**
 * Motor Maestro: Escaneo de videoLinks y downloadLinks (Buzz/Pixel)
 */
async function getOnlineStreams(rawHtml) {
    const streams = [];
    const seenUrls = new Set();

    // 1. Procesar videoLinks (Streaming Tradicional)
    try {
        const videoLinksMatch = rawHtml.match(/videoLinks[\\"' ]+:\[(.*?)\]/);
        if (videoLinksMatch) {
            const rawLinksJson = videoLinksMatch[1];
            const urlRegex = /url[\\"' ]+:[\\"' ]+([^\s"'\\]+)[\\"' ]+/gi;
            let m;
            while ((m = urlRegex.exec(rawLinksJson)) !== null) {
                let cleanUrl = m[1].replace(/\\/g, '');
                if (seenUrls.has(cleanUrl)) continue;
                seenUrls.add(cleanUrl);

                let label = "PelisGo";
                let direct = null;

                if (cleanUrl.includes('filemoon') || cleanUrl.includes('f75s.com')) {
                    label = "Magi (Filemoon)";
                    direct = await resolveFilemoon(cleanUrl);
                } else if (cleanUrl.includes('seekstreaming') || cleanUrl.includes('embedseek')) {
                    label = "SeekStreaming";
                } else if (cleanUrl.includes('hqq.ac') || cleanUrl.includes('netu')) {
                    label = "Netu";
                } else if (cleanUrl.includes('desu')) {
                    label = "Desu";
                }

                if (direct) {
                    streams.push({ name: 'PelisGo', title: `[Directo] \xB7 ${label}`, url: direct, quality: '1080p', isM3U8: true });
                } else {
                    streams.push({ name: 'PelisGo', title: `[Web] \xB7 ${label}`, url: cleanUrl, quality: '1080p' });
                }
            }
        }
    } catch (e) {}

    // 2. Procesar downloadLinks (Servidores Premium: Buzzheavier y Pixeldrain)
    try {
        const downloadLinksMatch = rawHtml.match(/downloadLinks[\\"' ]+:\[(.*?)\]/);
        if (downloadLinksMatch) {
            const rawDownloadsJson = downloadLinksMatch[1];
            // Regex mejorado: captura servidores y URLs con escapes de barra \/
            const downloadRegex = /\{[^{}]*?server[\\"' ]+:[\\"' ]+([a-zA-Z]+)[^{}]*?url[\\"' ]+:[\\"' ]+([^"'\s]+)[^}]*?\}/gi;
            let m;
            while ((m = downloadRegex.exec(rawDownloadsJson)) !== null) {
                const serverName = m[1];
                let directUrl = m[2].replace(/\\/g, ''); // Limpiar escapes \/

                if (serverName === 'Buzzheavier' || serverName === 'Pixeldrain') {
                    if (directUrl && !seenUrls.has(directUrl)) {
                        seenUrls.add(directUrl);
                        streams.push({ 
                            name: 'PelisGo', 
                            title: `[F-Direct] \xB7 ${serverName}`, 
                            url: directUrl, 
                            quality: '1080p' 
                        });
                    }
                }
            }
        }
    } catch (e) {}

    return streams;
}

async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        const type = (mediaType === 'tv' || mediaType === 'series') ? 'tv' : 'movie';
        console.log(`[PelisGo v1.6.7] Scann: "${title}" (${type}) tmdbId: ${tmdbId}`);

        let paths = await pelisgoSearch(title, type);
        if (paths.length === 0 && tmdbId) {
            console.log(`[PelisGo] Reintentando con título oficial de TMDB...`);
            const tmdbType = type === 'tv' ? 'tv' : 'movie';
            const officialTitle = await getSpanishTitle(tmdbId, tmdbType);
            if (officialTitle && officialTitle !== title) {
                console.log(`[PelisGo] Nombre detectado: "${officialTitle}"`);
                paths = await pelisgoSearch(officialTitle, type);
            }
        }

        if (paths.length === 0) return [];

        const slug = paths[0].split('/')[paths[0].split('/').length - 1];
        const pageUrl = type === 'movie'
            ? `${BASE}/movies/${slug}`
            : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;

        const html = await fetchText(pageUrl);
        if (!html) return [];

        const onlineStreams = await getOnlineStreams(html);
        console.log(`[PelisGo] Done: ${onlineStreams.length} stream(s) found (including Buzz/Pixel).`);
        return onlineStreams;
    } catch (e) { return []; }
}

module.exports = { getStreams };
