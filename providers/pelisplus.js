/**
 * pelisplus - Built from src/pelisplus/
 * Generated: 2026-04-09T14:17:22.648Z
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
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// src/utils/http.js
var require_http = __commonJS({
  "src/utils/http.js"(exports2, module2) {
    var import_axios3 = __toESM(require("axios"));
    var DEFAULT_UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    var MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
    function request(url, options) {
      return __async(this, null, function* () {
        var opt = options || {};
        var headers = Object.assign({
          "User-Agent": opt.mobile ? MOBILE_UA : DEFAULT_UA3,
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
    function fetchHtml3(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.text();
      });
    }
    function fetchJson(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.json();
      });
    }
    module2.exports = {
      request,
      fetchHtml: fetchHtml3,
      fetchJson,
      DEFAULT_UA: DEFAULT_UA3,
      MOBILE_UA
    };
  }
});

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

// src/resolvers/voe.js
var import_http = __toESM(require_http());

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
      var html = yield (0, import_http.fetchHtml)(url, { headers: { "User-Agent": import_http.DEFAULT_UA } });
      if (html.indexOf("Redirecting") !== -1 || html.length < 1500) {
        var rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm) {
          html = yield (0, import_http.fetchHtml)(rm[1], { headers: { "User-Agent": import_http.DEFAULT_UA } });
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
              headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": url }
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
          headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": url }
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
function titleMatch(queryTitle, resultTitle) {
  const q = normalizeTitle(queryTitle);
  const r = normalizeTitle(resultTitle);
  if (!q || !r)
    return false;
  if (r === q || r.includes(q) || q.includes(r))
    return true;
  const qWords = q.split(" ").filter((w) => w.length > 2);
  const rWords = r.split(" ");
  if (qWords.length === 0)
    return false;
  return qWords.every((w) => rWords.includes(w));
}
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      let typePath = mediaType === "tv" ? "tv" : "movie";
      if (String(tmdbId).startsWith("tt")) {
        const url = `https://api.themoviedb.org/3/find/${tmdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=es-MX`;
        const res = yield fetch(url);
        const findData = yield res.json();
        if (mediaType === "movie" && findData.movie_results && findData.movie_results.length > 0) {
          return {
            title: findData.movie_results[0].title || "",
            originalTitle: findData.movie_results[0].original_title || ""
          };
        } else if (mediaType === "tv" && findData.tv_results && findData.tv_results.length > 0) {
          return {
            title: findData.tv_results[0].name || "",
            originalTitle: findData.tv_results[0].original_name || ""
          };
        }
      } else {
        const res = yield fetch(`https://api.themoviedb.org/3/${typePath}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`);
        const data = yield res.json();
        if (mediaType === "movie") {
          return {
            title: data.title || "",
            originalTitle: data.original_title || data.title || ""
          };
        } else {
          return {
            title: data.name || "",
            originalTitle: data.original_name || data.name || ""
          };
        }
      }
    } catch (error) {
      return null;
    }
  });
}
function extractStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const tmdb = yield getTmdbInfo(tmdbId, mediaType);
      if (!tmdb || !tmdb.title)
        return [];
      const titlesToTry = [tmdb.title];
      if (tmdb.originalTitle && tmdb.originalTitle !== tmdb.title) {
        titlesToTry.push(tmdb.originalTitle);
      }
      let movieUrl = null;
      for (const query of titlesToTry) {
        const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(query)}`;
        const searchHtml = yield fetchText(searchUrl);
        var aRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = aRegex.exec(searchHtml)) !== null) {
          var href = m[1];
          var inner = m[2];
          if (!href.includes("/pelicula/") && !href.includes("/serie/"))
            continue;
          var resultTitle = "";
          var pMatch = inner.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
          if (pMatch)
            resultTitle = pMatch[1].trim();
          else {
            var tMatch = m[0].match(/data-title="([^"]+)"/i);
            if (tMatch)
              resultTitle = tMatch[1].trim();
          }
          if (titleMatch(query, resultTitle) || titleMatch(tmdb.title, resultTitle)) {
            movieUrl = BASE_URL + href;
            break;
          }
        }
        if (movieUrl)
          break;
      }
      if (!movieUrl)
        return [];
      if (mediaType === "tv") {
        movieUrl = movieUrl.replace("/serie/", "/episodio/") + `-${season}x${episode}`;
      }
      const pageHtml = yield fetchText(movieUrl);
      const pageTitleMatch = pageHtml.match(/<title>([^<]+)<\/title>/i);
      const pageTitle = pageTitleMatch ? pageTitleMatch[1] : "";
      const qualityMatch = pageTitle.match(/Online\s+[^-\s]+\s+([^-\s]+)\s+-/i) || pageTitle.match(/\s+([A-Z0-9]+)\s+-/i);
      let movieQuality = qualityMatch ? qualityMatch[1].trim() : "HD";
      const rawResults = [];
      var liRegex = /<li[^>]*data-url="([^"]+)"[^>]*>([\s\S]*?)<\/li>/gi;
      var liM;
      while ((liM = liRegex.exec(pageHtml)) !== null) {
        var serverUrl = liM[1];
        var innerContent = liM[2];
        var liTag = liM[0].replace(innerContent, "");
        if (!liTag.includes("playurl"))
          continue;
        var nameMatch = liTag.match(/data-name="([^"]+)"/i);
        var language = nameMatch ? nameMatch[1] : "Espa\xF1ol Latino";
        var aMatch = innerContent.match(/<a[^>]*>([\s\S]*?)<\/a>/i) || innerContent.match(/>([^<]+)<\/span>/i);
        var serverName = aMatch ? aMatch[1].replace(/<[^>]+>/g, "").trim() : "Servidor";
        if (serverUrl && (language.includes("Latino") || language.includes("Espa\xF1ol"))) {
          rawResults.push({ serverUrl, serverName, language });
        }
      }
      const optMatch = pageHtml.match(/var options = {([\s\S]+?)};/);
      if (optMatch) {
        const optionsRaw = optMatch[1];
        const urlRegex = /"(option\d+)":\s*"([^"]+)"/g;
        let match;
        while ((match = urlRegex.exec(optionsRaw)) !== null) {
          const optId = match[1];
          const serverUrl2 = match[2];
          const serverNameMatch = pageHtml.match(new RegExp(`<a[^>]*href="#${optId}"[^>]*>([^<]+)</a>`, "i"));
          const serverName2 = serverNameMatch ? serverNameMatch[1].trim() : "Servidor";
          if (serverUrl2 && serverUrl2.startsWith("http")) {
            rawResults.push({ serverUrl: serverUrl2, serverName: serverName2, language: "Espa\xF1ol Latino" });
          }
        }
      }
      const streams = yield Promise.all(rawResults.map((res) => __async(this, null, function* () {
        let finalData = null;
        const isStreamwish = /streamwish|strwish|wishembed|playnixes|niramirus|awish|dwish|fmoon|pstream|hglamioz|hlswish|embedwish|sswish|fullwish/i.test(res.serverUrl);
        const isVidhide = /vidhide|dintezuvio|callistanise|acek-cdn|vadisov/i.test(res.serverUrl);
        const isVoesx = /voe\.sx|voe-sx|jefferycontrolmodel/i.test(res.serverUrl);
        if (isStreamwish)
          finalData = yield resolve(res.serverUrl);
        else if (isVidhide)
          finalData = yield resolve2(res.serverUrl);
        else if (isVoesx)
          finalData = yield resolve3(res.serverUrl);
        if (!finalData || !finalData.url)
          return null;
        if (!finalData.url.includes(".m3u8") && !finalData.url.includes(".mp4"))
          return null;
        const cleanServerName = res.serverName.replace(/\s*\(.*?\)\s*/g, "").trim();
        return {
          name: "PelisPlusHD",
          title: `${movieQuality} \u2713
${cleanServerName} - ${res.language.includes("Latino") ? "Latino" : "Espa\xF1ol"}`,
          url: finalData.url,
          quality: movieQuality,
          headers: finalData.headers || {
            "Referer": res.serverUrl,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
          }
        };
      })));
      return streams.filter((s) => s !== null);
    } catch (error) {
      return [];
    }
  });
}

// src/pelisplus/index.js
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[PelisPlusHD] Request: ${mediaType} ${tmdbId}`);
      const streams = yield extractStreams(tmdbId, mediaType, season, episode);
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
module.exports = { getStreams };
