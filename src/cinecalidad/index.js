const { fetchHtml } = require('../utils/http.js');
const { finalizeStreams } = require('../utils/engine.js');
const { resolveEmbed } = require('../utils/resolvers.js');
const { getTmdbTitle } = require('../utils/tmdb.js');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const HOST = 'https://www.cinecalidad.vg';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-MX,es;q=0.9',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Referer': 'https://www.cinecalidad.vg/',
};

// ============================================================================
// UTILIDADES
// ============================================================================
const getServerName = (url) => {
  if (url.includes('goodstream'))  return 'GoodStream';
  if (url.includes('hlswish') || url.includes('streamwish') || url.includes('strwish')) return 'StreamWish';
  if (url.includes('voe.sx'))      return 'VOE';
  if (url.includes('filemoon'))    return 'Filemoon';
  if (url.includes('vimeos'))      return 'Vimeos';
  return 'Online';
};

function b64decode(str) {
  try {
    if (typeof atob !== 'undefined') return atob(str);
    return Buffer.from(str, 'base64').toString('utf8');
  } catch (e) { return null; }
}

function buildSlug(title) {
  return title
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getMovieUrl(slug, expectedYear) {
  const slugsToTry = [slug, `${slug}-2`, `${slug}-3`];
  for (const s of slugsToTry) {
    const url = `${HOST}/pelicula/${s}/`;
    try {
      const html = await fetchHtml(url, {
        headers: HEADERS
      });
      const yearMatch = html.match(/<h1[^>]*>[^<]*\((\d{4})\)[^<]*<\/h1>/);
      const year = yearMatch ? yearMatch[1] : null;
      if (!year || !expectedYear || year === expectedYear) {
        console.log(`[CineCalidad] ✓ Slug directo: /pelicula/${s}/ (${year || '?'})`);
        return url;
      }
    } catch {}
  }
  return null;
}

// ============================================================================
// OBTENER EMBEDS
// ============================================================================
function isKnownEmbed(url) {
  // Ahora CineCalidad acepta cualquier enlace que nuestro despachador central sepa resolver
  return true; 
}

async function getEmbedUrls(movieUrl) {
  try {
    const data = await fetchHtml(movieUrl, { headers: HEADERS });
    const embedLinks = [];
    const regex = /data-src="([A-Za-z0-9+/=]{20,})"/g;
    let match;
    while ((match = regex.exec(data)) !== null) embedLinks.push(match[1]);

    const decodedUrls = [...new Set(
      embedLinks
        .map(b64 => b64decode(b64))
        .filter(url => url && url.startsWith('http'))
    )];

    const directEmbeds = decodedUrls.filter(isKnownEmbed);
    const intermediateUrls = decodedUrls.filter(u => !isKnownEmbed(u));
    const embedUrls = new Set(directEmbeds);

    if (intermediateUrls.length > 0) {
      await Promise.allSettled(intermediateUrls.map(async (decoded) => {
        try {
          const midData = await fetchHtml(decoded, {
            headers: HEADERS
          });
          let finalUrl = '';
          const btnMatch = midData.match(/id="btn_enlace"[^>]*>[\s\S]*?href="([^"]+)"/);
          if (btnMatch) finalUrl = btnMatch[1];
          if (!finalUrl) {
            const iframeMatch = midData.match(/<iframe[^>]+src="([^"]+)"/);
            if (iframeMatch) finalUrl = iframeMatch[1];
          }
          if (!finalUrl && decoded.includes('/e/')) finalUrl = decoded;
          if (finalUrl && finalUrl.startsWith('http')) embedUrls.add(finalUrl);
        } catch {}
      }));
    }

    return [...embedUrls];
  } catch (e) {
    console.log(`[CineCalidad] Error obteniendo embeds: ${e.message}`);
    return [];
  }
}

async function processEmbed(embedUrl) {
  try {
    const result = await resolveEmbed(embedUrl);
    if (!result || !result.url) return null;
    return {
      langLabel: 'Latino',
      serverLabel: getServerName(embedUrl),
      url: result.url,
      quality: result.quality,
      siteQuality: null, // CineCalidad raramente tiene CAM, pero se deja listo
      headers: result.headers || {},
    };
  } catch {
    return null;
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
async function getStreams(tmdbId, mediaType, season, episode, title) {
  if (!tmdbId || !mediaType || mediaType === 'tv') return [];

  const startTime = Date.now();
  console.log(`[CineCalidad] Buscando: TMDB ${tmdbId} (${mediaType})`);

  try {
    // Título Rescate
    let mediaTitle = title;
    if (!mediaTitle && tmdbId) {
        mediaTitle = await getTmdbTitle(tmdbId, mediaType);
    }
    if (!mediaTitle) return [];

    const slug = buildSlug(mediaTitle);
    let selectedUrl = await getMovieUrl(slug, null); // CineCalidad slug match directo es simple

    if (!selectedUrl) return [];

    const embedUrls = await getEmbedUrls(selectedUrl);
    if (embedUrls.length === 0) return [];

    const uniqueEmbeds = [...new Set(embedUrls)];
    const streams = (await Promise.allSettled(uniqueEmbeds.map(processEmbed)))
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value);

    return await finalizeStreams(streams, 'CineCalidad', mediaTitle);
  } catch (e) {
    console.log(`[CineCalidad] Error: ${e.message}`);
    return [];
  }
}

module.exports = { getStreams };
