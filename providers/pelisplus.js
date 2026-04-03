/**
 * pelisplus - Built from src/pelisplus/
 * Generated: 2026-04-03T15:07:45.491Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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

// src/pelisplus/http.js
var BASE_URL = "https://www.pelisplushd.la";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
  "Referer": BASE_URL,
  "Origin": BASE_URL,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,nextjs/j,nextjs/m,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
};
function fetchText(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    try {
      const response = yield fetch(url, __spreadValues({
        headers: __spreadValues(__spreadValues({}, HEADERS), options.headers)
      }, options));
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status} for ${url}`);
      }
      return yield response.text();
    } catch (error) {
      console.error(`[PelisPlusHD] Fetch error: ${error.message}`);
      throw error;
    }
  });
}

// src/pelisplus/extractor.js
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));
function getTmdbTitle(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
      const html = yield fetchText(url);
      const $ = import_cheerio_without_node_native.default.load(html);
      const title = $(".title h2 a").text().trim();
      console.log(`[PelisPlusHD] TMDB Title found: ${title}`);
      return title;
    } catch (error) {
      console.error(`[PelisPlusHD] Error fetching TMDB title: ${error.message}`);
      return null;
    }
  });
}
function extractStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitle(tmdbId, mediaType);
      if (!title)
        return [];
      const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(title)}`;
      const searchHtml = yield fetchText(searchUrl);
      const $search = import_cheerio_without_node_native.default.load(searchHtml);
      let movieUrl = null;
      $search("a.Posters-link").each((i, el) => {
        const resultTitle = $search(el).attr("data-title") || "";
        if (resultTitle.toLowerCase().includes(title.toLowerCase())) {
          movieUrl = BASE_URL + $search(el).attr("href");
          return false;
        }
      });
      if (!movieUrl) {
        console.log(`[PelisPlusHD] No results found for: ${title}`);
        return [];
      }
      if (mediaType === "tv") {
        movieUrl = movieUrl.replace("/serie/", "/episodio/") + `-${season}x${episode}`;
      }
      console.log(`[PelisPlusHD] Fetching page: ${movieUrl}`);
      const pageHtml = yield fetchText(movieUrl);
      const $page = import_cheerio_without_node_native.default.load(pageHtml);
      const streams = [];
      $page("li.playurl").each((i, el) => {
        const serverUrl = $page(el).attr("data-url");
        const serverName = $page(el).find("a").text().trim();
        const language = $page(el).attr("data-name");
        if (serverUrl && language === "Espa\xF1ol Latino") {
          streams.push({
            name: "PelisPlusHD",
            title: `${serverName} (${language})`,
            url: serverUrl,
            quality: "HD",
            headers: {
              "Referer": movieUrl
            }
          });
        }
      });
      return streams;
    } catch (error) {
      console.error(`[PelisPlusHD] Extraction error: ${error.message}`);
      return [];
    }
  });
}

// src/pelisplus/index.js
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[PelisPlusHD] Request: ${mediaType} ${tmdbId}`);
      const streams = yield extractStreams(tmdbId, mediaType, season, episode);
      if (streams.length === 0) {
        console.log(`[PelisPlusHD] No matches found for ${tmdbId}`);
      }
      return streams;
    } catch (error) {
      console.error(`[PelisPlusHD] Fatal Error in index: ${error.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
