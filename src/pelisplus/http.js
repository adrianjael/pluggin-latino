/**
 * Constant values and headers for PelisPlusHD
 */
export const BASE_URL = "https://www.pelisplushd.la";
export const LOGO = "https://www.pelisplushd.la/images/logo/logo5.png";

export const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    "Referer": BASE_URL,
    "Origin": BASE_URL,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,nextjs/j,nextjs/m,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
};

/**
 * Fetch text content from a URL
 */
export async function fetchText(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                ...HEADERS,
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status} for ${url}`);
        }

        return await response.text();
    } catch (error) {
        console.error(`[PelisPlusHD] Fetch error: ${error.message}`);
        throw error;
    }
}

/**
 * Fetch JSON content from a URL
 */
export async function fetchJson(url, options = {}) {
    const raw = await fetchText(url, options);
    return JSON.parse(raw);
}
