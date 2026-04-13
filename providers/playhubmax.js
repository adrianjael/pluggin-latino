/**
 * playhubmax - Built from src/playhubmax/
 * Generated: 2026-04-13T03:36:38.805Z
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
  return new Promise((resolve3, reject) => {
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
    var step = (x) => x.done ? resolve3(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/m3u8.js
var m3u8_exports = {};
__export(m3u8_exports, {
  getQualityFromHeight: () => getQualityFromHeight,
  validateStream: () => validateStream
});
function getQualityFromHeight(height) {
  if (!height)
    return "Auto";
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
  return "240p";
}
function parseBestQuality(content, url = "") {
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
  const urlPattern = url.match(/[_-](\d{3,4})[pP]?/);
  if (urlPattern) {
    const h = parseInt(urlPattern[1]);
    if (h >= 360 && h <= 4320)
      return getQualityFromHeight(h);
  }
  return "720p";
}
function validateStream(stream) {
  return __async(this, null, function* () {
    if (!stream || !stream.url)
      return stream;
    const { url, headers } = stream;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12e3);
    try {
      const response = yield fetch(url, {
        signal: controller.signal,
        headers: __spreadValues({
          "Accept": "*/*",
          "Range": "bytes=0-8192",
          "User-Agent": UA
        }, headers || {})
      });
      clearTimeout(timeout);
      if (!response.ok && response.status !== 206 && response.status !== 403) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = yield response.text();
      if (text && (url.includes(".m3u8") || text.includes("#EXTM3U"))) {
        const realQuality = parseBestQuality(text, url);
        return __spreadProps(__spreadValues({}, stream), {
          quality: realQuality,
          verified: true
        });
      }
      return __spreadProps(__spreadValues({}, stream), { verified: true });
    } catch (error) {
      clearTimeout(timeout);
      const fallbackQuality = parseBestQuality("", url) || "HD";
      const isKnown = url.includes("awish") || url.includes("vimeos") || url.includes("voe") || url.includes("filemoon") || url.includes("vidhide") || url.includes("cloudwindow");
      return __spreadProps(__spreadValues({}, stream), {
        quality: fallbackQuality,
        verified: isKnown
      });
    }
  });
}
var UA;
var init_m3u8 = __esm({
  "src/utils/m3u8.js"() {
    UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
    var { validateStream: validateStream2 } = (init_m3u8(), __toCommonJS(m3u8_exports));
    var { sortStreamsByQuality: sortStreamsByQuality2 } = (init_sorting(), __toCommonJS(sorting_exports));
    function normalizeLanguage(lang) {
      const l = (lang || "").toLowerCase();
      if (l.includes("lat") || l.includes("mex") || l.includes("col") || l.includes("arg") || l.includes("chi") || l.includes("per") || l.includes("dublado") || l.includes("dual"))
        return "Latino";
      return "Desconocido";
    }
    function normalizeServer(server, url = "") {
      if (!server || server === "Servidor" || server === "Server") {
        if (url && url.startsWith("http")) {
          try {
            const domain = new URL(url).hostname.replace("www.", "").split(".")[0];
            return domain.charAt(0).toUpperCase() + domain.slice(1);
          } catch (e) {
            return "Servidor";
          }
        }
        return "Servidor";
      }
      const s = server.toLowerCase();
      const u = url.toLowerCase();
      if (s.includes("voe") || s.includes("jessicaclearout") || s.includes("shonydar") || u.includes("ugc-cdn") || u.includes("cloudwindow") || u.includes("shonydar"))
        return "VOE";
      if (s.includes("filemoon"))
        return "Filemoon";
      if (s.includes("streamwish") || s.includes("awish") || s.includes("dwish") || s.includes("strwish") || u.includes("embedwish") || u.includes("strcloud"))
        return "StreamWish";
      if (s.includes("vidhide") || s.includes("dintezuvio") || s.includes("movhide") || u.includes("acek-cdn") || u.includes("premilkyway") || u.includes("hf-ovh") || u.includes("mx9skjnui4es"))
        return "VidHide";
      if (s.includes("waaw") || s.includes("netu") || s.includes("vimeos") || u.includes("waaw") || u.includes("vms.sh"))
        return "Netu";
      if (s.includes("fastream") || s.includes("fastplay"))
        return "Fastream";
      if (/^[a-zA-Z0-9-]{15,}$/.test(server) || server.includes("cdn-caching")) {
        return "Servidor Privado";
      }
      return server;
    }
    function finalizeStreams2(streams, providerName, mediaTitle) {
      return __async(this, null, function* () {
        if (!Array.isArray(streams) || streams.length === 0)
          return [];
        console.log(`[Engine] Processing ${streams.length} streams for ${providerName} (${mediaTitle || "Unknown"})...`);
        let validated = streams;
        try {
          const results = yield Promise.allSettled(
            streams.map((s) => validateStream2(s))
          );
          validated = results.map(
            (r, i) => r.status === "fulfilled" ? r.value : streams[i]
          );
        } catch (e) {
        }
        const sorted = sortStreamsByQuality2(validated);
        const processed = sorted.map((s) => {
          const lang = normalizeLanguage(s.langLabel || s.language || s.lang || s.audio);
          const allowed = ["latino", "lat"];
          const isAllowed = allowed.some((a) => lang.toLowerCase().includes(a));
          if (!isAllowed) {
            console.log(`[Engine] Rechazado por idioma no Latino (${lang}): ${s.url.substring(0, 40)}...`);
            return null;
          }
          let q = s.verified ? s.quality : s.siteQuality || "HD";
          const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url);
          const check = s.verified ? " \u2713" : "";
          const prefix = mediaTitle ? `${mediaTitle} | ` : "";
          const qualityPart = q ? `[${q}${check}] | ` : "";
          let finalUrl = s.url;
          if (!finalUrl.includes("#") && !finalUrl.includes(".m3u8") && !finalUrl.includes(".mp4")) {
            finalUrl += "#.m3u8";
          }
          return {
            name: providerName || "Plugin Latino",
            title: `${prefix}${qualityPart}${lang} | ${server}`,
            url: finalUrl,
            quality: q || "HD",
            serverName: server,
            headers: __spreadProps(__spreadValues({}, s.headers || {}), {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            })
          };
        });
        const MAX_RESULTS = 25;
        const uniqueUrls = /* @__PURE__ */ new Set();
        const finalized = processed.filter((s) => {
          if (s === null)
            return false;
          if (uniqueUrls.has(s.url)) {
            console.log(`[Engine] Filtrado por duplicado (mismo URL): ${s.title}`);
            return false;
          }
          uniqueUrls.add(s.url);
          return true;
        }).slice(0, MAX_RESULTS);
        console.log(`[Engine] FIN: ${finalized.length} resultados finales (L\xEDmite: ${MAX_RESULTS}) enviados a Nuvio para ${providerName}.`);
        return finalized;
      });
    }
    module2.exports = { finalizeStreams: finalizeStreams2 };
  }
});

// src/utils/http.js
var http_exports = {};
__export(http_exports, {
  DEFAULT_UA: () => DEFAULT_UA,
  MOBILE_UA: () => MOBILE_UA,
  fetchHtml: () => fetchHtml,
  fetchJson: () => fetchJson,
  request: () => request
});
function request(url, options) {
  return __async(this, null, function* () {
    var opt = options || {};
    var headers = Object.assign({
      "User-Agent": opt.mobile ? MOBILE_UA : DEFAULT_UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
    }, opt.headers);
    try {
      var timeoutMs = opt.timeout || 5e3;
      var controller = new AbortController();
      var timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);
      var fetchOptions = Object.assign({}, opt, {
        headers,
        signal: controller.signal
      });
      var response = yield fetch(url, fetchOptions);
      clearTimeout(timeoutId);
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
var import_axios, DEFAULT_UA, MOBILE_UA;
var init_http = __esm({
  "src/utils/http.js"() {
    import_axios = __toESM(require("axios"));
    DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
  }
});

// src/utils/string.js
var string_exports = {};
__export(string_exports, {
  base64Decode: () => base64Decode,
  calculateSimilarity: () => calculateSimilarity,
  getHostname: () => getHostname,
  getOrigin: () => getOrigin,
  isGoodMatch: () => isGoodMatch,
  normalizeTitle: () => normalizeTitle,
  utf8Decode: () => utf8Decode
});
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
function isGoodMatch(query, result, minScore) {
  var ms = minScore || 0.45;
  return calculateSimilarity(query, result) >= ms;
}
function base64Decode(input) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var str = String(input).replace(/=+$/, "");
  var output = "";
  if (str.length % 4 === 1)
    throw new Error("Base64 invalido");
  var bc = 0, bs, buffer, idx = 0;
  while (buffer = str.charAt(idx++)) {
    buffer = chars.indexOf(buffer);
    if (~buffer) {
      bs = bc % 4 ? bs * 64 + buffer : buffer;
      if (bc++ % 4) {
        output += String.fromCharCode(255 & bs >> (-2 * bc & 6));
      }
    }
  }
  return output;
}
function utf8Decode(bytes) {
  var out = "", i = 0;
  while (i < bytes.length) {
    var c = bytes[i++];
    if (c < 128)
      out += String.fromCharCode(c);
    else if (c > 191 && c < 224)
      out += String.fromCharCode((c & 31) << 6 | bytes[i++] & 63);
    else
      out += String.fromCharCode((c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63);
  }
  return out;
}
function getOrigin(url) {
  if (!url)
    return "";
  var match = url.match(/^(https?:\/\/[^\/]+)/);
  return match ? match[1] : "";
}
function getHostname(url) {
  if (!url)
    return "";
  var match = url.match(/^https?:\/\/([^\/]+)/);
  return match ? match[1] : "";
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

// src/resolvers/voe.js
var require_voe = __commonJS({
  "src/resolvers/voe.js"(exports2, module2) {
    var { fetchHtml: fetchHtml2, DEFAULT_UA: DEFAULT_UA2 } = (init_http(), __toCommonJS(http_exports));
    var { base64Decode: base64Decode2 } = (init_string(), __toCommonJS(string_exports));
    function resolve3(url) {
      return __async(this, null, function* () {
        try {
          console.log("[VOE] Resolving: " + url);
          let html = yield fetchHtml2(url, { headers: { "User-Agent": DEFAULT_UA2 } });
          if (html.indexOf("Redirecting") !== -1 || html.length < 1500) {
            const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
            if (rm) {
              html = yield fetchHtml2(rm[1], { headers: { "User-Agent": DEFAULT_UA2 } });
            }
          }
          const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[1].trim());
              const encText = Array.isArray(parsed) ? parsed[0] : parsed;
              if (typeof encText !== "string")
                return null;
              let rot13 = encText.replace(/[a-zA-Z]/g, function(c) {
                const code = c.charCodeAt(0);
                const limit = c <= "Z" ? 90 : 122;
                const shifted = code + 13;
                return String.fromCharCode(limit >= shifted ? shifted : shifted - 26);
              });
              const noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
              for (let i = 0; i < noise.length; i++) {
                const n = noise[i];
                rot13 = rot13.split(n).join("");
              }
              const b64_1 = base64Decode2(rot13);
              let shiftedStr = "";
              for (let j = 0; j < b64_1.length; j++) {
                shiftedStr += String.fromCharCode(b64_1.charCodeAt(j) - 3);
              }
              const reversed = shiftedStr.split("").reverse().join("");
              const data = JSON.parse(base64Decode2(reversed));
              if (data && (data.source || data.mp4)) {
                const finalUrl = data.source || data.mp4;
                console.log("[VOE] -> video encontrado: " + finalUrl.substring(0, 60) + "...");
                let q = "1080p";
                if (data.video_height) {
                  const h = parseInt(data.video_height);
                  if (h >= 1080)
                    q = "1080p";
                  else if (h >= 720)
                    q = "720p";
                  else if (h >= 480)
                    q = "480p";
                  else
                    q = h + "p";
                }
                return {
                  url: finalUrl,
                  quality: q,
                  serverName: "VOE",
                  headers: {
                    "User-Agent": DEFAULT_UA2,
                    "Referer": "https://voe.sx/",
                    "Origin": "https://voe.sx",
                    "Accept": "*/*"
                  }
                };
              }
            } catch (ex) {
              console.error("[VOE] Decryption failed:", ex.message);
            }
          }
          const m3u8MatchRaw = html.match(/["'](https?:\/\/[^"']+?\.m3u8[^"']*?)["']/i);
          if (m3u8MatchRaw) {
            const finalUrl = m3u8MatchRaw[1];
            return {
              url: finalUrl,
              quality: "1080p",
              serverName: "VOE",
              headers: {
                "User-Agent": DEFAULT_UA2,
                "Referer": "https://voe.sx/",
                "Origin": "https://voe.sx",
                "Accept": "*/*"
              }
            };
          }
          return null;
        } catch (e) {
          console.error("[VOE] Error resolviedo: " + e.message);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve3 };
  }
});

// src/resolvers/hlswish.js
var require_hlswish = __commonJS({
  "src/resolvers/hlswish.js"(exports2, module2) {
    var axios6 = require("axios");
    var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
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
    function resolve3(url) {
      return __async(this, null, function* () {
        try {
          let targetUrl = url;
          const rawId = url.split("/").pop().replace(/\.html$/, "");
          const mirrors = [
            targetUrl,
            `https://embedwish.com/e/${rawId}`,
            `https://hglamioz.com/e/${rawId}`,
            `https://awish.pro/e/${rawId}`,
            `https://strwish.com/e/${rawId}`
          ];
          let html = "";
          let usedUrl = targetUrl;
          console.log(`[StreamWish] Resolviendo CJS v5.6.8: ${rawId}`);
          for (const mirror of mirrors) {
            try {
              const response = yield axios6.get(mirror, {
                headers: { "User-Agent": UA6, "Referer": "https://embed69.org/" },
                timeout: 6e3
              });
              html = response.data;
              usedUrl = mirror;
              if (!html.includes("Page is loading") && (html.includes("eval(function") || html.includes(".m3u8"))) {
                break;
              }
            } catch (mirrorErr) {
              continue;
            }
          }
          if (!html)
            return null;
          const baseOrigin = (usedUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
          let finalUrl = null;
          const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
          if (fileMatch) {
            finalUrl = fileMatch[1];
          }
          if (!finalUrl) {
            const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
            if (packedMatch) {
              const unpacked = unpackEval(packedMatch[1], parseInt(packedMatch[2]), packedMatch[4].split("|"));
              const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i) || unpacked.match(/https?:\/\/[^"' \t\n\r]+\.m3u8[^"' \t\n\r]*/i);
              if (m3u8Match) {
                finalUrl = m3u8Match[1] || m3u8Match[0];
              }
            }
          }
          if (!finalUrl) {
            const rawMatch = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
            if (rawMatch)
              finalUrl = rawMatch[0];
          }
          if (finalUrl) {
            if (finalUrl.startsWith("/"))
              finalUrl = baseOrigin + finalUrl;
            finalUrl = finalUrl.replace(/\\/g, "");
            let q = "1080p";
            const qMatch = finalUrl.match(/[_-](\d{3,4})[pP]?/);
            if (qMatch)
              q = qMatch[1] + "p";
            return {
              url: finalUrl,
              quality: q,
              serverName: "StreamWish",
              headers: {
                "User-Agent": UA6,
                "Referer": baseOrigin + "/",
                "Origin": baseOrigin
              }
            };
          }
          return null;
        } catch (e) {
          console.log(`[StreamWish] Error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve3 };
  }
});

// src/utils/aes-gcm.js
var aes_gcm_exports = {};
__export(aes_gcm_exports, {
  decryptGCM: () => decryptGCM
});
function decryptGCM(key, iv, ciphertextWithTag) {
  try {
    const tagSize = 16;
    const ciphertext = ciphertextWithTag.slice(0, -tagSize);
    const keyWA = import_crypto_js.default.lib.WordArray.create(key);
    const ivCounter = new Uint8Array(16);
    ivCounter.set(iv, 0);
    ivCounter[15] = 2;
    const ivWA = import_crypto_js.default.lib.WordArray.create(ivCounter);
    const decrypted = import_crypto_js.default.AES.decrypt(
      { ciphertext: import_crypto_js.default.lib.WordArray.create(ciphertext) },
      keyWA,
      {
        iv: ivWA,
        mode: import_crypto_js.default.mode.CTR,
        padding: import_crypto_js.default.pad.NoPadding
      }
    );
    return decrypted.toString(import_crypto_js.default.enc.Utf8);
  } catch (e) {
    console.error("[PureJS-GCM] Error Decrypting:", e.message);
    return null;
  }
}
var import_crypto_js;
var init_aes_gcm = __esm({
  "src/utils/aes-gcm.js"() {
    import_crypto_js = __toESM(require("crypto-js"));
  }
});

// src/utils/config.js
var config_exports = {};
__export(config_exports, {
  API_ENDPOINTS: () => API_ENDPOINTS,
  API_KEYS: () => API_KEYS
});
var API_KEYS, API_ENDPOINTS;
var init_config = __esm({
  "src/utils/config.js"() {
    API_KEYS = {
      FILEMOON: "42605q5ytvlhmu9eris67",
      VIDHIDE: "27261mmymf1etcdwfdvr3",
      STREAMWISH: "10801lny3tlwanfupzu4m",
      MIXDROP: "gAR2UJ0JE2RKlhJJCqE"
    };
    API_ENDPOINTS = {
      FILEMOON: "https://filemoon-api.vercel.app/api/filemoon"
    };
  }
});

// src/resolvers/filemoon.js
var require_filemoon = __commonJS({
  "src/resolvers/filemoon.js"(exports2, module2) {
    var { decryptGCM: decryptGCM2 } = (init_aes_gcm(), __toCommonJS(aes_gcm_exports));
    var { base64Decode: base64Decode2, utf8Decode: utf8Decode2 } = (init_string(), __toCommonJS(string_exports));
    var { API_KEYS: API_KEYS2 } = (init_config(), __toCommonJS(config_exports));
    var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    function decryptByse(playback) {
      return __async(this, null, function* () {
        try {
          const keyArr = [];
          for (const p of playback.key_parts) {
            const b64 = p.replace(/-/g, "+").replace(/_/g, "/");
            const bin = base64Decode2(b64);
            new Uint8Array(bin.split("").map((c) => c.charCodeAt(0))).forEach((b) => keyArr.push(b));
          }
          const key = new Uint8Array(keyArr);
          const ivBase = playback.iv.replace(/-/g, "+").replace(/_/g, "/");
          const ivBin = base64Decode2(ivBase);
          const iv = new Uint8Array(ivBin.split("").map((c) => c.charCodeAt(0)));
          const payloadBase = playback.payload.replace(/-/g, "+").replace(/_/g, "/");
          const payloadBin = base64Decode2(payloadBase);
          const ciphertextWithTag = new Uint8Array(payloadBin.split("").map((c) => c.charCodeAt(0)));
          if (typeof crypto !== "undefined" && crypto.subtle) {
            try {
              const cryptoKey = yield crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]);
              const decryptedArr = yield crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertextWithTag);
              return JSON.parse(utf8Decode2(new Uint8Array(decryptedArr)));
            } catch (e) {
              console.log("[Byse] Subtle fail");
            }
          }
          const decryptedStr = decryptGCM2(key, iv, ciphertextWithTag);
          return decryptedStr ? JSON.parse(decryptedStr) : null;
        } catch (e) {
          console.error(`[Byse Decrypt] Error: ${e.message}`);
          return null;
        }
      });
    }
    function resolve3(url) {
      return __async(this, null, function* () {
        try {
          const hostname = new URL(url).hostname;
          const codeMatch = url.match(/\/([a-zA-Z0-9]{8,15})(?:\.html)?$/) || url.match(/\/([a-zA-Z0-9]{8,15})\/?$/);
          if (!codeMatch)
            return null;
          const code = codeMatch[1];
          console.log(`[Byse/Filemoon] Resolviendo CJS v5.6.7: ${code} (${hostname})`);
          const defaultHeaders = {
            "User-Agent": UA6,
            "Referer": url,
            "Origin": `https://${hostname}`,
            "x-embed-origin": "ww3.gnulahd.nu",
            "x-embed-referer": "https://ww3.gnulahd.nu/",
            "x-embed-parent": url
          };
          if (API_KEYS2.FILEMOON) {
            try {
              const apiRes = yield fetch(`https://filemoon.sx/api/file/direct_link?key=${API_KEYS2.FILEMOON}&file_code=${code}`);
              const apiData = yield apiRes.json();
              if (apiData.result && apiData.result.url) {
                return {
                  url: apiData.result.url,
                  quality: "HD",
                  serverName: "Filemoon",
                  headers: defaultHeaders
                };
              }
            } catch (e) {
            }
          }
          try {
            const detailsRes = yield fetch(`https://${hostname}/api/videos/${code}/embed/details`, { headers: defaultHeaders });
            const details = yield detailsRes.json();
            let targetCode = code;
            let targetHost = hostname;
            let refererForPlayback = url;
            if (details.embed_frame_url) {
              const frameUrl = details.embed_frame_url;
              const frameUri = new URL(frameUrl);
              targetCode = frameUri.pathname.split("/").pop();
              targetHost = frameUri.hostname;
              refererForPlayback = frameUrl;
            }
            const pbHeaders = __spreadProps(__spreadValues({}, defaultHeaders), { "Referer": refererForPlayback, "x-embed-parent": url });
            const pbRes = yield fetch(`https://${targetHost}/api/videos/${targetCode}/embed/playback`, { headers: pbHeaders });
            const pbData = yield pbRes.json();
            if (pbData.playback) {
              const decrypted = yield decryptByse(pbData.playback);
              if (decrypted && decrypted.sources) {
                const best = decrypted.sources[0];
                return {
                  url: best.url,
                  quality: best.label || "HD",
                  serverName: "Filemoon/Byse",
                  headers: pbHeaders
                };
              }
            }
          } catch (apiErr) {
            console.log(`[Byse] Flow failed: ${apiErr.message}`);
          }
          try {
            const apiRes = yield fetch(`https://${hostname}/api/videos/${code}`, { headers: defaultHeaders });
            const data = yield apiRes.json();
            if (data.playback) {
              const decrypted = yield decryptByse(data.playback);
              if (decrypted && decrypted.sources) {
                const best = decrypted.sources[0];
                return {
                  url: best.url,
                  quality: "HD",
                  serverName: "Filemoon",
                  headers: defaultHeaders
                };
              }
            }
          } catch (e) {
          }
          return null;
        } catch (e) {
          console.error(`[Filemoon] Error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve3 };
  }
});

// src/resolvers/vidhide.js
var vidhide_exports = {};
__export(vidhide_exports, {
  resolve: () => resolve
});
function unpackVidHide(script) {
  try {
    const match = script.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
    if (!match)
      return null;
    let [full, p, a, c, k] = match;
    a = parseInt(a);
    c = parseInt(c);
    k = k.split("|");
    const decode = (l, s) => {
      const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
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
function resolve(url) {
  return __async(this, null, function* () {
    try {
      console.log(`[VidHide] Resolviendo: ${url}`);
      const { data: html } = yield import_axios2.default.get(url, {
        timeout: 15e3,
        maxRedirects: 10,
        headers: { "User-Agent": UA2, "Referer": "https://embed69.org/" }
      });
      let finalUrl = null;
      let quality = null;
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
        const rawMatch = html.match(/"hls[24]"\s*:\s*"([^"]+)"/) || html.match(/file\s*:\s*["']([^"']+)["']/i);
        if (rawMatch)
          finalUrl = rawMatch[1];
      }
      if (!finalUrl) {
        console.log("[VidHide] No se encontr\xF3 URL de video");
        return null;
      }
      if (!quality) {
        const qMatch = finalUrl.match(/[_-](\d{3,4})[pP]?/);
        quality = qMatch ? qMatch[1] + "p" : "1080p";
      }
      if (!finalUrl.startsWith("http")) {
        finalUrl = new URL(url).origin + finalUrl;
      }
      console.log(`[VidHide] URL encontrada: ${finalUrl.substring(0, 80)}...`);
      const origin = new URL(url).origin;
      return {
        url: finalUrl,
        quality,
        serverName: "VidHide",
        headers: {
          "User-Agent": UA2,
          "Referer": origin + "/",
          "Origin": origin
        }
      };
    } catch (e) {
      console.log(`[VidHide] Error: ${e.message}`);
      return null;
    }
  });
}
var import_axios2, UA2;
var init_vidhide = __esm({
  "src/resolvers/vidhide.js"() {
    import_axios2 = __toESM(require("axios"));
    UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/resolvers/quality.js
function detectQuality(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    try {
      if (!url || !url.includes(".m3u8"))
        return "1080p";
      const { data } = yield import_axios3.default.get(url, {
        timeout: 5e3,
        headers: __spreadValues({
          "User-Agent": UA3
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
var import_axios3, UA3;
var init_quality = __esm({
  "src/resolvers/quality.js"() {
    import_axios3 = __toESM(require("axios"));
    UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/resolvers/goodstream.js
var goodstream_exports = {};
__export(goodstream_exports, {
  resolve: () => resolve2
});
function resolve2(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[GoodStream] Resolviendo: ${embedUrl}`);
      const response = yield import_axios4.default.get(embedUrl, {
        headers: {
          "User-Agent": UA4,
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
        "User-Agent": UA4
      };
      const quality = yield detectQuality(videoUrl, refererHeaders);
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
var import_axios4, UA4;
var init_goodstream = __esm({
  "src/resolvers/goodstream.js"() {
    import_axios4 = __toESM(require("axios"));
    init_quality();
    UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/utils/resolvers.js
var require_resolvers = __commonJS({
  "src/utils/resolvers.js"(exports2, module2) {
    var { resolve: resolveVoe } = require_voe();
    var { resolve: resolveHlswish } = require_hlswish();
    var { resolve: resolveFilemoon } = require_filemoon();
    var { resolve: resolveVidhide } = (init_vidhide(), __toCommonJS(vidhide_exports));
    var { resolve: resolveGoodstream } = (init_goodstream(), __toCommonJS(goodstream_exports));
    var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function getDirectCdnHeaders(url) {
      if (!url)
        return null;
      const s = url.toLowerCase();
      if (s.includes("vidhide") || s.includes("vhaudm") || s.includes("embedseek") || s.includes("mdfury") || s.includes("minochinos") || s.includes("vadisov") || s.includes("vaiditv") || s.includes("amusemre") || s.includes("callistanise") || s.includes("acek-cdn") || s.includes("premilkyway") || s.includes("hf-ovh") || s.includes("mx9skjnui4es")) {
        try {
          const domain = new URL(url).hostname;
          return {
            "User-Agent": UA6,
            "Referer": `https://${domain}/`,
            "Origin": `https://${domain}`
          };
        } catch (e) {
          return { "User-Agent": UA6, "Referer": "https://vidhide.com/", "Origin": "https://vidhide.com" };
        }
      }
      if (s.includes("r66nv9ed.com") || s.includes("filemoon") || s.includes("byse") || s.includes("398fitus.com")) {
        let domain = "filemoon.sx";
        if (s.includes("398fitus"))
          domain = "398fitus.com";
        if (s.includes("bysevepoin"))
          domain = "bysevepoin.com";
        if (s.includes("bysebuho"))
          domain = "bysebuho.com";
        if (s.includes("bysezejataos"))
          domain = "bysezejataos.com";
        if (s.includes("byseqekaho"))
          domain = "byseqekaho.com";
        const referer = `https://${domain}/`;
        return {
          "Referer": referer,
          "Origin": `https://${domain}`,
          "User-Agent": UA6,
          "x-embed-origin": "ww3.gnulahd.nu",
          "x-embed-referer": "https://ww3.gnulahd.nu/",
          "x-embed-parent": referer
        };
      }
      if (s.includes("cloudwindow-route.com") || s.includes("awish.pro") || s.includes("streamwish") || s.includes("hglink") || s.includes("hglamioz") || s.includes("audinifer") || s.includes("embedwish") || s.includes("strwish") || s.includes("dwish")) {
        return { "User-Agent": UA6, "Referer": "https://streamwish.to/", "Origin": "https://streamwish.to" };
      }
      return null;
    }
    function applyPiping(result) {
      if (!result || !result.url)
        return result;
      if (result.url.includes("|") || !result.headers)
        return result;
      const headers = result.headers;
      const parts = [];
      for (const [key, value] of Object.entries(headers)) {
        if (value)
          parts.push(`${key}=${value}`);
      }
      if (parts.length > 0) {
        let suffix = "";
        const lowerUrl = result.url.toLowerCase();
        if (lowerUrl.includes(".m3u8"))
          suffix = "#.m3u8";
        else if (lowerUrl.includes(".mp4"))
          suffix = "#.mp4";
        result.url = `${result.url}|${parts.join("|")}${suffix}`;
      }
      return result;
    }
    function resolveEmbed2(url) {
      return __async(this, null, function* () {
        if (!url)
          return null;
        const s = url.toLowerCase();
        if (s.includes("voe") || s.includes("jessicaclearout") || s.includes("shonydar") || s.includes("voe-sx")) {
          const res = yield resolveVoe(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("hlswish") || s.includes("streamwish") || s.includes("hglamioz") || s.includes("hglink") || s.includes("audinifer") || s.includes("embedwish") || s.includes("awish") || s.includes("dwish") || s.includes("strwish")) {
          const res = yield resolveHlswish(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("filemoon") || s.includes("398fitus") || s.includes("r66nv9ed") || s.includes("byse")) {
          const res = yield resolveFilemoon(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("vidhide") || s.includes("minochinos") || s.includes("vadisov") || s.includes("vaiditv") || s.includes("amusemre") || s.includes("callistanise") || s.includes("vhaudm") || s.includes("embedseek") || s.includes("mdfury")) {
          const res = yield resolveVidhide(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("goodstream") || s.includes("gs.one")) {
          const res = yield resolveGoodstream(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes(".m3u8") || s.includes(".mp4") || s.includes(".txt")) {
          const directHeaders = getDirectCdnHeaders(url) || { "User-Agent": UA6, "Referer": url };
          return applyPiping({
            url,
            quality: "HD",
            headers: directHeaders
          });
        }
        return null;
      });
    }
    module2.exports = { resolveEmbed: resolveEmbed2 };
  }
});

// src/utils/tmdb.js
var require_tmdb = __commonJS({
  "src/utils/tmdb.js"(exports2, module2) {
    var axios6 = require("axios");
    var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
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
            url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
            const { data } = yield axios6.get(url, { timeout: 6e3 });
            const result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
            const title = result ? result.name || result.title : null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}`;
            const { data } = yield axios6.get(url, { timeout: 6e3 });
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
            url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
            const { data } = yield axios6.get(url, { timeout: 6e3 });
            result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}`;
            const { data } = yield axios6.get(url, { timeout: 6e3 });
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

// src/playhubmax/index.js
var axios5 = require("axios");
var { finalizeStreams } = require_engine();
var { resolveEmbed } = require_resolvers();
var { getTmdbTitle } = require_tmdb();
var PHM_API = "https://api.playhubmax.com/api";
var AES_KEY_STR = "33dff3b1c1362e45e1425fcc9724d6f3";
var AES_IV_STR = "33dff3b1c1362e45";
var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var API_HEADERS = {
  "User-Agent": UA5,
  "Accept": "application/json, text/plain, */*",
  "Origin": "https://www.playhubmax.com",
  "Referer": "https://www.playhubmax.com/"
};
var AES_SBOX = [99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22];
var AES_SBOX_INV = (() => {
  const inv = new Array(256);
  for (let i = 0; i < 256; i++)
    inv[AES_SBOX[i]] = i;
  return inv;
})();
var AES_RCON = [1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
function gmul(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1)
      p ^= a;
    let hbs = a & 128;
    a = a << 1 & 255;
    if (hbs)
      a ^= 27;
    b >>= 1;
  }
  return p;
}
function aesKeyExpansion(keyBytes) {
  let w = [];
  for (let i = 0; i < 8; i++)
    w[i] = keyBytes.slice(i * 4, i * 4 + 4);
  for (let i = 8; i < 60; i++) {
    let temp = w[i - 1].slice();
    if (i % 8 === 0) {
      let rot = [temp[1], temp[2], temp[3], temp[0]];
      temp = [AES_SBOX[rot[0]], AES_SBOX[rot[1]], AES_SBOX[rot[2]], AES_SBOX[rot[3]]];
      temp[0] ^= AES_RCON[i / 8 - 1];
    } else if (i % 8 === 4) {
      temp = [AES_SBOX[temp[0]], AES_SBOX[temp[1]], AES_SBOX[temp[2]], AES_SBOX[temp[3]]];
    }
    w[i] = [w[i - 8][0] ^ temp[0], w[i - 8][1] ^ temp[1], w[i - 8][2] ^ temp[2], w[i - 8][3] ^ temp[3]];
  }
  return w;
}
function aesDecryptBlock(block, roundKeys) {
  let s = [[block[0], block[1], block[2], block[3]], [block[4], block[5], block[6], block[7]], [block[8], block[9], block[10], block[11]], [block[12], block[13], block[14], block[15]]];
  for (let c = 0; c < 4; c++) {
    let rk = roundKeys[56 + c];
    for (let r = 0; r < 4; r++)
      s[c][r] ^= rk[r];
  }
  for (let round = 13; round >= 1; round--) {
    let t12 = s[3][1];
    s[3][1] = s[2][1];
    s[2][1] = s[1][1];
    s[1][1] = s[0][1];
    s[0][1] = t12;
    let t22 = s[0][2];
    s[0][2] = s[2][2];
    s[2][2] = t22;
    t22 = s[1][2];
    s[1][2] = s[3][2];
    s[3][2] = t22;
    let t32 = s[0][3];
    s[0][3] = s[1][3];
    s[1][3] = s[2][3];
    s[2][3] = s[3][3];
    s[3][3] = t32;
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++)
        s[c][r] = AES_SBOX_INV[s[c][r]];
    for (let c = 0; c < 4; c++) {
      let rk = roundKeys[round * 4 + c];
      for (let r = 0; r < 4; r++)
        s[c][r] ^= rk[r];
    }
    for (let c = 0; c < 4; c++) {
      let a = s[c].slice();
      s[c][0] = gmul(a[0], 14) ^ gmul(a[1], 11) ^ gmul(a[2], 13) ^ gmul(a[3], 9);
      s[c][1] = gmul(a[0], 9) ^ gmul(a[1], 14) ^ gmul(a[2], 11) ^ gmul(a[3], 13);
      s[c][2] = gmul(a[0], 13) ^ gmul(a[1], 9) ^ gmul(a[2], 14) ^ gmul(a[3], 11);
      s[c][3] = gmul(a[0], 11) ^ gmul(a[1], 13) ^ gmul(a[2], 9) ^ gmul(a[3], 14);
    }
  }
  let t1 = s[3][1];
  s[3][1] = s[2][1];
  s[2][1] = s[1][1];
  s[1][1] = s[0][1];
  s[0][1] = t1;
  let t2 = s[0][2];
  s[0][2] = s[2][2];
  s[2][2] = t2;
  t2 = s[1][2];
  s[1][2] = s[3][2];
  s[3][2] = t2;
  let t3 = s[0][3];
  s[0][3] = s[1][3];
  s[1][3] = s[2][3];
  s[2][3] = s[3][3];
  s[3][3] = t3;
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      s[c][r] = AES_SBOX_INV[s[c][r]];
  for (let c = 0; c < 4; c++) {
    let rk = roundKeys[c];
    for (let r = 0; r < 4; r++)
      s[c][r] ^= rk[r];
  }
  let out = [];
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      out.push(s[c][r]);
  return out;
}
function decryptSources(b64) {
  try {
    let key = Array.from(Buffer.from(AES_KEY_STR, "utf8"));
    let iv = Array.from(Buffer.from(AES_IV_STR, "utf8"));
    let ct = Array.from(Buffer.from(b64, "base64"));
    let roundKeys = aesKeyExpansion(key);
    let plain = [];
    let prev = iv;
    for (let i = 0; i < ct.length; i += 16) {
      let block = ct.slice(i, i + 16);
      let dec = aesDecryptBlock(block, roundKeys);
      for (let j = 0; j < 16; j++)
        plain.push(dec[j] ^ prev[j]);
      prev = block;
    }
    let pad = plain[plain.length - 1];
    if (pad < 1 || pad > 16)
      return [];
    let json = Buffer.from(plain.slice(0, plain.length - pad)).toString("utf8");
    return JSON.parse(json);
  } catch (e) {
    return [];
  }
}
function searchContents(q) {
  return __async(this, null, function* () {
    try {
      const { data } = yield axios5.get(`${PHM_API}/US/en/contents?q=${encodeURIComponent(q)}`, { headers: API_HEADERS, timeout: 8e3 });
      return data.data || [];
    } catch (e) {
      return [];
    }
  });
}
function getSources(type, uuid) {
  return __async(this, null, function* () {
    try {
      const { data } = yield axios5.get(`${PHM_API}/${type}/${uuid}/sources`, { headers: API_HEADERS, timeout: 8e3 });
      if (!data.data)
        return [];
      const sources = decryptSources(data.data);
      return sources.filter((s) => {
        var _a;
        return (_a = s.languages) == null ? void 0 : _a.includes("es");
      });
    } catch (e) {
      return [];
    }
  });
}
function getContentDetail(uuid) {
  return __async(this, null, function* () {
    try {
      const { data } = yield axios5.get(`${PHM_API}/en/contents/${uuid}`, { headers: API_HEADERS, timeout: 8e3 });
      return data;
    } catch (e) {
      return {};
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    var _a, _b;
    try {
      let mediaTitle = title;
      if (!mediaTitle && tmdbId) {
        mediaTitle = yield getTmdbTitle(tmdbId, mediaType);
      }
      if (!mediaTitle)
        return [];
      const type = mediaType === "series" || mediaType === "tv" ? "tv" : "movie";
      const candidates = yield searchContents(mediaTitle);
      const match = candidates.find((c) => {
        var _a2;
        return ((_a2 = c.title) == null ? void 0 : _a2.toLowerCase()) === mediaTitle.toLowerCase();
      });
      if (!match)
        return [];
      let finalSources = [];
      if (type === "tv") {
        const detail = yield getContentDetail(match.uuid);
        const seasonObj = (_a = detail.seasons) == null ? void 0 : _a.find((s) => parseInt(s.seasonNumber) === parseInt(season));
        if (!seasonObj)
          return [];
        const { data: episodes } = yield axios5.get(`${PHM_API}/en/episodes?season_id=${seasonObj.id}`, { headers: API_HEADERS });
        const ep = (_b = episodes.data) == null ? void 0 : _b.find((e) => parseInt(e.episodeNumber) === parseInt(episode));
        if (!ep)
          return [];
        finalSources = yield getSources("episode", ep.uuid);
      } else {
        finalSources = yield getSources("content", match.uuid);
      }
      const streams = (yield Promise.allSettled(finalSources.map((s) => __async(this, null, function* () {
        const result = yield resolveEmbed(s.url);
        const finalUrl = result && result.url ? result.url : s.url;
        return {
          langLabel: "Latino",
          serverLabel: s.hostName || "PlayHub",
          url: finalUrl,
          quality: "1080p",
          headers: result && result.headers ? result.headers : { "User-Agent": UA5, "Referer": "https://www.playhubmax.com/" }
        };
      })))).filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
      return yield finalizeStreams(streams, "PlayHubMax", mediaTitle);
    } catch (e) {
      console.error("[PlayHubMax] error:", e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
