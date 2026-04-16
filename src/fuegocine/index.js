const { fetchHtml, fetchJson } = require('../utils/http.js');
const { finalizeStreams } = require('../utils/engine.js');
const { resolveEmbed } = require('../utils/resolvers.js');
const { getTmdbTitle } = require('../utils/tmdb.js');

const BASE_URL = 'https://www.fuegocine.com';
// Metadatos centralizados vía tmdb.js

const SEARCH_BASE = `${BASE_URL}/feeds/posts/default?alt=json&max-results=10&q=`;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const DEFAULT_HEADERS = {
    'User-Agent': UA,
    'Referer': `${BASE_URL}/`
};

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


function getHostLabel(url) {
    if (url.includes("drive.google.com") || url.includes("drive.usercontent.google.com")) return "Drive";
    if (url.includes("ok.ru")) return "OK.RU";
    if (url.includes("turbovid")) return "TurboVid";
    if (url.includes("vidnest")) return "VidNest";
    if (url.includes("voe.sx")) return "VOE";
    if (url.includes("vidsonic")) return "VidSonic";
    return "FC";
}

async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        // Título Rescate
        let mediaTitle = title;
        if (!mediaTitle && tmdbId) {
            mediaTitle = await getTmdbTitle(tmdbId, mediaType);
        }
        if (!mediaTitle) return [];

        const searchTitle = season ? `${mediaTitle} ${season}x${episode}` : mediaTitle;
        const searchJson = await fetchJson(SEARCH_BASE + encodeURIComponent(searchTitle));
        const entries = searchJson.feed?.entry || [];

        const streams = [];
        for (const entry of entries) {
            const entryTitle = entry.title?.$t || '';
            const entryUrl = entry.link?.find(l => l.rel === 'alternate')?.href;
            if (!entryUrl) continue;

            const normEntry = normalizeTitle(entryTitle);
            const normTitle = normalizeTitle(mediaTitle);
            if (!normEntry.includes(normTitle)) continue;

            const html = await fetchHtml(entryUrl);
            const links = extractLinks(html);

            for (const link of links) {
                const result = await resolveEmbed(link.url);
                if (result && result.url) {
                    streams.push({
                        langLabel: link.lang,
                        serverLabel: link.name || 'Server',
                        url: result.url,
                        quality: result.quality || link.quality || '720p',
                        headers: result.headers || DEFAULT_HEADERS
                    });
                }
            }
        }

        return await finalizeStreams(streams, 'FuegoCine', mediaTitle);
    } catch (e) {
        console.error('[FuegoCine] error:', e.message);
        return [];
    }
}

module.exports = { getStreams };
