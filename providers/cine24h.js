/**
 * cine24h - Built from src/cine24h/
 * Generated: 2026-04-13T01:39:29.598Z
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
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

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
    var { fetchHtml: fetchHtml3, DEFAULT_UA: DEFAULT_UA3 } = (init_http(), __toCommonJS(http_exports));
    var { base64Decode: base64Decode2 } = (init_string(), __toCommonJS(string_exports));
    function resolve2(url) {
      return __async(this, null, function* () {
        try {
          console.log("[VOE] Resolving: " + url);
          let html = yield fetchHtml3(url, { headers: { "User-Agent": DEFAULT_UA3 } });
          if (html.indexOf("Redirecting") !== -1 || html.length < 1500) {
            const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
            if (rm) {
              html = yield fetchHtml3(rm[1], { headers: { "User-Agent": DEFAULT_UA3 } });
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
                  headers: { "User-Agent": DEFAULT_UA3, "Referer": url }
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
              headers: { "User-Agent": DEFAULT_UA3, "Referer": url }
            };
          }
          return null;
        } catch (e) {
          console.error("[VOE] Error resolviedo: " + e.message);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve2 };
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
    function resolve2(url) {
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
    module2.exports = { resolve: resolve2 };
  }
});

// src/resolvers/quality.js
function detectQuality(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    try {
      if (!url || !url.includes(".m3u8"))
        return "1080p";
      const { data } = yield import_axios2.default.get(url, {
        timeout: 5e3,
        headers: __spreadValues({
          "User-Agent": UA
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
var import_axios2, UA;
var init_quality = __esm({
  "src/resolvers/quality.js"() {
    import_axios2 = __toESM(require("axios"));
    UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/resolvers/fastream.js
var fastream_exports = {};
__export(fastream_exports, {
  resolve: () => resolve
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
function resolve(url) {
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
      var quality = yield detectQuality(m3u8Url, { "Referer": "https://fastream.to/" });
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
var init_fastream = __esm({
  "src/resolvers/fastream.js"() {
    init_http();
    init_quality();
  }
});

// src/resolvers/playmogo.js
var require_playmogo = __commonJS({
  "src/resolvers/playmogo.js"(exports2, module2) {
    var { fetchHtml: fetchHtml3, DEFAULT_UA: DEFAULT_UA3 } = (init_http(), __toCommonJS(http_exports));
    function resolve2(url) {
      return __async(this, null, function* () {
        try {
          console.log("[Playmogo] Resolving: " + url);
          return {
            url,
            quality: "720p",
            serverName: "Playmogo",
            headers: {
              "User-Agent": DEFAULT_UA3,
              "Referer": url
            }
          };
        } catch (e) {
          console.error("[Playmogo] Error: " + e.message);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/cine24h/index.js
var { fetchHtml: fetchHtml2, DEFAULT_UA: DEFAULT_UA2 } = (init_http(), __toCommonJS(http_exports));
var BASE_URL = "https://cine24h.online";
function resolveAnyEmbed(url) {
  return __async(this, null, function* () {
    let target = url;
    if (url.includes("trembed=")) {
      try {
        const html = yield fetchHtml2(url);
        const iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/i);
        if (iframeMatch) {
          target = iframeMatch[1].replace(/&#038;/g, "&");
          if (target.startsWith("//"))
            target = "https:" + target;
        }
      } catch (e) {
        return null;
      }
    }
    try {
      if (target.includes("voe.sx") || target.includes("voe.hu")) {
        const voe = require_voe();
        return yield voe.resolve(target);
      }
      if (target.includes("filemoon")) {
        const filemoon = require_filemoon();
        return yield filemoon.resolve(target);
      }
      if (target.includes("fastream")) {
        const fastream = (init_fastream(), __toCommonJS(fastream_exports));
        return yield fastream.resolve(target);
      }
      if (target.includes("dsvplay") || target.includes("dood") || target.includes("playmogo.com")) {
        const playmogo = require_playmogo();
        return yield playmogo.resolve(target);
      }
    } catch (e) {
      console.error(`[Cine24h] Error resolviendo hoster ${target}: ${e.message}`);
    }
    return null;
  });
}
function getStreams(id, type, season, episode, title) {
  return __async(this, null, function* () {
    try {
      console.log(`[Cine24h] Buscando: ${title}`);
      let searchUrl = `${BASE_URL}/?s=${encodeURIComponent(title)}`;
      let html = yield fetchHtml2(searchUrl);
      const candidates = extractCandidates(html);
      const candidate = candidates.find((c) => c.title.toLowerCase().includes(title.toLowerCase()));
      if (!candidate) {
        console.log(`[Cine24h] No se encontr\xF3 candidato para: ${title}`);
        return [];
      }
      console.log(`[Cine24h] Seleccionado: ${candidate.title} (${candidate.url})`);
      let targetUrl = candidate.url;
      if (type === "serie" && season && episode) {
        const seriesHtml = yield fetchHtml2(candidate.url);
        const epUrl = extractEpisodeFromTable(seriesHtml, season, episode);
        if (epUrl)
          targetUrl = epUrl;
        else {
          console.log(`[Cine24h] Episodio S${season}E${episode} no encontrado.`);
          return [];
        }
      }
      const contentHtml = yield fetchHtml2(targetUrl);
      const embeds = extractEmbedUrls(contentHtml);
      const results = [];
      for (const embedUrl of embeds) {
        const stream = yield resolveAnyEmbed(embedUrl);
        if (stream && stream.url && (stream.url.includes(".mp4") || stream.url.includes(".m3u8") || stream.url.includes("dood"))) {
          results.push({
            name: `Cine24h - ${stream.serverName || "Server"}`,
            title: `${candidate.title} [${stream.quality || "HD"}]`,
            url: stream.url,
            headers: stream.headers || { "User-Agent": DEFAULT_UA2, "Referer": BASE_URL },
            langLabel: candidate.lang || "Latino"
          });
        }
      }
      return results;
    } catch (e) {
      console.error(`[Cine24h] Error: ${e.message}`);
      return [];
    }
  });
}
function extractCandidates(html) {
  const candidates = [];
  const items = html.match(/<article class="TPost[^"]*">([\s\S]*?)<\/article>/g) || [];
  items.forEach((item) => {
    const linkMatch = item.match(/href="([^"]+)"/);
    const titleMatch = item.match(/class="Title">([^<]+)<\/div>/) || item.match(/font-extrabold[^>]*>([^<]+)<\/h2>/);
    if (linkMatch && titleMatch) {
      const title = titleMatch[1].trim();
      const url = linkMatch[1];
      let lang = "Latino";
      if (item.includes("latino.svg") || item.includes("<span>LAT</span>"))
        lang = "Latino";
      else if (item.includes("espanol.svg") || item.includes("<span>ESP</span>"))
        lang = "Espa\xF1ol";
      else if (item.includes("subtitulado.svg") || item.includes("<span>SUB</span>"))
        lang = "Subtitulado";
      candidates.push({ url, title, lang });
    }
  });
  return candidates;
}
function extractEpisodeFromTable(html, season, episode) {
  const parts = html.split('class="AABox"');
  for (const part of parts) {
    const seasonTitleMatch = part.match(/class="Title">Temporada\s*(\d+)/i);
    if (seasonTitleMatch && parseInt(seasonTitleMatch[1]) === season) {
      const epMatch = part.match(new RegExp(`href="([^"]+)"[^>]*>E${episode}\\s*-`, "i")) || part.match(new RegExp(`href="([^"]+)"[^>]*>.*?E${episode}`, "i"));
      if (epMatch)
        return epMatch[1];
    }
  }
  return null;
}
function extractEmbedUrls(html) {
  const embeds = [];
  const base64Matches = html.match(/data-src="([A-Za-z0-9+/=]+)"/g) || [];
  base64Matches.forEach((match) => {
    try {
      const b64 = match.match(/data-src="([^"]+)"/)[1];
      const decoded = Buffer.from(b64, "base64").toString("utf-8");
      if (decoded.includes("trembed=") || decoded.includes("https://")) {
        let url = decoded.replace(/&#038;/g, "&");
        if (url.startsWith("//"))
          url = "https:" + url;
        if (url.startsWith("/"))
          url = BASE_URL + url;
        embeds.push(url);
      }
    } catch (e) {
    }
  });
  const trembedLinks = html.match(/href="([^"]*?\?trembed=\d+[^"]*?)"/g) || [];
  trembedLinks.forEach((link) => {
    let url = link.match(/href="([^"]+)"/)[1].replace(/&#038;/g, "&").replace(/&amp;/g, "&");
    if (url.startsWith("//"))
      url = "https:" + url;
    if (url.startsWith("/"))
      url = BASE_URL + url;
    embeds.push(url);
  });
  const allIframes = html.match(/<iframe[^>]+src="([^"]+)"/g) || [];
  allIframes.forEach((it) => {
    const src = it.match(/src="([^"]+)"/)[1].replace(/&#038;/g, "&");
    if (src && !embeds.includes(src)) {
      if (/(voe|filemoon|fastream|streamwish|dood|vidguard|dsvplay|trembed|playmogo)/i.test(src)) {
        let url = src;
        if (url.startsWith("//"))
          url = "https:" + url;
        if (url.startsWith("/"))
          url = BASE_URL + url;
        embeds.push(url);
      }
    }
  });
  return [...new Set(embeds)];
}
module.exports = { getStreams };
