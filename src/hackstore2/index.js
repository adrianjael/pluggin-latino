/**
 * HackStore2 Provider for Nuvio
 * Main entry point.
 */
const { extractStreams } = require('./extractor.js');
const { finalizeStreams } = require('../utils/engine.js');
const { getTmdbTitle } = require('../utils/tmdb.js');

/**
 * Main function called by Nuvio app
 */
async function getStreams(tmdbId, mediaType, season, episode, title, year) {
    try {
        // Título Rescate
        let mediaTitle = title;
        if (!mediaTitle && tmdbId) {
            mediaTitle = await getTmdbTitle(tmdbId, mediaType);
        }

        console.log(`[HackStore2] Request: ${mediaType} ${tmdbId} (Title: ${mediaTitle || 'N/A'})`);

        // Lógica de extracción
        const streams = await extractStreams(tmdbId, mediaType, season, episode, mediaTitle, year);

        return await finalizeStreams(streams, 'HackStore2', mediaTitle);
    } catch (error) {
        console.error(`[HackStore2] Fatal Error in index: ${error.message}`);
        return [];
    }
}

module.exports = { getStreams };
