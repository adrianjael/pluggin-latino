import cheerio from 'cheerio-without-node-native';
import { fetchHtml } from '../pelisplus/http.js';
import { normalizeTitle, calculateSimilarity } from '../utils/string.js';
import { unpackEval } from '../utils/crypto.js';
import { resolveEmbed } from '../utils/resolvers.js';
import { validateStream } from '../utils/m3u8.js';


function extractM3u8FromHtml(html) {
    let unpacked = "";
    const packMatch = html.match(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/);
    if (packMatch) {
        try {
            unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
        } catch (e) { }
    } else {
        unpacked = html;
    }
    unpacked = unpacked.replace(/k:\/\//g, 'https://');
    const m = unpacked.match(/https?:\/\/[^"'\s\\]+?\.m3u8[^"'\s\\]*/i);
    return m ? m[0].replace(/\\/g, '') : null;
}


/**
 * Comprueba si un título es una coincidencia aceptable (score > 0.4)
 */
function isGoodMatch(query, result, minScore = 0.4) {
    return calculateSimilarity(query, result) >= minScore;
}

async function getTmdbInfo(tmdbId, mediaType) {
    try {
        const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
        const html = await fetchHtml(url, url);
        const $ = cheerio.load(html);
        
        const title = $('.title h2 a').text().trim();
        const originalTitle = $('.original_title').text().replace('Título original:', '').trim();
        const releaseYear = $('.release_date').text().match(/\d{4}/);
        
        return { 
            title: title || '', 
            originalTitle: originalTitle || title || '',
            year: releaseYear ? releaseYear[0] : null
        };
    } catch (error) {
        return null;
    }
}

export async function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
    console.log(`[PelisPanda] Extracting streams for TMDB ID: ${tmdbId} (${mediaType})`);
    try {
        let searchTitle = providedTitle;
        let searchYear = null;

        if (!searchTitle) {
            const tmdbInfo = await getTmdbInfo(tmdbId, mediaType);
            if (tmdbInfo) {
                searchTitle = tmdbInfo.title;
                searchYear = tmdbInfo.year;
            }
        }

        if (!searchTitle) {
            console.log("[PelisPanda] Search title not found (TMDB scrape failed and no title provided).");
            return [];
        }

        console.log(`[PelisPanda] Buscar en API por: ${searchTitle}`);
        
        // 1. Buscamos el contenido en la API WpReact
        const searchUrl = `https://pelispanda.org/wp-json/wpreact/v1/search?query=${encodeURIComponent(searchTitle)}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        const targetType = mediaType === 'movie' ? 'pelicula' : 'serie';
        
        // 2. Búsqueda de alta precisión: Priorizamos coincidencia por TMDB ID y Tipo
        let movieMatch = searchData.results.find(r => r.tmdb_id == tmdbId && r.type === targetType);
        
        if (!movieMatch) {
            // Fallback 1: Coincidencia mediante similitud (Fuzzy Match)
            movieMatch = searchData.results.find(r => 
                isGoodMatch(searchTitle, r.title) && r.type === targetType
            );
        }

        if (!movieMatch) {
            // Fallback 2: Coincidencia por ID (si el tipo no coincide por alguna razón, ej: anime labeled as serie)
            movieMatch = searchData.results.find(r => r.tmdb_id == tmdbId);
        }

        if (!movieMatch || !movieMatch.slug) {
            console.log("[PelisPanda] No se encontró ninguna coincidencia válida en los resultados.");
            return [];
        }

        console.log(`[PelisPanda] Selección final: ${movieMatch.title || 'Desconocido'} (Slug: ${movieMatch.slug})`);
        
        // El endpoint oculto que devuelve los enlaces en PelisPanda
        const endpointType = mediaType === 'movie' ? 'movie' : 'serie';
        const playersUrl = `https://pelispanda.org/wp-json/wpreact/v1/${endpointType}/${movieMatch.slug}/related`;
        const playersRes = await fetch(playersUrl);
        const playersData = await playersRes.json();
        
        let embeds = [];
        if (mediaType === 'movie') {
            if (playersData && playersData.embeds) {
                 embeds = playersData.embeds;
            }
        } else {
            // Para series, buscamos en el mismo array de embeds filtrando por S/E
            if (playersData && playersData.embeds) {
                embeds = playersData.embeds.filter(e => 
                    e.season == season && e.episode == episode
                );
            }
        }
        
        if (embeds.length === 0) {
            console.log("[PelisPanda] No se encontraron reproductores embebidos.");
            return [];
        }

        // 6. Resolve links IN PARALLEL (Speed optimization)
        const streamPromises = embeds.map(async (player) => {
            const lang = player.lang || "Latino";
            
            // Filtro estricto: No subtitulados
            if (lang.toLowerCase().includes('sub') || lang.toLowerCase().includes('vose')) {
                return null;
            }

            let serverName = "Desconocido";
            let rawUrl = player.url || "";
            let finalUrl = rawUrl.replace(/\\\//g, '/'); // limpiar slashes de json

            // Map server name (for labels)
            if (finalUrl.includes('hlswish') || finalUrl.includes('streamwish') || finalUrl.includes('hglamioz') || finalUrl.includes('embedwish')) serverName = 'streamwish';
            else if (finalUrl.includes('vidhide') || finalUrl.includes('dintezuvio')) serverName = 'vidhide';
            else if (finalUrl.includes('filemoon')) serverName = 'filemoon';
            else if (finalUrl.includes('voe') || finalUrl.includes('jessicaclearout')) serverName = 'voe';
            else if (finalUrl.includes('vimeos') || finalUrl.includes('vms.sh') || finalUrl.includes('vimeo')) serverName = 'vimeos';
            else if (finalUrl.includes('goodstream')) serverName = 'goodstream';
            
            // Resolve using Central Dispatcher
            resolvedData = await resolveEmbed(finalUrl);
            
            if (!resolvedData || !resolvedData.url) return null;

            const streamData = {
                langLabel: player.lang || "Latino",
                serverLabel: serverName,
                url: resolvedData.url,
                quality: resolvedData.quality || player.quality || "HD",
                headers: resolvedData.headers || {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Referer": rawUrl
                }
            };

            // Filtrar subtítulos en PelisPanda
            if (streamData.langLabel.toLowerCase().includes('sub') || streamData.langLabel.toLowerCase().includes('vose')) {
                return null;
            }

            try {
                const vStream = await validateStream(streamData);
                if (vStream.verified) {
                    vStream.quality = `(${vStream.quality} ✓)`;
                }
                return vStream;
            } catch (e) {
                return streamData;
            }
        });

        const playerResults = await Promise.all(streamPromises);
        return playerResults.filter(s => s !== null);
    } catch (error) {
        console.error(`[PelisPanda] Error crítico: ${error.message}`);
        return [];
    }
}
