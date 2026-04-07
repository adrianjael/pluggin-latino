/**
 * lamovie - Built from src/lamovie/
 * Generated: 2026-04-07T21:54:48.891Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
  return new Promise((resolve7, reject) => {
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
    var step = (x) => x.done ? resolve7(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/lamovie/index.js
var lamovie_exports = {};
__export(lamovie_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(lamovie_exports);

// src/resolvers/goodstream.js
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function resolve(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[GoodStream] Resolviendo v\xEDa fetch: ${embedUrl}`);
      const res = yield fetch(embedUrl, {
        headers: { "User-Agent": UA, "Referer": "https://embed69.org/" }
      });
      const html = yield res.text();
      const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
      if (fileMatch) {
        return {
          url: fileMatch[1],
          quality: "1080p",
          headers: { "User-Agent": UA, "Referer": embedUrl }
        };
      }
      return null;
    } catch (e) {
      console.log(`[GoodStream] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/voe.js
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
      const res = yield fetch(url, { headers: { "User-Agent": UA2 } });
      let html = yield res.text();
      if (html.includes("Redirecting") || html.length < 1500) {
        const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm) {
          const res2 = yield fetch(rm[1], { headers: { "User-Agent": UA2 } });
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
              headers: { "User-Agent": UA2, "Referer": url }
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
          headers: { "User-Agent": UA2, "Referer": url }
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
var import_crypto_js = __toESM(require("crypto-js"));
function decryptGCM(key, iv, ciphertextWithTag) {
  try {
    const tagSize = 16;
    const ciphertext = ciphertextWithTag.slice(0, -tagSize);
    const keyWA = import_crypto_js.default.lib.WordArray.create(key);
    const ivCounter = new Uint8Array(16);
    ivCounter.set(iv, 0);
    ivCounter[15] = 2;
    const ivWA = import_crypto_js.default.lib.WordArray.create(ivCounter);
    const decrypted = import_crypto_js.default.AES.decrypt(
      { ciphertext: import_crypto_js.default.lib.WordArray.create(ciphertext) },
      keyWA,
      {
        iv: ivWA,
        mode: import_crypto_js.default.mode.CTR,
        padding: import_crypto_js.default.pad.NoPadding
      }
    );
    return decrypted.toString(import_crypto_js.default.enc.Utf8);
  } catch (e) {
    console.error("[PureJS-GCM] Error Decrypting:", e.message);
    return null;
  }
}

// src/resolvers/filemoon.js
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
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
function resolve3(url) {
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
          headers: { "User-Agent": UA3, "Referer": url }
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
                "User-Agent": UA3,
                "Referer": "https://arbitrarydecisions.com/",
                "Origin": "https://arbitrarydecisions.com"
              }
            };
          }
        }
      } catch (apiErr) {
        console.log(`[Filemoon] API Byse Failed: ${apiErr.message}`);
      }
      const res = yield fetch(url, { headers: { "User-Agent": UA3, "Referer": url } });
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
              "User-Agent": UA3,
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

// src/resolvers/hlswish.js
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
      console.log(`[HLSWish] Resolviendo v\xEDa fetch: ${url}`);
      const baseOrigin = (targetUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
      const res = yield fetch(targetUrl, {
        headers: { "User-Agent": UA4, Referer: "https://embed69.org/", Origin: "https://embed69.org" }
      });
      const html = yield res.text();
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
        return {
          url: finalUrl,
          quality: "1080p",
          headers: { "User-Agent": UA4, Referer: baseOrigin + "/" }
        };
      }
      return null;
    } catch (e) {
      console.log(`[HLSWish] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/vidhide.js
var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
      for (; l > 0; ) {
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
function resolve5(url) {
  return __async(this, null, function* () {
    try {
      console.log(`[VidHide] Resolviendo v\xEDa fetch: ${url}`);
      const res = yield fetch(url, {
        headers: { "User-Agent": UA5, "Referer": "https://embed69.org/" }
      });
      const html = yield res.text();
      const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
      if (!packedMatch)
        return null;
      const unpacked = unpackVidHide(packedMatch[0]);
      if (!unpacked)
        return null;
      const hlsMatch = unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/);
      if (!hlsMatch)
        return null;
      let finalUrl = hlsMatch[1];
      const origin = new URL(url).origin;
      if (!finalUrl.startsWith("http"))
        finalUrl = origin + finalUrl;
      return {
        url: finalUrl,
        quality: "1080p",
        headers: { "User-Agent": UA5, "Referer": origin + "/", "Origin": origin }
      };
    } catch (e) {
      console.log(`[VidHide] Error: ${e.message}`);
      return null;
    }
  });
}

// src/resolvers/vimeos.js
var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function resolve6(embedUrl) {
  return __async(this, null, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
      console.log(`[Vimeos] Resolviendo v\xEDa fetch: ${embedUrl}`);
      const res = yield fetch(embedUrl, {
        headers: {
          "User-Agent": UA6,
          "Referer": "https://vimeos.net/",
          "Accept": "text/html"
        }
      });
      const html = yield res.text();
      const vimeoIdMatch = html.match(/vimeo\.com\/video\/(\d+)/i) || embedUrl.match(/\/(\d{7,10})/);
      if (vimeoIdMatch) {
        const vimeoId = vimeoIdMatch[1];
        try {
          const configRes = yield fetch(`https://player.vimeo.com/video/${vimeoId}/config`, {
            headers: { "User-Agent": UA6, "Referer": embedUrl }
          });
          const config = yield configRes.json();
          const hlsUrl = (_e = (_d = (_c = (_b = (_a = config.request) == null ? void 0 : _a.files) == null ? void 0 : _b.hls) == null ? void 0 : _c.cdns) == null ? void 0 : _d.default) == null ? void 0 : _e.url;
          if (hlsUrl) {
            return {
              url: hlsUrl,
              quality: "1080p",
              isM3U8: true,
              headers: { "User-Agent": UA6, "Referer": "https://player.vimeo.com/" }
            };
          }
          const progressive = (_g = (_f = config.request) == null ? void 0 : _f.files) == null ? void 0 : _g.progressive;
          if (progressive && progressive.length > 0) {
            const best = progressive.sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0))[0];
            return {
              url: best.url,
              quality: best.quality ? `${best.quality}p` : "1080p",
              headers: { "User-Agent": UA6, "Referer": "https://player.vimeo.com/" }
            };
          }
        } catch (apiErr) {
          console.log(`[Vimeos] API Config Fall\xF3: ${apiErr.message}`);
        }
      }
      const packMatch = html.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/);
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
          return {
            url: m3u8Match[1],
            quality: "1080p",
            isM3U8: true,
            headers: { "User-Agent": UA6, "Referer": "https://vimeos.net/" }
          };
        }
      }
      return null;
    } catch (err) {
      console.log(`[Vimeos] Error cr\xEDtico: ${err.message}`);
      return null;
    }
  });
}

// src/lamovie/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var UA7 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var BASE_URL = "https://la.movie";
var SERVER_LABELS = {
  "goodstream": "GoodStream",
  "voe": "VOE",
  "filemoon": "Filemoon",
  "f75s": "Filemoon",
  "streamwish": "StreamWish",
  "hglink": "StreamWish",
  "sw": "StreamWish",
  "wishembed": "StreamWish",
  "vidhide": "VidHide",
  "minochinos": "VidHide",
  "dintezuvio": "VidHide",
  "vimeos": "Vimeos"
};
function getTmdbData(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`;
      const res = yield fetch(url);
      const data = yield res.json();
      return {
        title: data.title || data.name,
        originalTitle: data.original_title || data.original_name,
        year: (data.release_date || data.first_air_date || "").substring(0, 4),
        genres: (data.genres || []).map((g) => g.id),
        originCountries: data.origin_country || []
      };
    } catch (e) {
      return null;
    }
  });
}
function getIdBySlug(category, slug) {
  return __async(this, null, function* () {
    const url = `${BASE_URL}/${category}/${slug}/`;
    try {
      const res = yield fetch(url, { headers: { "User-Agent": UA7 } });
      const html = yield res.text();
      const match = html.match(/rel=['"]shortlink['"]\s+href=['"][^'"]*\?p=(\d+)['"]/);
      return match ? match[1] : null;
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    var _a, _b, _c;
    try {
      const tmdbInfo = yield getTmdbData(tmdbId, mediaType);
      if (!tmdbInfo)
        return [];
      const buildSlug = (t, y) => {
        const s = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        return y ? `${s}-${y}` : s;
      };
      const categories = mediaType === "movie" ? ["peliculas"] : tmdbInfo.genres.includes(16) ? ["animes", "series"] : ["series"];
      const slugs = [buildSlug(tmdbInfo.title, tmdbInfo.year)];
      if (tmdbInfo.originalTitle)
        slugs.push(buildSlug(tmdbInfo.originalTitle, tmdbInfo.year));
      let postId = null;
      for (const slug of slugs) {
        for (const cat of categories) {
          postId = yield getIdBySlug(cat, slug);
          if (postId)
            break;
        }
        if (postId)
          break;
      }
      if (!postId)
        return [];
      let targetId = postId;
      if (mediaType === "tv") {
        const epUrl = `${BASE_URL}/wp-api/v1/single/episodes/list?_id=${postId}&season=${season}&page=1&postsPerPage=50`;
        const epRes = yield fetch(epUrl);
        const epData = yield epRes.json();
        const ep = (_b = (_a = epData.data) == null ? void 0 : _a.posts) == null ? void 0 : _b.find((e) => e.season_number == season && e.episode_number == episode);
        if (!ep)
          return [];
        targetId = ep._id;
      }
      const playerRes = yield fetch(`${BASE_URL}/wp-api/v1/player?postId=${targetId}&demo=0`);
      const playerData = yield playerRes.json();
      if (!((_c = playerData.data) == null ? void 0 : _c.embeds))
        return [];
      const results = yield Promise.allSettled(playerData.data.embeds.map((embed) => __async(this, null, function* () {
        const url = embed.url;
        const s = url.toLowerCase();
        let resolved = null;
        let key = "unknown";
        if (s.includes("voe")) {
          key = "voe";
          resolved = yield resolve2(url);
        } else if (s.includes("filemoon")) {
          key = "filemoon";
          resolved = yield resolve3(url);
        } else if (s.includes("streamwish") || s.includes("hglink")) {
          key = "streamwish";
          resolved = yield resolve4(url);
        } else if (s.includes("vidhide") || s.includes("minochinos") || s.includes("dintezuvio")) {
          key = "vidhide";
          resolved = yield resolve5(url);
        } else if (s.includes("vimeos")) {
          key = "vimeos";
          resolved = yield resolve6(url);
        } else if (s.includes("goodstream")) {
          key = "goodstream";
          resolved = yield resolve(url);
        }
        if (resolved && resolved.url) {
          return {
            name: "LaMovie",
            title: `${resolved.quality || "1080p"} \xB7 Latino \xB7 ${SERVER_LABELS[key] || key}`,
            url: resolved.url,
            quality: resolved.quality || "1080p",
            headers: resolved.headers || { "User-Agent": UA7, "Referer": url }
          };
        }
        return null;
      })));
      return results.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
    } catch (e) {
      return [];
    }
  });
}
