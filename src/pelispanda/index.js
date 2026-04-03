import { extractStreams } from './extractor.js';

export async function getStreams(tmdbId, mediaType, season, episode, title, year) {
    return extractStreams(tmdbId, mediaType, season, episode, title, year);
}
