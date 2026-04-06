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
 * Normaliza títulos: elimina tildes y caracteres disruptivos.
 */
function cleanTitle(str) {
    if (!str) return "";
    return str.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // Quitar tildes
              .replace(/[^\w\s\-]/gi, ' ')      // Solo alfanuméricos y espacios
              .replace(/\s+/g, ' ')            // Colapsar espacios
              .toLowerCase().trim();
}

/**
 * Petición de búsqueda interna a ZonaLeRoS.
 * Devuelve [] si es bloqueado por Cloudflare o fallo de red.
 */
async function zonalerosSearch(query) {
    const searchStr = cleanTitle(query);
    if (!searchStr) return [];
    
    const url = `${BASE}/search?q=${encodeURIComponent(searchStr)}`;
    try {
        const res = await fetch(url, { headers: HEADERS });
        const html = await res.text();
        
        if (html.includes('cf-browser-verification') || html.includes('Checking your browser')) {
            console.error("[ZonaLeRoS] Bloqueo de Cloudflare detectado en la búsqueda.");
            return [];
        }
        
        return extractSearchResults(html);
    } catch (e) {
        console.error(`[ZonaLeRoS] Fallo en búsqueda: ${e.message}`);
        return [];
    }
}

export async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        console.log(`[ZonaLeRoS] Iniciando extracción: "${title}" (${mediaType})`);

        // 1. Estrategia de Búsqueda de 3 Capas
        let results = [];
        const yearMatch = title.match(/\((\d{4})\)/);
        const year = yearMatch ? yearMatch[1] : "";
        const pureTitle = title.replace(/\(\d{4}\)/g, '').trim();

        // Capa A: Título + Año (Ej: "Avatar 2009")
        if (year) {
            console.log(`[ZonaLeRoS] Capa A: Buscando "${pureTitle} ${year}"`);
            results = await zonalerosSearch(`${pureTitle} ${year}`);
        }

        // Capa B: Título Puro (Ej: "Avatar")
        if (results.length === 0) {
            console.log(`[ZonaLeRoS] Capa B: Buscando "${pureTitle}"`);
            results = await zonalerosSearch(pureTitle);
        }

        // Capa C: Título Original Completo (por si acaso)
        if (results.length === 0 && pureTitle !== title) {
            console.log(`[ZonaLeRoS] Capa C: Buscando "${title}"`);
            results = await zonalerosSearch(title);
        }

        if (results.length === 0) {
            console.warn(`[ZonaLeRoS] No se encontraron coincidencias en ZonaLeRoS para: ${title}`);
            return [];
        }

        // 2. Selección del Mejor Resultado
        // Priorizamos el que coincida con el tipo (movie/series)
        const targetType = (mediaType === 'tv' || mediaType === 'series') ? 'series' : 'movie';
        let match = results.find(r => r.type === targetType && cleanTitle(r.title).includes(cleanTitle(pureTitle))) 
                 || results.find(r => r.type === targetType)
                 || results[0];

        console.log(`[ZonaLeRoS] Seleccionando: "${match.title}" -> ${match.url}`);

        // 3. Obtener la página y extraer metadata (anomizadores)
        const itemRes = await fetch(match.url, { headers: HEADERS });
        const itemHtml = await itemRes.text();
        const meta = extractMetadata(itemHtml);

        const streams = [];
        for (let serverUrl of meta.servers) {
            serverUrl = serverUrl.replace(/\\/g, "").replace(/['"]/g, "");
            const realUrl = await resolveAnomizador(serverUrl);
            if (!realUrl) continue;

            const lowUrl = realUrl.toLowerCase();
            let label = "Desconocido";
            if (lowUrl.includes('voe')) label = "VOE";
            else if (lowUrl.includes('streamtape')) label = "Streamtape";
            else if (lowUrl.includes('byse')) label = "Byse (Dual)";
            else if (lowUrl.includes('mega')) label = "MEGA (Descarga)";
            else if (lowUrl.includes('1fichier')) label = "1Fichier";
            else if (lowUrl.includes('mediafire')) label = "Mediafire";
            
            streams.push({
                name: "ZonaLeRoS",
                title: `[Directo] \xB7 ${label}`,
                url: realUrl,
                quality: 'HD',
                isM3U8: lowUrl.includes('.m3u8')
            });
        }

        return streams;
    } catch (e) {
        console.error(`[ZonaLeRoS] Error Global: ${e.message}`);
        return [];
    }
}

if (typeof module !== 'undefined') {
    module.exports = { getStreams };
}

