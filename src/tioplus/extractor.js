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
        
        // Pattern 1: window.location.href = '...'
        let redirectMatch = body.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (!redirectMatch) {
            // Pattern 2: meta refresh or similar
            redirectMatch = body.match(/url=(https?:\/\/[^"'>]+)/i);
        }

        if (redirectMatch) {
            let finalUrl = redirectMatch[1].replace(/\\/g, '');
            console.log(`[TioPlus] Player Redirect: ${finalUrl}`);
            
            // Handle specific known providers
            if (finalUrl.includes('turbovid') || finalUrl.includes('cdn') || finalUrl.includes('.m3u8')) {
                return await resolveDirectOrM3u8(finalUrl);
            }
            
            // Standard resolvers
            if (finalUrl.includes('vidhide') || finalUrl.includes('vhaue') || finalUrl.includes('dintezuvio')) {
                return await resolveVidhide(finalUrl);
            } else if (finalUrl.includes('streamwish') || finalUrl.includes('awish') || finalUrl.includes('dwish')) {
                return await resolveStreamwish(finalUrl);
            }
            
            return finalUrl;
        }

        // Pattern 3: iframe src in player page
        const iframeMatch = body.match(/<iframe.*?src=["'](https?:\/\/[^"']+)["']/i);
        if (iframeMatch) return iframeMatch[1];

        return null;
    } catch (e) {
        return null;
    }
}

async function resolveDirectOrM3u8(url) {
    try {
        if (url.includes('.m3u8') || url.includes('.mp4')) return url;
        const body = await fetchText(url);
        const m3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        return m3u8 ? m3u8[0] : url;
    } catch (e) { return url; }
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
            const typeText = $el.find('span.typeItem').text().toLowerCase();
            const type = typeText.includes('pelic') ? 'pelicula' : 'serie';
            results.push({ title, href, type });
        });

        // 2. Matching
        const targetType = mediaType === 'movie' ? 'pelicula' : 'serie';
        let match = results.find(r => calculateSimilarity(searchTitle, r.title) > 0.8 && r.type === targetType);
        if (!match) match = results.find(r => isGoodMatch(searchTitle, r.title, 0.35) && r.type === targetType);
        if (!match) return [];

        // 3. Navigate to content page
        let contentUrl = match.href.startsWith('http') ? match.href : `${BASE_URL}${match.href}`;
        if (mediaType === 'tv') {
            if (!contentUrl.includes('/season/')) {
                contentUrl = contentUrl.replace(/\/$/, '') + `/season/${season}/episode/${episode}`;
            }
        }

        const pageHtml = await fetchText(contentUrl);
        
        // AGGRESSIVE EXTRACTION: Search for data-id in the entire HTML string
        // This bypasses issues where cheerio might miss dynamic/hidden elements
        const serverItems = [];
        const dataIdRegex = /data-id=["']([^"']+)["']/g;
        let idMatch;
        const processedIds = new Set();
        
        while ((idMatch = dataIdRegex.exec(pageHtml)) !== null) {
            const dataId = idMatch[1];
            if (dataId.length > 20 && !processedIds.has(dataId)) { // Valid hashes are long
                processedIds.add(dataId);
                serverItems.push({ dataId, name: "Server" });
            }
        }

        // Fallback to __NEXT_DATA__ extraction
        if (serverItems.length === 0) {
            const nextDataMatch = pageHtml.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
            if (nextDataMatch) {
                try {
                    const nextData = JSON.parse(nextDataMatch[1]);
                    const players = nextData.props.pageProps.data.players;
                    if (players && Array.isArray(players)) {
                        players.forEach(p => {
                            if (p.id) serverItems.push({ dataId: p.id, name: p.name || 'Server' });
                        });
                    }
                } catch (e) {}
            }
        }

        console.log(`[TioPlus] Found ${serverItems.length} potential servers.`);

        // 4. Resolve servers in Parallel
        const streamPromises = serverItems.map(async (item) => {
            const resolvedUrl = await resolveTioPlusPlayer(item.dataId);
            if (!resolvedUrl) return null;

            return {
                name: "TioPlus",
                title: `${item.name} - Latino HD`,
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
        return [];
    }
}
