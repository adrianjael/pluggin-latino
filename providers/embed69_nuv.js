/**
 * embed69_nuv - Built from src/embed69_nuv/
 * Generated: 2026-04-08T20:24:39.123Z
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
  "src/utils/http.js"(exports2, module2) {
    var DEFAULT_UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    var MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
    function request(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        const headers = __spreadValues({
          "User-Agent": options.mobile ? MOBILE_UA : DEFAULT_UA6,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
        }, options.headers);
        try {
          const response = yield fetch(url, __spreadProps(__spreadValues({}, options), {
            headers
          }));
          if (!response.ok && !options.ignoreErrors) {
            console.warn(`[HTTP] Error ${response.status} en ${url}`);
          }
          return response;
        } catch (error) {
          console.error(`[HTTP] Error en ${url}: ${error.message}`);
          throw error;
        }
      });
    }
    function fetchHtml6(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        const res = yield request(url, options);
        return yield res.text();
      });
    }
    function fetchJson3(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        const res = yield request(url, options);
        return yield res.json();
      });
    }
    module2.exports = {
      request,
      fetchHtml: fetchHtml6,
      fetchJson: fetchJson3,
      DEFAULT_UA: DEFAULT_UA6,
      MOBILE_UA
    };
  }
});

// src/embed69_nuv/index.js
var import_http5 = __toESM(require_http());

// src/resolvers/voe.js
var import_http = __toESM(require_http());

// src/utils/string.js
function base64Decode(input) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = String(input).replace(/=+$/, "");
  let output = "";
  if (str.length % 4 === 1)
    throw new Error("Base64 invalido");
  for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}
function utf8Decode(bytes) {
  let out = "", i = 0;
  while (i < bytes.length) {
    let c = bytes[i++];
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
  const match = url.match(/^(https?:\/\/[^\/]+)/);
  return match ? match[1] : "";
}
function getHostname(url) {
  if (!url)
    return "";
  const match = url.match(/^https?:\/\/([^\/]+)/);
  return match ? match[1] : "";
}

// src/resolvers/voe.js
function resolve(url) {
  return __async(this, null, function* () {
    try {
      console.log(`[VOE] Resolving: ${url}`);
      let html = yield (0, import_http.fetchHtml)(url, { headers: { "User-Agent": import_http.DEFAULT_UA } });
      if (html.includes("Redirecting") || html.length < 1500) {
        const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm) {
          html = yield (0, import_http.fetchHtml)(rm[1], { headers: { "User-Agent": import_http.DEFAULT_UA } });
        }
      }
      const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1].trim());
          let encText = Array.isArray(parsed) ? parsed[0] : parsed;
          if (typeof encText !== "string")
            return null;
          let rot13 = encText.replace(/[a-zA-Z]/g, (c) => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
          const noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
          for (const n of noise)
            rot13 = rot13.split(n).join("");
          let b64_1 = base64Decode(rot13);
          let shifted = "";
          for (let i = 0; i < b64_1.length; i++)
            shifted += String.fromCharCode(b64_1.charCodeAt(i) - 3);
          let reversed = shifted.split("").reverse().join("");
          let data = JSON.parse(base64Decode(reversed));
          if (data && data.source) {
            console.log(`[VOE] -> m3u8 encontrado: ${data.source.substring(0, 60)}...`);
            return {
              url: data.source,
              quality: "1080p",
              isM3U8: true,
              headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": url }
            };
          }
        } catch (ex) {
          console.error("[VOE] Decryption failed:", ex.message);
        }
      }
      const m3u8Match = html.match(/["'](https?:\/\/[^"']+?\.m3u8[^"']*?)["']/i);
      if (m3u8Match) {
        return {
          url: m3u8Match[1],
          quality: "1080p",
          isM3U8: true,
          headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": url }
        };
      }
      return null;
    } catch (e) {
      console.error(`[VOE] Error resolviedo: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/filemoon.js
var import_http2 = __toESM(require_http());

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

// src/resolvers/filemoon.js
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
      console.log("[Byse] Using Pure-JS motor for Hermes...");
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
      console.log(`[Filemoon] Resolving: ${id}`);
      try {
        const hostname = getHostname(url);
        const data = yield (0, import_http2.fetchJson)(`https://${hostname}/api/videos/${id}`, {
          headers: { "User-Agent": import_http2.DEFAULT_UA, "Referer": url }
        });
        if (data.playback) {
          const decrypted = yield decryptByse(data.playback);
          if (decrypted && decrypted.sources) {
            const best = decrypted.sources[0];
            return {
              url: best.url,
              quality: best.height ? `${best.height}p` : "1080p",
              isM3U8: true,
              headers: {
                "User-Agent": import_http2.DEFAULT_UA,
                "Referer": "https://arbitrarydecisions.com/",
                "Origin": "https://arbitrarydecisions.com"
              }
            };
          }
        }
      } catch (apiErr) {
        console.log(`[Filemoon] API Byse Failed: ${apiErr.message}`);
      }
      const html = yield (0, import_http2.fetchHtml)(url, { headers: { "User-Agent": import_http2.DEFAULT_UA, "Referer": url } });
      const evalMatches = html.matchAll(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/g);
      for (const match of Array.from(evalMatches)) {
        const unpacked = unpack(match[1], parseInt(match[2]), parseInt(match[3]), match[4].split("|"), 0, {});
        const fm = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
        if (fm)
          return {
            url: fm[1],
            quality: "1080p",
            isM3U8: true,
            headers: {
              "User-Agent": import_http2.DEFAULT_UA,
              "Referer": "https://arbitrarydecisions.com/",
              "Origin": "https://arbitrarydecisions.com"
            }
          };
      }
      return null;
    } catch (e) {
      console.error(`[Filemoon] Global Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/hlswish.js
var import_http3 = __toESM(require_http());
function unpack2(p, a, c, k, e, d) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const decode = (r) => {
    let res = 0;
    for (let l = 0; l < r.length; l++) {
      let s = chars.indexOf(r[l]);
      if (s === -1)
        return NaN;
      res = res * a + s;
    }
    return res;
  };
  return p.replace(/\b([0-9a-zA-Z]+)\b/g, (match) => {
    let val = decode(match);
    return isNaN(val) || val >= k.length ? match : k[val] || match;
  });
}
var DOMAIN_MAP = { "hglink.to": "vibuxer.com" };
function resolve3(url) {
  return __async(this, null, function* () {
    try {
      let targetUrl = url;
      for (const [old, replacement] of Object.entries(DOMAIN_MAP)) {
        if (targetUrl.includes(old)) {
          targetUrl = targetUrl.replace(old, replacement);
          break;
        }
      }
      console.log(`[HLSWish] Resolving: ${url}`);
      const baseOrigin = (targetUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
      const html = yield (0, import_http3.fetchHtml)(targetUrl, {
        headers: { "User-Agent": import_http3.DEFAULT_UA, Referer: "https://embed69.org/", Origin: "https://embed69.org" },
        timeout: 15e3
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
          const unpacked = unpack2(packedMatch[1], parseInt(packedMatch[2]), parseInt(packedMatch[3]), packedMatch[4].split("|"));
          const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
          if (m3u8Match) {
            finalUrl = m3u8Match[1];
            if (finalUrl.startsWith("/"))
              finalUrl = baseOrigin + finalUrl;
          }
        }
      }
      if (finalUrl) {
        return {
          url: finalUrl,
          quality: "1080p",
          headers: { "User-Agent": import_http3.DEFAULT_UA, Referer: baseOrigin + "/" }
        };
      }
      return null;
    } catch (e) {
      console.log(`[HLSWish] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/vidhide.js
var import_http4 = __toESM(require_http());
function unpackVidHide(script) {
  try {
    const match = script.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
    if (!match)
      return null;
    let [full, p, a, c, k] = match;
    a = parseInt(a);
    c = parseInt(c);
    k = k.split("|");
    const decode = (l, s) => {
      const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
      let res = "";
      for (; l > 0; ) {
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
      console.log(`[VidHide] Resolving: ${url}`);
      const html = yield (0, import_http4.fetchHtml)(url, {
        headers: { "User-Agent": import_http4.DEFAULT_UA, Referer: "https://embed69.org/" },
        timeout: 15e3
      });
      const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
      if (!packedMatch)
        return null;
      const unpacked = unpackVidHide(packedMatch[0]);
      if (!unpacked)
        return null;
      const hlsMatch = unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/);
      if (!hlsMatch)
        return null;
      let finalUrl = hlsMatch[1];
      const origin = getOrigin(url);
      if (!finalUrl.startsWith("http"))
        finalUrl = origin + finalUrl;
      return {
        url: finalUrl,
        quality: "1080p",
        headers: { "User-Agent": import_http4.DEFAULT_UA, Referer: origin + "/", Origin: origin }
      };
    } catch (e) {
      console.log(`[VidHide] Error: ${e.message}`);
      return null;
    }
  });
}

// src/embed69_nuv/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE_URL = "https://embed69.org";
var RESOLVER_TIMEOUT = 1e4;
var RESOLVER_MAP = {
  "voe.sx": resolve,
  "hglink.to": resolve3,
  "streamwish.com": resolve3,
  "streamwish.to": resolve3,
  "wishembed.online": resolve3,
  "filelions.com": resolve3,
  "bysedikamoum.com": resolve2,
  "filemoon.sx": resolve2,
  "filemoon.to": resolve2,
  "moonembed.pro": resolve2,
  "moonalu.com": resolve2,
  "dintezuvio.com": resolve4,
  "vidhide.com": resolve4,
  "minochinos.com": resolve4
};
var LANG_PRIORITY = ["LAT", "ESP", "SUB"];
var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function b64decode(value) {
  if (!value)
    return "";
  var input = String(value).replace(/=+$/, "");
  var output = "";
  var bc = 0, bs, buffer, idx = 0;
  while (buffer = input.charAt(idx++)) {
    buffer = BASE64_CHARS.indexOf(buffer);
    if (~buffer) {
      bs = bc % 4 ? bs * 64 + buffer : buffer;
      if (bc++ % 4)
        output += String.fromCharCode(255 & bs >> (-2 * bc & 6));
    }
  }
  return output;
}
function decodeJwtPayload(token) {
  try {
    var parts = token.split(".");
    if (parts.length < 2)
      return null;
    var payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    payload += "=".repeat((4 - payload.length % 4) % 4);
    var decoded = b64decode(payload);
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}
function getImdbId(tmdbId, mediaType) {
  return __async(this, null, function* () {
    var endpoint = mediaType === "movie" ? "https://api.themoviedb.org/3/movie/" + tmdbId + "/external_ids?api_key=" + TMDB_API_KEY : "https://api.themoviedb.org/3/tv/" + tmdbId + "/external_ids?api_key=" + TMDB_API_KEY;
    try {
      var data = yield (0, import_http5.fetchJson)(endpoint, { headers: { "User-Agent": import_http5.DEFAULT_UA } });
      return data.imdb_id || null;
    } catch (e) {
      return null;
    }
  });
}
function resolveBatch(embedsToResolve) {
  return __async(this, null, function* () {
    var promises = embedsToResolve.map(function(item) {
      return Promise.race([
        item.resolver(item.url).then(function(r) {
          return r ? Object.assign({}, r, { lang: item.lang, servername: item.servername }) : null;
        }),
        new Promise(function(_, reject) {
          setTimeout(function() {
            reject(new Error("timeout"));
          }, RESOLVER_TIMEOUT);
        })
      ]).then(function(value) {
        return { status: "fulfilled", value };
      }).catch(function(reason) {
        return { status: "rejected", reason };
      });
    });
    var results = yield Promise.all(promises);
    var streams = [];
    var seenUrls = /* @__PURE__ */ new Set();
    for (var i = 0; i < results.length; i++) {
      var res = results[i];
      if (res.status === "fulfilled" && res.value && res.value.url) {
        var stream = res.value;
        if (seenUrls.has(stream.url))
          continue;
        seenUrls.add(stream.url);
        var langLabel = stream.lang === "LAT" ? "Latino" : stream.lang === "ESP" ? "Espa\xF1ol" : stream.lang === "SUB" ? "Subtitulado" : stream.lang;
        streams.push({
          name: "Embed69 Latino",
          title: (stream.quality || "1080p") + " \xB7 " + langLabel + " \xB7 " + stream.servername,
          url: stream.url,
          quality: stream.quality || "1080p",
          headers: stream.headers || {}
        });
      }
    }
    return streams;
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      console.log("[Embed69 Latino] Buscando: " + (title || tmdbId) + " (" + mediaType + ")...");
      var imdbId = yield getImdbId(tmdbId, mediaType);
      if (!imdbId)
        return [];
      var embedUrl = BASE_URL + "/f/" + imdbId;
      if (mediaType === "tv" || mediaType === "series") {
        var e = String(episode).padStart(2, "0");
        embedUrl = BASE_URL + "/f/" + imdbId + "-" + parseInt(season) + "x" + e;
      }
      var html = yield (0, import_http5.fetchHtml)(embedUrl, {
        headers: { "User-Agent": import_http5.DEFAULT_UA, "Referer": "https://sololatino.net/" }
      });
      var dlMatch = html.match(/let\s+dataLink\s*=\s*(\[[\s\S]*?\]);/);
      if (!dlMatch)
        return [];
      var dataLink = JSON.parse(dlMatch[1]);
      var byLang = {};
      for (var j = 0; j < dataLink.length; j++) {
        var section = dataLink[j];
        byLang[section.video_language || "LAT"] = section;
      }
      var finalStreams = [];
      for (var k = 0; k < LANG_PRIORITY.length; k++) {
        var lang = LANG_PRIORITY[k];
        var currentSection = byLang[lang];
        if (!currentSection)
          continue;
        var embedsToResolve = [];
        var sortedEmbeds = currentSection.sortedEmbeds || [];
        for (var l = 0; l < sortedEmbeds.length; l++) {
          var embed = sortedEmbeds[l];
          if (embed.servername === "download")
            continue;
          var payload = decodeJwtPayload(embed.link);
          if (!payload || !payload.link)
            continue;
          var resolver = null;
          for (var domain in RESOLVER_MAP) {
            if (payload.link.indexOf(domain) !== -1) {
              resolver = RESOLVER_MAP[domain];
              break;
            }
          }
          if (resolver) {
            embedsToResolve.push({ url: payload.link, resolver, lang, servername: embed.servername });
          }
        }
        if (embedsToResolve.length > 0) {
          console.log("[Embed69 Latino] Resolviendo enlaces en " + lang + "...");
          var resolved = yield resolveBatch(embedsToResolve);
          if (resolved.length > 0) {
            for (var m = 0; m < resolved.length; m++) {
              finalStreams.push(resolved[m]);
            }
            console.log("[Embed69 Latino] \u2713 Streams encontrados en " + lang + ".");
            break;
          }
        }
      }
      return finalStreams;
    } catch (err) {
      console.error("[Embed69 Latino] Error: " + err.message);
      return [];
    }
  });
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { getStreams };
} else {
  global.getStreams = getStreams;
}
