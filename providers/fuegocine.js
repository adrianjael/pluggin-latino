/**
 * fuegocine - Built from src/fuegocine/
 * Generated: 2026-04-08T23:16:29.356Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
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

// src/fuegocine/index.js
var fuegocine_exports = {};
__export(fuegocine_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(fuegocine_exports);
var import_axios2 = __toESM(require("axios"));

// src/utils/m3u8.js
var import_axios = __toESM(require("axios"));
function getQualityFromHeight(height) {
  if (!height)
    return "Auto";
  const h = parseInt(height);
  if (h >= 2160)
    return "4K";
  if (h >= 1440)
    return "1440p";
  if (h >= 1080)
    return "1080p";
  if (h >= 720)
    return "720p";
  if (h >= 480)
    return "480p";
  if (h >= 360)
    return "360p";
  return "240p";
}
function parseBestQuality(content) {
  const lines = content.split("\n");
  let bestHeight = 0;
  for (const line of lines) {
    if (line.includes("RESOLUTION=")) {
      const match = line.match(/RESOLUTION=\d+x(\d+)/);
      if (match) {
        const height = parseInt(match[1]);
        if (height > bestHeight)
          bestHeight = height;
      }
    }
  }
  return bestHeight > 0 ? getQualityFromHeight(bestHeight) : "720p";
}
function validateStream(stream) {
  return __async(this, null, function* () {
    if (!stream || !stream.url)
      return stream;
    const { url, headers } = stream;
    try {
      const response = yield import_axios.default.get(url, {
        timeout: 4e3,
        responseType: "text",
        headers: __spreadProps(__spreadValues({}, headers || {}), {
          "Accept": "*/*",
          "User-Agent": (headers == null ? void 0 : headers["User-Agent"]) || "Mozilla/5.0"
        })
      });
      if (response.data && typeof response.data === "string" && (url.includes(".m3u8") || response.data.includes("#EXTM3U"))) {
        const realQuality = parseBestQuality(response.data);
        return __spreadProps(__spreadValues({}, stream), {
          quality: realQuality,
          verified: true
          // <--- Marcamos como verificado
        });
      }
      return __spreadProps(__spreadValues({}, stream), { verified: true });
    } catch (error) {
      return __spreadProps(__spreadValues({}, stream), { verified: false });
    }
  });
}

// src/utils/sorting.js
var QUALITY_SCORE = {
  "4K": 100,
  "1440p": 90,
  "1080p": 80,
  "720p": 70,
  "480p": 60,
  "360p": 50,
  "240p": 40,
  "Auto": 30,
  "Unknown": 0
};
function sortStreamsByQuality(streams) {
  if (!Array.isArray(streams))
    return [];
  return [...streams].sort((a, b) => {
    const scoreA = QUALITY_SCORE[a.quality] || 0;
    const scoreB = QUALITY_SCORE[b.quality] || 0;
    if (scoreA === scoreB) {
      if (a.quality === "Auto")
        return 1;
      if (b.quality === "Auto")
        return -1;
    }
    return scoreB - scoreA;
  });
}

// src/utils/engine.js
function normalizeLanguage(lang) {
  const l = (lang || "").toLowerCase();
  if (l.includes("latino") || l.includes("lat"))
    return "Latino";
  if (l.includes("espa\xF1ol") || l.includes("castellano") || l.includes("esp"))
    return "Espa\xF1ol";
  if (l.includes("sub") || l.includes("vose"))
    return "Subtitulado";
  return lang || "Latino";
}
function normalizeServer(server) {
  if (!server)
    return "Servidor";
  const s = server.toLowerCase();
  if (s.includes("voe"))
    return "VOE";
  if (s.includes("filemoon"))
    return "Filemoon";
  if (s.includes("streamwish") || s.includes("awish") || s.includes("dwish"))
    return "StreamWish";
  if (s.includes("vidhide") || s.includes("dintezuvio"))
    return "VidHide";
  if (s.includes("waaw") || s.includes("netu"))
    return "Netu";
  if (s.includes("fastream"))
    return "Fastream";
  return server;
}
function finalizeStreams(streams, providerName) {
  return __async(this, null, function* () {
    if (!Array.isArray(streams) || streams.length === 0)
      return [];
    console.log(`[Engine] Processing ${streams.length} streams for ${providerName}...`);
    let validated = streams;
    try {
      const results = yield Promise.allSettled(
        streams.map((s) => validateStream(s))
      );
      validated = results.map(
        (r, i) => r.status === "fulfilled" ? r.value : streams[i]
      );
    } catch (e) {
      console.error(`[Engine] Validation error: ${e.message}`);
    }
    const sorted = sortStreamsByQuality(validated);
    return sorted.map((s) => {
      const q = s.quality || "HD";
      const lang = normalizeLanguage(s.langLabel || s.language);
      const server = normalizeServer(s.serverLabel || s.serverName || s.servername);
      const check = s.verified ? " \u2713" : "";
      return {
        name: providerName || s.name || "Provider",
        title: `${q}${check} \xB7 ${lang} \xB7 ${server}`,
        url: s.url,
        quality: q,
        headers: s.headers || {}
      };
    });
  });
}

// src/fuegocine/index.js
var BASE_URL = "https://www.fuegocine.com";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var SEARCH_BASE = `${BASE_URL}/feeds/posts/default?alt=json&max-results=10&q=`;
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var DEFAULT_HEADERS = {
  "User-Agent": UA,
  "Referer": `${BASE_URL}/`
};
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const type = mediaType === "movie" ? "movie" : "tv";
      const { data } = yield import_axios2.default.get(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`, { timeout: 5e3 });
      const title = type === "movie" ? data.title || data.original_title : data.name || data.original_name;
      const originalTitle = type === "movie" ? data.original_title || data.title : data.original_name || data.name;
      const year = (type === "movie" ? data.release_date || "" : data.first_air_date || "").slice(0, 4);
      return { title, originalTitle, year };
    } catch (e) {
      return { title: null };
    }
  });
}
function normalizeTitle(t) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function b64decode(str) {
  if (typeof atob !== "undefined")
    return atob(str);
  return Buffer.from(str, "base64").toString("binary");
}
function decodeUrl(url) {
  const b64Match = url.match(/[?&]r=([A-Za-z0-9+/=]+)/);
  if (b64Match) {
    try {
      const decoded = b64decode(b64Match[1]);
      return decodeUrl(decoded);
    } catch (e) {
      return url;
    }
  }
  const linkMatch = url.match(/[?&]link=([^&]+)/);
  if (linkMatch) {
    try {
      const decoded = decodeURIComponent(linkMatch[1]);
      return decodeUrl(decoded);
    } catch (e) {
      return url;
    }
  }
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([A-Za-z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.usercontent.google.com/download?id=${driveMatch[1]}&export=download&confirm=t`;
  }
  return url;
}
function extractLinks(html) {
  const links = [];
  const match = html.match(/const\s+_SV_LINKS\s*=\s*\[([\s\S]*?)\]\s*;/);
  if (!match)
    return links;
  const block = match[1];
  const entryRegex = /\{[\s\S]*?lang\s*:\s*["']([^"']+)["'][\s\S]*?name\s*:\s*["']([^"']+)["'][\s\S]*?quality\s*:\s*["']([^"']+)["'][\s\S]*?url\s*:\s*["']([^"']+)["'][\s\S]*?\}/g;
  let m;
  while ((m = entryRegex.exec(block)) !== null) {
    links.push({
      lang: m[1],
      name: m[2].replace(/&#9989;/g, "").replace(/&amp;/g, "&"),
      quality: m[3],
      url: decodeUrl(m[4])
    });
  }
  return links;
}
function resolveTurboVid(embedUrl) {
  return __async(this, null, function* () {
    try {
      const { data: html } = yield import_axios2.default.get(embedUrl, { headers: { Referer: BASE_URL }, timeout: 8e3 });
      const hashMatch = html.match(/data-hash="([^"]+\.m3u8[^"]*)"/);
      return hashMatch ? hashMatch[1] : embedUrl;
    } catch (e) {
      return embedUrl;
    }
  });
}
function resolveOkRu(embedUrl) {
  return __async(this, null, function* () {
    try {
      const { data: html } = yield import_axios2.default.get(embedUrl, { headers: { Referer: BASE_URL }, timeout: 8e3 });
      const hlsMatch = html.match(/ondemandHls\\&quot;:\\&quot;(https:[^\\&]+)/);
      return hlsMatch ? hlsMatch[1].replace(/\\\\/g, "\\").replace(/\\/g, "") : embedUrl;
    } catch (e) {
      return embedUrl;
    }
  });
}
function getHostLabel(url) {
  if (url.includes("drive.google.com") || url.includes("drive.usercontent.google.com"))
    return "Drive";
  if (url.includes("ok.ru"))
    return "OK.RU";
  if (url.includes("turbovid"))
    return "TurboVid";
  if (url.includes("vidnest"))
    return "VidNest";
  if (url.includes("voe.sx"))
    return "VOE";
  if (url.includes("vidsonic"))
    return "VidSonic";
  return "FC";
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    var _a, _b, _c, _d;
    try {
      const { title, originalTitle, year } = yield getTmdbInfo(tmdbId, mediaType);
      if (!title)
        return [];
      const searchTitle = season ? `${title} ${season}x${episode}` : title;
      const { data: searchJson } = yield import_axios2.default.get(SEARCH_BASE + encodeURIComponent(searchTitle), { timeout: 8e3 });
      const entries = ((_a = searchJson.feed) == null ? void 0 : _a.entry) || [];
      const streams = [];
      for (const entry of entries) {
        const entryTitle = ((_b = entry.title) == null ? void 0 : _b.$t) || "";
        const entryUrl = (_d = (_c = entry.link) == null ? void 0 : _c.find((l) => l.rel === "alternate")) == null ? void 0 : _d.href;
        if (!entryUrl)
          continue;
        const normEntry = normalizeTitle(entryTitle);
        const normTitle = normalizeTitle(title);
        if (!normEntry.includes(normTitle))
          continue;
        const { data: html } = yield import_axios2.default.get(entryUrl, { timeout: 8e3 });
        const links = extractLinks(html);
        for (const link of links) {
          let finalUrl = link.url;
          if (finalUrl.includes("turbovid"))
            finalUrl = yield resolveTurboVid(finalUrl);
          if (finalUrl.includes("ok.ru"))
            finalUrl = yield resolveOkRu(finalUrl);
          const host = getHostLabel(finalUrl);
          const isDrive = host === "Drive";
          streams.push(__spreadValues({
            langLabel: link.lang,
            serverLabel: host,
            url: finalUrl,
            quality: link.quality || "720p",
            headers: isDrive ? { "User-Agent": UA } : DEFAULT_HEADERS
          }, isDrive && { mimeType: "video/mp4" }));
        }
      }
      return yield finalizeStreams(streams, "FuegoCine");
    } catch (e) {
      console.error("[FuegoCine] error:", e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
