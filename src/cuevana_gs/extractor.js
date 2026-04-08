import { resolve as resolveVoe } from '../resolvers/voe.js';
import { resolve as resolveFilemoon } from '../resolvers/filemoon.js';
import { resolve as resolveVimeos } from '../resolvers/vimeos.js';
import { calculateSimilarity } from '../utils/string.js';
import { fetchHtml, fetchJson, MOBILE_UA } from '../utils/http.js';

const BASE_URL = 'https://cuevana.gs';

/**
 * Resolutor generico basado en extractores globales
 */
async function resolveEmbed(embedUrl, server) {
    try {
        if (server === 'voe') {
            return await resolveVoe(embedUrl);
        }
        if (server.includes('filemoon') || server.includes('f75s')) {
            return await resolveFilemoon(embedUrl);
        }
        if (server === 'vimeos') {
            return await resolveVimeos(embedUrl);
        }
        
        // Fallback para otros servidores que puedan tener m3u8 directo en el HTML
        const html = await fetchHtml(embedUrl, { headers: { Referer: embedUrl } });
        const m = html.match(/https?:\/\/[^"'\s\\]+?\.m3u8[^"'\s\\]*/i);
        return m ? m[0].replace(/\\/g, '') : null;
    } catch (e) { 
        return null; 
    }
}

async function getTmdbInfo(tmdbId, mediaType) {
    try {
        const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
        const html = await fetchHtml(url);
        
        let title = "";
        let year = "";
        
        const titleMatch = html.match(/<title>(.*?)(?:\s+&\#8212;|\s+-|\s+\()/);
        if (titleMatch) title = titleMatch[1].trim();
        
        const yearMatch = html.match(/\((\d{4})\)/);
        if (yearMatch) year = yearMatch[1];
        
        return { title, year };
    } catch (e) { 
        console.warn(`[Cuevana.gs] Failed to fetch TMDB info: ${e.message}`);
    }
    return { title: null, year: "" };
}

export async function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
    const isMovie = mediaType === 'movie';
    const targetType = isMovie ? 'movies' : 'tvshows';
    
    console.log(`[Cuevana.gs] Extracting: ${providedTitle || tmdbId} (${mediaType})`);

    try {
        const tmdbInfo = await getTmdbInfo(tmdbId, mediaType);
        const searchTitle = providedTitle || tmdbInfo.title;
        const year = tmdbInfo.year;

        if (!searchTitle) {
            console.error('[Cuevana.gs] No search title found.');
            return [];
        }

        async function performSearch(query) {
            console.log(`[Cuevana.gs] Searching: "${query}"`);
            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `${BASE_URL}/wp-api/v1/search?postType=any&q=${encodedQuery}&postsPerPage=10`;
            try {
                return await fetchJson(searchUrl, { headers: { Referer: BASE_URL } });
            } catch (err) { 
                return { error: true }; 
            }
        }

        // Intento 1: Título + Año
        let searchJson = await performSearch(`${searchTitle} ${year}`);
        
        // Fallbacks si falla el primer intento
        if ((searchJson.error || !searchJson.data?.posts?.length) && tmdbInfo.title) {
            searchJson = await performSearch(tmdbInfo.title);
        }
        if (searchJson.error || !searchJson.data?.posts?.length) {
            searchJson = await performSearch(searchTitle);
        }

        if (searchJson.error || !searchJson.data?.posts?.length) {
            console.log(`[Cuevana.gs] No results found.`);
            return [];
        }

        const posts = searchJson.data.posts;
        const targetTitle = tmdbInfo.title || searchTitle;
        const matches = posts
            .filter(p => p.type === targetType)
            .map(p => ({ ...p, score: calculateSimilarity(targetTitle, p.title) }))
            .filter(p => p.score >= 0.45)
            .sort((a, b) => b.score - a.score);

        if (matches.length === 0) {
            console.log(`[Cuevana.gs] No high-quality matches found.`);
            return [];
        }

        let post = matches[0];
        let postId = post._id;

        // Búsqueda de episodio para Series
        if (!isMovie && season && episode) {
            try {
                const episodesUrl = `${BASE_URL}/wp-api/v1/single/episodes/list?_id=${postId}&season=${season}&postsPerPage=100`;
                const epJson = await fetchJson(episodesUrl, { headers: { Referer: BASE_URL } });
                if (!epJson.error && epJson.data?.posts) {
                    const epMatch = epJson.data.posts.find(e => parseInt(e.episode_number) === parseInt(episode));
                    if (epMatch) postId = epMatch._id;
                    else {
                        console.warn(`[Cuevana.gs] Episode S${season}E${episode} not found.`);
                        return [];
                    }
                }
            } catch (err) {
                console.error(`[Cuevana.gs] Error fetching episodes: ${err.message}`);
            }
        }

        // Obtener Embeds
        const playerUrl = `${BASE_URL}/wp-api/v1/player?postId=${postId}&demo=0`;
        const playerJson = await fetchJson(playerUrl, { headers: { Referer: BASE_URL } });

        if (playerJson.error || !playerJson.data?.embeds?.length) {
            console.log('[Cuevana.gs] No embeds found.');
            return [];
        }

        const embeds = playerJson.data.embeds;
        const streamPromises = embeds.map(async (embed) => {
            const proxyUrl = embed.url;
            const lang = embed.lang || 'Latino';
            const quality = embed.quality || 'HD';

            let server = 'unknown';
            try {
                const urlObj = new URL(proxyUrl);
                server = (urlObj.searchParams.get('server') || 'unknown').toLowerCase();
            } catch (e) { }

            if (server === 'goodstream') return null;

            try {
                const proxyHtml = await fetchHtml(proxyUrl, { headers: { Referer: BASE_URL } });
                const iframeMatch = proxyHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
                if (!iframeMatch) return null;
                const embedUrl = iframeMatch[1];

                const result = await resolveEmbed(embedUrl, server);
                if (!result) return null;

                const finalUrl = typeof result === 'string' ? result : result.url;
                const isDirect = typeof result === 'object' && !!result.url;

                if (!finalUrl || !finalUrl.startsWith('http')) return null;

                const isVimeos = server.includes('vimeos');
                const titlePrefix = isDirect ? "[Directo]" : "[Web]";

                return {
                    name: "Cuevana.gs",
                    title: `${titlePrefix} \xB7 ${server} (${lang})`,
                    url: finalUrl,
                    quality: (typeof result === 'object' && result.quality) || quality,
                    isM3U8: (typeof result === 'object' && result.isM3U8) || finalUrl.includes('.m3u8'),
                    headers: (typeof result === 'object' && result.headers) || {
                        "User-Agent": MOBILE_UA,
                        "Referer": isVimeos ? "https://vimeos.net/" : embedUrl,
                        "Origin": isVimeos ? "https://vimeos.net" : undefined
                    }
                };
            } catch (e) { return null; }
        });

        const results = await Promise.all(streamPromises);
        return results.filter(s => s !== null);

    } catch (error) {
        console.error(`[Cuevana.gs] Global Error: ${error.message}`);
        return [];
    }
}
