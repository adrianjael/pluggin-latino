// src/embed69/index.js
// Provider basado en embed69.org — soporta películas y series
// Flujo: TMDB → IMDB ID → embed69.org/f/{imdb_id} → dataLink (JWT) → resolvers

import axios from 'axios';
import { finalizeStreams } from '../utils/engine.js';
import { resolve as resolveVoe } from '../resolvers/voe.js';
import { resolve as resolveFilemoon } from '../resolvers/filemoon.js';
import { resolve as resolveHlswish } from '../resolvers/hlswish.js';
import { resolve as resolveVidhide } from '../resolvers/vidhide.js';
import { resolve as resolveGoodstream } from '../resolvers/goodstream.js';
import { validateStream } from '../utils/m3u8.js';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const BASE_URL = 'https://embed69.org';
const RESOLVER_TIMEOUT = 12000;

// Mapeo de dominio de embed → resolver
const RESOLVER_MAP = {
  'voe.sx':           resolveVoe,
  'voe-sx.com':       resolveVoe,
  'voex.sx':          resolveVoe,
  'voe.to':           resolveVoe,
  'hglink.to':        resolveHlswish,    // streamwish
  'streamwish.com':   resolveHlswish,
  'streamwish.to':    resolveHlswish,
  'wishembed.online': resolveHlswish,
  'audinifer.com':    resolveHlswish,    // streamwish alias
  'filelions.com':    resolveHlswish,
  'bysedikamoum.com': resolveFilemoon,  // filemoon alias
  'filemoon.sx':      resolveFilemoon,
  'filemoon.to':      resolveFilemoon,
  'moonembed.pro':    resolveFilemoon,
  'moonalu.com':      resolveFilemoon,
  'dintezuvio.com':   resolveVidhide,   // vidhide
  'vidhide.com':      resolveVidhide,
  'vidhide.pro':      resolveVidhide,
  'vidhide.bz':       resolveVidhide,
  'vidhide.net':      resolveVidhide,
  'vidhide.top':      resolveVidhide,
  'vadisov.com':      resolveVidhide,
  'callistanise.com': resolveVidhide,
  'amusemre.com':     resolveVidhide,
  'acek-cdn.xyz':     resolveVidhide,
  'vedonm.com':       resolveVidhide,
  'minochinos.com':   resolveVidhide,
  'vaiditv.com':      resolveVidhide,
  'goodstream.one':   resolveGoodstream,
};

const SERVER_LABELS = {
  'voe':        'VOE',
  'streamwish': 'StreamWish',
  'filemoon':   'Filemoon',
  'vidhide':    'VidHide',
  'goodstream': 'GoodStream',
};

// Prioridad de idioma (menor índice = mayor prioridad)
const LANG_PRIORITY = ['LAT', 'ESP', 'SUB'];

// ============================================================================
// UTILIDADES
// ============================================================================

// Decodifica el payload de un JWT sin verificar firma
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    payload += '='.repeat((4 - payload.length % 4) % 4);
    
    // Compatibilidad universal para atob
    const decoded = typeof atob !== 'undefined' 
        ? atob(payload) 
        : (typeof Buffer !== 'undefined' ? Buffer.from(payload, 'base64').toString('utf8') : null);
        
    if (!decoded) return null;
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Extrae la variable JavaScript `dataLink` del HTML de embed69
function parseDataLink(html) {
  try {
    const match = html.match(/let\s+dataLink\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) return null;
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

// Obtiene el resolver según la URL del embed decodificado
function getResolver(url) {
  if (!url) return null;
  for (const [pattern, resolver] of Object.entries(RESOLVER_MAP)) {
    if (url.includes(pattern)) return resolver;
  }
  return null;
}

// ============================================================================
// TMDB
// ============================================================================

// Obtiene el IMDB ID desde TMDB external_ids
async function getImdbId(tmdbId, mediaType) {
  const tId = tmdbId.toString();
  const endpoint = (mediaType === 'movie' || mediaType === 'movies')
    ? `https://api.themoviedb.org/3/movie/${tId}/external_ids?api_key=${TMDB_API_KEY}`
    : `https://api.themoviedb.org/3/tv/${tId}/external_ids?api_key=${TMDB_API_KEY}`;

  try {
      const { data } = await axios.get(endpoint, {
        timeout: 5000,
        headers: { 'User-Agent': UA }
      });
      return data.imdb_id || null;
  } catch (e) {
      console.log(`[Embed69] TMDB error: ${e.message}`);
      return null;
  }
}

// ============================================================================
// EMBED69 FETCH
// ============================================================================

// Mapeo selectivo para corregir desfases de temporadas e IDs entre Nuvio/TMDB y Embed69
const SERIES_MAPPINGS = {
  'tt40197357': { 
    replacementId: 'tt0285403', // Usar ID de la serie original (Scrubs 2001)
    offset: 9                   // S1 en Nuvio corresponde a S10 en Embed69
  },
};

// Construye la URL de embed69 según tipo de contenido
function buildEmbedUrl(imdbId, mediaType, season, episode) {
  if (mediaType === 'movie' || mediaType === 'movies') return `${BASE_URL}/f/${imdbId}`;
  
  let targetId = imdbId;
  let s = parseInt(season) || 1;

  // Aplicar mapeo si existe para este IMDb ID
  const mapping = SERIES_MAPPINGS[imdbId];
  if (mapping) {
    if (mapping.replacementId) targetId = mapping.replacementId;
    if (mapping.offset) s += mapping.offset;
  }

  const e = String(episode || 1).padStart(2, '0');
  return `${BASE_URL}/f/${targetId}-${s}x${e}`;
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
export async function getStreams(tmdbId, mediaType, season, episode, title) {
  if (!tmdbId || !mediaType) return [];

  const startTime = Date.now();
  console.log(`[Embed69] Buscando: TMDB ${tmdbId} (${mediaType})${season ? ` S${season}E${episode}` : ''}`);

  try {
    // 1. Obtener IMDB ID (si ya es tt..., lo usamos directamente)
    let imdbId = tmdbId.toString().startsWith('tt') ? tmdbId : null;
    
    if (!imdbId) {
      imdbId = await getImdbId(tmdbId, mediaType);
    }

    if (!imdbId) {
      console.log('[Embed69] No se encontró IMDB ID');
      return [];
    }
    console.log(`[Embed69] IMDB ID: ${imdbId}`);

    // 2. Fetch la página de embed69
    const embedUrl = buildEmbedUrl(imdbId, mediaType, season, episode);
    console.log(`[Embed69] Fetching: ${embedUrl}`);

    const { data: html } = await axios.get(embedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': UA,
        'Referer': 'https://sololatino.net/',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    // 3. Extraer el array dataLink del HTML
    const dataLink = parseDataLink(html);
    if (!dataLink || dataLink.length === 0) {
      console.log('[Embed69] No se encontró dataLink en el HTML');
      return [];
    }

    console.log(`[Embed69] ${dataLink.length} secciones encontradas.`);

    // 4. Agrupar secciones por idioma
    const byLang = {};
    for (const section of dataLink) {
      byLang[section.video_language || 'UNKNOWN'] = section;
    }

    // 5. Extraer embeds resolvibles
    function getEmbeds(section) {
      const lang = section.video_language || 'LAT';
      const embeds = [];
      for (const embed of (section.sortedEmbeds || [])) {
        if (embed.servername === 'download') continue;
        const payload = decodeJwtPayload(embed.link);
        if (!payload || !payload.link) continue;
        const resolver = getResolver(payload.link);
        if (!resolver) {
          // No loguear para evitar spam, solo si es estrictamente necesario
          continue;
        }
        embeds.push({ url: payload.link, resolver, lang, servername: embed.servername });
      }
      return embeds;
    }

    // 6. Resolver un lote en paralelo
    async function resolveBatch(embeds) {
      const results = await Promise.allSettled(
        embeds.map(({ url, resolver, lang, servername }) =>
          Promise.race([
            resolver(url).then(r => r ? { ...r, lang, servername } : null),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), RESOLVER_TIMEOUT)
            )
          ])
        )
      );
      return results
        .filter(r => r.status === 'fulfilled' && r.value?.url)
        .map(r => r.value);
    }

    // 7. Recopilar todos los streams de todos los idiomas disponibles
    const streams = [];
    const seenUrls = new Set();

    // Procesamos todos los idiomas listados en la prioridad
    for (const lang of LANG_PRIORITY) {
      const section = byLang[lang];
      if (!section) continue;

      const embeds = getEmbeds(section);
      if (embeds.length === 0) continue;

      console.log(`[Embed69] Resolviendo ${embeds.length} embeds (${lang})...`);
      const resolved = await resolveBatch(embeds);

      // 8. Validar cada stream capturado (Paralelo y Seguro)
      const vPromises = resolved.map(async (res) => {
        if (seenUrls.has(res.url)) return null;
        seenUrls.add(res.url);

        const langLabel = res.lang === 'LAT' ? 'Latino' : res.lang === 'ESP' ? 'Español' : 'Subtitulado';
        const serverLabel = SERVER_LABELS[res.servername] || res.servername;
        
        const streamData = {
          name: 'Embed69',
          langLabel,
          serverLabel,
          url: res.url,
          quality: res.quality || '1080p',
          headers: res.headers || {}
        };

        try {
          const vStream = await validateStream(streamData);
          if (vStream.verified) {
            vStream.quality = `(${vStream.quality} ✓)`;
          }
          return vStream;
        } catch (e) {
          return streamData;
        }
      });

      const validatedBatch = await Promise.all(vPromises);
      const newStreams = validatedBatch.filter(s => s !== null);
      streams.push(...newStreams);

      // Lógica de Cascada: Si encontramos resultados en este idioma prioritario, paramos.
      if (newStreams.length > 0) {
        console.log(`[Embed69] Finalizando búsqueda tras encontrar resultados en: ${lang}`);
        break; 
      }
    }

    // 6. Procesar resultados finales a través del motor central
    return await finalizeStreams(streams, 'Embed69');
  } catch (e) {
    console.log(`[Embed69] Error: ${e.message}`);
    return [];
  }
}

