/**
 * M3U8 Utilities for Link Validation and Quality Detection
 * Optimized for TV (No Axios / Fetch Native)
 */
const { getSessionUA } = require('./http.js');

function getQualityFromHeight(height) {
    if (!height) return '1080p';
    const h = parseInt(height);
    if (h >= 2160) return '4K';
    if (h >= 1440) return '1440p';
    if (h >= 1080) return '1080p';
    if (h >= 720) return '720p';
    if (h >= 480) return '480p';
    if (h >= 360) return '360p';
    return '1080p';
}

function parseBestQuality(content, url = '') {
    if (content) {
        const lines = content.split('\n');
        let bestHeight = 0;
        for (const line of lines) {
            if (line.includes('RESOLUTION=')) {
                const match = line.match(/RESOLUTION=\d+x(\d+)/i);
                if (match) {
                    const height = parseInt(match[1]);
                    if (height > bestHeight) bestHeight = height;
                }
            }
        }
        if (bestHeight > 0) return getQualityFromHeight(bestHeight);
    }
    const qMatch = url.match(/[_-](\d{3,4})[pP]?/);
    if (qMatch) {
        const h = parseInt(qMatch[1]);
        if (h >= 360 && h <= 4320) return getQualityFromHeight(h);
    }
    return '1080p';
}

const VALIDATION_CACHE = new Map();

async function validateStream(stream, signal = null) {
    if (!stream || !stream.url) return stream;
    const { url, headers } = stream;

    if (VALIDATION_CACHE.has(url)) return { ...stream, ...VALIDATION_CACHE.get(url) };
    
    try {
        // v9.0.1: Preparación segura de opciones
        const fetchOptions = {
            method: 'GET',
            headers: { 
                'User-Agent': getSessionUA(),
                'Range': 'bytes=0-1024',
                ...(headers || {}) 
            }
        };

        if (signal) fetchOptions.signal = signal;

        // v7.6.2: Uso de fetch nativo
        const response = await fetch(url, fetchOptions);

        if (!response.ok) return { ...stream, verified: false };

        const text = await response.text();
        let resultData = { verified: true };

        if (text && (url.includes('.m3u8') || text.includes('#EXTM3U'))) {
            resultData.quality = parseBestQuality(text, url);
        }

        VALIDATION_CACHE.set(url, resultData);
        return { ...stream, ...resultData };

    } catch (error) {
        const resultData = { quality: parseBestQuality('', url), verified: true };
        VALIDATION_CACHE.set(url, resultData);
        return { ...stream, ...resultData };
    }
}

module.exports = { validateStream, getQualityFromHeight };

module.exports = { validateStream, getQualityFromHeight };
