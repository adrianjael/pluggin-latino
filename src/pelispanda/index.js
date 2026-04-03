import { extractStreams } from './extractor.js';

export async function getStreams(tmdbId, mediaType, season, episode) {
    return extractStreams(tmdbId, mediaType, season, episode);
}
