/**
 * HackStore2 Provider for Nuvio
 * Main entry point.
 */

import { extractStreams } from './extractor.js';

/**
 * Main function called by Nuvio app
 * @param {string} tmdbId - TMDB ID of the media
 * @param {string} mediaType - 'movie' or 'tv'
 * @param {number} season - Season number (for TV)
 * @param {number} episode - Episode number (for TV)
 */
async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        console.log(`[HackStore2] Request: ${mediaType} ${tmdbId}`);

        // Lógica de extracción
        const streams = await extractStreams(tmdbId, mediaType, season, episode);

        if (streams.length === 0) {
            console.log(`[HackStore2] No matches or streams found for ${tmdbId}`);
        }

        return streams;
    } catch (error) {
        console.error(`[HackStore2] Fatal Error in index: ${error.message}`);
        return [];
    }
}
export { getStreams };
