/**
 * Scraper para TioPlus.app (v1.2.0)
 * Lógica: Búsqueda -> Selección -> Doble Base64 Bypass -> Resolución
 * Mantenimiento: CommonJS Tradicional para compatibilidad con Hermes (Android/TV)
 * Estrategia de Red: Motor Híbrido (CURL en PC / Fetch en App)
 */

const { finalizeStreams } = require('../utils/engine.js');
const { resolveEmbed } = require('../utils/resolvers.js');
const { getTmdbTitle, getTmdbInfo } = require('../utils/tmdb.js');
const { fetchHtml, request } = require('../utils/http.js');

// Detección segura de motor de sistema (CURL) para Bypass de Cloudflare
let spawnSync = null;
try {
    // Solo cargamos child_process si estamos en Node.js (PC/Test)
    // El bundler (esbuild) lo ignorará gracias a la configuración de build.js
    spawnSync = require('child_process').spawnSync;
} catch (e) {
    // En Nuvio App (Hermes), spawnSync será nulo
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const BASE_URL = 'https://tioplus.app';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36';

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Codifica una cadena para el Player de TioPlus (basado en Python Kodi)
 * El valor original de data-server ya es Base64, solo requiere UNA capa adicional.
 */
function toDoubleBase64(str) {
    try {
        if (typeof btoa !== 'undefined') {
            return btoa(str);
        }
        return Buffer.from(str).toString('base64');
    } catch(e) {
        return "";
    }
}

/**
 * Obtiene el enlace real desde el endpoint de player
 * Motor Híbrido: CURL (Máxima efectividad) -> Fetch (Compatibilidad App)
 * Incluye lógica de REINTENTO por SATURACIÓN (6 segundos) detectada en Python.
 */
async function getRedirectUrl(serverEncoded, referer) {
    const doubleB64 = toDoubleBase64(serverEncoded);
    const playerUrl = `${BASE_URL}/player/${doubleB64}`;
    
    const tryDownload = async (isRetry = false) => {
        try {
            let html = "";
            if (spawnSync && typeof process !== 'undefined') {
                const args = ['-s', '-k', '--http1.1', '-A', UA, '-H', `Referer: ${referer}`, playerUrl];
                const result = spawnSync('curl.exe', args);
                html = result.stdout ? result.stdout.toString() : '';
            } else {
                html = await fetchHtml(playerUrl, {
                    headers: { 'User-Agent': UA, 'Referer': referer }
                });
            }

            if (html.includes("saturando la red")) {
                if (isRetry) return null; // Ya reintentamos una vez
                console.log("[TioPlus] Red saturada, esperando 6 segundos...");
                await new Promise(r => setTimeout(r, 6500)); // Espera de 6.5s según Python
                return await tryDownload(true);
            }

            if (!html || html.length < 50) return null;

            // Capturar la redirección del window.location.href
            const match = html.match(/(?:window\.)?location\.href\s*=\s*['"]([^'"]+)['"]/i);
            let finalUrl = match ? match[1] : null;

            // Lógica Netu/UpFast detectada en Python
            if (finalUrl && finalUrl.includes('up.asdasd')) {
                const netuIdMatch = finalUrl.match(/\.site(.*?)$/);
                if (netuIdMatch) finalUrl = 'https://netu.to' + netuIdMatch[1];
            }

            return finalUrl;
        } catch (e) {
            return null;
        }
    };

    return await tryDownload();
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
async function getStreams(tmdbId, mediaType, season, episode, title) {
    if (!tmdbId || !mediaType) return [];

    // 1. Rescate de Info (Título y Año oficial)
    const tmdbInfo = await getTmdbInfo(tmdbId, mediaType);
    const mediaTitle = tmdbInfo ? tmdbInfo.title : title;
    const releaseYear = tmdbInfo ? tmdbInfo.year : '';

    if (!mediaTitle) return [];

    console.log(`[TioPlus] Buscando: ${mediaTitle} (${releaseYear})`);

    try {
        // 2. Búsqueda Progresiva
        const performSearch = async (titleQuery) => {
            const searchQuery = encodeURIComponent(titleQuery.split(/[:(]/)[0].trim());
            const url = `${BASE_URL}/search/${searchQuery}`;
            
            let html = "";
            try {
                if (spawnSync && typeof process !== 'undefined') {
                    const args = ['-s', '-k', '--http1.1', '-A', UA, url];
                    const result = spawnSync('curl.exe', args);
                    html = result.stdout ? result.stdout.toString() : '';
                } else {
                    html = await fetchHtml(url, { headers: { 'User-Agent': UA } });
                }
            } catch (e) {
                console.log(`[TioPlus] Error en búsqueda de ${titleQuery}: ${e.message}`);
                return { candidates: [], url };
            }

            const itemRegex = /<article[^>]*class=['"]item[^>]*>[\s\S]*?<a[^>]*href=['"]([^'"]+)['"][\s\S]*?<h2>([\s\S]*?)<\/h2>/gi;
            let match;
            const res = [];
            while ((match = itemRegex.exec(html)) !== null) {
                res.push({ url: match[1], title: match[2].trim() });
            }
            return { candidates: res, url };
        };

        let { candidates, url: lastSearchUrl } = await performSearch(mediaTitle);

        // Fallback: Si no hay resultados con el título completo, intentar con la raíz (ej: "Malcolm")
        if (candidates.length === 0 && mediaTitle.includes(' ')) {
            const rootTitle = mediaTitle.split(' ')[0];
            console.log(`[TioPlus] Reintentando búsqueda con raíz: ${rootTitle}`);
            const retry = await performSearch(rootTitle);
            candidates = retry.candidates;
            lastSearchUrl = retry.url;
        }

        if (candidates.length === 0) return [];

        // 3. Selección Inteligente (Puntuación por Palabra Clave + Año)
        let targetUrl = null;
        let bestScore = -1;
        const keywords = mediaTitle.toLowerCase().split(/[: ]/).filter(w => w.length > 2);

        for (const cand of candidates) {
            const candTitle = cand.title.toLowerCase();
            let score = 0;

            // Bonus por primera palabra (CRÍTICO si falla TMDB)
            if (keywords.length > 0 && candTitle.startsWith(keywords[0])) score += 10;

            // Puntuación por palabras clave comunes
            keywords.forEach(word => {
                if (candTitle.includes(word)) score += 5;
            });

            // Bonus crítico por AÑO (Evita confusiones entre partes de una saga)
            if (releaseYear && cand.title.includes(`(${releaseYear})`)) {
                score += 50;
            }

            // Bonus por coincidencia casi exacta de título
            if (candTitle.includes(mediaTitle.toLowerCase())) score += 10;

            const isCorrectType = (mediaType === 'movie' && cand.url.includes('/pelicula/')) ||
                                (mediaType !== 'movie' && cand.url.includes('/serie/'));
            
            if (isCorrectType && score > bestScore) {
                bestScore = score;
                targetUrl = cand.url;
            }
        }

        // Seguridad: Si el score es muy bajo, no es la película correcta
        if (bestScore < 10) targetUrl = null;

        if (!targetUrl) return [];

        // 3. Navegación a Medio/Episodio
        let finalMediaUrl = targetUrl;
        if (mediaType !== 'movie') {
            const s = parseInt(season) || 1;
            const e = parseInt(episode) || 1;
            finalMediaUrl = `${targetUrl}/season/${s}/episode/${e}`;
        }

        const mediaHtml = await fetchHtml(finalMediaUrl, {
            headers: { 'User-Agent': UA, 'Referer': lastSearchUrl }
        });
        if (!mediaHtml) return [];

        // 4. Capturar Capas de Idiomas y Servidores
        const serverRegex = /data-server=['"]([^'"]+)['"][^>]*>[\s\S]*?<span>([^<]+)<\/span>/gi;
        let sMatch;
        const encodes = [];
        
        while ((sMatch = serverRegex.exec(mediaHtml)) !== null) {
            const enc = sMatch[1];
            const rawServerName = sMatch[2].split('-')[0].trim();
            
            // FILTRO: Solo Earnvids y Plus (petición del usuario para mayor velocidad)
            if (rawServerName !== 'Earnvids' && rawServerName !== 'Plus') continue;

            let lang = 'LAT';
            if (mediaHtml.includes('audio Latino') || mediaHtml.includes('Español Latino')) lang = 'LAT';
            else if (mediaHtml.includes('audio Castellano') || mediaHtml.includes('Español España')) lang = 'ESP';
            else if (mediaHtml.includes('subtulada') || mediaHtml.includes('Subtitu')) lang = 'SUB';

            encodes.push({ enc, serverName: rawServerName, lang });
        }

        if (encodes.length === 0) return [];

        // 5. Bypass Player con Retardos Secuenciales (Relaja el ritmo para evitar saturación)
        const resolvedStreams = [];
        for (const item of encodes) {
            try {
                // Delays más cortos (1 a 2 segundos) para que sea más fluido en la App
                const delay = Math.floor(Math.random() * 1000) + 1000;
                await new Promise(r => setTimeout(r, delay));

                const realEmbedUrl = await getRedirectUrl(item.enc, finalMediaUrl);
                
                if (realEmbedUrl && realEmbedUrl.startsWith('http')) {
                    const resolved = await resolveEmbed(realEmbedUrl);
                    if (resolved && (resolved.url || (Array.isArray(resolved) && resolved.length > 0))) {
                        const streamsArray = Array.isArray(resolved) ? resolved : [resolved];
                        streamsArray.forEach(s => {
                            resolvedStreams.push({
                                ...s,
                                serverLabel: item.serverName,
                                langLabel: item.lang === 'LAT' ? 'Latino' : item.lang === 'ESP' ? 'Español' : 'Subtitulado'
                            });
                        });
                    }
                }
            } catch (err) {}
        }

        return await finalizeStreams(resolvedStreams, 'TioPlus', mediaTitle);

    } catch (error) {
        console.error(`[TioPlus] Error: ${error.message}`);
        return [];
    }
}

module.exports = { getStreams };
