import axios from 'axios';
import { resolve as resolveFastream } from '../resolvers/fastream.js';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
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
// TMDB
// ============================================================================
async function getTmdbData(tmdbId, mediaType) {
  const attempts = [{ lang: 'es-MX' }, { lang: 'en-US' }];
  for (const { lang } of attempts) {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=${lang}`;
      const { data } = await axios.get(url, { timeout: 5000 });
      const title = mediaType === 'movie' ? data.title : data.name;
      const originalTitle = mediaType === 'movie' ? data.original_title : data.original_name;
      return { title, originalTitle };
    } catch {}
  }
  return null;
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
      const { data } = await axios.get(url, { timeout: 8000, headers: HEADERS });
      if (data.includes('trembed=') || data.includes('data-post=')) {
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
    const { data: epData } = await axios.post(
      `${BASE}/wp-admin/admin-ajax.php`,
      new URLSearchParams({ action: 'action_select_season', post: dpost, season: String(season) }),
      { headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded', 'Referer': serieUrl } }
    );
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
    const { data } = await axios.get(pageUrl, { timeout: 8000, headers: { ...HEADERS, 'Referer': referer } });
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
        const { data: embedPage } = await axios.get(
          `${BASE}/?trembed=${idx}&trid=${trid}&trtype=${trtype}`,
          { timeout: 8000, headers: { ...HEADERS, 'Referer': pageUrl } }
        );
        const fastreamUrl = embedPage.match(/<iframe[^>]*src="(https?:\/\/fastream\.to\/[^"]+)"/i)?.[1];
        if (!fastreamUrl) continue;

        const stream = await resolveFastream(fastreamUrl);
        if (stream) {
          streams.push({
            name: 'SeriesMetro',
            title: `${stream.quality} · ${lang} · Fastream`,
            url: stream.url,
            quality: stream.quality,
            headers: stream.headers,
          });
          if (lang === 'Latino') return streams;
        }
      } catch {}
    }
    return streams;
  } catch { return []; }
}

// ============================================================================
// EXPORT
// ============================================================================
export async function getStreams(tmdbId, mediaType, season, episode) {
  if (!tmdbId || !mediaType) return [];
  try {
    const tmdbInfo = await getTmdbData(tmdbId, mediaType);
    if (!tmdbInfo) return [];

    const found = await findContentUrl(tmdbInfo, mediaType);
    if (!found) return [];

    let targetUrl = found.url;
    if (mediaType === 'tv' && season && episode) {
      const epUrl = await getEpisodeUrl(found.url, found.html, season, episode);
      if (!epUrl) return [];
      targetUrl = epUrl;
    }

    return await extractStreams(targetUrl, found.url);
  } catch (e) {
    console.log(`[SeriesMetro] Error: ${e.message}`);
    return [];
  }
}
