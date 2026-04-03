/**
 * pelisplus - Built from src/pelisplus/
 * Generated: 2026-04-03T15:39:39.285Z
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
function fetchHtml(url, referer) {
  return __async(this, null, function* () {
    try {
      const response = yield fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36",
          "Referer": referer || BASE_URL,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
        }
      });
      if (!response.ok)
        throw new Error(`HTTP Error: ${response.status}`);
      return yield response.text();
    } catch (error) {
      console.error(`[PelisPlusHD] fetchHtml error: ${error.message}`);
      return "";
    }
  });
}

// src/pelisplus/extractor.js
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));
function unpackEval(payload, radix, symtab) {
  return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function(match) {
    let result = 0;
    const digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < match.length; i++) {
      let pos = digits.indexOf(match[i]);
      if (pos === -1 || pos >= radix)
        return match;
      result = result * radix + pos;
    }
    if (result >= symtab.length)
      return match;
    return symtab[result] && symtab[result] !== "" ? symtab[result] : match;
  });
}
function resolveStreamwish(embedUrl) {
  return __async(this, null, function* () {
    try {
      const body = yield fetchHtml(embedUrl);
      const packMatch = body.match(/eval\(function\(p,a,c,k,e,[^)]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
      if (packMatch) {
        const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
        const m3u8 = unpacked.match(/"?hls[234]"?\s*[:=]\s*"?([^"'\s,]+\.m3u8[^"'\s]*)"?/i) || unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (m3u8)
          return m3u8[1] || m3u8[0];
      }
      const rawM3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
      return rawM3u8 ? rawM3u8[0] : embedUrl;
    } catch (e) {
      return embedUrl;
    }
  });
}
function resolveVidhide(embedUrl) {
  return __async(this, null, function* () {
    try {
      const body = yield fetchHtml(embedUrl);
      const packMatch = body.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
      if (packMatch) {
        const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
        const m3u8 = unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (m3u8)
          return m3u8[0];
      }
      return embedUrl;
    } catch (e) {
      return embedUrl;
    }
  });
}
function getTmdbTitle(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
      const html = yield fetchText(url);
      const $ = import_cheerio_without_node_native.default.load(html);
      const title = $(".title h2 a").text().trim();
      return title;
    } catch (error) {
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
      if (!movieUrl)
        return [];
      if (mediaType === "tv") {
        movieUrl = movieUrl.replace("/serie/", "/episodio/") + `-${season}x${episode}`;
      }
      const pageHtml = yield fetchText(movieUrl);
      const $page = import_cheerio_without_node_native.default.load(pageHtml);
      const rawResults = [];
      $page("li.playurl").each((i, el) => {
        const serverUrl = $page(el).attr("data-url");
        const serverName = $page(el).find("a").text().trim();
        const language = $page(el).attr("data-name");
        if (serverUrl && language === "Espa\xF1ol Latino") {
          rawResults.push({ serverUrl, serverName, language });
        }
      });
      const streams = yield Promise.all(rawResults.map((res) => __async(this, null, function* () {
        let finalUrl = res.serverUrl;
        if (finalUrl.includes("streamwish") || finalUrl.includes("strwish") || finalUrl.includes("wishembed")) {
          finalUrl = yield resolveStreamwish(finalUrl);
        } else if (finalUrl.includes("vidhide") || finalUrl.includes("dintezuvio")) {
          finalUrl = yield resolveVidhide(finalUrl);
        }
        return {
          name: "PelisPlusHD",
          title: `${res.serverName} (Latino)`,
          url: finalUrl,
          quality: "HD",
          headers: {
            "Referer": res.serverUrl,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36"
          }
        };
      })));
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
