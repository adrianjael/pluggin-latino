/**
 * cuevana_gs - Built from src/cuevana_gs/
 * Generated: 2026-04-15T17:42:02.839Z
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
  return new Promise((resolve7, reject) => {
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
    var step = (x) => x.done ? resolve7(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/string.js
function normalizeTitle(t) {
  if (!t)
    return "";
  var normalized = t.toLowerCase().replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o").replace(/[úùüû]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  var words = normalized.split(" ");
  var filtered = [];
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var isNoise = false;
    for (var j = 0; j < NOISE_WORDS.length; j++) {
      if (NOISE_WORDS[j] === word) {
        isNoise = true;
        break;
      }
    }
    if (!isNoise)
      filtered.push(word);
  }
  return filtered.length > 0 ? filtered.join(" ") : normalized;
}
function calculateSimilarity(title1, title2) {
  var norm1 = normalizeTitle(title1);
  var norm2 = normalizeTitle(title2);
  if (norm1 === norm2)
    return 1;
  if (norm1.length > 6 && norm2.length > 6 && (norm2.indexOf(norm1) !== -1 || norm1.indexOf(norm2) !== -1)) {
    return 0.95;
  }
  var w1 = norm1.split(/\s+/);
  var w2 = norm2.split(/\s+/);
  var words1Map = {};
  var words2Map = {};
  var allUniqueWords = {};
  for (var i = 0; i < w1.length; i++) {
    if (w1[i].length > 1) {
      words1Map[w1[i]] = true;
      allUniqueWords[w1[i]] = true;
    }
  }
  for (var j = 0; j < w2.length; j++) {
    if (w2[j].length > 1) {
      words2Map[w2[j]] = true;
      allUniqueWords[w2[j]] = true;
    }
  }
  var intersection = 0;
  var union = 0;
  for (var word in allUniqueWords) {
    union++;
    if (words1Map[word] && words2Map[word]) {
      intersection++;
    }
  }
  if (union === 0)
    return 0;
  var score = intersection / union;
  var yearMatch1 = title1.match(/\b(19|20)\d{2}\b/);
  var yearMatch2 = title2.match(/\b(19|20)\d{2}\b/);
  if (yearMatch1 && yearMatch2 && yearMatch1[0] !== yearMatch2[0]) {
    return score * 0.5;
  }
  return score;
}
var NOISE_WORDS;
var init_string = __esm({
  "src/utils/string.js"() {
    NOISE_WORDS = [
      "latino",
      "espanol",
      "hispano",
      "dual",
      "subs",
      "subtitulado",
      "hd",
      "1080p",
      "720p",
      "4k",
      "uhd",
      "completa",
      "pelicula",
      "serie",
      "episodio",
      "capitulo",
      "temporada"
    ];
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
        "Connection": "keep-alive",
        "sec-ch-ua": '"Chromium";v="137", "Not-A.Brand";v="24", "Google Chrome";v="137"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      };
    }
    var DEFAULT_UA4 = getSessionUA();
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
          var fetchOptions = Object.assign({
            redirect: opt.redirect || "follow"
          }, opt, {
            headers
          });
          var response = yield fetch(url, fetchOptions);
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
    function fetchHtml4(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.text();
      });
    }
    function fetchJson2(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.json();
      });
    }
    module2.exports = {
      request,
      fetchHtml: fetchHtml4,
      fetchJson: fetchJson2,
      getSessionUA,
      setSessionUA,
      getStealthHeaders,
      DEFAULT_UA: DEFAULT_UA4,
      MOBILE_UA
    };
  }
});

// src/utils/m3u8.js
var require_m3u8 = __commonJS({
  "src/utils/m3u8.js"(exports2, module2) {
    var { getSessionUA } = require_http();
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
        if (VALIDATION_CACHE.has(url))
          return __spreadValues(__spreadValues({}, stream), VALIDATION_CACHE.get(url));
        try {
          const response = yield fetch(url, {
            method: "GET",
            headers: __spreadValues({
              "User-Agent": getSessionUA(),
              "Range": "bytes=0-1024"
            }, headers || {})
          });
          if (!response.ok)
            return __spreadProps(__spreadValues({}, stream), { verified: false });
          const text = yield response.text();
          let resultData = { verified: true };
          if (text && (url.includes(".m3u8") || text.includes("#EXTM3U"))) {
            resultData.quality = parseBestQuality(text, url);
          }
          VALIDATION_CACHE.set(url, resultData);
          return __spreadValues(__spreadValues({}, stream), resultData);
        } catch (error) {
          const resultData = { quality: parseBestQuality("", url), verified: true };
          VALIDATION_CACHE.set(url, resultData);
          return __spreadValues(__spreadValues({}, stream), resultData);
        }
      });
    }
    module2.exports = { validateStream, getQualityFromHeight };
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
        "vidhidevip",
        "masukestin",
        "vidoza"
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
        "filemoon.to",
        "bysedikamoum"
      ],
      VOE: [
        "voe.sx",
        "voe-sx",
        "voex.sx",
        "marissashare",
        "cloudwindow",
        "marissasharecareer"
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
      ],
      LULUSTREAM: [
        "lulustream",
        "luluvdo",
        "luluvids",
        "pondy",
        "lulupuv"
      ],
      SEEKSTREAMING: [
        "seekplays",
        "seekstreaming",
        "embedseek"
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
    var { validateStream } = require_m3u8();
    var { sortStreamsByQuality: sortStreamsByQuality2 } = (init_sorting(), __toCommonJS(sorting_exports));
    var { isMirror } = require_mirrors();
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
    function finalizeStreams3(streams, providerName, mediaTitle) {
      return __async(this, null, function* () {
        if (!Array.isArray(streams) || streams.length === 0)
          return [];
        console.log(`[Engine] PROCESANDO STREAMS - Filtrado Latino Inteligente v7.5.0`);
        const sorted = sortStreamsByQuality2(streams);
        const processed = [];
        const seenTitles = /* @__PURE__ */ new Set();
        for (const s of sorted) {
          const rawLang = normalizeLanguage(s.Audio || s.langLabel || s.language || s.audio || "Latino");
          const isLatino = rawLang.toLowerCase().includes("latino");
          if (!isLatino) {
            console.log(`[Engine] Omitiendo link no latino: ${rawLang}`);
            continue;
          }
          const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url, s.serverName);
          const displayQuality = s.quality || "HD";
          const checkMark = s.verified ? " \u2705" : "";
          const streamName = `${providerName} - ${displayQuality}${checkMark}`;
          const streamTitle = `${rawLang} ${server}`;
          if (seenTitles.has(streamName + streamTitle + s.url))
            continue;
          seenTitles.add(streamName + streamTitle + s.url);
          processed.push({
            name: streamName,
            // Nombre que verá el usuario en la lista
            title: streamTitle,
            // Título de la película/serie
            url: s.url,
            quality: displayQuality,
            provider: server,
            // Mapeado a 'provider' en LocalScraperResult
            language: rawLang,
            // Mapeado a 'language' en LocalScraperResult
            headers: s.headers || {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
          });
        }
        return processed;
      });
    }
    module2.exports = { finalizeStreams: finalizeStreams3 };
  }
});

// src/resolvers/voe.js
var require_voe = __commonJS({
  "src/resolvers/voe.js"(exports2, module2) {
    var { getSessionUA } = require_http();
    function localAtob(input) {
      if (!input)
        return "";
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      let str = String(input).replace(/=+$/, "").replace(/[\s\n\r\t]/g, "");
      let output = "";
      if (str.length % 4 === 1)
        return "";
      for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
      }
      return output;
    }
    function resolve7(url) {
      return __async(this, null, function* () {
        try {
          const currentUA = getSessionUA();
          console.log(`[VOE] TV-Resolving: ${url}`);
          const response = yield fetch(url, {
            headers: { "User-Agent": currentUA }
          });
          if (!response.ok)
            return null;
          const html = yield response.text();
          if (html.includes("window.location.href") && html.length < 2e3) {
            const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
            if (rm)
              return resolve7(rm[1]);
          }
          const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[1].trim());
              let encText = Array.isArray(parsed) ? parsed[0] : parsed;
              if (typeof encText !== "string")
                return null;
              let decoded = encText.replace(/[a-zA-Z]/g, (c) => {
                const code = c.charCodeAt(0);
                const limit = c <= "Z" ? 90 : 122;
                const shifted = code + 13;
                return String.fromCharCode(limit >= shifted ? shifted : shifted - 26);
              });
              const noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
              for (const n of noise)
                decoded = decoded.split(n).join("");
              const b64_1 = localAtob(decoded);
              if (!b64_1)
                throw new Error("LocalAtob failed stage 1");
              let shiftedStr = "";
              for (let j = 0; j < b64_1.length; j++) {
                shiftedStr += String.fromCharCode(b64_1.charCodeAt(j) - 3);
              }
              const reversed = shiftedStr.split("").reverse().join("");
              const decrypted = localAtob(reversed);
              if (!decrypted)
                throw new Error("LocalAtob failed stage 2");
              const data = JSON.parse(decrypted);
              if (data && data.source) {
                console.log(`[VOE] Success: ${data.source.substring(0, 50)}...`);
                return {
                  url: data.source,
                  quality: "1080p",
                  verified: true,
                  serverName: "VOE",
                  headers: {
                    "User-Agent": currentUA,
                    "Referer": url
                  }
                };
              }
            } catch (ex) {
              console.error(`[VOE] Decryption failed (QuickJS Match): ${ex.message}`);
            }
          }
          const m3u8Match = html.match(/["'](https?:\/\/[^"']+?\.m3u8[^"']*?)["']/i);
          if (m3u8Match) {
            return {
              url: m3u8Match[1],
              quality: "1080p",
              verified: false,
              serverName: "VOE",
              headers: {
                "Referer": url,
                "User-Agent": currentUA
              }
            };
          }
          return null;
        } catch (error) {
          console.error(`[VOE] Error: ${error.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve7 };
    module2.exports = { resolve: resolve7 };
  }
});

// src/resolvers/hlswish.js
var require_hlswish = __commonJS({
  "src/resolvers/hlswish.js"(exports2, module2) {
    var { getSessionUA } = require_http();
    var { validateStream } = require_m3u8();
    function unpackEval(payload, radix, symtab) {
      const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const unbase = (str) => {
        let result = 0;
        for (let i = 0; i < str.length; i++) {
          const pos = chars.indexOf(str[i]);
          if (pos === -1)
            return NaN;
          result = result * radix + pos;
        }
        return result;
      };
      return payload.replace(/\b([0-9a-zA-Z]+)\b/g, (match) => {
        const idx = unbase(match);
        if (isNaN(idx) || idx >= symtab.length)
          return match;
        return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
      });
    }
    function resolve7(url) {
      return __async(this, null, function* () {
        try {
          const UA4 = getSessionUA();
          const rawId = url.split("/").pop().replace(/\.html$/, "");
          const urlObj = new URL(url);
          const mirrors = [
            `https://hanerix.com/e/${rawId}`,
            `https://embedwish.com/e/${rawId}`,
            `https://hglink.to/e/${rawId}`,
            url,
            `https://streamwish.to/e/${rawId}`,
            `https://awish.pro/e/${rawId}`,
            `https://strwish.com/e/${rawId}`,
            `https://wishfast.top/e/${rawId}`,
            `https://sfastwish.com/e/${rawId}`
          ];
          console.log(`[StreamWish] Race-Resolving v7.9.4: ${rawId} (${mirrors.length} mirrors)`);
          const validResult = yield new Promise((resolveRace) => {
            let resolved = false;
            let pending = mirrors.length;
            mirrors.forEach((mirror) => __async(this, null, function* () {
              try {
                const mirrorObj = new URL(mirror);
                const mirrorOrigin = mirrorObj.origin;
                const resp = yield fetch(mirror, { headers: { "Referer": mirror, "User-Agent": UA4 } });
                if (!resp.ok)
                  throw new Error();
                const html = yield resp.text();
                let m3u8Url = null;
                const hashMatch = html.match(/[0-9a-f]{32}/i);
                if (hashMatch) {
                  const hash = hashMatch[0];
                  const dlUrl = `${mirrorOrigin}/dl?op=view&file_code=${rawId}&hash=${hash}&embed=1&referer=&adb=1&hls4=1`;
                  const dlResp = yield fetch(dlUrl, {
                    headers: { "User-Agent": UA4, "Referer": mirror, "X-Requested-With": "XMLHttpRequest" }
                  });
                  if (dlResp.ok) {
                    const dlData = yield dlResp.text();
                    const match = dlData.match(/https?:\/\/[^"']+\.m3u8[^"']*/);
                    if (match)
                      m3u8Url = match[0];
                  }
                }
                if (!m3u8Url) {
                  const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
                  if (packedMatch) {
                    const unpacked = unpackEval(packedMatch[1], parseInt(packedMatch[2]), packedMatch[4].split("|"));
                    const match = unpacked.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
                    if (match)
                      m3u8Url = match[0];
                  }
                }
                if (!m3u8Url) {
                  const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
                  if (fileMatch)
                    m3u8Url = fileMatch[1];
                }
                if (m3u8Url && !resolved) {
                  resolved = true;
                  m3u8Url = m3u8Url.replace(/\\/g, "");
                  if (m3u8Url.startsWith("/"))
                    m3u8Url = mirrorOrigin + m3u8Url;
                  resolveRace({ url: m3u8Url, mirror });
                }
              } catch (e) {
              } finally {
                pending--;
                if (pending === 0 && !resolved)
                  resolveRace(null);
              }
            }));
            setTimeout(() => {
              if (!resolved) {
                resolved = true;
                resolveRace(null);
              }
            }, 9e3);
          });
          if (!validResult)
            return null;
          const stream = {
            url: validResult.url,
            quality: "1080p",
            serverName: "StreamWish",
            headers: {
              "Referer": validResult.mirror,
              "Origin": new URL(validResult.mirror).origin,
              "User-Agent": UA4
            }
          };
          return yield validateStream(stream);
        } catch (e) {
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve7 };
  }
});

// src/utils/aes_gcm.js
var require_aes_gcm = __commonJS({
  "src/utils/aes_gcm.js"(exports2, module2) {
    var _CryptoJS = typeof CryptoJS !== "undefined" ? CryptoJS : null;
    function parseB64(b64) {
      if (!b64 || !_CryptoJS)
        return null;
      try {
        const normalized = b64.replace(/-/g, "+").replace(/_/g, "/");
        return _CryptoJS.enc.Base64.parse(normalized);
      } catch (e) {
        return null;
      }
    }
    function decryptGCM(keyWA, ivWA, ciphertextWithTagWA) {
      try {
        if (!keyWA || !ivWA || !ciphertextWithTagWA || !_CryptoJS)
          return null;
        const tagSizeWords = 4;
        const ciphertextWords = ciphertextWithTagWA.words.slice(0, ciphertextWithTagWA.words.length - tagSizeWords);
        const ciphertextWA = _CryptoJS.lib.WordArray.create(
          ciphertextWords,
          ciphertextWithTagWA.sigBytes - 16
        );
        let counterWA = ivWA.clone();
        counterWA.concat(_CryptoJS.lib.WordArray.create([2], 4));
        const decrypted = _CryptoJS.AES.decrypt(
          { ciphertext: ciphertextWA },
          keyWA,
          {
            iv: counterWA,
            mode: _CryptoJS.mode.CTR,
            padding: _CryptoJS.pad.NoPadding
          }
        );
        return decrypted.toString(_CryptoJS.enc.Utf8);
      } catch (e) {
        console.error("[AES-GCM] Error:", e.message);
        return null;
      }
    }
    function decryptByse(playback) {
      try {
        if (!playback || !playback.key_parts || !playback.payload || !playback.iv || !_CryptoJS)
          return null;
        let keyWA = parseB64(playback.key_parts[0]);
        for (let i = 1; i < playback.key_parts.length; i++) {
          const part = parseB64(playback.key_parts[i]);
          if (part)
            keyWA.concat(part);
        }
        const ivWA = parseB64(playback.iv);
        const ciphertextWithTagWA = parseB64(playback.payload);
        return decryptGCM(keyWA, ivWA, ciphertextWithTagWA);
      } catch (e) {
        console.error("[Byse] Failed:", e.message);
        return null;
      }
    }
    module2.exports = { decryptByse };
  }
});

// src/resolvers/filemoon.js
var require_filemoon = __commonJS({
  "src/resolvers/filemoon.js"(exports2, module2) {
    var { decryptByse } = require_aes_gcm();
    var { getSessionUA } = require_http();
    var UA_CHROME = getSessionUA();
    function unpack(p, a, c, k, e, d) {
      while (c--)
        if (k[c])
          p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
      return p;
    }
    function resolve7(url) {
      return __async(this, null, function* () {
        var _a, _b, _c, _d;
        try {
          const urlObj = new URL(url);
          const hostname = urlObj.hostname;
          const videoId = urlObj.pathname.split("/").filter((p) => !!p).pop();
          if (!videoId)
            return null;
          console.log(`[Filemoon] TV-Resolving: ${videoId} Host: ${hostname}`);
          try {
            const playbackUrl = `https://${hostname}/api/videos/${videoId}/embed/playback`;
            const response = yield fetch(playbackUrl, {
              headers: {
                "User-Agent": UA_CHROME,
                "Referer": url,
                "Origin": `https://${hostname}`,
                "X-Embed-Parent": url
              }
            });
            if (response.ok) {
              const playbackData = yield response.json();
              if (playbackData && playbackData.playback) {
                const decrypted = decryptByse(playbackData.playback);
                if (decrypted) {
                  const data = decrypted.includes("{") ? JSON.parse(decrypted) : null;
                  const directUrl = ((_b = (_a = data == null ? void 0 : data.sources) == null ? void 0 : _a[0]) == null ? void 0 : _b.url) || (data == null ? void 0 : data.url);
                  if (directUrl) {
                    return {
                      url: directUrl,
                      quality: ((_d = (_c = data == null ? void 0 : data.sources) == null ? void 0 : _c[0]) == null ? void 0 : _d.label) || "1080p",
                      verified: true,
                      serverName: "Filemoon",
                      headers: { "User-Agent": UA_CHROME, "Referer": `https://${hostname}/`, "Origin": `https://${hostname}`, "x-embed-origin": "ww3.gnulahd.nu" }
                    };
                  }
                }
              }
            }
          } catch (e) {
            console.log(`[Filemoon] Shield Fall\xF3: ${e.message}`);
          }
          const resp = yield fetch(url, { headers: { "User-Agent": UA_CHROME, "Referer": urlObj.origin } });
          const html1 = yield resp.text();
          const evalMatch = html1.match(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/);
          if (evalMatch) {
            const unpacked = unpack(evalMatch[1], parseInt(evalMatch[2]), parseInt(evalMatch[3]), evalMatch[4].split("|"), 0, {});
            const m3u8Match = unpacked.match(/sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/i);
            if (m3u8Match) {
              return {
                url: m3u8Match[1],
                quality: "1080p",
                verified: true,
                serverName: "Filemoon",
                headers: {
                  "User-Agent": UA_CHROME,
                  "Referer": `https://${hostname}`,
                  "Origin": `https://${hostname}`
                }
              };
            }
          }
          return null;
        } catch (error) {
          console.error(`[Filemoon] Error: ${error.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve7 };
    module2.exports = { resolve: resolve7 };
  }
});

// src/resolvers/vidhide.js
var require_vidhide = __commonJS({
  "src/resolvers/vidhide.js"(exports2, module2) {
    var { getSessionUA, getStealthHeaders } = require_http();
    var { validateStream } = require_m3u8();
    function unpackVidHide(script) {
      try {
        const match = script.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
        if (!match)
          return null;
        let [full, p, a, c, k] = match;
        a = parseInt(a);
        c = parseInt(c);
        k = k.split("|");
        const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
        const decode = (l, s) => {
          let res = "";
          while (l > 0) {
            res = chars[l % s] + res;
            l = Math.floor(l / s);
          }
          return res || "0";
        };
        const unpacked = p.replace(/\b\w+\b/g, (l) => {
          const s = parseInt(l, 36);
          return s < k.length && k[s] ? k[s] : decode(s, a);
        });
        return unpacked;
      } catch (e) {
        return null;
      }
    }
    function resolve7(url) {
      return __async(this, null, function* () {
        try {
          const currentUA = getSessionUA();
          console.log(`[VidHide] TV-Resolving: ${url}`);
          const urlObj = new URL(url);
          const domain = urlObj.hostname;
          const response = yield fetch(url, {
            headers: {
              "User-Agent": currentUA,
              "Referer": `https://${domain}/`
            }
          });
          if (!response.ok)
            return null;
          const html = yield response.text();
          let finalUrl = null;
          let quality = "1080p";
          const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
          if (packedMatch) {
            const unpacked = unpackVidHide(packedMatch[0]);
            if (unpacked) {
              const hlsMatch = unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/);
              if (hlsMatch)
                finalUrl = hlsMatch[1];
              const labelMatch = unpacked.match(/\{label\s*:\s*"([^"]+)"/i) || unpacked.match(/name\s*:\s*"([^"]+)"/i);
              if (labelMatch)
                quality = labelMatch[1].toLowerCase().includes("p") ? labelMatch[1] : labelMatch[1] + "p";
            }
          }
          if (!finalUrl) {
            const rawMatch = html.match(/"hls[24]"\s*:\s*"([^"]+)"/) || html.match(/file\s*:\s*["']([^"']+)["']/i) || html.match(/["'](https?:\/\/[^"']+?\/stream\/[^"']+?\.m3u8[^"']*?)["']/i);
            if (rawMatch)
              finalUrl = rawMatch[1];
          }
          if (!finalUrl)
            return null;
          if (!finalUrl.startsWith("http"))
            finalUrl = new URL(url).origin + finalUrl;
          if (!finalUrl.includes("referer="))
            finalUrl += (finalUrl.includes("?") ? "&" : "?") + "referer=embed69.org";
          const stream = {
            url: finalUrl,
            quality,
            serverName: "VidHide",
            headers: __spreadProps(__spreadValues({}, getStealthHeaders()), {
              "Referer": url.split("?")[0],
              "Origin": new URL(url).origin,
              "X-Requested-With": "XMLHttpRequest",
              "User-Agent": currentUA
            })
          };
          return yield validateStream(stream);
        } catch (e) {
          console.error(`[VidHide] Error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve7 };
  }
});

// src/resolvers/quality.js
var require_quality = __commonJS({
  "src/resolvers/quality.js"(exports2, module2) {
    var axios4 = require("axios");
    var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function detectQuality2(_0) {
      return __async(this, arguments, function* (url, headers = {}) {
        try {
          if (!url || !url.includes(".m3u8"))
            return "1080p";
          const { data } = yield axios4.get(url, {
            timeout: 5e3,
            headers: __spreadValues({
              "User-Agent": UA4
            }, headers),
            responseType: "text"
          });
          if (!data.includes("#EXT-X-STREAM-INF")) {
            const match = url.match(/[_-](\d{3,4})p/i);
            return match ? `${match[1]}p` : "1080p";
          }
          let maxRes = 0;
          const lines = data.split("\n");
          for (const line of lines) {
            const match = line.match(/RESOLUTION=\d+x(\d+)/i);
            if (match) {
              const res = parseInt(match[1]);
              if (res > maxRes)
                maxRes = res;
            }
          }
          if (maxRes > 0) {
            if (maxRes >= 2160)
              return "4K";
            if (maxRes >= 1080)
              return "1080p";
            if (maxRes >= 720)
              return "720p";
            if (maxRes >= 480)
              return "480p";
            return `${maxRes}p`;
          }
          return "1080p";
        } catch (e) {
          return "1080p";
        }
      });
    }
    module2.exports = { detectQuality: detectQuality2 };
  }
});

// src/resolvers/goodstream.js
var goodstream_exports = {};
__export(goodstream_exports, {
  resolve: () => resolve
});
function resolve(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[GoodStream] Resolviendo: ${embedUrl}`);
      const response = yield import_axios.default.get(embedUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": "https://goodstream.one",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        timeout: 15e3,
        maxRedirects: 5
      });
      const match = response.data.match(/file:\s*"([^"]+)"/);
      if (!match) {
        console.log('[GoodStream] No se encontr\xF3 patr\xF3n file:"..."');
        return null;
      }
      const videoUrl = match[1];
      const refererHeaders = {
        "Referer": embedUrl,
        "Origin": "https://goodstream.one",
        "User-Agent": UA
      };
      const quality = yield (0, import_quality.detectQuality)(videoUrl, refererHeaders);
      console.log(`[GoodStream] URL encontrada (${quality}): ${videoUrl.substring(0, 80)}...`);
      return {
        url: videoUrl,
        quality: quality || "1080p",
        serverName: "GoodStream",
        headers: refererHeaders
      };
    } catch (err) {
      console.log(`[GoodStream] Error: ${err.message}`);
      return null;
    }
  });
}
var import_axios, import_quality, UA;
var init_goodstream = __esm({
  "src/resolvers/goodstream.js"() {
    import_axios = __toESM(require("axios"));
    import_quality = __toESM(require_quality());
    UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/resolvers/fastream.js
var require_fastream = __commonJS({
  "src/resolvers/fastream.js"(exports2, module2) {
    var { fetchHtml: fetchHtml4, getSessionUA } = require_http();
    var { detectQuality: detectQuality2 } = require_quality();
    var UA4 = getSessionUA();
    function unpackPacker(data) {
      var match = data.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)\)\)/);
      if (!match)
        return null;
      var p = match[1];
      var a = parseInt(match[2]);
      var c = parseInt(match[3]);
      var k = match[4].split("|");
      while (c--) {
        if (k[c])
          p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
      }
      return p;
    }
    function resolve7(url) {
      return __async(this, null, function* () {
        try {
          console.log("[Fastream] Resolviendo: " + url);
          var data = yield fetchHtml4(url, {
            headers: { "User-Agent": UA4, "Referer": "https://www3.seriesmetro.net/" }
          });
          var unpacked = unpackPacker(data);
          var m3u8Match;
          if (!unpacked) {
            m3u8Match = data.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
            if (m3u8Match && m3u8Match[1]) {
              var url1 = m3u8Match[1];
              return {
                url: url1,
                quality: "1080p",
                serverName: "Fastream",
                headers: { "User-Agent": UA4, "Referer": "https://fastream.to/" }
              };
            }
            return null;
          }
          m3u8Match = unpacked.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
          if (!m3u8Match || !m3u8Match[1])
            return null;
          var m3u8Url = m3u8Match[1];
          var quality = yield detectQuality2(m3u8Url, { "Referer": "https://fastream.to/" });
          return {
            url: m3u8Url,
            quality: quality || "1080p",
            serverName: "Fastream",
            headers: { "User-Agent": UA4, "Referer": "https://fastream.to/" }
          };
        } catch (e) {
          console.log("[Fastream] Error: " + e.message);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve7 };
  }
});

// src/resolvers/vimeos.js
var vimeos_exports = {};
__export(vimeos_exports, {
  resolve: () => resolve2
});
function resolve2(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log("[Vimeos] Resolviendo Universal (v2.0): " + embedUrl);
      var html = yield (0, import_http.fetchHtml)(embedUrl, {
        headers: {
          "User-Agent": import_http.DEFAULT_UA,
          "Referer": "https://vimeos.net/",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      var vimeoIdMatch = html.match(/vimeo\.com\/video\/(\d+)/i);
      if (!vimeoIdMatch)
        vimeoIdMatch = embedUrl.match(/\/(\d{7,10})/);
      if (vimeoIdMatch) {
        var vimeoId = vimeoIdMatch[1];
        console.log("[Vimeos] ID Vimeo detectado: " + vimeoId + ". Consultado API Config...");
        try {
          var config = yield (0, import_http.fetchJson)("https://player.vimeo.com/video/" + vimeoId + "/config", {
            headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": embedUrl }
          });
          var hlsUrl = null;
          if (config && config.request && config.request.files && config.request.files.hls && config.request.files.hls.cdns && config.request.files.hls.cdns.default) {
            hlsUrl = config.request.files.hls.cdns.default.url;
          }
          if (hlsUrl) {
            console.log("[Vimeos] \u2713 HLS Directo encontrado.");
            return {
              url: hlsUrl,
              quality: "1080p",
              headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://player.vimeo.com/" }
            };
          }
          var progressive = config && config.request && config.request.files ? config.request.files.progressive : null;
          if (progressive && progressive.length > 0) {
            var best = progressive.sort(function(a, b) {
              return (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0);
            })[0];
            console.log("[Vimeos] \u2713 MP4 Directo encontrado (" + best.quality + ").");
            return {
              url: best.url,
              quality: best.quality ? best.quality + "p" : "1080p",
              headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://player.vimeo.com/" }
            };
          }
        } catch (apiErr) {
          console.log("[Vimeos] API Config Fall\xF3: " + apiErr.message);
        }
      }
      var packMatch = html.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/);
      if (packMatch) {
        console.log("[Vimeos] Usando Fallback Unpacker...");
        var payload = packMatch[1];
        var radix = parseInt(packMatch[2]);
        var symtab = packMatch[4].split("|");
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var unbase = function(str) {
          var result = 0;
          for (var i = 0; i < str.length; i++)
            result = result * radix + chars.indexOf(str[i]);
          return result;
        };
        var unpacked = payload.replace(/\b(\w+)\b/g, function(match) {
          var idx = unbase(match);
          return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
        });
        var m3u8Match = unpacked.match(/["']([^"']+\.m3u8[^"']*)['"]/i);
        if (m3u8Match) {
          var url = m3u8Match[1];
          return {
            url,
            quality: "1080p",
            headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://vimeos.net/" }
          };
        }
      }
      console.log("[Vimeos] No se encontr\xF3 video directo.");
      return null;
    } catch (err) {
      console.log("[Vimeos] Error cr\xEDtico: " + err.message);
      return null;
    }
  });
}
var import_http;
var init_vimeos = __esm({
  "src/resolvers/vimeos.js"() {
    import_http = __toESM(require_http());
  }
});

// src/resolvers/buzzheavier.js
var buzzheavier_exports = {};
__export(buzzheavier_exports, {
  resolve: () => resolve3
});
function resolve3(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log("[Buzzheavier] Resolviendo: " + embedUrl);
      const html = yield (0, import_http2.fetchHtml)(embedUrl, {
        headers: {
          "User-Agent": import_http2.DEFAULT_UA,
          "Referer": "https://pelisgo.online/",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      let directUrl = null;
      const sourceMatch = html.match(/<source[^>]+src=["']([^"']+)["']/i);
      if (sourceMatch) {
        directUrl = sourceMatch[1];
      }
      if (!directUrl) {
        const staticMatch = html.match(/window\.fileUrl\s*=\s*["']([^"']+)["']/i);
        if (staticMatch)
          directUrl = staticMatch[1];
      }
      if (!directUrl && embedUrl.includes("/f/")) {
        directUrl = embedUrl.replace("/f/", "/v/");
      }
      if (directUrl) {
        console.log("[Buzzheavier] \u2713 Enlace directo identificado.");
        return {
          url: directUrl,
          quality: "1080p",
          headers: {
            "User-Agent": import_http2.DEFAULT_UA,
            "Referer": embedUrl
          }
        };
      }
      console.log("[Buzzheavier] No se pudo extraer el video directo.");
      return null;
    } catch (e) {
      console.error("[Buzzheavier] Error: " + e.message);
      return null;
    }
  });
}
var import_http2;
var init_buzzheavier = __esm({
  "src/resolvers/buzzheavier.js"() {
    import_http2 = __toESM(require_http());
  }
});

// src/resolvers/okru.js
var okru_exports = {};
__export(okru_exports, {
  resolve: () => resolve4
});
function resolve4(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[OkRu] Resolviendo: ${embedUrl}`);
      const { data: raw } = yield import_axios2.default.get(embedUrl, {
        timeout: 1e4,
        headers: {
          "User-Agent": UA2,
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
        headers: { "User-Agent": UA2, "Referer": "https://ok.ru/" }
      };
    } catch (e) {
      console.log(`[OkRu] Error: ${e.message}`);
      return null;
    }
  });
}
var import_axios2, UA2;
var init_okru = __esm({
  "src/resolvers/okru.js"() {
    import_axios2 = __toESM(require("axios"));
    UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/resolvers/pixeldrain.js
var pixeldrain_exports = {};
__export(pixeldrain_exports, {
  resolve: () => resolve5
});
function resolve5(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log("[Pixeldrain] Resolviendo: " + embedUrl);
      const idMatch = embedUrl.match(/\/(u|l|api\/file)\/([a-zA-Z0-9]+)/i);
      if (!idMatch) {
        console.log("[Pixeldrain] No se pudo encontrar un ID v\xE1lido en la URL.");
        return null;
      }
      const fileId = idMatch[2];
      const directUrl = `https://pixeldrain.com/api/file/${fileId}?download=1`;
      console.log("[Pixeldrain] \u2713 URL Directa generada.");
      return {
        url: directUrl,
        quality: "1080p",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Referer": "https://pixeldrain.com/"
        }
      };
    } catch (e) {
      console.error("[Pixeldrain] Error cr\xEDtico: " + e.message);
      return null;
    }
  });
}
var init_pixeldrain = __esm({
  "src/resolvers/pixeldrain.js"() {
  }
});

// src/resolvers/playmogo.js
var require_playmogo = __commonJS({
  "src/resolvers/playmogo.js"(exports2, module2) {
    var { fetchHtml: fetchHtml4, DEFAULT_UA: DEFAULT_UA4 } = require_http();
    function resolve7(url) {
      return __async(this, null, function* () {
        try {
          console.log("[Playmogo] Resolving: " + url);
          return {
            url,
            quality: "720p",
            serverName: "Playmogo",
            headers: {
              "User-Agent": DEFAULT_UA4,
              "Referer": "https://dsvplay.com/",
              "Origin": "https://dsvplay.com"
            }
          };
        } catch (e) {
          console.error("[Playmogo] Error: " + e.message);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve7 };
  }
});

// src/resolvers/turbovid.js
var turbovid_exports = {};
__export(turbovid_exports, {
  resolve: () => resolve6
});
function resolve6(embedUrl) {
  return __async(this, null, function* () {
    try {
      const { data: html } = yield import_axios3.default.get(embedUrl, {
        headers: {
          "User-Agent": UA3,
          "Referer": "https://www.fuegocine.com/"
        },
        timeout: 8e3
      });
      const hashMatch = html.match(/data-hash="([^"]+\.m3u8[^"]*)"/);
      if (hashMatch) {
        return {
          url: hashMatch[1],
          quality: "HD",
          headers: { "Referer": embedUrl }
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}
var import_axios3, UA3;
var init_turbovid = __esm({
  "src/resolvers/turbovid.js"() {
    import_axios3 = __toESM(require("axios"));
    UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/resolvers/embedseek.js
var require_embedseek = __commonJS({
  "src/resolvers/embedseek.js"(exports2, module2) {
    var CryptoJS2 = require("crypto-js");
    var { getSessionUA } = require_http();
    function resolve7(url) {
      return __async(this, null, function* () {
        try {
          const UA4 = getSessionUA();
          const parsedUrl = new URL(url);
          const hostname = parsedUrl.hostname;
          const hash = parsedUrl.hash;
          const id = hash.replace("#", "").split("&")[0];
          if (!id)
            return null;
          const apiUrl = `${parsedUrl.origin}/api/v1/info?id=${id}`;
          const headers = {
            "User-Agent": UA4,
            "Referer": url,
            "Origin": parsedUrl.origin
          };
          const response = yield fetch(apiUrl, { headers });
          if (!response.ok)
            return null;
          const encryptedData = yield response.text();
          if (typeof encryptedData !== "string" || encryptedData.length < 10) {
            return null;
          }
          const key = generateKey(hostname);
          const iv = generateIV(hostname, hash);
          const decrypted = decrypt(encryptedData, key, iv);
          const data = JSON.parse(decrypted);
          if (data && data.url) {
            let videoUrl = data.url;
            if (videoUrl.startsWith("/")) {
              videoUrl = `${parsedUrl.origin}${videoUrl}`;
            }
            return {
              url: videoUrl,
              quality: "1080p",
              serverName: "SeekStreaming",
              headers: {
                "User-Agent": UA4,
                "Referer": url,
                "Origin": parsedUrl.origin
              }
            };
          }
          return null;
        } catch (e) {
          console.error("EmbedSeek Resolve Error:", e.message);
          return null;
        }
      });
    }
    function generateKey(hostname) {
      let n = "";
      const b = "7519".split("");
      for (let i = 0; i < b.length; i++)
        n += String.fromCharCode(parseInt("10" + b[i]));
      n += String.fromCharCode(hostname.charCodeAt(1));
      n += n.substring(1, 3);
      n += String.fromCharCode(110, 109, 117);
      const re = "3579".split("");
      n += String.fromCharCode(parseInt(re[3] + re[2]), parseInt(re[1] + re[2]));
      const s1 = (parseInt(re[0]) + 1).toString() + re[3];
      n += String.fromCharCode(parseInt(s1), parseInt(s1));
      const s2 = (parseInt(re[3]) * 10 + parseInt(re[3])).toString();
      const s3 = re.reverse().join("").substring(0, 2);
      n += String.fromCharCode(parseInt(s2), parseInt(s3));
      return CryptoJS2.enc.Utf8.parse(n.substring(0, 16));
    }
    function generateIV(hostname, hash) {
      const s = hostname;
      const p = s + "//";
      const o = hash;
      const g = s.length * p.length;
      let b = "";
      for (let i = 1; i < 10; i++)
        b += String.fromCharCode(i + g);
      const re = "111";
      const pe = 3 * o.charCodeAt(0);
      const tt = 111 + s.length;
      const k = tt + 4;
      const ie = s.charCodeAt(1);
      const me = ie - 2;
      b += String.fromCharCode(g, 111, pe, tt, k, ie, me);
      return CryptoJS2.enc.Utf8.parse(b.substring(0, 16));
    }
    function decrypt(hex, keyWA, ivWA) {
      const ciphertextWA = CryptoJS2.enc.Hex.parse(hex);
      const decrypted = CryptoJS2.AES.decrypt(
        { ciphertext: ciphertextWA },
        keyWA,
        {
          iv: ivWA,
          mode: CryptoJS2.mode.CBC,
          padding: CryptoJS2.pad.Pkcs7
        }
      );
      return decrypted.toString(CryptoJS2.enc.Utf8);
    }
    module2.exports = { resolve: resolve7 };
  }
});

// src/resolvers/tplayer.js
var require_tplayer = __commonJS({
  "src/resolvers/tplayer.js"(exports2, module2) {
    var { fetchJson: fetchJson2, getStealthHeaders } = require_http();
    function resolve7(embedUrl) {
      return __async(this, null, function* () {
        try {
          console.log("[TPlayer] Resolviendo: " + embedUrl);
          const idMatch = embedUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/);
          if (!idMatch) {
            console.log("[TPlayer] No se pudo encontrar un ID v\xE1lido en la URL.");
            return null;
          }
          const fileId = idMatch[1];
          const baseUrl = new URL(embedUrl).origin;
          const apiUrl = `${baseUrl}/api/resolve/${fileId}`;
          const headers = getStealthHeaders();
          headers["Referer"] = embedUrl;
          headers["X-Requested-With"] = "XMLHttpRequest";
          const data = yield fetchJson2(apiUrl, { headers });
          if (!data || !data.success || !data.streamUrl) {
            console.log("[TPlayer] La API no devolvi\xF3 un enlace v\xE1lido.");
            return null;
          }
          const streamUrl = data.streamUrl.startsWith("http") ? data.streamUrl : `${baseUrl}${data.streamUrl}`;
          console.log("[TPlayer] \u2713 Stream capturado con \xE9xito.");
          return {
            url: streamUrl,
            quality: "1080p",
            isDirect: true,
            // Forzar anclaje .mp4 en applyPiping
            headers: {
              "User-Agent": headers["User-Agent"],
              "Referer": embedUrl,
              "Origin": baseUrl
            }
          };
        } catch (e) {
          console.error("[TPlayer] Error en resoluci\xF3n: " + e.message);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve7 };
  }
});

// src/resolvers/lulustream.js
var require_lulustream = __commonJS({
  "src/resolvers/lulustream.js"(exports2, module2) {
    var { getSessionUA } = require_http();
    var { validateStream } = require_m3u8();
    function unpackEval(payload, radix, symtab) {
      const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const unbase = (str) => {
        let result = 0;
        for (let i = 0; i < str.length; i++) {
          const pos = chars.indexOf(str[i]);
          if (pos === -1)
            return NaN;
          result = result * radix + pos;
        }
        return result;
      };
      return payload.replace(/\b([0-9a-zA-Z]+)\b/g, (match) => {
        const idx = unbase(match);
        if (isNaN(idx) || idx >= symtab.length)
          return match;
        return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
      });
    }
    function resolve7(url) {
      return __async(this, null, function* () {
        try {
          const UA4 = getSessionUA();
          const urlObj = new URL(url);
          const origin = urlObj.origin;
          const response = yield fetch(url, {
            headers: {
              "User-Agent": UA4,
              "Referer": url
            }
          });
          if (!response.ok)
            return null;
          const html = yield response.text();
          let m3u8Url = null;
          const sourcesMatch = html.match(/sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/i);
          if (sourcesMatch) {
            m3u8Url = sourcesMatch[1];
          }
          if (!m3u8Url) {
            const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
            if (packedMatch) {
              const unpacked = unpackEval(packedMatch[1], parseInt(packedMatch[2]), packedMatch[4].split("|"));
              const match = unpacked.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
              if (match)
                m3u8Url = match[0];
            }
          }
          if (!m3u8Url) {
            const fileMatch = html.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
            if (fileMatch)
              m3u8Url = fileMatch[1];
          }
          if (m3u8Url) {
            m3u8Url = m3u8Url.replace(/\\/g, "");
            if (m3u8Url.startsWith("/"))
              m3u8Url = origin + m3u8Url;
            const stream = {
              url: m3u8Url,
              quality: "1080p",
              serverName: "LuluStream",
              headers: {
                "Referer": url,
                "Origin": origin,
                "User-Agent": UA4
              }
            };
            return yield validateStream(stream);
          }
          return null;
        } catch (e) {
          console.error(`[LuluStream] error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve7 };
  }
});

// src/utils/resolvers.js
var require_resolvers = __commonJS({
  "src/utils/resolvers.js"(exports2, module2) {
    var { resolve: resolveVoe } = require_voe();
    var { resolve: resolveHlswish } = require_hlswish();
    var { resolve: resolveFilemoon } = require_filemoon();
    var { resolve: resolveVidhide } = require_vidhide();
    var { resolve: resolveGoodstream } = (init_goodstream(), __toCommonJS(goodstream_exports));
    var { resolve: resolveFastream } = require_fastream();
    var { resolve: resolveVimeos } = (init_vimeos(), __toCommonJS(vimeos_exports));
    var { resolve: resolveBuzzheavier } = (init_buzzheavier(), __toCommonJS(buzzheavier_exports));
    var { resolve: resolveOkru } = (init_okru(), __toCommonJS(okru_exports));
    var { resolve: resolvePixeldrain } = (init_pixeldrain(), __toCommonJS(pixeldrain_exports));
    var { resolve: resolvePlaymogo } = require_playmogo();
    var { resolve: resolveTurbovid } = (init_turbovid(), __toCommonJS(turbovid_exports));
    var { resolve: resolveEmbedseek } = require_embedseek();
    var { resolve: resolveTplayer } = require_tplayer();
    var { resolve: resolveLulustream } = require_lulustream();
    var { getSessionUA } = require_http();
    var { isMirror } = require_mirrors();
    var UA4 = getSessionUA();
    function getDirectCdnHeaders(url) {
      if (!url)
        return null;
      const { getStealthHeaders } = require_http();
      const s = url.toLowerCase();
      try {
        const domain = new URL(url).hostname;
        const baseOrigin = `https://${domain}`;
        const headers = __spreadProps(__spreadValues({}, getStealthHeaders()), {
          "Referer": baseOrigin,
          "Origin": baseOrigin
        });
        if (isMirror(s, "FILEMOON") || isMirror(s, "VIDHIDE")) {
          headers["X-Requested-With"] = "XMLHttpRequest";
          headers["x-embed-origin"] = domain;
          if (isMirror(s, "FILEMOON")) {
            headers["x-embed-origin"] = "ww3.gnulahd.nu";
            headers["x-embed-parent"] = baseOrigin;
          }
        }
        return headers;
      } catch (e) {
        return { "User-Agent": UA4, "referer": url.split("?")[0] };
      }
    }
    function applyPiping(result) {
      if (!result || !result.url)
        return result;
      let url = result.url;
      const s = url.toLowerCase();
      if (result.headers) {
        let entries = Object.entries(result.headers);
        const refIdx = entries.findIndex(([k]) => k.toLowerCase() === "referer");
        if (refIdx !== -1) {
          const refEntry = entries.splice(refIdx, 1)[0];
          entries.push(refEntry);
        }
        const parts = entries.map(([k, v]) => `${k}=${v}`);
        if (parts.length > 0) {
          url = `${url}|${parts.join("|")}`;
        }
      }
      if (!url.toLowerCase().includes(".m3u8") && !url.toLowerCase().includes(".mp4")) {
        const isDirectFile = s.includes("pixeldrain") || s.includes("buzzheavier") || s.includes("tplayer") || result.isDirect;
        const anchor = isDirectFile ? "#.mp4" : "#.m3u8";
        url = `${url}${anchor}`;
      }
      result.url = url;
      return result;
    }
    function resolveEmbed2(url) {
      return __async(this, null, function* () {
        if (!url)
          return null;
        const s = url.toLowerCase();
        if (s.includes("hqq.ac") || s.includes("hqq.tv") || s.includes("netu.tv") || s.includes("waaw.to")) {
          return null;
        }
        if (isMirror(s, "VOE")) {
          const res = yield resolveVoe(url);
          if (res)
            return applyPiping(res);
        }
        if (isMirror(s, "STREAMWISH") || s.includes("filelions")) {
          const res = yield resolveHlswish(url);
          if (res)
            return applyPiping(res);
        }
        if (isMirror(s, "FILEMOON")) {
          const res = yield resolveFilemoon(url);
          if (res)
            return applyPiping(res);
        }
        if (isMirror(s, "VIDHIDE") || s.includes("mdfury") || s.includes("dintezuvio")) {
          const res = yield resolveVidhide(url);
          if (res)
            return applyPiping(res);
        }
        if (isMirror(s, "FASTREAM")) {
          const res = yield resolveFastream(url);
          if (res)
            return applyPiping(res);
        }
        if (s.includes("vimeos") || s.includes("vms.sh")) {
          const res = yield resolveVimeos(url);
          if (res)
            return applyPiping(res);
        }
        if (isMirror(s, "OKRU")) {
          const res = yield resolveOkru(url);
          if (res)
            return applyPiping(res);
        }
        if (isMirror(s, "BUZZHEAVIER")) {
          const res = yield resolveBuzzheavier(url);
          if (res)
            return applyPiping(res);
        }
        if (isMirror(s, "GOODSTREAM")) {
          const res = yield resolveGoodstream(url);
          if (res)
            return applyPiping(res);
        }
        if (s.includes("playmogo"))
          return applyPiping(yield resolvePlaymogo(url));
        if (s.includes("turbovid"))
          return applyPiping(yield resolveTurbovid(url));
        if (isMirror(s, "PIXELDRAIN"))
          return applyPiping(yield resolvePixeldrain(url));
        if (s.includes("tplayer.pelisgo.online"))
          return applyPiping(yield resolveTplayer(url));
        if (s.includes("embedseek"))
          return applyPiping(yield resolveEmbedseek(url));
        if (isMirror(s, "LULUSTREAM"))
          return applyPiping(yield resolveLulustream(url));
        const finalHeaders = getDirectCdnHeaders(url);
        return applyPiping({
          url,
          quality: "SD",
          verified: false,
          headers: finalHeaders
        });
      });
    }
    module2.exports = { resolveEmbed: resolveEmbed2 };
  }
});

// src/utils/id_mapper.js
var require_id_mapper = __commonJS({
  "src/utils/id_mapper.js"(exports2, module2) {
    var { fetchJson: fetchJson2, fetchHtml: fetchHtml4 } = require_http();
    var TMDB_API_KEY2 = "439c478a771f35c05022f9feabcca01c";
    var ID_CACHE = /* @__PURE__ */ new Map();
    var SERIES_MAPPINGS = {
      // Ejemplo: 'tmdb_id': 'imdb_id'
    };
    function getImdbIdFromApi(tmdbId, mediaType) {
      return __async(this, null, function* () {
        try {
          const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
          const apiKey = TMDB_API_KEY2;
          const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
          const idUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${apiKey}`;
          const metaUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${apiKey}&language=es-MX`;
          const idRes = yield fetchJson2(idUrl, { headers: { "User-Agent": ua } }).catch(() => null);
          if (!idRes || !idRes.imdb_id)
            return null;
          const metaRes = yield fetchJson2(metaUrl, { headers: { "User-Agent": ua } }).catch(() => null);
          const title = metaRes ? metaRes.title || metaRes.name : "Contenido";
          const year = metaRes ? (metaRes.release_date || metaRes.first_air_date || "").split("-")[0] : null;
          return {
            imdbId: idRes.imdb_id,
            title,
            year,
            offset: 0,
            fromMapping: false
          };
        } catch (e) {
          console.log(`[IDMapper] API error: ${e.message}`);
          return null;
        }
      });
    }
    function scrapeTmdbId(tmdbId, mediaType) {
      return __async(this, null, function* () {
        try {
          const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
          const html = yield fetchHtml4(url, { timeout: 1e4 }).catch(() => null);
          if (!html)
            return { imdbId: null, title: "Contenido" };
          const imdbMatch = html.match(/href="https:\/\/www\.imdb\.com\/title\/(tt\d+)"/i);
          const titleMatch = html.match(/<title>(.*?) &#8212;/i);
          return {
            imdbId: imdbMatch ? imdbMatch[1] : null,
            title: titleMatch ? titleMatch[1].trim() : "Contenido",
            year: null,
            offset: 0,
            fromMapping: false
          };
        } catch (e) {
          return { imdbId: null, title: "Contenido" };
        }
      });
    }
    function getCorrectImdbId2(tmdbId, mediaType) {
      return __async(this, null, function* () {
        if (!tmdbId)
          return { imdbId: null, title: "" };
        const cacheKey = `${mediaType}_${tmdbId}`;
        if (ID_CACHE.has(cacheKey))
          return ID_CACHE.get(cacheKey);
        if (tmdbId.startsWith("tt")) {
          const res = { imdbId: tmdbId, title: "Contenido", offset: 0, fromMapping: false };
          ID_CACHE.set(cacheKey, res);
          return res;
        }
        const apiResult = yield getImdbIdFromApi(tmdbId, mediaType);
        if (apiResult && apiResult.imdbId) {
          ID_CACHE.set(cacheKey, apiResult);
          return apiResult;
        }
        const scrapeResult = yield scrapeTmdbId(tmdbId, mediaType);
        ID_CACHE.set(cacheKey, scrapeResult);
        return scrapeResult;
      });
    }
    module2.exports = { getCorrectImdbId: getCorrectImdbId2, SERIES_MAPPINGS };
  }
});

// src/cuevana_gs/extractor.js
var extractor_exports = {};
__export(extractor_exports, {
  extractStreams: () => extractStreams
});
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      var url = "https://api.themoviedb.org/3/" + mediaType + "/" + tmdbId + "?api_key=" + TMDB_API_KEY + "&language=es-MX";
      const res = yield fetch(url);
      const json = yield res.json();
      if (json && json.id) {
        var title = json.title || json.name || "";
        var originalTitle = json.original_title || json.original_name || "";
        var year = "";
        var date = json.release_date || json.first_air_date || "";
        if (date)
          year = date.split("-")[0];
        return { title, originalTitle, year };
      }
    } catch (e) {
    }
    return { title: null, year: "" };
  });
}
function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
  return __async(this, null, function* () {
    var isSeries = mediaType === "tv";
    console.log("[Cuevana3.nu] Extracting: " + (providedTitle || tmdbId) + " (" + mediaType + ")");
    try {
      const mapperResult = yield (0, import_id_mapper.getCorrectImdbId)(tmdbId, mediaType);
      var tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
      var searchTitle = mapperResult.title || providedTitle || tmdbInfo.title;
      var originalTitle = tmdbInfo.originalTitle || "";
      var year = tmdbInfo.year;
      if (!searchTitle) {
        console.error("[Cuevana3.nu] No search title found.");
        return [];
      }
      var performSearch = function(query) {
        return __async(this, null, function* () {
          console.log('[Cuevana3.nu] Searching API: "' + query + '"...');
          var searchUrl = BASE_URL + "/wp-json/cuevana/v1/search?q=" + encodeURIComponent(query);
          try {
            var responseText = yield (0, import_http3.fetchHtml)(searchUrl);
            var json = JSON.parse(responseText);
            var results = [];
            if (json && json.data && Array.isArray(json.data)) {
              results = json.data.map((item) => {
                const info = item.info || {};
                const isMovie = info.type === "movie" || !item.link.includes("/series-online/");
                return {
                  title: item.title.trim(),
                  originalTitle: info.original_title || "",
                  type: isMovie ? "movies" : "tvshows",
                  slug: item.link,
                  year: info.release ? info.release.split("-")[0] : "",
                  id: info._id || ""
                };
              });
            }
            console.log("[Cuevana3.nu] API returned " + results.length + " candidates.");
            var filtered = results.filter((r) => {
              const typeMatch = isSeries ? r.type === "tvshows" : r.type === "movies";
              const simSpanish = calculateSimilarity(searchTitle, r.title);
              const simOriginal = calculateSimilarity(originalTitle, r.originalTitle);
              const maxSim = Math.max(simSpanish, simOriginal);
              console.log(`[Cuevana3.nu] Checking candidate: "${r.title}" | Sim: ${maxSim.toFixed(2)} | Type: ${r.type} | Year: ${r.year}`);
              const titleMatch = maxSim > 0.4;
              var yearMatch = true;
              if (year && r.year && maxSim < 0.9) {
                yearMatch = Math.abs(parseInt(year) - parseInt(r.year)) <= 2;
                if (!yearMatch)
                  console.log(`   [Cuevana3.nu] Year mismatch: ${year} vs ${r.year}`);
              }
              return typeMatch && titleMatch && yearMatch;
            });
            filtered.sort((a, b) => {
              const simA = Math.max(calculateSimilarity(searchTitle, a.title), calculateSimilarity(searchTitle, a.originalTitle));
              const simB = Math.max(calculateSimilarity(searchTitle, b.title), calculateSimilarity(searchTitle, b.originalTitle));
              return simB - simA;
            });
            return filtered;
          } catch (err) {
            console.error("[Cuevana3.nu] Search API error: " + err.message);
            return [];
          }
        });
      };
      var searchResults = [];
      var queriesToTry = [
        mapperResult.imdbId,
        // PRIORIDAD 1: Búsqueda exacta por ID
        searchTitle,
        originalTitle,
        // Intentar con el título original (importante para traducciones)
        providedTitle,
        (searchTitle || "").split(":")[0],
        (searchTitle || "").split(" ").sort((a, b) => b.length - a.length)[0]
        // Palabra más larga
      ].filter((v, i, a) => v && a.indexOf(v) === i);
      for (var q of queriesToTry) {
        if (searchResults.length > 0)
          break;
        console.log('[Cuevana3.nu] Trying search query: "' + q + '"');
        searchResults = yield performSearch(q);
      }
      if (searchResults.length === 0) {
        console.warn("[Cuevana3.nu] No accurate match found after multiple attempts for: " + searchTitle);
        return [];
      }
      searchResults.sort((a, b) => {
        const simA = Math.max(
          calculateSimilarity(searchTitle, a.title),
          calculateSimilarity(searchTitle, a.originalTitle),
          calculateSimilarity(originalTitle, a.originalTitle)
        );
        const simB = Math.max(
          calculateSimilarity(searchTitle, b.title),
          calculateSimilarity(searchTitle, b.originalTitle),
          calculateSimilarity(originalTitle, b.originalTitle)
        );
        if (Math.abs(simA - simB) > 0.1)
          return simB - simA;
        if (year) {
          const distA = Math.abs(parseInt(year) - (parseInt(a.year) || 0));
          const distB = Math.abs(parseInt(year) - (parseInt(b.year) || 0));
          return distA - distB;
        }
        return 0;
      });
      var match = searchResults[0];
      const finalSim = Math.max(
        calculateSimilarity(searchTitle, match.title),
        calculateSimilarity(originalTitle, match.originalTitle)
      );
      const isPremiere = year && parseInt(year) >= 2025;
      const yearPerfectMatch = year && match.year && parseInt(year) === parseInt(match.year);
      if (finalSim < 0.2 && !(isPremiere && yearPerfectMatch)) {
        console.warn("[Cuevana3.nu] Top match has very low similarity: " + finalSim);
        return [];
      }
      var mediaInfo = {
        title: match.title,
        slug: match.slug,
        type: match.type,
        _id: match.id
      };
      console.log("[Cuevana3.nu] Match found: " + match.title + " (ID: " + match.id + ") [" + match.type + "]");
      var getOnlineStreams = function(url) {
        return __async(this, null, function* () {
          console.log("[Cuevana3.nu] API Extraction for: " + url);
          try {
            var id = mediaInfo._id;
            if (!id) {
              var matchId = url.match(/\/(\d+)\//);
              id = matchId ? matchId[1] : null;
            }
            if (!id) {
              console.error("[Cuevana3.nu] Could not determine ID for API call");
              return { error: true };
            }
            var apiUrl = "";
            if (isSeries) {
              var s = season || 1;
              var e = episode || 1;
              apiUrl = BASE_URL + "/wp-json/cuevana/v1/episode/" + id + "/" + s + "/" + e;
            } else {
              apiUrl = BASE_URL + "/wp-json/cuevana/v1/player/" + id;
            }
            console.log("[Cuevana3.nu] Calling API: " + apiUrl);
            var response = yield (0, import_http3.fetchHtml)(apiUrl);
            var json = JSON.parse(response);
            if (!json || !json.data || !json.data.embeds) {
              console.error("[Cuevana3.nu] API returned no embeds");
              return { data: [] };
            }
            var streams2 = [];
            for (const embed of json.data.embeds) {
              if (embed.url) {
                streams2.push({
                  url: embed.url,
                  serverLabel: embed.server || embed.service_name || "Server",
                  langLabel: embed.audio || "Latino"
                });
              }
            }
            console.log("[Cuevana3.nu] API successfully returned " + streams2.length + " streams");
            return { data: streams2 };
          } catch (err) {
            console.error("[Cuevana3.nu] API Extraction Error: " + err.message);
            return { error: true };
          }
        });
      };
      var streamResult = yield getOnlineStreams(BASE_URL + (isSeries ? mediaInfo.episodeSlug : mediaInfo.slug));
      if (streamResult.error)
        return [];
      var streams = streamResult.data;
      console.log("[Cuevana3.nu] Processing " + streams.length + " streams for resolution...");
      var rawResults = [];
      for (const stream of streams) {
        try {
          const resolved = yield (0, import_resolvers.resolveEmbed)(stream.url);
          if (resolved && resolved.url) {
            rawResults.push({
              url: resolved.url,
              quality: resolved.quality,
              serverLabel: stream.serverLabel,
              langLabel: stream.langLabel,
              headers: resolved.headers || {}
            });
          }
        } catch (e) {
          console.error("[Cuevana3.nu] Resolution Error for " + stream.label + ": " + e.message);
        }
      }
      return yield (0, import_engine.finalizeStreams)(rawResults, "Cuevana3.to");
    } catch (err) {
      console.error("[Cuevana3.nu] Global Error: " + err.message);
      return [];
    }
  });
}
var import_http3, import_engine, import_resolvers, import_cheerio_without_node_native, import_id_mapper, BASE_URL, TMDB_API_KEY;
var init_extractor = __esm({
  "src/cuevana_gs/extractor.js"() {
    init_string();
    import_http3 = __toESM(require_http());
    import_engine = __toESM(require_engine());
    import_resolvers = __toESM(require_resolvers());
    import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));
    import_id_mapper = __toESM(require_id_mapper());
    BASE_URL = "https://cue.cuevana3.nu";
    TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
  }
});

// src/utils/tmdb.js
var require_tmdb = __commonJS({
  "src/utils/tmdb.js"(exports2, module2) {
    var axios4 = require("axios");
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
            const { data } = yield axios4.get(url, { timeout: 6e3 });
            const result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
            const title = result ? result.name || result.title : null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY2}`;
            const { data } = yield axios4.get(url, { timeout: 6e3 });
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
    function getTmdbInfo2(tmdbId, mediaType) {
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
            const { data } = yield axios4.get(url, { timeout: 6e3 });
            result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY2}`;
            const { data } = yield axios4.get(url, { timeout: 6e3 });
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
    module2.exports = { getTmdbTitle: getTmdbTitle2, getTmdbInfo: getTmdbInfo2 };
  }
});

// src/cuevana_gs/index.js
var { extractStreams: extractStreams2 } = (init_extractor(), __toCommonJS(extractor_exports));
var { finalizeStreams: finalizeStreams2 } = require_engine();
var { getTmdbTitle } = require_tmdb();
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      let mediaTitle = title;
      if (!mediaTitle && tmdbId) {
        mediaTitle = yield getTmdbTitle(tmdbId, mediaType);
      }
      const streams = yield extractStreams2(tmdbId, mediaType, season, episode, mediaTitle);
      return yield finalizeStreams2(streams, "Cuevana.gs", mediaTitle);
    } catch (e) {
      console.error(`[Cuevana.gs] Index error: ${e.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
