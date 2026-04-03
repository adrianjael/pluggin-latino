/**
 * tioplus - Built from src/tioplus/
 * Generated: 2026-04-03T20:40:36.687Z
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

// src/tioplus/index.js
var tioplus_exports = {};
__export(tioplus_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(tioplus_exports);

// src/tioplus/extractor.js
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));

// src/tioplus/http.js
var BASE_URL = "https://tioplus.app";
var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var COMMON_HEADERS = {
  "User-Agent": DEFAULT_UA,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache"
};
function fetchText(_0) {
  return __async(this, arguments, function* (url, referer = BASE_URL) {
    try {
      const headers = __spreadValues({}, COMMON_HEADERS);
      if (referer)
        headers["Referer"] = referer;
      const response = yield fetch(url, { headers, timeout: 1e4 });
      if (!response.ok) {
        console.warn(`[TioPlus HTTP] Error ${response.status} en ${url}`);
        return "";
      }
      return yield response.text();
    } catch (error) {
      console.error(`[TioPlus HTTP] Fetch error: ${error.message} (${url})`);
      return "";
    }
  });
}
function fetchHtml(url, referer) {
  return __async(this, null, function* () {
    return fetchText(url, referer);
  });
}

// src/utils/string.js
function normalizeTitle(t) {
  if (!t)
    return "";
  return t.toLowerCase().replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o").replace(/[úùüû]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function calculateSimilarity(title1, title2) {
  const norm1 = normalizeTitle(title1);
  const norm2 = normalizeTitle(title2);
  if (norm1 === norm2)
    return 1;
  if (norm1.length > 5 && norm2.length > 5 && (norm2.includes(norm1) || norm1.includes(norm2)))
    return 0.9;
  const words1 = new Set(norm1.split(/\s+/).filter((w) => w.length > 2));
  const words2 = new Set(norm2.split(/\s+/).filter((w) => w.length > 2));
  if (words1.size === 0 || words2.size === 0) {
    return norm1 === norm2 ? 1 : norm1.includes(norm2) || norm2.includes(norm1) ? 0.5 : 0;
  }
  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = /* @__PURE__ */ new Set([...words1, ...words2]);
  return intersection.size / union.size;
}
function isGoodMatch(query, result, minScore = 0.4) {
  return calculateSimilarity(query, result) >= minScore;
}

// src/tioplus/extractor.js
function resolveTioPlusPlayer(playerId) {
  return __async(this, null, function* () {
    try {
      const playerUrl = `${BASE_URL}/player/${playerId}`;
      const body = yield fetchHtml(playerUrl, BASE_URL);
      const iframeMatch = body.match(/<iframe.*?src=["'](https?:\/\/[^"']+)["']/i);
      if (iframeMatch)
        return iframeMatch[1];
      const scriptMatch = body.match(/window\.location\.href\s*=\s*['"](https?:\/\/[^'"]+)['"]/i);
      if (scriptMatch)
        return scriptMatch[1];
      const directMatch = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i) || body.match(/https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*/i);
      if (directMatch)
        return directMatch[0].replace(/\\/g, "");
      return null;
    } catch (e) {
      return null;
    }
  });
}
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    var _a;
    try {
      const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
      const html = yield fetchText(url);
      const $ = import_cheerio_without_node_native.default.load(html);
      return {
        title: $(".title h2 a").text().trim() || "",
        year: ((_a = $(".release_date").text().match(/\d{4}/)) == null ? void 0 : _a[0]) || null
      };
    } catch (error) {
      return null;
    }
  });
}
function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
  return __async(this, null, function* () {
    console.log(`[TioPlus] Extracting: ${providedTitle || tmdbId} (${mediaType}) S${season}E${episode}`);
    try {
      let searchTitle = providedTitle;
      if (!searchTitle) {
        const tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
        if (tmdbInfo)
          searchTitle = tmdbInfo.title;
      }
      if (!searchTitle)
        return [];
      const searchUrl = `${BASE_URL}/api/search/${encodeURIComponent(searchTitle)}`;
      const searchHtml = yield fetchText(searchUrl);
      const $search = import_cheerio_without_node_native.default.load(searchHtml);
      const results = [];
      $search("article.item").each((i, el) => {
        const $el = $search(el);
        const title = $el.find("h2").text().trim();
        const href = $el.find("a.itemA").attr("href");
        const type = $el.find("span.typeItem").text().toLowerCase();
        results.push({ title, href, type });
      });
      const targetType = mediaType === "movie" ? "pelicula" : "serie";
      let match = results.find((r) => calculateSimilarity(searchTitle, r.title) > 0.9 && r.type.includes(targetType));
      if (!match) {
        match = results.find((r) => isGoodMatch(searchTitle, r.title) && r.type.includes(targetType));
      }
      if (!match)
        return [];
      let contentUrl = match.href.startsWith("http") ? match.href : `${BASE_URL}${match.href}`;
      if (mediaType === "tv") {
        contentUrl = `${contentUrl}/season/${season}/episode/${episode}`;
      }
      const pageHtml = yield fetchText(contentUrl);
      const $page = import_cheerio_without_node_native.default.load(pageHtml);
      const serverItems = [];
      $page('li[role="presentation"]').each((i, el) => {
        const dataId = $page(el).attr("data-id");
        const name = $page(el).find("span").first().text().trim();
        if (dataId) {
          serverItems.push({ dataId, name });
        }
      });
      const streamPromises = serverItems.map((item) => __async(this, null, function* () {
        if (item.name.toLowerCase().includes("goodstream"))
          return null;
        const resolvedUrl = yield resolveTioPlusPlayer(item.dataId);
        if (!resolvedUrl)
          return null;
        if (!resolvedUrl.includes(".m3u8") && !resolvedUrl.includes(".mp4")) {
          return null;
        }
        return {
          name: "TioPlus",
          title: `${item.name} (Latino) HD`,
          url: resolvedUrl,
          quality: "HD",
          headers: {
            "Referer": `${BASE_URL}/`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
          }
        };
      }));
      const playerResults = yield Promise.all(streamPromises);
      return playerResults.filter((s) => s !== null);
    } catch (error) {
      console.error(`[TioPlus] Global Error: ${error.message}`);
      return [];
    }
  });
}

// src/tioplus/index.js
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    return yield extractStreams(tmdbId, mediaType, season, episode, title);
  });
}
