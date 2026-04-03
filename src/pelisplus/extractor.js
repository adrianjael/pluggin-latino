/**
 * Extractor Logic for PelisPlusHD
 */
import { fetchText, fetchHtml, BASE_URL } from './http.js';
import cheerio from 'cheerio-without-node-native';

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

/**
 * Resuelve y extrae el .m3u8 de Streamwish
 */
async function resolveStreamwish(embedUrl) {
    try {
        const body = await fetchHtml(embedUrl);
        const packMatch = body.match(/eval\(function\(p,a,c,k,e,[^)]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        
        if (packMatch) {
            const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
            // Buscar hls2, hls3 o cualquier link .m3u8 dentro del código desempaquetado
            const m3u8 = unpacked.match(/"?hls[234]"?\s*[:=]\s*"?([^"'\s,]+\.m3u8[^"'\s]*)"?/i) || 
                         unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
            if (m3u8) return m3u8[1] || m3u8[0];
        }
        
        const rawM3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        return rawM3u8 ? rawM3u8[0] : embedUrl;
    } catch (e) {
        return embedUrl;
    }
}

/**
 * Resuelve y extrae el .m3u8 de Vidhide
 */
async function resolveVidhide(embedUrl) {
    try {
        const body = await fetchHtml(embedUrl);
        const packMatch = body.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        
        if (packMatch) {
            const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
            const m3u8 = unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
            if (m3u8) return m3u8[0];
        }
        return embedUrl;
    } catch (e) {
        return embedUrl;
    }
}

/**
 * Gets the movie/TV title from TMDB by scraping
 */
async function getTmdbTitle(tmdbId, mediaType) {
    try {
        const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
        const html = await fetchText(url);
        const $ = cheerio.load(html);
        const title = $('.title h2 a').text().trim();
        return title;
    } catch (error) {
        return null;
    }
}

/**
 * Main extraction function
 */
export async function extractStreams(tmdbId, mediaType, season, episode) {
    try {
        const title = await getTmdbTitle(tmdbId, mediaType);
        if (!title) return [];

        const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(title)}`;
        const searchHtml = await fetchText(searchUrl);
        const $search = cheerio.load(searchHtml);
        
        let movieUrl = null;
        $search('a.Posters-link').each((i, el) => {
            const resultTitle = $search(el).attr('data-title') || "";
            if (resultTitle.toLowerCase().includes(title.toLowerCase())) {
                movieUrl = BASE_URL + $search(el).attr('href');
                return false;
            }
        });

        if (!movieUrl) return [];

        if (mediaType === 'tv') {
            movieUrl = movieUrl.replace('/serie/', '/episodio/') + `-${season}x${episode}`;
        }

        const pageHtml = await fetchText(movieUrl);
        const $page = cheerio.load(pageHtml);
        
        const rawResults = [];
        $page('li.playurl').each((i, el) => {
            const serverUrl = $page(el).attr('data-url');
            const serverName = $page(el).find('a').text().trim();
            const language = $page(el).attr('data-name'); 

            if (serverUrl && language === "Español Latino") {
                rawResults.push({ serverUrl, serverName, language });
            }
        });

        // Resolve each stream to get the actual video file
        const streams = await Promise.all(rawResults.map(async (res) => {
            let finalUrl = res.serverUrl;
            
            if (finalUrl.includes('streamwish') || finalUrl.includes('strwish') || finalUrl.includes('wishembed')) {
                finalUrl = await resolveStreamwish(finalUrl);
            } else if (finalUrl.includes('vidhide') || finalUrl.includes('dintezuvio')) {
                finalUrl = await resolveVidhide(finalUrl);
            }

            return {
                name: "PelisPlusHD",
                title: `${res.serverName} (Latino)`,
                url: finalUrl,
                quality: "HD",
                headers: {
                    "Referer": res.serverUrl,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36"
                }
            };
        }));

        return streams;
    } catch (error) {
        console.error(`[PelisPlusHD] Extraction error: ${error.message}`);
        return [];
    }
}
