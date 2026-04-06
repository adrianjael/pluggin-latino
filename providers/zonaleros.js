/**
 * zonaleros - Built from src/zonaleros/
 * Generated: 2026-04-06T22:47:05.798Z
 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/zonaleros/index.js
var zonaleros_exports = {};
__export(zonaleros_exports, {
  getStreams: () => getStreams,
  search: () => search
});
module.exports = __toCommonJS(zonaleros_exports);

// src/zonaleros/extractor.js
function extractSearchResults(html) {
  const results = [];
  const itemRegex = /<article class="Anime alt B">[\s\S]*?<a href="(https:\/\/www\.zona-leros\.com\/(peliculas|series)\/[^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<h3 class="Title"[^>]*>([\s\S]*?)<\/h3>/g;
  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const [_, url, type, poster, title] = match;
    results.push({
      title: title.replace(/<[^>]+>/g, "").trim(),
      url,
      poster,
      type: type === "peliculas" ? "movie" : "series"
    });
  }
  return results;
}
function extractMetadata(html) {
  const metadata = {
    title: "",
    poster: "",
    synopsis: "",
    servers: []
  };
  const titleMatch = html.match(/<h1 class="Title">([\s\S]*?)<\/h1>/);
  if (titleMatch)
    metadata.title = titleMatch[1].replace(/online hd/i, "").trim();
  const posterMatch = html.match(/<div class="AnimeCover[\s\S]*?<img src="([^"]+)"/);
  if (posterMatch)
    metadata.poster = posterMatch[1];
  const synopsisMatch = html.match(/<div class="Description">([\s\S]*?)(<p>Avatar: Fuego y cenizas por mega|<\/div>)/);
  if (synopsisMatch)
    metadata.synopsis = synopsisMatch[1].replace(/<[^>]+>/g, "").trim();
  const scriptRegex = /video\d+\[\d+\] = '<iframe[^>]*src="([^"]+)"[^>]*><\/iframe>';/g;
  let sMatch;
  while ((sMatch = scriptRegex.exec(html)) !== null) {
    metadata.servers.push(sMatch[1]);
  }
  return metadata;
}

// src/zonaleros/index.js
var BASE = "https://www.zona-leros.com";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var HEADERS = {
  "User-Agent": UA,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Referer": BASE,
  "Upgrade-Insecure-Requests": "1"
};
function resolveAnomizador(url) {
  return __async(this, null, function* () {
    if (!url.includes("anomizador.zona-leros.com"))
      return url;
    try {
      const res = yield fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": UA, "Referer": BASE }
      });
      return res.url;
    } catch (e) {
      console.error("Anomizador Error:", e);
      return url;
    }
  });
}
function search(query) {
  return __async(this, null, function* () {
    try {
      const searchUrl = `${BASE}/search?q=${encodeURIComponent(query)}`;
      const res = yield fetch(searchUrl, { headers: HEADERS });
      const html = yield res.text();
      if (html.includes("cf-browser-verification")) {
        console.error("ZonaLeros: Bloqueado por Cloudflare");
        return [];
      }
      return extractSearchResults(html);
    } catch (e) {
      console.error("Zonaleros Search Error:", e);
      return [];
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      console.log(`[ZonaLeRoS] Buscando streams para: "${title}" (${mediaType})`);
      const results = yield search(title);
      if (results.length === 0) {
        console.warn(`[ZonaLeRoS] No se encontraron resultados para: ${title}`);
        return [];
      }
      const targetType = mediaType === "tv" || mediaType === "series" ? "series" : "movie";
      const bestMatch = results.find((r) => r.type === targetType) || results[0];
      const res = yield fetch(bestMatch.url, { headers: HEADERS });
      const html = yield res.text();
      const metadata = extractMetadata(html);
      const streams = [];
      for (let serverUrl of metadata.servers) {
        serverUrl = serverUrl.replace(/\\/g, "").replace(/['"]/g, "");
        const realUrl = yield resolveAnomizador(serverUrl);
        let label = "Desconocido";
        const lowUrl = realUrl.toLowerCase();
        if (lowUrl.includes("voe"))
          label = "VOE";
        else if (lowUrl.includes("streamtape"))
          label = "Streamtape";
        else if (lowUrl.includes("byse"))
          label = "Byse (Dual)";
        else if (lowUrl.includes("mega"))
          label = "MEGA (Descarga)";
        else if (lowUrl.includes("1fichier"))
          label = "1Fichier (Descarga)";
        else if (lowUrl.includes("mediafire"))
          label = "Mediafire (Descarga)";
        if (realUrl) {
          streams.push({
            name: "ZonaLeRoS",
            title: `[Directo] \xB7 ${label}`,
            url: realUrl,
            quality: "HD",
            isM3U8: lowUrl.includes(".m3u8")
          });
        }
      }
      return streams;
    } catch (e) {
      console.error("Zonaleros Streams Error:", e);
      return [];
    }
  });
}
if (typeof module !== "undefined") {
  module.exports = { getStreams };
}
