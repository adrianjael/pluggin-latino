import { fetchHtml } from './http.js';

/**
 * Desempaqueta código ofuscado con P.A.C.K.E.R (usado por reproductores)
 */
function unpackEval(payload, radix, symtab) {
    return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function(match) {
        let result = 0;
        const digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < match.length; i++) {
            let pos = digits.indexOf(match[i]);
            if (pos === -1 || pos >= radix) return match;
            result = result * radix + pos;
        }
        if (result >= symtab.length) return match;
        return symtab[result] && symtab[result] !== "" ? symtab[result] : match;
    });
}

// Extractors
async function resolveStreamwish(embedUrl) {
    try {
        let body = await fetchHtml(embedUrl, embedUrl);
        
        if (body.includes('Page is loading') || body.length < 2000) {
            const mirrorMatch = body.match(/main\s*:\s*\["([^"]+)"/i) || body.match(/["'](https?:\/\/[^"']+\/e\/[\w-]+)["']/i);
            if (mirrorMatch) {
                const mirrorUrl = mirrorMatch[1].startsWith('http') ? mirrorMatch[1] : `https://${mirrorMatch[1]}/e/${embedUrl.split('/').pop()}`;
                body = await fetchHtml(mirrorUrl, mirrorUrl);
            }
        }

        const packMatch = body.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packMatch) {
            const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
            const m3u8 = unpacked.match(/"?(?:file|hls(?:2|3)?)"?\s*[:=]\s*"?([^"'\s,]+\.m3u8[^"'\s]*)"?/i) || 
                         unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
            if (m3u8) return (m3u8[1] || m3u8[0]).replace(/\\/g, '');
        }
        
        const rawM3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        return rawM3u8 ? rawM3u8[0] : embedUrl;
    } catch (e) {
        return embedUrl;
    }
}

async function resolveVidhide(embedUrl) {
    try {
        let body = await fetchHtml(embedUrl, embedUrl);
        
        if (body.includes('Loading') || body.length < 2000) {
             const mirrorMatch = body.match(/["'](https?:\/\/[^"']+\/v\/[\w-]+)["']/i);
             if (mirrorMatch) body = await fetchHtml(mirrorMatch[1], mirrorMatch[1]);
        }

        const packMatch = body.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packMatch) {
            const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
            const m3u8 = unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
            if (m3u8) return m3u8[0].replace(/\\/g, '');
        }

        const rawM3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        return rawM3u8 ? rawM3u8[0] : embedUrl;
    } catch (e) {
        return embedUrl;
    }
}

import cheerio from 'cheerio-without-node-native';

// Helper to fetch Title from TMDB
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

export async function extractStreams(tmdbId, mediaType, season, episode) {
    console.log(`[HackStore2] Extracting streams for TMDB ID: ${tmdbId}`);
    try {
        // 1. Get exact Title & Year from TMDB
        const tmdbInfo = await getTmdbInfo(tmdbId, mediaType);
        
        if (!tmdbInfo || !tmdbInfo.title) {
            console.log("[HackStore2] TMDB Title not found.");
            return [];
        }

        const searchTitle = tmdbInfo.title;
        const searchYear = tmdbInfo.year;

        // 2. Search API
        console.log(`[HackStore2] Searching API for: ${searchTitle}`);
        const searchUrl = `https://hackstore2.com/api/rest/search?post_type=${mediaType === 'movie' ? 'movies' : 'series'}&query=${encodeURIComponent(searchTitle)}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData || searchData.error || !searchData.data || !searchData.data.posts || searchData.data.posts.length === 0) {
            console.log("[HackStore2] Not found in search results.");
            return [];
        }

        // 3. Match closest movie title/year
        // Here we just grab the first one, or filter by year
        let matchedPost = searchData.data.posts[0];
        if (searchYear) {
            const byYear = searchData.data.posts.find(p => p.years && p.years.toString().includes(searchYear));
            if (byYear) matchedPost = byYear;
        }

        console.log(`[HackStore2] Match found: ${matchedPost.title} (ID: ${matchedPost._id})`);

        // 4. If TV Show, we need episode ID... hackstore API for series might differ.
        // For now, let's establish movies first
        if (mediaType === 'tv') {
            console.log("[HackStore2] TV Shows extracting not yet supported securely, returning []");
            return [];
        }

        // 5. Get Players
        const playerUrl = `https://hackstore2.com/api/rest/player?post_id=${matchedPost._id}`;
        const playerRes = await fetch(playerUrl);
        const playerData = await playerRes.json();
        
        if (!playerData || playerData.error || !playerData.data) {
            console.log("[HackStore2] No players found.");
            return [];
        }

        const streams = [];

        // 6. Resolve links
        for (let player of playerData.data) {
            let serverName = "Desconocido";
            let rawUrl = player.url || "";
            let finalUrl = rawUrl;

            // Map server name
            if (rawUrl.includes('hlswish') || rawUrl.includes('streamwish')) serverName = 'streamwish';
            else if (rawUrl.includes('vidhide') || rawUrl.includes('filemoon')) serverName = rawUrl.includes('vidhide') ? 'vidhide' : 'filemoon';
            else if (rawUrl.includes('voe')) serverName = 'voe';
            else if (rawUrl.includes('vimeos')) serverName = 'vimeos';
            else if (rawUrl.includes('goodstream')) serverName = 'goodstream';
            else if (rawUrl.includes('netu') || rawUrl.includes('waaw')) serverName = 'netu';
            
            // Resolve
            if (serverName === 'streamwish') finalUrl = await resolveStreamwish(finalUrl);
            else if (serverName === 'vidhide') finalUrl = await resolveVidhide(finalUrl);
            
            // Filtro Cero Crashes
            if (!finalUrl.includes('.m3u8') && !finalUrl.includes('.mp4')) {
                console.log(`[HackStore2] Omitiendo servidor ${serverName} porque su URL final no expone el video directo: ${finalUrl}`);
                continue;
            }

            // Calidad
            const qualityStr = player.quality ? player.quality : "HD";
            const langStr = player.lang ? player.lang : "Latino";

            streams.push({
                server: serverName,
                title: `${serverName} (${langStr}) ${qualityStr}`,
                url: finalUrl
            });
        }

        return streams;
    } catch (error) {
        console.error(`[HackStore2] Error: ${error.message}`);
        return [];
    }
}
