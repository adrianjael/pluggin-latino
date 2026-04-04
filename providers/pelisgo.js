/**
 * pelisgo - Built from src/pelisgo/
 * Generated: 2026-04-04T04:49:41.978Z
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

// src/pelisgo/index.js
var pelisgo_exports = {};
__export(pelisgo_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(pelisgo_exports);
var import_axios = __toESM(require("axios"));
var BASE = "https://pelisgo.online";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var HEADERS = {
  "User-Agent": UA,
  "Accept-Language": "es-ES,es;q=0.9",
  "Referer": `${BASE}/`
};
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const type = mediaType === "movie" ? "movie" : "tv";
      const { data } = yield import_axios.default.get(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`);
      return {
        title: type === "movie" ? data.title : data.name,
        year: (type === "movie" ? data.release_date || "" : data.first_air_date || "").slice(0, 4)
      };
    } catch (e) {
      return { title: null };
    }
  });
}
function resolveBuzzheavier(id) {
  return __async(this, null, function* () {
    try {
      const dlUrl = `https://buzzheavier.com/${id}/download`;
      const { headers } = yield import_axios.default.get(dlUrl, {
        headers: { "User-Agent": UA, "HX-Request": "true", "Referer": `https://buzzheavier.com/${id}` },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });
      return headers["hx-redirect"] || null;
    } catch (e) {
      return null;
    }
  });
}
function resolveOneId(id) {
  return __async(this, null, function* () {
    var _a;
    try {
      const { data } = yield import_axios.default.get(`${BASE}/api/download/${id}`, { headers: HEADERS });
      if (!(data == null ? void 0 : data.url))
        return null;
      let finalUrl = data.url;
      if (finalUrl.includes("buzzheavier.com")) {
        const bhId = (_a = finalUrl.match(/buzzheavier\.com\/([^/?&#]+)/)) == null ? void 0 : _a[1];
        finalUrl = bhId ? yield resolveBuzzheavier(bhId) : finalUrl;
      }
      return finalUrl ? {
        server: data.server || "PelisGo",
        quality: data.quality || "720p",
        language: data.language || "LAT",
        url: finalUrl
      } : null;
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const { title, year } = yield getTmdbInfo(tmdbId, mediaType);
      if (!title)
        return [];
      const searchUrl = `${BASE}/search?q=${encodeURIComponent(title)}`;
      const { data: html } = yield import_axios.default.get(searchUrl, { headers: HEADERS });
      const slugMatch = html.match(new RegExp(`\\/(movies|series)\\/([a-z0-9\\-]+)`));
      if (!slugMatch)
        return [];
      const slug = slugMatch[2];
      const pageUrl = mediaType === "movie" ? `${BASE}/movies/${slug}` : `${BASE}/series/${slug}/temporada/${season}/episodio/${episode}`;
      const { data: pageHtml } = yield import_axios.default.get(pageUrl, { headers: HEADERS });
      const ids = [...pageHtml.matchAll(/\/download\/([a-z0-9]+)/g)].map((m) => m[1]);
      const streamResults = yield Promise.all(ids.map((id) => resolveOneId(id)));
      const finalStreams = streamResults.filter((s) => s !== null);
      return finalStreams.map((s) => ({
        name: "PelisGo",
        title: `[${s.language.toUpperCase()}] ${s.server} \xB7 ${s.quality}`,
        url: s.url,
        quality: s.quality,
        headers: HEADERS
      }));
    } catch (e) {
      console.error("[PelisGo] error:", e.message);
      return [];
    }
  });
}
