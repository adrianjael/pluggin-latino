/**
 * pelisgo - Built from src/pelisgo/
 * Generated: 2026-04-04T05:42:18.025Z
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

// src/pelisgo/index.js
var pelisgo_exports = {};
__export(pelisgo_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(pelisgo_exports);
var import_axios = __toESM(require("axios"));
var BASE = "https://pelisgo.online";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var PLAYER_ACTION_ID = "4079b11d214b588c12807d99b549e1851b3ee03082";
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
function extractMovieId(html) {
  var _a, _b, _c, _d;
  const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  if (nextMatch) {
    try {
      const data = JSON.parse(nextMatch[1]);
      const movie = ((_b = (_a = data.props) == null ? void 0 : _a.pageProps) == null ? void 0 : _b.movie) || ((_d = (_c = data.props) == null ? void 0 : _c.pageProps) == null ? void 0 : _d.serie);
      if (movie && movie.id)
        return movie.id;
    } catch (e) {
    }
  }
  const idMatch = html.match(/"id"\s*:\s*"([a-z0-9]{20,})"/);
  return idMatch ? idMatch[1] : null;
}
function extractEmbedUrls(componentText) {
  const urls = [];
  const iframeRegex = /src=["'](https?:\\?\/\\?\/[^"']+)["']/g;
  let m;
  while ((m = iframeRegex.exec(componentText)) !== null) {
    let url = m[1].replace(/\\/g, "");
    if (url.includes("pelisgo.online") || url.includes("filemoon") || url.includes("hqq") || url.includes("embedseek")) {
      urls.push(url);
    }
  }
  const desuMatch = componentText.match(/https?:\/\/desu\.pelisgo\.online\/embed\/[a-zA-Z0-9_-]+/);
  if (desuMatch)
    urls.push(desuMatch[0]);
  return [...new Set(urls)];
}
function getHostLabel(url) {
  if (url.includes("filemoon") || url.includes("magi"))
    return "Magi";
  if (url.includes("desu"))
    return "Desu";
  if (url.includes("hqq") || url.includes("netu"))
    return "Netu";
  if (url.includes("embedseek") || url.includes("seekstreaming"))
    return "Seek";
  return "Player";
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const { title, year } = yield getTmdbInfo(tmdbId, mediaType);
      if (!title)
        return [];
      const searchUrl = `${BASE}/search?q=${encodeURIComponent(title)}`;
      const { data: searchHtml } = yield import_axios.default.get(searchUrl, { headers: HEADERS });
      const slugMatch = searchHtml.match(new RegExp(`\\/(movies|series)\\/([a-z0-9\\-]+)`));
      if (!slugMatch)
        return [];
      const typeSlug = slugMatch[1];
      const slug = slugMatch[2];
      const pageUrl = typeSlug === "movies" ? `${BASE}/movies/${slug}` : `${BASE}/series/${slug}/temporada/${season}/episodio/${episode}`;
      const { data: pageHtml } = yield import_axios.default.get(pageUrl, { headers: HEADERS });
      const movieId = extractMovieId(pageHtml);
      if (!movieId)
        return [];
      const { data: actionResponse } = yield import_axios.default.post(pageUrl, JSON.stringify([movieId]), {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          "Content-Type": "text/plain;charset=UTF-8",
          "Accept": "text/x-component",
          "Next-Action": PLAYER_ACTION_ID
        }),
        timeout: 1e4
      });
      const embedUrls = extractEmbedUrls(actionResponse);
      const streams = [];
      for (const url of embedUrls) {
        const host = getHostLabel(url);
        streams.push({
          name: "PelisGo",
          title: `[LAT] ${host} \xB7 HD`,
          url,
          quality: "HD",
          headers: {
            "User-Agent": UA,
            "Referer": `${BASE}/`
          }
        });
      }
      return streams;
    } catch (e) {
      console.error("[PelisGo] error:", e.message);
      return [];
    }
  });
}
