/**
 * xupalace - Built from src/xupalace/
 * Generated: 2026-04-08T22:08:23.337Z
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
  return new Promise((resolve5, reject) => {
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
    var step = (x) => x.done ? resolve5(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/http.js
var require_http = __commonJS({
  "src/utils/http.js"(exports, module2) {
    var DEFAULT_UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    var MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
    function request(url, options) {
      return __async(this, null, function* () {
        var opt = options || {};
        var headers = Object.assign({
          "User-Agent": opt.mobile ? MOBILE_UA : DEFAULT_UA2,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
        }, opt.headers);
        try {
          var fetchOptions = Object.assign({}, opt, { headers });
          var response = yield fetch(url, fetchOptions);
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
    function fetchHtml2(url, options) {
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
      fetchHtml: fetchHtml2,
      fetchJson,
      DEFAULT_UA: DEFAULT_UA2,
      MOBILE_UA
    };
  }
});

// src/xupalace/index.js
var xupalace_exports = {};
__export(xupalace_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(xupalace_exports);
var import_axios4 = __toESM(require("axios"));

// src/utils/m3u8.js
var import_axios = __toESM(require("axios"));
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
function parseBestQuality(content) {
  const lines = content.split("\n");
  let bestHeight = 0;
  for (const line of lines) {
    if (line.includes("RESOLUTION=")) {
      const match = line.match(/RESOLUTION=\d+x(\d+)/);
      if (match) {
        const height = parseInt(match[1]);
        if (height > bestHeight)
          bestHeight = height;
      }
    }
  }
  return bestHeight > 0 ? getQualityFromHeight(bestHeight) : "720p";
}
function validateStream(stream) {
  return __async(this, null, function* () {
    if (!stream || !stream.url)
      return stream;
    const { url, headers } = stream;
    try {
      const response = yield import_axios.default.get(url, {
        timeout: 4e3,
        responseType: "text",
        headers: __spreadProps(__spreadValues({}, headers || {}), {
          "Accept": "*/*",
          "User-Agent": (headers == null ? void 0 : headers["User-Agent"]) || "Mozilla/5.0"
        })
      });
      if (response.data && typeof response.data === "string" && (url.includes(".m3u8") || response.data.includes("#EXTM3U"))) {
        const realQuality = parseBestQuality(response.data);
        return __spreadProps(__spreadValues({}, stream), {
          quality: realQuality,
          verified: true
          // <--- Marcamos como verificado
        });
      }
      return __spreadProps(__spreadValues({}, stream), { verified: true });
    } catch (error) {
      return __spreadProps(__spreadValues({}, stream), { verified: false });
    }
  });
}

// src/utils/sorting.js
var QUALITY_SCORE = {
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

// src/utils/engine.js
function normalizeLanguage(lang) {
  const l = (lang || "").toLowerCase();
  if (l.includes("latino") || l.includes("lat"))
    return "Latino";
  if (l.includes("espa\xF1ol") || l.includes("castellano") || l.includes("esp"))
    return "Espa\xF1ol";
  if (l.includes("sub") || l.includes("vose"))
    return "Subtitulado";
  return lang || "Latino";
}
function normalizeServer(server) {
  if (!server)
    return "Servidor";
  const s = server.toLowerCase();
  if (s.includes("voe"))
    return "VOE";
  if (s.includes("filemoon"))
    return "Filemoon";
  if (s.includes("streamwish") || s.includes("awish") || s.includes("dwish"))
    return "StreamWish";
  if (s.includes("vidhide") || s.includes("dintezuvio"))
    return "VidHide";
  if (s.includes("waaw") || s.includes("netu"))
    return "Netu";
  if (s.includes("fastream"))
    return "Fastream";
  return server;
}
function finalizeStreams(streams, providerName) {
  return __async(this, null, function* () {
    if (!Array.isArray(streams) || streams.length === 0)
      return [];
    console.log(`[Engine] Processing ${streams.length} streams for ${providerName}...`);
    let validated = streams;
    try {
      const results = yield Promise.allSettled(
        streams.map((s) => validateStream(s))
      );
      validated = results.map(
        (r, i) => r.status === "fulfilled" ? r.value : streams[i]
      );
    } catch (e) {
      console.error(`[Engine] Validation error: ${e.message}`);
    }
    const sorted = sortStreamsByQuality(validated);
    return sorted.map((s) => {
      const q = s.quality || "HD";
      const lang = normalizeLanguage(s.langLabel || s.language);
      const server = normalizeServer(s.serverLabel || s.serverName || s.servername);
      const check = s.verified ? " \u2713" : "";
      return {
        name: providerName || s.name || "Provider",
        title: `${q}${check} \xB7 ${lang} \xB7 ${server}`,
        url: s.url,
        quality: q,
        headers: s.headers || {}
      };
    });
  });
}

// src/resolvers/hlswish.js
var import_axios2 = __toESM(require("axios"));
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
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
var DOMAIN_MAP = {
  "hglink.to": "vibuxer.com"
};
function resolve(url) {
  return __async(this, null, function* () {
    try {
      let targetUrl = url;
      for (const [old, replacement] of Object.entries(DOMAIN_MAP)) {
        if (targetUrl.includes(old)) {
          targetUrl = targetUrl.replace(old, replacement);
          break;
        }
      }
      console.log(`[HLSWish] Resolviendo: ${url}`);
      const baseOrigin = (targetUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
      const { data: html } = yield import_axios2.default.get(targetUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": "https://embed69.org/",
          "Origin": "https://embed69.org"
        },
        timeout: 15e3,
        maxRedirects: 5
      });
      let finalUrl = null;
      const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
      if (fileMatch) {
        finalUrl = fileMatch[1];
        if (finalUrl.startsWith("/"))
          finalUrl = baseOrigin + finalUrl;
      }
      if (!finalUrl) {
        const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packedMatch) {
          const unpacked = unpackEval(packedMatch[1], parseInt(packedMatch[2]), packedMatch[4].split("|"));
          const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
          if (m3u8Match) {
            finalUrl = m3u8Match[1];
            if (finalUrl.startsWith("/"))
              finalUrl = baseOrigin + finalUrl;
          }
        }
      }
      if (finalUrl) {
        console.log(`[HLSWish] URL encontrada: ${finalUrl.substring(0, 80)}...`);
        return {
          url: finalUrl,
          quality: "1080p",
          headers: { "User-Agent": UA, "Referer": baseOrigin + "/" }
        };
      }
      return null;
    } catch (e) {
      console.log(`[HLSWish] Error: ${e.message}`);
      return null;
    }
  });
}

// src/utils/aes-gcm.js
var import_crypto_js = __toESM(require("crypto-js"));
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

// src/utils/string.js
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

// src/resolvers/filemoon.js
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function base64UrlDecode(input) {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4)
    s += "=";
  const bin = base64Decode(s);
  return new Uint8Array(bin.split("").map((c) => c.charCodeAt(0)));
}
function unpack(p, a, c, k, e, d) {
  while (c--)
    if (k[c])
      p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
  return p;
}
function decryptByse(playback) {
  return __async(this, null, function* () {
    try {
      const keyArr = [];
      for (const p of playback.key_parts) {
        base64UrlDecode(p).forEach((b) => keyArr.push(b));
      }
      const key = new Uint8Array(keyArr);
      const iv = base64UrlDecode(playback.iv);
      const ciphertextWithTag = base64UrlDecode(playback.payload);
      if (typeof crypto !== "undefined" && crypto.subtle) {
        try {
          const cryptoKey = yield crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]);
          const decryptedArr = yield crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertextWithTag);
          return JSON.parse(utf8Decode(new Uint8Array(decryptedArr)));
        } catch (e) {
          console.log("[Byse] Subtle fail");
        }
      }
      console.log("[Byse] Usando motor Pure-JS para Hermes...");
      const decryptedStr = decryptGCM(key, iv, ciphertextWithTag);
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
      const idMatch = url.match(/\/e\/([a-zA-Z0-9]+)/);
      if (!idMatch)
        return null;
      const id = idMatch[1];
      console.log(`[Filemoon] Resolviendo: ${id}`);
      try {
        const hostname = new URL(url).hostname;
        const apiRes = yield fetch(`https://${hostname}/api/videos/${id}`, {
          headers: { "User-Agent": UA2, "Referer": url }
        });
        const data = yield apiRes.json();
        if (data.playback) {
          const decrypted = yield decryptByse(data.playback);
          if (decrypted && decrypted.sources) {
            const best = decrypted.sources[0];
            return {
              url: best.url,
              quality: best.height ? `${best.height}p` : "1080p",
              headers: {
                "User-Agent": UA2,
                "Referer": "https://arbitrarydecisions.com/",
                "Origin": "https://arbitrarydecisions.com"
              }
            };
          }
        }
      } catch (apiErr) {
        console.log(`[Filemoon] API Byse Failed: ${apiErr.message}`);
      }
      const res = yield fetch(url, { headers: { "User-Agent": UA2, "Referer": url } });
      const html = yield res.text();
      const evalMatch = html.match(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/);
      if (evalMatch) {
        const unpacked = unpack(evalMatch[1], parseInt(evalMatch[2]), parseInt(evalMatch[3]), evalMatch[4].split("|"), 0, {});
        const fm = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
        if (fm) {
          return {
            url: fm[1],
            quality: "1080p",
            headers: {
              "User-Agent": UA2,
              "Referer": "https://arbitrarydecisions.com/",
              "Origin": "https://arbitrarydecisions.com"
            }
          };
        }
      }
      return null;
    } catch (e) {
      console.error(`[Filemoon] Error Global: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/voe.js
var import_http = __toESM(require_http());
function resolve3(url) {
  return __async(this, null, function* () {
    try {
      console.log("[VOE] Resolving: " + url);
      var html = yield (0, import_http.fetchHtml)(url, { headers: { "User-Agent": import_http.DEFAULT_UA } });
      if (html.indexOf("Redirecting") !== -1 || html.length < 1500) {
        var rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm) {
          html = yield (0, import_http.fetchHtml)(rm[1], { headers: { "User-Agent": import_http.DEFAULT_UA } });
        }
      }
      var jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
      if (jsonMatch) {
        try {
          var parsed = JSON.parse(jsonMatch[1].trim());
          var encText = Array.isArray(parsed) ? parsed[0] : parsed;
          if (typeof encText !== "string")
            return null;
          var rot13 = encText.replace(/[a-zA-Z]/g, function(c) {
            var code = c.charCodeAt(0);
            var limit = c <= "Z" ? 90 : 122;
            var shifted = code + 13;
            return String.fromCharCode(limit >= shifted ? shifted : shifted - 26);
          });
          var noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
          for (var i = 0; i < noise.length; i++) {
            var n = noise[i];
            rot13 = rot13.split(n).join("");
          }
          var b64_1 = base64Decode(rot13);
          var shiftedStr = "";
          for (var j = 0; j < b64_1.length; j++) {
            shiftedStr += String.fromCharCode(b64_1.charCodeAt(j) - 3);
          }
          var reversed = shiftedStr.split("").reverse().join("");
          var data = JSON.parse(base64Decode(reversed));
          if (data && data.source) {
            console.log("[VOE] -> m3u8 encontrado: " + data.source.substring(0, 60) + "...");
            return {
              url: data.source,
              quality: "1080p",
              headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": url }
            };
          }
        } catch (ex) {
          console.error("[VOE] Decryption failed:", ex.message);
        }
      }
      var m3u8MatchRaw = html.match(/["'](https?:\/\/[^"']+?\.m3u8[^"']*?)["']/i);
      if (m3u8MatchRaw) {
        return {
          url: m3u8MatchRaw[1],
          quality: "1080p",
          headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": url }
        };
      }
      return null;
    } catch (e) {
      console.error("[VOE] Error resolviedo: " + e.message);
      return null;
    }
  });
}

// src/resolvers/vidhide.js
var import_axios3 = __toESM(require("axios"));
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
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
function resolve4(url) {
  return __async(this, null, function* () {
    try {
      console.log(`[VidHide] Resolviendo: ${url}`);
      const { data: html } = yield import_axios3.default.get(url, {
        timeout: 15e3,
        maxRedirects: 10,
        headers: { "User-Agent": UA3, "Referer": "https://embed69.org/" }
      });
      let finalUrl = null;
      const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
      if (packedMatch) {
        const unpacked = unpackVidHide(packedMatch[0]);
        if (unpacked) {
          const hlsMatch = unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/);
          if (hlsMatch)
            finalUrl = hlsMatch[1];
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
      if (!finalUrl.startsWith("http")) {
        finalUrl = new URL(url).origin + finalUrl;
      }
      console.log(`[VidHide] URL encontrada: ${finalUrl.substring(0, 80)}...`);
      const origin = new URL(url).origin;
      return {
        url: finalUrl,
        headers: {
          "User-Agent": UA3,
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

// src/xupalace/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE_URL = "https://xupalace.org";
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
var HTML_HEADERS = {
  "User-Agent": UA4,
  "Accept": "text/html",
  "Accept-Language": "es-MX,es;q=0.9",
  "Connection": "keep-alive"
};
var RESOLVER_MAP = {
  "hglink.to": { fn: resolve, name: "StreamWish" },
  "vibuxer.com": { fn: resolve, name: "StreamWish" },
  "bysedikamoum.com": { fn: resolve2, name: "Filemoon" },
  "voe.sx": { fn: resolve3, name: "VOE" },
  "vidhidepro.com": { fn: resolve4, name: "VidHide" },
  "vidhide.com": { fn: resolve4, name: "VidHide" },
  "dintezuvio.com": { fn: resolve4, name: "VidHide" },
  "filelions.to": { fn: resolve4, name: "VidHide" }
};
function getImdbId(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`;
      const { data } = yield import_axios4.default.get(url, { timeout: 5e3, headers: { "User-Agent": UA4 } });
      return data.imdb_id || null;
    } catch (e) {
      return null;
    }
  });
}
function getEmbeds(imdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const path = mediaType === "movie" ? `/video/${imdbId}/` : `/video/${imdbId}-${season}x${String(episode).padStart(2, "0")}/`;
      const { data: html } = yield import_axios4.default.get(`${BASE_URL}${path}`, { timeout: 8e3, headers: HTML_HEADERS });
      const matches = [...html.matchAll(/go_to_playerVast\('(https?:\/\/[^']+)'[^)]+\)[^<]*data-lang="(\d+)"/g)];
      if (matches.length === 0) {
        const fallback = [...html.matchAll(/go_to_playerVast\('(https?:\/\/[^']+)'/g)];
        return { 0: [...new Set(fallback.map((m) => m[1]))] };
      }
      const byLang = {};
      for (const m of matches) {
        const url = m[1];
        const lang = parseInt(m[2]);
        if (!byLang[lang])
          byLang[lang] = [];
        if (!byLang[lang].includes(url))
          byLang[lang].push(url);
      }
      return byLang;
    } catch (e) {
      return {};
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    if (!tmdbId)
      return [];
    const LANG_NAMES = { 0: "Latino", 1: "Espa\xF1ol", 2: "Subtitulado" };
    try {
      const imdbId = yield getImdbId(tmdbId, mediaType);
      if (!imdbId)
        return [];
      const byLang = yield getEmbeds(imdbId, mediaType, season, episode);
      if (Object.keys(byLang).length === 0)
        return [];
      const allStreams = [];
      for (const lang of [0, 1, 2]) {
        const urls = byLang[lang];
        if (!urls || urls.length === 0)
          continue;
        const results = yield Promise.allSettled(urls.map((url) => __async(this, null, function* () {
          try {
            const domain = new URL(url).hostname.replace("www.", "");
            const resolver = RESOLVER_MAP[domain];
            if (!resolver)
              return null;
            const result = yield resolver.fn(url);
            if (result) {
              return {
                langLabel: LANG_NAMES[lang],
                serverLabel: resolver.name,
                url: result.url,
                quality: result.quality || "1080p",
                headers: result.headers || {}
              };
            }
          } catch (e) {
          }
          return null;
        })));
        results.forEach((r) => {
          if (r.status === "fulfilled" && r.value)
            allStreams.push(r.value);
        });
      }
      return yield finalizeStreams(allStreams, "XuPalace");
    } catch (e) {
      console.log(`[XuPalace] Error: ${e.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
