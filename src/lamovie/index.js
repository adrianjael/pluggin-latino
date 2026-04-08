// src/lamovie/index.js
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
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const HEADERS = { 'User-Agent': UA, 'Accept': 'application/json' };
const BASE_URL = 'https://la.movie';

// Países de origen que LaMovie considera anime
const ANIME_COUNTRIES = ['JP', 'CN', 'KR'];
const GENRE_ANIMATION = 16;

const RESOLVERS = {
  'goodstream.one': resolveGoodStream,
  'hlswish.com': resolveHlswish,
  'streamwish.com': resolveHlswish,
  'streamwish.to': resolveHlswish,
  'strwish.com': resolveHlswish,
  'voe.sx': resolveVoe,
  'filemoon.sx': resolveFilemoon,
  'filemoon.to': resolveFilemoon,
  'vimeos.net': resolveVimeos,
};

// ============================================================================
// UTILIDADES
// ============================================================================
const normalizeText = (text) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const getServerName = (url) => {
  if (url.includes('goodstream')) return 'GoodStream';
  if (url.includes('hlswish') || url.includes('streamwish')) return 'StreamWish';
  if (url.includes('voe.sx')) return 'VOE';
  if (url.includes('filemoon')) return 'Filemoon';
  if (url.includes('vimeos.net')) return 'Vimeos';
  return 'Online';
};

const getResolver = (url) => {
  if (!url) return null;
  for (const [pattern, resolver] of Object.entries(RESOLVERS)) {
    if (url.includes(pattern)) return resolver;
  }
  return null;
};

function buildSlug(title, year) {
  const slug = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return year ? `${slug}-${year}` : slug;
}

function getCategories(mediaType, genres, originCountries) {
  if (mediaType === 'movie') return ['peliculas'];
  const isAnimation = (genres || []).includes(GENRE_ANIMATION);
  if (!isAnimation) return ['series'];
  const isAnimeCountry = (originCountries || []).some(c => ANIME_COUNTRIES.includes(c));
  if (isAnimeCountry) return ['animes'];
  return ['animes', 'series'];
}

// ============================================================================
// TMDB
// ============================================================================
async function getTmdbData(tmdbId, mediaType) {
  const attempts = [{ lang: 'es-MX' }, { lang: 'en-US' }];
  for (const { lang } of attempts) {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=${lang}`;
      const { data } = await axios.get(url, { timeout: 5000, headers: HEADERS });
      const title = mediaType === 'movie' ? data.title : data.name;
      const originalTitle = mediaType === 'movie' ? data.original_title : data.original_name;
      return {
        title,
        originalTitle,
        year: (data.release_date || data.first_air_date || '').substring(0, 4),
        genres: (data.genres || []).map(g => g.id),
        originCountries: data.origin_country || data.production_countries?.map(c => c.iso_3166_1) || [],
      };
    } catch {}
  }
  return null;
}

// ============================================================================
// SLUG → ID
// ============================================================================
async function getIdBySlug(category, slug) {
  const url = `${BASE_URL}/${category}/${slug}/`;
  try {
    const { data: html } = await axios.get(url, {
      timeout: 8000,
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      validateStatus: s => s === 200,
    });
    const match = html.match(/rel=['"]shortlink['"]\s+href=['"][^'"]*\?p=(\d+)['"]/);
    if (match) {
        console.log(`[LaMovie] ✓ Slug directo: /${category}/${slug} → id:${match[1]}`);
        return { id: match[1] };
    }
    return null;
  } catch { return null; }
}

async function findBySlug(tmdbInfo, mediaType) {
  const { title, originalTitle, year, genres, originCountries } = tmdbInfo;
  const categories = getCategories(mediaType, genres, originCountries);
  const slugs = [];
  if (title) slugs.push(buildSlug(title, year));
  if (originalTitle && originalTitle !== title) slugs.push(buildSlug(originalTitle, year));

  for (const slug of slugs) {
    for (const cat of categories) {
      const result = await getIdBySlug(cat, slug);
      if (result) return result;
    }
  }
  return null;
}

async function getEpisodeId(seriesId, seasonNum, episodeNum) {
  const url = `${BASE_URL}/wp-api/v1/single/episodes/list?_id=${seriesId}&season=${seasonNum}&page=1&postsPerPage=50`;
  try {
    const { data } = await axios.get(url, { timeout: 12000, headers: HEADERS });
    if (!data?.data?.posts) return null;
    const ep = data.data.posts.find(e => e.season_number == seasonNum && e.episode_number == episodeNum);
    return ep?._id || null;
  } catch { return null; }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
export async function getStreams(tmdbId, mediaType, season, episode) {
  if (!tmdbId || !mediaType) return [];
  const startTime = Date.now();
  try {
    const tmdbInfo = await getTmdbData(tmdbId, mediaType);
    if (!tmdbInfo) return [];

    const found = await findBySlug(tmdbInfo, mediaType);
    if (!found) return [];

    let targetId = found.id;
    if (mediaType === 'tv' && season && episode) {
      const epId = await getEpisodeId(targetId, season, episode);
      if (!epId) return [];
      targetId = epId;
    }

    const { data } = await axios.get(`${BASE_URL}/wp-api/v1/player?postId=${targetId}&demo=0`, { timeout: 6000, headers: HEADERS });
    if (!data?.data?.embeds) return [];

    const streams = (await Promise.allSettled(data.data.embeds.map(async (embed) => {
        const resolver = getResolver(embed.url);
        if (!resolver) return null;
        const result = await resolver(embed.url);
        if (!result || !result.url) return null;
        return {
          name: 'LaMovie',
          title: `${result.quality || '1080p'} · ${getServerName(embed.url)}`,
          url: result.url,
          quality: result.quality || '1080p',
          headers: result.headers || {}
        };
    })))
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);

    return streams;
  } catch (e) {
    console.log(`[LaMovie] Error: ${e.message}`);
    return [];
  }
}
