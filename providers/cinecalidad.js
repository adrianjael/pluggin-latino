/**
 * cinecalidad - Built from src/cinecalidad/
 * Generated: 2026-04-06T17:24:21.139Z
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve6, reject) => {
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
    var step = (x) => x.done ? resolve6(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/cinecalidad/index.js
var cinecalidad_exports = {};
__export(cinecalidad_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(cinecalidad_exports);
var import_axios5 = __toESM(require("axios"));

// src/resolvers/goodstream.js
var import_axios2 = __toESM(require("axios"));

// src/resolvers/quality.js
var import_axios = __toESM(require("axios"));
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function detectQuality(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    try {
      if (!url || !url.includes(".m3u8"))
        return "1080p";
      const { data } = yield import_axios.default.get(url, {
        timeout: 5e3,
        headers: __spreadValues({ "User-Agent": UA }, headers),
        responseType: "text"
      });
      if (!data.includes("#EXT-X-STREAM-INF")) {
        const match = url.match(/[_-](\d{3,4})p/i);
        return match ? `${match[1]}p` : "1080p";
      }
      let maxRes = 0;
      const lines = data.split("\n");
      for (const line of lines) {
        const match = line.match(/RESOLUTION=\d+x(\d+)/i);
        if (match) {
          const res = parseInt(match[1]);
          if (res > maxRes)
            maxRes = res;
        }
      }
      if (maxRes > 0) {
        if (maxRes >= 2160)
          return "4K";
        if (maxRes >= 1080)
          return "1080p";
        if (maxRes >= 720)
          return "720p";
        if (maxRes >= 480)
          return "480p";
        return `${maxRes}p`;
      }
      return "1080p";
    } catch (e) {
      return "1080p";
    }
  });
}

// src/resolvers/goodstream.js
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function resolve(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[GoodStream] Resolviendo: ${embedUrl}`);
      const response = yield import_axios2.default.get(embedUrl, {
        headers: {
          "User-Agent": UA2,
          "Referer": "https://goodstream.one",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        timeout: 15e3,
        maxRedirects: 5
      });
      const match = response.data.match(/file:\s*"([^"]+)"/);
      if (!match) {
        console.log('[GoodStream] No se encontr\xF3 patr\xF3n file:"..."');
        return null;
      }
      const videoUrl = match[1];
      const refererHeaders = { "Referer": embedUrl, "Origin": "https://goodstream.one", "User-Agent": UA2 };
      const quality = yield detectQuality(videoUrl, refererHeaders);
      console.log(`[GoodStream] URL encontrada (${quality}): ${videoUrl.substring(0, 80)}...`);
      return { url: videoUrl, quality, headers: refererHeaders };
    } catch (err) {
      console.log(`[GoodStream] Error: ${err.message}`);
      return null;
    }
  });
}

// src/resolvers/voe.js
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
      const res = yield fetch(url, { headers: { "User-Agent": UA3 } });
      let html = yield res.text();
      if (html.includes("Redirecting") || html.length < 1500) {
        const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm) {
          const res2 = yield fetch(rm[1], { headers: { "User-Agent": UA3 } });
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
              headers: { "User-Agent": UA3, "Referer": url }
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
          headers: { "User-Agent": UA3, "Referer": url }
        };
      }
      return null;
    } catch (e) {
      console.error(`[VOE] Error resolviedo: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/filemoon.js
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function base64UrlDecode(input) {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4)
    s += "=";
  return typeof Buffer !== "undefined" ? Buffer.from(s, "base64") : new Uint8Array(atob(s).split("").map((c) => c.charCodeAt(0)));
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
      const keyParts = playback.key_parts;
      const keyBytes = [];
      for (const part of keyParts) {
        const decoded = base64UrlDecode(part);
        decoded.forEach((b) => keyBytes.push(b));
      }
      const key = new Uint8Array(keyBytes);
      const iv = base64UrlDecode(playback.iv);
      const fullPayload = base64UrlDecode(playback.payload);
      const ciphertext = fullPayload.slice(0, -16);
      const tag = fullPayload.slice(-16);
      if (typeof crypto !== "undefined" && crypto.subtle) {
        const cryptoKey = yield crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]);
        const decrypted = yield crypto.subtle.decrypt(
          { name: "AES-GCM", iv, tagLength: 128 },
          cryptoKey,
          fullPayload
          // SubtleCrypto espera [ciphertext + tag]
        );
        return JSON.parse(new TextDecoder().decode(decrypted));
      }
      return null;
    } catch (e) {
      console.error(`[Byse Decrypt] Error: ${e.message}`);
      return null;
    }
  });
}
function resolve3(url) {
  return __async(this, null, function* () {
    try {
      const idMatch = url.match(/\/e\/([a-zA-Z0-9]+)/);
      if (!idMatch)
        return null;
      const id = idMatch[1];
      console.log(`[Filemoon] Resolviendo Maestro (v3.0.1): ${id}`);
      try {
        const hostname = new URL(url).hostname;
        const apiUrl = `https://${hostname}/api/videos/${id}`;
        const apiRes = yield fetch(apiUrl, {
          headers: { "User-Agent": UA4, "Referer": url }
        });
        const data = yield apiRes.json();
        if (data.playback) {
          const decrypted = yield decryptByse(data.playback);
          if (decrypted && decrypted.sources) {
            const best = decrypted.sources[0];
            console.log(`[Filemoon] -> m3u8 via API: ${best.url.substring(0, 50)}...`);
            return {
              url: best.url,
              quality: best.height ? `${best.height}p` : "1080p",
              isM3U8: true,
              headers: { "User-Agent": UA4, "Referer": url }
            };
          }
        }
      } catch (apiErr) {
        console.log(`[Filemoon] API Strategy failed: ${apiErr.message}`);
      }
      console.log("[Filemoon] Fallback a motor Unpacker...");
      const res = yield fetch(url, {
        headers: { "User-Agent": UA4, "Referer": url }
      });
      const html = yield res.text();
      const evalMatches = html.matchAll(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/g);
      for (const match of evalMatches) {
        const unpacked = unpack(match[1], parseInt(match[2]), parseInt(match[3]), match[4].split("|"), 0, {});
        const fileMatch = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
        if (fileMatch) {
          return {
            url: fileMatch[1],
            quality: "1080p",
            isM3U8: true,
            headers: { "User-Agent": UA4, "Referer": url }
          };
        }
      }
      return null;
    } catch (e) {
      console.error(`[Filemoon] Error Global: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/hlswish.js
var import_axios3 = __toESM(require("axios"));
var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function unpack2(p, a, c, k, e, d) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const decode = (r) => {
    let res = 0;
    for (let l = 0; l < r.length; l++) {
      let s = chars.indexOf(r[l]);
      if (s === -1)
        return NaN;
      res = res * a + s;
    }
    return res;
  };
  return p.replace(/\b([0-9a-zA-Z]+)\b/g, (match) => {
    let val = decode(match);
    return isNaN(val) || val >= k.length ? match : k[val] || match;
  });
}
var DOMAIN_MAP = { "hglink.to": "vibuxer.com" };
function resolve4(url) {
  return __async(this, null, function* () {
    try {
      let targetUrl = url;
      for (const [old, replacement] of Object.entries(DOMAIN_MAP)) {
        if (targetUrl.includes(old)) {
          targetUrl = targetUrl.replace(old, replacement);
          break;
        }
      }
      console.log(`[HLSWish] Resolviendo: ${url}`);
      const baseOrigin = (targetUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
      const { data: html } = yield import_axios3.default.get(targetUrl, {
        headers: { "User-Agent": UA5, Referer: "https://embed69.org/", Origin: "https://embed69.org" },
        timeout: 15e3,
        maxRedirects: 5
      });
      let finalUrl = null;
      const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
      if (fileMatch) {
        finalUrl = fileMatch[1];
        if (finalUrl.startsWith("/"))
          finalUrl = baseOrigin + finalUrl;
      }
      if (!finalUrl) {
        const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packedMatch) {
          const unpacked = unpack2(packedMatch[1], parseInt(packedMatch[2]), parseInt(packedMatch[3]), packedMatch[4].split("|"));
          const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
          if (m3u8Match) {
            finalUrl = m3u8Match[1];
            if (finalUrl.startsWith("/"))
              finalUrl = baseOrigin + finalUrl;
          }
        }
      }
      if (finalUrl) {
        console.log(`[HLSWish] URL encontrada: ${finalUrl.substring(0, 80)}...`);
        return { url: finalUrl, quality: "1080p", headers: { "User-Agent": UA5, Referer: baseOrigin + "/" } };
      }
      return null;
    } catch (e) {
      console.log(`[HLSWish] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/vimeos.js
var import_axios4 = __toESM(require("axios"));
var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function resolve5(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[Vimeos] Resolviendo: ${embedUrl}`);
      const resp = yield import_axios4.default.get(embedUrl, {
        headers: {
          "User-Agent": UA6,
          "Referer": "https://vimeos.net/",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        timeout: 15e3,
        maxRedirects: 5
      });
      const data = resp.data;
      const packMatch = data.match(
        /eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/
      );
      if (packMatch) {
        const payload = packMatch[1];
        const radix = parseInt(packMatch[2]);
        const symtab = packMatch[4].split("|");
        const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const unbase = (str) => {
          let result = 0;
          for (let i = 0; i < str.length; i++)
            result = result * radix + chars.indexOf(str[i]);
          return result;
        };
        const unpacked = payload.replace(/\b(\w+)\b/g, (match) => {
          const idx = unbase(match);
          return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
        });
        const m3u8Match = unpacked.match(/["']([^"']+\.m3u8[^"']*)['"]/i);
        if (m3u8Match) {
          const url = m3u8Match[1];
          const refererHeaders = { "User-Agent": UA6, "Referer": "https://vimeos.net/" };
          const quality = yield detectQuality(url, refererHeaders);
          console.log(`[Vimeos] URL encontrada: ${url.substring(0, 80)}...`);
          return { url, quality, headers: refererHeaders };
        }
      }
      console.log("[Vimeos] No se encontr\xF3 URL");
      return null;
    } catch (err) {
      console.log(`[Vimeos] Error: ${err.message}`);
      return null;
    }
  });
}

// src/cinecalidad/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var HOST = "https://www.cinecalidad.vg";
var UA7 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var HEADERS = {
  "User-Agent": UA7,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Referer": "https://www.cinecalidad.vg/"
};
var RESOLVERS = {
  "goodstream.one": resolve,
  "hlswish.com": resolve4,
  "streamwish.com": resolve4,
  "streamwish.to": resolve4,
  "strwish.com": resolve4,
  "voe.sx": resolve2,
  "filemoon.sx": resolve3,
  "filemoon.to": resolve3,
  "vimeos.net": resolve5
};
var getServerName = (url) => {
  if (url.includes("goodstream"))
    return "GoodStream";
  if (url.includes("hlswish") || url.includes("streamwish") || url.includes("strwish"))
    return "StreamWish";
  if (url.includes("voe.sx"))
    return "VOE";
  if (url.includes("filemoon"))
    return "Filemoon";
  if (url.includes("vimeos"))
    return "Vimeos";
  return "Online";
};
var getResolver = (url) => {
  if (!url || !url.startsWith("http"))
    return null;
  for (const pattern in RESOLVERS) {
    if (url.includes(pattern))
      return RESOLVERS[pattern];
  }
  return null;
};
function b64decode(str) {
  try {
    if (typeof atob !== "undefined")
      return atob(str);
    return Buffer.from(str, "base64").toString("utf8");
  } catch (e) {
    return null;
  }
}
function getTmdbData(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const attempts = [
      { lang: "es-MX", name: "Latino" },
      { lang: "es-ES", name: "Espa\xF1a" },
      { lang: "en-US", name: "Ingl\xE9s" }
    ];
    for (const { lang, name } of attempts) {
      try {
        const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=${lang}`;
        const { data } = yield import_axios5.default.get(url, { timeout: 5e3 });
        const title = mediaType === "movie" ? data.title : data.name;
        const originalTitle = mediaType === "movie" ? data.original_title : data.original_name;
        if (!title)
          continue;
        console.log(`[CineCalidad] TMDB (${name}): "${title}"`);
        return {
          title,
          originalTitle,
          year: (data.release_date || data.first_air_date || "").substring(0, 4)
        };
      } catch (e) {
        console.log(`[CineCalidad] Error TMDB ${name}: ${e.message}`);
      }
    }
    return null;
  });
}
function buildSlug(title) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function getMovieUrl(slug, expectedYear) {
  return __async(this, null, function* () {
    const slugsToTry = [slug, `${slug}-2`, `${slug}-3`];
    for (const s of slugsToTry) {
      const url = `${HOST}/pelicula/${s}/`;
      try {
        const { data: html } = yield import_axios5.default.get(url, {
          timeout: 8e3,
          headers: HEADERS,
          validateStatus: (status) => status === 200
        });
        const yearMatch = html.match(/<h1[^>]*>[^<]*\((\d{4})\)[^<]*<\/h1>/);
        const year = yearMatch ? yearMatch[1] : null;
        if (!year || !expectedYear || year === expectedYear) {
          console.log(`[CineCalidad] \u2713 Slug directo: /pelicula/${s}/ (${year || "?"})`);
          return url;
        }
      } catch (e) {
      }
    }
    return null;
  });
}
var KNOWN_EMBED_DOMAINS = [
  "goodstream.one",
  "voe.sx",
  "filemoon.sx",
  "filemoon.to",
  "hlswish.com",
  "streamwish.com",
  "streamwish.to",
  "strwish.com",
  "vimeos.net"
];
function isKnownEmbed(url) {
  return KNOWN_EMBED_DOMAINS.some((d) => url.includes(d));
}
function getEmbedUrls(movieUrl) {
  return __async(this, null, function* () {
    try {
      const { data } = yield import_axios5.default.get(movieUrl, { timeout: 8e3, headers: HEADERS });
      const embedLinks = [];
      const regex = /data-src="([A-Za-z0-9+/=]{20,})"/g;
      let match;
      while ((match = regex.exec(data)) !== null)
        embedLinks.push(match[1]);
      const decodedUrls = [...new Set(
        embedLinks.map((b64) => b64decode(b64)).filter((url) => url && url.startsWith("http"))
      )];
      const directEmbeds = decodedUrls.filter(isKnownEmbed);
      const intermediateUrls = decodedUrls.filter((u) => !isKnownEmbed(u));
      const embedUrls = new Set(directEmbeds);
      if (intermediateUrls.length > 0) {
        yield Promise.allSettled(intermediateUrls.map((decoded) => __async(this, null, function* () {
          try {
            const { data: midData } = yield import_axios5.default.get(decoded, {
              timeout: 6e3,
              headers: HEADERS,
              maxRedirects: 5
            });
            let finalUrl = "";
            const btnMatch = midData.match(/id="btn_enlace"[^>]*>[\s\S]*?href="([^"]+)"/);
            if (btnMatch)
              finalUrl = btnMatch[1];
            if (!finalUrl) {
              const iframeMatch = midData.match(/<iframe[^>]+src="([^"]+)"/);
              if (iframeMatch)
                finalUrl = iframeMatch[1];
            }
            if (!finalUrl && decoded.includes("/e/"))
              finalUrl = decoded;
            if (finalUrl && finalUrl.startsWith("http"))
              embedUrls.add(finalUrl);
          } catch (e) {
          }
        })));
      }
      return [...embedUrls];
    } catch (e) {
      console.log(`[CineCalidad] Error obteniendo embeds: ${e.message}`);
      return [];
    }
  });
}
function processEmbed(embedUrl) {
  return __async(this, null, function* () {
    try {
      const resolver = getResolver(embedUrl);
      if (!resolver)
        return null;
      const result = yield resolver(embedUrl);
      if (!result || !result.url)
        return null;
      return {
        name: "CineCalidad",
        title: `${result.quality || "1080p"} \xB7 ${getServerName(embedUrl)}`,
        url: result.url,
        quality: result.quality || "1080p",
        headers: result.headers || {}
      };
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    if (!tmdbId || !mediaType || mediaType === "tv")
      return [];
    const startTime = Date.now();
    console.log(`[CineCalidad] Buscando: TMDB ${tmdbId} (${mediaType})`);
    try {
      const tmdbInfo = yield getTmdbData(tmdbId, mediaType);
      if (!tmdbInfo)
        return [];
      const slug = buildSlug(tmdbInfo.title);
      let selectedUrl = yield getMovieUrl(slug, tmdbInfo.year);
      if (!selectedUrl && tmdbInfo.originalTitle && tmdbInfo.originalTitle !== tmdbInfo.title) {
        selectedUrl = yield getMovieUrl(buildSlug(tmdbInfo.originalTitle), tmdbInfo.year);
      }
      if (!selectedUrl)
        return [];
      const embedUrls = yield getEmbedUrls(selectedUrl);
      if (embedUrls.length === 0)
        return [];
      const uniqueEmbeds = [...new Set(embedUrls)];
      const streams = (yield Promise.allSettled(uniqueEmbeds.map(processEmbed))).filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
      const elapsed = ((Date.now() - startTime) / 1e3).toFixed(2);
      console.log(`[CineCalidad] \u2713 ${streams.length} streams en ${elapsed}s`);
      return streams;
    } catch (e) {
      console.log(`[CineCalidad] Error: ${e.message}`);
      return [];
    }
  });
}
