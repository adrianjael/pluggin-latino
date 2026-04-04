/**
 * embed69 - Built from src/embed69/
 * Generated: 2026-04-04T04:24:51.998Z
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
  return new Promise((resolve6, reject) => {
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
    var step = (x) => x.done ? resolve6(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/embed69/index.js
var embed69_exports = {};
__export(embed69_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(embed69_exports);
var import_axios7 = __toESM(require("axios"));

// src/resolvers/voe.js
var import_axios = __toESM(require("axios"));
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
function base64Decode(e) {
  try {
    return typeof atob !== "undefined" ? atob(e) : Buffer.from(e, "base64").toString("utf8");
  } catch (e2) {
    return null;
  }
}
function voeDecode(e, t) {
  try {
    let i = t.replace(/^\[|\]$/g, "").split("','").map((c) => c.replace(/^'+|'+$/g, "")).map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), o = "";
    for (let c of e) {
      let u = c.charCodeAt(0);
      u > 64 && u < 91 ? u = (u - 52) % 26 + 65 : u > 96 && u < 123 && (u = (u - 84) % 26 + 97), o += String.fromCharCode(u);
    }
    for (let c of i)
      o = o.replace(new RegExp(c, "g"), "_");
    o = o.split("_").join("");
    let r = base64Decode(o);
    if (!r)
      return null;
    let a = "";
    for (let c = 0; c < r.length; c++)
      a += String.fromCharCode((r.charCodeAt(c) - 3 + 256) % 256);
    let l = a.split("").reverse().join(""), s = base64Decode(l);
    return s ? JSON.parse(s) : null;
  } catch (n) {
    console.log("[VOE] voeDecode error:", n.message);
    return null;
  }
}
function getQuality(url, referer) {
  return __async(this, null, function* () {
    try {
      const { data } = yield import_axios.default.get(url, {
        timeout: 5e3,
        headers: { "User-Agent": UA, "Referer": referer },
        responseType: "text"
      });
      if (!data.includes("#EXT-X-STREAM-INF"))
        return "1080p";
      let maxRes = 0;
      const lines = data.split("\n");
      for (const line of lines) {
        const match = line.match(/RESOLUTION=\d+x(\d+)/);
        if (match) {
          const res = parseInt(match[1]);
          if (res > maxRes)
            maxRes = res;
        }
      }
      return maxRes > 0 ? `${maxRes}p` : "1080p";
    } catch (e) {
      return "1080p";
    }
  });
}
function resolve(url) {
  return __async(this, null, function* () {
    try {
      console.log(`[VOE] Resolviendo: ${url}`);
      let res = yield import_axios.default.get(url, {
        timeout: 15e3,
        headers: { "User-Agent": UA, "Accept": "text/html,*/*" },
        maxRedirects: 5
      });
      let html = String(res.data || "");
      if (/window\.location\.href\s*=\s*'([^']+)'/i.test(html)) {
        const redirect = html.match(/window\.location\.href\s*=\s*'([^']+)'/i)[1];
        res = yield import_axios.default.get(redirect, { headers: { "User-Agent": UA, "Referer": url } });
        html = String(res.data || "");
      }
      const match = html.match(/json">\s*\[\s*['"]([^'"]+)['"]\s*\]\s*<\/script>\s*<script[^>]*src=['"]([^'"]+)['"]/i);
      if (match) {
        const encoded = match[1];
        const loader = match[2].startsWith("http") ? match[2] : new URL(match[2], url).href;
        const loaderRes = yield import_axios.default.get(loader, { headers: { "User-Agent": UA, "Referer": url } });
        const loaderJs = String(loaderRes.data || "");
        const arrayMatch = loaderJs.match(/(\[(?:'[^']{1,10}'[\s,]*){4,12}\])/i) || loaderJs.match(/(\[(?:"[^"]{1,10}"[,\s]*){4,12}\])/i);
        if (arrayMatch) {
          const decoded = voeDecode(encoded, arrayMatch[1]);
          if (decoded && (decoded.source || decoded.direct_access_url)) {
            const finalUrl = decoded.source || decoded.direct_access_url;
            return { url: finalUrl, quality: yield getQuality(finalUrl, url), headers: { Referer: url } };
          }
        }
      }
      const sources = [...html.matchAll(/(?:mp4|hls)["']\s*:\s*["']([^"']+)["']/gi)];
      for (const s of sources) {
        let src = s[1];
        if (src.startsWith("aHR0"))
          src = base64Decode(src);
        if (src)
          return { url: src, quality: yield getQuality(src, url), headers: { Referer: url } };
      }
      return null;
    } catch (e) {
      console.log(`[VOE] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/filemoon.js
var import_axios2 = __toESM(require("axios"));
var import_crypto_js = __toESM(require("crypto-js"));
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function base64ToWordArray(e) {
  e = e.replace(/-/g, "+").replace(/_/g, "/");
  let t = (4 - e.length % 4) % 4;
  return import_crypto_js.default.enc.Base64.parse(e + "=".repeat(t));
}
function wordArrayToUint8Array(e) {
  let t = e.words, n = e.sigBytes, i = new Uint8Array(n);
  for (let o = 0; o < n; o++)
    i[o] = t[o >>> 2] >>> 24 - o % 4 * 8 & 255;
  return i;
}
function uint8ArrayToWordArray(e) {
  let t = [];
  for (let n = 0; n < e.length; n += 4)
    t.push((e[n] || 0) << 24 | (e[n + 1] || 0) << 16 | (e[n + 2] || 0) << 8 | (e[n + 3] || 0));
  return import_crypto_js.default.lib.WordArray.create(t, e.length);
}
function incrementIv(e) {
  let t = new Uint8Array(e);
  for (let n = 15; n >= 12 && (t[n]++, t[n] === 0); n--)
    ;
  return t;
}
function decryptPayload(key, iv, payload) {
  try {
    let counterIv = new Uint8Array(16);
    counterIv.set(iv, 0);
    counterIv[15] = 1;
    let ivCopy = incrementIv(counterIv), keyWords = uint8ArrayToWordArray(key), decrypted = new Uint8Array(payload.length);
    for (let l = 0; l < payload.length; l += 16) {
      let chunkLen = Math.min(16, payload.length - l), currentIvWords = uint8ArrayToWordArray(ivCopy);
      let encryptedIv = import_crypto_js.default.AES.encrypt(currentIvWords, keyWords, { mode: import_crypto_js.default.mode.ECB, padding: import_crypto_js.default.pad.NoPadding });
      let ivBytes = wordArrayToUint8Array(encryptedIv.ciphertext);
      for (let d = 0; d < chunkLen; d++)
        decrypted[l + d] = payload[l + d] ^ ivBytes[d];
      ivCopy = incrementIv(ivCopy);
    }
    return decrypted;
  } catch (e) {
    console.log("[Filemoon] Decrypt error:", e.message);
    return null;
  }
}
function resolve2(url) {
  return __async(this, null, function* () {
    var _a;
    try {
      console.log(`[Filemoon] Resolviendo: ${url}`);
      const idMatch = url.match(/\/(?:e|d)\/([a-z0-9]{12})/i);
      if (!idMatch)
        return null;
      const id = idMatch[1];
      const playbackUrl = `https://filemooon.link/api/videos/${id}/embed/playback`;
      const { data } = yield import_axios2.default.get(playbackUrl, { timeout: 7e3, headers: { "User-Agent": UA2, Referer: url } });
      if (data.error)
        return console.log(`[Filemoon] API error: ${data.error}`), null;
      const info = data.playback;
      if (!info || info.algorithm !== "AES-256-GCM")
        return console.log("[Filemoon] Unsupported algorithm"), null;
      const part1 = wordArrayToUint8Array(base64ToWordArray(info.key_parts[0]));
      const part2 = wordArrayToUint8Array(base64ToWordArray(info.key_parts[1]));
      const combined = new Uint8Array(part1.length + part2.length);
      combined.set(part1, 0);
      combined.set(part2, part1.length);
      const key = wordArrayToUint8Array(import_crypto_js.default.SHA256(uint8ArrayToWordArray(combined)));
      const iv = wordArrayToUint8Array(base64ToWordArray(info.iv));
      const payload = wordArrayToUint8Array(base64ToWordArray(info.payload));
      const decrypted = decryptPayload(key, iv, payload.slice(0, -16));
      if (!decrypted)
        return null;
      let jsonStr = "";
      for (let i = 0; i < decrypted.length; i++)
        jsonStr += String.fromCharCode(decrypted[i]);
      const sources = JSON.parse(jsonStr).sources;
      if (!sources || !((_a = sources[0]) == null ? void 0 : _a.url))
        return null;
      const streamUrl = sources[0].url;
      console.log(`[Filemoon] URL encontrada: ${streamUrl.substring(0, 80)}...`);
      return { url: streamUrl, quality: "1080p", headers: { "User-Agent": UA2, Referer: url, Origin: "https://filemoon.sx" } };
    } catch (e) {
      console.log(`[Filemoon] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/hlswish.js
var import_axios3 = __toESM(require("axios"));
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function unpack(p, a, c, k, e, d) {
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
      console.log(`[HLSWish] Resolviendo: ${url}`);
      const baseOrigin = (targetUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
      const { data: html } = yield import_axios3.default.get(targetUrl, {
        headers: { "User-Agent": UA3, Referer: "https://embed69.org/", Origin: "https://embed69.org" },
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
          const unpacked = unpack(packedMatch[1], parseInt(packedMatch[2]), parseInt(packedMatch[3]), packedMatch[4].split("|"));
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
        return { url: finalUrl, quality: "1080p", headers: { "User-Agent": UA3, Referer: baseOrigin + "/" } };
      }
      return null;
    } catch (e) {
      console.log(`[HLSWish] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/vidhide.js
var import_axios4 = __toESM(require("axios"));
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
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
      console.log(`[VidHide] Resolviendo: ${url}`);
      const { data: html } = yield import_axios4.default.get(url, {
        timeout: 15e3,
        maxRedirects: 10,
        headers: { "User-Agent": UA4, Referer: "https://embed69.org/" }
      });
      const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
      if (!packedMatch)
        return console.log("[VidHide] No se encontr\xF3 bloque eval"), null;
      const unpacked = unpackVidHide(packedMatch[0]);
      if (!unpacked)
        return console.log("[VidHide] No se pudo desempacar"), null;
      const hlsMatch = unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/);
      if (!hlsMatch)
        return console.log("[VidHide] No se encontr\xF3 hls2/hls4"), null;
      let finalUrl = hlsMatch[1];
      if (!finalUrl.startsWith("http"))
        finalUrl = new URL(url).origin + finalUrl;
      console.log(`[VidHide] URL encontrada: ${finalUrl.substring(0, 80)}...`);
      const origin = new URL(url).origin;
      return { url: finalUrl, headers: { "User-Agent": UA4, Referer: origin + "/", Origin: origin } };
    } catch (e) {
      console.log(`[VidHide] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/goodstream.js
var import_axios6 = __toESM(require("axios"));

// src/resolvers/quality.js
var import_axios5 = __toESM(require("axios"));
var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function detectQuality(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    try {
      if (!url || !url.includes(".m3u8"))
        return "1080p";
      const { data } = yield import_axios5.default.get(url, {
        timeout: 5e3,
        headers: __spreadValues({ "User-Agent": UA5 }, headers),
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

// src/resolvers/goodstream.js
var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function resolve5(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[GoodStream] Resolviendo: ${embedUrl}`);
      const response = yield import_axios6.default.get(embedUrl, {
        headers: {
          "User-Agent": UA6,
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
      const refererHeaders = { "Referer": embedUrl, "Origin": "https://goodstream.one", "User-Agent": UA6 };
      const quality = yield detectQuality(videoUrl, refererHeaders);
      console.log(`[GoodStream] URL encontrada (${quality}): ${videoUrl.substring(0, 80)}...`);
      return { url: videoUrl, quality, headers: refererHeaders };
    } catch (err) {
      console.log(`[GoodStream] Error: ${err.message}`);
      return null;
    }
  });
}

// src/embed69/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var UA7 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var BASE_URL = "https://embed69.org";
var RESOLVER_TIMEOUT = 4e3;
var RESOLVER_MAP = {
  "voe.sx": resolve,
  "hglink.to": resolve3,
  // streamwish
  "streamwish.com": resolve3,
  "streamwish.to": resolve3,
  "wishembed.online": resolve3,
  "filelions.com": resolve3,
  "bysedikamoum.com": resolve2,
  // filemoon alias
  "filemoon.sx": resolve2,
  "filemoon.to": resolve2,
  "moonembed.pro": resolve2,
  "dintezuvio.com": resolve4,
  // vidhide
  "vidhide.com": resolve4,
  "goodstream.one": resolve5
};
var SERVER_LABELS = {
  "voe": "VOE",
  "streamwish": "StreamWish",
  "filemoon": "Filemoon",
  "vidhide": "VidHide",
  "goodstream": "GoodStream"
};
var LANG_PRIORITY = ["LAT", "ESP", "SUB"];
function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2)
      return null;
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    payload += "=".repeat((4 - payload.length % 4) % 4);
    const decoded = typeof atob !== "undefined" ? atob(payload) : Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}
function parseDataLink(html) {
  try {
    const match = html.match(/let\s+dataLink\s*=\s*(\[.+\]);/);
    if (!match)
      return null;
    return JSON.parse(match[1]);
  } catch (e) {
    return null;
  }
}
function getResolver(url) {
  if (!url)
    return null;
  for (const [pattern, resolver] of Object.entries(RESOLVER_MAP)) {
    if (url.includes(pattern))
      return resolver;
  }
  return null;
}
function getImdbId(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const endpoint = mediaType === "movie" ? `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}` : `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`;
    try {
      const { data } = yield import_axios7.default.get(endpoint, {
        timeout: 5e3,
        headers: { "User-Agent": UA7 }
      });
      return data.imdb_id || null;
    } catch (e) {
      console.log(`[Embed69] TMDB error: ${e.message}`);
      return null;
    }
  });
}
function buildEmbedUrl(imdbId, mediaType, season, episode) {
  if (mediaType === "movie")
    return `${BASE_URL}/f/${imdbId}`;
  const e = String(episode).padStart(2, "0");
  return `${BASE_URL}/f/${imdbId}-${parseInt(season)}x${e}`;
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    if (!tmdbId || !mediaType)
      return [];
    const startTime = Date.now();
    console.log(`[Embed69] Buscando: TMDB ${tmdbId} (${mediaType})${season ? ` S${season}E${episode}` : ""}`);
    try {
      let getEmbeds = function(section) {
        const lang = section.video_language || "LAT";
        const embeds = [];
        for (const embed of section.sortedEmbeds || []) {
          if (embed.servername === "download")
            continue;
          const payload = decodeJwtPayload(embed.link);
          if (!payload || !payload.link)
            continue;
          const resolver = getResolver(payload.link);
          if (!resolver) {
            console.log(`[Embed69] Sin resolver para ${embed.servername}: ${payload.link.substring(0, 60)}`);
            continue;
          }
          embeds.push({ url: payload.link, resolver, lang, servername: embed.servername });
        }
        return embeds;
      };
      const imdbId = yield getImdbId(tmdbId, mediaType);
      if (!imdbId) {
        console.log("[Embed69] No se encontr\xF3 IMDB ID");
        return [];
      }
      console.log(`[Embed69] IMDB ID: ${imdbId}`);
      const embedUrl = buildEmbedUrl(imdbId, mediaType, season, episode);
      console.log(`[Embed69] Fetching: ${embedUrl}`);
      const { data: html } = yield import_axios7.default.get(embedUrl, {
        timeout: 8e3,
        headers: {
          "User-Agent": UA7,
          "Referer": "https://sololatino.net/",
          "Accept": "text/html,application/xhtml+xml"
        }
      });
      const dataLink = parseDataLink(html);
      if (!dataLink || dataLink.length === 0) {
        console.log("[Embed69] No se encontr\xF3 dataLink en el HTML");
        return [];
      }
      console.log(`[Embed69] ${dataLink.length} idiomas disponibles: ${dataLink.map((d) => d.video_language).join(", ")}`);
      const byLang = {};
      for (const section of dataLink) {
        byLang[section.video_language] = section;
      }
      function resolveBatch(embeds) {
        return __async(this, null, function* () {
          const results = yield Promise.allSettled(
            embeds.map(
              ({ url, resolver, lang, servername }) => Promise.race([
                resolver(url).then((r) => r ? __spreadProps(__spreadValues({}, r), { lang, servername }) : null),
                new Promise(
                  (_, reject) => setTimeout(() => reject(new Error("timeout")), RESOLVER_TIMEOUT)
                )
              ])
            )
          );
          return results.filter((r) => {
            var _a;
            return r.status === "fulfilled" && ((_a = r.value) == null ? void 0 : _a.url);
          }).map((r) => r.value);
        });
      }
      const streams = [];
      for (const lang of LANG_PRIORITY) {
        const section = byLang[lang];
        if (!section)
          continue;
        const embeds = getEmbeds(section);
        if (embeds.length === 0)
          continue;
        console.log(`[Embed69] Resolviendo ${embeds.length} embeds (${lang})...`);
        const resolved = yield resolveBatch(embeds);
        if (resolved.length > 0) {
          for (const { url, quality, lang: l, servername, headers } of resolved) {
            const langLabel = l === "LAT" ? "Latino" : l === "ESP" ? "Espa\xF1ol" : "Subtitulado";
            const serverLabel = SERVER_LABELS[servername] || servername;
            streams.push({
              name: "Embed69",
              title: `${quality || "1080p"} \xB7 ${langLabel} \xB7 ${serverLabel}`,
              url,
              quality: quality || "1080p",
              headers: headers || {}
            });
          }
          console.log(`[Embed69] \u2713 Streams encontrados en ${lang}`);
          break;
        }
      }
      const elapsed = ((Date.now() - startTime) / 1e3).toFixed(2);
      console.log(`[Embed69] \u2713 ${streams.length} streams en ${elapsed}s`);
      return streams;
    } catch (e) {
      console.log(`[Embed69] Error: ${e.message}`);
      return [];
    }
  });
}
