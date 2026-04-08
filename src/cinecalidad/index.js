import axios from 'axios';
import { resolve as resolveGoodStream } from '../resolvers/goodstream.js';
import { resolve as resolveVoe } from '../resolvers/voe.js';
import { resolve as resolveFilemoon } from '../resolvers/filemoon.js';
import { resolve as resolveHlswish } from '../resolvers/hlswish.js';
import { resolve as resolveVimeos } from '../resolvers/vimeos.js';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
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

const RESOLVERS = {
  'goodstream.one': resolveGoodStream,
  'hlswish.com':    resolveHlswish,
  'streamwish.com': resolveHlswish,
  'streamwish.to':  resolveHlswish,
  'strwish.com':    resolveHlswish,
  'voe.sx':         resolveVoe,
  'filemoon.sx':    resolveFilemoon,
  'filemoon.to':    resolveFilemoon,
  'vimeos.net':     resolveVimeos,
};

// ============================================================================
// UTILIDADES
// ============================================================================
const normalizeText = (text) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const getServerName = (url) => {
  if (url.includes('goodstream'))  return 'GoodStream';
  if (url.includes('hlswish') || url.includes('streamwish') || url.includes('strwish')) return 'StreamWish';
  if (url.includes('voe.sx'))      return 'VOE';
  if (url.includes('filemoon'))    return 'Filemoon';
  if (url.includes('vimeos'))      return 'Vimeos';
  return 'Online';
};

const getResolver = (url) => {
  if (!url || !url.startsWith('http')) return null;
  for (const pattern in RESOLVERS) {
    if (url.includes(pattern)) return RESOLVERS[pattern];
  }
  return null;
};

function b64decode(str) {
  try {
    if (typeof atob !== 'undefined') return atob(str);
    return Buffer.from(str, 'base64').toString('utf8');
  } catch (e) { return null; }
}

// ============================================================================
// TMDB
// ============================================================================
async function getTmdbData(tmdbId, mediaType) {
  const attempts = [
    { lang: 'es-MX', name: 'Latino' },
    { lang: 'es-ES', name: 'España' },
    { lang: 'en-US', name: 'Inglés' },
  ];

  for (const { lang, name } of attempts) {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=${lang}`;
      const { data } = await axios.get(url, { timeout: 5000 });
      const title = mediaType === 'movie' ? data.title : data.name;
      const originalTitle = mediaType === 'movie' ? data.original_title : data.original_name;
      if (!title) continue;
      console.log(`[CineCalidad] TMDB (${name}): "${title}"`);
      return {
        title,
        originalTitle,
        year: (data.release_date || data.first_air_date || '').substring(0, 4),
      };
    } catch (e) {
      console.log(`[CineCalidad] Error TMDB ${name}: ${e.message}`);
    }
  }
  return null;
}

// ============================================================================
// SLUG → URL
// ============================================================================
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
      const { data: html } = await axios.get(url, {
        timeout: 8000,
        headers: HEADERS,
        validateStatus: status => status === 200,
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
const KNOWN_EMBED_DOMAINS = [
  'goodstream.one', 'voe.sx', 'filemoon.sx', 'filemoon.to',
  'hlswish.com', 'streamwish.com', 'streamwish.to', 'strwish.com',
  'vimeos.net',
];

function isKnownEmbed(url) {
  return KNOWN_EMBED_DOMAINS.some(d => url.includes(d));
}

async function getEmbedUrls(movieUrl) {
  try {
    const { data } = await axios.get(movieUrl, { timeout: 8000, headers: HEADERS });
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
          const { data: midData } = await axios.get(decoded, {
            timeout: 6000, headers: HEADERS, maxRedirects: 5,
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
    const resolver = getResolver(embedUrl);
    if (!resolver) return null;
    const result = await resolver(embedUrl);
    if (!result || !result.url) return null;
    return {
      name: 'CineCalidad',
      title: `${result.quality || '1080p'} · ${getServerName(embedUrl)}`,
      url: result.url,
      quality: result.quality || '1080p',
      headers: result.headers || {},
    };
  } catch {
    return null;
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
export async function getStreams(tmdbId, mediaType, season, episode) {
  if (!tmdbId || !mediaType || mediaType === 'tv') return [];

  const startTime = Date.now();
  console.log(`[CineCalidad] Buscando: TMDB ${tmdbId} (${mediaType})`);

  try {
    const tmdbInfo = await getTmdbData(tmdbId, mediaType);
    if (!tmdbInfo) return [];

    const slug = buildSlug(tmdbInfo.title);
    let selectedUrl = await getMovieUrl(slug, tmdbInfo.year);

    if (!selectedUrl && tmdbInfo.originalTitle && tmdbInfo.originalTitle !== tmdbInfo.title) {
      selectedUrl = await getMovieUrl(buildSlug(tmdbInfo.originalTitle), tmdbInfo.year);
    }
    if (!selectedUrl) return [];

    const embedUrls = await getEmbedUrls(selectedUrl);
    if (embedUrls.length === 0) return [];

    const uniqueEmbeds = [...new Set(embedUrls)];
    const streams = (await Promise.allSettled(uniqueEmbeds.map(processEmbed)))
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[CineCalidad] ✓ ${streams.length} streams en ${elapsed}s`);
    return streams;
  } catch (e) {
    console.log(`[CineCalidad] Error: ${e.message}`);
    return [];
  }
}
