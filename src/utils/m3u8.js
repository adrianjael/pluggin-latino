/**
 * M3U8 Utilities for Link Validation and Quality Detection using fetch
 */
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
 * Validates a video link and detects its real quality using fetch
 */
export async function validateStream(stream) {
    if (!stream || !stream.url) return stream;
    
    const { url, headers } = stream;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // Aumentado a 12s

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': '*/*',
                'Range': 'bytes=0-8192',
                'User-Agent': UA,
                ...(headers || {}) // Prioridad a cabeceras del servidor (Referer/Origin)
            }
        });
        clearTimeout(timeout);

        // Algunos servidores devuelven 403 con Range, pero el enlace es válido para reproducir
        if (!response.ok && response.status !== 206 && response.status !== 403) {
            throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();

        // Si hay contenido m3u8, detectamos calidad real
        if (text && (url.includes('.m3u8') || text.includes('#EXTM3U'))) {
            const realQuality = parseBestQuality(text);
            return { 
                ...stream, 
                quality: realQuality, 
                verified: true 
            };
        }

        // Si es MP4 y respondió (incluso con 403 si el check es parcial), marcamos verificado
        return { ...stream, verified: true };

    } catch (error) {
        clearTimeout(timeout);
        console.log(`[m3u8] Validation soft-fail for ${url.substring(0, 40)}... : ${error.message}`);
        // Fallback: Si es un servidor conocido, marcamos como verificado pero calidad original
        const isKnown = url.includes('awish') || url.includes('vimeos') || url.includes('voe') || url.includes('filemoon');
        return { ...stream, verified: isKnown };
    }
}
