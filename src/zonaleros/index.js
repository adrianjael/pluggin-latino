/**
 * ZonaLeRoS Provider for Nuvio
 * Reingeniería basada en scraping de search.php y modales de calidad.
 **/

import { extractSearchResults, extractMetadata } from './extractor.js';

const BASE = "https://www.zona-leros.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Referer": BASE,
    "Upgrade-Insecure-Requests": "1"
};

/**
 * Resuelve el "Anomizador" de ZonaLeRoS siguiendo la redirección.
 */
async function resolveAnomizador(url) {
    if (!url.includes('anomizador.zona-leros.com')) return url;
    try {
        const res = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            headers: { "User-Agent": UA, "Referer": BASE }
        });
        return res.url;
    } catch (e) {
        console.error("Anomizador Error:", e);
        return url;
    }
}

export async function search(query) {
    try {
        const searchUrl = `${BASE}/search?q=${encodeURIComponent(query)}`;
        const res = await fetch(searchUrl, { headers: HEADERS });
        const html = await res.text();

        if (html.includes('cf-browser-verification')) {
            console.error("ZonaLeros: Bloqueado por Cloudflare");
            return [];
        }

        return extractSearchResults(html);
    } catch (e) {
        console.error("Zonaleros Search Error:", e);
        return [];
    }
}

export async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        console.log(`[ZonaLeRoS] Buscando streams para: "${title}" (${mediaType})`);

        // 1. Buscar en ZonaLeRoS usando el título (query)
        const results = await search(title);
        
        if (results.length === 0) {
            console.warn(`[ZonaLeRoS] No se encontraron resultados para: ${title}`);
            return [];
        }

        // 2. Filtrar por tipo (Película o Serie)
        const targetType = (mediaType === 'tv' || mediaType === 'series') ? 'series' : 'movie';
        const bestMatch = results.find(r => r.type === targetType) || results[0];

        // 3. Obtener la página del contenido
        const res = await fetch(bestMatch.url, { headers: HEADERS });
        const html = await res.text();
        const metadata = extractMetadata(html);

        const streams = [];
        for (let serverUrl of metadata.servers) {
            serverUrl = serverUrl.replace(/\\/g, "").replace(/['"]/g, "");
            const realUrl = await resolveAnomizador(serverUrl);

            let label = "Desconocido";
            const lowUrl = realUrl.toLowerCase();
            if (lowUrl.includes('voe')) label = "VOE";
            else if (lowUrl.includes('streamtape')) label = "Streamtape";
            else if (lowUrl.includes('byse')) label = "Byse (Dual)";
            else if (lowUrl.includes('mega')) label = "MEGA (Descarga)";
            else if (lowUrl.includes('1fichier')) label = "1Fichier (Descarga)";
            else if (lowUrl.includes('mediafire')) label = "Mediafire (Descarga)";

            if (realUrl) {
                streams.push({
                    name: "ZonaLeRoS",
                    title: `[Directo] \xB7 ${label}`,
                    url: realUrl,
                    quality: 'HD',
                    isM3U8: lowUrl.includes('.m3u8')
                });
            }
        }

        return streams;
    } catch (e) {
        console.error("Zonaleros Streams Error:", e);
        return [];
    }
}

if (typeof module !== 'undefined') {
    module.exports = { getStreams };
}

