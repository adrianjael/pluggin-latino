/**
 * pelispanda - Built from src/pelispanda/
 * Generated: 2026-04-06T17:39:28.607Z
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

// src/pelispanda/extractor.js
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));

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
function fetchHtml(url, referer) {
  return __async(this, null, function* () {
    return fetchText(url, referer);
  });
}

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
  if (norm1.length > 5 && norm2.length > 5 && (norm2.includes(norm1) || norm1.includes(norm2)))
    return 0.9;
  const words1 = new Set(norm1.split(/\s+/).filter((w) => w.length > 2));
  const words2 = new Set(norm2.split(/\s+/).filter((w) => w.length > 2));
  if (words1.size === 0 || words2.size === 0) {
    return norm1 === norm2 ? 1 : norm1.includes(norm2) || norm2.includes(norm1) ? 0.5 : 0;
  }
  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = /* @__PURE__ */ new Set([...words1, ...words2]);
  return intersection.size / union.size;
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
function resolveVimeos(embedUrl) {
  return __async(this, null, function* () {
    try {
      const body = yield fetchHtml(embedUrl, "https://pelispanda.org/");
      return extractM3u8FromHtml(body);
    } catch (e) {
      return null;
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
        else if (serverName === "vimeos")
          finalUrl = yield resolveVimeos(finalUrl);
        else if (serverName === "goodstream")
          finalUrl = yield resolveGoodstream(finalUrl);
        if (!finalUrl || !finalUrl.startsWith("http")) {
          return null;
        }
        const isVimeos = serverName.includes("vimeos");
        const mobileUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
        return {
          name: "PelisPanda",
          server: serverName,
          title: `${serverName} (${player.lang || "Latino"}) ${player.quality || "HD"}`,
          url: finalUrl,
          quality: player.quality || "HD",
          headers: {
            "User-Agent": mobileUA,
            "Referer": isVimeos ? "https://vimeos.net/" : rawUrl,
            "Origin": isVimeos ? "https://vimeos.net" : void 0
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

// src/pelispanda/index.js
function getStreams(tmdbId, mediaType, season, episode, title, year) {
  return __async(this, null, function* () {
    return extractStreams(tmdbId, mediaType, season, episode, title, year);
  });
}
module.exports = { getStreams };
