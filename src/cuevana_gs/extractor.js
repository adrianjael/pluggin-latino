import { resolve as resolveVoe } from '../resolvers/voe.js';
import { resolve as resolveFilemoon } from '../resolvers/filemoon.js';

const BASE_URL = 'https://cuevana.gs';
const BASE_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    'Referer': BASE_URL,
    'Accept-Language': 'es-ES,es;q=0.9'
};

async function fetchHtml(url, referer = BASE_URL) {
    const res = await fetch(url, { headers: { ...BASE_HEADERS, Referer: referer } });
    return res.text();
}

/**
 * Resolutor generico basado en extractores globales
 */
async function resolveEmbed(embedUrl, server) {
    try {
        if (server === 'voe') {
            const r = await resolveVoe(embedUrl);
            return r ? r.url : null;
        }
        if (server.includes('filemoon') || server.includes('f75s')) {
            const r = await resolveFilemoon(embedUrl);
            return r ? r.url : null;
        }
        
        // Fallback para otros servidores que puedan tener m3u8 directo en el HTML
        const html = await fetchHtml(embedUrl, embedUrl);
        const m = html.match(/https?:\/\/[^"'\s\\]+?\.m3u8[^"'\s\\]*/i);
        return m ? m[0].replace(/\\/g, '') : null;
    } catch (e) { return null; }
}

async function getTmdbInfo(tmdbId, mediaType) {
    try {
        const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
        const res = await fetch(url, { headers: { 'User-Agent': BASE_HEADERS['User-Agent'] } });
        const html = await res.text();
        
        let title = "";
        let year = "";
        
        const titleMatch = html.match(/<title>(.*?)(?:\s+&\#8212;|\s+-|\s+\()/);
        if (titleMatch) title = titleMatch[1].trim();
        
        const yearMatch = html.match(/\((\d{4})\)/);
        if (yearMatch) year = yearMatch[1];
        
        return { title, year };
    } catch (e) { }
    return { title: null, year: "" };
}

export async function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
    const isMovie = mediaType === 'movie';
    const targetType = isMovie ? 'movies' : 'tvshows';
    
    console.log(`[Cuevana.gs v2.0] Extracting: ${providedTitle || tmdbId} (${mediaType}) S${season}E${episode}`);

    try {
        const tmdbInfo = await getTmdbInfo(tmdbId, mediaType);
        let searchTitle = providedTitle || tmdbInfo.title;
        const year = tmdbInfo.year;

        async function performSearch(query) {
            console.log(`[Cuevana.gs] Searching: "${query}"`);
            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `${BASE_URL}/wp-api/v1/search?postType=any&q=${encodedQuery}&postsPerPage=10`;
            try {
                const searchRes = await fetch(searchUrl, { headers: BASE_HEADERS });
                return await searchRes.json();
            } catch (err) { return { error: true }; }
        }

        let searchJson = await performSearch(`${searchTitle} ${year}`);
        if ((searchJson.error || !searchJson.data?.posts?.length) && providedTitle && tmdbInfo.title) {
            searchJson = await performSearch(`${tmdbInfo.title} ${year}`);
        }
        if ((searchJson.error || !searchJson.data?.posts?.length) && tmdbInfo.title) {
            searchJson = await performSearch(tmdbInfo.title);
        }
        if (searchJson.error || !searchJson.data?.posts?.length) {
            searchJson = await performSearch(searchTitle);
        }

        if (searchJson.error || !searchJson.data || !searchJson.data.posts || searchJson.data.posts.length === 0) {
            console.log(`[Cuevana.gs] No results found.`);
            return [];
        }

        const posts = searchJson.data.posts;
        const normalizedTarget = (tmdbInfo.title || searchTitle).toLowerCase().replace(/[^a-z0-9]/g, '');
        let post = posts.find(p => p.type === targetType && 
            p.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedTarget)) ||
            posts.find(p => p.type === targetType) ||
            posts[0];

        let postId = post._id;
        if (!isMovie && season && episode) {
            try {
                const episodesUrl = `${BASE_URL}/wp-api/v1/single/episodes/list?_id=${postId}&season=${season}&postsPerPage=100`;
                const epRes = await fetch(episodesUrl, { headers: BASE_HEADERS });
                const epJson = await epRes.json();
                if (!epJson.error && epJson.data && epJson.data.posts) {
                    const epMatch = epJson.data.posts.find(e => parseInt(e.episode_number) === parseInt(episode));
                    if (epMatch) postId = epMatch._id;
                }
            } catch (err) {}
        }

        let playerUrl = `${BASE_URL}/wp-api/v1/player?postId=${postId}&demo=0`;
        const playerRes = await fetch(playerUrl, { headers: BASE_HEADERS });
        const playerJson = await playerRes.json();

        if (playerJson.error || !playerJson.data || !playerJson.data.embeds || playerJson.data.embeds.length === 0) {
            return [];
        }

        const embeds = playerJson.data.embeds;
        const streamPromises = embeds.map(async function (embed) {
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
                const proxyHtml = await fetchHtml(proxyUrl, BASE_URL);
                const iframeMatch = proxyHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
                if (!iframeMatch) return null;
                const embedUrl = iframeMatch[1];

                const finalUrl = await resolveEmbed(embedUrl, server);
                if (!finalUrl || !finalUrl.startsWith('http')) return null;

                const isVimeos = server.includes('vimeos');
                const mobileUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";

                return {
                    name: "Cuevana.gs",
                    title: `${server} (${lang}) ${quality}`,
                    url: finalUrl,
                    quality: quality,
                    headers: {
                        "User-Agent": mobileUA,
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
