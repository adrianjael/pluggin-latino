/**
 * pelisplus - Built from src/pelisplus/
 * Generated: 2026-04-09T16:28:54.279Z
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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve4, reject) => {
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
    var step = (x) => x.done ? resolve4(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/pelisplus/http.js
var BASE_URL = "https://www.pelisplushd.la";
var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var COMMON_HEADERS = {
  "User-Agent": DEFAULT_UA,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1"
};
function fetchText(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    try {
      const response = yield fetch(url, __spreadValues({
        headers: __spreadValues(__spreadValues({}, COMMON_HEADERS), options.headers)
      }, options));
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status} for ${url}`);
      }
      return yield response.text();
    } catch (error) {
      console.error(`[PelisPlusHD] Fetch error: ${error.message}`);
      throw error;
    }
  });
}

// src/resolvers/hlswish.js
var import_axios = __toESM(require("axios"));
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function unpackEval(payload, radix, symtab) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const unbase = (str) => {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      const pos = chars.indexOf(str[i]);
      if (pos === -1)
        return NaN;
      result = result * radix + pos;
    }
    return result;
  };
  return payload.replace(/\b([0-9a-zA-Z]+)\b/g, (match) => {
    const idx = unbase(match);
    if (isNaN(idx) || idx >= symtab.length)
      return match;
    return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
  });
}
function resolve(url) {
  return __async(this, null, function* () {
    try {
      let targetUrl = url;
      const rawId = url.split("/").pop();
      const mirrors = [
        targetUrl,
        `https://embedwish.com/e/${rawId}`,
        `https://hglamioz.com/e/${rawId}`,
        `https://awish.pro/e/${rawId}`,
        `https://strwish.com/e/${rawId}`
      ];
      let html = "";
      let usedUrl = targetUrl;
      for (const mirror of mirrors) {
        try {
          console.log(`[StreamWish] Probando espejo: ${mirror}`);
          const response = yield import_axios.default.get(mirror, {
            headers: { "User-Agent": UA, "Referer": "https://embed69.org/" },
            timeout: 8e3
          });
          html = response.data;
          usedUrl = mirror;
          if (!html.includes("Page is loading") && (html.includes("eval(function") || html.includes(".m3u8"))) {
            break;
          }
        } catch (mirrorErr) {
          continue;
        }
      }
      if (!html)
        return null;
      const baseOrigin = (usedUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
      let finalUrl = null;
      const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
      if (fileMatch) {
        finalUrl = fileMatch[1];
      }
      if (!finalUrl) {
        const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packedMatch) {
          const unpacked = unpackEval(packedMatch[1], parseInt(packedMatch[2]), packedMatch[4].split("|"));
          const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i) || unpacked.match(/https?:\/\/[^"' \t\n\r]+\.m3u8[^"' \t\n\r]*/i);
          if (m3u8Match) {
            finalUrl = m3u8Match[1] || m3u8Match[0];
          }
        }
      }
      if (!finalUrl) {
        const rawMatch = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (rawMatch)
          finalUrl = rawMatch[0];
      }
      if (finalUrl) {
        if (finalUrl.startsWith("/"))
          finalUrl = baseOrigin + finalUrl;
        finalUrl = finalUrl.replace(/\\/g, "");
        console.log(`[StreamWish] URL resuelta satisfactoriamente`);
        return {
          url: finalUrl,
          quality: "HD",
          headers: {
            "User-Agent": UA,
            "Referer": baseOrigin + "/",
            "Origin": baseOrigin
          }
        };
      }
      return null;
    } catch (e) {
      console.log(`[StreamWish] Error cr\xEDtico: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/vidhide.js
var import_axios2 = __toESM(require("axios"));
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
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
      while (l > 0) {
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
function resolve2(url) {
  return __async(this, null, function* () {
    try {
      console.log(`[VidHide] Resolviendo: ${url}`);
      const { data: html } = yield import_axios2.default.get(url, {
        timeout: 15e3,
        maxRedirects: 10,
        headers: { "User-Agent": UA2, "Referer": "https://embed69.org/" }
      });
      let finalUrl = null;
      const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
      if (packedMatch) {
        const unpacked = unpackVidHide(packedMatch[0]);
        if (unpacked) {
          const hlsMatch = unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/);
          if (hlsMatch)
            finalUrl = hlsMatch[1];
        }
      }
      if (!finalUrl) {
        const rawMatch = html.match(/"hls[24]"\s*:\s*"([^"]+)"/) || html.match(/file\s*:\s*["']([^"']+)["']/i);
        if (rawMatch)
          finalUrl = rawMatch[1];
      }
      if (!finalUrl) {
        console.log("[VidHide] No se encontr\xF3 URL de video");
        return null;
      }
      if (!finalUrl.startsWith("http")) {
        finalUrl = new URL(url).origin + finalUrl;
      }
      console.log(`[VidHide] URL encontrada: ${finalUrl.substring(0, 80)}...`);
      const origin = new URL(url).origin;
      return {
        url: finalUrl,
        headers: {
          "User-Agent": UA2,
          "Referer": origin + "/",
          "Origin": origin
        }
      };
    } catch (e) {
      console.log(`[VidHide] Error: ${e.message}`);
      return null;
    }
  });
}

// src/utils/http.js
var import_axios3 = __toESM(require("axios"));
var DEFAULT_UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
function request(url, options) {
  return __async(this, null, function* () {
    var opt = options || {};
    var headers = Object.assign({
      "User-Agent": opt.mobile ? MOBILE_UA : DEFAULT_UA2,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
    }, opt.headers);
    try {
      var timeoutMs = opt.timeout || 5e3;
      var controller = new AbortController();
      var timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);
      var fetchOptions = Object.assign({}, opt, {
        headers,
        signal: controller.signal
      });
      var response = yield fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      if (!response.ok && !opt.ignoreErrors) {
        console.warn("[HTTP] Error " + response.status + " en " + url);
      }
      return response;
    } catch (error) {
      console.error("[HTTP] Error en " + url + ": " + error.message);
      throw error;
    }
  });
}
function fetchHtml(url, options) {
  return __async(this, null, function* () {
    var res = yield request(url, options);
    return yield res.text();
  });
}

// src/utils/string.js
function base64Decode(input) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var str = String(input).replace(/=+$/, "");
  var output = "";
  if (str.length % 4 === 1)
    throw new Error("Base64 invalido");
  var bc = 0, bs, buffer, idx = 0;
  while (buffer = str.charAt(idx++)) {
    buffer = chars.indexOf(buffer);
    if (~buffer) {
      bs = bc % 4 ? bs * 64 + buffer : buffer;
      if (bc++ % 4) {
        output += String.fromCharCode(255 & bs >> (-2 * bc & 6));
      }
    }
  }
  return output;
}

// src/resolvers/voe.js
function resolve3(url) {
  return __async(this, null, function* () {
    try {
      console.log("[VOE] Resolving: " + url);
      var html = yield fetchHtml(url, { headers: { "User-Agent": DEFAULT_UA2 } });
      if (html.indexOf("Redirecting") !== -1 || html.length < 1500) {
        var rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm) {
          html = yield fetchHtml(rm[1], { headers: { "User-Agent": DEFAULT_UA2 } });
        }
      }
      var jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
      if (jsonMatch) {
        try {
          var parsed = JSON.parse(jsonMatch[1].trim());
          var encText = Array.isArray(parsed) ? parsed[0] : parsed;
          if (typeof encText !== "string")
            return null;
          var rot13 = encText.replace(/[a-zA-Z]/g, function(c) {
            var code = c.charCodeAt(0);
            var limit = c <= "Z" ? 90 : 122;
            var shifted = code + 13;
            return String.fromCharCode(limit >= shifted ? shifted : shifted - 26);
          });
          var noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
          for (var i = 0; i < noise.length; i++) {
            var n = noise[i];
            rot13 = rot13.split(n).join("");
          }
          var b64_1 = base64Decode(rot13);
          var shiftedStr = "";
          for (var j = 0; j < b64_1.length; j++) {
            shiftedStr += String.fromCharCode(b64_1.charCodeAt(j) - 3);
          }
          var reversed = shiftedStr.split("").reverse().join("");
          var data = JSON.parse(base64Decode(reversed));
          if (data && data.source) {
            console.log("[VOE] -> m3u8 encontrado: " + data.source.substring(0, 60) + "...");
            return {
              url: data.source,
              quality: "1080p",
              headers: { "User-Agent": DEFAULT_UA2, "Referer": url }
            };
          }
        } catch (ex) {
          console.error("[VOE] Decryption failed:", ex.message);
        }
      }
      var m3u8MatchRaw = html.match(/["'](https?:\/\/[^"']+?\.m3u8[^"']*?)["']/i);
      if (m3u8MatchRaw) {
        return {
          url: m3u8MatchRaw[1],
          quality: "1080p",
          headers: { "User-Agent": DEFAULT_UA2, "Referer": url }
        };
      }
      return null;
    } catch (e) {
      console.error("[VOE] Error resolviedo: " + e.message);
      return null;
    }
  });
}

// src/pelisplus/extractor.js
function normalizeTitle(t) {
  if (!t)
    return "";
  return t.toLowerCase().replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o").replace(/[úùüû]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function titleMatch(query, target) {
  const q = normalizeTitle(query);
  const t = normalizeTitle(target);
  if (!q || !t)
    return false;
  if (q === t || t.includes(q) || q.includes(t))
    return true;
  const qWords = q.split(" ").filter((w) => w.length > 2);
  const tWords = t.split(" ");
  if (qWords.length === 0)
    return false;
  return qWords.every((w) => tWords.includes(w));
}
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    var _a, _b;
    try {
      const typePath = mediaType === "tv" ? "tv" : "movie";
      let url = `https://api.themoviedb.org/3/${typePath}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`;
      if (String(tmdbId).startsWith("tt")) {
        url = `https://api.themoviedb.org/3/find/${tmdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=es-MX`;
        const res2 = yield fetch(url);
        const findData = yield res2.json();
        const result = mediaType === "movie" ? (_a = findData.movie_results) == null ? void 0 : _a[0] : (_b = findData.tv_results) == null ? void 0 : _b[0];
        if (result) {
          return {
            title: result.title || result.name || "",
            originalTitle: result.original_title || result.original_name || "",
            year: (result.release_date || result.first_air_date || "").split("-")[0]
          };
        }
      }
      const res = yield fetch(url);
      const data = yield res.json();
      return {
        title: data.title || data.name || "",
        originalTitle: data.original_title || data.original_name || "",
        year: (data.release_date || data.first_air_date || "").split("-")[0]
      };
    } catch (error) {
      console.error("[PelisPlusHD] TMDB Error:", error.message);
      return null;
    }
  });
}
function extractStreams(query, tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[PelisPlusHD] Extracting: ${query} (TMDB: ${tmdbId}, Type: ${mediaType})`);
      const tmdb = yield getTmdbInfo(tmdbId, mediaType);
      const titlesToTry = [query];
      if (tmdb) {
        if (tmdb.title)
          titlesToTry.push(tmdb.title);
        if (tmdb.originalTitle)
          titlesToTry.push(tmdb.originalTitle);
      }
      let movieUrl = null;
      for (const q of titlesToTry) {
        if (!q)
          continue;
        const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(q)}`;
        console.log(`[PelisPlusHD] Searching: ${searchUrl}`);
        const searchHtml = yield fetchText(searchUrl);
        const aRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        let m;
        while ((m = aRegex.exec(searchHtml)) !== null) {
          const href = m[1];
          const inner = m[2];
          if (mediaType === "movie" && !href.includes("/pelicula/"))
            continue;
          if (mediaType === "tv" && !href.includes("/serie/"))
            continue;
          let resultTitle = "";
          const pMatch = inner.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
          if (pMatch)
            resultTitle = pMatch[1].trim();
          else {
            const tMatch = m[0].match(/data-title="([^"]+)"/i);
            if (tMatch)
              resultTitle = tMatch[1].trim();
          }
          if (titleMatch(q, resultTitle) || tmdb && (titleMatch(tmdb.title, resultTitle) || titleMatch(tmdb.originalTitle, resultTitle))) {
            movieUrl = BASE_URL + href;
            console.log(`[PelisPlusHD] Found Base URL: ${movieUrl}`);
            break;
          }
        }
        if (movieUrl)
          break;
      }
      if (!movieUrl) {
        console.log(`[PelisPlusHD] No matches found for ${tmdbId}`);
        return [];
      }
      if (mediaType === "tv") {
        if (movieUrl.endsWith("/"))
          movieUrl = movieUrl.slice(0, -1);
        movieUrl = `${movieUrl}/temporada/${season}/capitulo/${episode}`;
        console.log(`[PelisPlusHD] Episode URL: ${movieUrl}`);
      }
      const pageHtml = yield fetchText(movieUrl);
      const rawResults = [];
      const optionsRegex = /var\s+options\s*=\s*({[\s\S]*?});/i;
      const optionsMatch = pageHtml.match(optionsRegex);
      if (optionsMatch) {
        console.log("[PelisPlusHD] Found 'var options' JSON.");
        try {
          let jsonStr = optionsMatch[1].replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/\/\/.*/g, "").replace(/'/g, '"');
          const options = JSON.parse(jsonStr);
          for (const key in options) {
            const list = options[key];
            if (Array.isArray(list)) {
              list.forEach((item) => {
                if (item.url)
                  rawResults.push({ serverUrl: item.url, serverName: item.name || key, language: key });
              });
            }
          }
        } catch (e) {
          console.warn("[PelisPlusHD] JSON parse failed, trying regex on options.");
          const linkRegex = /"url":\s*"([^"]+)"/g;
          let linkM;
          while ((linkM = linkRegex.exec(optionsMatch[1])) !== null) {
            rawResults.push({ serverUrl: linkM[1], serverName: "Server", language: "Latino" });
          }
        }
      }
      if (rawResults.length === 0) {
        console.log("[PelisPlusHD] No sources in 'options', checking spans/links fallback...");
        const spanRegex = /<span[^>]*lid="(\d+)"[^>]*url="([^"]+)"/gi;
        let sM;
        while ((sM = spanRegex.exec(pageHtml)) !== null) {
          const id = sM[1];
          const serverUrl = sM[2];
          let serverName = "Server";
          const liRegex = new RegExp(`<li[^>]*data-id="${id}"[^>]*>[\\s\\S]*?<a[^>]*>(.*?)</a>`, "i");
          const liMatch = pageHtml.match(liRegex);
          if (liMatch) {
            serverName = liMatch[1].trim();
          }
          rawResults.push({ serverUrl, serverName, language: "Latino" });
        }
        if (rawResults.length === 0) {
          const liRegex = /<li[^>]*data-url="([^"]+)"[^>]*data-name="([^"]*)"/gi;
          let liM;
          while ((liM = liRegex.exec(pageHtml)) !== null) {
            rawResults.push({ serverUrl: liM[1], serverName: "Server", language: liM[2] || "Latino" });
          }
        }
      }
      console.log(`[PelisPlusHD] Found ${rawResults.length} raw sources.`);
      const streams = [];
      for (const res of rawResults) {
        let finalUrl = null;
        const url = res.serverUrl;
        try {
          if (url.includes("hlswish") || url.includes("hglamioz.com") || url.includes("streamwish")) {
            finalUrl = yield resolve(url);
          } else if (url.includes("vidhide")) {
            finalUrl = yield resolve2(url);
          } else if (url.includes("voe")) {
            finalUrl = yield resolve3(url);
          }
          if (finalUrl) {
            const directUrl = typeof finalUrl === "string" ? finalUrl : finalUrl.url;
            if (directUrl) {
              streams.push({
                name: "PelisPlusHD",
                title: `HD - ${res.serverName} (${res.language})`,
                url: directUrl,
                quality: "HD",
                headers: typeof finalUrl === "object" && finalUrl.headers ? finalUrl.headers : { "Referer": BASE_URL }
              });
            }
          }
        } catch (e) {
          console.error(`[PelisPlusHD] Error resolving ${url}:`, e.message);
        }
      }
      return streams;
    } catch (error) {
      console.error("[PelisPlusHD] extractStreams Error:", error.message);
      return [];
    }
  });
}

// src/pelisplus/index.js
var TMDB_API_KEY2 = "329ff07ab18731d6861cb7ffc013fac3";
function cleanTitleTMDB(title) {
  if (!title)
    return "";
  return title.replace(/[áàäâ]/gi, "a").replace(/[éèëê]/gi, "e").replace(/[íìïî]/gi, "i").replace(/[óòöô]/gi, "o").replace(/[úùüû]/gi, "u").replace(/ñ/gi, "n").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}
function getStreams(req) {
  return __async(this, null, function* () {
    try {
      let tmdbTitle = "";
      const parts = req.query.split(":");
      const id = parts[0];
      const season = parts.length >= 3 ? parseInt(parts[1]) : null;
      const episode = parts.length >= 3 ? parseInt(parts[2]) : null;
      console.log(`[PelisPlusHD] Request type=${req.type} id=${id} season=${season} episode=${episode}`);
      const isTv = req.type === "series" || req.type === "tv";
      const tmdbUrl = id.startsWith("tt") ? `https://api.themoviedb.org/3/find/${id}?api_key=${TMDB_API_KEY2}&language=es-MX&external_source=imdb_id` : isTv ? `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY2}&language=es-MX` : `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY2}&language=es-MX`;
      const response = yield fetch(tmdbUrl);
      const data = yield response.json();
      if (id.startsWith("tt")) {
        const tvResults = data.tv_results || [];
        const movieResults = data.movie_results || [];
        if (tvResults.length > 0)
          tmdbTitle = tvResults[0].name || "";
        else if (movieResults.length > 0)
          tmdbTitle = movieResults[0].title || "";
      } else if (isTv) {
        tmdbTitle = data.name || "";
      } else {
        tmdbTitle = data.title || "";
      }
      if (!tmdbTitle) {
        console.log(`[PelisPlusHD] No TMDB title found for ${id}`);
        return [];
      }
      const formattedTitle = cleanTitleTMDB(tmdbTitle);
      console.log(`[PelisPlusHD] Searching: "${formattedTitle}" (${req.type})`);
      return yield extractStreams(formattedTitle, id, req.type, season, episode);
    } catch (e) {
      console.error("[PelisPlusHD] Fatal Error:", e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
