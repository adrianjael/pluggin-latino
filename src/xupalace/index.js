const axios = require('axios');
const { finalizeStreams } = require('../utils/engine.js');
const { resolveEmbed } = require('../utils/resolvers.js');
const { getTmdbTitle } = require('../utils/tmdb.js');

/**
 * XuPalace - Versión Soporte Malcolm (v4.4.0)
 * Habilitación de búsqueda por Slugs (MALCOLM) y títulos blindados.
 */

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const BASE_URL = 'https://xupalace.org';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const HTML_HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html',
  'Accept-Language': 'es-MX,es;q=0.9',
};

async function getImdbId(tmdbId, mediaType) {
  try {
    const type = (mediaType === 'movie' || mediaType === 'movies') ? 'movie' : 'tv';
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`;
    const { data } = await axios.get(url, { timeout: 5000, headers: { 'User-Agent': UA } });
    return data.imdb_id || null;
  } catch { return null; }
}

/**
 * Generador de Slugs para XuPalace (ID y Nombre en Mayúsculas)
 */
function getXuSlugs(imdbId, title) {
    const variants = [];
    if (imdbId) variants.push(imdbId);
    if (title) {
        // Formato: "Malcolm in the Middle" -> "MALCOLM"
        const firstWord = title.split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (firstWord) variants.push(firstWord);
        
        // Formato Completo: "MALCOLM-IN-THE-MIDDLE"
        const fullSlug = title.toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        if (fullSlug) variants.push(fullSlug);
    }
    return [...new Set(variants)];
}

async function getEmbeds(slug, mediaType, season, episode) {
  try {
    const eStr = String(episode).padStart(2, '0');
    const path = mediaType === 'movie' ? `/video/${slug}/` : `/video/${slug}-${season}x${eStr}/`;
    const { data: html } = await axios.get(`${BASE_URL}${path}`, { timeout: 8000, headers: HTML_HEADERS });
    const matches = [...html.matchAll(/go_to_playerVast\('(https?:\/\/[^']+)'[^)]+\)[^<]*data-lang="(\d+)"/g)];
    
    if (matches.length === 0) {
      const fallback = [...html.matchAll(/go_to_playerVast\('(https?:\/\/[^']+)'/g)];
      return { 0: [...new Set(fallback.map(m => m[1]))] };
    }

    const byLang = {};
    for (const m of matches) {
      const url = m[1];
      const lang = parseInt(m[2]);
      if (!byLang[lang]) byLang[lang] = [];
      if (!byLang[lang].includes(url)) byLang[lang].push(url);
    }
    return byLang;
  } catch { return {}; }
}

async function getStreams(tmdbId, mediaType, season, episode, title) {
  if (!tmdbId) return [];

  // Título Rescate: Nuvio a veces no envía el título, lo buscamos en TMDB
  let mediaTitle = title;
  if (!mediaTitle && tmdbId) {
    mediaTitle = await getTmdbTitle(tmdbId, mediaType);
  }

  const LANG_NAMES = { 0: 'Latino', 1: 'Español', 2: 'Subtitulado' };
  
  try {
    const imdbId = await getImdbId(tmdbId.toString().split(':')[0], mediaType);
    const slugVariants = getXuSlugs(imdbId, mediaTitle);
    
    let allStreams = [];
    
    for (const slug of slugVariants) {
        if (allStreams.length > 0) break;

        const byLang = await getEmbeds(slug, mediaType, season, episode);
        if (Object.keys(byLang).length === 0) continue;

        for (const lang of [0, 1, 2]) {
          const urls = byLang[lang];
          if (!urls || urls.length === 0) continue;

          for (const url of urls) {
              try {
                const result = await resolveEmbed(url);
                if (result && result.url) {
                  allStreams.push({
                    langLabel: LANG_NAMES[lang],
                    serverLabel: result.serverName || 'XuPalace',
                    url: result.url,
                    quality: result.quality || 'HD',
                    headers: result.headers || {},
                  });
                }
              } catch {}
          }
        }
    }

    return await finalizeStreams(allStreams, 'XuPalace', mediaTitle);
  } catch (e) {
    return [];
  }
}

module.exports = { getStreams };
