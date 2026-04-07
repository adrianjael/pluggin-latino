/**
 * embed69 - Built from src/embed69/
 * Generated: 2026-04-07T21:26:03.400Z
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
var import_axios3 = __toESM(require("axios"));

// src/resolvers/voe.js
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
      const res = yield fetch(url, { headers: { "User-Agent": UA } });
      let html = yield res.text();
      if (html.includes("Redirecting") || html.length < 1500) {
        const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm) {
          const res2 = yield fetch(rm[1], { headers: { "User-Agent": UA } });
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
              headers: { "User-Agent": UA, "Referer": url }
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
          headers: { "User-Agent": UA, "Referer": url }
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
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
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
              isM3U8: true,
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
              "User-Agent": UA2,
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
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
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
var import_axios2 = __toESM(require("axios"));
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
      const { data: html } = yield import_axios2.default.get(url, {
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

// src/resolvers/uqload.js
var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function resolve5(url) {
  return __async(this, null, function* () {
    try {
      console.log(`[Uqload] Fetching: ${url}`);
      const res = yield fetch(url, {
        headers: {
          "User-Agent": UA5,
          "Referer": "https://xupalace.org/"
          // CABECERA CRÍTICA
        }
      });
      const html = yield res.text();
      console.log(`[Uqload] HTML Length: ${html.length}`);
      if (html.length < 100 && (html.includes("restricted") || html.includes("domain"))) {
        console.log(`[Uqload] Error de restricci\xF3n de dominio detectado.`);
        const res2 = yield fetch(url, {
          headers: { "User-Agent": UA5, "Referer": "https://pelispedia.mov/" }
        });
        const html2 = yield res2.text();
        if (html2.length > 500)
          return parseHtml(html2, url);
        return null;
      }
      return parseHtml(html, url);
    } catch (e) {
      console.error("[Uqload Resolver] Error:", e.message);
    }
    return null;
  });
}
function parseHtml(html, url) {
  const videoMatch = html.match(/sources:\s*\[\s*["']([^"']+)["']/i) || html.match(/sources:\s*\[\s*\{\s*src:\s*["']([^"']+)["']/i) || html.match(/src:\s*["']([^"']+)["']/i) || html.match(/["'](https?:\/\/[^"']+\.(mp4|m3u8)[^"']*)["']/i);
  if (videoMatch) {
    const videoUrl = videoMatch[1].startsWith("//") ? "https:" + videoMatch[1] : videoMatch[1];
    console.log(`[Uqload] Enlace encontrado: ${videoUrl}`);
    return {
      url: videoUrl,
      quality: "HD",
      name: "Uqload",
      headers: {
        "User-Agent": UA5,
        "Referer": url
      }
    };
  }
  return null;
}

// src/embed69/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var BASE_URL = "https://embed69.org";
var RESOLVER_TIMEOUT = 5e3;
var RESOLVER_MAP = {
  "voe.sx": resolve,
  "voe.un": resolve,
  "hglink.to": resolve3,
  "streamwish.com": resolve3,
  "bysedikamoum.com": resolve2,
  "filemoon.sx": resolve2,
  "minochinos.com": resolve4,
  "vidhide.pro": resolve4,
  "vidhide.bz": resolve4,
  "uqload.io": resolve5,
  "uqload.is": resolve5,
  "uqload.to": resolve5
};
function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    payload += "=".repeat((4 - payload.length % 4) % 4);
    const decoded = typeof atob !== "undefined" ? atob(payload) : Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}
function getImdbId(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const endpoint = mediaType === "movie" ? `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}` : `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`;
    try {
      const { data } = yield import_axios3.default.get(endpoint, { timeout: 5e3, headers: { "User-Agent": UA6 } });
      return data.imdb_id || null;
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    console.log(`[Embed69] Buscando: TMDB ${tmdbId} S${season}E${episode}`);
    const imdbId = yield getImdbId(tmdbId, mediaType);
    if (!imdbId)
      return [];
    const embedUrl = mediaType === "movie" ? `${BASE_URL}/f/${imdbId}` : `${BASE_URL}/f/${imdbId}-${parseInt(season)}x${String(episode).padStart(2, "0")}`;
    console.log(`[Embed69] Fetching: ${embedUrl}`);
    try {
      const { data: html } = yield import_axios3.default.get(embedUrl, {
        timeout: 1e4,
        headers: {
          "User-Agent": UA6,
          "Referer": "https://embed69.org/",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
        }
      });
      const jwtRegex = /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g;
      const matches = html.match(jwtRegex) || [];
      const uniqueTokens = [...new Set(matches)];
      const embeds = [];
      uniqueTokens.forEach((token) => {
        const payload = decodeJwtPayload(token);
        if (payload && payload.link) {
          for (const [pattern, resolver] of Object.entries(RESOLVER_MAP)) {
            if (payload.link.includes(pattern)) {
              embeds.push({ url: payload.link, resolver, servername: pattern.split(".")[0] });
              break;
            }
          }
        }
      });
      console.log(`[Embed69] Servidores detectados en tokens: ${embeds.length}`);
      const resolvedStreams = yield Promise.all(embeds.map((_0) => __async(this, [_0], function* ({ url, resolver, servername }) {
        try {
          const r = yield Promise.race([
            resolver(url),
            new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), RESOLVER_TIMEOUT))
          ]);
          if (r && r.url) {
            return {
              name: "Embed69",
              title: `${r.quality || "1080p"} \xB7 Latino \xB7 ${servername.toUpperCase()}`,
              url: r.url,
              quality: r.quality || "1080p",
              headers: r.headers || { "User-Agent": UA6, "Referer": url }
            };
          }
        } catch (e) {
        }
        return null;
      })));
      return resolvedStreams.filter((s) => s !== null);
    } catch (e) {
      return [];
    }
  });
}
