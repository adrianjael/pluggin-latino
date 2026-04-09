/**
 * Unified Result Engine for Nuvio Scrapers
 * Handles validation, sorting, and title formatting globally.
 */

import { validateStream } from './m3u8.js';
import { sortStreamsByQuality } from './sorting.js';

/**
 * Standardizes language labels
 */
function normalizeLanguage(lang) {
    const l = (lang || '').toLowerCase();
    if (l.includes('latino') || l.includes('lat')) return 'Latino';
    if (l.includes('español') || l.includes('castellano') || l.includes('esp')) return 'Español';
    if (l.includes('sub') || l.includes('vose')) return 'Subtitulado';
    return lang || 'Latino';
}

/**
 * Standardizes server labels
 */
function normalizeServer(server) {
    if (!server) return 'Servidor';
    const s = server.toLowerCase();
    if (s.includes('voe')) return 'VOE';
    if (s.includes('filemoon')) return 'Filemoon';
    if (s.includes('streamwish') || s.includes('awish') || s.includes('dwish')) return 'StreamWish';
    if (s.includes('vidhide') || s.includes('dintezuvio')) return 'VidHide';
    if (s.includes('waaw') || s.includes('netu')) return 'Netu';
    if (s.includes('fastream')) return 'Fastream';
    return server;
}

/**
 * Processes raw streams into verified, sorted, and formatted results for Nuvio.
 * Expected input: Each stream object should ideally have { url, quality, langLabel, serverLabel }
 * 
 * @param {Array} streams - Raw stream objects extracted by the scrapers
 * @param {String} providerName - Name of the provider (e.g., 'PelisPlusHD')
 * @returns {Promise<Array>} - Final streams ready for Nuvio
 */
export async function finalizeStreams(streams, providerName) {
    if (!Array.isArray(streams) || streams.length === 0) return [];

    console.log(`[Engine] Processing ${streams.length} streams for ${providerName}...`);

    // 1. Validar calidad real en paralelo (Fail-safe)
    let validated = streams;
    try {
        const results = await Promise.allSettled(
            streams.map(s => validateStream(s))
        );
        validated = results.map((r, i) => 
            r.status === 'fulfilled' ? r.value : streams[i]
        );
    } catch (e) {
        console.error(`[Engine] Validation error: ${e.message}`);
    }

    // 2. Ordenar por calidad
    const sorted = sortStreamsByQuality(validated);

    // 3. Formatear títulos finales
    return sorted.map(s => {
        const q = s.quality || 'HD';
        const lang = normalizeLanguage(s.langLabel || s.language);
        const server = normalizeServer(s.serverLabel || s.serverName || s.servername);
        const check = s.verified ? ' ✓' : '';

        return {
            name: providerName || s.name || 'Provider',
            title: `${q}${check} | ${lang} | ${server}`,
            url: s.url,
            quality: q,
            headers: s.headers || {}
        };
    });
}
