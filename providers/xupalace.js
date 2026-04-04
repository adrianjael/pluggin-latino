/**
 * xupalace - Built from src/xupalace/
 * Generated: 2026-04-04T04:33:32.296Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/xupalace/index.js
var xupalace_exports = {};
__export(xupalace_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(xupalace_exports);
var import_axios5 = __toESM(require("axios"));

// src/resolvers/hlswish.js
var import_axios = __toESM(require("axios"));
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
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
      const { data: html } = yield import_axios.default.get(targetUrl, {
        headers: { "User-Agent": UA, Referer: "https://embed69.org/", Origin: "https://embed69.org" },
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
        return { url: finalUrl, quality: "1080p", headers: { "User-Agent": UA, Referer: baseOrigin + "/" } };
      }
      return null;
    } catch (e) {
      console.log(`[HLSWish] Error: ${e.message}`);
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

// src/resolvers/voe.js
var import_axios3 = __toESM(require("axios"));
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
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
      const { data } = yield import_axios3.default.get(url, {
        timeout: 5e3,
        headers: { "User-Agent": UA3, "Referer": referer },
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
function resolve3(url) {
  return __async(this, null, function* () {
    try {
      console.log(`[VOE] Resolviendo: ${url}`);
      let res = yield import_axios3.default.get(url, {
        timeout: 15e3,
        headers: { "User-Agent": UA3, "Accept": "text/html,*/*" },
        maxRedirects: 5
      });
      let html = String(res.data || "");
      if (/window\.location\.href\s*=\s*'([^']+)'/i.test(html)) {
        const redirect = html.match(/window\.location\.href\s*=\s*'([^']+)'/i)[1];
        res = yield import_axios3.default.get(redirect, { headers: { "User-Agent": UA3, "Referer": url } });
        html = String(res.data || "");
      }
      const match = html.match(/json">\s*\[\s*['"]([^'"]+)['"]\s*\]\s*<\/script>\s*<script[^>]*src=['"]([^'"]+)['"]/i);
      if (match) {
        const encoded = match[1];
        const loader = match[2].startsWith("http") ? match[2] : new URL(match[2], url).href;
        const loaderRes = yield import_axios3.default.get(loader, { headers: { "User-Agent": UA3, "Referer": url } });
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

// src/xupalace/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE_URL = "https://xupalace.org";
var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
var HTML_HEADERS = {
  "User-Agent": UA5,
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
      const { data } = yield import_axios5.default.get(url, { timeout: 5e3, headers: { "User-Agent": UA5 } });
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
      const { data: html } = yield import_axios5.default.get(`${BASE_URL}${path}`, { timeout: 8e3, headers: HTML_HEADERS });
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
      for (const lang of [0, 1, 2]) {
        const urls = byLang[lang];
        if (!urls || urls.length === 0)
          continue;
        const results = yield Promise.allSettled(urls.map((url) => __async(this, null, function* () {
          const domain = new URL(url).hostname.replace("www.", "");
          const resolver = RESOLVER_MAP[domain];
          if (!resolver)
            return null;
          const result = yield resolver.fn(url);
          if (result)
            result.server = resolver.name;
          return result;
        })));
        const streams = results.filter((r) => r.status === "fulfilled" && r.value).map((r) => ({
          name: "XuPalace",
          title: `${r.value.quality || "1080p"} \xB7 ${LANG_NAMES[lang]} \xB7 ${r.value.server}`,
          url: r.value.url,
          quality: r.value.quality || "1080p",
          headers: r.value.headers || {}
        }));
        if (streams.length > 0)
          return streams;
      }
      return [];
    } catch (e) {
      console.log(`[XuPalace] Error: ${e.message}`);
      return [];
    }
  });
}
