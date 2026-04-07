/**
 * pelisplus - Built from src/pelisplus/
 * Generated: 2026-04-07T22:14:18.224Z
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

// src/pelisplus/index.js
var pelisplus_exports = {};
__export(pelisplus_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(pelisplus_exports);

// src/pelisplus/http.js
var BASE_URL = "https://www.pelisplushd.la";
var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var COMMON_HEADERS = {
  "User-Agent": DEFAULT_UA,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Upgrade-Insecure-Requests": "1"
};
function fetchText(_0) {
  return __async(this, arguments, function* (url, referer = BASE_URL) {
    try {
      const headers = __spreadValues({}, COMMON_HEADERS);
      if (referer)
        headers["Referer"] = referer;
      const response = yield fetch(url, { headers, timeout: 1e4 });
      if (!response.ok) {
        console.warn(`[HTTP] Error ${response.status} en ${url}`);
        return "";
      }
      return yield response.text();
    } catch (error) {
      console.error(`[HTTP] Fetch error: ${error.message} (${url})`);
      return "";
    }
  });
}

// src/pelisplus/extractor.js
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));

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
function decryptByse(playback) {
  return __async(this, null, function* () {
    try {
      const keyArr = [];
      for (const p of playback.key_parts)
        base64UrlDecode(p).forEach((b) => keyArr.push(b));
      const key = new Uint8Array(keyArr);
      const iv = base64UrlDecode(playback.iv);
      const ciphertextWithTag = base64UrlDecode(playback.payload);
      if (typeof crypto !== "undefined" && crypto.subtle) {
        try {
          const cryptoKey = yield crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]);
          const decryptedArr = yield crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertextWithTag);
          return JSON.parse(new TextDecoder().decode(decryptedArr));
        } catch (e) {
        }
      }
      const decryptedStr = decryptGCM(key, iv, ciphertextWithTag);
      return decryptedStr ? JSON.parse(decryptedStr) : null;
    } catch (e) {
      return null;
    }
  });
}
function resolve2(url) {
  return __async(this, null, function* () {
    try {
      const origin = new URL(url).origin;
      const idMatch = url.match(/\/e\/([a-zA-Z0-9]+)/);
      if (!idMatch)
        return null;
      const id = idMatch[1];
      try {
        const apiRes = yield fetch(`https://${new URL(url).hostname}/api/videos/${id}`, {
          headers: { "User-Agent": UA2, "Referer": url }
        });
        const data = yield apiRes.json();
        if (data.playback) {
          const decrypted = yield decryptByse(data.playback);
          if (decrypted && decrypted.sources) {
            const best = decrypted.sources[0];
            return { url: best.url, quality: best.height ? `${best.height}p` : "1080p", isM3U8: true, headers: { "User-Agent": UA2, "Referer": origin + "/", "Origin": origin } };
          }
        }
      } catch (e) {
      }
      const res = yield fetch(url, { headers: { "User-Agent": UA2, "Referer": url } });
      const html = yield res.text();
      const fm = html.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/);
      if (fm)
        return { url: fm[1], quality: "1080p", isM3U8: true, headers: { "User-Agent": UA2, "Referer": origin + "/", "Origin": origin } };
      return null;
    } catch (e) {
      return null;
    }
  });
}

// src/resolvers/hlswish.js
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
      const origin = new URL(targetUrl).origin;
      const res = yield fetch(targetUrl, {
        headers: { "User-Agent": UA3, "Referer": origin + "/", "Origin": origin }
      });
      const html = yield res.text();
      let finalUrl = null;
      const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
      if (fileMatch) {
        finalUrl = fileMatch[1];
        if (finalUrl.startsWith("/"))
          finalUrl = origin + finalUrl;
      }
      if (!finalUrl) {
        const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packedMatch) {
          const unpacked = unpack(packedMatch[1], parseInt(packedMatch[2]), parseInt(packedMatch[3]), packedMatch[4].split("|"));
          const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
          if (m3u8Match) {
            finalUrl = m3u8Match[1];
            if (finalUrl.startsWith("/"))
              finalUrl = origin + finalUrl;
          }
        }
      }
      if (finalUrl) {
        return { url: finalUrl, quality: "1080p", headers: { "User-Agent": UA3, "Referer": origin + "/" } };
      }
      return null;
    } catch (e) {
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
      const origin = new URL(url).origin;
      const res = yield fetch(url, {
        headers: { "User-Agent": UA4, "Referer": origin + "/" }
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
      if (!finalUrl.startsWith("http"))
        finalUrl = origin + finalUrl;
      return {
        url: finalUrl,
        quality: "1080p",
        headers: { "User-Agent": UA4, "Referer": origin + "/", "Origin": origin }
      };
    } catch (e) {
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

// src/pelisplus/extractor.js
var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var SERVER_LABELS = {
  "voe": "VOE",
  "streamwish": "StreamWish",
  "hglink": "StreamWish",
  "sw": "StreamWish",
  "wishembed": "StreamWish",
  "filemoon": "Filemoon",
  "f75s": "Filemoon",
  "vidhide": "VidHide",
  "minochinos": "VidHide",
  "dintezuvio": "VidHide",
  "vidhidepro": "VidHide",
  "uqload": "Uqload"
};
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType === "movie" ? "movie" : "tv"}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`;
      const res = yield fetch(url);
      const data = yield res.json();
      return {
        title: data.title || data.name || "",
        originalTitle: data.original_title || data.original_name || ""
      };
    } catch (error) {
      return null;
    }
  });
}
function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
  return __async(this, null, function* () {
    try {
      const tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
      const title = (tmdbInfo == null ? void 0 : tmdbInfo.title) || providedTitle || "";
      const originalTitle = (tmdbInfo == null ? void 0 : tmdbInfo.originalTitle) || "";
      const queries = [title, title.split(":")[0].trim(), originalTitle].filter((q) => q && q.length > 2);
      let results = [];
      for (const query of queries) {
        const cleanQuery = query.replace(/[:]/g, " ");
        const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(cleanQuery)}`;
        const searchHtml = yield fetchText(searchUrl);
        const $search = import_cheerio_without_node_native.default.load(searchHtml);
        $search("a.Posters-link").each((i, el) => {
          const t = $search(el).find("p").text().trim() || $search(el).attr("data-title") || "";
          const h = $search(el).attr("href") || "";
          if (h)
            results.push({ title: t, href: h });
        });
        if (results.length > 0)
          break;
      }
      const targetType = mediaType === "tv" ? "/serie/" : "/pelicula/";
      const match = results.find(
        (r) => (calculateSimilarity(normalizeTitle(title), normalizeTitle(r.title)) > 0.35 || calculateSimilarity(normalizeTitle(originalTitle), normalizeTitle(r.title)) > 0.35) && r.href.includes(targetType)
      ) || (results.length > 0 && results[0].href.includes(targetType) ? results[0] : null);
      if (!match)
        return [];
      let targetUrl = BASE_URL + match.href;
      if (mediaType === "tv")
        targetUrl = targetUrl.replace(/\/$/, "") + `/temporada/${season}/capitulo/${episode}`;
      const pageHtml = yield fetchText(targetUrl);
      const $page = import_cheerio_without_node_native.default.load(pageHtml);
      const pageTitle = $page("title").text() || "";
      const movieQuality = (pageTitle.match(/Online\s+[^-\s]+\s+([^-\s]+)\s+-/i) || [null, "HD"])[1];
      const embeds = [];
      $page(".playurl, #link_url span").each((i, el) => {
        const url = $page(el).attr("data-url") || $page(el).attr("url");
        if (url && url.startsWith("http"))
          embeds.push(url);
      });
      const resolved = yield Promise.allSettled(embeds.map((url) => __async(this, null, function* () {
        const s = url.toLowerCase();
        let key = "unknown";
        let res = null;
        if (s.includes("voe")) {
          key = "voe";
          res = yield resolve(url);
        } else if (s.includes("filemoon")) {
          key = "filemoon";
          res = yield resolve2(url);
        } else if (s.includes("streamwish") || s.includes("hglink")) {
          key = "streamwish";
          res = yield resolve3(url);
        } else if (s.includes("vidhide")) {
          key = "vidhide";
          res = yield resolve4(url);
        } else if (s.includes("uqload")) {
          key = "uqload";
          res = yield resolve5(url);
        }
        if (res && res.url) {
          return {
            name: "PelisPlusHD",
            title: `${res.quality || movieQuality} \xB7 Latino \xB7 ${SERVER_LABELS[key] || key}`,
            url: res.url,
            quality: res.quality || movieQuality,
            headers: res.headers || { "Referer": url, "User-Agent": UA6 }
          };
        }
        return null;
      })));
      return resolved.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
    } catch (error) {
      return [];
    }
  });
}

// src/pelisplus/index.js
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      console.log(`[PelisPlusHD] Request: ${mediaType} ${tmdbId} (Title: ${title || "N/A"})`);
      const streams = yield extractStreams(tmdbId, mediaType, season, episode, title);
      if (streams.length === 0) {
        console.log(`[PelisPlusHD] No matches found for ${tmdbId}`);
      }
      return streams;
    } catch (error) {
      console.error(`[PelisPlusHD] Fatal Error in index: ${error.message}`);
      return [];
    }
  });
}
