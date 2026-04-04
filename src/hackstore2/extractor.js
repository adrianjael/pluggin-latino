import { fetchHtml } from './http.js';
import { normalizeTitle, calculateSimilarity } from '../utils/string.js';

/**
 * Desempaqueta código ofuscado con P.A.C.K.E.R (usado por reproductores)
 */
function unpackEval(payload, radix, symtab) {
    return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function (match) {
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

// Base64 Decode seguro (para entornos sin atob como Hermes puro)
function decodeBase64(input) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = String(input).replace(/=+$/, '');
    let output = '';
    for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
    }
    return output;
}

async function resolveVoesx(embedUrl) {
    try {
        let body = await fetchHtml(embedUrl, embedUrl);

        if (body.includes('Redirecting') || body.length < 1000) {
            const redirectMatch = body.match(/window\.location\.href\s*=\s*['"](https?:\/\/[^'"]+)['"]/i);
            if (redirectMatch) body = await fetchHtml(redirectMatch[1], redirectMatch[1]);
        }

        // Nuevo extractor VoeSX (Rompe Ofuscación)
        const jsonMatch = body.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
        if (jsonMatch) {
            try {
                let encText = JSON.parse(jsonMatch[1].trim())[0];
                let rot13 = encText.replace(/[a-zA-Z]/g, function (c) {
                    return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
                });
                const noise = ['@$', '^^', '~@', '%?', '*~', '!!', '#&'];
                for (const n of noise) rot13 = rot13.split(n).join('');

                let b64_1 = decodeBase64(rot13);
                let shifted = "";
                for (let i = 0; i < b64_1.length; i++) shifted += String.fromCharCode(b64_1.charCodeAt(i) - 3);

                let reversed = shifted.split('').reverse().join('');
                let b64_2 = decodeBase64(reversed);

                // Limpiar posibles caracteres de escape JSON
                let data = JSON.parse(b64_2);
                if (data && data.source) return data.source;
            } catch (ex) {
                console.log("[HackStore2] Error rompiendo VoeSX:", ex.message);
            }
        }

        const m3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (m3u8) return m3u8[0].replace(/\\/g, '');

        return embedUrl;
    } catch (e) {
        return embedUrl;
    }
}

async function resolveVimeos(embedUrl) {
    try {
        console.log(`[HackStore2] Resolving Vimeos: ${embedUrl}`);
        const body = await fetchHtml(embedUrl, "https://hackstore2.com/");
        return extractM3u8FromHtml(body);
    } catch (e) {
        console.error(`[HackStore2] Error resolving vimeos: ${e.message}`);
        return null;
    }
}

async function resolveGoodstream(embedUrl) {
    try {
        console.log(`[HackStore2] Resolving Goodstream (User Fix): ${embedUrl}`);
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": embedUrl,
            "Origin": new URL(embedUrl).origin,
            "Accept": "*/*",
            "Accept-Language": "es-ES,es;q=0.9"
        };
        const res = await fetch(embedUrl, { headers });
        const html = await res.text();
        return extractM3u8FromHtml(html);
    } catch (e) {
        console.error(`[HackStore2] Error resolving goodstream: ${e.message}`);
        return null;
    }
}

async function resolveFilemoon(embedUrl) {
    try {
        let body = await fetchHtml(embedUrl, embedUrl);
        const packMatch = body.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packMatch) {
            const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
            const m3u8 = unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i) || unpacked.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
            if (m3u8) return (m3u8[1] || m3u8[0]).replace(/\\/g, '');
        }
        const rawM3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        return rawM3u8 ? rawM3u8[0] : embedUrl;
    } catch (e) {
        return embedUrl;
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

        // 2. Search API
        console.log(`[HackStore2] Searching API for: ${searchTitle}`);
        const postType = mediaType === 'movie' ? 'movies' : 'tvshows';
        const searchUrl = `https://hackstore2.com/api/rest/search?post_type=${postType}&query=${encodeURIComponent(searchTitle)}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData || searchData.error || !searchData.data || !searchData.data.posts || searchData.data.posts.length === 0) {
            console.log("[HackStore2] Not found in search results.");
            return [];
        }

        // 3. Match closest movie/series title/year
        let matchedPost = searchData.data.posts.find(p => calculateSimilarity(searchTitle, p.title) > 0.9);

        if (!matchedPost) {
            // Intento 2: Similitud aceptable (Fuzzy)
            matchedPost = searchData.data.posts.find(p => isGoodMatch(searchTitle, p.title));
        }

        if (!matchedPost && searchYear) {
            matchedPost = searchData.data.posts.find(p => p.years && p.years.toString().includes(searchYear));
        }

        if (!matchedPost) {
            matchedPost = searchData.data.posts[0];
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
            let serverName = "Desconocido";
            let rawUrl = player.url || "";
            let finalUrl = rawUrl;

            // Map server name
            if (rawUrl.includes('hlswish') || rawUrl.includes('streamwish')) serverName = 'streamwish';
            else if (rawUrl.includes('vidhide') || rawUrl.includes('filemoon')) serverName = rawUrl.includes('vidhide') ? 'vidhide' : 'filemoon';
            else if (rawUrl.includes('voe')) serverName = 'voe';
            else if (rawUrl.includes('vimeos')) serverName = 'vimeos';
            else if (rawUrl.includes('netu') || rawUrl.includes('waaw')) serverName = 'netu';
            
            // Resolve
            if (serverName === 'streamwish') finalUrl = await resolveStreamwish(finalUrl);
            else if (serverName === 'vidhide') finalUrl = await resolveVidhide(finalUrl);
            else if (serverName === 'voe') finalUrl = await resolveVoesx(finalUrl);
            else if (serverName === 'vimeos') finalUrl = await resolveVimeos(finalUrl);
            else if (serverName === 'goodstream') finalUrl = await resolveGoodstream(finalUrl);
            else if (serverName === 'filemoon') finalUrl = await resolveFilemoon(finalUrl);
            
            if (!finalUrl || !finalUrl.startsWith('http')) {
                return null;
            }

            const isVimeos = serverName.includes('vimeos');
            const isGoodstream = serverName.includes('goodstream');
            
            // Fix Híbrido: Vimeos (Pixel 8) / Goodstream (Windows 10)
            const mobileUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
            const windowsUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

            return {
                server: serverName,
                title: `${serverName} (${player.lang || "Latino"}) ${player.quality || "HD"}`,
                url: finalUrl,
                headers: {
                    "User-Agent": isGoodstream ? windowsUA : mobileUA,
                    "Referer": isVimeos ? "https://vimeos.net/" : rawUrl,
                    "Origin": isVimeos ? "https://vimeos.net" : (isGoodstream ? "https://goodstream.one" : undefined),
                    "Accept": isGoodstream ? "*/*" : undefined,
                    "Accept-Language": isGoodstream ? "es-ES,es;q=0.9" : undefined,
                    "Sec-Fetch-Dest": isGoodstream ? "empty" : undefined,
                    "Sec-Fetch-Mode": isGoodstream ? "cors" : undefined,
                    "Sec-Fetch-Site": isGoodstream ? "cross-site" : undefined
                }
            };
        });

        const playerResults = await Promise.all(streamPromises);
        return playerResults.filter(s => s !== null);
    } catch (error) {
        console.error(`[HackStore2] Error: ${error.message}`);
        return [];
    }
}
