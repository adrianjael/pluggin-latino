const { extractStreams } = require('./extractor.js');
const { finalizeStreams } = require('../utils/engine.js');

async function getStreams(tmdbId, mediaType, season, episode, title, year) {
    const streams = await extractStreams(tmdbId, mediaType, season, episode, title, year);
    return await finalizeStreams(streams, 'PelisPanda', title);
}
module.exports = { getStreams };
