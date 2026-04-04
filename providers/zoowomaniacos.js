/**
 * zoowomaniacos - Built from src/zoowomaniacos/
 * Generated: 2026-04-04T04:27:34.510Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/zoowomaniacos/index.js
var zoowomaniacos_exports = {};
__export(zoowomaniacos_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(zoowomaniacos_exports);
var import_axios2 = __toESM(require("axios"));

// src/resolvers/okru.js
var import_axios = __toESM(require("axios"));
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function resolve(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[OkRu] Resolviendo: ${embedUrl}`);
      const { data: raw } = yield import_axios.default.get(embedUrl, {
        timeout: 1e4,
        headers: {
          "User-Agent": UA,
          "Accept": "text/html",
          "Referer": "https://ok.ru/"
        }
      });
      if (raw.includes("copyrightsRestricted") || raw.includes("COPYRIGHTS_RESTRICTED") || raw.includes("LIMITED_ACCESS") || raw.includes("notFound") || !raw.includes("urls")) {
        console.log("[OkRu] Video no disponible o eliminado");
        return null;
      }
      const data = raw.replace(/\\&quot;/g, '"').replace(/\\u0026/g, "&").replace(/\\/g, "");
      const matches = [...data.matchAll(/"name":"([^"]+)","url":"([^"]+)"/g)];
      const QUALITY_ORDER = ["full", "hd", "sd", "low", "lowest"];
      const videos = matches.map((m) => ({ type: m[1], url: m[2] })).filter((v) => !v.type.toLowerCase().includes("mobile") && v.url.startsWith("http"));
      if (videos.length === 0) {
        console.log("[OkRu] No se encontraron URLs");
        return null;
      }
      const sorted = videos.sort((a, b) => {
        const ai = QUALITY_ORDER.findIndex((q) => a.type.toLowerCase().includes(q));
        const bi = QUALITY_ORDER.findIndex((q) => b.type.toLowerCase().includes(q));
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      const best = sorted[0];
      console.log(`[OkRu] URL encontrada (${best.type}): ${best.url.substring(0, 80)}...`);
      const QUALITY_MAP = { full: "1080p", hd: "720p", sd: "480p", low: "360p", lowest: "240p" };
      return {
        url: best.url,
        quality: QUALITY_MAP[best.type] || best.type,
        headers: { "User-Agent": UA, "Referer": "https://ok.ru/" }
      };
    } catch (e) {
      console.log(`[OkRu] Error: ${e.message}`);
      return null;
    }
  });
}

// src/zoowomaniacos/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE_URL = "https://proyectox.yoyatengoabuela.com";
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
var HEADERS = {
  "User-Agent": UA2,
  "Accept": "application/json, text/javascript, */*",
  "Connection": "keep-alive",
  "Referer": BASE_URL + "/",
  "Origin": BASE_URL,
  "X-Requested-With": "XMLHttpRequest"
};
var OKRU_BLACKLIST = ["332656282246", "1683045747235"];
function getTmdbData(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const attempts = [{ lang: "es-MX" }, { lang: "en-US" }];
    for (const { lang } of attempts) {
      try {
        const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=${lang}`;
        const { data } = yield import_axios2.default.get(url, { timeout: 5e3, headers: { "User-Agent": UA2 } });
        const title = mediaType === "movie" ? data.title : data.name;
        const originalTitle = mediaType === "movie" ? data.original_title : data.original_name;
        return { title, originalTitle, year: (data.release_date || "").substring(0, 4) };
      } catch (e) {
      }
    }
    return null;
  });
}
function searchMovie(query) {
  return __async(this, null, function* () {
    try {
      const { data } = yield import_axios2.default.post(
        `${BASE_URL}/alternativo3/server.php`,
        new URLSearchParams({
          "start": "0",
          "length": "10",
          "metodo": "ObtenerListaTotal",
          "search[value]": query,
          "searchPanes[a3][0]": "",
          "searchPanes[a4][0]": "",
          "searchPanes[a5][0]": "",
          "searchPanes[a6][0]": ""
        }),
        { timeout: 8e3, headers: HEADERS }
      );
      return (data == null ? void 0 : data.data) || [];
    } catch (e) {
      return [];
    }
  });
}
function selectBestResult(results, tmdbInfo) {
  if (results.length === 0)
    return null;
  const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const targetTitle = normalize(tmdbInfo.title);
  const scored = results.map((r) => {
    const rTitle = normalize((r.a2 || "").split("-")[0].trim());
    let score = 0;
    if (rTitle === targetTitle)
      score += 3;
    if (tmdbInfo.year && r.a4 === tmdbInfo.year)
      score += 1;
    return { r, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].r;
}
function getEmbeds(id) {
  return __async(this, null, function* () {
    try {
      const { data: html } = yield import_axios2.default.get(`${BASE_URL}/testplayer.php?id=${id}`, {
        timeout: 8e3,
        headers: { "User-Agent": UA2, "Accept": "text/html", "Referer": BASE_URL + "/" }
      });
      const matches = [...html.matchAll(/src="(https?:\/\/[^"]+)"/g)];
      const urls = [...new Set(matches.map((m) => m[1]))];
      const okru = urls.filter((url) => {
        if (!url.includes("ok.ru/videoembed/"))
          return false;
        const okId = url.split("/").pop();
        return !OKRU_BLACKLIST.includes(okId);
      });
      const archive = urls.filter((url) => url.includes("archive.org") && (url.endsWith(".mp4") || url.endsWith(".mkv")));
      return { okru, archive };
    } catch (e) {
      return { okru: [], archive: [] };
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    if (!tmdbId || mediaType !== "movie")
      return [];
    const startTime = Date.now();
    try {
      const tmdbInfo = yield getTmdbData(tmdbId, mediaType);
      if (!tmdbInfo)
        return [];
      const results = yield searchMovie(tmdbInfo.title);
      const selected = selectBestResult(results, tmdbInfo);
      if (!selected)
        return [];
      const { okru: embedUrls, archive: archiveUrls } = yield getEmbeds(selected.a1);
      const streams = [];
      if (embedUrls.length > 0) {
        const results2 = yield Promise.allSettled(embedUrls.map((url) => resolve(url)));
        results2.filter((r) => r.status === "fulfilled" && r.value).forEach((r) => streams.push({
          name: "Zoowomaniacos",
          title: `${r.value.quality} \xB7 OkRu`,
          url: r.value.url,
          quality: r.value.quality,
          headers: r.value.headers || {}
        }));
      }
      for (const url of archiveUrls) {
        streams.push({
          name: "Zoowomaniacos",
          title: "SD \xB7 Archive.org",
          url,
          quality: "SD",
          headers: { "User-Agent": UA2 }
        });
      }
      return streams;
    } catch (e) {
      return [];
    }
  });
}
