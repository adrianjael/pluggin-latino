/**
 * PelisPlusHD Provider for Nuvio
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
async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        console.log(`[PelisPlusHD] Request: ${mediaType} ${tmdbId} (Title: ${title || 'N/A'})`);

        // Call our extraction logic
        const streams = await extractStreams(tmdbId, mediaType, season, episode, title);

        if (streams.length === 0) {
            console.log(`[PelisPlusHD] No matches found for ${tmdbId}`);
        }

        return streams;
    } catch (error) {
        console.error(`[PelisPlusHD] Fatal Error in index: ${error.message}`);
        return [];
    }
}

module.exports = { getStreams };
