/**
 * pelispedia - Built from src/pelispedia/
 * Generated: 2026-04-07T17:55:53.848Z
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

// src/pelispedia/index.js
var pelispedia_exports = {};
__export(pelispedia_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(pelispedia_exports);

// src/utils/string.js
function normalizeTitle(t) {
  if (!t)
    return "";
  return t.toLowerCase().replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o").replace(/[úùüû]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function calculateSimilarity(title1, title2) {
  const norm1 = normalizeTitle(title1);
  const norm2 = normalizeTitle(title2);
  if (norm1 === norm2)
    return 1;
  if (norm1.length > 5 && norm2.length > 5) {
    const ratio = Math.min(norm1.length, norm2.length) / Math.max(norm1.length, norm2.length);
    if ((norm2.includes(norm1) || norm1.includes(norm2)) && ratio > 0.8) {
      return 0.9;
    }
  }
  const words1 = new Set(norm1.split(/\s+/).filter((w) => w.length > 2));
  const words2 = new Set(norm2.split(/\s+/).filter((w) => w.length > 2));
  if (words1.size === 0 || words2.size === 0) {
    return norm1 === norm2 ? 1 : norm1.includes(norm2) || norm2.includes(norm1) ? 0.5 : 0;
  }
  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = /* @__PURE__ */ new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

// src/pelispedia/extractor.js
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function fetchText(url, referer) {
  return __async(this, null, function* () {
    try {
      const headers = { "User-Agent": UA };
      if (referer)
        headers["Referer"] = referer;
      const res = yield fetch(url, { headers });
      return yield res.text();
    } catch (e) {
      return "";
    }
  });
}
function extractStreams(url) {
  return __async(this, null, function* () {
    const html = yield fetchText(url);
    if (!html)
      return [];
    const streams = [];
    const embed69Re = /https?:\/\/embed69\.org\/f\/(tt\d+(-[\d]+x[\d]+)?)/gi;
    let m;
    while ((m = embed69Re.exec(html)) !== null) {
      const url_str = m[0];
      if (!streams.find((s) => s.url === url_str)) {
        streams.push({
          servername: "Embed69",
          url: url_str,
          quality: "1080p",
          headers: { "User-Agent": UA, "Referer": url }
        });
      }
    }
    const iframeRe = /https?:\/\/(voe\.sx|filemoon\.sx|bysedikamoum\.com|streamwish\.to|vidhide\.com|minochinos\.com|hglink\.to|audinifer\.com|uqload\.is|uqload\.com)\/([ae]\/)?([a-z0-9]+)/gi;
    while ((m = iframeRe.exec(html)) !== null) {
      const url_str = m[0];
      const domain = m[1].toLowerCase();
      let name = "Desconocido";
      if (domain.includes("voe"))
        name = "Voe";
      else if (domain.includes("filemoon") || domain.includes("bysedikamoum"))
        name = "Filemoon";
      else if (domain.includes("streamwish") || domain.includes("hglink") || domain.includes("audinifer"))
        name = "Streamwish";
      else if (domain.includes("vidhide") || domain.includes("minochinos"))
        name = "Vidhide";
      else if (domain.includes("uqload"))
        name = "Uqload";
      if (!streams.find((s) => s.url === url_str)) {
        streams.push({
          servername: name,
          url: url_str,
          quality: "1080p",
          headers: { "User-Agent": UA, "Referer": url }
        });
      }
    }
    if (streams.length === 0) {
      const ttMatch = html.match(/tt\d{7,10}/);
      if (ttMatch) {
        const imdbId = ttMatch[0];
        const epMatch = url.match(/\/temporada\/(\d+)\/capitulo\/(\d+)/);
        let embedUrl = `https://embed69.org/f/${imdbId}`;
        if (epMatch) {
          const s = epMatch[1];
          const e = epMatch[2].padStart(2, "0");
          embedUrl += `-${s}x${e}`;
        }
        streams.push({
          servername: "Embed69 (Auto)",
          url: embedUrl,
          quality: "1080p",
          headers: { "User-Agent": UA, "Referer": url }
        });
      }
    }
    console.log(`[Pelispedia Extractor] Found ${streams.length} stream(s).`);
    return streams;
  });
}

// src/resolvers/voe.js
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function decodeBase64(input) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = String(input).replace(/=+$/, "");
  let output = "";
  for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}
function resolve(url) {
  return __async(this, null, function* () {
    try {
      console.log(`[VOE] Resolviendo Directo: ${url}`);
      const res = yield fetch(url, { headers: { "User-Agent": UA2 } });
      let html = yield res.text();
      if (html.includes("Redirecting") || html.length < 1500) {
        const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm) {
          const res2 = yield fetch(rm[1], { headers: { "User-Agent": UA2 } });
          html = yield res2.text();
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
          let b64_1 = decodeBase64(rot13);
          let shifted = "";
          for (let i = 0; i < b64_1.length; i++)
            shifted += String.fromCharCode(b64_1.charCodeAt(i) - 3);
          let reversed = shifted.split("").reverse().join("");
          let data = JSON.parse(decodeBase64(reversed));
          if (data && data.source) {
            console.log(`[VOE] -> m3u8 encontrado: ${data.source.substring(0, 60)}...`);
            return {
              url: data.source,
              quality: "1080p",
              isM3U8: true,
              headers: { "User-Agent": UA2, "Referer": url }
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
          headers: { "User-Agent": UA2, "Referer": url }
        };
      }
      return null;
    } catch (e) {
      console.error(`[VOE] Error resolviedo: ${e.message}`);
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

// src/resolvers/filemoon.js
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function base64UrlDecode(input) {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4)
    s += "=";
  if (typeof Buffer !== "undefined")
    return Buffer.from(s, "base64");
  const bin = atob(s);
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
          return JSON.parse(new TextDecoder().decode(decryptedArr));
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
      console.log(`[Filemoon] Resolviendo Universal (v4.0): ${id}`);
      try {
        const hostname = new URL(url).hostname;
        const apiRes = yield fetch(`https://${hostname}/api/videos/${id}`, {
          headers: { "User-Agent": UA3, "Referer": url }
        });
        const data = yield apiRes.json();
        if (data.playback) {
          const decrypted = yield decryptByse(data.playback);
          if (decrypted && decrypted.sources) {
            const best = decrypted.sources[0];
            return {
              url: best.url,
              quality: best.height ? `${best.height}p` : "1080p",
              isM3U8: true,
              headers: {
                "User-Agent": UA3,
                "Referer": "https://arbitrarydecisions.com/",
                "Origin": "https://arbitrarydecisions.com"
              }
            };
          }
        }
      } catch (apiErr) {
        console.log(`[Filemoon] API Byse Failed: ${apiErr.message}`);
      }
      const res = yield fetch(url, { headers: { "User-Agent": UA3, "Referer": url } });
      const html = yield res.text();
      const evalMatches = html.matchAll(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/g);
      for (const match of evalMatches) {
        const unpacked = unpack(match[1], parseInt(match[2]), parseInt(match[3]), match[4].split("|"), 0, {});
        const fm = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
        if (fm)
          return {
            url: fm[1],
            quality: "1080p",
            isM3U8: true,
            headers: {
              "User-Agent": UA3,
              "Referer": "https://arbitrarydecisions.com/",
              "Origin": "https://arbitrarydecisions.com"
            }
          };
      }
      return null;
    } catch (e) {
      console.error(`[Filemoon] Error Global: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/hlswish.js
var import_axios = __toESM(require("axios"));
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
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
      console.log(`[HLSWish] Resolviendo: ${url}`);
      const baseOrigin = (targetUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
      const { data: html } = yield import_axios.default.get(targetUrl, {
        headers: { "User-Agent": UA4, Referer: "https://embed69.org/", Origin: "https://embed69.org" },
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
        console.log(`[HLSWish] URL encontrada: ${finalUrl.substring(0, 80)}...`);
        return { url: finalUrl, quality: "1080p", headers: { "User-Agent": UA4, Referer: baseOrigin + "/" } };
      }
      return null;
    } catch (e) {
      console.log(`[HLSWish] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/vidhide.js
var import_axios2 = __toESM(require("axios"));
var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
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
      const { data: html } = yield import_axios2.default.get(url, {
        timeout: 15e3,
        maxRedirects: 10,
        headers: { "User-Agent": UA5, Referer: "https://embed69.org/" }
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
      return { url: finalUrl, headers: { "User-Agent": UA5, Referer: origin + "/", Origin: origin } };
    } catch (e) {
      console.log(`[VidHide] Error: ${e.message}`);
      return null;
    }
  });
}

// src/pelispedia/index.js
var BASE = "https://pelispedia.mov";
var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var TMDB_KEY = "2dca580c2a14b55200e784d157207b4d";
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
  "dintezuvio.com": resolve4,
  "vidhide.com": resolve4
};
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
function resolveEmbed69(embedUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText2(embedUrl);
      const match = html.match(/let\s+dataLink\s*=\s*(\[.+\]);/);
      if (!match)
        return null;
      const dataLink = JSON.parse(match[1]);
      const section = dataLink.find((d) => d.video_language === "LAT") || dataLink[0];
      if (!section || !section.sortedEmbeds)
        return null;
      for (const embed of section.sortedEmbeds) {
        if (embed.servername === "download")
          continue;
        const payload = decodeJwtPayload(embed.link);
        if (!payload || !payload.link)
          continue;
        for (const [pattern, resolver] of Object.entries(RESOLVER_MAP)) {
          if (payload.link.includes(pattern)) {
            const result = yield resolver(payload.link);
            if (result && result.url) {
              return __spreadProps(__spreadValues({}, result), { servername: embed.servername });
            }
          }
        }
      }
    } catch (e) {
      console.error("[Pelispedia] resolveEmbed69 error:", e.message);
    }
    return null;
  });
}
function fetchText2(url) {
  return __async(this, null, function* () {
    try {
      const res = yield fetch(url, {
        headers: {
          "User-Agent": UA6,
          "Referer": BASE
        }
      });
      return yield res.text();
    } catch (e) {
      return "";
    }
  });
}
function getSpanishTitle(tmdbId, type) {
  return __async(this, null, function* () {
    if (!tmdbId || tmdbId === "dummy")
      return null;
    try {
      const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=es-MX`;
      const res = yield fetch(url);
      const data = yield res.json();
      return data.title || data.name || null;
    } catch (e) {
      return null;
    }
  });
}
function searchMedia(query) {
  return __async(this, null, function* () {
    const url = `${BASE}/search?s=${encodeURIComponent(query)}`;
    const html = yield fetchText2(url);
    if (!html)
      return [];
    const re = /<a[^>]+href="(https:\/\/pelispedia\.mov\/(pelicula|serie)\/([^"]+))"[^>]*title="([^"]+)"|<a[^>]+title="([^"]+)"[^>]+href="(https:\/\/pelispedia\.mov\/(pelicula|serie)\/([^"]+))"/gi;
    const results = [];
    let m;
    while ((m = re.exec(html)) !== null) {
      if (m[1]) {
        results.push({
          url: m[1],
          type: m[2],
          slug: m[3],
          title: m[4].replace(/&amp;/g, "&")
        });
      } else {
        results.push({
          url: m[6],
          type: m[7],
          slug: m[8],
          title: m[5].replace(/&amp;/g, "&")
        });
      }
    }
    if (results.length === 0) {
      const simpleRe = /href="(https:\/\/pelispedia\.mov\/(pelicula|serie)\/([^"]+))"/gi;
      while ((m = simpleRe.exec(html)) !== null) {
        results.push({
          url: m[1],
          type: m[2],
          slug: m[3],
          title: m[3].replace(/-/g, " ")
        });
      }
    }
    return results;
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      const type = (mediaType || "").toLowerCase();
      const tmdbType = type === "movie" ? "movie" : "tv";
      console.log(`[Pelispedia] Buscando: "${title}" (${type})`);
      let matches = yield searchMedia(title);
      if (matches.length === 0 && tmdbId && tmdbId !== "dummy") {
        const esTitle = yield getSpanishTitle(tmdbId, tmdbType);
        if (esTitle && esTitle !== title) {
          matches = yield searchMedia(esTitle);
        }
      }
      if (matches.length === 0) {
        const firstWord = title.split(" ")[0];
        if (firstWord.length > 3)
          matches = yield searchMedia(firstWord);
      }
      if (matches.length === 0)
        return [];
      const normTarget = (title || "").toLowerCase();
      const bestMatch = matches.find((m) => {
        const normMatch = (m.title || "").toLowerCase();
        const similarity = calculateSimilarity(normTarget, normMatch) || (normTarget === normMatch ? 1 : 0);
        const typeMatch = type === "movie" && m.type === "pelicula" || (type === "tv" || type === "series") && m.type === "serie";
        return similarity > 0.4 && typeMatch;
      });
      if (!bestMatch)
        return [];
      let targetUrl = bestMatch.url;
      if (type === "tv" || type === "series") {
        const s = season || 1;
        const e = episode || 1;
        targetUrl = `${BASE}/serie/${bestMatch.slug}/temporada/${s}/capitulo/${e}`;
      }
      const rawEmbeds = yield extractStreams(targetUrl);
      console.log(`[Pelispedia] Embeds encontrados: ${rawEmbeds.length}. Resolviendo...`);
      const finalStreams = [];
      yield Promise.all(rawEmbeds.map((embed) => __async(this, null, function* () {
        try {
          let resolved = null;
          if (embed.servername.includes("Embed69")) {
            resolved = yield resolveEmbed69(embed.url);
          } else {
            for (const [pattern, resolver] of Object.entries(RESOLVER_MAP)) {
              if (embed.url.includes(pattern)) {
                resolved = yield resolver(embed.url);
                if (resolved)
                  resolved.servername = embed.servername;
                break;
              }
            }
          }
          if (resolved && resolved.url) {
            finalStreams.push({
              name: "Pelispedia.mov",
              title: `${resolved.quality || "1080p"} \xB7 Latino \xB7 ${resolved.servername || "Pelispedia"}`,
              url: resolved.url,
              quality: resolved.quality || "1080p",
              headers: resolved.headers || { "User-Agent": UA6, "Referer": embed.url }
            });
          }
        } catch (err) {
          console.error(`[Pelispedia] Error resolviendo embed ${embed.servername}:`, err.message);
        }
      })));
      console.log(`[Pelispedia] Finalizado: ${finalStreams.length} enlaces directos.`);
      return finalStreams;
    } catch (e) {
      console.error("[Pelispedia] Error Gen\xE9rico:", e);
      return [];
    }
  });
}
