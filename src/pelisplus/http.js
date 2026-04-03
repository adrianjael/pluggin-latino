/**
 * Constant values and headers for PelisPlusHD
 */
export const BASE_URL = "https://www.pelisplushd.la";
export const LOGO = "https://www.pelisplushd.la/images/logo/logo5.png";

const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const COMMON_HEADERS = {
    'User-Agent': DEFAULT_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
};

/**
 * Fetch text content from a URL
 */
export async function fetchText(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                ...COMMON_HEADERS,
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

/**
 * Obtiene el HTML de una página con headers específicos (útil para resolvers)
 */
export async function fetchHtml(url, referer) {
    try {
        const headers = { ...COMMON_HEADERS };
        if (referer) {
            headers['Referer'] = referer;
            headers['Sec-Fetch-Site'] = 'same-origin';
        }
        
        const response = await fetch(url, {
            headers: headers
        });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.text();
    } catch (error) {
        console.error(`[PelisPlusHD] fetchHtml error: ${error.message}`);
        return '';
    }
}
