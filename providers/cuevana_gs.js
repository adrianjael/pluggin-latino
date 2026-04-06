/**
 * cuevana_gs - Built from src/cuevana_gs/
 * Generated: 2026-04-06T17:37:19.711Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

// src/cuevana_gs/extractor.js
var BASE_URL = "https://cuevana.gs";
var BASE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  "Referer": BASE_URL,
  "Accept-Language": "es-ES,es;q=0.9"
};
function fetchHtml(_0) {
  return __async(this, arguments, function* (url, referer = BASE_URL) {
    const res = yield fetch(url, { headers: __spreadProps(__spreadValues({}, BASE_HEADERS), { Referer: referer }) });
    return res.text();
  });
}
function resolveEmbed(embedUrl, server) {
  return __async(this, null, function* () {
    try {
      if (server === "voe") {
        const r = yield resolve(embedUrl);
        return r ? r.url : null;
      }
      if (server.includes("filemoon") || server.includes("f75s")) {
        const r = yield resolve2(embedUrl);
        return r ? r.url : null;
      }
      const html = yield fetchHtml(embedUrl, embedUrl);
      const m = html.match(/https?:\/\/[^"'\s\\]+?\.m3u8[^"'\s\\]*/i);
      return m ? m[0].replace(/\\/g, "") : null;
    } catch (e) {
      return null;
    }
  });
}
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
      const res = yield fetch(url, { headers: { "User-Agent": BASE_HEADERS["User-Agent"] } });
      const html = yield res.text();
      let title = "";
      let year = "";
      const titleMatch = html.match(/<title>(.*?)(?:\s+&\#8212;|\s+-|\s+\()/);
      if (titleMatch)
        title = titleMatch[1].trim();
      const yearMatch = html.match(/\((\d{4})\)/);
      if (yearMatch)
        year = yearMatch[1];
      return { title, year };
    } catch (e) {
    }
    return { title: null, year: "" };
  });
}
function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
  return __async(this, null, function* () {
    var _a, _b, _c, _d, _e, _f;
    const isMovie = mediaType === "movie";
    const targetType = isMovie ? "movies" : "tvshows";
    console.log(`[Cuevana.gs v2.0] Extracting: ${providedTitle || tmdbId} (${mediaType}) S${season}E${episode}`);
    try {
      const tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
      let searchTitle = providedTitle || tmdbInfo.title;
      const year = tmdbInfo.year;
      function performSearch(query) {
        return __async(this, null, function* () {
          console.log(`[Cuevana.gs] Searching: "${query}"`);
          const encodedQuery = encodeURIComponent(query);
          const searchUrl = `${BASE_URL}/wp-api/v1/search?postType=any&q=${encodedQuery}&postsPerPage=10`;
          try {
            const searchRes = yield fetch(searchUrl, { headers: BASE_HEADERS });
            return yield searchRes.json();
          } catch (err) {
            return { error: true };
          }
        });
      }
      let searchJson = yield performSearch(`${searchTitle} ${year}`);
      if ((searchJson.error || !((_b = (_a = searchJson.data) == null ? void 0 : _a.posts) == null ? void 0 : _b.length)) && providedTitle && tmdbInfo.title) {
        searchJson = yield performSearch(`${tmdbInfo.title} ${year}`);
      }
      if ((searchJson.error || !((_d = (_c = searchJson.data) == null ? void 0 : _c.posts) == null ? void 0 : _d.length)) && tmdbInfo.title) {
        searchJson = yield performSearch(tmdbInfo.title);
      }
      if (searchJson.error || !((_f = (_e = searchJson.data) == null ? void 0 : _e.posts) == null ? void 0 : _f.length)) {
        searchJson = yield performSearch(searchTitle);
      }
      if (searchJson.error || !searchJson.data || !searchJson.data.posts || searchJson.data.posts.length === 0) {
        console.log(`[Cuevana.gs] No results found.`);
        return [];
      }
      const posts = searchJson.data.posts;
      const normalizedTarget = (tmdbInfo.title || searchTitle).toLowerCase().replace(/[^a-z0-9]/g, "");
      let post = posts.find((p) => p.type === targetType && p.title.toLowerCase().replace(/[^a-z0-9]/g, "").includes(normalizedTarget)) || posts.find((p) => p.type === targetType) || posts[0];
      let postId = post._id;
      if (!isMovie && season && episode) {
        try {
          const episodesUrl = `${BASE_URL}/wp-api/v1/single/episodes/list?_id=${postId}&season=${season}&postsPerPage=100`;
          const epRes = yield fetch(episodesUrl, { headers: BASE_HEADERS });
          const epJson = yield epRes.json();
          if (!epJson.error && epJson.data && epJson.data.posts) {
            const epMatch = epJson.data.posts.find((e) => parseInt(e.episode_number) === parseInt(episode));
            if (epMatch)
              postId = epMatch._id;
          }
        } catch (err) {
        }
      }
      let playerUrl = `${BASE_URL}/wp-api/v1/player?postId=${postId}&demo=0`;
      const playerRes = yield fetch(playerUrl, { headers: BASE_HEADERS });
      const playerJson = yield playerRes.json();
      if (playerJson.error || !playerJson.data || !playerJson.data.embeds || playerJson.data.embeds.length === 0) {
        return [];
      }
      const embeds = playerJson.data.embeds;
      const streamPromises = embeds.map(function(embed) {
        return __async(this, null, function* () {
          const proxyUrl = embed.url;
          const lang = embed.lang || "Latino";
          const quality = embed.quality || "HD";
          let server = "unknown";
          try {
            const urlObj = new URL(proxyUrl);
            server = (urlObj.searchParams.get("server") || "unknown").toLowerCase();
          } catch (e) {
          }
          if (server === "goodstream")
            return null;
          try {
            const proxyHtml = yield fetchHtml(proxyUrl, BASE_URL);
            const iframeMatch = proxyHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
            if (!iframeMatch)
              return null;
            const embedUrl = iframeMatch[1];
            const finalUrl = yield resolveEmbed(embedUrl, server);
            if (!finalUrl || !finalUrl.startsWith("http"))
              return null;
            const isVimeos = server.includes("vimeos");
            const mobileUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
            return {
              name: "Cuevana.gs",
              title: `${server} (${lang}) ${quality}`,
              url: finalUrl,
              quality,
              headers: {
                "User-Agent": mobileUA,
                "Referer": isVimeos ? "https://vimeos.net/" : embedUrl,
                "Origin": isVimeos ? "https://vimeos.net" : void 0
              }
            };
          } catch (e) {
            return null;
          }
        });
      });
      const results = yield Promise.all(streamPromises);
      return results.filter((s) => s !== null);
    } catch (error) {
      console.error(`[Cuevana.gs] Global Error: ${error.message}`);
      return [];
    }
  });
}

// src/cuevana_gs/index.js
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      return yield extractStreams(tmdbId, mediaType, season, episode, title);
    } catch (e) {
      console.error(`[Cuevana.gs] Index error: ${e.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
