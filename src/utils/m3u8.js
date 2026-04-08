/**
 * M3U8 Parsing Utilities for Nuvio Plugin
 */

/**
 * Resuelve una URL relativa contra una URL base
 */
function resolveUrl(url, baseUrl) {
    if (url.startsWith('http')) {
        return url;
    }
    try {
        return new URL(url, baseUrl).toString();
    } catch (error) {
        return url;
    }
}

/**
 * Determina el nombre de calidad a partir de la resolución
 */
function getQualityFromResolution(resolution) {
    if (!resolution) return 'Auto';

    const resMatch = resolution.match(/(\d+)x(\d+)/);
    if (!resMatch) return 'Auto';
    const height = parseInt(resMatch[2]);

    if (height >= 2160) return '4K';
    if (height >= 1440) return '1440p';
    if (height >= 1080) return '1080p';
    if (height >= 720) return '720p';
    if (height >= 480) return '480p';
    if (height >= 360) return '360p';
    return '240p';
}

/**
 * Parsea el contenido de un M3U8 Master para extraer variantes de calidad
 */
function parseMasterM3U8(content, baseUrl) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const variants = [];
    let currentVariant = null;

    for (const line of lines) {
        if (line.startsWith('#EXT-X-STREAM-INF:')) {
            currentVariant = { bandwidth: null, resolution: null, url: null };

            const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
            if (bandwidthMatch) {
                currentVariant.bandwidth = parseInt(bandwidthMatch[1]);
            }

            const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
            if (resolutionMatch) {
                currentVariant.resolution = resolutionMatch[1];
            }
        } else if (currentVariant && !line.startsWith('#')) {
            currentVariant.url = resolveUrl(line, baseUrl);
            variants.push(currentVariant);
            currentVariant = null;
        }
    }

    // Ordenar por resolución (mayor a menor)
    variants.sort((a, b) => {
        const hA = a.resolution ? parseInt(a.resolution.split('x')[1]) : 0;
        const hB = b.resolution ? parseInt(b.resolution.split('x')[1]) : 0;
        return hB - hA;
    });

    return variants;
}

module.exports = {
    resolveUrl,
    getQualityFromResolution,
    parseMasterM3U8
};
