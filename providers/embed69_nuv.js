/**
 * embed69_nuv - Built from src/embed69_nuv/
 * Generated: 2026-04-08T20:30:38.899Z
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
  return new Promise((resolve5, reject) => {
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
    var step = (x) => x.done ? resolve5(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/http.js
var require_http = __commonJS({
  "src/utils/http.js"(exports2, module2) {
    var DEFAULT_UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    var MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
    function request(url, options) {
      return __async(this, null, function* () {
        var opt = options || {};
        var headers = Object.assign({
          "User-Agent": opt.mobile ? MOBILE_UA : DEFAULT_UA6,
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
    function fetchHtml6(url, options) {
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
      fetchHtml: fetchHtml6,
      fetchJson: fetchJson2,
      DEFAULT_UA: DEFAULT_UA6,
      MOBILE_UA
    };
  }
});

// src/embed69_nuv/index.js
var import_http5 = __toESM(require_http());

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
function getOrigin(url) {
  if (!url)
    return "";
  var match = url.match(/^(https?:\/\/[^\/]+)/);
  return match ? match[1] : "";
}

// src/resolvers/voe.js
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

// src/resolvers/filemoon.js
var import_http2 = __toESM(require_http());
function unpack(p, a, c, k, e, d) {
  while (c--) {
    if (k[c]) {
      p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
    }
  }
  return p;
}
function resolve2(url) {
  return __async(this, null, function* () {
    try {
      var idMatch = url.match(/\/e\/([a-zA-Z0-9]+)/);
      if (!idMatch)
        return null;
      var id = idMatch[1];
      console.log("[Filemoon] Resolving (Legacy Mode): " + id);
      var html = yield (0, import_http2.fetchHtml)(url, { headers: { "User-Agent": import_http2.DEFAULT_UA, "Referer": url } });
      var regex = /eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/g;
      var match;
      while ((match = regex.exec(html)) !== null) {
        var unpacked = unpack(match[1], parseInt(match[2]), parseInt(match[3]), match[4].split("|"), 0, {});
        var m3u8Match = unpacked.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
        if (m3u8Match) {
          console.log("[Filemoon] \u2713 Stream encontrado via Unpacker.");
          return {
            url: m3u8Match[1],
            quality: "1080p",
            headers: {
              "User-Agent": import_http2.DEFAULT_UA,
              "Referer": "https://arbitrarydecisions.com/",
              "Origin": "https://arbitrarydecisions.com"
            }
          };
        }
      }
      return null;
    } catch (e) {
      console.error("[Filemoon] Error: " + e.message);
      return null;
    }
  });
}

// src/resolvers/hlswish.js
var import_http3 = __toESM(require_http());
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
function resolve3(url) {
  return __async(this, null, function* () {
    try {
      var targetUrl = url;
      for (var key in DOMAIN_MAP) {
        if (Object.prototype.hasOwnProperty.call(DOMAIN_MAP, key)) {
          if (targetUrl.indexOf(key) !== -1) {
            targetUrl = targetUrl.replace(key, DOMAIN_MAP[key]);
            break;
          }
        }
      }
      console.log("[HLSWish] Resolving: " + url);
      var baseOrigin = "https://hlswish.com";
      var originMatch = targetUrl.match(/^(https?:\/\/[^/]+)/);
      if (originMatch)
        baseOrigin = originMatch[1];
      var html = yield (0, import_http3.fetchHtml)(targetUrl, {
        headers: { "User-Agent": import_http3.DEFAULT_UA, "Referer": "https://embed69.org/", "Origin": "https://embed69.org" }
      });
      var finalUrl = null;
      var fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
      if (fileMatch) {
        finalUrl = fileMatch[1];
        if (finalUrl && finalUrl.indexOf("/") === 0)
          finalUrl = baseOrigin + finalUrl;
      }
      if (!finalUrl) {
        var packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packedMatch) {
          var unpacked = unpack2(packedMatch[1], parseInt(packedMatch[2]), parseInt(packedMatch[3]), packedMatch[4].split("|"));
          var m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
          if (m3u8Match) {
            finalUrl = m3u8Match[1];
            if (finalUrl && finalUrl.indexOf("/") === 0)
              finalUrl = baseOrigin + finalUrl;
          }
        }
      }
      if (finalUrl) {
        return {
          url: finalUrl,
          quality: "1080p",
          headers: { "User-Agent": import_http3.DEFAULT_UA, "Referer": baseOrigin + "/" }
        };
      }
      return null;
    } catch (e) {
      console.log("[HLSWish] Error: " + e.message);
      return null;
    }
  });
}

// src/resolvers/vidhide.js
var import_http4 = __toESM(require_http());
function unpackVidHide(script) {
  try {
    var match = script.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
    if (!match)
      return null;
    var p = match[1];
    var a = parseInt(match[2]);
    var c = parseInt(match[3]);
    var k = match[4].split("|");
    var chars = "0123456789abcdefghijklmnopqrstuvwxyz";
    var decode = function(l, s) {
      var res = "";
      while (l > 0) {
        res = chars[l % s] + res;
        l = Math.floor(l / s);
      }
      return res || "0";
    };
    var unpacked = p.replace(/\b\w+\b/g, function(l) {
      var s = parseInt(l, 36);
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
      console.log("[VidHide] Resolving: " + url);
      var html = yield (0, import_http4.fetchHtml)(url, {
        headers: { "User-Agent": import_http4.DEFAULT_UA, "Referer": "https://embed69.org/" }
      });
      var packedMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
      if (!packedMatch)
        return null;
      var unpacked = unpackVidHide(packedMatch[0]);
      if (!unpacked)
        return null;
      var hlsMatch = unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/);
      if (!hlsMatch)
        return null;
      var finalUrl = hlsMatch[1];
      var origin = getOrigin(url);
      if (finalUrl.indexOf("http") !== 0)
        finalUrl = origin + finalUrl;
      return {
        url: finalUrl,
        quality: "1080p",
        headers: { "User-Agent": import_http4.DEFAULT_UA, "Referer": origin + "/", "Origin": origin }
      };
    } catch (e) {
      console.log("[VidHide] Error: " + e.message);
      return null;
    }
  });
}

// src/embed69_nuv/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE_URL = "https://embed69.org";
var RESOLVER_TIMEOUT = 1e4;
var RESOLVER_MAP = {
  "voe.sx": resolve,
  "hglink.to": resolve3,
  "streamwish.com": resolve3,
  "streamwish.to": resolve3,
  "wishembed.online": resolve3,
  "filelions.com": resolve3,
  "bysedikamoum.com": resolve2,
  "filemoon.sx": resolve2,
  "filemoon.to": resolve2,
  "moonembed.pro": resolve2,
  "moonalu.com": resolve2,
  "dintezuvio.com": resolve4,
  "vidhide.com": resolve4,
  "minochinos.com": resolve4
};
var LANG_PRIORITY = ["LAT", "ESP", "SUB"];
var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function b64decode(value) {
  if (!value)
    return "";
  var input = String(value).replace(/=+$/, "");
  var output = "";
  var bc = 0, bs, buffer, idx = 0;
  while (buffer = input.charAt(idx++)) {
    buffer = BASE64_CHARS.indexOf(buffer);
    if (~buffer) {
      bs = bc % 4 ? bs * 64 + buffer : buffer;
      if (bc++ % 4)
        output += String.fromCharCode(255 & bs >> (-2 * bc & 6));
    }
  }
  return output;
}
function decodeJwtPayload(token) {
  try {
    var parts = token.split(".");
    if (parts.length < 2)
      return null;
    var payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    payload += "=".repeat((4 - payload.length % 4) % 4);
    var decoded = b64decode(payload);
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}
function getImdbId(tmdbId, mediaType) {
  return __async(this, null, function* () {
    var endpoint = mediaType === "movie" ? "https://api.themoviedb.org/3/movie/" + tmdbId + "/external_ids?api_key=" + TMDB_API_KEY : "https://api.themoviedb.org/3/tv/" + tmdbId + "/external_ids?api_key=" + TMDB_API_KEY;
    try {
      var data = yield (0, import_http5.fetchJson)(endpoint, { headers: { "User-Agent": import_http5.DEFAULT_UA } });
      return data.imdb_id || null;
    } catch (e) {
      return null;
    }
  });
}
function resolveBatch(embedsToResolve) {
  return __async(this, null, function* () {
    var promises = embedsToResolve.map(function(item) {
      return Promise.race([
        item.resolver(item.url).then(function(r) {
          return r ? Object.assign({}, r, { lang: item.lang, servername: item.servername }) : null;
        }),
        new Promise(function(_, reject) {
          setTimeout(function() {
            reject(new Error("timeout"));
          }, RESOLVER_TIMEOUT);
        })
      ]).then(function(value) {
        return { status: "fulfilled", value };
      }).catch(function(reason) {
        return { status: "rejected", reason };
      });
    });
    var results = yield Promise.all(promises);
    var streams = [];
    var seenUrls = /* @__PURE__ */ new Set();
    for (var i = 0; i < results.length; i++) {
      var res = results[i];
      if (res.status === "fulfilled" && res.value && res.value.url) {
        var stream = res.value;
        if (seenUrls.has(stream.url))
          continue;
        seenUrls.add(stream.url);
        var langLabel = stream.lang === "LAT" ? "Latino" : stream.lang === "ESP" ? "Espa\xF1ol" : stream.lang === "SUB" ? "Subtitulado" : stream.lang;
        streams.push({
          name: "Embed69 Latino",
          title: (stream.quality || "1080p") + " \xB7 " + langLabel + " \xB7 " + stream.servername,
          url: stream.url,
          quality: stream.quality || "1080p",
          headers: stream.headers || {}
        });
      }
    }
    return streams;
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      console.log("[Embed69 Latino] Buscando: " + (title || tmdbId) + " (" + mediaType + ")...");
      var imdbId = yield getImdbId(tmdbId, mediaType);
      if (!imdbId)
        return [];
      var embedUrl = BASE_URL + "/f/" + imdbId;
      if (mediaType === "tv" || mediaType === "series") {
        var e = String(episode).padStart(2, "0");
        embedUrl = BASE_URL + "/f/" + imdbId + "-" + parseInt(season) + "x" + e;
      }
      var html = yield (0, import_http5.fetchHtml)(embedUrl, {
        headers: { "User-Agent": import_http5.DEFAULT_UA, "Referer": "https://sololatino.net/" }
      });
      var dlMatch = html.match(/let\s+dataLink\s*=\s*(\[[\s\S]*?\]);/);
      if (!dlMatch)
        return [];
      var dataLink = JSON.parse(dlMatch[1]);
      var byLang = {};
      for (var j = 0; j < dataLink.length; j++) {
        var section = dataLink[j];
        byLang[section.video_language || "LAT"] = section;
      }
      var finalStreams = [];
      for (var k = 0; k < LANG_PRIORITY.length; k++) {
        var lang = LANG_PRIORITY[k];
        var currentSection = byLang[lang];
        if (!currentSection)
          continue;
        var embedsToResolve = [];
        var sortedEmbeds = currentSection.sortedEmbeds || [];
        for (var l = 0; l < sortedEmbeds.length; l++) {
          var embed = sortedEmbeds[l];
          if (embed.servername === "download")
            continue;
          var payload = decodeJwtPayload(embed.link);
          if (!payload || !payload.link)
            continue;
          var resolver = null;
          for (var domain in RESOLVER_MAP) {
            if (payload.link.indexOf(domain) !== -1) {
              resolver = RESOLVER_MAP[domain];
              break;
            }
          }
          if (resolver) {
            embedsToResolve.push({ url: payload.link, resolver, lang, servername: embed.servername });
          }
        }
        if (embedsToResolve.length > 0) {
          console.log("[Embed69 Latino] Resolviendo enlaces en " + lang + "...");
          var resolved = yield resolveBatch(embedsToResolve);
          if (resolved.length > 0) {
            for (var m = 0; m < resolved.length; m++) {
              finalStreams.push(resolved[m]);
            }
            console.log("[Embed69 Latino] \u2713 Streams encontrados en " + lang + ".");
            break;
          }
        }
      }
      return finalStreams;
    } catch (err) {
      console.error("[Embed69 Latino] Error: " + err.message);
      return [];
    }
  });
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { getStreams };
} else {
  global.getStreams = getStreams;
}
