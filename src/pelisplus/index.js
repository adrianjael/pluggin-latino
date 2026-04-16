/**
 * PelisPlusHD Provider for Nuvio
 * Main entry point.
 *
 * IMPORTANTE: Nuvio llama getStreams con 4 parámetros separados:
 *   getStreams(tmdbId, mediaType, season, episode)
 * NO usar getStreams(req). Ver NUVIO_GUIDE.md sección [2026-04-09].
 */

const { extractStreams } = require('./extractor.js');
const { finalizeStreams } = require('../utils/engine.js');
const { getTmdbTitle } = require('../utils/tmdb.js');

// Metadatos centralizados vía tmdb.js

async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        console.log(`[PelisPlusHD] Request: ${mediaType} ${tmdbId} S${season}E${episode}`);

        // Título Rescate
        let mediaTitle = title;
        if (!mediaTitle && tmdbId) {
            mediaTitle = await getTmdbTitle(tmdbId, mediaType);
        }
        
        if (!mediaTitle) {
            console.log(`[PelisPlusHD] No TMDB title for ${tmdbId}`);
            return [];
        }
 
        console.log(`[PelisPlusHD] Target Title: "${mediaTitle}"`);
        const streams = await extractStreams(mediaTitle, tmdbId, mediaType, season, episode);

        if (streams.length === 0) {
            console.log(`[PelisPlusHD] No streams found for ${tmdbId}`);
            return [];
        }

        return await finalizeStreams(streams, 'PelisPlusHD', mediaTitle);
    } catch (error) {
        console.error(`[PelisPlusHD] Fatal Error: ${error.message}`);
        return [];
    }
}

module.exports = { getStreams };
