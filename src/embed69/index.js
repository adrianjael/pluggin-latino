import { extractStreams } from './extractor.js';

async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        return await extractStreams(tmdbId, mediaType, season, episode, title);
    } catch (e) {
        console.error(`[Embed69] Index error: ${e.message}`);
        return [];
    }
}
module.exports = { getStreams };
