/**
 * sololatino - Built from src/sololatino/
 * Generated: 2026-04-14T17:32:20.687Z
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

// src/utils/tmdb.js
var require_tmdb = __commonJS({
  "src/utils/tmdb.js"(exports2, module2) {
    var axios2 = require("axios");
    var TMDB_API_KEY2 = "439c478a771f35c05022f9feabcca01c";
    var titleCache = /* @__PURE__ */ new Map();
    function getTmdbTitle2(tmdbId, mediaType, retries = 2) {
      return __async(this, null, function* () {
        if (!tmdbId)
          return null;
        const cleanId = tmdbId.toString().split(":")[0];
        const cacheKey = `${cleanId}_${mediaType}`;
        if (titleCache.has(cacheKey))
          return titleCache.get(cacheKey);
        try {
          const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
          let url;
          if (cleanId.startsWith("tt")) {
            url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY2}&external_source=imdb_id`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            const result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
            const title = result ? result.name || result.title : null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY2}`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            const title = data.name || data.title || null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          }
        } catch (e) {
          if (retries > 0) {
            console.log(`[TMDB-Rescue] Retrying ${tmdbId} (${retries} left)...`);
            yield new Promise((r) => setTimeout(r, 1e3));
            return getTmdbTitle2(tmdbId, mediaType, retries - 1);
          }
          console.log(`[TMDB-Rescue] Failed to fetch title for ${tmdbId}: ${e.message}`);
          return null;
        }
      });
    }
    function getTmdbInfo(tmdbId, mediaType) {
      return __async(this, null, function* () {
        if (!tmdbId)
          return null;
        const cleanId = tmdbId.toString().split(":")[0];
        const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
        try {
          let url;
          let result;
          if (cleanId.startsWith("tt")) {
            url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY2}&external_source=imdb_id`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY2}`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            result = data;
          }
          if (result) {
            const title = result.name || result.title;
            const date = result.release_date || result.first_air_date || "";
            const year = date.split("-")[0];
            return { title, year };
          }
          return null;
        } catch (e) {
          return null;
        }
      });
    }
    module2.exports = { getTmdbTitle: getTmdbTitle2, getTmdbInfo };
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
    function getRandomUA2() {
      const index = Math.floor(Math.random() * UA_POOL.length);
      return UA_POOL[index];
    }
    module2.exports = { getRandomUA: getRandomUA2, UA_POOL };
  }
});

// src/utils/http.js
var require_http = __commonJS({
  "src/utils/http.js"(exports2, module2) {
    var axios2 = require("axios");
    var { getRandomUA: getRandomUA2 } = require_ua();
    var DEFAULT_CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";
    var sessionUA = null;
    function setSessionUA2(ua) {
      sessionUA = ua;
    }
    function getSessionUA2() {
      return sessionUA || DEFAULT_CHROME_UA;
    }
    function getStealthHeaders() {
      return {
        "User-Agent": getSessionUA2(),
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
    var DEFAULT_UA = getSessionUA2();
    var MOBILE_UA = getSessionUA2();
    function request(url, options) {
      return __async(this, null, function* () {
        var opt = options || {};
        var currentUA = opt.headers && opt.headers["User-Agent"] ? opt.headers["User-Agent"] : getSessionUA2();
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
      getSessionUA: getSessionUA2,
      setSessionUA: setSessionUA2,
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
    var { getSessionUA: getSessionUA2 } = require_http();
    var UA = getSessionUA2();
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
    function validateStream(stream) {
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
              headers: __spreadValues({ "User-Agent": getSessionUA2() }, headers || {})
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
              "User-Agent": getSessionUA2(),
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
    module2.exports = { validateStream, getQualityFromHeight };
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
        "wishfast",
        "hanerix"
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
    function isMirror2(url, groupName) {
      if (!url || !MIRRORS[groupName])
        return false;
      const s = url.toLowerCase();
      return MIRRORS[groupName].some((m) => s.includes(m));
    }
    module2.exports = { MIRRORS, isMirror: isMirror2 };
  }
});

// src/utils/engine.js
var require_engine = __commonJS({
  "src/utils/engine.js"(exports2, module2) {
    var { validateStream } = require_m3u8();
    var { sortStreamsByQuality: sortStreamsByQuality2 } = (init_sorting(), __toCommonJS(sorting_exports));
    var { isMirror: isMirror2 } = require_mirrors();
    function normalizeLanguage(lang) {
      const l = (lang || "").toLowerCase();
      if (l === "latino" || l === "espa\xF1ol")
        return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
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
      if (isMirror2(u, "VIDHIDE") || isMirror2(s, "VIDHIDE"))
        return "VidHide";
      if (isMirror2(u, "STREAMWISH") || isMirror2(s, "STREAMWISH"))
        return "StreamWish";
      if (isMirror2(u, "VOE") || isMirror2(s, "VOE"))
        return "VOE";
      if (isMirror2(u, "FILEMOON") || isMirror2(s, "FILEMOON"))
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
        console.log(`[Engine] MODO TRANSPARENTE v7.3.6 - Enviando todos los idiomas a la App...`);
        const sorted = sortStreamsByQuality2(streams);
        const processed = [];
        const seenTitles = /* @__PURE__ */ new Set();
        for (const s of sorted) {
          const lang = normalizeLanguage(s.Audio || s.langLabel || s.language || s.audio);
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

// src/sololatino/index.js
var axios = require("axios");
var { getTmdbTitle } = require_tmdb();
var { finalizeStreams } = require_engine();
var { getSessionUA, setSessionUA } = require_http();
var { getRandomUA } = require_ua();
var { isMirror } = require_mirrors();
var BASE_URL = "https://player.pelisserieshoy.com";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var RESULT_CACHE = /* @__PURE__ */ new Map();
var CACHE_TTL = 5 * 60 * 1e3;
function getImdbIdInternal(idOrQuery, mediaType) {
  return __async(this, null, function* () {
    const rawId = idOrQuery.toString().split(":")[0];
    if (rawId.startsWith("tt"))
      return rawId;
    try {
      const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
      const url = `https://api.themoviedb.org/3/${type}/${rawId}/external_ids?api_key=${TMDB_API_KEY}`;
      const { data } = yield axios.get(url, { timeout: 5e3 });
      return data.imdb_id || null;
    } catch (e) {
      return null;
    }
  });
}
function getDirectStream(id, token, cookie, playerUrl, sessionHeaders) {
  return __async(this, null, function* () {
    try {
      const body = new URLSearchParams({ a: "2", tok: token, v: id }).toString();
      const config = {
        timeout: 8e3,
        headers: __spreadProps(__spreadValues({}, sessionHeaders), {
          "Referer": playerUrl,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        })
      };
      if (cookie)
        config.headers["cookie"] = cookie;
      const { data } = yield axios.post(`${BASE_URL}/s.php`, body, config);
      return data && data.u ? { url: data.u, sig: data.sig } : null;
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    if (!tmdbId)
      return [];
    const parts = tmdbId.toString().split(":");
    const realId = parts[0];
    const s = parseInt(parts[1] || season || 1);
    const e = parseInt(parts[2] || episode || 1);
    const isMovie = mediaType === "movie" || mediaType === "movies";
    const cacheKey = isMovie ? realId : `${realId}-${s}-${e}`;
    const now = Date.now();
    if (RESULT_CACHE.has(cacheKey)) {
      const cached = RESULT_CACHE.get(cacheKey);
      if (now - cached.time < CACHE_TTL) {
        console.log(`[SoloLatino] STEALTH: Servido desde cach\xE9 inteligente: ${cacheKey}`);
        return cached.data;
      }
    }
    const UA = getRandomUA();
    setSessionUA(UA);
    const SESSION_HEADERS = {
      "User-Agent": UA,
      "Accept": "*/*",
      "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": "https://sololatino.net/"
    };
    let mediaTitle = title;
    if (!mediaTitle && tmdbId) {
      mediaTitle = yield getTmdbTitle(tmdbId, mediaType);
    }
    const imdbId = yield getImdbIdInternal(realId, mediaType);
    if (!imdbId)
      return [];
    const epStr = e < 10 ? `0${e}` : e;
    const slug = isMovie ? imdbId : `${imdbId}-${s}x${epStr}`;
    const playerUrl = `${BASE_URL}/f/${slug}`;
    try {
      console.log(`[SoloLatino] STEALTH v6.8.0 - Navegaci\xF3n de Sigilo Iniciada: ${slug}`);
      const { data: html, headers: respHeaders } = yield axios.get(playerUrl, { headers: SESSION_HEADERS, timeout: 6e3 });
      yield sleep(1e3);
      const cookie = (respHeaders["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
      const tokenMatch = html.match(/(?:let\s+token|const\s+_t)\s*=\s*'([^']+)'/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        const postH = __spreadProps(__spreadValues({}, SESSION_HEADERS), {
          "Referer": playerUrl,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        });
        if (cookie)
          postH["cookie"] = cookie;
        yield axios.post(`${BASE_URL}/s.php`, "a=click&tok=" + token, { headers: postH });
        yield sleep(1500);
        const { data: scanData } = yield axios.post(`${BASE_URL}/s.php`, "a=1&tok=" + token, { headers: postH });
        const uniqueServers = /* @__PURE__ */ new Map();
        (scanData && scanData.s || []).forEach((ser) => {
          if (ser[1])
            uniqueServers.set(ser[1], ser);
        });
        if (scanData && scanData.langs_s) {
          Object.keys(scanData.langs_s).forEach((k) => {
            (scanData.langs_s[k] || []).forEach((ser) => {
              if (ser[1])
                uniqueServers.set(ser[1], ser);
            });
          });
        }
        const serverList = Array.from(uniqueServers.values()).slice(0, 6);
        const resolved = [];
        for (const ser of serverList) {
          const [name, id] = Array.isArray(ser) ? ser : [ser[0], ser[1]];
          try {
            console.log(`[SoloLatino] Resolviendo servidor: ${name}...`);
            const direct = yield getDirectStream(id, token, cookie, playerUrl, SESSION_HEADERS);
            if (direct && direct.url) {
              let finalUrl = direct.url;
              if (direct.sig)
                finalUrl = `${BASE_URL}/p.php?url=${encodeURIComponent(direct.url)}&sig=${direct.sig}`;
              let techName = "";
              if (isMirror(direct.url, "VIDHIDE"))
                techName = "VidHide";
              else if (isMirror(direct.url, "FILEMOON"))
                techName = "Filemoon";
              else if (isMirror(direct.url, "STREAMWISH"))
                techName = "StreamWish";
              else if (isMirror(direct.url, "VOE"))
                techName = "VOE";
              const fullName = techName ? `${name} - ${techName}` : name;
              resolved.push({
                langLabel: "Latino",
                serverName: fullName,
                url: finalUrl,
                quality: "1080p",
                headers: { "User-Agent": UA, "Referer": playerUrl, "Origin": BASE_URL }
              });
              console.log(`[SoloLatino] Esperando 3.5s antes del siguiente servidor...`);
              yield sleep(3500);
            }
          } catch (e2) {
            console.log(`[SoloLatino] Error resolviendo servidor, saltando...`);
          }
        }
        const final = yield finalizeStreams(resolved, "SoloLatino", mediaTitle);
        if (final.length > 0) {
          RESULT_CACHE.set(cacheKey, { time: now, data: final });
        }
        return final;
      }
    } catch (e2) {
      console.log(`[SoloLatino] Error en Stealth: ${e2.message}`);
    }
    return [];
  });
}
module.exports = { getStreams };
