/**
 * embed69 - Built from src/embed69/
 * Generated: 2026-04-14T15:32:36.263Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// src/utils/id_mapper.js
var require_id_mapper = __commonJS({
  "src/utils/id_mapper.js"(exports2, module2) {
    var axios2 = require("axios");
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var SERIES_MAPPINGS = {
      // Scrubs Offset Case
      "tt40197357": {
        replacementId: "tt0285403",
        title: "Scrubs",
        offset: 9
      }
    };
    var ID_CACHE = /* @__PURE__ */ new Map();
    function getCorrectImdbId2(tmdbId, mediaType) {
      return __async(this, null, function* () {
        const realId = tmdbId ? tmdbId.toString().split(":")[0] : "";
        if (!realId)
          return { imdbId: null, offset: 0, title: null };
        const cacheKey = `${mediaType}_${realId}`;
        if (ID_CACHE.has(cacheKey)) {
          return ID_CACHE.get(cacheKey);
        }
        const mapping = SERIES_MAPPINGS[realId];
        if (mapping && mapping.replacementId) {
          const res = {
            imdbId: mapping.replacementId,
            offset: mapping.offset || 0,
            title: mapping.title || null,
            fromMapping: true
          };
          ID_CACHE.set(cacheKey, res);
          return res;
        }
        if (realId.startsWith("tt")) {
          const res = { imdbId: realId, offset: 0, fromMapping: false };
          ID_CACHE.set(cacheKey, res);
          return res;
        }
        try {
          const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
          const tmdbUrl = `https://www.themoviedb.org/${type}/${realId}?language=es-MX`;
          console.log(`[ID Mapper] Scraping TMDB: ${tmdbUrl}`);
          const { data: html } = yield axios2.get(tmdbUrl, {
            timeout: 8e3,
            headers: {
              "User-Agent": UA2,
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
            }
          });
          let imdbMatch = html.match(/"imdb_id"\s*:\s*"(tt\d+)"/i) || html.match(/href="[^"]*?external_id=(tt\d+)[^"]*?"/i) || html.match(/imdb.com\/title\/(tt\d+)/i);
          let imdbId = imdbMatch ? imdbMatch[1] : null;
          if (!imdbId) {
            console.log(`[ID Mapper] \u{1F504} Scraping fallido, intentando API de TMDB...`);
            try {
              const apiKey = "439c478a771f35c05022f9feabcca01c";
              const type2 = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
              const apiUrl = `https://api.themoviedb.org/3/${type2}/${tmdbId}/external_ids?api_key=${apiKey}`;
              const apiRes = yield axios2.get(apiUrl, { timeout: 5e3 }).catch(() => null);
              if (apiRes && apiRes.data && apiRes.data.imdb_id) {
                imdbId = apiRes.data.imdb_id;
                console.log(`[ID Mapper] \u2705 IMDb ID obtenido v\xEDa API: ${imdbId}`);
              }
            } catch (apiErr) {
              console.log(`[ID Mapper] \u274C Fallo tambi\xE9n en API: ${apiErr.message}`);
            }
          }
          const titleMatch = html.match(/<title>([^<]+?)\s+[—-]\s+The\s+Movie\s+Database/i) || html.match(/<h2[^>]*><a[^>]*>([^<]+)<\/a>/i) || html.match(/"title":"([^"]+)"/i) || html.match(/"name":"([^"]+)"/i);
          const title = titleMatch ? titleMatch[1].trim() : null;
          const yearMatch = html.match(/class="release_date">\((\d{4})\)<\/span>/i) || html.match(/"release_date":"(\d{4})/i) || html.match(/"first_air_date":"(\d{4})/i);
          const year = yearMatch ? yearMatch[1] : null;
          const res = {
            imdbId,
            title,
            year,
            offset: 0,
            fromMapping: false
          };
          if (imdbId && !res.fromMapping)
            console.log(`[ID Mapper] \u2713 IMDb ID final: ${imdbId}`);
          if (title)
            console.log(`[ID Mapper] \u2713 Metadatos: ${title} (${year || "?"})`);
          ID_CACHE.set(cacheKey, res);
          return res;
        } catch (e) {
          console.log(`[ID Mapper] \u274C Error cr\xEDtico: ${e.message}`);
          return { imdbId: null, title: null, year: null, offset: 0, fromMapping: false };
        }
      });
    }
    module2.exports = { getCorrectImdbId: getCorrectImdbId2, SERIES_MAPPINGS };
  }
});

// src/utils/ua.js
var require_ua = __commonJS({
  "src/utils/ua.js"(exports2, module2) {
    var UA_POOL = [
      // Windows - Chrome 146 (Custom modern fingerprint)
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
    ];
    function getRandomUA() {
      const index = Math.floor(Math.random() * UA_POOL.length);
      return UA_POOL[index];
    }
    module2.exports = { getRandomUA, UA_POOL };
  }
});

// src/utils/http.js
var require_http = __commonJS({
  "src/utils/http.js"(exports2, module2) {
    var axios2 = require("axios");
    var { getRandomUA } = require_ua();
    var DEFAULT_CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";
    var sessionUA = null;
    function setSessionUA(ua) {
      sessionUA = ua;
    }
    function getSessionUA() {
      return sessionUA || DEFAULT_CHROME_UA;
    }
    function getStealthHeaders() {
      return {
        "User-Agent": getSessionUA(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6",
        "sec-ch-ua": '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      };
    }
    var DEFAULT_UA = getSessionUA();
    var MOBILE_UA = getSessionUA();
    function request(url, options) {
      return __async(this, null, function* () {
        var opt = options || {};
        var currentUA = opt.headers && opt.headers["User-Agent"] ? opt.headers["User-Agent"] : getSessionUA();
        var headers = Object.assign({
          "User-Agent": currentUA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
        }, opt.headers);
        try {
          var timeoutMs = opt.timeout || 5e3;
          var controller = new AbortController();
          var timeoutId = setTimeout(() => {
            controller.abort();
          }, timeoutMs);
          var fetchOptions = Object.assign({
            redirect: opt.redirect || "follow"
          }, opt, {
            headers,
            signal: controller.signal
          });
          var response = yield fetch(url, fetchOptions);
          clearTimeout(timeoutId);
          if (opt.redirect === "manual" && (response.status === 301 || response.status === 302)) {
            const redirectUrl = response.headers.get("location");
            console.log(`[HTTP] Redirecci\xF3n detectada (Manual): ${redirectUrl}`);
            return { status: response.status, redirectUrl, ok: false };
          }
          if (!response.ok && !opt.ignoreErrors) {
            console.warn("[HTTP] Error " + response.status + " en " + url);
          }
          return response;
        } catch (error) {
          console.error("[HTTP] Error en " + url + ": " + error.message);
          throw error;
        }
      });
    }
    function fetchHtml(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.text();
      });
    }
    function fetchJson(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.json();
      });
    }
    module2.exports = {
      request,
      fetchHtml,
      fetchJson,
      getSessionUA,
      setSessionUA,
      getStealthHeaders,
      DEFAULT_UA,
      MOBILE_UA
    };
  }
});

// src/utils/m3u8.js
var require_m3u8 = __commonJS({
  "src/utils/m3u8.js"(exports2, module2) {
    var axios2 = require("axios");
    var { getSessionUA } = require_http();
    var UA2 = getSessionUA();
    function getQualityFromHeight(height) {
      if (!height)
        return "1080p";
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
      return "1080p";
    }
    function parseBestQuality(content, url = "") {
      if (content) {
        const lines = content.split("\n");
        let bestHeight = 0;
        for (const line of lines) {
          if (line.includes("RESOLUTION=")) {
            const match = line.match(/RESOLUTION=\d+x(\d+)/i);
            if (match) {
              const height = parseInt(match[1]);
              if (height > bestHeight)
                bestHeight = height;
            }
          }
        }
        if (bestHeight > 0)
          return getQualityFromHeight(bestHeight);
      }
      const qMatch = url.match(/[_-](\d{3,4})[pP]?/);
      if (qMatch) {
        const h = parseInt(qMatch[1]);
        if (h >= 360 && h <= 4320)
          return getQualityFromHeight(h);
      }
      return "1080p";
    }
    var VALIDATION_CACHE = /* @__PURE__ */ new Map();
    function validateStream2(stream) {
      return __async(this, null, function* () {
        if (!stream || !stream.url)
          return stream;
        const { url, headers } = stream;
        if (VALIDATION_CACHE.has(url)) {
          console.log(`[m3u8] Sirviendo desde cach\xE9: ${url.substring(0, 40)}...`);
          return __spreadValues(__spreadValues({}, stream), VALIDATION_CACHE.get(url));
        }
        try {
          try {
            yield axios2.head(url, {
              timeout: 1e3,
              headers: __spreadValues({ "User-Agent": getSessionUA() }, headers || {})
            });
          } catch (e) {
            if (e.response && (e.response.status === 404 || e.response.status === 403)) {
              return __spreadProps(__spreadValues({}, stream), { verified: false });
            }
          }
          const response = yield axios2.get(url, {
            timeout: 3e3,
            skipSizeCheck: true,
            // REGLA CRÍTICA NUVIO: Ignorar detector de OOM para validación
            headers: __spreadValues({
              "User-Agent": getSessionUA(),
              "Range": "bytes=0-4096"
            }, headers || {}),
            responseType: "text"
          });
          const text = response.data;
          let resultData = { verified: true };
          if (text && (url.includes(".m3u8") || text.includes("#EXTM3U"))) {
            const realQuality = parseBestQuality(text, url);
            resultData.quality = realQuality;
          }
          VALIDATION_CACHE.set(url, resultData);
          return __spreadValues(__spreadValues({}, stream), resultData);
        } catch (error) {
          const fallbackQuality = parseBestQuality("", url);
          const resultData = { quality: fallbackQuality, verified: true };
          VALIDATION_CACHE.set(url, resultData);
          return __spreadValues(__spreadValues({}, stream), resultData);
        }
      });
    }
    module2.exports = { validateStream: validateStream2, getQualityFromHeight };
  }
});

// src/utils/sorting.js
var sorting_exports = {};
__export(sorting_exports, {
  sortStreamsByQuality: () => sortStreamsByQuality
});
function sortStreamsByQuality(streams) {
  if (!Array.isArray(streams))
    return [];
  return [...streams].sort((a, b) => {
    const scoreA = QUALITY_SCORE[a.quality] || 0;
    const scoreB = QUALITY_SCORE[b.quality] || 0;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    const serverA = (a.serverLabel || "").split(" ")[0];
    const serverB = (b.serverLabel || "").split(" ")[0];
    const speedA = SERVER_SCORE[serverA] || 0;
    const speedB = SERVER_SCORE[serverB] || 0;
    if (speedA !== speedB) {
      return speedB - speedA;
    }
    if (a.verified && !b.verified)
      return -1;
    if (!a.verified && b.verified)
      return 1;
    return 0;
  });
}
var QUALITY_SCORE, SERVER_SCORE;
var init_sorting = __esm({
  "src/utils/sorting.js"() {
    QUALITY_SCORE = {
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
    SERVER_SCORE = {
      "VOE": 10,
      "Filemoon": 10,
      "Tplayer": 10,
      "Vimeos": 10,
      "Netu": 5,
      "GoodStream": 10,
      "StreamWish": -5,
      "VidHide": -5
    };
  }
});

// src/utils/mirrors.js
var require_mirrors = __commonJS({
  "src/utils/mirrors.js"(exports2, module2) {
    var MIRRORS = {
      VIDHIDE: [
        "vidhide",
        "minochinos",
        "vadisov",
        "vaiditv",
        "amusemre",
        "callistanise",
        "vhaudm",
        "mdfury",
        "dintezuvio",
        "acek-cdn",
        "vedonm",
        "vidhidepro",
        "vidhidevip"
      ],
      STREAMWISH: [
        "hlswish",
        "streamwish",
        "hglink",
        "hglamioz",
        "hglink.to",
        "audinifer",
        "embedwish",
        "awish",
        "dwish",
        "strwish",
        "filelions",
        "wishembed",
        "wishfast"
      ],
      FILEMOON: [
        "filemoon",
        "moonalu",
        "moonembed",
        "bysedikamoum",
        "r66nv9ed",
        "398fitus",
        "filemoon.sx",
        "filemoon.to"
      ],
      VOE: [
        "voe.sx",
        "voe-sx",
        "voex.sx",
        "marissashare",
        "cloudwindow"
      ],
      FASTREAM: [
        "fastream",
        "fastplay",
        "fembed"
      ],
      OKRU: [
        "ok.ru",
        "okru"
      ],
      PIXELDRAIN: [
        "pixeldrain"
      ],
      BUZZHEAVIER: [
        "buzzheavier",
        "bzh.sh"
      ],
      GOODSTREAM: [
        "goodstream",
        "gs.one"
      ]
    };
    function isMirror(url, groupName) {
      if (!url || !MIRRORS[groupName])
        return false;
      const s = url.toLowerCase();
      return MIRRORS[groupName].some((m) => s.includes(m));
    }
    module2.exports = { MIRRORS, isMirror };
  }
});

// src/utils/engine.js
var require_engine = __commonJS({
  "src/utils/engine.js"(exports2, module2) {
    var { validateStream: validateStream2 } = require_m3u8();
    var { sortStreamsByQuality: sortStreamsByQuality2 } = (init_sorting(), __toCommonJS(sorting_exports));
    var { isMirror } = require_mirrors();
    function normalizeLanguage(lang) {
      const l = (lang || "").toLowerCase();
      if (l.includes("lat") || l.includes("mex") || l.includes("col") || l.includes("arg") || l.includes("chi") || l.includes("per") || l.includes("dub") || l.includes("dual")) {
        return "Latino";
      }
      if (l.includes("esp") || l.includes("cas") || l.includes("spa") || l.includes("cast")) {
        return "Espa\xF1ol";
      }
      if (l.includes("sub") || l.includes("vose") || l.includes("eng")) {
        return "Subtitulado";
      }
      return lang || "Latino";
    }
    function normalizeServer(server, url = "", resolvedServerName = null) {
      if (resolvedServerName)
        return resolvedServerName;
      const u = (url || "").toLowerCase();
      const s = (server || "").toLowerCase();
      if (isMirror(u, "VIDHIDE") || isMirror(s, "VIDHIDE"))
        return "VidHide";
      if (isMirror(u, "STREAMWISH") || isMirror(s, "STREAMWISH"))
        return "StreamWish";
      if (isMirror(u, "VOE") || isMirror(s, "VOE"))
        return "VOE";
      if (isMirror(u, "FILEMOON") || isMirror(s, "FILEMOON"))
        return "Filemoon";
      if (url) {
        try {
          const domain = new URL(url).hostname.replace("www.", "");
          return domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch (e) {
        }
      }
      return server || "Servidor";
    }
    function finalizeStreams2(streams, providerName, mediaTitle) {
      return __async(this, null, function* () {
        if (!Array.isArray(streams) || streams.length === 0)
          return [];
        console.log(`[Engine] MODO TOTAL v5.6.95 - Sin filtros. Mostrando todo...`);
        const sorted = sortStreamsByQuality2(streams);
        const processed = [];
        const seenTitles = /* @__PURE__ */ new Set();
        for (const s of sorted) {
          const lang = normalizeLanguage(s.langLabel || s.language || s.Audio || s.audio);
          const isLatino = lang.toLowerCase().includes("lat") || lang.toLowerCase().includes("mex");
          if (!isLatino)
            continue;
          const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url, s.serverName);
          let displayQuality = s.quality || "HD";
          let checkMark = "";
          if (s.verified) {
            checkMark = " \u2705";
          }
          const fullTitle = `${displayQuality}${checkMark} - ${lang} - ${server}`;
          if (seenTitles.has(fullTitle))
            continue;
          seenTitles.add(fullTitle);
          processed.push({
            name: providerName || "Plugin Latino",
            title: fullTitle,
            url: s.url,
            quality: displayQuality,
            serverName: server,
            lang,
            headers: s.headers || {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
          });
        }
        return processed;
      });
    }
    module2.exports = { finalizeStreams: finalizeStreams2 };
  }
});

// src/embed69/index.js
var axios = require("axios");
var CryptoJS = require("crypto-js");
var { getCorrectImdbId } = require_id_mapper();
var { finalizeStreams } = require_engine();
var { validateStream } = require_m3u8();
var INDIVIDUAL_TIMEOUT = 12e3;
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[Embed69] Buscando Calidad Real v7.2.3 - ID: ${tmdbId}`);
      const meta = yield getCorrectImdbId(tmdbId, mediaType);
      const imdbId = meta.imdbId;
      const title = meta.title || "Contenido";
      if (!imdbId)
        return [];
      let url;
      if (mediaType === "movie" || mediaType === "movies") {
        url = `https://embed69.org/f/${imdbId}`;
      } else {
        const s = parseInt(season);
        const e = parseInt(episode);
        url = `https://embed69.org/f/${imdbId}-${s}x${e}`;
      }
      const response = yield axios.get(url, {
        timeout: INDIVIDUAL_TIMEOUT,
        headers: { "User-Agent": UA, "Referer": "https://embed69.org/" }
      }).catch(() => null);
      if (!response || !response.data)
        return [];
      const html = response.data;
      const dataLinkRegex = /let\s+dataLink\s*=\s*(\[[\s\S]*?\]);/;
      const match = html.match(dataLinkRegex);
      if (!match)
        return [];
      let data;
      try {
        data = JSON.parse(match[1]);
      } catch (e) {
        return [];
      }
      const embedsToValidate = [];
      const seenUrls = /* @__PURE__ */ new Set();
      for (const item of data) {
        const langLabel = item.video_language || "Latino";
        if (!item.sortedEmbeds)
          continue;
        for (const embed of item.sortedEmbeds) {
          if (embed.link) {
            let finalUrl = embed.link;
            if (finalUrl.includes(".")) {
              try {
                const parts = finalUrl.split(".");
                if (parts.length === 3) {
                  const decoded = CryptoJS.enc.Base64.parse(parts[1]).toString(CryptoJS.enc.Utf8);
                  const payload = JSON.parse(decoded);
                  if (payload.link)
                    finalUrl = payload.link;
                }
              } catch (e) {
              }
            }
            if (seenUrls.has(finalUrl))
              continue;
            seenUrls.add(finalUrl);
            let streamUrl = finalUrl;
            if (!streamUrl.toLowerCase().includes(".m3u8") && !streamUrl.toLowerCase().includes(".mp4")) {
              streamUrl += "#.m3u8";
            }
            embedsToValidate.push({
              url: streamUrl,
              serverLabel: embed.servername || "Servidor",
              langLabel,
              headers: {
                "User-Agent": UA,
                "Referer": url,
                "Origin": "https://embed69.org"
              }
            });
          }
        }
      }
      const validatedStreams = yield Promise.all(
        embedsToValidate.map((stream) => __async(this, null, function* () {
          try {
            const result = yield validateStream(stream);
            if (result.verified) {
              result.quality = `${result.quality || "HD"} \u2705`;
            }
            return result;
          } catch (e) {
            return __spreadProps(__spreadValues({}, stream), { quality: "HD" });
          }
        }))
      );
      return yield finalizeStreams(validatedStreams, "Embed69", title);
    } catch (error) {
      console.error(`[Embed69] Error: ${error.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
