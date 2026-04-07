/**
 * seriesmetro - Built from src/seriesmetro/
 * Generated: 2026-04-07T22:35:13.836Z
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

// src/resolvers/voe.js
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function decodeBase64(input) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = String(input).replace(/=+$/, "");
  let output = "";
  for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}
function resolve(url) {
  return __async(this, null, function* () {
    try {
      console.log(`[VOE] Resolviendo Directo: ${url}`);
      const res = yield fetch(url, { headers: { "User-Agent": UA } });
      let html = yield res.text();
      if (html.includes("Redirecting") || html.length < 1500) {
        const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm) {
          const res2 = yield fetch(rm[1], { headers: { "User-Agent": UA } });
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
              headers: { "User-Agent": UA, "Referer": url }
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
          headers: { "User-Agent": UA, "Referer": url }
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
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function base64UrlDecode(input) {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4)
    s += "=";
  if (typeof Buffer !== "undefined")
    return Buffer.from(s, "base64");
  const bin = atob(s);
  return new Uint8Array(bin.split("").map((c) => c.charCodeAt(0)));
}
function decryptByse(playback) {
  return __async(this, null, function* () {
    try {
      const keyArr = [];
      for (const p of playback.key_parts)
        base64UrlDecode(p).forEach((b) => keyArr.push(b));
      const key = new Uint8Array(keyArr);
      const iv = base64UrlDecode(playback.iv);
      const ciphertextWithTag = base64UrlDecode(playback.payload);
      if (typeof crypto !== "undefined" && crypto.subtle) {
        try {
          const cryptoKey = yield crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]);
          const decryptedArr = yield crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertextWithTag);
          return JSON.parse(new TextDecoder().decode(decryptedArr));
        } catch (e) {
        }
      }
      const decryptedStr = decryptGCM(key, iv, ciphertextWithTag);
      return decryptedStr ? JSON.parse(decryptedStr) : null;
    } catch (e) {
      return null;
    }
  });
}
function resolve2(url) {
  return __async(this, null, function* () {
    try {
      const origin = new URL(url).origin;
      const idMatch = url.match(/\/e\/([a-zA-Z0-9]+)/);
      if (!idMatch)
        return null;
      const id = idMatch[1];
      try {
        const apiRes = yield fetch(`https://${new URL(url).hostname}/api/videos/${id}`, {
          headers: { "User-Agent": UA2, "Referer": url }
        });
        const data = yield apiRes.json();
        if (data.playback) {
          const decrypted = yield decryptByse(data.playback);
          if (decrypted && decrypted.sources) {
            const best = decrypted.sources[0];
            return { url: best.url, quality: best.height ? `${best.height}p` : "1080p", isM3U8: true, headers: { "User-Agent": UA2, "Referer": origin + "/", "Origin": origin } };
          }
        }
      } catch (e) {
      }
      const res = yield fetch(url, { headers: { "User-Agent": UA2, "Referer": url } });
      const html = yield res.text();
      const fm = html.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/);
      if (fm)
        return { url: fm[1], quality: "1080p", isM3U8: true, headers: { "User-Agent": UA2, "Referer": origin + "/", "Origin": origin } };
      return null;
    } catch (e) {
      return null;
    }
  });
}

// src/resolvers/hlswish.js
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function unpack(p, a, c, k, e, d) {
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
function resolve3(url) {
  return __async(this, null, function* () {
    try {
      let targetUrl = url;
      for (const [old, replacement] of Object.entries(DOMAIN_MAP)) {
        if (targetUrl.includes(old)) {
          targetUrl = targetUrl.replace(old, replacement);
          break;
        }
      }
      const origin = new URL(targetUrl).origin;
      const res = yield fetch(targetUrl, {
        headers: { "User-Agent": UA3, "Referer": origin + "/", "Origin": origin }
      });
      const html = yield res.text();
      let finalUrl = null;
      const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
      if (fileMatch) {
        finalUrl = fileMatch[1];
        if (finalUrl.startsWith("/"))
          finalUrl = origin + finalUrl;
      }
      if (!finalUrl) {
        const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packedMatch) {
          const unpacked = unpack(packedMatch[1], parseInt(packedMatch[2]), parseInt(packedMatch[3]), packedMatch[4].split("|"));
          const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
          if (m3u8Match) {
            finalUrl = m3u8Match[1];
            if (finalUrl.startsWith("/"))
              finalUrl = origin + finalUrl;
          }
        }
      }
      if (finalUrl) {
        return { url: finalUrl, quality: "1080p", headers: { "User-Agent": UA3, "Referer": origin + "/" } };
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}

// src/resolvers/vidhide.js
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
function resolve4(url) {
  return __async(this, null, function* () {
    try {
      const origin = new URL(url).origin;
      const res = yield fetch(url, {
        headers: { "User-Agent": UA4, "Referer": origin + "/" }
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
      if (!finalUrl.startsWith("http"))
        finalUrl = origin + finalUrl;
      return {
        url: finalUrl,
        quality: "1080p",
        headers: { "User-Agent": UA4, "Referer": origin + "/", "Origin": origin }
      };
    } catch (e) {
      return null;
    }
  });
}

// src/resolvers/fastream.js
var import_axios2 = __toESM(require("axios"));

// src/resolvers/quality.js
var import_axios = __toESM(require("axios"));
var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function detectQuality(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    try {
      if (!url || !url.includes(".m3u8"))
        return "1080p";
      const { data } = yield import_axios.default.get(url, {
        timeout: 5e3,
        headers: __spreadValues({ "User-Agent": UA5 }, headers),
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

// src/resolvers/fastream.js
var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
function unpackPacker(data) {
  const match = data.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)\)\)/);
  if (!match)
    return null;
  let [, p, a, c, k] = match;
  a = parseInt(a);
  c = parseInt(c);
  k = k.split("|");
  while (c--) {
    if (k[c])
      p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
  }
  return p;
}
function resolve5(url) {
  return __async(this, null, function* () {
    var _a, _b;
    try {
      console.log(`[Fastream] Resolviendo: ${url}`);
      const { data } = yield import_axios2.default.get(url, {
        headers: { "User-Agent": UA6, "Referer": "https://www3.seriesmetro.net/" },
        timeout: 1e4
      });
      const unpacked = unpackPacker(data);
      if (!unpacked) {
        const m3u8Match = (_a = data.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/)) == null ? void 0 : _a[1];
        if (m3u8Match) {
          const quality2 = yield detectQuality(m3u8Match, { "Referer": "https://fastream.to/" });
          return { url: m3u8Match, quality: quality2, headers: { "User-Agent": UA6, "Referer": "https://fastream.to/" } };
        }
        return null;
      }
      const m3u8 = (_b = unpacked.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/)) == null ? void 0 : _b[1];
      if (!m3u8)
        return null;
      const quality = yield detectQuality(m3u8, { "Referer": "https://fastream.to/" });
      return {
        url: m3u8,
        quality,
        headers: { "User-Agent": UA6, "Referer": "https://fastream.to/" }
      };
    } catch (e) {
      console.log(`[Fastream] Error: ${e.message}`);
      return null;
    }
  });
}

// src/seriesmetro/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE = "https://www3.seriesmetro.net";
var UA7 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var SERVER_LABELS = {
  "fastream": "Fastream",
  "voe": "VOE",
  "filemoon": "Filemoon",
  "streamwish": "StreamWish",
  "hglink": "StreamWish",
  "vidhide": "VidHide",
  "minochinos": "VidHide"
};
var LANG_MAP = {
  "latino": "Latino",
  "lat": "Latino",
  "castellano": "Castellano",
  "espa\xF1ol": "Castellano",
  "esp": "Castellano",
  "vose": "Subtitulado",
  "sub": "Subtitulado"
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
        year: (data.release_date || data.first_air_date || "").substring(0, 4)
      };
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    var _a;
    try {
      const tmdbInfo = yield getTmdbData(tmdbId, mediaType);
      if (!tmdbInfo)
        return [];
      const buildSlug = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      const category = mediaType === "movie" ? "pelicula" : "serie";
      const slugs = [buildSlug(tmdbInfo.title)];
      if (tmdbInfo.originalTitle)
        slugs.push(buildSlug(tmdbInfo.originalTitle));
      let foundUrl = null;
      let pageHtml = "";
      for (const slug of slugs) {
        const url = `${BASE}/${category}/${slug}/`;
        try {
          const res = yield fetch(url, { headers: { "User-Agent": UA7 } });
          if (res.status === 200) {
            pageHtml = yield res.text();
            if (pageHtml.includes("data-post=")) {
              foundUrl = url;
              break;
            }
          }
        } catch (e) {
        }
      }
      if (!foundUrl)
        return [];
      let targetUrl = foundUrl;
      if (mediaType === "tv") {
        const dpost = (_a = pageHtml.match(/data-post="(\d+)"/)) == null ? void 0 : _a[1];
        if (!dpost)
          return [];
        const epRes = yield fetch(`${BASE}/wp-admin/admin-ajax.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA7 },
          body: `action=action_select_season&post=${dpost}&season=${season}`
        });
        const epHtml = yield epRes.text();
        const epMatch = [...epHtml.matchAll(/href="([^"]+\/capitulo\/[^"]+)"/g)].find((m) => m[1].includes(`temporada-${season}-capitulo-${episode}`));
        if (!epMatch)
          return [];
        targetUrl = epMatch[1];
        const epPageRes = yield fetch(targetUrl, { headers: { "User-Agent": UA7 } });
        pageHtml = yield epPageRes.text();
      }
      const options = [...pageHtml.matchAll(/href="#options-(\d+)"[^>]*>[\s\S]*?<span class="server">([\s\S]*?)<\/span>/g)];
      const paramsMatch = pageHtml.match(/\?trembed=(\d+)&trid=(\d+)&trtype=(\d+)/);
      if (!options.length || !paramsMatch)
        return [];
      const [, , trid, trtype] = paramsMatch;
      const results = yield Promise.allSettled(options.map((_0) => __async(this, [_0], function* ([, idx, srvRaw]) {
        const srvText = srvRaw.replace(/<[^>]+>/g, "").trim();
        const langRaw = srvText.split("-").pop().trim().toLowerCase();
        const lang = LANG_MAP[langRaw] || "Latino";
        const embedPageRes = yield fetch(`${BASE}/?trembed=${idx}&trid=${trid}&trtype=${trtype}`, { headers: { "User-Agent": UA7, "Referer": targetUrl } });
        const embedHtml = yield embedPageRes.text();
        const iframeMatch = embedHtml.match(/<iframe[^>]*src="([^"]+)"/i);
        if (!iframeMatch)
          return null;
        const url = iframeMatch[1];
        const s = url.toLowerCase();
        let resolved = null;
        let key = "unknown";
        if (s.includes("fastream")) {
          key = "fastream";
          resolved = yield resolve5(url);
        } else if (s.includes("voe")) {
          key = "voe";
          resolved = yield resolve(url);
        } else if (s.includes("filemoon")) {
          key = "filemoon";
          resolved = yield resolve2(url);
        } else if (s.includes("streamwish") || s.includes("hglink")) {
          key = "streamwish";
          resolved = yield resolve3(url);
        } else if (s.includes("vidhide") || s.includes("minochinos")) {
          key = "vidhide";
          resolved = yield resolve4(url);
        }
        if (resolved && resolved.url) {
          return {
            name: "SeriesMetro",
            title: `${resolved.quality || "720p"} \xB7 ${lang} \xB7 ${SERVER_LABELS[key] || key}`,
            url: resolved.url,
            quality: resolved.quality || "720p",
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
module.exports = { getStreams };
