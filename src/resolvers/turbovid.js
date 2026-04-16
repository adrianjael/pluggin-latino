import axios from 'axios';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

/**
 * Resolves TurboVid embeds to direct m3u8 links.
 * @param {string} embedUrl 
 * @returns {Promise<Object|null>}
 */
export async function resolve(embedUrl) {
    try {
        const { data: html } = await axios.get(embedUrl, { 
            headers: { 
                'User-Agent': UA,
                'Referer': 'https://www.fuegocine.com/' 
            }, 
            timeout: 8000 
        });
        
        const hashMatch = html.match(/data-hash="([^"]+\.m3u8[^"]*)"/);
        if (hashMatch) {
            return {
                url: hashMatch[1],
                quality: 'HD',
                headers: { 'Referer': embedUrl }
            };
        }
        return null;
    } catch { 
        return null; 
    }
}
