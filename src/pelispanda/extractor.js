import cheerio from 'cheerio-without-node-native';
import { fetchHtml } from '../pelisplus/http.js';
import { normalizeTitle, calculateSimilarity } from '../utils/string.js';

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

// Extractors Base (Compartidos)
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
        const jsonMatch = body.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
        if (jsonMatch) {
            try {
                let encText = JSON.parse(jsonMatch[1].trim())[0];
                let rot13 = encText.replace(/[a-zA-Z]/g, function(c) {
                    return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
                });
                const noise = ['@$', '^^', '~@', '%?', '*~', '!!', '#&'];
                for (const n of noise) rot13 = rot13.split(n).join('');
                
                let b64_1 = decodeBase64(rot13);
                let shifted = "";
                for(let i=0; i<b64_1.length; i++) shifted += String.fromCharCode(b64_1.charCodeAt(i) - 3);
                
                let reversed = shifted.split('').reverse().join('');
                let b64_2 = decodeBase64(reversed);
                
                let data = JSON.parse(b64_2);
                if (data && data.source) return data.source;
            } catch(ex) {
                console.log("[PelisPanda] Error rompiendo VoeSX:", ex.message);
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
    return null; // Server unstable in Nuvio
}

async function resolveGoodstream(embedUrl) {
    return null; // Server unstable in Nuvio
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

        if (!movieMatch) {
            // Fallback 3: Primer resultado
            movieMatch = searchData.results[0];
        }

        console.log(`[PelisPanda] Selección final: ${movieMatch.title} (Slug: ${movieMatch.slug})`);
        
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

        // 3. Resolve links IN PARALLEL (Speed optimization)
        const streamPromises = embeds.map(async (player) => {
            let serverName = "Desconocido";
            let rawUrl = player.url || "";
            let finalUrl = rawUrl.replace(/\\\//g, '/'); // limpiar slashes de json

            if (finalUrl.includes('hlswish') || finalUrl.includes('streamwish')) serverName = 'streamwish';
            else if (finalUrl.includes('vidhide') || finalUrl.includes('filemoon')) serverName = finalUrl.includes('vidhide') ? 'vidhide' : 'filemoon';
            else if (finalUrl.includes('voe')) serverName = 'voe';
            else if (finalUrl.includes('vimeos')) serverName = 'vimeos';
            else if (finalUrl.includes('goodstream')) serverName = 'goodstream';
            else if (finalUrl.includes('netu') || finalUrl.includes('waaw')) serverName = 'netu';
            
            // FILTRO DE SEGURIDAD (Cero Crashes): Omitimos vimeos y goodstream
            if (serverName === 'vimeos' || serverName === 'goodstream') return null;

            // Resolvemos protección
            if (serverName === 'streamwish') finalUrl = await resolveStreamwish(finalUrl);
            else if (serverName === 'vidhide') finalUrl = await resolveVidhide(finalUrl);
            else if (serverName === 'voe') finalUrl = await resolveVoesx(finalUrl);
            
            if (!finalUrl || (!finalUrl.includes('.m3u8') && !finalUrl.includes('.mp4'))) {
                return null;
            }

            const qualityStr = player.quality ? player.quality : "HD";
            const langStr = player.lang ? player.lang : "Latino";
            const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

            return {
                name: "PelisPanda",
                server: serverName,
                title: `${serverName} (${langStr}) ${qualityStr}`,
                url: finalUrl,
                quality: qualityStr,
                headers: {
                    "User-Agent": ua,
                    "Referer": rawUrl
                }
            };
        });

        const playerResults = await Promise.all(streamPromises);
        return playerResults.filter(s => s !== null);
    } catch (error) {
        console.error(`[PelisPanda] Error crítico: ${error.message}`);
        return [];
    }
}
