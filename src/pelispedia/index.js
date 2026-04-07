import { calculateSimilarity } from '../utils/string.js';
import { extractStreams } from './extractor.js';

const BASE = "https://pelispedia.mov";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchText(url) {
    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": UA,
                "Referer": BASE
            }
        });
        return await res.text();
    } catch (e) { return ""; }
}

async function searchMedia(query) {
    const url = `${BASE}/search?s=${encodeURIComponent(query)}`;
    const html = await fetchText(url);
    if (!html) return [];

    // Regex ultra-flexible para atributos href y title en cualquier orden
    const re = /<a[^>]+href="(https:\/\/pelispedia\.mov\/(pelicula|serie)\/([^"]+))"[^>]*title="([^"]+)"|<a[^>]+title="([^"]+)"[^>]+href="(https:\/\/pelispedia\.mov\/(pelicula|serie)\/([^"]+))"/gi;
    const results = [];
    let m;
    while ((m = re.exec(html)) !== null) {
        if (m[1]) { // Formato: href primero, luego title
            results.push({
                url: m[1],
                type: m[2],
                slug: m[3],
                title: m[4].replace(/&amp;/g, '&')
            });
        } else { // Formato: title primero, luego href
            results.push({
                url: m[6],
                type: m[7],
                slug: m[8],
                title: m[5].replace(/&amp;/g, '&')
            });
        }
    }

    // Fallback: Si no hay resultados con title, intentar solo con href y slug
    if (results.length === 0) {
        const simpleRe = /href="(https:\/\/pelispedia\.mov\/(pelicula|serie)\/([^"]+))"/gi;
        while ((m = simpleRe.exec(html)) !== null) {
            results.push({
                url: m[1],
                type: m[2],
                slug: m[3],
                title: m[3].replace(/-/g, ' ') // Título fallback basado en slug
            });
        }
    }
    return results;
}

async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        console.log(`[Pelispedia] Buscando: "${title}" (${mediaType})`);
        let matches = await searchMedia(title);

        if (matches.length === 0) {
            const firstWord = title.split(' ')[0];
            if (firstWord.length > 3) {
                 matches = await searchMedia(firstWord);
            }
        }

        if (matches.length === 0) return [];

        // Filtrar por similitud y tipo
        const bestMatch = matches.find(m => {
            const sim = calculateSimilarity(title, m.title);
            const typeMatch = (mediaType === 'movie' && m.type === 'pelicula') || 
                              ((mediaType === 'tv' || mediaType === 'series') && m.type === 'serie');
            
            if (sim > 0.4 && typeMatch) {
                m.similarity = sim;
                return true;
            }
            return false;
        });

        if (!bestMatch) {
            console.log("[Pelispedia] No se encontró coincidencia con similitud suficiente.");
            return [];
        }

        let targetUrl = bestMatch.url;
        if (mediaType === 'tv' || mediaType === 'series') {
            // Construir URL de episodio: /serie/{slug}/temporada/{n}/capitulo/{m}
            targetUrl = `${BASE}/serie/${bestMatch.slug}/temporada/${season}/capitulo/${episode}`;
        }

        console.log(`[Pelispedia] Solicitando streams de: ${targetUrl}`);
        const streams = await extractStreams(targetUrl);

        return streams;
    } catch (e) {
        console.error("[Pelispedia] Error:", e);
        return [];
    }
}

export { getStreams };
