/**
 * PelisGo Provider for Nuvio (V1.7.0 - Direct Video Edition)
 * Reingeniería basada en escaneo global de fragmentos Next.js.
 * Motor: Extracción directa de video (.m3u8) para todos los servidores.
 */

import { resolve as resolveFilemoon } from '../resolvers/filemoon.js';
import { resolve as resolveVoe } from '../resolvers/voe.js';
import { resolve as resolveVimeos } from '../resolvers/vimeos.js';

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
    if (!id) return null;
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
 * Motor Maestro: Escaneo de videoLinks y Escaneo Global de Descargas
 * Version 1.7.0: Soporte nativo para m3u8 directo (Nuvio Playback).
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
                    const r = await resolveFilemoon(cleanUrl);
                    if (r) direct = r.url;
                } else if (cleanUrl.includes('voe.sx')) {
                    label = "VOE";
                    const r = await resolveVoe(cleanUrl);
                    if (r) direct = r.url;
                } else if (cleanUrl.includes('vimeos.net')) {
                    label = "Vimeos";
                    const r = await resolveVimeos(cleanUrl);
                    if (r) {
                        direct = r.url;
                        vimeosHeaders = r.headers;
                    }
                } else if (cleanUrl.includes('desu') || cleanUrl.includes('hqq.ac') || cleanUrl.includes('netu') || cleanUrl.includes('seekstreaming') || cleanUrl.includes('embedseek')) {
                    continue; // Omitir servidores inestables o con exceso de publicidad
                }

                if (direct) {
                    const headers = (label === "Vimeos" && typeof vimeosHeaders !== 'undefined') ? vimeosHeaders : { 'User-Agent': UA, 'Referer': BASE };
                    streams.push({ 
                        name: 'PelisGo', 
                        title: `[Directo] \xB7 ${label}`, 
                        url: direct, 
                        quality: '1080p', 
                        isM3U8: true,
                        headers
                    });
                } else {
                    const headers = (label === "Netu") 
                        ? { 'Referer': 'https://pelisgo.online/', 'Origin': 'https://pelisgo.online' }
                        : { 'User-Agent': UA, 'Referer': BASE };
                        
                    streams.push({ 
                        name: 'PelisGo', 
                        title: `[Web] \xB7 ${label}`, 
                        url: cleanUrl, 
                        quality: '1080p',
                        headers
                    });
                }
            }
        }
    } catch (e) {}

    // 2. Escaneo Global (Buscamos Buzzheavier y Pixeldrain en TODO el HTML)
    try {
        const globalRegex = /\{[^{}]*?server[\\"' ]+:[\\"' ]+(Buzzheavier|Pixeldrain)[^{}]*?url[\\"' ]+:[\\"' ]+([^"'\s]+)[^}]*?\}/gi;
        let m;
        while ((m = globalRegex.exec(rawHtml)) !== null) {
            const serverName = m[1];
            let maybeUrl = m[2].replace(/\\/g, '');

            let directUrl = null;
            if (maybeUrl.includes('/download/')) {
                const downloadId = maybeUrl.split('/').pop().replace(/[^\w]/g, '');
                directUrl = await resolvePelisGoDownload(downloadId);
            } else if (maybeUrl.includes('http')) {
                directUrl = maybeUrl;
            }

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
    } catch (e) {}

    return streams;
}

async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        const type = (mediaType === 'tv' || mediaType === 'series') ? 'tv' : 'movie';
        console.log(`[PelisGo v1.7.0] Scann: "${title}" (${type}) tmdbId: ${tmdbId}`);

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
        console.log(`[PelisGo] Done: ${onlineStreams.length} stream(s) found (Direct Video Edition).`);
        return onlineStreams;
    } catch (e) { return []; }
}

module.exports = { getStreams };
