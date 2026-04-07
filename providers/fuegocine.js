/**
 * fuegocine - Built from src/fuegocine/
 * Generated: 2026-04-07T22:06:33.073Z
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

// src/fuegocine/index.js
var fuegocine_exports = {};
__export(fuegocine_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(fuegocine_exports);

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

// src/resolvers/hlswish.js
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
function resolve2(url) {
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
        headers: { "User-Agent": UA2, Referer: "https://embed69.org/", Origin: "https://embed69.org" }
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
        return {
          url: finalUrl,
          quality: "1080p",
          headers: { "User-Agent": UA2, Referer: baseOrigin + "/" }
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
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
function resolve3(url) {
  return __async(this, null, function* () {
    try {
      console.log(`[VidHide] Resolviendo v\xEDa fetch: ${url}`);
      const res = yield fetch(url, {
        headers: { "User-Agent": UA3, "Referer": "https://embed69.org/" }
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
        headers: { "User-Agent": UA3, "Referer": origin + "/", "Origin": origin }
      };
    } catch (e) {
      console.log(`[VidHide] Error: ${e.message}`);
      return null;
    }
  });
}

// src/fuegocine/index.js
var BASE_URL = "https://www.fuegocine.com";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var SEARCH_BASE = `${BASE_URL}/feeds/posts/default?alt=json&max-results=10&q=`;
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var SERVER_LABELS = {
  "voe": "VOE",
  "ok.ru": "OK.RU",
  "drive": "Google Drive",
  "turbovid": "TurboVid",
  "streamwish": "StreamWish",
  "vidhide": "VidHide"
};
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType === "movie" ? "movie" : "tv"}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`;
      const res = yield fetch(url);
      const data = yield res.json();
      return {
        title: data.title || data.name,
        year: (data.release_date || data.first_air_date || "").substring(0, 4)
      };
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    var _a, _b, _c;
    try {
      const tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
      if (!tmdbInfo)
        return [];
      const searchTitle = season ? `${tmdbInfo.title} ${season}x${episode}` : tmdbInfo.title;
      const searchRes = yield fetch(SEARCH_BASE + encodeURIComponent(searchTitle));
      const searchJson = yield searchRes.json();
      const entries = ((_a = searchJson.feed) == null ? void 0 : _a.entry) || [];
      let allStreams = [];
      for (const entry of entries) {
        const entryUrl = (_c = (_b = entry.link) == null ? void 0 : _b.find((l) => l.rel === "alternate")) == null ? void 0 : _c.href;
        if (!entryUrl)
          continue;
        const pageRes = yield fetch(entryUrl, { headers: { "User-Agent": UA4 } });
        const html = yield pageRes.text();
        const scriptsMatch = html.match(/const\s+_SV_LINKS\s*=\s*\[([\s\S]*?)\]\s*;/);
        if (!scriptsMatch)
          continue;
        const block = scriptsMatch[1];
        const entryRegex = /\{[\s\S]*?lang\s*:\s*["']([^"']+)["'][\s\S]*?name\s*:\s*["']([^"']+)["'][\s\S]*?quality\s*:\s*["']([^"']+)["'][\s\S]*?url\s*:\s*["']([^"']+)["'][\s\S]*?\}/g;
        const rawLinks = [];
        let m;
        while ((m = entryRegex.exec(block)) !== null) {
          rawLinks.push({ lang: m[1], srv: m[2], quality: m[3], url: m[4] });
        }
        const results = yield Promise.allSettled(rawLinks.map((item) => __async(this, null, function* () {
          let url = item.url;
          try {
            if (url.includes("?r="))
              url = atob(url.split("?r=")[1]);
          } catch (e) {
          }
          const s = url.toLowerCase();
          let resolved = null;
          let key = "unknown";
          if (s.includes("voe")) {
            key = "voe";
            resolved = yield resolve(url);
          } else if (s.includes("vidhide")) {
            key = "vidhide";
            resolved = yield resolve3(url);
          } else if (s.includes("streamwish")) {
            key = "streamwish";
            resolved = yield resolve2(url);
          } else if (s.includes("ok.ru"))
            key = "ok.ru";
          else if (s.includes("drive.google"))
            key = "drive";
          return {
            name: "FuegoCine",
            title: `${item.quality || "HD"} \xB7 ${item.lang.toUpperCase()} \xB7 ${SERVER_LABELS[key] || item.srv}`,
            url: (resolved == null ? void 0 : resolved.url) || url,
            quality: item.quality || "HD",
            headers: { "User-Agent": UA4, "Referer": url },
            isM3U8: !!(resolved == null ? void 0 : resolved.isM3U8)
          };
        })));
        allStreams = allStreams.concat(results.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value));
      }
      return allStreams;
    } catch (e) {
      return [];
    }
  });
}
