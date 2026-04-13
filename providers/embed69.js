/**
 * embed69 - Built from src/embed69/
 * Generated: 2026-04-13T15:15:47.904Z
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

// src/utils/ua.js
var require_ua = __commonJS({
  "src/utils/ua.js"(exports2, module2) {
    var UA_POOL = [
      // Windows - Chrome
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      // Windows - Edge
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
      // Android - Chrome
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
      // iPhone - Safari
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
      // Mac - Safari
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15"
    ];
    function getRandomUA3() {
      const index = Math.floor(Math.random() * UA_POOL.length);
      return UA_POOL[index];
    }
    module2.exports = { getRandomUA: getRandomUA3, UA_POOL };
  }
});

// src/utils/http.js
var http_exports = {};
__export(http_exports, {
  fetchHtml: () => fetchHtml,
  fetchJson: () => fetchJson,
  getSessionUA: () => getSessionUA,
  request: () => request,
  setSessionUA: () => setSessionUA
});
function setSessionUA(ua) {
  sessionUA = ua;
}
function getSessionUA() {
  return sessionUA || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
}
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
var import_axios, import_ua, sessionUA;
var init_http = __esm({
  "src/utils/http.js"() {
    import_axios = __toESM(require("axios"));
    import_ua = __toESM(require_ua());
    sessionUA = null;
  }
});

// src/utils/m3u8.js
var require_m3u8 = __commonJS({
  "src/utils/m3u8.js"(exports2, module2) {
    var { getSessionUA: getSessionUA3 } = (init_http(), __toCommonJS(http_exports));
    var UA = getSessionUA3();
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
            yield axios.head(url, {
              timeout: 1e3,
              headers: __spreadValues({ "User-Agent": getSessionUA3() }, headers || {})
            });
          } catch (e) {
            if (e.response && (e.response.status === 404 || e.response.status === 403)) {
              return __spreadProps(__spreadValues({}, stream), { verified: false });
            }
          }
          const response = yield axios.get(url, {
            timeout: 3e3,
            skipSizeCheck: true,
            // REGLA CRÍTICA NUVIO: Ignorar detector de OOM para validación
            headers: __spreadValues({
              "User-Agent": getSessionUA3(),
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

// src/utils/engine.js
var require_engine = __commonJS({
  "src/utils/engine.js"(exports2, module2) {
    var { validateStream } = require_m3u8();
    var { sortStreamsByQuality: sortStreamsByQuality2 } = (init_sorting(), __toCommonJS(sorting_exports));
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
      if (u.includes("acek-cdn.com") || u.includes("minochinos.com") || s.includes("vidhide"))
        return "VidHide";
      if (u.includes("embedwish.com") || u.includes("awish.pro") || s.includes("streamwish"))
        return "StreamWish";
      if (u.includes("cloudwindow-route.com") || u.includes("marissashare") || u.includes("voe.sx") || s.includes("voe"))
        return "VOE";
      if (u.includes("moonalu.com") || u.includes("moonembed.pro") || u.includes("filemoon.sx") || u.includes("bysedikamoum.com") || u.includes("398fitus.com") || u.includes("r66nv9ed.com") || s.includes("filemoon"))
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
        for (const s of sorted) {
          const lang = normalizeLanguage(s.langLabel || s.language || s.Audio || s.audio);
          const isLatino = lang.toLowerCase().includes("lat") || lang.toLowerCase().includes("mex");
          if (!isLatino)
            continue;
          const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url, s.serverName);
          let displayQuality = "HD";
          let checkMark = "";
          if (s.verified) {
            displayQuality = s.quality || "1080p";
            checkMark = " \u2705";
          }
          processed.push({
            name: providerName || "Plugin Latino",
            title: `${displayQuality}${checkMark} - ${lang} - ${server}`,
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
var axios3 = require("axios");
var { finalizeStreams } = require_engine();
var { getRandomUA: getRandomUA2 } = require_ua();
var { getSessionUA: getSessionUA2, setSessionUA: setSessionUA2 } = (init_http(), __toCommonJS(http_exports));
var BASE_URL = "https://embed69.org";
var LANG_PRIORITY = ["LAT"];
var INDIVIDUAL_TIMEOUT = 8e3;
function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2)
      return null;
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    payload += "=".repeat((4 - payload.length % 4) % 4);
    if (typeof atob !== "undefined")
      return JSON.parse(atob(payload));
    if (typeof Buffer !== "undefined")
      return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return null;
  } catch (e) {
    return null;
  }
}
function parseDataLink(html) {
  try {
    const match = html.match(/let\s+dataLink\s*=\s*((\[[\s\S]*?\])|(\{[\s\S]*?\}))\s*;/);
    if (!match)
      return null;
    return JSON.parse(match[1]);
  } catch (e) {
    return null;
  }
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    const mediaTitle = title || "Contenido";
    const UA = getRandomUA2();
    setSessionUA2(UA);
    console.log(`[Embed69] STABILITY v6.1.0 - Usando UA: ${UA.substring(0, 40)}...`);
    try {
      const mapper = yield getCorrectImdbId(tmdbId, mediaType);
      const imdbId = mapper ? mapper.imdbId : null;
      const allDataLinks = [];
      if (imdbId) {
        let idUrl = `${BASE_URL}/f/${imdbId}`;
        if (mediaType !== "movie" && mediaType !== "movies") {
          const s = season || 1;
          const e = String(episode || 1).padStart(2, "0");
          idUrl = `${idUrl}-${s}x${e}`;
        }
        console.log(`[Embed69] Intentando por ID: ${imdbId}`);
        const idRes = yield axios3.get(idUrl, { timeout: 7e3, headers: { "User-Agent": UA, "Referer": "https://sololatino.net/" } }).catch(() => null);
        if (idRes && idRes.data) {
          const raw = parseDataLink(idRes.data);
          if (raw) {
            const arr = Array.isArray(raw) ? raw : Object.values(raw);
            allDataLinks.push(...arr);
            console.log(`[Embed69] \u2713 Resultados encontrados por ID. Saltando b\xFAsqueda por texto.`);
          }
        }
      }
      if (allDataLinks.length === 0) {
        console.log(`[Embed69] Intentando por Texto: ${mediaTitle}`);
        const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(mediaTitle)}`;
        const textRes = yield axios3.get(searchUrl, { timeout: 7e3, headers: { "User-Agent": UA, "Referer": "https://sololatino.net/" } }).catch(() => null);
        if (textRes && textRes.data) {
          const raw = parseDataLink(textRes.data);
          if (raw) {
            const arr = Array.isArray(raw) ? raw : Object.values(raw);
            allDataLinks.push(...arr);
          }
        }
      }
      if (allDataLinks.length === 0)
        return [];
      const byLang = {};
      allDataLinks.forEach((s) => {
        if (s.video_language) {
          const langKey = s.video_language.toUpperCase();
          if (!byLang[langKey])
            byLang[langKey] = s;
          else {
            const existing = byLang[langKey].sortedEmbeds || byLang[langKey].embeds || [];
            const newOnes = s.sortedEmbeds || s.embeds || [];
            byLang[langKey].embeds = [...existing, ...newOnes];
          }
        }
      });
      const rawStreams = [];
      const seenUrls = /* @__PURE__ */ new Set();
      const batch = [];
      for (const langCode of LANG_PRIORITY) {
        const section = byLang[langCode];
        if (!section)
          continue;
        const embeds = section.sortedEmbeds || section.embeds || [];
        const langLabel = "Latino";
        console.log(`[Embed69] Encolando: ${embeds.length} en ${langLabel}`);
        for (const embed of embeds) {
          const sName = (embed.servername || "").toLowerCase();
          if (!embed.link || sName === "download")
            continue;
          const payload = decodeJwtPayload(embed.link);
          if (payload && payload.link) {
            const url = payload.link;
            if (seenUrls.has(url))
              continue;
            seenUrls.add(url);
            const sLabel = embed.servername || "Servidor";
            const resolutionPromise = Promise.race([
              resolveEmbed(url).then((res) => {
                return __spreadProps(__spreadValues({}, res || {}), { langLabel, serverLabel: sLabel, headers: __spreadProps(__spreadValues({}, res && res.headers ? res.headers : {}), { "User-Agent": UA }) });
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), INDIVIDUAL_TIMEOUT))
            ]).catch(() => {
              const pipedUrl = `${url}|User-Agent=${UA}|Referer=${url}#.m3u8`;
              return { url: pipedUrl, quality: "HD", langLabel, serverLabel: sLabel, isFallback: true };
            });
            batch.push(resolutionPromise);
          }
        }
      }
      console.log(`[Embed69] R\xE1faga: Procesando ${batch.length} servidores en paralelo`);
      const results = yield Promise.allSettled(batch);
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value)
          rawStreams.push(r.value);
      });
      return yield finalizeStreams(rawStreams, "Embed69", mediaTitle);
    } catch (error) {
      console.log(`[Embed69] Error Cr\xEDtico: ${error.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
