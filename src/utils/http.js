/**
 * HTTP Utilities for Nuvio Latino
 */

const DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";

/**
 * Robust fetch wrapper with timeout and logging
 */
async function request(url, options = {}) {
    const timeout = options.timeout || 15000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const headers = {
        "User-Agent": options.mobile ? MOBILE_UA : DEFAULT_UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
        ...options.headers
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal
        });

        clearTimeout(id);

        if (!response.ok && !options.ignoreErrors) {
            console.warn(`[HTTP] Error ${response.status} en ${url}`);
        }

        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            console.error(`[HTTP] Timeout exceed (${timeout}ms) en ${url}`);
        } else {
            console.error(`[HTTP] Error en ${url}: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Fetch HTML text from a URL
 */
async function fetchHtml(url, options = {}) {
    const res = await request(url, options);
    return await res.text();
}

/**
 * Fetch JSON from a URL
 */
async function fetchJson(url, options = {}) {
    const res = await request(url, options);
    return await res.json();
}

module.exports = {
    request,
    fetchHtml,
    fetchJson,
    DEFAULT_UA,
    MOBILE_UA
};
