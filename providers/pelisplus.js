/**
 * pelisplus - Built from src/pelisplus/
 * Generated: 2026-04-08T20:30:38.858Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
          var fetchOptions = Object.assign({}, opt, { headers });
          var response = yield fetch(url, fetchOptions);
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
    function fetchHtml2(url, options) {
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
      fetchHtml: fetchHtml2,
      fetchJson: fetchJson2,
      DEFAULT_UA: DEFAULT_UA2,
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

// src/pelisplus/extractor.js
var BASE_URL = "https://www.pelisplushd.la";
function unpackEval(payload, radix, symtab) {
  return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function(match) {
    var result = 0;
    var digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = 0; i < match.length; i++) {
      var pos = digits.indexOf(match[i]);
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
      var body = yield (0, import_http.fetchHtml)(embedUrl, { headers: { Referer: embedUrl } });
      if (body.indexOf("Page is loading") !== -1 || body.length < 2e3) {
        var mirrorMatch = body.match(/main\s*:\s*\["([^"]+)"/i) || body.match(/["'](https?:\/\/[^"']+\/e\/[\w-]+)["']/i);
        if (mirrorMatch) {
          var mirrorUrl = mirrorMatch[1].indexOf("http") === 0 ? mirrorMatch[1] : "https://" + mirrorMatch[1] + "/e/" + embedUrl.split("/").pop();
          body = yield (0, import_http.fetchHtml)(mirrorUrl, { headers: { Referer: mirrorUrl } });
        }
      }
      var packMatch = body.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
      if (packMatch) {
        var unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
        var m3u8 = unpacked.match(/"?(?:file|hls(?:2|3)?)"?\s*[:=]\s*"?([^"'\s,]+\.m3u8[^"'\s]*)"?/i) || unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (m3u8)
          return (m3u8[1] || m3u8[0]).replace(/\\/g, "");
      }
      var rawM3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
      return rawM3u8 ? rawM3u8[0] : embedUrl;
    } catch (e) {
      return embedUrl;
    }
  });
}
function resolveVidhide(embedUrl) {
  return __async(this, null, function* () {
    try {
      var body = yield (0, import_http.fetchHtml)(embedUrl, { headers: { Referer: embedUrl } });
      if (body.indexOf("Loading") !== -1 || body.length < 2e3) {
        var mirrorMatch = body.match(/["'](https?:\/\/[^"']+\/v\/[\w-]+)["']/i);
        if (mirrorMatch)
          body = yield (0, import_http.fetchHtml)(mirrorMatch[1], { headers: { Referer: mirrorMatch[1] } });
      }
      var packMatch = body.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
      if (packMatch) {
        var unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
        var m3u8 = unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (m3u8)
          return m3u8[0].replace(/\\/g, "");
      }
      var rawM3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
      return rawM3u8 ? rawM3u8[0] : embedUrl;
    } catch (e) {
      return embedUrl;
    }
  });
}
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      var url = "https://www.themoviedb.org/" + mediaType + "/" + tmdbId + "?language=es-MX";
      var html = yield (0, import_http.fetchHtml)(url);
      var $ = import_cheerio_without_node_native.default.load(html);
      var title = $(".title h2 a").text().trim();
      var originalTitle = $(".original_title").text().replace("T\xEDtulo original:", "").trim();
      return {
        title: title || "",
        originalTitle: originalTitle || title || ""
      };
    } catch (error) {
      console.warn("[PelisPlusHD] TMDB error: " + error.message);
      return null;
    }
  });
}
function decodeBase64(input) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var str = String(input).replace(/=+$/, "");
  var output = "";
  var bc = 0, bs, buffer, idx = 0;
  while (buffer = str.charAt(idx++)) {
    buffer = chars.indexOf(buffer);
    if (~buffer) {
      bs = bc % 4 ? bs * 64 + buffer : buffer;
      if (bc++ % 4)
        output += String.fromCharCode(255 & bs >> (-2 * bc & 6));
    }
  }
  return output;
}
function resolveVoesx(embedUrl) {
  return __async(this, null, function* () {
    try {
      var body = yield (0, import_http.fetchHtml)(embedUrl, { headers: { Referer: embedUrl } });
      if (body.indexOf("Redirecting") !== -1 || body.length < 1e3) {
        var redirectMatch = body.match(/window\.location\.href\s*=\s*['"](https?:\/\/[^'"]+)['"]/i);
        if (redirectMatch)
          body = yield (0, import_http.fetchHtml)(redirectMatch[1], { headers: { Referer: redirectMatch[1] } });
      }
      var jsonMatch = body.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
      if (jsonMatch) {
        try {
          var jsonData = JSON.parse(jsonMatch[1].trim());
          var encText = Array.isArray(jsonData) ? jsonData[0] : jsonData;
          var rot13 = encText.replace(/[a-zA-Z]/g, function(c) {
            var code = c.charCodeAt(0);
            var limit = c <= "Z" ? 90 : 122;
            var shifted = code + 13;
            return String.fromCharCode(limit >= shifted ? shifted : shifted - 26);
          });
          var noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
          for (var i = 0; i < noise.length; i++) {
            rot13 = rot13.split(noise[i]).join("");
          }
          var b64_1 = decodeBase64(rot13);
          var shiftedStr = "";
          for (var j = 0; j < b64_1.length; j++)
            shiftedStr += String.fromCharCode(b64_1.charCodeAt(j) - 3);
          var reversed = shiftedStr.split("").reverse().join("");
          var data = JSON.parse(decodeBase64(reversed));
          if (data && data.source)
            return data.source;
        } catch (ex) {
          console.log("[PelisPlusHD] Error decrypting VoeSX: " + ex.message);
        }
      }
      var m3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
      return m3u8 ? m3u8[0].replace(/\\/g, "") : embedUrl;
    } catch (e) {
      return embedUrl;
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
        var searchHtml = yield (0, import_http.fetchHtml)(searchUrl);
        var $search = import_cheerio_without_node_native.default.load(searchHtml);
        var searchResults = [];
        $search("a.Posters-link").each(function(idx, el) {
          var el$ = $search(el);
          var tText = el$.find("p").text().trim() || el$.attr("data-title") || "";
          var hText = el$.attr("href") || "";
          searchResults.push({ title: tText, href: hText });
        });
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
      var pageHtml = yield (0, import_http.fetchHtml)(movieUrl, { headers: { Referer: BASE_URL } });
      var $page = import_cheerio_without_node_native.default.load(pageHtml);
      var pageTitle = $page("title").text() || "";
      var qualityMatch = pageTitle.match(/Online\s+[^-\s]+\s+([^-\s]+)\s+-/i) || pageTitle.match(/\s+([A-Z0-9]+)\s+-/i);
      var movieQuality = qualityMatch ? qualityMatch[1].trim() : "HD";
      var rawResults = [];
      $page("li.playurl").each(function(idx, el) {
        var $el = $page(el);
        var serverUrl = $el.attr("data-url");
        var language = $el.attr("data-name") || "Latino";
        var serverNameRaw = $el.find("a").text().trim() || "Servidor";
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
      });
      var finalStreams = [];
      for (var m = 0; m < rawResults.length; m++) {
        var res = rawResults[m];
        var fUrl = res.serverUrl;
        var isStreamwish = /streamwish|strwish|wishembed|playnixes|niramirus|awish|dwish|fmoon|pstream/i.test(fUrl);
        var isVidhide = /vidhide|dintezuvio|callistanise|acek-cdn|vadisov/i.test(fUrl);
        var isVoesx = /voe\.sx|voe-sx|jefferycontrolmodel/i.test(fUrl);
        if (isStreamwish)
          fUrl = yield resolveStreamwish(fUrl);
        else if (isVidhide)
          fUrl = yield resolveVidhide(fUrl);
        else if (isVoesx)
          fUrl = yield resolveVoesx(fUrl);
        if (fUrl && fUrl.indexOf("http") === 0) {
          finalStreams.push({
            name: "PelisPlusHD",
            title: res.serverName + " (" + res.language + ") " + movieQuality,
            url: fUrl,
            quality: movieQuality,
            headers: {
              "Referer": res.serverUrl,
              "User-Agent": import_http.DEFAULT_UA
            }
          });
        }
      }
      return finalStreams;
    } catch (error) {
      console.error("[PelisPlusHD] Error: " + error.message);
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
