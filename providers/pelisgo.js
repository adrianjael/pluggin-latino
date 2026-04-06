/**
 * PelisGo Provider for Nuvio (V1.6.3 - Master JSON Edition)
 * Reingeniería basada en la extracción de 'videoLinks' desde el payload __next_f de Next.js.
 */

const BASE = "https://pelisgo.online";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const COMMON_HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache"
};


/*
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

async function pelisgoSearch(query, type) {
    const url = `${BASE}/search?q=${encodeURIComponent(query)}`;
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
 * Motor Maestro: Extracción de videoLinks Master JSON
 */
async function getOnlineStreams(rawHtml) {
    const streams = [];
    try {
        const videoLinksMatch = rawHtml.match(/videoLinks[\\"' ]+:\[(.*?)\]/);
        if (!videoLinksMatch) return [];

        const rawLinksJson = videoLinksMatch[1];
        const urlRegex = /url[\\"' ]+:[\\"' ]+([^\s"'\\]+)[\\"' ]+/gi;
        let m;
        const seenUrls = new Set();

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
                if (cleanUrl.includes('#')) {
                    const id = cleanUrl.split('#')[1];
                    cleanUrl = `https://seekstreaming.com/embed/${id}`;
                }
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
        return streams;
    } catch (e) { return []; }
}

async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        const type = (mediaType === 'tv' || mediaType === 'series') ? 'tv' : 'movie';

        let paths = await pelisgoSearch(title, type);
        if (paths.length === 0) return [];

        const slug = paths[0].split('/')[paths[0].split('/').length - 1];
        const pageUrl = type === 'movie'
            ? `${BASE}/movies/${slug}`
            : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;

        const html = await fetchText(pageUrl);
        if (!html) return [];

        return await getOnlineStreams(html);
    } catch (e) { return []; }
}

module.exports = { getStreams };

