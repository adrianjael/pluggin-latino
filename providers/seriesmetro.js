/**
 * seriesmetro - Built from src/seriesmetro/
 * Generated: 2026-04-13T05:14:08.392Z
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
  return new Promise((resolve9, reject) => {
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
    var step = (x) => x.done ? resolve9(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/m3u8.js
var require_m3u8 = __commonJS({
  "src/utils/m3u8.js"(exports2, module2) {
    var axios7 = require("axios");
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
    function validateStream(stream) {
      return __async(this, null, function* () {
        if (!stream || !stream.url)
          return stream;
        const { url, headers } = stream;
        try {
          const response = yield axios7.get(url, {
            timeout: 8e3,
            skipSizeCheck: true,
            // REGLA CRÍTICA NUVIO: Ignorar detector de OOM para validación
            headers: __spreadValues({
              "User-Agent": UA5,
              "Range": "bytes=0-4096"
            }, headers || {}),
            responseType: "text"
          });
          const text = response.data;
          if (text && (url.includes(".m3u8") || text.includes("#EXTM3U"))) {
            const realQuality = parseBestQuality(text, url);
            return __spreadProps(__spreadValues({}, stream), { quality: realQuality, verified: true });
          }
          return __spreadProps(__spreadValues({}, stream), { verified: true });
        } catch (error) {
          const fallbackQuality = parseBestQuality("", url);
          return __spreadProps(__spreadValues({}, stream), { quality: fallbackQuality, verified: true });
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
      if (l.includes("esp") || l.includes("cas") || l.includes("spa") || l.includes("cast"))
        return "Espa\xF1ol";
      if (l.includes("sub") || l.includes("vose") || l.includes("eng") || l.includes("original"))
        return "Subtitulado";
      return "Latino";
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
      if (s.includes("filemoon") || u.includes("fmoon") || u.includes("moonembed") || u.includes("moonalu"))
        return "Filemoon";
      if (s.includes("voe") || u.includes("voe-sx") || u.includes("voe.sx"))
        return "VOE";
      if (s.includes("waaw") || s.includes("netu") || s.includes("vimeos") || s.includes("vms.sh") || u.includes("waaw") || u.includes("vms.sh"))
        return "Netu";
      if (s.includes("fastream") || s.includes("fastplay"))
        return "Fastream";
      if (s.includes("buzzheavier"))
        return "Buzzheavier";
      if (s.includes("ok.ru") || s.includes("okru"))
        return "Okru";
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
            streams.map((s) => validateStream(s))
          );
          validated = results.map(
            (r, i) => r.status === "fulfilled" ? r.value : streams[i]
          );
        } catch (e) {
        }
        const sorted = sortStreamsByQuality2(validated);
        const processed = sorted.map((s) => {
          const lang = normalizeLanguage(s.langLabel || s.language || s.lang || s.audio);
          let q = "HD";
          let check = "";
          if (s.verified && s.quality && s.quality !== "Unknown") {
            q = s.quality;
            check = " \u2705";
          }
          const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url);
          const suffix = s.isFallback ? " (Espejo)" : "";
          return {
            name: providerName || "Plugin Latino",
            title: `${mediaTitle} | ${q}${check}${suffix} | ${lang} | ${server}`,
            url: s.url,
            quality: q,
            serverName: server,
            headers: __spreadProps(__spreadValues({}, s.headers || {}), {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            })
          };
        });
        const MAX_RESULTS = 25;
        const uniqueUrls = /* @__PURE__ */ new Set();
        const finalized = processed.filter((s) => s !== null).slice(0, MAX_RESULTS);
        console.log(`[Engine] FIN: ${finalized.length} resultados finales (L\xEDmite: ${MAX_RESULTS}) enviados a Nuvio para ${providerName}.`);
        return finalized;
      });
    }
    module2.exports = { finalizeStreams: finalizeStreams2 };
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
    var axios7 = require("axios");
    var { base64Decode: base64Decode2 } = (init_string(), __toCommonJS(string_exports));
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    function resolve9(url) {
      return __async(this, null, function* () {
        try {
          console.log("[VOE] Resolving v5.6.69: " + url);
          let response = yield axios7.get(url, {
            headers: { "User-Agent": UA5, "Referer": url },
            timeout: 1e4,
            skipSizeCheck: true
          });
          let html = response.data;
          if (typeof html !== "string")
            return null;
          const catcherRegex = /(https?:\/\/[^"']+?\.(?:m3u8|mp4|mkv)[^"']*?)(?=["']|$)/gi;
          const scanAndReturn = (text) => {
            if (!text || typeof text !== "string")
              return null;
            let m;
            while ((m = catcherRegex.exec(text)) !== null) {
              const l = m[1];
              if (!l.includes("test-videos") && !l.includes("BigBuckBunny") && !l.includes("google")) {
                return l;
              }
            }
            return null;
          };
          const firstFind = scanAndReturn(html);
          if (firstFind) {
            console.log("[VOE] \u2705 Enlace detectado proactivamente en primera respuesta.");
            return {
              url: firstFind,
              quality: "1080p",
              serverName: "VOE",
              headers: { "User-Agent": UA5, "Referer": "https://voe.sx/" }
            };
          }
          if (html.includes("Redirecting...") || html.includes("location.href") || html.length < 2e3) {
            const redirectMatch = html.match(/(?:location\.href|location\.replace|location\.assign)\s*=\s*['"]([^'"]+)['"]/i) || html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
            if (redirectMatch) {
              const newUrl = redirectMatch[1];
              console.log("[VOE] -> Siguiendo redirecci\xF3n JS: " + newUrl);
              response = yield axios7.get(newUrl, {
                headers: { "User-Agent": UA5, "Referer": url },
                timeout: 1e4,
                skipSizeCheck: true
              });
              html = response.data;
              const secondFind = scanAndReturn(html);
              if (secondFind) {
                console.log("[VOE] \u2705 Enlace detectado tras redirecci\xF3n.");
                return {
                  url: secondFind,
                  quality: "1080p",
                  serverName: "VOE",
                  headers: { "User-Agent": UA5, "Referer": "https://voe.sx/" }
                };
              }
            }
          }
          const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/i) || html.match(/<script id="data"[\s\S]*?>([\s\S]*?)<\/script>/i);
          if (jsonMatch) {
            console.log("[VOE] Procesando bloque de datos...");
            try {
              const arr = JSON.parse(jsonMatch[1].trim());
              const encText = Array.isArray(arr) ? arr[0] : arr;
              if (typeof encText === "string" && encText.length > 100) {
                let step1 = encText.replace(/[a-zA-Z]/g, function(c) {
                  const code = c.charCodeAt(0);
                  const limit = c <= "Z" ? 90 : 122;
                  const shifted = code + 13;
                  return String.fromCharCode(limit >= shifted ? shifted : shifted - 26);
                });
                const noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
                noise.forEach((n) => step1 = step1.split(n).join(""));
                const step3 = base64Decode2(step1);
                let step4 = "";
                for (let j = 0; j < step3.length; j++) {
                  step4 += String.fromCharCode(step3.charCodeAt(j) - 3);
                }
                const reversed = step4.split("").reverse().join("");
                const finalStr = base64Decode2(reversed);
                let videoUrl = null;
                try {
                  const finalJson = JSON.parse(finalStr);
                  videoUrl = finalJson.source || finalJson.mp4 || finalJson.direct_access_url;
                } catch (e) {
                  const m = finalStr.match(/(https?:\/\/[^"']+?\.(?:m3u8|mp4)[^"']*?)/i);
                  if (m)
                    videoUrl = m[1];
                }
                if (videoUrl) {
                  console.log("[VOE] \u2705 Enlace extra\xEDdo con \xE9xito.");
                  return {
                    url: videoUrl,
                    quality: "1080p",
                    serverName: "VOE",
                    headers: { "User-Agent": UA5, "Referer": "https://voe.sx/" }
                  };
                }
              }
            } catch (ex) {
              console.warn("[VOE] Fallo en procesamiento:", ex.message);
            }
          }
          console.log("[VOE] No se encontr\xF3 contenido en v5.6.67.");
          return null;
        } catch (e) {
          console.error("[VOE] Error: " + e.message);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve9 };
  }
});

// src/resolvers/hlswish.js
var require_hlswish = __commonJS({
  "src/resolvers/hlswish.js"(exports2, module2) {
    var axios7 = require("axios");
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
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
    function resolve9(url) {
      return __async(this, null, function* () {
        try {
          let targetUrl = url;
          const rawId = url.split("/").pop().replace(/\.html$/, "");
          const mirrors = [
            targetUrl,
            `https://embedwish.com/e/${rawId}`,
            `https://hglamioz.com/e/${rawId}`,
            `https://awish.pro/e/${rawId}`
          ];
          let html = "";
          let usedUrl = targetUrl;
          console.log(`[StreamWish] Resolviendo CJS v5.6.9: ${rawId}`);
          for (const mirror of mirrors) {
            try {
              const response = yield axios7.get(mirror, {
                headers: { "User-Agent": UA5, "Referer": "https://embed69.org/" },
                timeout: 5e3
              });
              html = response.data;
              usedUrl = mirror;
              if (html.includes("eval(function") || html.includes(".m3u8"))
                break;
            } catch (e) {
              continue;
            }
          }
          if (!html)
            return null;
          const baseOrigin = (usedUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
          let finalUrl = null;
          let quality = "1080p";
          const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
          if (fileMatch)
            finalUrl = fileMatch[1];
          if (!finalUrl) {
            const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
            if (packedMatch) {
              const unpacked = unpackEval(packedMatch[1], parseInt(packedMatch[2]), packedMatch[4].split("|"));
              const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i) || unpacked.match(/https?:\/\/[^"' \t\n\r]+\.m3u8[^"' \t\n\r]*/i);
              if (m3u8Match)
                finalUrl = m3u8Match[1] || m3u8Match[0];
            }
          }
          if (!finalUrl)
            return null;
          if (finalUrl.startsWith("/"))
            finalUrl = baseOrigin + finalUrl;
          finalUrl = finalUrl.replace(/\\/g, "");
          const qMatch = finalUrl.match(/[_-](\d{3,4})[pP]?/);
          if (qMatch)
            quality = qMatch[1] + "p";
          return {
            url: finalUrl,
            quality,
            serverName: "StreamWish",
            headers: {
              "User-Agent": UA5,
              "Referer": baseOrigin + "/",
              "Origin": baseOrigin
            }
          };
        } catch (e) {
          console.log(`[StreamWish] Error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve9 };
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
    var axios7 = require("axios");
    var { decryptGCM: decryptGCM2 } = (init_aes_gcm(), __toCommonJS(aes_gcm_exports));
    var { base64Decode: base64Decode2, utf8Decode: utf8Decode2 } = (init_string(), __toCommonJS(string_exports));
    var { API_KEYS: API_KEYS2 } = (init_config(), __toCommonJS(config_exports));
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
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
          console.log(`[Byse Decrypt] Error: ${e.message}`);
          return null;
        }
      });
    }
    function resolve9(url) {
      return __async(this, null, function* () {
        try {
          const defaultHeaders = { "User-Agent": UA5, "Referer": url };
          console.log(`[Filemoon] Resolving v5.6.71: ${url}`);
          let response = yield axios7.get(url, {
            headers: defaultHeaders,
            timeout: 1e4,
            skipSizeCheck: true
          });
          let html = response.data;
          if (typeof html !== "string")
            return null;
          const catcherRegex = /(https?:\/\/[^"']+?\.(?:m3u8|mp4|mkv)[^"']*?)(?=["']|$)/gi;
          const scanAndReturn = (text) => {
            let m;
            while ((m = catcherRegex.exec(text)) !== null) {
              const l = m[1];
              if (!l.includes("test-videos") && !l.includes("BigBuckBunny") && !l.includes("google")) {
                return l;
              }
            }
            return null;
          };
          const firstFind = scanAndReturn(html);
          if (firstFind) {
            console.log("[Filemoon] \u2705 Enlace detectado proactivamente.");
            return {
              url: firstFind,
              quality: "1080p",
              serverName: "Filemoon",
              headers: defaultHeaders
            };
          }
          if (html.includes("location.href") || html.includes("Redirecting...") || html.length < 2e3) {
            const redirectMatch = html.match(/(?:location\.href|location\.replace|location\.assign|window\.location\.href)\s*=\s*['"]([^'"]+)['"]/i);
            if (redirectMatch) {
              const newUrl = redirectMatch[1];
              console.log(`[Filemoon] -> Siguiendo redirecci\xF3n JS: ${newUrl}`);
              response = yield axios7.get(newUrl, {
                headers: { "User-Agent": UA5, "Referer": url },
                timeout: 1e4,
                skipSizeCheck: true
              });
              html = response.data;
              const secondFind = scanAndReturn(html);
              if (secondFind) {
                console.log("[Filemoon] \u2705 Enlace detectado tras redirecci\xF3n.");
                return {
                  url: secondFind,
                  quality: "1080p",
                  serverName: "Filemoon",
                  headers: { "User-Agent": UA5, "Referer": newUrl }
                };
              }
            }
          }
          try {
            const codeMatch = url.match(/\/([a-zA-Z0-9]{8,20})(?:\.html)?$/);
            const code = codeMatch ? codeMatch[1] : url.split("/").pop();
            const hostname = new URL(url).hostname;
            let targetHost = hostname;
            let targetCode = code;
            let refererForPlayback = url;
            const detailsUrl = `https://${targetHost}/api/videos/${targetCode}/embed/details`;
            const { data: details } = yield axios7.get(detailsUrl, {
              headers: __spreadProps(__spreadValues({}, defaultHeaders), { "x-embed-origin": "ww3.gnulahd.nu" }),
              timeout: 5e3
            });
            if (details && details.embed_frame_url) {
              const frameUrl = details.embed_frame_url;
              const frameUri = new URL(frameUrl);
              targetCode = frameUri.pathname.split("/").pop();
              targetHost = frameUri.hostname;
              refererForPlayback = frameUrl;
            }
            const pbHeaders = __spreadProps(__spreadValues({}, defaultHeaders), { "Referer": refererForPlayback, "x-embed-parent": url });
            const { data: pbData } = yield axios7.get(`https://${targetHost}/api/videos/${targetCode}/embed/playback`, { headers: pbHeaders, timeout: 8e3 });
            if (pbData.playback) {
              const decrypted = yield decryptByse(pbData.playback);
              if (decrypted && decrypted.sources) {
                console.log("[Filemoon] \u2705 URL obtenida por API Byse.");
                const best = decrypted.sources[0];
                return {
                  url: best.url,
                  quality: best.label || "1080p",
                  serverName: "Filemoon",
                  headers: pbHeaders
                };
              }
            }
          } catch (apiErr) {
            console.log(`[Filemoon] API Byse fall\xF3: ${apiErr.message}`);
          }
          const lastFind = scanAndReturn(html);
          if (lastFind) {
            console.log("[Filemoon] \u2705 URL encontrada por Catcher Regex Final.");
            return {
              url: lastFind,
              quality: "1080p",
              serverName: "Filemoon",
              headers: defaultHeaders
            };
          }
          return null;
        } catch (e) {
          console.log(`[Filemoon] Error en resoluci\xF3n: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve9 };
  }
});

// src/resolvers/vidhide.js
var require_vidhide = __commonJS({
  "src/resolvers/vidhide.js"(exports2, module2) {
    var axios7 = require("axios");
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
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
    function resolve9(url) {
      return __async(this, null, function* () {
        try {
          console.log(`[VidHide] Resolviendo: ${url}`);
          const { data: html } = yield axios7.get(url, {
            timeout: 1e4,
            headers: { "User-Agent": UA5, "Referer": "https://embed69.org/" }
          });
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
            const rawMatch = html.match(/"hls[24]"\s*:\s*"([^"]+)"/) || html.match(/file\s*:\s*["']([^"']+)["']/i);
            if (rawMatch)
              finalUrl = rawMatch[1];
          }
          if (!finalUrl)
            return null;
          if (!finalUrl.startsWith("http")) {
            finalUrl = new URL(url).origin + finalUrl;
          }
          const domain = new URL(url).origin;
          return {
            url: finalUrl,
            quality,
            serverName: "VidHide",
            headers: { "User-Agent": UA5, "Referer": domain + "/", "Origin": domain }
          };
        } catch (e) {
          console.log(`[VidHide] Error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve9 };
  }
});

// src/resolvers/quality.js
var require_quality = __commonJS({
  "src/resolvers/quality.js"(exports2, module2) {
    var axios7 = require("axios");
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function detectQuality3(_0) {
      return __async(this, arguments, function* (url, headers = {}) {
        try {
          if (!url || !url.includes(".m3u8"))
            return "1080p";
          const { data } = yield axios7.get(url, {
            timeout: 5e3,
            headers: __spreadValues({
              "User-Agent": UA5
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
    module2.exports = { detectQuality: detectQuality3 };
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
var import_axios2, DEFAULT_UA, MOBILE_UA;
var init_http = __esm({
  "src/utils/http.js"() {
    import_axios2 = __toESM(require("axios"));
    DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
  }
});

// src/resolvers/fastream.js
var fastream_exports = {};
__export(fastream_exports, {
  resolve: () => resolve2
});
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
function resolve2(url) {
  return __async(this, null, function* () {
    try {
      console.log("[Fastream] Resolviendo: " + url);
      var data = yield fetchHtml(url, {
        headers: { "User-Agent": DEFAULT_UA, "Referer": "https://www3.seriesmetro.net/" }
      });
      var unpacked = unpackPacker(data);
      var m3u8Match;
      if (!unpacked) {
        m3u8Match = data.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
        if (m3u8Match && m3u8Match[1]) {
          var url1 = m3u8Match[1];
          return {
            url: url1,
            quality: q1 || "1080p",
            serverName: "Fastream",
            headers: { "User-Agent": DEFAULT_UA, "Referer": "https://fastream.to/" }
          };
        }
        return null;
      }
      m3u8Match = unpacked.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
      if (!m3u8Match || !m3u8Match[1])
        return null;
      var m3u8Url = m3u8Match[1];
      var quality = yield (0, import_quality2.detectQuality)(m3u8Url, { "Referer": "https://fastream.to/" });
      return {
        url: m3u8Url,
        quality: quality || "1080p",
        serverName: "Fastream",
        headers: { "User-Agent": DEFAULT_UA, "Referer": "https://fastream.to/" }
      };
    } catch (e) {
      console.log("[Fastream] Error: " + e.message);
      return null;
    }
  });
}
var import_quality2;
var init_fastream = __esm({
  "src/resolvers/fastream.js"() {
    init_http();
    import_quality2 = __toESM(require_quality());
  }
});

// src/resolvers/vimeos.js
var vimeos_exports = {};
__export(vimeos_exports, {
  resolve: () => resolve3
});
function resolve3(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log("[Vimeos] Resolviendo Universal (v2.0): " + embedUrl);
      var html = yield fetchHtml(embedUrl, {
        headers: {
          "User-Agent": DEFAULT_UA,
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
          var config = yield fetchJson("https://player.vimeo.com/video/" + vimeoId + "/config", {
            headers: { "User-Agent": DEFAULT_UA, "Referer": embedUrl }
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
              headers: { "User-Agent": DEFAULT_UA, "Referer": "https://player.vimeo.com/" }
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
              headers: { "User-Agent": DEFAULT_UA, "Referer": "https://player.vimeo.com/" }
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
            headers: { "User-Agent": DEFAULT_UA, "Referer": "https://vimeos.net/" }
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
var init_vimeos = __esm({
  "src/resolvers/vimeos.js"() {
    init_http();
  }
});

// src/resolvers/buzzheavier.js
var buzzheavier_exports = {};
__export(buzzheavier_exports, {
  resolve: () => resolve4
});
function resolve4(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log("[Buzzheavier] Resolviendo: " + embedUrl);
      const html = yield fetchHtml(embedUrl, {
        headers: {
          "User-Agent": DEFAULT_UA,
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
            "User-Agent": DEFAULT_UA,
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
var init_buzzheavier = __esm({
  "src/resolvers/buzzheavier.js"() {
    init_http();
  }
});

// src/resolvers/okru.js
var okru_exports = {};
__export(okru_exports, {
  resolve: () => resolve5
});
function resolve5(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[OkRu] Resolviendo: ${embedUrl}`);
      const { data: raw } = yield import_axios3.default.get(embedUrl, {
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
var import_axios3, UA2;
var init_okru = __esm({
  "src/resolvers/okru.js"() {
    import_axios3 = __toESM(require("axios"));
    UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/resolvers/pixeldrain.js
var pixeldrain_exports = {};
__export(pixeldrain_exports, {
  resolve: () => resolve6
});
function resolve6(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log("[Pixeldrain] Resolviendo: " + embedUrl);
      const idMatch = embedUrl.match(/\/(u|l|api\/file)\/([a-zA-Z0-9]+)/i);
      if (!idMatch) {
        console.log("[Pixeldrain] No se pudo encontrar un ID v\xE1lido en la URL.");
        return null;
      }
      const fileId = idMatch[2];
      const directUrl = `https://pixeldrain.com/api/file/${fileId}`;
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
    var { fetchHtml: fetchHtml2, DEFAULT_UA: DEFAULT_UA2 } = (init_http(), __toCommonJS(http_exports));
    function resolve9(url) {
      return __async(this, null, function* () {
        try {
          console.log("[Playmogo] Resolving: " + url);
          return {
            url,
            quality: "720p",
            serverName: "Playmogo",
            headers: {
              "User-Agent": DEFAULT_UA2,
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
    module2.exports = { resolve: resolve9 };
  }
});

// src/resolvers/turbovid.js
var turbovid_exports = {};
__export(turbovid_exports, {
  resolve: () => resolve7
});
function resolve7(embedUrl) {
  return __async(this, null, function* () {
    try {
      const { data: html } = yield import_axios4.default.get(embedUrl, {
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
var import_axios4, UA3;
var init_turbovid = __esm({
  "src/resolvers/turbovid.js"() {
    import_axios4 = __toESM(require("axios"));
    UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/resolvers/embedseek.js
var embedseek_exports = {};
__export(embedseek_exports, {
  resolve: () => resolve8
});
function resolve8(url) {
  return __async(this, null, function* () {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      const hash = parsedUrl.hash;
      const id = hash.replace("#", "").split("&")[0];
      if (!id)
        throw new Error("ID no encontrado en el hash");
      const apiUrl = `${parsedUrl.origin}/api/v1/info?id=${id}`;
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": url,
        "Origin": parsedUrl.origin
      };
      const response = yield import_axios5.default.get(apiUrl, { headers });
      const encryptedData = response.data;
      if (typeof encryptedData !== "string") {
        throw new Error("Respuesta de API no v\xE1lida");
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
        return videoUrl;
      } else {
        throw new Error("URL de video no encontrada en JSON descifrado");
      }
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
  const keyArr = new Uint8Array(16);
  for (let i = 0; i < Math.min(n.length, 16); i++) {
    keyArr[i] = n.charCodeAt(i) & 255;
  }
  return import_crypto_js2.default.lib.WordArray.create(keyArr);
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
  const ivArr = new Uint8Array(16);
  for (let i = 0; i < Math.min(b.length, 16); i++) {
    ivArr[i] = b.charCodeAt(i) & 255;
  }
  return import_crypto_js2.default.lib.WordArray.create(ivArr);
}
function decrypt(hex, keyWA, ivWA) {
  const ciphertextWA = import_crypto_js2.default.enc.Hex.parse(hex);
  const decrypted = import_crypto_js2.default.AES.decrypt(
    { ciphertext: ciphertextWA },
    keyWA,
    {
      iv: ivWA,
      mode: import_crypto_js2.default.mode.CBC,
      padding: import_crypto_js2.default.pad.Pkcs7
    }
  );
  return decrypted.toString(import_crypto_js2.default.enc.Utf8);
}
var import_axios5, import_crypto_js2;
var init_embedseek = __esm({
  "src/resolvers/embedseek.js"() {
    import_axios5 = __toESM(require("axios"));
    import_crypto_js2 = __toESM(require("crypto-js"));
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
    var { resolve: resolveFastream } = (init_fastream(), __toCommonJS(fastream_exports));
    var { resolve: resolveVimeos } = (init_vimeos(), __toCommonJS(vimeos_exports));
    var { resolve: resolveBuzzheavier } = (init_buzzheavier(), __toCommonJS(buzzheavier_exports));
    var { resolve: resolveOkru } = (init_okru(), __toCommonJS(okru_exports));
    var { resolve: resolvePixeldrain } = (init_pixeldrain(), __toCommonJS(pixeldrain_exports));
    var { resolve: resolvePlaymogo } = require_playmogo();
    var { resolve: resolveTurbovid } = (init_turbovid(), __toCommonJS(turbovid_exports));
    var { resolve: resolveEmbedseek } = (init_embedseek(), __toCommonJS(embedseek_exports));
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function getDirectCdnHeaders(url) {
      if (!url)
        return null;
      const s = url.toLowerCase();
      try {
        const domain = new URL(url).hostname;
        const headers = { "User-Agent": UA5, "Referer": `https://${domain}/`, "Origin": `https://${domain}` };
        if (s.includes("filemoon") || s.includes("byse") || s.includes("r66nv9ed") || s.includes("398fitus")) {
          headers["x-embed-origin"] = "ww3.gnulahd.nu";
          headers["x-embed-parent"] = `https://${domain}/`;
        }
        return headers;
      } catch (e) {
        return { "User-Agent": UA5, "Referer": url };
      }
    }
    function applyPiping(result) {
      if (!result || !result.url)
        return result;
      let url = result.url;
      if (!url.includes(".m3u8") && !url.includes(".mp4")) {
        url += ".m3u8";
      }
      if (result.headers) {
        const parts = Object.entries(result.headers).map(([k, v]) => `${k}=${v}`);
        if (parts.length > 0) {
          url = `${url}|${parts.join("|")}`;
        }
      }
      result.url = url;
      return result;
    }
    function resolveEmbed2(url) {
      return __async(this, null, function* () {
        if (!url)
          return null;
        const s = url.toLowerCase();
        if (s.includes("voe") || s.includes("voe.sx") || s.includes("jessicaclearout") || s.includes("shonydar") || s.includes("marissashare") || s.includes("reithen") || s.includes("ugc-cdn") || s.includes("cloudwindow") || s.includes("voe-sx") || s.includes("voex.sx")) {
          const res = yield resolveVoe(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("hlswish") || s.includes("streamwish") || s.includes("hglink") || s.includes("hglamioz") || s.includes("hglink.to") || s.includes("audinifer") || s.includes("embedwish") || s.includes("awish") || s.includes("dwish") || s.includes("strwish") || s.includes("filelions") || s.includes("wishembed")) {
          const res = yield resolveHlswish(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("filemoon") || s.includes("bysedikamoum") || s.includes("398fitus") || s.includes("r66nv9ed") || s.includes("byse") || s.includes("bysevepoin") || s.includes("bysezejataos") || s.includes("moonalu") || s.includes("moonembed")) {
          const res = yield resolveFilemoon(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("vidhide") || s.includes("minochinos") || s.includes("vadisov") || s.includes("vaiditv") || s.includes("amusemre") || s.includes("callistanise") || s.includes("vhaudm") || s.includes("embedseek") || s.includes("mdfury") || s.includes("dintezuvio") || s.includes("acek-cdn") || s.includes("vedonm")) {
          const res = yield resolveVidhide(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("fastream") || s.includes("fastplay")) {
          const res = yield resolveFastream(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("vimeos") || s.includes("vms.sh")) {
          const res = yield resolveVimeos(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("ok.ru") || s.includes("okru")) {
          const res = yield resolveOkru(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("buzzheavier")) {
          const res = yield resolveBuzzheavier(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("goodstream") || s.includes("gs.one")) {
          const res = yield resolveGoodstream(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("playmogo"))
          return applyPiping(yield resolvePlaymogo(url));
        if (s.includes("turbovid"))
          return applyPiping(yield resolveTurbovid(url));
        if (s.includes("pixeldrain"))
          return applyPiping(yield resolvePixeldrain(url));
        if (s.includes("embedseek"))
          return applyPiping(yield resolveEmbedseek(url));
        if (s.includes(".m3u8") || s.includes(".mp4")) {
          const directHeaders = getDirectCdnHeaders(url);
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
    var axios7 = require("axios");
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
            const { data } = yield axios7.get(url, { timeout: 6e3 });
            const result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
            const title = result ? result.name || result.title : null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}`;
            const { data } = yield axios7.get(url, { timeout: 6e3 });
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
            const { data } = yield axios7.get(url, { timeout: 6e3 });
            result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}`;
            const { data } = yield axios7.get(url, { timeout: 6e3 });
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

// src/seriesmetro/index.js
var axios6 = require("axios");
var { finalizeStreams } = require_engine();
var { resolveEmbed } = require_resolvers();
var { getTmdbTitle } = require_tmdb();
var BASE = "https://www3.seriesmetro.net";
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var HEADERS = {
  "User-Agent": UA4,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1"
};
var LANG_PRIORITY = ["latino", "lat", "castellano", "espa\xF1ol", "esp", "vose", "sub", "subtitulado"];
var LANG_MAP = {
  "latino": "Latino",
  "lat": "Latino",
  "castellano": "Espa\xF1ol",
  "espa\xF1ol": "Espa\xF1ol",
  "esp": "Espa\xF1ol",
  "vose": "Subtitulado",
  "sub": "Subtitulado",
  "subtitulado": "Subtitulado"
};
function buildSlug(title) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function findContentUrl(tmdbInfo, mediaType) {
  return __async(this, null, function* () {
    const { title, originalTitle } = tmdbInfo;
    const category = mediaType === "movie" ? "pelicula" : "serie";
    const slugs = [];
    if (title)
      slugs.push(buildSlug(title));
    if (originalTitle && originalTitle !== title)
      slugs.push(buildSlug(originalTitle));
    for (const slug of slugs) {
      const url = `${BASE}/${category}/${slug}/`;
      try {
        const { data } = yield axios6.get(url, { timeout: 8e3, headers: HEADERS });
        if (data.includes("trembed=") || data.includes("data-post=")) {
          console.log(`[SeriesMetro] \u2713 Encontrado: /${category}/${slug}/`);
          return { url, html: data };
        }
      } catch (e) {
      }
    }
    return null;
  });
}
function getEpisodeUrl(serieUrl, serieHtml, season, episode) {
  return __async(this, null, function* () {
    var _a;
    const dpost = (_a = serieHtml.match(/data-post="(\d+)"/)) == null ? void 0 : _a[1];
    if (!dpost)
      return null;
    try {
      const { data: epData } = yield axios6.post(
        `${BASE}/wp-admin/admin-ajax.php`,
        new URLSearchParams({ action: "action_select_season", post: dpost, season: String(season) }),
        { headers: __spreadProps(__spreadValues({}, HEADERS), { "Content-Type": "application/x-www-form-urlencoded", "Referer": serieUrl }) }
      );
      const epUrls = [...epData.matchAll(/href="([^"]+\/capitulo\/[^"]+)"/g)].map((m) => m[1]);
      return epUrls.find((u) => {
        const m = u.match(/temporada-(\d+)-capitulo-(\d+)/);
        return m && parseInt(m[1]) === season && parseInt(m[2]) === episode;
      }) || null;
    } catch (e) {
      return null;
    }
  });
}
function extractStreams(pageUrl, referer) {
  return __async(this, null, function* () {
    var _a;
    try {
      const { data } = yield axios6.get(pageUrl, { timeout: 8e3, headers: __spreadProps(__spreadValues({}, HEADERS), { "Referer": referer }) });
      const options = [...data.matchAll(/href="#options-(\d+)"[^>]*>[\s\S]*?<span class="server">([\s\S]*?)<\/span>/g)];
      const trids = [...data.matchAll(/\?trembed=(\d+)(?:&#038;|&)trid=(\d+)(?:&#038;|&)trtype=(\d+)/g)];
      if (trids.length === 0 || options.length === 0)
        return [];
      const trid = trids[0][2];
      const trtype = trids[0][3];
      const sorted = options.sort(([, , a], [, , b]) => {
        const aL = a.replace(/<[^>]+>/g, "").split("-").pop().trim().toLowerCase();
        const bL = b.replace(/<[^>]+>/g, "").split("-").pop().trim().toLowerCase();
        const ai = LANG_PRIORITY.indexOf(aL);
        const bi = LANG_PRIORITY.indexOf(bL);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      const streams = [];
      for (const [, idx, srvRaw] of sorted) {
        const srvText = srvRaw.replace(/<[^>]+>/g, "").trim();
        const langRaw = srvText.split("-").pop().trim().toLowerCase();
        const lang = LANG_MAP[langRaw] || langRaw;
        try {
          const { data: embedPage } = yield axios6.get(
            `${BASE}/?trembed=${idx}&trid=${trid}&trtype=${trtype}`,
            { timeout: 8e3, headers: __spreadProps(__spreadValues({}, HEADERS), { "Referer": pageUrl }) }
          );
          const iframeUrl = (_a = embedPage.match(/<iframe[^>]*src="([^"]+)"/i)) == null ? void 0 : _a[1];
          if (!iframeUrl)
            continue;
          const stream = yield resolveEmbed(iframeUrl);
          if (stream && stream.url) {
            streams.push({
              langLabel: lang,
              serverLabel: stream.serverName || "Server",
              url: stream.url,
              quality: stream.quality || "HD",
              headers: stream.headers || HEADERS
            });
          }
        } catch (e) {
        }
      }
      return streams;
    } catch (e) {
      return [];
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    if (!tmdbId || !mediaType)
      return [];
    try {
      let mediaTitle = title;
      if (!mediaTitle && tmdbId) {
        mediaTitle = yield getTmdbTitle(tmdbId, mediaType);
      }
      if (!mediaTitle)
        return [];
      const found = yield findContentUrl({ title: mediaTitle }, mediaType);
      if (!found)
        return [];
      let targetUrl = found.url;
      if (mediaType === "tv" && season && episode) {
        const epUrl = yield getEpisodeUrl(found.url, found.html, season, episode);
        if (!epUrl)
          return [];
        targetUrl = epUrl;
      }
      const streams = yield extractStreams(targetUrl, found.url);
      return yield finalizeStreams(streams, "SeriesMetro", mediaTitle);
    } catch (e) {
      console.log(`[SeriesMetro] Error: ${e.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
