import { fetchHtml, fetchJson } from '../utils/http.js';
import cheerio from 'cheerio-without-node-native';
import { normalizeTitle, calculateSimilarity, isGoodMatch } from '../utils/string.js';

const BASE_URL = "https://www.pelisplushd.la";

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

async function resolveStreamwish(embedUrl) {
    try {
        let body = await fetchHtml(embedUrl, { headers: { Referer: embedUrl } });
        
        if (body.includes('Page is loading') || body.length < 2000) {
            const mirrorMatch = body.match(/main\s*:\s*\["([^"]+)"/i) || body.match(/["'](https?:\/\/[^"']+\/e\/[\w-]+)["']/i);
            if (mirrorMatch) {
                const mirrorUrl = mirrorMatch[1].startsWith('http') ? mirrorMatch[1] : `https://${mirrorMatch[1]}/e/${embedUrl.split('/').pop()}`;
                body = await fetchHtml(mirrorUrl, { headers: { Referer: mirrorUrl } });
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
        let body = await fetchHtml(embedUrl, { headers: { Referer: embedUrl } });
        
        if (body.includes('Loading') || body.length < 2000) {
             const mirrorMatch = body.match(/["'](https?:\/\/[^"']+\/v\/[\w-]+)["']/i);
             if (mirrorMatch) body = await fetchHtml(mirrorMatch[1], { headers: { Referer: mirrorMatch[1] } });
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

async function getTmdbInfo(tmdbId, mediaType) {
    try {
        const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
        const html = await fetchHtml(url);
        const $ = cheerio.load(html);
        
        const title = $('.title h2 a').text().trim();
        const originalTitle = $('.original_title').text().replace('Título original:', '').trim();
        
        return { 
            title: title || '', 
            originalTitle: originalTitle || title || '' 
        };
    } catch (error) {
        console.warn(`[PelisPlusHD] TMDB error: ${error.message}`);
        return null;
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
        let body = await fetchHtml(embedUrl, { headers: { Referer: embedUrl } });
        
        if (body.includes('Redirecting') || body.length < 1000) {
            const redirectMatch = body.match(/window\.location\.href\s*=\s*['"](https?:\/\/[^'"]+)['"]/i);
            if (redirectMatch) body = await fetchHtml(redirectMatch[1], { headers: { Referer: redirectMatch[1] } });
        }

        const jsonMatch = body.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
        if (jsonMatch) {
            try {
                let encText = JSON.parse(jsonMatch[1].trim())[0];
                let rot13 = encText.replace(/[a-zA-Z]/g, (c) => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
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
                console.log("[PelisPlusHD] Error decrypting VoeSX:", ex.message);
            }
        }

        const m3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        return m3u8 ? m3u8[0].replace(/\\/g, '') : embedUrl;
    } catch (e) {
        return embedUrl;
    }
}

export async function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
    try {
        console.log(`[PelisPlusHD] Scrapping: ${providedTitle || tmdbId} (${mediaType}) S${season || ''}E${episode || ''}`);
        const tmdbInfo = await getTmdbInfo(tmdbId, mediaType);
        const titlesToTry = [];
        
        if (providedTitle) titlesToTry.push(providedTitle);
        if (tmdbInfo) {
            if (tmdbInfo.title) titlesToTry.push(tmdbInfo.title);
            if (tmdbInfo.originalTitle && tmdbInfo.originalTitle !== tmdbInfo.title) titlesToTry.push(tmdbInfo.originalTitle);
        }

        const uniqueTitles = [...new Set(titlesToTry)].filter(t => t && t.length > 2);
        
        if (uniqueTitles.length === 0) return [];

        let movieUrl = null;
        for (const query of uniqueTitles) {
            const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(query)}`;
            const searchHtml = await fetchHtml(searchUrl);
            const $search = cheerio.load(searchHtml);
            
            const results = [];
            $search('a.Posters-link').each((i, el) => {
                const el$ = $search(el);
                const title = el$.find('p').text().trim() || el$.attr('data-title') || "";
                const href = el$.attr('href') || "";
                results.push({ title, href });
            });

            if (results.length === 0) continue;

            const targetType = mediaType === 'tv' ? '/serie/' : '/pelicula/';
            
            let match = results.find(r => 
                (normalizeTitle(r.title) === normalizeTitle(query) || r.title.toLowerCase().includes(query.toLowerCase())) && 
                r.href.includes(targetType)
            );

            if (!match) {
                match = results.find(r => isGoodMatch(query, r.title, 0.45) && r.href.includes(targetType));
            }

            if (match) {
                console.log(`[PelisPlusHD] Match found: "${match.title}"`);
                movieUrl = BASE_URL + match.href;
                break;
            }
        }

        if (!movieUrl) return [];

        if (mediaType === 'tv') {
            movieUrl = movieUrl.replace(/\/$/, '') + `/temporada/${season}/capitulo/${episode}`;
        }

        const pageHtml = await fetchHtml(movieUrl, { headers: { Referer: BASE_URL } });
        const $page = cheerio.load(pageHtml);

        const pageTitle = $page('title').text() || "";
        const qualityMatch = pageTitle.match(/Online\s+[^-\s]+\s+([^-\s]+)\s+-/i) || pageTitle.match(/\s+([A-Z0-9]+)\s+-/i);
        let movieQuality = qualityMatch ? qualityMatch[1].trim() : "HD";
        
        const rawResults = [];
        $page('li.playurl').each((i, el) => {
            const $el = $page(el);
            const serverUrl = $el.attr('data-url');
            const language = $el.attr('data-name') || "Latino";
            const serverNameRaw = $el.find('a').text().trim() || "Servidor";

            if (serverUrl && serverUrl.startsWith('http')) {
                let name = serverNameRaw;
                if (serverUrl.includes('voe')) name = "Voe";
                else if (serverUrl.includes('streamwish') || serverUrl.includes('awish') || serverUrl.includes('dwish')) name = "Streamwish";
                else if (serverUrl.includes('vidhide')) name = "Vidhide";
                else if (serverUrl.includes('waaw') || serverUrl.includes('netu')) name = "Netu";
                
                rawResults.push({ serverUrl, serverName: name, language });
            }
        });

        const streams = await Promise.all(rawResults.map(async (res) => {
            let finalUrl = res.serverUrl;
            
            const isStreamwish = /streamwish|strwish|wishembed|playnixes|niramirus|awish|dwish|fmoon|pstream/i.test(finalUrl);
            const isVidhide = /vidhide|dintezuvio|callistanise|acek-cdn|vadisov/i.test(finalUrl);
            const isVoesx = /voe\.sx|voe-sx|jefferycontrolmodel/i.test(finalUrl);
            
            if (isStreamwish) finalUrl = await resolveStreamwish(finalUrl);
            else if (isVidhide) finalUrl = await resolveVidhide(finalUrl);
            else if (isVoesx) finalUrl = await resolveVoesx(finalUrl);

            if (!finalUrl.startsWith('http')) return null;

            return {
                name: "PelisPlusHD",
                title: `${res.serverName} (${res.language}) ${movieQuality}`,
                url: finalUrl,
                quality: movieQuality,
                headers: {
                    "Referer": res.serverUrl,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                }
            };
        }));

        return streams.filter(s => s !== null);
    } catch (error) {
        console.error(`[PelisPlusHD] Error: ${error.message}`);
        return [];
    }
}
