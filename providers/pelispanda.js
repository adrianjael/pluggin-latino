/**
 * pelispanda - Built from src/pelispanda/
 * Generated: 2026-04-08T23:22:08.430Z
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

// src/pelispanda/extractor.js
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));

// src/pelisplus/http.js
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
function fetchHtml(url, referer) {
  return __async(this, null, function* () {
    try {
      const headers = __spreadValues({}, COMMON_HEADERS);
      if (referer) {
        headers["Referer"] = referer;
        headers["Sec-Fetch-Site"] = "same-origin";
      }
      const response = yield fetch(url, {
        headers
      });
      if (!response.ok)
        throw new Error(`HTTP Error: ${response.status}`);
      return yield response.text();
    } catch (error) {
      console.error(`[PelisPlusHD] fetchHtml error: ${error.message}`);
      return "";
    }
  });
}

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

// src/resolvers/vimeos.js
var import_http = __toESM(require_http());
function resolve(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log("[Vimeos] Resolviendo Universal (v2.0): " + embedUrl);
      var html = yield (0, import_http.fetchHtml)(embedUrl, {
        headers: {
          "User-Agent": import_http.DEFAULT_UA,
          "Referer": "https://vimeos.net/",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      var vimeoIdMatch = html.match(/vimeo\.com\/video\/(\d+)/i);
      if (!vimeoIdMatch)
        vimeoIdMatch = embedUrl.match(/\/(\d{7,10})/);
      if (vimeoIdMatch) {
        var vimeoId = vimeoIdMatch[1];
        console.log("[Vimeos] ID Vimeo detectado: " + vimeoId + ". Consultado API Config...");
        try {
          var config = yield (0, import_http.fetchJson)("https://player.vimeo.com/video/" + vimeoId + "/config", {
            headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": embedUrl }
          });
          var hlsUrl = null;
          if (config && config.request && config.request.files && config.request.files.hls && config.request.files.hls.cdns && config.request.files.hls.cdns.default) {
            hlsUrl = config.request.files.hls.cdns.default.url;
          }
          if (hlsUrl) {
            console.log("[Vimeos] \u2713 HLS Directo encontrado.");
            return {
              url: hlsUrl,
              quality: "1080p",
              headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://player.vimeo.com/" }
            };
          }
          var progressive = config && config.request && config.request.files ? config.request.files.progressive : null;
          if (progressive && progressive.length > 0) {
            var best = progressive.sort(function(a, b) {
              return (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0);
            })[0];
            console.log("[Vimeos] \u2713 MP4 Directo encontrado (" + best.quality + ").");
            return {
              url: best.url,
              quality: best.quality ? best.quality + "p" : "1080p",
              headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://player.vimeo.com/" }
            };
          }
        } catch (apiErr) {
          console.log("[Vimeos] API Config Fall\xF3: " + apiErr.message);
        }
      }
      var packMatch = html.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/);
      if (packMatch) {
        console.log("[Vimeos] Usando Fallback Unpacker...");
        var payload = packMatch[1];
        var radix = parseInt(packMatch[2]);
        var symtab = packMatch[4].split("|");
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var unbase = function(str) {
          var result = 0;
          for (var i = 0; i < str.length; i++)
            result = result * radix + chars.indexOf(str[i]);
          return result;
        };
        var unpacked = payload.replace(/\b(\w+)\b/g, function(match) {
          var idx = unbase(match);
          return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
        });
        var m3u8Match = unpacked.match(/["']([^"']+\.m3u8[^"']*)['"]/i);
        if (m3u8Match) {
          var url = m3u8Match[1];
          return {
            url,
            quality: "1080p",
            headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://vimeos.net/" }
          };
        }
      }
      console.log("[Vimeos] No se encontr\xF3 video directo.");
      return null;
    } catch (err) {
      console.log("[Vimeos] Error cr\xEDtico: " + err.message);
      return null;
    }
  });
}

// src/pelispanda/extractor.js
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
function extractM3u8FromHtml(html) {
  let unpacked = "";
  const packMatch = html.match(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/);
  if (packMatch) {
    try {
      unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
    } catch (e) {
    }
  } else {
    unpacked = html;
  }
  unpacked = unpacked.replace(/k:\/\//g, "https://");
  const m = unpacked.match(/https?:\/\/[^"'\s\\]+?\.m3u8[^"'\s\\]*/i);
  return m ? m[0].replace(/\\/g, "") : null;
}
function resolveStreamwish(embedUrl) {
  return __async(this, null, function* () {
    try {
      let body = yield fetchHtml(embedUrl, embedUrl);
      if (body.includes("Page is loading") || body.length < 2e3) {
        const mirrorMatch = body.match(/main\s*:\s*\["([^"]+)"/i) || body.match(/["'](https?:\/\/[^"']+\/e\/[\w-]+)["']/i);
        if (mirrorMatch) {
          const mirrorUrl = mirrorMatch[1].startsWith("http") ? mirrorMatch[1] : `https://${mirrorMatch[1]}/e/${embedUrl.split("/").pop()}`;
          body = yield fetchHtml(mirrorUrl, mirrorUrl);
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
      let body = yield fetchHtml(embedUrl, embedUrl);
      if (body.includes("Loading") || body.length < 2e3) {
        const mirrorMatch = body.match(/["'](https?:\/\/[^"']+\/v\/[\w-]+)["']/i);
        if (mirrorMatch)
          body = yield fetchHtml(mirrorMatch[1], mirrorMatch[1]);
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
      let body = yield fetchHtml(embedUrl, embedUrl);
      if (body.includes("Redirecting") || body.length < 1e3) {
        const redirectMatch = body.match(/window\.location\.href\s*=\s*['"](https?:\/\/[^'"]+)['"]/i);
        if (redirectMatch)
          body = yield fetchHtml(redirectMatch[1], redirectMatch[1]);
      }
      const jsonMatch = body.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
      if (jsonMatch) {
        try {
          let encText = JSON.parse(jsonMatch[1].trim())[0];
          let rot13 = encText.replace(/[a-zA-Z]/g, function(c) {
            return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
          });
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
          console.log("[PelisPanda] Error rompiendo VoeSX:", ex.message);
        }
      }
      const m3u8 = body.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
      if (m3u8)
        return m3u8[0].replace(/\\/g, "");
      return embedUrl;
    } catch (e) {
      return embedUrl;
    }
  });
}
function resolveGoodstream(embedUrl) {
  return __async(this, null, function* () {
    try {
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": embedUrl,
        "Origin": new URL(embedUrl).origin,
        "Accept": "*/*",
        "Accept-Language": "es-ES,es;q=0.9"
      };
      const res = yield fetch(embedUrl, { headers });
      const html = yield res.text();
      return extractM3u8FromHtml(html);
    } catch (e) {
      return null;
    }
  });
}
function isGoodMatch(query, result, minScore = 0.4) {
  return calculateSimilarity(query, result) >= minScore;
}
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
      const html = yield fetchHtml(url, url);
      const $ = import_cheerio_without_node_native.default.load(html);
      const title = $(".title h2 a").text().trim();
      const originalTitle = $(".original_title").text().replace("T\xEDtulo original:", "").trim();
      const releaseYear = $(".release_date").text().match(/\d{4}/);
      return {
        title: title || "",
        originalTitle: originalTitle || title || "",
        year: releaseYear ? releaseYear[0] : null
      };
    } catch (error) {
      return null;
    }
  });
}
function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
  return __async(this, null, function* () {
    console.log(`[PelisPanda] Extracting streams for TMDB ID: ${tmdbId} (${mediaType})`);
    try {
      let searchTitle = providedTitle;
      let searchYear = null;
      if (!searchTitle) {
        const tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
        if (tmdbInfo) {
          searchTitle = tmdbInfo.title;
          searchYear = tmdbInfo.year;
        }
      }
      if (!searchTitle) {
        console.log("[PelisPanda] Search title not found (TMDB scrape failed and no title provided).");
        return [];
      }
      console.log(`[PelisPanda] Buscar en API por: ${searchTitle}`);
      const searchUrl = `https://pelispanda.org/wp-json/wpreact/v1/search?query=${encodeURIComponent(searchTitle)}`;
      const searchRes = yield fetch(searchUrl);
      const searchData = yield searchRes.json();
      const targetType = mediaType === "movie" ? "pelicula" : "serie";
      let movieMatch = searchData.results.find((r) => r.tmdb_id == tmdbId && r.type === targetType);
      if (!movieMatch) {
        movieMatch = searchData.results.find(
          (r) => isGoodMatch(searchTitle, r.title) && r.type === targetType
        );
      }
      if (!movieMatch) {
        movieMatch = searchData.results.find((r) => r.tmdb_id == tmdbId);
      }
      if (!movieMatch) {
        movieMatch = searchData.results[0];
      }
      console.log(`[PelisPanda] Selecci\xF3n final: ${movieMatch.title} (Slug: ${movieMatch.slug})`);
      const endpointType = mediaType === "movie" ? "movie" : "serie";
      const playersUrl = `https://pelispanda.org/wp-json/wpreact/v1/${endpointType}/${movieMatch.slug}/related`;
      const playersRes = yield fetch(playersUrl);
      const playersData = yield playersRes.json();
      let embeds = [];
      if (mediaType === "movie") {
        if (playersData && playersData.embeds) {
          embeds = playersData.embeds;
        }
      } else {
        if (playersData && playersData.embeds) {
          embeds = playersData.embeds.filter(
            (e) => e.season == season && e.episode == episode
          );
        }
      }
      if (embeds.length === 0) {
        console.log("[PelisPanda] No se encontraron reproductores embebidos.");
        return [];
      }
      const streamPromises = embeds.map((player) => __async(this, null, function* () {
        let serverName = "Desconocido";
        let rawUrl = player.url || "";
        let finalUrl = rawUrl.replace(/\\\//g, "/");
        if (finalUrl.includes("hlswish") || finalUrl.includes("streamwish"))
          serverName = "streamwish";
        else if (finalUrl.includes("vidhide") || finalUrl.includes("filemoon"))
          serverName = finalUrl.includes("vidhide") ? "vidhide" : "filemoon";
        else if (finalUrl.includes("voe"))
          serverName = "voe";
        else if (finalUrl.includes("vimeos"))
          serverName = "vimeos";
        else if (finalUrl.includes("netu") || finalUrl.includes("waaw"))
          serverName = "netu";
        if (finalUrl.includes("goodstream"))
          return null;
        if (serverName === "streamwish")
          finalUrl = yield resolveStreamwish(finalUrl);
        else if (serverName === "vidhide")
          finalUrl = yield resolveVidhide(finalUrl);
        else if (serverName === "voe")
          finalUrl = yield resolveVoesx(finalUrl);
        else if (serverName === "vimeos") {
          const r = yield resolve(finalUrl);
          if (r) {
            finalUrl = r.url;
            direct = true;
            vimeosHeaders = r.headers;
            vimeosQuality = r.quality;
          }
        } else if (serverName === "goodstream")
          finalUrl = yield resolveGoodstream(finalUrl);
        if (!finalUrl || !finalUrl.startsWith("http")) {
          return null;
        }
        const isVimeos = serverName.includes("vimeos");
        const mobileUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
        return {
          langLabel: player.lang || "Latino",
          serverLabel: serverName,
          url: finalUrl,
          quality: vimeosQuality || player.quality || "HD",
          headers: vimeosHeaders || {
            "User-Agent": mobileUA,
            "Referer": rawUrl
          }
        };
      }));
      const playerResults = yield Promise.all(streamPromises);
      return playerResults.filter((s) => s !== null);
    } catch (error) {
      console.error(`[PelisPanda] Error cr\xEDtico: ${error.message}`);
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

// src/pelispanda/index.js
function getStreams(tmdbId, mediaType, season, episode, title, year) {
  return __async(this, null, function* () {
    const streams = yield extractStreams(tmdbId, mediaType, season, episode, title, year);
    return yield finalizeStreams(streams, "PelisPanda");
  });
}
module.exports = { getStreams };
