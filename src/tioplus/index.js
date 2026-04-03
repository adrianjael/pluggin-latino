import { extractStreams } from './extractor.js';

export async function getStreams(tmdbId, mediaType, season, episode, title) {
    return await extractStreams(tmdbId, mediaType, season, episode, title);
}
