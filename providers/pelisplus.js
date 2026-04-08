/**
 * pelisplus - Built from src/pelisplus/
 * Generated: 2026-04-08T18:37:47.734Z
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
  return new Promise((resolve, reject) => {
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
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/http.js
var require_http = __commonJS({
  "src/utils/http.js"(exports2, module2) {
    var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    var MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
    function request(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        const timeout = options.timeout || 15e3;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const headers = __spreadValues({
          "User-Agent": options.mobile ? MOBILE_UA : DEFAULT_UA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
        }, options.headers);
        try {
          const response = yield fetch(url, __spreadProps(__spreadValues({}, options), {
            headers,
            signal: controller.signal
          }));
          clearTimeout(id);
          if (!response.ok && !options.ignoreErrors) {
            console.warn(`[HTTP] Error ${response.status} en ${url}`);
          }
          return response;
        } catch (error) {
          clearTimeout(id);
          if (error.name === "AbortError") {
            console.error(`[HTTP] Timeout exceed (${timeout}ms) en ${url}`);
          } else {
            console.error(`[HTTP] Error en ${url}: ${error.message}`);
          }
          throw error;
        }
      });
    }
    function fetchHtml2(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        const res = yield request(url, options);
        return yield res.text();
      });
    }
    function fetchJson2(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        const res = yield request(url, options);
        return yield res.json();
      });
    }
    module2.exports = {
      request,
      fetchHtml: fetchHtml2,
      fetchJson: fetchJson2,
      DEFAULT_UA,
      MOBILE_UA
    };
  }
});

// src/pelisplus/extractor.js
var import_http = __toESM(require_http());
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));

// src/utils/string.js
var NOISE_WORDS = [
  "latino",
  "espanol",
  "hispano",
  "dual",
  "subs",
  "subtitulado",
  "hd",
  "1080p",
  "720p",
  "4k",
  "uhd",
  "completa",
  "pelicula",
  "serie",
  "episodio",
  "capitulo",
  "temporada"
];
function normalizeTitle(t) {
  if (!t)
    return "";
  let normalized = t.toLowerCase().replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o").replace(/[úùüû]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const parts = normalized.split(" ").filter((word) => !NOISE_WORDS.includes(word));
  return parts.length > 0 ? parts.join(" ") : normalized;
}
function calculateSimilarity(title1, title2) {
  const norm1 = normalizeTitle(title1);
  const norm2 = normalizeTitle(title2);
  if (norm1 === norm2)
    return 1;
  if (norm1.length > 6 && norm2.length > 6 && (norm2.includes(norm1) || norm1.includes(norm2))) {
    return 0.95;
  }
  const words1 = new Set(norm1.split(/\s+/).filter((w) => w.length > 1));
  const words2 = new Set(norm2.split(/\s+/).filter((w) => w.length > 1));
  if (words1.size === 0 || words2.size === 0) {
    return norm1 === norm2 ? 1 : norm1.includes(norm2) || norm2.includes(norm1) ? 0.5 : 0;
  }
  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = /* @__PURE__ */ new Set([...words1, ...words2]);
  const score = intersection.size / union.size;
  const yearMatch1 = title1.match(/\b(19|20)\d{2}\b/);
  const yearMatch2 = title2.match(/\b(19|20)\d{2}\b/);
  if (yearMatch1 && yearMatch2 && yearMatch1[0] !== yearMatch2[0]) {
    return score * 0.5;
  }
  return score;
}
function isGoodMatch(query, result, minScore = 0.45) {
  return calculateSimilarity(query, result) >= minScore;
}

// src/pelisplus/extractor.js
var BASE_URL = "https://www.pelisplushd.la";
function unpackEval(payload, radix, symtab) {
  return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function(match) {
    let result = 0;
    const digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < match.length; i++) {
      let pos = digits.indexOf(match[i]);
      if (pos === -1 || pos >= radix)
        return match;
      result = result * radix + pos;
    }
    if (result >= symtab.length)
      return match;
    return symtab[result] && symtab[result] !== "" ? symtab[result] : match;
  });
}
function resolveStreamwish(embedUrl) {
  return __async(this, null, function* () {
    try {
      let body = yield (0, import_http.fetchHtml)(embedUrl, { headers: { Referer: embedUrl } });
      if (body.includes("Page is loading") || body.length < 2e3) {
        const mirrorMatch = body.match(/main\s*:\s*\["([^"]+)"/i) || body.match(/["'](https?:\/\/[^"']+\/e\/[\w-]+)["']/i);
        if (mirrorMatch) {
          const mirrorUrl = mirrorMatch[1].startsWith("http") ? mirrorMatch[1] : `https://${mirrorMatch[1]}/e/${embedUrl.split("/").pop()}`;
          body = yield (0, import_http.fetchHtml)(mirrorUrl, { headers: { Referer: mirrorUrl } });
        }
      }
      const packMatch = body.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
      if (packMatch) {
        const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
        const m3u8 = unpacked.match(/"?(?:file|hls(?:2|3)?)"?\s*[:=]\s*"?([^"'\s,]+\.m3u8[^"'\s]*)"?/i) || unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (m3u8)
          return (m3u8[1] || m3u8[0]).replace(/\\/g, "");
      }
      const rawM3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
      return rawM3u8 ? rawM3u8[0] : embedUrl;
    } catch (e) {
      return embedUrl;
    }
  });
}
function resolveVidhide(embedUrl) {
  return __async(this, null, function* () {
    try {
      let body = yield (0, import_http.fetchHtml)(embedUrl, { headers: { Referer: embedUrl } });
      if (body.includes("Loading") || body.length < 2e3) {
        const mirrorMatch = body.match(/["'](https?:\/\/[^"']+\/v\/[\w-]+)["']/i);
        if (mirrorMatch)
          body = yield (0, import_http.fetchHtml)(mirrorMatch[1], { headers: { Referer: mirrorMatch[1] } });
      }
      const packMatch = body.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
      if (packMatch) {
        const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
        const m3u8 = unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (m3u8)
          return m3u8[0].replace(/\\/g, "");
      }
      const rawM3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
      return rawM3u8 ? rawM3u8[0] : embedUrl;
    } catch (e) {
      return embedUrl;
    }
  });
}
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
      const html = yield (0, import_http.fetchHtml)(url);
      const $ = import_cheerio_without_node_native.default.load(html);
      const title = $(".title h2 a").text().trim();
      const originalTitle = $(".original_title").text().replace("T\xEDtulo original:", "").trim();
      return {
        title: title || "",
        originalTitle: originalTitle || title || ""
      };
    } catch (error) {
      console.warn(`[PelisPlusHD] TMDB error: ${error.message}`);
      return null;
    }
  });
}
function decodeBase64(input) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = String(input).replace(/=+$/, "");
  let output = "";
  for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}
function resolveVoesx(embedUrl) {
  return __async(this, null, function* () {
    try {
      let body = yield (0, import_http.fetchHtml)(embedUrl, { headers: { Referer: embedUrl } });
      if (body.includes("Redirecting") || body.length < 1e3) {
        const redirectMatch = body.match(/window\.location\.href\s*=\s*['"](https?:\/\/[^'"]+)['"]/i);
        if (redirectMatch)
          body = yield (0, import_http.fetchHtml)(redirectMatch[1], { headers: { Referer: redirectMatch[1] } });
      }
      const jsonMatch = body.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
      if (jsonMatch) {
        try {
          let encText = JSON.parse(jsonMatch[1].trim())[0];
          let rot13 = encText.replace(/[a-zA-Z]/g, (c) => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
          const noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
          for (const n of noise)
            rot13 = rot13.split(n).join("");
          let b64_1 = decodeBase64(rot13);
          let shifted = "";
          for (let i = 0; i < b64_1.length; i++)
            shifted += String.fromCharCode(b64_1.charCodeAt(i) - 3);
          let reversed = shifted.split("").reverse().join("");
          let b64_2 = decodeBase64(reversed);
          let data = JSON.parse(b64_2);
          if (data && data.source)
            return data.source;
        } catch (ex) {
          console.log("[PelisPlusHD] Error decrypting VoeSX:", ex.message);
        }
      }
      const m3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
      return m3u8 ? m3u8[0].replace(/\\/g, "") : embedUrl;
    } catch (e) {
      return embedUrl;
    }
  });
}
function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
  return __async(this, null, function* () {
    try {
      console.log(`[PelisPlusHD] Scrapping: ${providedTitle || tmdbId} (${mediaType}) S${season || ""}E${episode || ""}`);
      const tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
      const titlesToTry = [];
      if (providedTitle)
        titlesToTry.push(providedTitle);
      if (tmdbInfo) {
        if (tmdbInfo.title)
          titlesToTry.push(tmdbInfo.title);
        if (tmdbInfo.originalTitle && tmdbInfo.originalTitle !== tmdbInfo.title)
          titlesToTry.push(tmdbInfo.originalTitle);
      }
      const uniqueTitles = [...new Set(titlesToTry)].filter((t) => t && t.length > 2);
      if (uniqueTitles.length === 0)
        return [];
      let movieUrl = null;
      for (const query of uniqueTitles) {
        const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(query)}`;
        const searchHtml = yield (0, import_http.fetchHtml)(searchUrl);
        const $search = import_cheerio_without_node_native.default.load(searchHtml);
        const results = [];
        $search("a.Posters-link").each((i, el) => {
          const el$ = $search(el);
          const title = el$.find("p").text().trim() || el$.attr("data-title") || "";
          const href = el$.attr("href") || "";
          results.push({ title, href });
        });
        if (results.length === 0)
          continue;
        const targetType = mediaType === "tv" ? "/serie/" : "/pelicula/";
        let match = results.find(
          (r) => (normalizeTitle(r.title) === normalizeTitle(query) || r.title.toLowerCase().includes(query.toLowerCase())) && r.href.includes(targetType)
        );
        if (!match) {
          match = results.find((r) => isGoodMatch(query, r.title, 0.45) && r.href.includes(targetType));
        }
        if (match) {
          console.log(`[PelisPlusHD] Match found: "${match.title}"`);
          movieUrl = BASE_URL + match.href;
          break;
        }
      }
      if (!movieUrl)
        return [];
      if (mediaType === "tv") {
        movieUrl = movieUrl.replace(/\/$/, "") + `/temporada/${season}/capitulo/${episode}`;
      }
      const pageHtml = yield (0, import_http.fetchHtml)(movieUrl, { headers: { Referer: BASE_URL } });
      const $page = import_cheerio_without_node_native.default.load(pageHtml);
      const pageTitle = $page("title").text() || "";
      const qualityMatch = pageTitle.match(/Online\s+[^-\s]+\s+([^-\s]+)\s+-/i) || pageTitle.match(/\s+([A-Z0-9]+)\s+-/i);
      let movieQuality = qualityMatch ? qualityMatch[1].trim() : "HD";
      const rawResults = [];
      $page("li.playurl").each((i, el) => {
        const $el = $page(el);
        const serverUrl = $el.attr("data-url");
        const language = $el.attr("data-name") || "Latino";
        const serverNameRaw = $el.find("a").text().trim() || "Servidor";
        if (serverUrl && serverUrl.startsWith("http")) {
          let name = serverNameRaw;
          if (serverUrl.includes("voe"))
            name = "Voe";
          else if (serverUrl.includes("streamwish") || serverUrl.includes("awish") || serverUrl.includes("dwish"))
            name = "Streamwish";
          else if (serverUrl.includes("vidhide"))
            name = "Vidhide";
          else if (serverUrl.includes("waaw") || serverUrl.includes("netu"))
            name = "Netu";
          rawResults.push({ serverUrl, serverName: name, language });
        }
      });
      const streams = yield Promise.all(rawResults.map((res) => __async(this, null, function* () {
        let finalUrl = res.serverUrl;
        const isStreamwish = /streamwish|strwish|wishembed|playnixes|niramirus|awish|dwish|fmoon|pstream/i.test(finalUrl);
        const isVidhide = /vidhide|dintezuvio|callistanise|acek-cdn|vadisov/i.test(finalUrl);
        const isVoesx = /voe\.sx|voe-sx|jefferycontrolmodel/i.test(finalUrl);
        if (isStreamwish)
          finalUrl = yield resolveStreamwish(finalUrl);
        else if (isVidhide)
          finalUrl = yield resolveVidhide(finalUrl);
        else if (isVoesx)
          finalUrl = yield resolveVoesx(finalUrl);
        if (!finalUrl.startsWith("http"))
          return null;
        return {
          name: "PelisPlusHD",
          title: `${res.serverName} (${res.language}) ${movieQuality}`,
          url: finalUrl,
          quality: movieQuality,
          headers: {
            "Referer": res.serverUrl,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
          }
        };
      })));
      return streams.filter((s) => s !== null);
    } catch (error) {
      console.error(`[PelisPlusHD] Error: ${error.message}`);
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
module.exports = { getStreams };
