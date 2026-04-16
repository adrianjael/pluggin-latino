const { fetchHtml, request } = require('../utils/http.js');
const { finalizeStreams } = require('../utils/engine.js');
const { resolveEmbed } = require('../utils/resolvers.js');
const { getTmdbTitle } = require('../utils/tmdb.js');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
// Metadatos centralizados vía tmdb.js
const BASE = 'https://www3.seriesmetro.net';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-MX,es;q=0.9',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

const LANG_PRIORITY = ['latino', 'lat', 'castellano', 'español', 'esp', 'vose', 'sub', 'subtitulado'];
const LANG_MAP = {
  'latino': 'Latino', 'lat': 'Latino',
  'castellano': 'Español', 'español': 'Español', 'esp': 'Español',
  'vose': 'Subtitulado', 'sub': 'Subtitulado', 'subtitulado': 'Subtitulado',
};

// ============================================================================
// UTILIDADES
// ============================================================================
function buildSlug(title) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================================================
// BÚSQUEDA
// ============================================================================
async function findContentUrl(tmdbInfo, mediaType) {
  const { title, originalTitle } = tmdbInfo;
  const category = mediaType === 'movie' ? 'pelicula' : 'serie';
  const slugs = [];
  if (title) slugs.push(buildSlug(title));
  if (originalTitle && originalTitle !== title) slugs.push(buildSlug(originalTitle));

  for (const slug of slugs) {
    const url = `${BASE}/${category}/${slug}/`;
    try {
      const data = await fetchHtml(url, { headers: HEADERS });
      if (data && (data.includes('trembed=') || data.includes('data-post='))) {
        console.log(`[SeriesMetro] ✓ Encontrado: /${category}/${slug}/`);
        return { url, html: data };
      }
    } catch {}
  }
  return null;
}

async function getEpisodeUrl(serieUrl, serieHtml, season, episode) {
  const dpost = serieHtml.match(/data-post="(\d+)"/)?.[1];
  if (!dpost) return null;
  try {
    const res = await request(`${BASE}/wp-admin/admin-ajax.php`, {
      method: 'POST',
      body: new URLSearchParams({ action: 'action_select_season', post: dpost, season: String(season) }),
      headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded', 'Referer': serieUrl }
    });
    const epData = await res.text();
    const epUrls = [...epData.matchAll(/href="([^"]+\/capitulo\/[^"]+)"/g)].map(m => m[1]);
    return epUrls.find(u => {
      const m = u.match(/temporada-(\d+)-capitulo-(\d+)/);
      return m && parseInt(m[1]) === season && parseInt(m[2]) === episode;
    }) || null;
  } catch { return null; }
}

// ============================================================================
// EXTRAER STREAMS
// ============================================================================
async function extractStreams(pageUrl, referer) {
  try {
    const data = await fetchHtml(pageUrl, { headers: { ...HEADERS, 'Referer': referer } });
    const options = [...data.matchAll(/href="#options-(\d+)"[^>]*>[\s\S]*?<span class="server">([\s\S]*?)<\/span>/g)];
    const trids = [...data.matchAll(/\?trembed=(\d+)(?:&#038;|&)trid=(\d+)(?:&#038;|&)trtype=(\d+)/g)];
    if (trids.length === 0 || options.length === 0) return [];

    const trid = trids[0][2];
    const trtype = trids[0][3];

    const sorted = options.sort(([, , a], [, , b]) => {
      const aL = a.replace(/<[^>]+>/g, '').split('-').pop().trim().toLowerCase();
      const bL = b.replace(/<[^>]+>/g, '').split('-').pop().trim().toLowerCase();
      const ai = LANG_PRIORITY.indexOf(aL);
      const bi = LANG_PRIORITY.indexOf(bL);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    const streams = [];
    for (const [, idx, srvRaw] of sorted) {
      const srvText = srvRaw.replace(/<[^>]+>/g, '').trim();
      const langRaw = srvText.split('-').pop().trim().toLowerCase();
      const lang = LANG_MAP[langRaw] || langRaw;

      try {
        const embedPage = await fetchHtml(
          `${BASE}/?trembed=${idx}&trid=${trid}&trtype=${trtype}`,
          { headers: { ...HEADERS, 'Referer': pageUrl } }
        );
        const iframeUrl = embedPage.match(/<iframe[^>]*src="([^"]+)"/i)?.[1];
        if (!iframeUrl) continue;

        const stream = await resolveEmbed(iframeUrl);
        if (stream && stream.url) {
          streams.push({
            langLabel: lang,
            serverLabel: stream.serverName || 'Server',
            url: stream.url,
            quality: stream.quality || 'HD',
            headers: stream.headers || HEADERS,
          });
        }
      } catch {}
    }
    return streams;
  } catch { return []; }
}

// ============================================================================
// EXPORT
// ============================================================================
async function getStreams(tmdbId, mediaType, season, episode, title) {
  if (!tmdbId || !mediaType) return [];
  try {
    // Título Rescate
    let mediaTitle = title;
    if (!mediaTitle && tmdbId) {
        mediaTitle = await getTmdbTitle(tmdbId, mediaType);
    }
    if (!mediaTitle) return [];

    const found = await findContentUrl({ title: mediaTitle }, mediaType);
    if (!found) return [];

    let targetUrl = found.url;
    if (mediaType === 'tv' && season && episode) {
      const epUrl = await getEpisodeUrl(found.url, found.html, season, episode);
      if (!epUrl) return [];
      targetUrl = epUrl;
    }

    const streams = await extractStreams(targetUrl, found.url);
    return await finalizeStreams(streams, 'SeriesMetro', mediaTitle);
  } catch (e) {
    console.log(`[SeriesMetro] Error: ${e.message}`);
    return [];
  }
}

module.exports = { getStreams };
