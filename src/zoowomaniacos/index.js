import axios from 'axios';
import { resolve as resolveOkru } from '../resolvers/okru.js';

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const BASE_URL = 'https://proyectox.yoyatengoabuela.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const HEADERS = {
  'User-Agent': UA,
  'Accept': 'application/json, text/javascript, */*',
  'Connection': 'keep-alive',
  'Referer': BASE_URL + '/',
  'Origin': BASE_URL,
  'X-Requested-With': 'XMLHttpRequest',
};

const OKRU_BLACKLIST = ['332656282246', '1683045747235'];

async function getTmdbData(tmdbId, mediaType) {
  const attempts = [{ lang: 'es-MX' }, { lang: 'en-US' }];
  for (const { lang } of attempts) {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=${lang}`;
      const { data } = await axios.get(url, { timeout: 5000, headers: { 'User-Agent': UA } });
      const title = mediaType === 'movie' ? data.title : data.name;
      const originalTitle = mediaType === 'movie' ? data.original_title : data.original_name;
      return { title, originalTitle, year: (data.release_date || '').substring(0, 4) };
    } catch {}
  }
  return null;
}

async function searchMovie(query) {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/alternativo3/server.php`,
      new URLSearchParams({
        'start': '0', 'length': '10', 'metodo': 'ObtenerListaTotal',
        'search[value]': query,
        'searchPanes[a3][0]': '', 'searchPanes[a4][0]': '',
        'searchPanes[a5][0]': '', 'searchPanes[a6][0]': '',
      }),
      { timeout: 8000, headers: HEADERS }
    );
    return data?.data || [];
  } catch { return []; }
}

function selectBestResult(results, tmdbInfo) {
  if (results.length === 0) return null;
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const targetTitle = normalize(tmdbInfo.title);
  const scored = results.map(r => {
    const rTitle = normalize((r.a2 || '').split('-')[0].trim());
    let score = 0;
    if (rTitle === targetTitle) score += 3;
    if (tmdbInfo.year && r.a4 === tmdbInfo.year) score += 1;
    return { r, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].r;
}

async function getEmbeds(id) {
  try {
    const { data: html } = await axios.get(`${BASE_URL}/testplayer.php?id=${id}`, {
      timeout: 8000,
      headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Referer': BASE_URL + '/' },
    });
    const matches = [...html.matchAll(/src="(https?:\/\/[^"]+)"/g)];
    const urls = [...new Set(matches.map(m => m[1]))];
    const okru = urls.filter(url => {
      if (!url.includes('ok.ru/videoembed/')) return false;
      const okId = url.split('/').pop();
      return !OKRU_BLACKLIST.includes(okId);
    });
    const archive = urls.filter(url => url.includes('archive.org') && (url.endsWith('.mp4') || url.endsWith('.mkv')));
    return { okru, archive };
  } catch { return { okru: [], archive: [] }; }
}

export async function getStreams(tmdbId, mediaType, season, episode) {
  if (!tmdbId || mediaType !== 'movie') return [];
  const startTime = Date.now();
  try {
    const tmdbInfo = await getTmdbData(tmdbId, mediaType);
    if (!tmdbInfo) return [];

    const results = await searchMovie(tmdbInfo.title);
    const selected = selectBestResult(results, tmdbInfo);
    if (!selected) return [];

    const { okru: embedUrls, archive: archiveUrls } = await getEmbeds(selected.a1);
    const streams = [];

    if (embedUrls.length > 0) {
      const results = await Promise.allSettled(embedUrls.map(url => resolveOkru(url)));
      results.filter(r => r.status === 'fulfilled' && r.value).forEach(r => streams.push({
        name: 'Zoowomaniacos',
        title: `${r.value.quality} · OkRu`,
        url: r.value.url,
        quality: r.value.quality,
        headers: r.value.headers || {},
      }));
    }

    for (const url of archiveUrls) {
      streams.push({
        name: 'Zoowomaniacos',
        title: 'SD · Archive.org',
        url: url,
        quality: 'SD',
        headers: { 'User-Agent': UA },
      });
    }

    return streams;
  } catch { return []; }
}
