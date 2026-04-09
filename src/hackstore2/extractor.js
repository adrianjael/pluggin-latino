import { fetchHtml } from './http.js';
import { normalizeTitle, calculateSimilarity } from '../utils/string.js';
import { unpackEval } from '../utils/crypto.js';
import { resolve as resolveStreamwish } from '../resolvers/hlswish.js';
import { resolve as resolveVidhide } from '../resolvers/vidhide.js';
import { resolve as resolveVoesx } from '../resolvers/voe.js';
import { resolve as resolveVimeos } from '../resolvers/vimeos.js';
import { resolve as resolveFilemoon } from '../resolvers/filemoon.js';
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



async function resolveVimeosLocal(embedUrl) {
    try {
        return await resolveVimeos(embedUrl);
    } catch (e) {
        return null;
    }
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
        const html = await fetchHtml(url, url); // we can reuse fetchHtml since it just returns text
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

export async function extractStreams(tmdbId, mediaType, season, episode, providedTitle, providedYear) {
    console.log(`[HackStore2] Requesting streams for TMDB ID: ${tmdbId} (Title: ${providedTitle || 'N/A'})`);
    try {
        let searchTitle = providedTitle;
        let searchYear = providedYear;

        if (!searchTitle) {
            const tmdbInfo = await getTmdbInfo(tmdbId, mediaType);
            if (tmdbInfo) {
                searchTitle = tmdbInfo.title;
                searchYear = tmdbInfo.year;
            }
        }

        if (!searchTitle) {
            console.log("[HackStore2] Pelicula no encontrada (TMDB Scrape falló y no hay título).");
            return [];
        }

        // 2. Search API with Query Relaxation
        const postType = mediaType === 'movie' ? 'movies' : 'tvshows';
        const queriesToTry = [
            searchTitle,
            searchTitle.replace(/[:\-–]/g, ' '),
            searchTitle.split(' ').slice(0, 2).join(' ')
        ].filter((v, i, a) => a.indexOf(v) === i && v.length > 2);

        let matchedPost = null;
        const cleanYear = (s) => s.replace(/\(\d{4}\)/g, '').trim();
        const checkSequel = (query, target) => {
            const clean = (s) => s.replace(/\(\d{4}\)/g, '').trim();
            const getNum = (s) => (clean(s).match(/\b(\d+|I|II|III|IV|V)\b$/i) || [null, ""])[1];
            const qNum = getNum(query);
            const tNum = getNum(target);
            return qNum === tNum;
        };

        for (const query of queriesToTry) {
            console.log(`[HackStore2] Searching API for: ${query}`);
            const searchUrl = `https://hackstore2.com/api/rest/search?post_type=${postType}&query=${encodeURIComponent(query)}`;
            try {
                const searchRes = await fetch(searchUrl);
                const searchData = await searchRes.json();

                if (!searchData || searchData.error || !searchData.data || !searchData.data.posts) continue;

                // 3. Match closest movie/series title/year
                matchedPost = searchData.data.posts.find(p => {
                    const similarity = calculateSimilarity(searchTitle, cleanYear(p.title));
                    const sequelMatch = checkSequel(searchTitle, p.title);
                    return similarity > 0.7 && sequelMatch;
                });

                if (!matchedPost && searchYear) {
                    matchedPost = searchData.data.posts.find(p => {
                        const similarity = calculateSimilarity(searchTitle, cleanYear(p.title));
                        return similarity > 0.4 && p.years && p.years.toString().includes(searchYear);
                    });
                }

                if (matchedPost) {
                    console.log(`[HackStore2] Best Match found with query "${query}": ${matchedPost.title}`);
                    break;
                }
            } catch (e) {
                console.warn(`[HackStore2] Search fail for query "${query}":`, e.message);
            }
        }

        if (!matchedPost) {
            console.log(`[HackStore2] No strict match found for "${searchTitle}" (${searchYear || 'Any Year'}). Skipping...`);
            return [];
        }

        console.log(`[HackStore2] Match found: ${matchedPost.title} (ID: ${matchedPost._id})`);

        let finalPostId = matchedPost._id;

        // 4. If TV Show, we need episode ID
        if (mediaType === 'tv') {
            console.log(`[HackStore2] Fetching episodes for series ID: ${finalPostId}`);
            const episodesUrl = `https://hackstore2.com/api/rest/episodes?post_id=${finalPostId}`;
            const episodesRes = await fetch(episodesUrl);
            const episodesData = await episodesRes.json();

            if (!episodesData || !episodesData.data || !Array.isArray(episodesData.data)) {
                console.log("[HackStore2] No episodes found for this series.");
                return [];
            }

            // Buscar temporada y episodio (con campos correctos: season_number, episode_number)
            const episodeMatch = episodesData.data.find(e =>
                e.season_number.toString() === season.toString() &&
                e.episode_number.toString() === episode.toString()
            );

            if (!episodeMatch) {
                console.log(`[HackStore2] Episode S${season}E${episode} not found in this series.`);
                return [];
            }

            console.log(`[HackStore2] Found episode: ${episodeMatch.title} (ID: ${episodeMatch._id})`);
            finalPostId = episodeMatch._id;
        }

        // 5. Get Players
        const playerUrl = `https://hackstore2.com/api/rest/player?post_id=${finalPostId}`;
        const playerRes = await fetch(playerUrl);
        const playerData = await playerRes.json();

        if (!playerData || playerData.error || !playerData.data || !Array.isArray(playerData.data)) {
            console.log("[HackStore2] No players found.");
            return [];
        }

        // 6. Resolve links IN PARALLEL (Speed optimization)
        const streamPromises = playerData.data.map(async (player) => {
            const lang = player.lang || "Latino";

            // Filtro estricto: No subtitulados
            if (lang.toLowerCase().includes('sub') || lang.toLowerCase().includes('vose')) {
                return null;
            }

            let serverName = "Desconocido";
            let rawUrl = player.url || "";
            let finalUrl = rawUrl;

            // Map server name
            if (rawUrl.includes('hlswish') || rawUrl.includes('streamwish') || rawUrl.includes('hglamioz') || rawUrl.includes('embedwish')) serverName = 'streamwish';
            else if (rawUrl.includes('vidhide') || rawUrl.includes('dintezuvio')) serverName = 'vidhide';
            else if (rawUrl.includes('filemoon')) serverName = 'filemoon';
            else if (rawUrl.includes('voe')) serverName = 'voe';
            else if (rawUrl.includes('vimeos')) serverName = 'vimeos';
            
            // Resolve
            let resolvedData = null;
            if (serverName === 'streamwish') resolvedData = await resolveStreamwish(finalUrl);
            else if (serverName === 'vidhide') resolvedData = await resolveVidhide(finalUrl);
            else if (serverName === 'voe') resolvedData = await resolveVoesx(finalUrl);
            else if (serverName === 'vimeos') resolvedData = await resolveVimeos(finalUrl);
            else if (serverName === 'filemoon') resolvedData = await resolveFilemoon(finalUrl);
            
            if (!resolvedData || !resolvedData.url) return null;
            
            // Real Quality Verification
            const verifiedStream = await validateStream({
                langLabel: player.lang || "Latino",
                serverLabel: serverName,
                url: resolvedData.url,
                quality: resolvedData.quality || player.quality || "HD",
                headers: resolvedData.headers || {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Referer": rawUrl
                }
            });

            if (verifiedStream.verified) {
                console.log(`[HackStore2] Stream verified: ${verifiedStream.url.substring(0, 40)}...`);
                verifiedStream.quality = `(${verifiedStream.quality} ✓)`;
            } else {
                console.log(`[HackStore2] Stream verification failed (fallback to HD): ${verifiedStream.url.substring(0, 40)}...`);
                verifiedStream.quality = verifiedStream.quality || "HD";
            }

            return verifiedStream;
        });

        const playerResults = await Promise.all(streamPromises);
        return playerResults.filter(s => s !== null);
    } catch (error) {
        console.error(`[HackStore2] Error: ${error.message}`);
        return [];
    }
}
