/**
 * zonaleros - Built from src/zonaleros/
 * Generated: 2026-04-06T23:16:26.908Z
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
  getStreams: () => getStreams
});
module.exports = __toCommonJS(zonaleros_exports);

// src/zonaleros/extractor.js
function extractSearchResults(html) {
  const results = [];
  const articleRegex = /<article class="Anime alt B">([\s\S]*?)<\/article>/g;
  let artMatch;
  while ((artMatch = articleRegex.exec(html)) !== null) {
    const content = artMatch[1];
    const urlMatch = content.match(/href="([^"]+)"/);
    const imgMatch = content.match(/src="([^"]+)"/);
    const titleMatch = content.match(/<h3 class="Title"[^>]*>([\s\S]*?)<\/h3>/);
    if (urlMatch && titleMatch) {
      let url = urlMatch[1];
      if (url.startsWith("/"))
        url = `https://www.zona-leros.com${url}`;
      const title = titleMatch[1].replace(/<[^>]+>/g, "").trim();
      const poster = imgMatch ? imgMatch[1] : "";
      const type = url.includes("/series/") ? "series" : "movie";
      if (url.includes("/peliculas/") || url.includes("/series/")) {
        results.push({
          title,
          url,
          poster,
          type
        });
      }
    }
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
var UA = "Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36";
var HEADERS = {
  "User-Agent": UA,
  "Referer": BASE,
  "Accept-Language": "es-ES,es;q=0.9"
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
function cleanTitle(str) {
  if (!str)
    return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s\-]/gi, " ").replace(/\s+/g, " ").toLowerCase().trim();
}
function zonalerosSearch(query) {
  return __async(this, null, function* () {
    const searchStr = cleanTitle(query);
    if (!searchStr)
      return [];
    const url = `${BASE}/search?q=${encodeURIComponent(searchStr)}`;
    try {
      const res = yield fetch(url, { headers: HEADERS });
      const html = yield res.text();
      if (html.includes("cf-browser-verification") || html.includes("Checking your browser")) {
        console.error("[ZonaLeRoS] Bloqueo de Cloudflare detectado en la b\xFAsqueda.");
        return [];
      }
      return extractSearchResults(html);
    } catch (e) {
      console.error(`[ZonaLeRoS] Fallo en b\xFAsqueda: ${e.message}`);
      return [];
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      console.log(`[ZonaLeRoS] Iniciando extracci\xF3n: "${title}" (${mediaType})`);
      let results = [];
      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : "";
      const pureTitle = title.replace(/\(\d{4}\)/g, "").trim();
      if (year) {
        console.log(`[ZonaLeRoS] Capa A: Buscando "${pureTitle} ${year}"`);
        results = yield zonalerosSearch(`${pureTitle} ${year}`);
      }
      if (results.length === 0) {
        console.log(`[ZonaLeRoS] Capa B: Buscando "${pureTitle}"`);
        results = yield zonalerosSearch(pureTitle);
      }
      if (results.length === 0 && pureTitle !== title) {
        console.log(`[ZonaLeRoS] Capa C: Buscando "${title}"`);
        results = yield zonalerosSearch(title);
      }
      if (results.length === 0) {
        console.warn(`[ZonaLeRoS] No se encontraron coincidencias en ZonaLeRoS para: ${title}`);
        return [];
      }
      const targetType = mediaType === "tv" || mediaType === "series" ? "series" : "movie";
      let match = results.find((r) => r.type === targetType && cleanTitle(r.title).includes(cleanTitle(pureTitle))) || results.find((r) => r.type === targetType) || results[0];
      console.log(`[ZonaLeRoS] Seleccionando: "${match.title}" -> ${match.url}`);
      const itemRes = yield fetch(match.url, { headers: HEADERS });
      const itemHtml = yield itemRes.text();
      const meta = extractMetadata(itemHtml);
      const streams = [];
      for (let serverUrl of meta.servers) {
        serverUrl = serverUrl.replace(/\\/g, "").replace(/['"]/g, "");
        const realUrl = yield resolveAnomizador(serverUrl);
        if (!realUrl)
          continue;
        const lowUrl = realUrl.toLowerCase();
        let label = "Desconocido";
        if (lowUrl.includes("voe"))
          label = "VOE";
        else if (lowUrl.includes("streamtape"))
          label = "Streamtape";
        else if (lowUrl.includes("byse"))
          label = "Byse (Dual)";
        else if (lowUrl.includes("mega"))
          label = "MEGA (Descarga)";
        else if (lowUrl.includes("1fichier"))
          label = "1Fichier";
        else if (lowUrl.includes("mediafire"))
          label = "Mediafire";
        streams.push({
          name: "ZonaLeRoS",
          title: `[Directo] \xB7 ${label}`,
          url: realUrl,
          quality: "HD",
          isM3U8: lowUrl.includes(".m3u8")
        });
      }
      return streams;
    } catch (e) {
      console.error(`[ZonaLeRoS] Error Global: ${e.message}`);
      return [];
    }
  });
}
if (typeof module !== "undefined") {
  module.exports = { getStreams };
}
