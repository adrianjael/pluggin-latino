/**
 * pelisplus - Built from src/pelisplus/
 * Generated: 2026-04-13T00:19:46.905Z
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

// src/pelisplus/http.js
var require_http = __commonJS({
  "src/pelisplus/http.js"(exports2, module2) {
    var BASE_URL = "https://www.pelisplushd.la";
    var LOGO = "https://www.pelisplushd.la/images/logo/logo5.png";
    var DEFAULT_UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    var COMMON_HEADERS = {
      "User-Agent": DEFAULT_UA2,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1"
    };
    function fetchText(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        try {
          const response = yield fetch(url, __spreadValues({
            headers: __spreadValues(__spreadValues({}, COMMON_HEADERS), options.headers)
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
    function fetchJson2(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        const raw = yield fetchText(url, options);
        return JSON.parse(raw);
      });
    }
    function fetchHtml2(url, referer) {
      return __async(this, null, function* () {
        try {
          const headers = __spreadValues({}, COMMON_HEADERS);
          if (referer) {
            headers["Referer"] = referer;
            headers["Sec-Fetch-Site"] = "same-origin";
          }
          const response = yield fetch(url, {
            headers
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
    module2.exports = {
      BASE_URL,
      LOGO,
      fetchText,
      fetchJson: fetchJson2,
      fetchHtml: fetchHtml2
    };
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
    DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
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
    function resolve(url) {
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
                  headers: { "User-Agent": DEFAULT_UA2, "Referer": url }
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
              headers: { "User-Agent": DEFAULT_UA2, "Referer": url }
            };
          }
          return null;
        } catch (e) {
          console.error("[VOE] Error resolviedo: " + e.message);
          return null;
        }
      });
    }
    module2.exports = { resolve };
  }
});

// src/resolvers/hlswish.js
var require_hlswish = __commonJS({
  "src/resolvers/hlswish.js"(exports2, module2) {
    var axios2 = require("axios");
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
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
    function resolve(url) {
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
              const response = yield axios2.get(mirror, {
                headers: { "User-Agent": UA2, "Referer": "https://embed69.org/" },
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
                "User-Agent": UA2,
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
    module2.exports = { resolve };
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
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
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
    function resolve(url) {
      return __async(this, null, function* () {
        try {
          const hostname = new URL(url).hostname;
          const codeMatch = url.match(/\/([a-zA-Z0-9]{8,15})(?:\.html)?$/) || url.match(/\/([a-zA-Z0-9]{8,15})\/?$/);
          if (!codeMatch)
            return null;
          const code = codeMatch[1];
          console.log(`[Byse/Filemoon] Resolviendo CJS v5.6.7: ${code} (${hostname})`);
          const defaultHeaders = {
            "User-Agent": UA2,
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
    module2.exports = { resolve };
  }
});

// src/utils/resolvers.js
var require_resolvers = __commonJS({
  "src/utils/resolvers.js"(exports2, module2) {
    var { resolve: resolveVoe } = require_voe();
    var { resolve: resolveHlswish } = require_hlswish();
    var { resolve: resolveFilemoon } = require_filemoon();
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    function getDirectCdnHeaders(url) {
      if (!url)
        return null;
      const s = url.toLowerCase();
      if (s.includes("vidhide") || s.includes("vhaudm") || s.includes("embedseek") || s.includes("mdfury")) {
        try {
          const origin = new URL(url).origin;
          return {
            "User-Agent": UA2,
            "Referer": origin + "/",
            "Origin": origin.replace(/\/$/, "")
          };
        } catch (e) {
          return { "User-Agent": UA2, "Referer": "https://vidhide.com/", "Origin": "https://vidhide.com" };
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
          "User-Agent": UA2,
          "x-embed-origin": "ww3.gnulahd.nu",
          "x-embed-referer": "https://ww3.gnulahd.nu/",
          "x-embed-parent": referer
        };
      }
      if (s.includes("cloudwindow-route.com") || s.includes("awish.pro") || s.includes("streamwish")) {
        return { "User-Agent": UA2, "Referer": "https://streamwish.to/", "Origin": "https://streamwish.to" };
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
      if (parts.length > 0)
        result.url = `${result.url}|${parts.join("|")}`;
      return result;
    }
    function resolveEmbed(url) {
      return __async(this, null, function* () {
        if (!url)
          return null;
        const s = url.toLowerCase();
        const directHeaders = getDirectCdnHeaders(url);
        if (directHeaders && (s.includes(".m3u8") || s.includes(".mp4") || s.includes(".txt"))) {
          return applyPiping({ url, quality: "HD", headers: directHeaders });
        }
        if (s.includes("voe") || s.includes("jessicaclearout")) {
          const res = yield resolveVoe(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("hlswish") || s.includes("streamwish") || s.includes("hglamioz") || s.includes("embedwish") || s.includes("awish") || s.includes("dwish")) {
          const res = yield resolveHlswish(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("filemoon") || s.includes("398fitus") || s.includes("r66nv9ed") || s.includes("byse")) {
          const res = yield resolveFilemoon(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes(".m3u8") || s.includes(".mp4") || s.includes(".txt")) {
          return applyPiping({
            url,
            quality: "HD",
            headers: { "User-Agent": UA2, "Referer": url }
          });
        }
        return null;
      });
    }
    module2.exports = { resolveEmbed };
  }
});

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

// src/utils/tmdb.js
var require_tmdb = __commonJS({
  "src/utils/tmdb.js"(exports2, module2) {
    var axios2 = require("axios");
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
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            const result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
            const title = result ? result.name || result.title : null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}`;
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
            url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}`;
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

// src/pelisplus/extractor.js
var require_extractor = __commonJS({
  "src/pelisplus/extractor.js"(exports2, module2) {
    var { fetchText, BASE_URL } = require_http();
    var { resolveEmbed } = require_resolvers();
    var { validateStream: validateStream2 } = (init_m3u8(), __toCommonJS(m3u8_exports));
    var { getTmdbTitle: getTmdbTitle2 } = require_tmdb();
    function normalizeTitle2(t) {
      if (!t)
        return "";
      return t.toLowerCase().replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o").replace(/[úùüû]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    }
    function titleMatch(query, target) {
      const q = normalizeTitle2(query);
      const t = normalizeTitle2(target);
      if (!q || !t)
        return false;
      if (q === t || t.includes(q) || q.includes(t))
        return true;
      const qWords = q.split(" ").filter((w) => w.length > 2);
      const tWords = t.split(" ");
      if (qWords.length === 0)
        return false;
      return qWords.every((w) => tWords.includes(w));
    }
    function isSubtitled(lang) {
      if (!lang)
        return false;
      const l = lang.toLowerCase();
      return l.includes("sub") || l.includes("vose");
    }
    function extractStreams2(query, tmdbId, mediaType, season, episode) {
      return __async(this, null, function* () {
        try {
          console.log(`[PelisPlusHD] Extracting: ${query} (TMDB: ${tmdbId}, Type: ${mediaType})`);
          const titlesToTry = [query];
          if (query.split(" ").length > 2)
            titlesToTry.push(query.split(" ")[0]);
          let movieUrl = null;
          for (const q of titlesToTry) {
            if (!q)
              continue;
            const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(q)}`;
            console.log(`[PelisPlusHD] Searching: ${searchUrl}`);
            const searchHtml = yield fetchText(searchUrl);
            const aRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            let m;
            const matches = [];
            while ((m = aRegex.exec(searchHtml)) !== null) {
              const href = m[1];
              const inner = m[2];
              if (mediaType === "movie" && !href.includes("/pelicula/"))
                continue;
              if (mediaType === "tv" && !href.includes("/serie/"))
                continue;
              let resultTitle = "";
              const pMatch = inner.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
              if (pMatch)
                resultTitle = pMatch[1].trim();
              else {
                const tMatch = m[0].match(/data-title="([^"]+)"/i);
                if (tMatch)
                  resultTitle = tMatch[1].trim();
              }
              if (titleMatch(q, resultTitle)) {
                const normalizedQ = normalizeTitle2(q);
                const normalizedT = normalizeTitle2(resultTitle);
                const score = Math.abs(normalizedQ.length - normalizedT.length);
                matches.push({ href: BASE_URL + href, title: resultTitle, score });
              }
            }
            if (matches.length > 0) {
              matches.sort((a, b) => a.score - b.score);
              movieUrl = matches[0].href;
              console.log(`[PelisPlusHD] Best Match: ${matches[0].title} (${movieUrl})`);
              break;
            }
          }
          if (!movieUrl) {
            console.log(`[PelisPlusHD] No matches found for ${tmdbId}`);
            return [];
          }
          if (mediaType === "tv") {
            if (movieUrl.endsWith("/"))
              movieUrl = movieUrl.slice(0, -1);
            movieUrl = `${movieUrl}/temporada/${season}/capitulo/${episode}`;
            console.log(`[PelisPlusHD] Episode URL: ${movieUrl}`);
          }
          const pageHtml = yield fetchText(movieUrl);
          const rawResults = [];
          const optionsRegex = /var\s+options\s*=\s*({[\s\S]*?});/i;
          const optionsMatch = pageHtml.match(optionsRegex);
          if (optionsMatch) {
            console.log("[PelisPlusHD] Found 'var options' JSON.");
            try {
              let jsonStr = optionsMatch[1].replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/\/\/.*/g, "").replace(/'/g, '"');
              const options = JSON.parse(jsonStr);
              for (const key in options) {
                if (isSubtitled(key)) {
                  console.log(`[PelisPlusHD] Skipping subtitled category: ${key}`);
                  continue;
                }
                const list = options[key];
                if (Array.isArray(list)) {
                  list.forEach((item) => {
                    if (item.url)
                      rawResults.push({ serverUrl: item.url, serverName: item.name || key, language: key });
                  });
                }
              }
            } catch (e) {
              console.warn("[PelisPlusHD] JSON parse failed, trying regex on options.");
              const linkRegex = /"url":\s*"([^"]+)"[^{}]*"name":\s*"([^"]+)"/g;
              let linkM;
              while ((linkM = linkRegex.exec(optionsMatch[1])) !== null) {
                const url = linkM[1];
                const label = linkM[2] || "Latino";
                if (!isSubtitled(label)) {
                  rawResults.push({ serverUrl: url, serverName: label, language: label });
                }
              }
            }
          }
          console.log("[PelisPlusHD] Analyzing player blocks...");
          const playerBlocks = pageHtml.split('<div class="player">');
          playerBlocks.shift();
          for (const block of playerBlocks) {
            const langMatch = block.match(/<a[^>]*class="divseason"[^>]*>([\s\S]*?)<\/a>/i);
            const lang = langMatch ? langMatch[1].replace(/<[^>]+>/g, "").trim() : "Latino";
            if (isSubtitled(lang)) {
              console.log(`[PelisPlusHD] Skipping subtitled block: ${lang}`);
              continue;
            }
            const iframeMatch = block.match(/<iframe[^>]*src="([^"]+)"/i);
            if (iframeMatch) {
              const url = iframeMatch[1];
              if (!rawResults.some((r) => r.serverUrl === url)) {
                rawResults.push({ serverUrl: url, serverName: "Active Player", language: lang });
              }
            }
            const liUrlRegex = /<li[^>]*data-url="([^"]+)"[^>]*data-name="([^"]+)"[^>]*>([\s\S]*?)<\/li>/gi;
            let m;
            while ((m = liUrlRegex.exec(block)) !== null) {
              const url = m[1];
              const resLang = m[2] || lang;
              const serverName = m[3].replace(/<[^>]+>/g, "").trim() || "Server";
              if (!isSubtitled(resLang) && !rawResults.some((r) => r.serverUrl === url)) {
                rawResults.push({ serverUrl: url, serverName, language: resLang });
              }
            }
            const liIdRegex = /<li[^>]*data-id="(\d+)"[^>]*>([\s\S]*?)<\/li>/gi;
            let mId;
            while ((mId = liIdRegex.exec(block)) !== null) {
              const id = mId[1];
              const serverName = mId[2].replace(/<[^>]+>/g, "").trim() || "Server";
              const linkRegex = new RegExp(`<span[^>]*lid="${id}"[^>]*url="([^"]+)"`, "i");
              const linkMatch = pageHtml.match(linkRegex);
              if (linkMatch) {
                const url = linkMatch[1];
                if (!rawResults.some((r) => r.serverUrl === url)) {
                  rawResults.push({ serverUrl: url, serverName, language: lang });
                }
              }
            }
          }
          console.log(`[PelisPlusHD] Found ${rawResults.length} raw sources.`);
          const results = [];
          const streamPromises = rawResults.map((res) => __async(this, null, function* () {
            try {
              let finalUrl = null;
              const url = res.serverUrl;
              finalUrl = yield resolveEmbed(url);
              if (finalUrl) {
                const directUrl = typeof finalUrl === "string" ? finalUrl : finalUrl.url;
                if (directUrl) {
                  const streamData = {
                    name: "PelisPlusHD",
                    url: directUrl,
                    quality: "HD",
                    langLabel: res.language,
                    serverLabel: res.serverName,
                    headers: typeof finalUrl === "object" && finalUrl.headers ? finalUrl.headers : { "Referer": BASE_URL }
                  };
                  try {
                    const vStream = yield validateStream2(streamData);
                    if (vStream.verified) {
                      vStream.quality = `(${vStream.quality} \u2713)`;
                    }
                    return vStream;
                  } catch (e) {
                    return streamData;
                  }
                }
              }
            } catch (e) {
              console.error(`[PelisPlusHD] Error resolving ${res.serverUrl}:`, e.message);
            }
            return null;
          }));
          const allResults = yield Promise.all(streamPromises);
          return allResults.filter((s) => s !== null);
        } catch (error) {
          console.error("[PelisPlusHD] extractStreams Error:", error.message);
          return [];
        }
      });
    }
    module2.exports = { extractStreams: extractStreams2 };
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
    if (scoreA === scoreB) {
      if (a.quality === "Auto")
        return 1;
      if (b.quality === "Auto")
        return -1;
    }
    return scoreB - scoreA;
  });
}
var QUALITY_SCORE;
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
      if (l.includes("esp") || l.includes("cas") || l.includes("spa") || l.includes("cast"))
        return "Espa\xF1ol";
      if (l.includes("sub") || l.includes("vose") || l.includes("eng") || l.includes("original"))
        return "Subtitulado";
      return lang || "Latino";
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
          if (lang !== "Latino" && lang !== "Espa\xF1ol" && lang !== "Subtitulado") {
            console.log(`[Engine] Rechazado por idioma (${lang}): ${s.url.substring(0, 40)}...`);
            return null;
          }
          let q = s.verified ? s.quality : s.siteQuality || "HD";
          const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url);
          const check = s.verified ? " \u2713" : "";
          const prefix = mediaTitle ? `${mediaTitle} | ` : "";
          const qualityPart = q ? `[${q}${check}] | ` : "";
          return {
            name: providerName || "Plugin Latino",
            title: `${prefix}${qualityPart}${lang} | ${server}`,
            url: s.url,
            quality: q || "",
            headers: s.headers || {}
          };
        });
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
        });
        console.log(`[Engine] FIN: ${finalized.length} resultados finales enviados a Nuvio para ${providerName}.`);
        return finalized;
      });
    }
    module2.exports = { finalizeStreams: finalizeStreams2 };
  }
});

// src/pelisplus/index.js
var { extractStreams } = require_extractor();
var { finalizeStreams } = require_engine();
var { getTmdbTitle } = require_tmdb();
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      console.log(`[PelisPlusHD] Request: ${mediaType} ${tmdbId} S${season}E${episode}`);
      let mediaTitle = title;
      if (!mediaTitle && tmdbId) {
        mediaTitle = yield getTmdbTitle(tmdbId, mediaType);
      }
      if (!mediaTitle) {
        console.log(`[PelisPlusHD] No TMDB title for ${tmdbId}`);
        return [];
      }
      console.log(`[PelisPlusHD] Target Title: "${mediaTitle}"`);
      const streams = yield extractStreams(mediaTitle, tmdbId, mediaType, season, episode);
      if (streams.length === 0) {
        console.log(`[PelisPlusHD] No streams found for ${tmdbId}`);
        return [];
      }
      return yield finalizeStreams(streams, "PelisPlusHD", mediaTitle);
    } catch (error) {
      console.error(`[PelisPlusHD] Fatal Error: ${error.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
