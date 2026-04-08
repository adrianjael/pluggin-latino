/**
 * Network Utilities for Nuvio
 */
export const BASE_URL = "https://www.pelisplushd.la";

const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const COMMON_HEADERS = {
    'User-Agent': DEFAULT_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': '1'
};

/**
 * Fetch text content from a URL
 */
export async function fetchText(url, referer = BASE_URL) {
    try {
        const headers = { ...COMMON_HEADERS };
        if (referer) headers['Referer'] = referer;

        const response = await fetch(url, { headers, timeout: 10000 });
        
        if (!response.ok) {
            console.warn(`[HTTP] Error ${response.status} en ${url}`);
            return "";
        }

        return await response.text();
    } catch (error) {
        console.error(`[HTTP] Fetch error: ${error.message} (${url})`);
        return "";
    }
}

/**
 * Alias para fetchText para mantener compatibilidad
 */
export async function fetchHtml(url, referer) {
    return fetchText(url, referer);
}

/**
 * Fetch JSON content from a URL
 */
export async function fetchJson(url, referer = BASE_URL) {
    const text = await fetchText(url, referer);
    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}
