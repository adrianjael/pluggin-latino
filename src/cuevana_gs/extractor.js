import { calculateSimilarity, getHostname } from '../utils/string.js';
import { fetchHtml, DEFAULT_UA } from '../utils/http.js';
import { finalizeStreams } from '../utils/engine.js';
import { resolveEmbed } from '../utils/resolvers.js';
import cheerio from 'cheerio-without-node-native';

var BASE_URL = 'https://cue.cuevana3.nu';
var TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';


import { getCorrectImdbId } from '../utils/id_mapper.js';

async function getTmdbInfo(tmdbId, mediaType) {
    try {
        var url = "https://api.themoviedb.org/3/" + mediaType + "/" + tmdbId + "?api_key=" + TMDB_API_KEY + "&language=es-MX";
        const res = await fetch(url);
        const json = await res.json();
        
        if (json && json.id) {
            var title = json.title || json.name || "";
            var originalTitle = json.original_title || json.original_name || "";
            var year = "";
            var date = json.release_date || json.first_air_date || "";
            if (date) year = date.split('-')[0];
            return { title: title, originalTitle: originalTitle, year: year };
        }
    } catch (e) {}
    return { title: null, year: "" };
}

export async function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
    var isSeries = mediaType === 'tv';
    
    console.log("[Cuevana3.nu] Extracting: " + (providedTitle || tmdbId) + " (" + mediaType + ")");

    try {
        // --- 0. Inteligencia de IDs Centralizada ---
        const mapperResult = await getCorrectImdbId(tmdbId, mediaType);
        
        // --- 1. Obtener Info de TMDB ---
        var tmdbInfo = await getTmdbInfo(tmdbId, mediaType);
        
        // Usar título del mapeador si existe, si no el de TMDB, si no el provisto
        var searchTitle = mapperResult.title || providedTitle || tmdbInfo.title;
        var originalTitle = tmdbInfo.originalTitle || "";
        var year = tmdbInfo.year;

        if (!searchTitle) {
            console.error('[Cuevana3.nu] No search title found.');
            return [];
        }

        // --- 1. Motor de Búsqueda Scraper ---
        var performSearch = async function(query) {
            console.log("[Cuevana3.nu] Searching API: \"" + query + "\"...");
            var searchUrl = BASE_URL + "/wp-json/cuevana/v1/search?q=" + encodeURIComponent(query);
            try {
                var responseText = await fetchHtml(searchUrl);
                var json = JSON.parse(responseText);
                var results = [];

                if (json && json.data && Array.isArray(json.data)) {
                    results = json.data.map(item => {
                        const info = item.info || {};
                        const isMovie = info.type === 'movie' || !item.link.includes('/series-online/');
                        return {
                            title: item.title.trim(),
                            originalTitle: info.original_title || "",
                            type: isMovie ? 'movies' : 'tvshows',
                            slug: item.link,
                            year: info.release ? info.release.split('-')[0] : "",
                            id: info._id || ""
                        };
                    });
                }

                console.log("[Cuevana3.nu] API returned " + results.length + " candidates.");

                // Filtrado inteligente
                var filtered = results.filter(r => {
                    const typeMatch = isSeries ? r.type === 'tvshows' : r.type === 'movies';
                    const simSpanish = calculateSimilarity(searchTitle, r.title);
                    const simOriginal = calculateSimilarity(originalTitle, r.originalTitle);
                    const maxSim = Math.max(simSpanish, simOriginal);
                    
                    console.log(`[Cuevana3.nu] Checking candidate: "${r.title}" | Sim: ${maxSim.toFixed(2)} | Type: ${r.type} | Year: ${r.year}`);

                    const titleMatch = maxSim > 0.4;
                    
                    // Si el título es perfecto (1.0), ignoramos el año. Si no, permitimos +-2 años.
                    var yearMatch = true;
                    if (year && r.year && maxSim < 0.9) {
                        yearMatch = Math.abs(parseInt(year) - parseInt(r.year)) <= 2;
                        if (!yearMatch) console.log(`   [Cuevana3.nu] Year mismatch: ${year} vs ${r.year}`);
                    }

                    return typeMatch && titleMatch && yearMatch;
                });

                // Ordenar por similitud
                filtered.sort((a, b) => {
                    const simA = Math.max(calculateSimilarity(searchTitle, a.title), calculateSimilarity(searchTitle, a.originalTitle));
                    const simB = Math.max(calculateSimilarity(searchTitle, b.title), calculateSimilarity(searchTitle, b.originalTitle));
                    return simB - simA;
                });

                return filtered;
            } catch (err) {
                console.error("[Cuevana3.nu] Search API error: " + err.message);
                return [];
            }
        };

        var searchResults = [];
        var queriesToTry = [
            mapperResult.imdbId, // PRIORIDAD 1: Búsqueda exacta por ID
            searchTitle,
            originalTitle, // Intentar con el título original (importante para traducciones)
            providedTitle,
            (searchTitle || "").split(':')[0],
            (searchTitle || "").split(' ').sort((a,b) => b.length - a.length)[0] // Palabra más larga
        ].filter((v, i, a) => v && a.indexOf(v) === i); // Unicos y no nulos

        for (var q of queriesToTry) {
            if (searchResults.length > 0) break;
            console.log("[Cuevana3.nu] Trying search query: \"" + q + "\"");
            searchResults = await performSearch(q);
        }

        if (searchResults.length === 0) {
            console.warn("[Cuevana3.nu] No accurate match found after multiple attempts for: " + searchTitle);
            return [];
        }

        // --- 2. Selección Inteligente del Mejor Candidato ---
        // Ordenar por similitud y luego por año
        searchResults.sort((a, b) => {
            const simA = Math.max(
                calculateSimilarity(searchTitle, a.title), 
                calculateSimilarity(searchTitle, a.originalTitle),
                calculateSimilarity(originalTitle, a.originalTitle)
            );
            const simB = Math.max(
                calculateSimilarity(searchTitle, b.title), 
                calculateSimilarity(searchTitle, b.originalTitle),
                calculateSimilarity(originalTitle, b.originalTitle)
            );
            
            if (Math.abs(simA - simB) > 0.1) return simB - simA;
            
            // Si la similitud es parecida, preferimos el año más cercano
            if (year) {
                const distA = Math.abs(parseInt(year) - (parseInt(a.year) || 0));
                const distB = Math.abs(parseInt(year) - (parseInt(b.year) || 0));
                return distA - distB;
            }
            return 0;
        });

        var match = searchResults[0];

        // Verificamos si es una coincidencia aceptable
        const finalSim = Math.max(
            calculateSimilarity(searchTitle, match.title),
            calculateSimilarity(originalTitle, match.originalTitle)
        );

        // Si es estreno (2025/2026) y el año es perfecto, somos más flexibles con el título
        const isPremiere = year && parseInt(year) >= 2025;
        const yearPerfectMatch = year && match.year && parseInt(year) === parseInt(match.year);

        if (finalSim < 0.2 && !(isPremiere && yearPerfectMatch)) {
            console.warn("[Cuevana3.nu] Top match has very low similarity: " + finalSim);
            return [];
        }
        var mediaInfo = {
            title: match.title,
            slug: match.slug,
            type: match.type,
            _id: match.id
        };
        console.log("[Cuevana3.nu] Match found: " + match.title + " (ID: " + match.id + ") ["+match.type+"]");

        // --- 4. Extracción de Streams (API Directa) ---
        var getOnlineStreams = async function(url) {
            console.log("[Cuevana3.nu] API Extraction for: " + url);
            try {
                var id = mediaInfo._id;
                if (!id) {
                    // Fallback: extraer de la URL si no tenemos el ID
                    var matchId = url.match(/\/(\d+)\//);
                    id = matchId ? matchId[1] : null;
                }

                if (!id) {
                    console.error("[Cuevana3.nu] Could not determine ID for API call");
                    return { error: true };
                }

                var apiUrl = "";
                if (isSeries) {
                    var s = season || 1;
                    var e = episode || 1;
                    apiUrl = BASE_URL + "/wp-json/cuevana/v1/episode/" + id + "/" + s + "/" + e;
                } else {
                    apiUrl = BASE_URL + "/wp-json/cuevana/v1/player/" + id;
                }

                console.log("[Cuevana3.nu] Calling API: " + apiUrl);
                var response = await fetchHtml(apiUrl);
                var json = JSON.parse(response);

                if (!json || !json.data || !json.data.embeds) {
                    console.error("[Cuevana3.nu] API returned no embeds");
                    return { data: [] };
                }

                var streams = [];
                for (const embed of json.data.embeds) {
                    if (embed.url) {
                        streams.push({
                            url: embed.url,
                            serverLabel: embed.server || embed.service_name || "Server",
                            langLabel: embed.audio || "Latino"
                        });
                    }
                }

                console.log("[Cuevana3.nu] API successfully returned " + streams.length + " streams");
                return { data: streams };

            } catch (err) {
                console.error("[Cuevana3.nu] API Extraction Error: " + err.message);
                return { error: true };
            }
        };

        var streamResult = await getOnlineStreams(BASE_URL + (isSeries ? mediaInfo.episodeSlug : mediaInfo.slug));
        if (streamResult.error) return [];
        var streams = streamResult.data;

        console.log("[Cuevana3.nu] Processing " + streams.length + " streams for resolution...");

        // --- 5. Resolución de Enlaces ---
        var rawResults = [];
        for (const stream of streams) {
            try {
                const resolved = await resolveEmbed(stream.url);
                if (resolved && resolved.url) {
                    rawResults.push({
                        url: resolved.url,
                        quality: resolved.quality,
                        serverLabel: stream.serverLabel,
                        langLabel: stream.langLabel,
                        headers: resolved.headers || {}
                    });
                }
            } catch (e) {
                console.error("[Cuevana3.nu] Resolution Error for " + stream.label + ": " + e.message);
            }
        }

        return await finalizeStreams(rawResults, 'Cuevana3.to');
    } catch (err) {
        console.error("[Cuevana3.nu] Global Error: " + err.message);
        return [];
    }
}
