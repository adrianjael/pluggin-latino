/**
 * xupalace - Built from src/xupalace/
 * Generated: 2026-04-07T22:05:38.357Z
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
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
      console.log(`[HLSWish] Resolviendo v\xEDa fetch: ${url}`);
      const baseOrigin = (targetUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
      const res = yield fetch(targetUrl, {
        headers: { "User-Agent": UA3, Referer: "https://embed69.org/", Origin: "https://embed69.org" }
      });
      const html = yield res.text();
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
          headers: { "User-Agent": UA3, Referer: baseOrigin + "/" }
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
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
      console.log(`[VidHide] Resolviendo v\xEDa fetch: ${url}`);
      const res = yield fetch(url, {
        headers: { "User-Agent": UA4, "Referer": "https://embed69.org/" }
      });
      const html = yield res.text();
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
      const origin = new URL(url).origin;
      if (!finalUrl.startsWith("http"))
        finalUrl = origin + finalUrl;
      return {
        url: finalUrl,
        quality: "1080p",
        headers: { "User-Agent": UA4, "Referer": origin + "/", "Origin": origin }
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
var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var SERVER_LABELS = {
  "voe": "VOE",
  "filemoon": "Filemoon",
  "f75s": "Filemoon",
  "streamwish": "StreamWish",
  "hglink": "StreamWish",
  "sw": "StreamWish",
  "vidhide": "VidHide",
  "minochinos": "VidHide",
  "dintezuvio": "VidHide",
  "vidhidepro": "VidHide"
};
var LANG_NAMES = { 0: "Latino", 1: "Castellano", 2: "Subtitulado" };
function getImdbId(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`;
      const res = yield fetch(url);
      const data = yield res.json();
      return data.imdb_id || null;
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    if (!tmdbId)
      return [];
    try {
      const imdbId = yield getImdbId(tmdbId, mediaType);
      if (!imdbId)
        return [];
      const path = mediaType === "movie" ? `/video/${imdbId}/` : `/video/${imdbId}-${season}x${String(episode).padStart(2, "0")}/`;
      const res = yield fetch(`${BASE_URL}${path}`, { headers: { "User-Agent": UA5 } });
      const html = yield res.text();
      const matches = [...html.matchAll(/go_to_playerVast\('(https?:\/\/[^']+)'[^)]+\)[^<]*data-lang="(\d+)"/g)];
      const urlsToResolve = [];
      if (matches.length > 0) {
        matches.forEach((m) => urlsToResolve.push({ url: m[1], lang: parseInt(m[2]) }));
      } else {
        const fallback = [...html.matchAll(/go_to_playerVast\('(https?:\/\/[^']+)'/g)];
        fallback.forEach((m) => urlsToResolve.push({ url: m[1], lang: 0 }));
      }
      const results = yield Promise.allSettled(urlsToResolve.map((item) => __async(this, null, function* () {
        const url = item.url;
        const s = url.toLowerCase();
        let resolved = null;
        let key = "unknown";
        if (s.includes("voe")) {
          key = "voe";
          resolved = yield resolve(url);
        } else if (s.includes("filemoon")) {
          key = "filemoon";
          resolved = yield resolve2(url);
        } else if (s.includes("streamwish") || s.includes("hglink")) {
          key = "streamwish";
          resolved = yield resolve3(url);
        } else if (s.includes("vidhide") || s.includes("minochinos")) {
          key = "vidhide";
          resolved = yield resolve4(url);
        }
        if (resolved && resolved.url) {
          return {
            name: "XuPalace",
            title: `${resolved.quality || "1080p"} \xB7 ${LANG_NAMES[item.lang] || "Latino"} \xB7 ${SERVER_LABELS[key] || key}`,
            url: resolved.url,
            quality: resolved.quality || "1080p",
            headers: resolved.headers || { "User-Agent": UA5, "Referer": url }
          };
        }
        return null;
      })));
      return results.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
    } catch (e) {
      return [];
    }
  });
}
