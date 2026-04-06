/**
 * pelisgo - Built from src/pelisgo/
 * Generated: 2026-04-06T17:37:19.746Z
 */
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve3, reject) => {
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
    var step = (x) => x.done ? resolve3(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/aes-gcm.js
var CryptoJS = require("crypto-js");
function decryptGCM(key, iv, ciphertextWithTag) {
  try {
    const tagSize = 16;
    const ciphertext = ciphertextWithTag.slice(0, -tagSize);
    const keyWA = CryptoJS.lib.WordArray.create(key);
    const ivCounter = new Uint8Array(16);
    ivCounter.set(iv, 0);
    ivCounter[15] = 2;
    const ivWA = CryptoJS.lib.WordArray.create(ivCounter);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.lib.WordArray.create(ciphertext) },
      keyWA,
      {
        iv: ivWA,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.NoPadding
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error("[PureJS-GCM] Error Decrypting:", e.message);
    return null;
  }
}

// src/resolvers/filemoon.js
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
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
function resolve(url) {
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
          headers: { "User-Agent": UA, "Referer": url }
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
                "User-Agent": UA,
                "Referer": "https://arbitrarydecisions.com/",
                "Origin": "https://arbitrarydecisions.com"
              }
            };
          }
        }
      } catch (apiErr) {
        console.log(`[Filemoon] API Byse Failed: ${apiErr.message}`);
      }
      const res = yield fetch(url, { headers: { "User-Agent": UA, "Referer": url } });
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
              "User-Agent": UA,
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
function resolve2(url) {
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

// src/pelisgo/index.js
var BASE = "https://pelisgo.online";
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var TMDB_KEY = "2dca580c2a14b55200e784d157207b4d";
var COMMON_HEADERS = {
  "User-Agent": UA3,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache"
};
function cleanTitle(str) {
  if (!str)
    return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s\-]/gi, "").toLowerCase().trim();
}
function getSpanishTitle(tmdbId, type) {
  return __async(this, null, function* () {
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
function fetchText(_0) {
  return __async(this, arguments, function* (url, referer = BASE) {
    try {
      const headers = __spreadValues({}, COMMON_HEADERS);
      if (referer)
        headers["Referer"] = referer;
      const res = yield fetch(url, { headers });
      return yield res.text();
    } catch (e) {
      return "";
    }
  });
}
function resolvePelisGoDownload(id) {
  return __async(this, null, function* () {
    if (!id)
      return null;
    try {
      const res = yield fetch(`https://pelisgo.online/api/download/${id}`, {
        headers: COMMON_HEADERS
      });
      const data = yield res.json();
      return data.url || null;
    } catch (e) {
      return null;
    }
  });
}
function pelisgoSearch(query, type) {
  return __async(this, null, function* () {
    const searchStr = cleanTitle(query);
    const url = `${BASE}/search?q=${encodeURIComponent(searchStr)}`;
    const html = yield fetchText(url);
    if (!html)
      return [];
    const re = /href="(\/(movies|series)\/([a-z0-9\-]+))"/gi;
    const results = [];
    const seen = /* @__PURE__ */ new Set();
    let m;
    while ((m = re.exec(html)) !== null) {
      if (m[1].includes("/temporada/") || m[1].includes("/episodio/"))
        continue;
      const isMatch = type === "movie" && m[2] === "movies" || type === "tv" && m[2] === "series";
      if (isMatch && !seen.has(m[3])) {
        seen.add(m[3]);
        results.push(m[1]);
      }
    }
    return results;
  });
}
function getOnlineStreams(rawHtml) {
  return __async(this, null, function* () {
    const streams = [];
    const seenUrls = /* @__PURE__ */ new Set();
    try {
      const videoLinksMatch = rawHtml.match(/videoLinks[\\"' ]+:\[(.*?)\]/);
      if (videoLinksMatch) {
        const rawLinksJson = videoLinksMatch[1];
        const urlRegex = /url[\\"' ]+:[\\"' ]+([^\s"'\\]+)[\\"' ]+/gi;
        let m;
        while ((m = urlRegex.exec(rawLinksJson)) !== null) {
          let cleanUrl = m[1].replace(/\\/g, "");
          if (seenUrls.has(cleanUrl))
            continue;
          seenUrls.add(cleanUrl);
          let label = "PelisGo";
          let direct = null;
          if (cleanUrl.includes("filemoon") || cleanUrl.includes("f75s.com")) {
            label = "Magi (Filemoon)";
            const r = yield resolve(cleanUrl);
            if (r)
              direct = r.url;
          } else if (cleanUrl.includes("voe.sx")) {
            label = "VOE";
            const r = yield resolve2(cleanUrl);
            if (r)
              direct = r.url;
          } else if (cleanUrl.includes("desu")) {
            label = "Desu";
          } else if (cleanUrl.includes("seekstreaming") || cleanUrl.includes("embedseek")) {
            label = "SeekStreaming";
          } else if (cleanUrl.includes("hqq.ac") || cleanUrl.includes("netu")) {
            label = "Netu";
          }
          if (direct) {
            streams.push({ name: "PelisGo", title: `[Directo] \xB7 ${label}`, url: direct, quality: "1080p", isM3U8: true });
          } else {
            streams.push({ name: "PelisGo", title: `[Web] \xB7 ${label}`, url: cleanUrl, quality: "1080p" });
          }
        }
      }
    } catch (e) {
    }
    try {
      const globalRegex = /\{[^{}]*?server[\\"' ]+:[\\"' ]+(Buzzheavier|Pixeldrain)[^{}]*?url[\\"' ]+:[\\"' ]+([^"'\s]+)[^}]*?\}/gi;
      let m;
      while ((m = globalRegex.exec(rawHtml)) !== null) {
        const serverName = m[1];
        let maybeUrl = m[2].replace(/\\/g, "");
        let directUrl = null;
        if (maybeUrl.includes("/download/")) {
          const downloadId = maybeUrl.split("/").pop().replace(/[^\w]/g, "");
          directUrl = yield resolvePelisGoDownload(downloadId);
        } else if (maybeUrl.includes("http")) {
          directUrl = maybeUrl;
        }
        if (directUrl && !seenUrls.has(directUrl)) {
          seenUrls.add(directUrl);
          streams.push({
            name: "PelisGo",
            title: `[F-Direct] \xB7 ${serverName}`,
            url: directUrl,
            quality: "1080p"
          });
        }
      }
    } catch (e) {
    }
    return streams;
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      const type = mediaType === "tv" || mediaType === "series" ? "tv" : "movie";
      console.log(`[PelisGo v1.7.0] Scann: "${title}" (${type}) tmdbId: ${tmdbId}`);
      let paths = yield pelisgoSearch(title, type);
      if (paths.length === 0 && tmdbId) {
        console.log(`[PelisGo] Reintentando con t\xEDtulo oficial de TMDB...`);
        const tmdbType = type === "tv" ? "tv" : "movie";
        const officialTitle = yield getSpanishTitle(tmdbId, tmdbType);
        if (officialTitle && officialTitle !== title) {
          console.log(`[PelisGo] Nombre detectado: "${officialTitle}"`);
          paths = yield pelisgoSearch(officialTitle, type);
        }
      }
      if (paths.length === 0)
        return [];
      const slug = paths[0].split("/")[paths[0].split("/").length - 1];
      const pageUrl = type === "movie" ? `${BASE}/movies/${slug}` : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;
      const html = yield fetchText(pageUrl);
      if (!html)
        return [];
      const onlineStreams = yield getOnlineStreams(html);
      console.log(`[PelisGo] Done: ${onlineStreams.length} stream(s) found (Direct Video Edition).`);
      return onlineStreams;
    } catch (e) {
      return [];
    }
  });
}
module.exports = { getStreams };
