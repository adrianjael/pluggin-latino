/**
 * pelisplus - Built from src/pelisplus/
 * Generated: 2026-04-03T19:05:53.690Z
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

// src/pelisplus/extractor.js
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));
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
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
      const html = yield fetchText(url);
      const $ = import_cheerio_without_node_native.default.load(html);
      const title = $(".title h2 a").text().trim();
      const originalTitle = $(".original_title").text().replace("T\xEDtulo original:", "").trim();
      return {
        title: title || "",
        originalTitle: originalTitle || title || ""
      };
    } catch (error) {
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
          console.log("[PelisPlusHD] Error rompiendo VoeSX:", ex.message);
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
function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
  return __async(this, null, function* () {
    try {
      let searchTitle = providedTitle;
      if (!searchTitle) {
        const tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
        if (tmdbInfo && tmdbInfo.title)
          searchTitle = tmdbInfo.title;
      }
      if (!searchTitle)
        return [];
      const titlesToTry = [searchTitle];
      let movieUrl = null;
      for (const query of titlesToTry) {
        const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(query)}`;
        const searchHtml = yield fetchText(searchUrl);
        const $search = import_cheerio_without_node_native.default.load(searchHtml);
        $search("a.Posters-link").each((i, el) => {
          const resultTitle = $search(el).find("p").text().trim() || $search(el).attr("data-title") || "";
          if (titleMatch(query, resultTitle) || providedTitle && titleMatch(providedTitle, resultTitle)) {
            movieUrl = BASE_URL + $search(el).attr("href");
            return false;
          }
        });
        if (movieUrl)
          break;
      }
      if (!movieUrl)
        return [];
      if (mediaType === "tv") {
        movieUrl = movieUrl.replace(/\/$/, "") + `/temporada/${season}/capitulo/${episode}`;
      }
      const pageHtml = yield fetchText(movieUrl);
      const $page = import_cheerio_without_node_native.default.load(pageHtml);
      const pageTitle = $page("title").text() || "";
      const qualityMatch = pageTitle.match(/Online\s+[^-\s]+\s+([^-\s]+)\s+-/i) || pageTitle.match(/\s+([A-Z0-9]+)\s+-/i);
      let movieQuality = qualityMatch ? qualityMatch[1].trim() : "HD";
      if (movieQuality === "HD" && pageTitle.toLowerCase().includes("online")) {
      }
      const rawResults = [];
      $page("li.playurl").each((i, el) => {
        const serverUrl = $page(el).attr("data-url");
        const serverName = $page(el).find("a").text().trim();
        const language = $page(el).attr("data-name") || "Espa\xF1ol Latino";
        if (serverUrl && (language.includes("Latino") || language.includes("Espa\xF1ol"))) {
          rawResults.push({ serverUrl, serverName, language });
        }
      });
      const scripts = $page("script").map((i, el) => $page(el).html()).get();
      for (const scriptContent of scripts) {
        if (scriptContent && scriptContent.includes("var options")) {
          const optionsMatch = scriptContent.match(/var options = {([\s\S]+?)};/);
          if (optionsMatch) {
            const optionsRaw = optionsMatch[1];
            const urlRegex = /"(option\d+)":\s*"([^"]+)"/g;
            let match;
            while ((match = urlRegex.exec(optionsRaw)) !== null) {
              const optId = match[1];
              const serverUrl = match[2];
              const serverName = $page(`a[href="#${optId}"]`).text().trim() || "Servidor";
              if (serverUrl && serverUrl.startsWith("http")) {
                rawResults.push({ serverUrl, serverName, language: "Espa\xF1ol Latino" });
              }
            }
          }
        }
      }
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
        if (!finalUrl.includes(".m3u8") && !finalUrl.includes(".mp4")) {
          return null;
        }
        const cleanServerName = res.serverName.replace(/\s*\(.*?\)\s*/g, "").trim();
        return {
          name: "PelisPlusHD",
          title: `${cleanServerName} (${res.language.includes("Latino") ? "Latino" : "Espa\xF1ol"}) ${movieQuality}`,
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
