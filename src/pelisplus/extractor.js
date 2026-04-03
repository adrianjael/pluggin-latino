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
 * Normaliza un título para comparaciones (quita acentos, caracteres especiales y espacios extra)
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
function titleMatch(queryTitle, resultTitle) {
    const q = normalizeTitle(queryTitle);
    const r = normalizeTitle(resultTitle);
    if (!q || !r) return false;
    if (r === q || r.includes(q) || q.includes(r)) return true;
    
    // Si no coincide directo, comparar palabras clave (evitando artículos cortos)
    const qWords = q.split(' ').filter(w => w.length > 2);
    const rWords = r.split(' ');
    if (qWords.length === 0) return false;
    return qWords.every(w => rWords.includes(w));
}

async function resolveStreamwish(embedUrl) {
    try {
        let body = await fetchHtml(embedUrl, embedUrl);
        
        // Si detectamos la pantalla de carga, intentamos buscar espejos
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
        
        // VidHide también puede tener pantallas de carga o redirecciones
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

/**
 * Gets movie titles from TMDB (Spanish and Original)
 */
async function getTmdbInfo(tmdbId, mediaType) {
    try {
        const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
        const html = await fetchText(url);
        const $ = cheerio.load(html);
        
        const title = $('.title h2 a').text().trim();
        const originalTitle = $('.original_title').text().replace('Título original:', '').trim();
        
        return { 
            title: title || '', 
            originalTitle: originalTitle || title || '' 
        };
    } catch (error) {
        return null;
    }
}

/**
 * Main extraction function
 */
export async function extractStreams(tmdbId, mediaType, season, episode) {
    try {
        const tmdb = await getTmdbInfo(tmdbId, mediaType);
        if (!tmdb || !tmdb.title) return [];

        const titlesToTry = [tmdb.title];
        if (tmdb.originalTitle && tmdb.originalTitle !== tmdb.title) {
            titlesToTry.push(tmdb.originalTitle);
        }

        let movieUrl = null;
        for (const query of titlesToTry) {
            const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(query)}`;
            const searchHtml = await fetchText(searchUrl);
            const $search = cheerio.load(searchHtml);
            
            $search('a.Posters-link').each((i, el) => {
                const resultTitle = $search(el).find('p').text().trim() || $search(el).attr('data-title') || "";
                if (titleMatch(query, resultTitle) || titleMatch(tmdb.title, resultTitle)) {
                    movieUrl = BASE_URL + $search(el).attr('href');
                    return false;
                }
            });
            if (movieUrl) break;
        }

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
            const language = $page(el).attr('data-name') || "Español Latino"; 
            if (serverUrl && (language.includes("Latino") || language.includes("Español"))) {
                rawResults.push({ serverUrl, serverName, language });
            }
        });

        const scripts = $page('script').map((i, el) => $page(el).html()).get();
        for (const scriptContent of scripts) {
            if (scriptContent && scriptContent.includes('var options')) {
                const optionsMatch = scriptContent.match(/var options = {([\s\S]+?)};/);
                if (optionsMatch) {
                    const optionsRaw = optionsMatch[1];
                    const urlRegex = /"(option\d+)":\s*"([^"]+)"/g;
                    let match;
                    while ((match = urlRegex.exec(optionsRaw)) !== null) {
                        const optId = match[1];
                        const serverUrl = match[2];
                        const serverName = $page(`a[href="#${optId}"]`).text().trim() || "Servidor";
                        if (serverUrl && serverUrl.startsWith('http')) {
                             rawResults.push({ serverUrl, serverName, language: "Español Latino" });
                        }
                    }
                }
            }
        }

        const streams = await Promise.all(rawResults.map(async (res) => {
            let finalUrl = res.serverUrl;
            
            const isStreamwish = /streamwish|strwish|wishembed|playnixes|niramirus|awish|dwish|fmoon|pstream/i.test(finalUrl);
            const isVidhide = /vidhide|dintezuvio|callistanise|acek-cdn|vadisov/i.test(finalUrl);
            
            if (isStreamwish) finalUrl = await resolveStreamwish(finalUrl);
            else if (isVidhide) finalUrl = await resolveVidhide(finalUrl);

            return {
                name: "PelisPlusHD",
                title: `${res.serverName} (Latino)`,
                url: finalUrl,
                quality: "HD",
                headers: {
                    "Referer": res.serverUrl,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                }
            };
        }));

        return streams;
    } catch (error) {
        return [];
    }
}
