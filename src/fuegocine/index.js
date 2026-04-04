import axios from 'axios';

const BASE_URL = 'https://www.fuegocine.com';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const SEARCH_BASE = `${BASE_URL}/feeds/posts/default?alt=json&max-results=10&q=`;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const DEFAULT_HEADERS = {
    'User-Agent': UA,
    'Referer': `${BASE_URL}/`
};

async function getTmdbInfo(tmdbId, mediaType) {
    try {
        const type = mediaType === 'movie' ? 'movie' : 'tv';
        const { data } = await axios.get(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`, { timeout: 5000 });
        const title = type === 'movie' ? data.title || data.original_title : data.name || data.original_name;
        const originalTitle = type === 'movie' ? data.original_title || data.title : data.original_name || data.name;
        const year = (type === 'movie' ? data.release_date || '' : data.first_air_date || '').slice(0, 4);
        return { title, originalTitle, year };
    } catch { return { title: null }; }
}

function normalizeTitle(t) {
    return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function b64decode(str) {
    if (typeof atob !== 'undefined') return atob(str);
    return Buffer.from(str, 'base64').toString('binary');
}

function decodeUrl(url) {
    const b64Match = url.match(/[?&]r=([A-Za-z0-9+/=]+)/);
    if (b64Match) {
        try {
            const decoded = b64decode(b64Match[1]);
            return decodeUrl(decoded);
        } catch { return url; }
    }
    const linkMatch = url.match(/[?&]link=([^&]+)/);
    if (linkMatch) {
        try {
            const decoded = decodeURIComponent(linkMatch[1]);
            return decodeUrl(decoded);
        } catch { return url; }
    }
    const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([A-Za-z0-9_-]+)/);
    if (driveMatch) {
        return `https://drive.usercontent.google.com/download?id=${driveMatch[1]}&export=download&confirm=t`;
    }
    return url;
}

function extractLinks(html) {
    const links = [];
    const match = html.match(/const\s+_SV_LINKS\s*=\s*\[([\s\S]*?)\]\s*;/);
    if (!match) return links;

    const block = match[1];
    const entryRegex = /\{[\s\S]*?lang\s*:\s*["']([^"']+)["'][\s\S]*?name\s*:\s*["']([^"']+)["'][\s\S]*?quality\s*:\s*["']([^"']+)["'][\s\S]*?url\s*:\s*["']([^"']+)["'][\s\S]*?\}/g;
    
    let m;
    while ((m = entryRegex.exec(block)) !== null) {
        links.push({
            lang: m[1],
            name: m[2].replace(/&#9989;/g, '').replace(/&amp;/g, '&'),
            quality: m[3],
            url: decodeUrl(m[4])
        });
    }
    return links;
}

async function resolveTurboVid(embedUrl) {
    try {
        const { data: html } = await axios.get(embedUrl, { headers: { Referer: BASE_URL }, timeout: 8000 });
        const hashMatch = html.match(/data-hash="([^"]+\.m3u8[^"]*)"/);
        return hashMatch ? hashMatch[1] : embedUrl;
    } catch { return embedUrl; }
}

async function resolveOkRu(embedUrl) {
    try {
        const { data: html } = await axios.get(embedUrl, { headers: { Referer: BASE_URL }, timeout: 8000 });
        const hlsMatch = html.match(/ondemandHls\\&quot;:\\&quot;(https:[^\\&]+)/);
        return hlsMatch ? hlsMatch[1].replace(/\\\\/g, '\\').replace(/\\/g, '') : embedUrl;
    } catch { return embedUrl; }
}

function getHostLabel(url) {
    if (url.includes("drive.google.com") || url.includes("drive.usercontent.google.com")) return "Drive";
    if (url.includes("ok.ru")) return "OK.RU";
    if (url.includes("turbovid")) return "TurboVid";
    if (url.includes("vidnest")) return "VidNest";
    if (url.includes("voe.sx")) return "VOE";
    if (url.includes("vidsonic")) return "VidSonic";
    return "FC";
}

export async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        const { title, originalTitle, year } = await getTmdbInfo(tmdbId, mediaType);
        if (!title) return [];

        const searchTitle = season ? `${title} ${season}x${episode}` : title;
        const { data: searchJson } = await axios.get(SEARCH_BASE + encodeURIComponent(searchTitle), { timeout: 8000 });
        const entries = searchJson.feed?.entry || [];

        const streams = [];
        for (const entry of entries) {
            const entryTitle = entry.title?.$t || '';
            const entryUrl = entry.link?.find(l => l.rel === 'alternate')?.href;
            if (!entryUrl) continue;

            const normEntry = normalizeTitle(entryTitle);
            const normTitle = normalizeTitle(title);
            if (!normEntry.includes(normTitle)) continue;

            const { data: html } = await axios.get(entryUrl, { timeout: 8000 });
            const links = extractLinks(html);

            for (const link of links) {
                let finalUrl = link.url;
                if (finalUrl.includes('turbovid')) finalUrl = await resolveTurboVid(finalUrl);
                if (finalUrl.includes('ok.ru')) finalUrl = await resolveOkRu(finalUrl);

                const host = getHostLabel(finalUrl);
                const isDrive = host === "Drive";
                
                streams.push({
                    name: 'FuegoCine',
                    title: `[${link.lang.toUpperCase()}] ${host} · ${link.quality}`,
                    url: finalUrl,
                    quality: link.quality || '720p',
                    headers: isDrive ? { 'User-Agent': UA } : DEFAULT_HEADERS,
                    ...(isDrive && { mimeType: 'video/mp4' })
                });
            }
        }

        return streams;
    } catch (e) {
        console.error('[FuegoCine] error:', e.message);
        return [];
    }
}
