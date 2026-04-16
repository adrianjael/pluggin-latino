const { extractStreams } = require('./extractor.js');
const { finalizeStreams } = require('../utils/engine.js');
const { getTmdbTitle } = require('../utils/tmdb.js');

async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        // Título Rescate
        let mediaTitle = title;
        if (!mediaTitle && tmdbId) {
            mediaTitle = await getTmdbTitle(tmdbId, mediaType);
        }

        const streams = await extractStreams(tmdbId, mediaType, season, episode, mediaTitle);
        return await finalizeStreams(streams, 'Cuevana.gs', mediaTitle);
    } catch (e) {
        console.error(`[Cuevana.gs] Index error: ${e.message}`);
        return [];
    }
}
module.exports = { getStreams };
