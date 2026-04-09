/**
 * Extractor Logic for PelisPlusHD
 */
import { fetchText, BASE_URL } from './http.js';
import { resolve as resolveHlswish } from '../resolvers/hlswish.js';
import { resolve as resolveVidhide } from '../resolvers/vidhide.js';
import { resolve as resolveVoe } from '../resolvers/voe.js';
import { validateStream } from '../utils/m3u8.js';

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
    if (q === t || t.includes(q) || q.includes(t)) return true;
    
    const qWords = q.split(' ').filter(w => w.length > 2);
    const tWords = t.split(' ');
    if (qWords.length === 0) return false;
    return qWords.every(w => tWords.includes(w));
}

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';

/**
 * Identifica si un idioma es subtitulado
 */
function isSubtitled(lang) {
    if (!lang) return false;
    const l = lang.toLowerCase();
    return l.includes('sub') || l.includes('vose');
}

/**
 * Obtiene metadatos de TMDB
 */
async function getTmdbInfo(tmdbId, mediaType) {
    try {
        const typePath = mediaType === 'tv' ? 'tv' : 'movie';
        let url = `https://api.themoviedb.org/3/${typePath}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`;
        
        if (String(tmdbId).startsWith('tt')) {
            url = `https://api.themoviedb.org/3/find/${tmdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=es-MX`;
            const res = await fetch(url);
            const findData = await res.json();
            const result = mediaType === 'movie' ? findData.movie_results?.[0] : findData.tv_results?.[0];
            if (result) {
                return {
                    title: result.title || result.name || "",
                    originalTitle: result.original_title || result.original_name || "",
                    year: (result.release_date || result.first_air_date || "").split('-')[0]
                };
            }
        }

        const res = await fetch(url);
        const data = await res.json();
        return {
            title: data.title || data.name || "",
            originalTitle: data.original_title || data.original_name || "",
            year: (data.release_date || data.first_air_date || "").split('-')[0]
        };
    } catch (error) {
        console.error("[PelisPlusHD] TMDB Error:", error.message);
        return null;
    }
}

/**
 * Main extraction function
 */
export async function extractStreams(query, tmdbId, mediaType, season, episode) {
    try {
        console.log(`[PelisPlusHD] Extracting: ${query} (TMDB: ${tmdbId}, Type: ${mediaType})`);
        
        const tmdb = await getTmdbInfo(tmdbId, mediaType);
        const titlesToTry = [query];
        if (tmdb) {
            if (tmdb.title) titlesToTry.push(tmdb.title);
            if (tmdb.originalTitle) titlesToTry.push(tmdb.originalTitle);
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

                if (titleMatch(q, resultTitle) || (tmdb && (titleMatch(tmdb.title, resultTitle) || titleMatch(tmdb.originalTitle, resultTitle)))) {
                    // Calcular puntuación: exactitud de longitud (mejor cuanto menor sea la diferencia)
                    const normalizedQ = normalizeTitle(q);
                    const normalizedT = normalizeTitle(resultTitle);
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

        // 2. Extraer de los bloques de reproductores (Soporte para Series y Películas)
        console.log("[PelisPlusHD] Analyzing player blocks...");
        
        const playerBlocks = pageHtml.split('<div class="player">');
        playerBlocks.shift(); // Eliminar la parte anterior al primer bloque

        for (const block of playerBlocks) {
            // Extraer Idioma del bloque
            const langMatch = block.match(/<a[^>]*class="divseason"[^>]*>([\s\S]*?)<\/a>/i);
            const lang = langMatch ? langMatch[1].replace(/<[^>]+>/g, '').trim() : "Latino";
            
            if (isSubtitled(lang)) {
                console.log(`[PelisPlusHD] Skipping subtitled block: ${lang}`);
                continue;
            }

            // Opción A: Iframe activo (muy fiable para el primer resultado)
            const iframeMatch = block.match(/<iframe[^>]*src="([^"]+)"/i);
            if (iframeMatch) {
                const url = iframeMatch[1];
                if (!rawResults.some(r => r.serverUrl === url)) {
                    rawResults.push({ serverUrl: url, serverName: "Active Player", language: lang });
                }
            }

            // Opción B: LIs con data-url (Películas estándar)
            const liUrlRegex = /<li[^>]*data-url="([^"]+)"[^>]*data-name="([^"]+)"[^>]*>([\s\S]*?)<\/li>/gi;
            let m;
            while ((m = liUrlRegex.exec(block)) !== null) {
                const url = m[1];
                const resLang = m[2] || lang;
                const serverName = m[3].replace(/<[^>]+>/g, '').trim() || "Server";
                
                if (!isSubtitled(resLang) && !rawResults.some(r => r.serverUrl === url)) {
                    rawResults.push({ serverUrl: url, serverName, language: resLang });
                }
            }

            // Opción C: LIs con data-id (Series y nuevos formatos)
            const liIdRegex = /<li[^>]*data-id="(\d+)"[^>]*>([\s\S]*?)<\/li>/gi;
            let mId;
            while ((mId = liIdRegex.exec(block)) !== null) {
                const id = mId[1];
                const serverName = mId[2].replace(/<[^>]+>/g, '').trim() || "Server";
                
                // Buscar el URL correspondiente en el contenedor id="link_url" (fuera del bloque pero en pageHtml)
                const linkRegex = new RegExp(`<span[^>]*lid="${id}"[^>]*url="([^"]+)"`, 'i');
                const linkMatch = pageHtml.match(linkRegex);
                
                if (linkMatch) {
                    const url = linkMatch[1];
                    if (!rawResults.some(r => r.serverUrl === url)) {
                        rawResults.push({ serverUrl: url, serverName, language: lang });
                    }
                }
            }
        }

        console.log(`[PelisPlusHD] Found ${rawResults.length} raw sources.`);
        
        const results = [];
        const streamPromises = rawResults.map(async (res) => {
            try {
                let finalUrl = null;
                const url = res.serverUrl;

                if (url.includes('hlswish') || url.includes('hglamioz.com') || url.includes('streamwish')) {
                    finalUrl = await resolveHlswish(url);
                } else if (url.includes('vidhide')) {
                    finalUrl = await resolveVidhide(url);
                } else if (url.includes('voe')) {
                    finalUrl = await resolveVoe(url);
                }

                if (finalUrl) {
                    const directUrl = typeof finalUrl === 'string' ? finalUrl : finalUrl.url;
                    if (directUrl) {
                        const streamData = {
                            name: "PelisPlusHD",
                            url: directUrl,
                            quality: "HD",
                            langLabel: res.language,
                            serverLabel: res.serverName,
                            headers: (typeof finalUrl === 'object' && finalUrl.headers) ? finalUrl.headers : { "Referer": BASE_URL }
                        };

                        // Validación de calidad real (congelamos error individual para no romper la lista)
                        try {
                            const vStream = await validateStream(streamData);
                            if (vStream.verified) {
                                vStream.quality = `(${vStream.quality} ✓)`;
                            }
                            return vStream;
                        } catch (e) {
                            return streamData; // Si falla la validación, devolvemos el stream original HD
                        }
                    }
                }
            } catch (e) {
                console.error(`[PelisPlusHD] Error resolving ${res.serverUrl}:`, e.message);
            }
            return null;
        });

        const allResults = await Promise.all(streamPromises);
        return allResults.filter(s => s !== null);
    } catch (error) {
        console.error("[PelisPlusHD] extractStreams Error:", error.message);
        return [];
    }
}
