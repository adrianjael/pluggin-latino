/**
 * pelisplus - Built from src/pelisplus/
 * Generated: 2026-04-08T22:57:37.564Z
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
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/http.js
var require_http = __commonJS({
  "src/utils/http.js"(exports2, module2) {
    var import_axios2 = __toESM(require("axios"));
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
    function fetchJson2(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.json();
      });
    }
    module2.exports = {
      request,
      fetchHtml: fetchHtml3,
      fetchJson: fetchJson2,
      DEFAULT_UA: DEFAULT_UA3,
      MOBILE_UA
    };
  }
});

// src/pelisplus/extractor.js
var import_http2 = __toESM(require_http());

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
  var normalized = t.toLowerCase().replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o").replace(/[úùüû]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  var words = normalized.split(" ");
  var filtered = [];
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var isNoise = false;
    for (var j = 0; j < NOISE_WORDS.length; j++) {
      if (NOISE_WORDS[j] === word) {
        isNoise = true;
        break;
      }
    }
    if (!isNoise)
      filtered.push(word);
  }
  return filtered.length > 0 ? filtered.join(" ") : normalized;
}
function calculateSimilarity(title1, title2) {
  var norm1 = normalizeTitle(title1);
  var norm2 = normalizeTitle(title2);
  if (norm1 === norm2)
    return 1;
  if (norm1.length > 6 && norm2.length > 6 && (norm2.indexOf(norm1) !== -1 || norm1.indexOf(norm2) !== -1)) {
    return 0.95;
  }
  var w1 = norm1.split(/\s+/);
  var w2 = norm2.split(/\s+/);
  var words1Map = {};
  var words2Map = {};
  var allUniqueWords = {};
  for (var i = 0; i < w1.length; i++) {
    if (w1[i].length > 1) {
      words1Map[w1[i]] = true;
      allUniqueWords[w1[i]] = true;
    }
  }
  for (var j = 0; j < w2.length; j++) {
    if (w2[j].length > 1) {
      words2Map[w2[j]] = true;
      allUniqueWords[w2[j]] = true;
    }
  }
  var intersection = 0;
  var union = 0;
  for (var word in allUniqueWords) {
    union++;
    if (words1Map[word] && words2Map[word]) {
      intersection++;
    }
  }
  if (union === 0)
    return 0;
  var score = intersection / union;
  var yearMatch1 = title1.match(/\b(19|20)\d{2}\b/);
  var yearMatch2 = title2.match(/\b(19|20)\d{2}\b/);
  if (yearMatch1 && yearMatch2 && yearMatch1[0] !== yearMatch2[0]) {
    return score * 0.5;
  }
  return score;
}
function isGoodMatch(query, result, minScore) {
  var ms = minScore || 0.45;
  return calculateSimilarity(query, result) >= ms;
}
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
var import_http = __toESM(require_http());
function resolve(url) {
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
var BASE_URL = "https://www.pelisplushd.la";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const typePath = mediaType === "tv" || mediaType === "series" ? "tv" : "movie";
      let data = {};
      if (String(tmdbId).startsWith("tt")) {
        const url = `https://api.themoviedb.org/3/find/${tmdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=es-MX`;
        const findData = yield (0, import_http2.fetchJson)(url);
        if (findData.movie_results && findData.movie_results.length > 0)
          data = findData.movie_results[0];
        else if (findData.tv_results && findData.tv_results.length > 0)
          data = findData.tv_results[0];
      } else {
        const url = `https://api.themoviedb.org/3/${typePath}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`;
        data = yield (0, import_http2.fetchJson)(url);
      }
      return {
        title: data.title || data.name || "",
        originalTitle: data.original_title || data.original_name || data.title || data.name || ""
      };
    } catch (error) {
      console.warn("[PelisPlusHD] TMDB error: " + error.message);
      return null;
    }
  });
}
function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
  return __async(this, null, function* () {
    try {
      console.log("[PelisPlusHD] Scrapping: " + (providedTitle || tmdbId) + " (" + mediaType + ") S" + (season || "") + "E" + (episode || ""));
      var tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
      var titlesToTry = [];
      if (providedTitle)
        titlesToTry.push(providedTitle);
      if (tmdbInfo) {
        if (tmdbInfo.title)
          titlesToTry.push(tmdbInfo.title);
        if (tmdbInfo.originalTitle && tmdbInfo.originalTitle !== tmdbInfo.title)
          titlesToTry.push(tmdbInfo.originalTitle);
      }
      var uniqueTitles = [];
      var seenTitles = {};
      for (var i = 0; i < titlesToTry.length; i++) {
        var tit = titlesToTry[i];
        if (tit && tit.length > 2 && !seenTitles[tit]) {
          uniqueTitles.push(tit);
          seenTitles[tit] = true;
        }
      }
      if (uniqueTitles.length === 0)
        return [];
      var movieUrl = null;
      for (var j = 0; j < uniqueTitles.length; j++) {
        var query = uniqueTitles[j];
        var searchUrl = BASE_URL + "/search?s=" + encodeURIComponent(query);
        var searchHtml = yield (0, import_http2.fetchHtml)(searchUrl);
        var searchResults = [];
        var aRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = aRegex.exec(searchHtml)) !== null) {
          var href = m[1];
          var inner = m[2];
          if (!href.includes("/pelicula/") && !href.includes("/serie/"))
            continue;
          var title = "";
          var pMatch = inner.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
          if (pMatch) {
            title = pMatch[1].trim();
          } else {
            var tMatch = m[0].match(/data-title="([^"]+)"/i);
            if (tMatch)
              title = tMatch[1].trim();
          }
          if (title)
            searchResults.push({ title, href });
        }
        if (searchResults.length === 0)
          continue;
        var targetType = mediaType === "tv" ? "/serie/" : "/pelicula/";
        var match = null;
        for (var k = 0; k < searchResults.length; k++) {
          var r = searchResults[k];
          if ((normalizeTitle(r.title) === normalizeTitle(query) || r.title.toLowerCase().indexOf(query.toLowerCase()) !== -1) && r.href.indexOf(targetType) !== -1) {
            match = r;
            break;
          }
        }
        if (!match) {
          for (var l = 0; l < searchResults.length; l++) {
            var r2 = searchResults[l];
            if (isGoodMatch(query, r2.title, 0.45) && r2.href.indexOf(targetType) !== -1) {
              match = r2;
              break;
            }
          }
        }
        if (match) {
          console.log('[PelisPlusHD] Match found: "' + match.title + '"');
          movieUrl = BASE_URL + match.href;
          break;
        }
      }
      if (!movieUrl)
        return [];
      if (mediaType === "tv") {
        movieUrl = movieUrl.replace(/\/$/, "") + "/temporada/" + season + "/capitulo/" + episode;
      }
      var pageHtml = yield (0, import_http2.fetchHtml)(movieUrl, { headers: { Referer: BASE_URL } });
      var pageTitle = "";
      var titleMatch = pageHtml.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch)
        pageTitle = titleMatch[1];
      var qualityMatch = pageTitle.match(/Online\s+[^-\s]+\s+([^-\s]+)\s+-/i) || pageTitle.match(/\s+([A-Z0-9]+)\s+-/i);
      var movieQuality = qualityMatch ? qualityMatch[1].trim() : "HD";
      var rawResults = [];
      var rawResults = [];
      var liRegex = /<li[^>]*data-url="([^"]+)"[^>]*>([\s\S]*?)<\/li>/gi;
      var liM;
      while ((liM = liRegex.exec(pageHtml)) !== null) {
        var serverUrl = liM[1];
        var innerContent = liM[2];
        var liTag = liM[0].replace(innerContent, "");
        if (!liTag.includes("playurl"))
          continue;
        var nameMatch = liTag.match(/data-name="([^"]+)"/i);
        var language = nameMatch ? nameMatch[1] : "Latino";
        var aMatch = innerContent.match(/<a[^>]*>([\s\S]*?)<\/a>/i) || innerContent.match(/>([^<]+)<\/span>/i);
        var serverNameRaw = aMatch ? aMatch[1].replace(/<[^>]+>/g, "").trim() : "Servidor";
        if (serverUrl && serverUrl.indexOf("http") === 0) {
          var name = serverNameRaw;
          if (serverUrl.indexOf("voe") !== -1)
            name = "Voe";
          else if (serverUrl.indexOf("streamwish") !== -1 || serverUrl.indexOf("awish") !== -1 || serverUrl.indexOf("dwish") !== -1)
            name = "Streamwish";
          else if (serverUrl.indexOf("vidhide") !== -1)
            name = "Vidhide";
          else if (serverUrl.indexOf("waaw") !== -1 || serverUrl.indexOf("netu") !== -1)
            name = "Netu";
          rawResults.push({ serverUrl, serverName: name, language });
        }
      }
      var finalStreams = [];
      for (var m = 0; m < rawResults.length; m++) {
        var res = rawResults[m];
        var fUrl = res.serverUrl;
        var isVoesx = /voe\.sx|voe-sx|jefferycontrolmodel/i.test(fUrl);
        let directUrl = fUrl;
        if (isVoesx) {
          const voeRes = yield resolve(fUrl);
          if (voeRes && voeRes.url) {
            directUrl = voeRes.url;
          }
        }
        if (directUrl && directUrl.indexOf("http") === 0) {
          var extMatch = directUrl.match(/\.(m3u8|mp4|mkv|avI|m4v|webm)/i);
          if (extMatch !== null || directUrl.indexOf("waaw") !== -1) {
            finalStreams.push({
              name: "PelisPlusHD",
              langLabel: res.language,
              serverLabel: res.serverName,
              url: directUrl,
              quality: movieQuality,
              headers: {
                "Referer": res.serverUrl,
                "User-Agent": import_http2.DEFAULT_UA
              }
            });
          }
        }
      }
      return finalStreams;
    } catch (error) {
      console.error("[PelisPlusHD] Error: " + error.message);
      return [];
    }
  });
}

// src/utils/m3u8.js
var import_axios = __toESM(require("axios"));
function getQualityFromHeight(height) {
  if (!height)
    return "Auto";
  const h = parseInt(height);
  if (h >= 2160)
    return "4K";
  if (h >= 1440)
    return "1440p";
  if (h >= 1080)
    return "1080p";
  if (h >= 720)
    return "720p";
  if (h >= 480)
    return "480p";
  if (h >= 360)
    return "360p";
  return "240p";
}
function parseBestQuality(content) {
  const lines = content.split("\n");
  let bestHeight = 0;
  for (const line of lines) {
    if (line.includes("RESOLUTION=")) {
      const match = line.match(/RESOLUTION=\d+x(\d+)/);
      if (match) {
        const height = parseInt(match[1]);
        if (height > bestHeight)
          bestHeight = height;
      }
    }
  }
  return bestHeight > 0 ? getQualityFromHeight(bestHeight) : "720p";
}
function validateStream(stream) {
  return __async(this, null, function* () {
    if (!stream || !stream.url)
      return stream;
    const { url, headers } = stream;
    try {
      const response = yield import_axios.default.get(url, {
        timeout: 4e3,
        responseType: "text",
        headers: __spreadProps(__spreadValues({}, headers || {}), {
          "Accept": "*/*",
          "User-Agent": (headers == null ? void 0 : headers["User-Agent"]) || "Mozilla/5.0"
        })
      });
      if (response.data && typeof response.data === "string" && (url.includes(".m3u8") || response.data.includes("#EXTM3U"))) {
        const realQuality = parseBestQuality(response.data);
        return __spreadProps(__spreadValues({}, stream), {
          quality: realQuality,
          verified: true
          // <--- Marcamos como verificado
        });
      }
      return __spreadProps(__spreadValues({}, stream), { verified: true });
    } catch (error) {
      return __spreadProps(__spreadValues({}, stream), { verified: false });
    }
  });
}

// src/utils/sorting.js
var QUALITY_SCORE = {
  "4K": 100,
  "1440p": 90,
  "1080p": 80,
  "720p": 70,
  "480p": 60,
  "360p": 50,
  "240p": 40,
  "Auto": 30,
  "Unknown": 0
};
function sortStreamsByQuality(streams) {
  if (!Array.isArray(streams))
    return [];
  return [...streams].sort((a, b) => {
    const scoreA = QUALITY_SCORE[a.quality] || 0;
    const scoreB = QUALITY_SCORE[b.quality] || 0;
    if (scoreA === scoreB) {
      if (a.quality === "Auto")
        return 1;
      if (b.quality === "Auto")
        return -1;
    }
    return scoreB - scoreA;
  });
}

// src/utils/engine.js
function normalizeLanguage(lang) {
  const l = (lang || "").toLowerCase();
  if (l.includes("latino") || l.includes("lat"))
    return "Latino";
  if (l.includes("espa\xF1ol") || l.includes("castellano") || l.includes("esp"))
    return "Espa\xF1ol";
  if (l.includes("sub") || l.includes("vose"))
    return "Subtitulado";
  return lang || "Latino";
}
function normalizeServer(server) {
  if (!server)
    return "Servidor";
  const s = server.toLowerCase();
  if (s.includes("voe"))
    return "VOE";
  if (s.includes("filemoon"))
    return "Filemoon";
  if (s.includes("streamwish") || s.includes("awish") || s.includes("dwish"))
    return "StreamWish";
  if (s.includes("vidhide") || s.includes("dintezuvio"))
    return "VidHide";
  if (s.includes("waaw") || s.includes("netu"))
    return "Netu";
  if (s.includes("fastream"))
    return "Fastream";
  return server;
}
function finalizeStreams(streams, providerName) {
  return __async(this, null, function* () {
    if (!Array.isArray(streams) || streams.length === 0)
      return [];
    console.log(`[Engine] Processing ${streams.length} streams for ${providerName}...`);
    let validated = streams;
    try {
      const results = yield Promise.allSettled(
        streams.map((s) => validateStream(s))
      );
      validated = results.map(
        (r, i) => r.status === "fulfilled" ? r.value : streams[i]
      );
    } catch (e) {
      console.error(`[Engine] Validation error: ${e.message}`);
    }
    const sorted = sortStreamsByQuality(validated);
    return sorted.map((s) => {
      const q = s.quality || "HD";
      const lang = normalizeLanguage(s.langLabel || s.language);
      const server = normalizeServer(s.serverLabel || s.serverName || s.servername);
      const check = s.verified ? " \u2713" : "";
      return {
        name: providerName || s.name || "Provider",
        title: `${q}${check} \xB7 ${lang} \xB7 ${server}`,
        url: s.url,
        quality: q,
        headers: s.headers || {}
      };
    });
  });
}

// src/pelisplus/index.js
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      console.log(`[PelisPlusHD] Request: ${mediaType} ${tmdbId} (Title: ${title || "N/A"})`);
      const streams = yield extractStreams(tmdbId, mediaType, season, episode, title);
      return yield finalizeStreams(streams, "PelisPlusHD");
    } catch (error) {
      console.error(`[PelisPlusHD] Fatal Error in index: ${error.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
