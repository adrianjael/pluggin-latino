/**
 * Extractor Logic for PelisPlusHD
 */
import { fetchText, BASE_URL } from './http.js';
import cheerio from 'cheerio-without-node-native';

/**
 * Gets the movie/TV title from TMDB by scraping (since we don't have an API Key)
 */
async function getTmdbTitle(tmdbId, mediaType) {
    try {
        const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
        const html = await fetchText(url);
        const $ = cheerio.load(html);
        
        // Selector found in research: .title h2 a
        const title = $('.title h2 a').text().trim();
        console.log(`[PelisPlusHD] TMDB Title found: ${title}`);
        return title;
    } catch (error) {
        console.error(`[PelisPlusHD] Error fetching TMDB title: ${error.message}`);
        return null;
    }
}

/**
 * Main extraction function
 */
export async function extractStreams(tmdbId, mediaType, season, episode) {
    try {
        // 1. Get Title from TMDB
        const title = await getTmdbTitle(tmdbId, mediaType);
        if (!title) return [];

        // 2. Search on PelisPlusHD
        const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(title)}`;
        const searchHtml = await fetchText(searchUrl);
        const $search = cheerio.load(searchHtml);
        
        let movieUrl = null;
        $search('a.Posters-link').each((i, el) => {
            const resultTitle = $search(el).attr('data-title') || "";
            // Basic matching (case insensitive)
            if (resultTitle.toLowerCase().includes(title.toLowerCase())) {
                movieUrl = BASE_URL + $search(el).attr('href');
                return false; // break
            }
        });

        if (!movieUrl) {
            console.log(`[PelisPlusHD] No results found for: ${title}`);
            return [];
        }

        // 3. Fetch Movie/Episode Page
        // For TV shows, we might need to append season/episode to URL or find it in the page
        // PelisPlusHD usually has /serie/name/temporada/1/episodio/1
        if (mediaType === 'tv') {
            movieUrl = movieUrl.replace('/serie/', '/episodio/') + `-${season}x${episode}`;
        }

        console.log(`[PelisPlusHD] Fetching page: ${movieUrl}`);
        const pageHtml = await fetchText(movieUrl);
        const $page = cheerio.load(pageHtml);
        
        const streams = [];

        // 4. Extract Servers (playurl)
        $page('li.playurl').each((i, el) => {
            const serverUrl = $page(el).attr('data-url');
            const serverName = $page(el).find('a').text().trim();
            const language = $page(el).attr('data-name'); // "Español Latino", "Subtitulado", etc.

            if (serverUrl && language === "Español Latino") {
                streams.push({
                    name: "PelisPlusHD",
                    title: `${serverName} (${language})`,
                    url: serverUrl,
                    quality: "HD",
                    headers: {
                        "Referer": movieUrl
                    }
                });
            }
        });

        return streams;
    } catch (error) {
        console.error(`[PelisPlusHD] Extraction error: ${error.message}`);
        return [];
    }
}
