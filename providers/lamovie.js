/**
 * lamovie - Built from src/lamovie/
 * Generated: 2026-04-04T04:49:41.972Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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

// src/lamovie/index.js
var lamovie_exports = {};
__export(lamovie_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(lamovie_exports);
var import_axios7 = __toESM(require("axios"));

// src/resolvers/goodstream.js
var import_axios2 = __toESM(require("axios"));

// src/resolvers/quality.js
var import_axios = __toESM(require("axios"));
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function detectQuality(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    try {
      if (!url || !url.includes(".m3u8"))
        return "1080p";
      const { data } = yield import_axios.default.get(url, {
        timeout: 5e3,
        headers: __spreadValues({ "User-Agent": UA }, headers),
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
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function resolve(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[GoodStream] Resolviendo: ${embedUrl}`);
      const response = yield import_axios2.default.get(embedUrl, {
        headers: {
          "User-Agent": UA2,
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
      const refererHeaders = { "Referer": embedUrl, "Origin": "https://goodstream.one", "User-Agent": UA2 };
      const quality = yield detectQuality(videoUrl, refererHeaders);
      console.log(`[GoodStream] URL encontrada (${quality}): ${videoUrl.substring(0, 80)}...`);
      return { url: videoUrl, quality, headers: refererHeaders };
    } catch (err) {
      console.log(`[GoodStream] Error: ${err.message}`);
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
function resolve2(url) {
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

// src/resolvers/filemoon.js
var import_axios4 = __toESM(require("axios"));
var import_crypto_js = __toESM(require("crypto-js"));
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
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
function resolve3(url) {
  return __async(this, null, function* () {
    var _a;
    try {
      console.log(`[Filemoon] Resolviendo: ${url}`);
      const idMatch = url.match(/\/(?:e|d)\/([a-z0-9]{12})/i);
      if (!idMatch)
        return null;
      const id = idMatch[1];
      const playbackUrl = `https://filemooon.link/api/videos/${id}/embed/playback`;
      const { data } = yield import_axios4.default.get(playbackUrl, { timeout: 7e3, headers: { "User-Agent": UA4, Referer: url } });
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
      return { url: streamUrl, quality: "1080p", headers: { "User-Agent": UA4, Referer: url, Origin: "https://filemoon.sx" } };
    } catch (e) {
      console.log(`[Filemoon] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/hlswish.js
var import_axios5 = __toESM(require("axios"));
var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
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
function resolve4(url) {
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
      const { data: html } = yield import_axios5.default.get(targetUrl, {
        headers: { "User-Agent": UA5, Referer: "https://embed69.org/", Origin: "https://embed69.org" },
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
        return { url: finalUrl, quality: "1080p", headers: { "User-Agent": UA5, Referer: baseOrigin + "/" } };
      }
      return null;
    } catch (e) {
      console.log(`[HLSWish] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/vimeos.js
var import_axios6 = __toESM(require("axios"));
var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function resolve5(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[Vimeos] Resolviendo: ${embedUrl}`);
      const resp = yield import_axios6.default.get(embedUrl, {
        headers: {
          "User-Agent": UA6,
          "Referer": "https://vimeos.net/",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        timeout: 15e3,
        maxRedirects: 5
      });
      const data = resp.data;
      const packMatch = data.match(
        /eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/
      );
      if (packMatch) {
        const payload = packMatch[1];
        const radix = parseInt(packMatch[2]);
        const symtab = packMatch[4].split("|");
        const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const unbase = (str) => {
          let result = 0;
          for (let i = 0; i < str.length; i++)
            result = result * radix + chars.indexOf(str[i]);
          return result;
        };
        const unpacked = payload.replace(/\b(\w+)\b/g, (match) => {
          const idx = unbase(match);
          return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
        });
        const m3u8Match = unpacked.match(/["']([^"']+\.m3u8[^"']*)['"]/i);
        if (m3u8Match) {
          const url = m3u8Match[1];
          const refererHeaders = { "User-Agent": UA6, "Referer": "https://vimeos.net/" };
          const quality = yield detectQuality(url, refererHeaders);
          console.log(`[Vimeos] URL encontrada: ${url.substring(0, 80)}...`);
          return { url, quality, headers: refererHeaders };
        }
      }
      console.log("[Vimeos] No se encontr\xF3 URL");
      return null;
    } catch (err) {
      console.log(`[Vimeos] Error: ${err.message}`);
      return null;
    }
  });
}

// src/lamovie/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var UA7 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
var HEADERS = { "User-Agent": UA7, "Accept": "application/json" };
var BASE_URL = "https://la.movie";
var ANIME_COUNTRIES = ["JP", "CN", "KR"];
var GENRE_ANIMATION = 16;
var RESOLVERS = {
  "goodstream.one": resolve,
  "hlswish.com": resolve4,
  "streamwish.com": resolve4,
  "streamwish.to": resolve4,
  "strwish.com": resolve4,
  "voe.sx": resolve2,
  "filemoon.sx": resolve3,
  "filemoon.to": resolve3,
  "vimeos.net": resolve5
};
var getServerName = (url) => {
  if (url.includes("goodstream"))
    return "GoodStream";
  if (url.includes("hlswish") || url.includes("streamwish"))
    return "StreamWish";
  if (url.includes("voe.sx"))
    return "VOE";
  if (url.includes("filemoon"))
    return "Filemoon";
  if (url.includes("vimeos.net"))
    return "Vimeos";
  return "Online";
};
var getResolver = (url) => {
  if (!url)
    return null;
  for (const [pattern, resolver] of Object.entries(RESOLVERS)) {
    if (url.includes(pattern))
      return resolver;
  }
  return null;
};
function buildSlug(title, year) {
  const slug = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return year ? `${slug}-${year}` : slug;
}
function getCategories(mediaType, genres, originCountries) {
  if (mediaType === "movie")
    return ["peliculas"];
  const isAnimation = (genres || []).includes(GENRE_ANIMATION);
  if (!isAnimation)
    return ["series"];
  const isAnimeCountry = (originCountries || []).some((c) => ANIME_COUNTRIES.includes(c));
  if (isAnimeCountry)
    return ["animes"];
  return ["animes", "series"];
}
function getTmdbData(tmdbId, mediaType) {
  return __async(this, null, function* () {
    var _a;
    const attempts = [{ lang: "es-MX" }, { lang: "en-US" }];
    for (const { lang } of attempts) {
      try {
        const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=${lang}`;
        const { data } = yield import_axios7.default.get(url, { timeout: 5e3, headers: HEADERS });
        const title = mediaType === "movie" ? data.title : data.name;
        const originalTitle = mediaType === "movie" ? data.original_title : data.original_name;
        return {
          title,
          originalTitle,
          year: (data.release_date || data.first_air_date || "").substring(0, 4),
          genres: (data.genres || []).map((g) => g.id),
          originCountries: data.origin_country || ((_a = data.production_countries) == null ? void 0 : _a.map((c) => c.iso_3166_1)) || []
        };
      } catch (e) {
      }
    }
    return null;
  });
}
function getIdBySlug(category, slug) {
  return __async(this, null, function* () {
    const url = `${BASE_URL}/${category}/${slug}/`;
    try {
      const { data: html } = yield import_axios7.default.get(url, {
        timeout: 8e3,
        headers: { "User-Agent": UA7, "Accept": "text/html" },
        validateStatus: (s) => s === 200
      });
      const match = html.match(/rel=['"]shortlink['"]\s+href=['"][^'"]*\?p=(\d+)['"]/);
      if (match) {
        console.log(`[LaMovie] \u2713 Slug directo: /${category}/${slug} \u2192 id:${match[1]}`);
        return { id: match[1] };
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}
function findBySlug(tmdbInfo, mediaType) {
  return __async(this, null, function* () {
    const { title, originalTitle, year, genres, originCountries } = tmdbInfo;
    const categories = getCategories(mediaType, genres, originCountries);
    const slugs = [];
    if (title)
      slugs.push(buildSlug(title, year));
    if (originalTitle && originalTitle !== title)
      slugs.push(buildSlug(originalTitle, year));
    for (const slug of slugs) {
      for (const cat of categories) {
        const result = yield getIdBySlug(cat, slug);
        if (result)
          return result;
      }
    }
    return null;
  });
}
function getEpisodeId(seriesId, seasonNum, episodeNum) {
  return __async(this, null, function* () {
    var _a;
    const url = `${BASE_URL}/wp-api/v1/single/episodes/list?_id=${seriesId}&season=${seasonNum}&page=1&postsPerPage=50`;
    try {
      const { data } = yield import_axios7.default.get(url, { timeout: 12e3, headers: HEADERS });
      if (!((_a = data == null ? void 0 : data.data) == null ? void 0 : _a.posts))
        return null;
      const ep = data.data.posts.find((e) => e.season_number == seasonNum && e.episode_number == episodeNum);
      return (ep == null ? void 0 : ep._id) || null;
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    var _a;
    if (!tmdbId || !mediaType)
      return [];
    const startTime = Date.now();
    try {
      const tmdbInfo = yield getTmdbData(tmdbId, mediaType);
      if (!tmdbInfo)
        return [];
      const found = yield findBySlug(tmdbInfo, mediaType);
      if (!found)
        return [];
      let targetId = found.id;
      if (mediaType === "tv" && season && episode) {
        const epId = yield getEpisodeId(targetId, season, episode);
        if (!epId)
          return [];
        targetId = epId;
      }
      const { data } = yield import_axios7.default.get(`${BASE_URL}/wp-api/v1/player?postId=${targetId}&demo=0`, { timeout: 6e3, headers: HEADERS });
      if (!((_a = data == null ? void 0 : data.data) == null ? void 0 : _a.embeds))
        return [];
      const streams = (yield Promise.allSettled(data.data.embeds.map((embed) => __async(this, null, function* () {
        const resolver = getResolver(embed.url);
        if (!resolver)
          return null;
        const result = yield resolver(embed.url);
        if (!result || !result.url)
          return null;
        return {
          name: "LaMovie",
          title: `${result.quality || "1080p"} \xB7 ${getServerName(embed.url)}`,
          url: result.url,
          quality: result.quality || "1080p",
          headers: result.headers || {}
        };
      })))).filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
      return streams;
    } catch (e) {
      console.log(`[LaMovie] Error: ${e.message}`);
      return [];
    }
  });
}
