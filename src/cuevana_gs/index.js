import { extractStreams } from './extractor.js';

export async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        return await extractStreams(tmdbId, mediaType, season, episode, title);
    } catch (e) {
        console.error(`[Cuevana.gs] Index error: ${e.message}`);
        return [];
    }
}
