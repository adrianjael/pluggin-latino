/**
 * Extractor Logic for PelisPlusHD
 */
const { fetchText, BASE_URL } = require('./http.js');
const { resolveEmbed } = require('../utils/resolvers.js');
const { validateStream } = require('../utils/m3u8.js');
const { getTmdbTitle } = require('../utils/tmdb.js');

/**
 * Normaliza un título para comparaciones
 */
function normalizeTitle(t) {
    if (!t) return '';
    return t.toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Comprueba si un título encontrado coincide con la búsqueda
 */
function titleMatch(query, target) {
    const q = normalizeTitle(query);
    const t = normalizeTitle(target);
    if (!q || !t) return false;
    if (q === t) return true;
    
    const qWords = q.split(' ').filter(w => w.length > 2);
    const tWords = t.split(' ');
    if (qWords.length === 0) return q === t;
    
    const matchCount = qWords.filter(w => tWords.includes(w)).length;
    const ratio = matchCount / qWords.length;
    return ratio >= 0.8; // Exigir al menos el 80% de las palabras de la consulta
}

// Metadatos centralizados vía tmdb.js

/**
 * Identifica si un idioma es subtitulado o inglés (Filtro Agresivo v9.6)
 */
function isSubtitled(lang) {
    if (!lang) return false;
    const l = lang.toLowerCase();
    return l.includes('sub') || l.includes('vose') || l.includes('ing') || l.includes('eng') || l.includes('cast') || l.includes('orig');
}

// El index.js se encarga de obtener el título oficial.

/**
 * Main extraction function
 */
async function extractStreams(query, tmdbId, mediaType, season, episode) {
    try {
        console.log(`[PelisPlusHD] Extracting: ${query} (TMDB: ${tmdbId}, Type: ${mediaType})`);
        
        // RADAR DE ALIAS v13.0: Obtener todos los nombres posibles desde TMDB
        const { getTmdbAliases } = require('../utils/tmdb.js');
        let titlesToTry = [query];
        
        if (tmdbId && tmdbId.toString().match(/^\d+/) && !tmdbId.toString().startsWith('tt')) {
            const aliases = await getTmdbAliases(tmdbId, mediaType);
            if (aliases.length > 0) {
                console.log(`[PelisPlusHD] Alias Radar found ${aliases.length} titles to try.`);
                // Priorizar títulos que contengan palabras en español o el query original
                titlesToTry = Array.from(new Set([query, ...aliases]));
            }
        }

        let movieUrl = null;
        for (const q of titlesToTry) {
            if (!q) continue;
            const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(q)}`;
            console.log(`[PelisPlusHD] Searching: ${searchUrl}`);
            const searchHtml = await fetchText(searchUrl);
            
            const aRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            let m;
            const matches = [];

            while ((m = aRegex.exec(searchHtml)) !== null) {
                const href = m[1];
                const inner = m[2];
                if (mediaType === 'movie' && !href.includes('/pelicula/')) continue;
                if (mediaType === 'tv' && !href.includes('/serie/')) continue;
                
                let resultTitle = "";
                const pMatch = inner.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
                if (pMatch) resultTitle = pMatch[1].trim();
                else {
                    const tMatch = m[0].match(/data-title="([^"]+)"/i);
                    if (tMatch) resultTitle = tMatch[1].trim();
                }

                // Limpieza de títulos (PelisPlus añade prefijos y sufijos ruidosos)
                resultTitle = resultTitle
                    .replace(/^VER\s+/i, '')
                    .replace(/\s+Online\s+Gratis\s+HD$/i, '')
                    .replace(/\s+Online\s+Latino\s+HD$/i, '')
                    .replace(/\(\d{4}\)$/, '')
                    .trim();

                const normalizedQ = normalizeTitle(q);
                const normalizedT = normalizeTitle(resultTitle);
                
                // Filtro de Categoría Flexible (Soporta /serie/, /series/, /anime/, /dorama/)
                const isMovieLink = href.includes('/pelicula/');
                const isTvLink = href.includes('/serie') || href.includes('/anime') || href.includes('/dorama');

                if (mediaType === 'movie' && !isMovieLink) continue;
                if (mediaType === 'tv' && !isTvLink) continue;

                if (titleMatch(q, resultTitle)) {
                    const score = Math.abs(normalizedQ.length - normalizedT.length);
                    
                    matches.push({ href: BASE_URL + href, title: resultTitle, score });
                }
            }

            if (matches.length > 0) {
                // Ordenar por puntuación (más cercano a 0 es mejor)
                matches.sort((a, b) => a.score - b.score);
                movieUrl = matches[0].href;
                console.log(`[PelisPlusHD] Best Match: ${matches[0].title} (${movieUrl})`);
                break;
            }
        }

        if (!movieUrl) {
            console.log(`[PelisPlusHD] No matches found for ${tmdbId}`);
            return [];
        }

        if (mediaType === 'tv') {
            if (movieUrl.endsWith('/')) movieUrl = movieUrl.slice(0, -1);
            movieUrl = `${movieUrl}/temporada/${season}/capitulo/${episode}`;
            console.log(`[PelisPlusHD] Episode URL: ${movieUrl}`);
        }

        const pageHtml = await fetchText(movieUrl);
        const rawResults = [];

        // 1. Extraer del objeto dinámico 'var options'
        const optionsRegex = /var\s+options\s*=\s*({[\s\S]*?});/i;
        const optionsMatch = pageHtml.match(optionsRegex);
        if (optionsMatch) {
            console.log("[PelisPlusHD] Found 'var options' JSON.");
            try {
                let jsonStr = optionsMatch[1]
                    .replace(/,\s*}/g, '}')
                    .replace(/,\s*]/g, ']')
                    .replace(/\/\/.*/g, '')
                    .replace(/'/g, '"');
                const options = JSON.parse(jsonStr);
                for (const key in options) {
                    if (isSubtitled(key)) {
                        console.log(`[PelisPlusHD] Skipping subtitled category: ${key}`);
                        continue;
                    }
                    const list = options[key];
                    if (Array.isArray(list)) {
                        list.forEach(item => {
                            if (item.url) rawResults.push({ serverUrl: item.url, serverName: item.name || key, language: key });
                        });
                    }
                }
            } catch (e) {
                console.warn("[PelisPlusHD] JSON parse failed, trying regex on options.");
                // Intentar capturar url e idioma/servidor por contexto
                const linkRegex = /"url":\s*"([^"]+)"[^{}]*"name":\s*"([^"]+)"/g;
                let linkM;
                while ((linkM = linkRegex.exec(optionsMatch[1])) !== null) {
                    const url = linkM[1];
                    const label = linkM[2] || "Latino";
                    if (!isSubtitled(label)) {
                        rawResults.push({ serverUrl: url, serverName: label, language: label });
                    }
                }
            }
        }

        // 2. Extraer mapeo de enlaces (Estructura de Series #link_url)
        const linkMap = {};
        const spanRegex = /<span[^>]*lid=["']?(\d+)["']?[^>]*url=["']?([^"'\s>]+)["']?/gi;
        let sMatch;
        while ((sMatch = spanRegex.exec(pageHtml)) !== null) {
            linkMap[sMatch[1]] = sMatch[2];
        }

        // 3. Extraer de los bloques de reproductores (Soporte para Series y Películas)
        console.log("[PelisPlusHD] Analyzing player blocks...");
        
        const playerBlocks = pageHtml.split('<div class="player">');
        playerBlocks.shift();

        for (const block of playerBlocks) {
            const blockLangs = [];
            // Detectar idioma del bloque (divseason)
            const dMatches = block.match(/<a[^>]*class="divseason"[^>]*>([\s\S]*?)<\/a>/gi);
            if (dMatches) dMatches.forEach(m => blockLangs.push(m.replace(/<[^>]+>/g, '').trim()));

            const liAllRegex = /<li([^>]*?)>([\s\S]*?)<\/li>/gi;
            let m;
            while ((m = liAllRegex.exec(block)) !== null) {
                const liAttr = m[1];
                const liLabel = m[2].replace(/<[^>]+>/g, '').trim() || "Server";

                const urlMatch = liAttr.match(/data-url=["']?([^"'\s>]+)["']?/i);
                const nameMatch = liAttr.match(/data-name=["']?([^"'\s>]+)["']?/i);
                const idMatch = liAttr.match(/data-id=["']?(\d+)["']?/i);
                
                // ASOCIACIÓN ESTRICTA: Si hay varios idiomas en el bloque, el data-name es obligatorio
                // para evitar fugas de servidores subtitulados.
                let itemLang = "Latino";
                if (nameMatch) {
                    itemLang = nameMatch[1];
                } else if (blockLangs.length === 1) {
                    itemLang = blockLangs[0];
                } else {
                    // Si hay ambigüedad (múltiples idiomas y sin data-name), descartamos por seguridad
                    continue;
                }

                // FILTRO PARANOICO v10.0
                if (isSubtitled(itemLang) || isSubtitled(liLabel) || liLabel.includes('.com')) {
                    continue;
                }

                let serverUrl = urlMatch ? urlMatch[1] : null;
                if (!serverUrl && idMatch && linkMap[idMatch[1]]) {
                    serverUrl = linkMap[idMatch[1]];
                }

                if (serverUrl && !rawResults.some(r => r.serverUrl === serverUrl)) {
                    rawResults.push({ serverUrl, serverName: liLabel, language: itemLang });
                }
            }
        }

        const { resolveEmbed } = require('../utils/resolvers.js');
        const { validateStream } = require('../utils/m3u8.js');
        const { finalizeStreams } = require('../utils/engine.js');
        
        console.log(`[PelisPlusHD] Resolving ${rawResults.length} sources (v9.3.0 Optimized)...`);
        
        const candidates = [];
        const TARGET_COUNT = 4;
        let isFinished = false;
        
        const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        const signal = controller ? controller.signal : null;

        const processStream = async (res) => {
            if (isFinished) return null;
            try {
                const url = res.serverUrl;
                if (!url || url.length < 10) return null;

                const lName = (res.language || "").toLowerCase();
                const sName = (res.serverName || "").toLowerCase();

                // Filtrado Paranoico v9.6
                const isLatino = lName.includes("lat") || lName.includes("español");
                const isForbid = lName.includes("sub") || lName.includes("ing") || lName.includes("eng") || 
                                sName.includes("sub") || sName.includes("ing") || sName.includes("vose") ||
                                sName.includes(".com") || sName.includes("original");

                if (!isLatino || isForbid) return null;

                const finalUrl = await resolveEmbed(url, signal);
                if (!finalUrl || isFinished) return null;

                const directUrl = typeof finalUrl === 'string' ? finalUrl : finalUrl.url;
                const headers = (typeof finalUrl === 'object' && finalUrl.headers) ? finalUrl.headers : { "Referer": BASE_URL };

                const streamData = {
                    url: directUrl,
                    quality: "HD",
                    language: "Latino",
                    serverLabel: res.serverName,
                    headers: headers
                };

                const vStream = await validateStream(streamData, signal);
                const result = (vStream && vStream.verified) ? vStream : streamData;

                if (!isFinished && result) {
                    candidates.push(result);
                    if (candidates.length >= TARGET_COUNT) {
                        isFinished = true;
                        if (controller) try { controller.abort(); } catch(e){} 
                    }
                }
                return result;
            } catch (e) {
                return null;
            }
        };

        let timeoutId;
        const timeoutPromise = new Promise(resolve => {
            timeoutId = setTimeout(() => {
                isFinished = true;
                if (controller) try { controller.abort(); } catch(e){} 
                resolve();
            }, 8000);
        });

        try {
            await Promise.race([
                Promise.all(rawResults.map(res => processStream(res))),
                timeoutPromise
            ]);
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
        }

        // Integración con el motor central para el formateo y filtrado final final
        return await finalizeStreams(candidates, "PelisPlusHD", query);
    } catch (error) {
        console.error("[PelisPlusHD] extractStreams Error:", error.message);
        return [];
    }
}

module.exports = { extractStreams };
