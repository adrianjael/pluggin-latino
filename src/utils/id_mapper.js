const { fetchJson, fetchHtml } = require('../utils/http.js');

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const ID_CACHE = new Map();

const SERIES_MAPPINGS = {
    // Ejemplo: 'tmdb_id': 'imdb_id'
};

/**
 * Obtiene el IMDb ID y metadatos usando la API de TMDB (Rápido)
 */
async function getImdbIdFromApi(tmdbId, mediaType) {
    try {
        const type = mediaType === 'movie' || mediaType === 'movies' ? 'movie' : 'tv';
        const apiKey = TMDB_API_KEY;
        const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

        const idUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${apiKey}`;
        const metaUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${apiKey}&language=es-MX`;

        // v7.8.8: Reversión a modo secuencial para máxima compatibilidad
        const idRes = await fetchJson(idUrl, { headers: { 'User-Agent': ua } }).catch(() => null);
        if (!idRes || !idRes.imdb_id) return null;

        const metaRes = await fetchJson(metaUrl, { headers: { 'User-Agent': ua } }).catch(() => null);

        const title = metaRes ? (metaRes.title || metaRes.name) : 'Contenido';
        const year = metaRes ? (metaRes.release_date || metaRes.first_air_date || "").split('-')[0] : null;

        return {
            imdbId: idRes.imdb_id,
            title: title,
            year: year,
            offset: 0,
            fromMapping: false
        };
    } catch (e) {
        console.log(`[IDMapper] API error: ${e.message}`);
        return null;
    }
}

/**
 * Fallback: Scraping HTML de TMDB (Lento)
 */
async function scrapeTmdbId(tmdbId, mediaType) {
    // Implementación simplificada para el fallback
    try {
        const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
        const html = await fetchHtml(url, { timeout: 10000 }).catch(() => null);
        if (!html) return { imdbId: null, title: 'Contenido' };
        const imdbMatch = html.match(/href="https:\/\/www\.imdb\.com\/title\/(tt\d+)"/i);
        const titleMatch = html.match(/<title>(.*?) &#8212;/i);

        return {
            imdbId: imdbMatch ? imdbMatch[1] : null,
            title: titleMatch ? titleMatch[1].trim() : 'Contenido',
            year: null,
            offset: 0,
            fromMapping: false
        };
    } catch (e) {
        return { imdbId: null, title: 'Contenido' };
    }
}

/**
 * Función principal: Prioriza API sobre Scraping
 */
async function getCorrectImdbId(tmdbId, mediaType) {
    if (!tmdbId) return { imdbId: null, title: '' };

    const cacheKey = `${mediaType}_${tmdbId}`;
    if (ID_CACHE.has(cacheKey)) return ID_CACHE.get(cacheKey);

    // v7.2.8: Si el ID ya es un IMDb ID (tt...), retornarlo directamente
    if (tmdbId.startsWith('tt')) {
        const res = { imdbId: tmdbId, title: 'Contenido', offset: 0, fromMapping: false };
        ID_CACHE.set(cacheKey, res);
        return res;
    }

    // v7.2.7: PRIORIDAD TOTAL API TMDB
    const apiResult = await getImdbIdFromApi(tmdbId, mediaType);
    if (apiResult && apiResult.imdbId) {
        ID_CACHE.set(cacheKey, apiResult);
        return apiResult;
    }

    // Fallback: Scraping
    const scrapeResult = await scrapeTmdbId(tmdbId, mediaType);
    ID_CACHE.set(cacheKey, scrapeResult);
    return scrapeResult;
}

module.exports = { getCorrectImdbId, SERIES_MAPPINGS };
