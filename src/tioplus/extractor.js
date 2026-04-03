import cheerio from 'cheerio-without-node-native';
import { fetchHtml, fetchText, BASE_URL } from './http.js';
import { normalizeTitle, calculateSimilarity, isGoodMatch } from '../utils/string.js';

/**
 * Resolve TioPlus player redirect
 */
async function resolveTioPlusPlayer(playerId) {
    try {
        const playerUrl = `${BASE_URL}/player/${playerId}`;
        const body = await fetchHtml(playerUrl, BASE_URL);
        
        // Pattern found in research: window.location.href = 'https://vidhideplus.com/v/...'
        const redirectMatch = body.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (redirectMatch) {
            let finalUrl = redirectMatch[1].replace(/\\/g, '');
            console.log(`[TioPlus] Redirect found: ${finalUrl}`);
            
            if (finalUrl.includes('vidhide') || finalUrl.includes('vhaue') || finalUrl.includes('dintezuvio')) {
                return await resolveVidhide(finalUrl);
            } else if (finalUrl.includes('streamwish') || finalUrl.includes('awish') || finalUrl.includes('dwish')) {
                return await resolveStreamwish(finalUrl);
            }
            
            return finalUrl;
        }

        return null;
    } catch (e) {
        return null;
    }
}

async function resolveStreamwish(embedUrl) {
    try {
        let body = await fetchHtml(embedUrl, embedUrl);
        const m3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        return m3u8 ? m3u8[0] : embedUrl;
    } catch (e) { return embedUrl; }
}

async function resolveVidhide(embedUrl) {
    try {
        let body = await fetchHtml(embedUrl, embedUrl);
        const m3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        return m3u8 ? m3u8[0] : embedUrl;
    } catch (e) { return embedUrl; }
}

async function getTmdbInfo(tmdbId, mediaType) {
    try {
        const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
        const html = await fetchText(url);
        const $ = cheerio.load(html);
        return { 
            title: $('.title h2 a').text().trim() || '',
            year: $('.release_date').text().match(/\d{4}/)?.[0] || null
        };
    } catch (error) { return null; }
}

export async function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
    console.log(`[TioPlus] Extracting: ${providedTitle || tmdbId} (${mediaType}) S${season}E${episode}`);
    try {
        let searchTitle = providedTitle;
        if (!searchTitle) {
            const tmdbInfo = await getTmdbInfo(tmdbId, mediaType);
            if (tmdbInfo) searchTitle = tmdbInfo.title;
        }

        if (!searchTitle) return [];

        // 1. Search API
        const searchUrl = `${BASE_URL}/api/search/${encodeURIComponent(searchTitle)}`;
        const searchHtml = await fetchText(searchUrl);
        if (!searchHtml) return [];
        
        const $search = cheerio.load(searchHtml);
        
        const results = [];
        $search('article.item').each((i, el) => {
            const $el = $search(el);
            const title = $el.find('h2').text().trim();
            const href = $el.find('a.itemA').attr('href');
            // Normalize type text (site uses "Pelicúla")
            const typeText = $el.find('span.typeItem').text().toLowerCase();
            const type = typeText.includes('pelic') ? 'pelicula' : 'serie';
            results.push({ title, href, type });
        });

        // 2. Matching
        const targetType = mediaType === 'movie' ? 'pelicula' : 'serie';
        let match = results.find(r => calculateSimilarity(searchTitle, r.title) > 0.8 && r.type === targetType);
        
        if (!match) {
            match = results.find(r => isGoodMatch(searchTitle, r.title, 0.35) && r.type === targetType);
        }

        if (!match) {
            console.log(`[TioPlus] No match found for: ${searchTitle}`);
            return [];
        }

        // 3. Navigate to content page
        let contentUrl = match.href.startsWith('http') ? match.href : `${BASE_URL}${match.href}`;
        if (mediaType === 'tv') {
            if (!contentUrl.includes('/season/')) {
                contentUrl = contentUrl.replace(/\/$/, '') + `/season/${season}/episode/${episode}`;
            }
        }

        const pageHtml = await fetchText(contentUrl);
        const $page = cheerio.load(pageHtml);

        const serverItems = [];
        $page('li[role="presentation"]').each((i, el) => {
            const dataId = $page(el).attr('data-id');
            const name = $page(el).find('span').first().text().trim();
            if (dataId) {
                serverItems.push({ dataId, name });
            }
        });

        // 4. Resolve servers in Parallel
        const streamPromises = serverItems.map(async (item) => {
            if (item.name.toLowerCase().includes('goodstream')) return null;

            const resolvedUrl = await resolveTioPlusPlayer(item.dataId);
            if (!resolvedUrl) return null;

            return {
                name: "TioPlus",
                title: `${item.name} (${item.name.includes("-") ? item.name.split("-")[0].trim() : item.name}) - Latino`,
                url: resolvedUrl,
                quality: "HD",
                headers: {
                    "Referer": `${BASE_URL}/`,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                }
            };
        });

        const playerResults = await Promise.all(streamPromises);
        return playerResults.filter(s => s !== null);

    } catch (error) {
        console.error(`[TioPlus] Global Error: ${error.message}`);
        return [];
    }
}
