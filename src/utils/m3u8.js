/**
 * M3U8 Utilities for Link Validation and Quality Detection
 */
import axios from 'axios';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Determine quality from resolution (height)
 */
export function getQualityFromHeight(height) {
    if (!height) return 'Auto';
    const h = parseInt(height);
    if (h >= 2160) return '4K';
    if (h >= 1440) return '1440p';
    if (h >= 1080) return '1080p';
    if (h >= 720) return '720p';
    if (h >= 480) return '480p';
    if (h >= 360) return '360p';
    return '240p';
}

/**
 * Parse M3U8 content to find the best resolution
 */
function parseBestQuality(content) {
    const lines = content.split('\n');
    let bestHeight = 0;

    for (const line of lines) {
        if (line.includes('RESOLUTION=')) {
            const match = line.match(/RESOLUTION=\d+x(\d+)/);
            if (match) {
                const height = parseInt(match[1]);
                if (height > bestHeight) bestHeight = height;
            }
        }
    }
    return bestHeight > 0 ? getQualityFromHeight(bestHeight) : '720p';
}

/**
 * Validates a video link and detects its real quality
 * @param {Object} stream - Stream object
 * @returns {Promise<Object>} - Validated stream with 'verified' flag if successful
 */
export async function validateStream(stream) {
    if (!stream || !stream.url) return stream;
    
    const { url, headers } = stream;
    
    try {
        // Petición optimizada: Bajamos solo el inicio (Range) para detectar calidad rápido
        const response = await axios.get(url, {
            timeout: 8000, 
            responseType: 'text',
            headers: {
                ...(headers || {}),
                'Accept': '*/*',
                'Range': 'bytes=0-4096', // Pedir solo los primeros 4KB
                'User-Agent': headers?.['User-Agent'] || UA
            }
        });

        if (response.data && typeof response.data === 'string' && (url.includes('.m3u8') || response.data.includes('#EXTM3U'))) {
            const realQuality = parseBestQuality(response.data);
            return { 
                ...stream, 
                quality: realQuality, 
                verified: true // <--- Marcamos como verificado
            };
        }

        // Si es un MP4 u otro y respondió, marcamos como verificado pero mantenemos calidad original
        return { ...stream, verified: true };

    } catch (error) {
        // Si falla, el stream NO es verificado pero se mantiene en la lista
        return { ...stream, verified: false };
    }
}
