/**
 * fuegocine - Built from src/fuegocine/
 * Generated: 2026-04-13T00:09:37.749Z
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
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
  return new Promise((resolve4, reject) => {
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
    var step = (x) => x.done ? resolve4(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/m3u8.js
var m3u8_exports = {};
__export(m3u8_exports, {
  getQualityFromHeight: () => getQualityFromHeight,
  validateStream: () => validateStream
});
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
function parseBestQuality(content, url = "") {
  const lines = content.split("\n");
  let bestHeight = 0;
  for (const line of lines) {
    if (line.includes("RESOLUTION=")) {
      const match = line.match(/RESOLUTION=\d+x(\d+)/i);
      if (match) {
        const height = parseInt(match[1]);
        if (height > bestHeight)
          bestHeight = height;
      }
    }
  }
  if (bestHeight > 0)
    return getQualityFromHeight(bestHeight);
  const urlPattern = url.match(/[_-](\d{3,4})[pP]?/);
  if (urlPattern) {
    const h = parseInt(urlPattern[1]);
    if (h >= 360 && h <= 4320)
      return getQualityFromHeight(h);
  }
  return "720p";
}
function validateStream(stream) {
  return __async(this, null, function* () {
    if (!stream || !stream.url)
      return stream;
    const { url, headers } = stream;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12e3);
    try {
      const response = yield fetch(url, {
        signal: controller.signal,
        headers: __spreadValues({
          "Accept": "*/*",
          "Range": "bytes=0-8192",
          "User-Agent": UA
        }, headers || {})
      });
      clearTimeout(timeout);
      if (!response.ok && response.status !== 206 && response.status !== 403) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = yield response.text();
      if (text && (url.includes(".m3u8") || text.includes("#EXTM3U"))) {
        const realQuality = parseBestQuality(text, url);
        return __spreadProps(__spreadValues({}, stream), {
          quality: realQuality,
          verified: true
        });
      }
      return __spreadProps(__spreadValues({}, stream), { verified: true });
    } catch (error) {
      clearTimeout(timeout);
      const fallbackQuality = parseBestQuality("", url) || "HD";
      const isKnown = url.includes("awish") || url.includes("vimeos") || url.includes("voe") || url.includes("filemoon") || url.includes("vidhide") || url.includes("cloudwindow");
      return __spreadProps(__spreadValues({}, stream), {
        quality: fallbackQuality,
        verified: isKnown
      });
    }
  });
}
var UA;
var init_m3u8 = __esm({
  "src/utils/m3u8.js"() {
    UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  }
});

// src/utils/sorting.js
var sorting_exports = {};
__export(sorting_exports, {
  sortStreamsByQuality: () => sortStreamsByQuality
});
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
var QUALITY_SCORE;
var init_sorting = __esm({
  "src/utils/sorting.js"() {
    QUALITY_SCORE = {
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
  }
});

// src/utils/engine.js
var require_engine = __commonJS({
  "src/utils/engine.js"(exports2, module2) {
    var { validateStream: validateStream2 } = (init_m3u8(), __toCommonJS(m3u8_exports));
    var { sortStreamsByQuality: sortStreamsByQuality2 } = (init_sorting(), __toCommonJS(sorting_exports));
    function normalizeLanguage(lang) {
      const l = (lang || "").toLowerCase();
      if (l.includes("lat") || l.includes("mex") || l.includes("col") || l.includes("arg") || l.includes("chi") || l.includes("per") || l.includes("dublado") || l.includes("dual"))
        return "Latino";
      if (l.includes("esp") || l.includes("cas") || l.includes("spa") || l.includes("cast"))
        return "Espa\xF1ol";
      if (l.includes("sub") || l.includes("vose") || l.includes("eng") || l.includes("original"))
        return "Subtitulado";
      return lang || "Latino";
    }
    function normalizeServer(server, url = "") {
      if (!server || server === "Servidor" || server === "Server") {
        if (url && url.startsWith("http")) {
          try {
            const domain = new URL(url).hostname.replace("www.", "").split(".")[0];
            return domain.charAt(0).toUpperCase() + domain.slice(1);
          } catch (e) {
            return "Servidor";
          }
        }
        return "Servidor";
      }
      const s = server.toLowerCase();
      const u = url.toLowerCase();
      if (s.includes("voe") || s.includes("jessicaclearout") || s.includes("shonydar") || u.includes("ugc-cdn") || u.includes("cloudwindow") || u.includes("shonydar"))
        return "VOE";
      if (s.includes("filemoon"))
        return "Filemoon";
      if (s.includes("streamwish") || s.includes("awish") || s.includes("dwish") || s.includes("strwish") || u.includes("embedwish") || u.includes("strcloud"))
        return "StreamWish";
      if (s.includes("vidhide") || s.includes("dintezuvio") || s.includes("movhide") || u.includes("acek-cdn") || u.includes("premilkyway") || u.includes("hf-ovh") || u.includes("mx9skjnui4es"))
        return "VidHide";
      if (s.includes("waaw") || s.includes("netu") || s.includes("vimeos") || u.includes("waaw") || u.includes("vms.sh"))
        return "Netu";
      if (s.includes("fastream") || s.includes("fastplay"))
        return "Fastream";
      if (/^[a-zA-Z0-9-]{15,}$/.test(server) || server.includes("cdn-caching")) {
        return "Servidor Privado";
      }
      return server;
    }
    function finalizeStreams2(streams, providerName, mediaTitle) {
      return __async(this, null, function* () {
        if (!Array.isArray(streams) || streams.length === 0)
          return [];
        console.log(`[Engine] Processing ${streams.length} streams for ${providerName} (${mediaTitle || "Unknown"})...`);
        let validated = streams;
        try {
          const results = yield Promise.allSettled(
            streams.map((s) => validateStream2(s))
          );
          validated = results.map(
            (r, i) => r.status === "fulfilled" ? r.value : streams[i]
          );
        } catch (e) {
        }
        const sorted = sortStreamsByQuality2(validated);
        const processed = sorted.map((s) => {
          const lang = normalizeLanguage(s.langLabel || s.language || s.lang || s.audio);
          if (lang !== "Latino" && lang !== "Espa\xF1ol" && lang !== "Subtitulado") {
            console.log(`[Engine] Rechazado por idioma (${lang}): ${s.url.substring(0, 40)}...`);
            return null;
          }
          let q = s.verified ? s.quality : s.siteQuality || "HD";
          const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url);
          const check = s.verified ? " \u2713" : "";
          const prefix = mediaTitle ? `${mediaTitle} | ` : "";
          const qualityPart = q ? `[${q}${check}] | ` : "";
          return {
            name: providerName || "Plugin Latino",
            title: `${prefix}${qualityPart}${lang} | ${server}`,
            url: s.url,
            quality: q || "",
            headers: s.headers || {}
          };
        });
        const uniqueUrls = /* @__PURE__ */ new Set();
        const finalized = processed.filter((s) => {
          if (s === null)
            return false;
          if (uniqueUrls.has(s.url)) {
            console.log(`[Engine] Filtrado por duplicado (mismo URL): ${s.title}`);
            return false;
          }
          uniqueUrls.add(s.url);
          return true;
        });
        console.log(`[Engine] FIN: ${finalized.length} resultados finales enviados a Nuvio para ${providerName}.`);
        return finalized;
      });
    }
    module2.exports = { finalizeStreams: finalizeStreams2 };
  }
});

// src/utils/http.js
function request(url, options) {
  return __async(this, null, function* () {
    var opt = options || {};
    var headers = Object.assign({
      "User-Agent": opt.mobile ? MOBILE_UA : DEFAULT_UA,
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
function fetchHtml(url, options) {
  return __async(this, null, function* () {
    var res = yield request(url, options);
    return yield res.text();
  });
}
var import_axios, DEFAULT_UA, MOBILE_UA;
var init_http = __esm({
  "src/utils/http.js"() {
    import_axios = __toESM(require("axios"));
    DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
  }
});

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
function utf8Decode(bytes) {
  var out = "", i = 0;
  while (i < bytes.length) {
    var c = bytes[i++];
    if (c < 128)
      out += String.fromCharCode(c);
    else if (c > 191 && c < 224)
      out += String.fromCharCode((c & 31) << 6 | bytes[i++] & 63);
    else
      out += String.fromCharCode((c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63);
  }
  return out;
}
var init_string = __esm({
  "src/utils/string.js"() {
  }
});

// src/resolvers/voe.js
function resolve(url) {
  return __async(this, null, function* () {
    try {
      console.log("[VOE] Resolving: " + url);
      var html = yield fetchHtml(url, { headers: { "User-Agent": DEFAULT_UA } });
      if (html.indexOf("Redirecting") !== -1 || html.length < 1500) {
        var rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm) {
          html = yield fetchHtml(rm[1], { headers: { "User-Agent": DEFAULT_UA } });
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
          if (data && (data.source || data.mp4)) {
            const finalUrl = data.source || data.mp4;
            console.log("[VOE] -> video encontrado: " + finalUrl.substring(0, 60) + "...");
            let q = "1080p";
            if (data.video_height) {
              const h = parseInt(data.video_height);
              if (h >= 1080)
                q = "1080p";
              else if (h >= 720)
                q = "720p";
              else if (h >= 480)
                q = "480p";
              else
                q = h + "p";
            } else {
              const urlMatch = finalUrl.match(/[_-](\d{3,4})[pP]?/);
              if (urlMatch)
                q = urlMatch[1] + "p";
            }
            return {
              url: finalUrl,
              quality: q,
              serverName: "VOE",
              headers: { "User-Agent": DEFAULT_UA, "Referer": url }
            };
          }
        } catch (ex) {
          console.error("[VOE] Decryption failed:", ex.message);
        }
      }
      var m3u8MatchRaw = html.match(/["'](https?:\/\/[^"']+?\.m3u8[^"']*?)["']/i);
      if (m3u8MatchRaw) {
        const finalUrl = m3u8MatchRaw[1];
        let q = "1080p";
        const urlMatch = finalUrl.match(/[_-](\d{3,4})[pP]?/);
        if (urlMatch)
          q = urlMatch[1] + "p";
        return {
          url: finalUrl,
          quality: q,
          serverName: "VOE",
          headers: { "User-Agent": DEFAULT_UA, "Referer": url }
        };
      }
      return null;
    } catch (e) {
      console.error("[VOE] Error resolviedo: " + e.message);
      return null;
    }
  });
}
var init_voe = __esm({
  "src/resolvers/voe.js"() {
    init_http();
    init_string();
  }
});

// src/resolvers/hlswish.js
function unpackEval(payload, radix, symtab) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const unbase = (str) => {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      const pos = chars.indexOf(str[i]);
      if (pos === -1)
        return NaN;
      result = result * radix + pos;
    }
    return result;
  };
  return payload.replace(/\b([0-9a-zA-Z]+)\b/g, (match) => {
    const idx = unbase(match);
    if (isNaN(idx) || idx >= symtab.length)
      return match;
    return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
  });
}
function resolve2(url) {
  return __async(this, null, function* () {
    try {
      let targetUrl = url;
      const rawId = url.split("/").pop();
      const mirrors = [
        targetUrl,
        `https://embedwish.com/e/${rawId}`,
        `https://hglamioz.com/e/${rawId}`,
        `https://awish.pro/e/${rawId}`,
        `https://strwish.com/e/${rawId}`
      ];
      let html = "";
      let usedUrl = targetUrl;
      for (const mirror of mirrors) {
        try {
          console.log(`[StreamWish] Probando espejo: ${mirror}`);
          const response = yield import_axios2.default.get(mirror, {
            headers: { "User-Agent": UA2, "Referer": "https://embed69.org/" },
            timeout: 8e3
          });
          html = response.data;
          usedUrl = mirror;
          if (!html.includes("Page is loading") && (html.includes("eval(function") || html.includes(".m3u8"))) {
            break;
          }
        } catch (mirrorErr) {
          continue;
        }
      }
      if (!html)
        return null;
      const baseOrigin = (usedUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
      let finalUrl = null;
      const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
      if (fileMatch) {
        finalUrl = fileMatch[1];
      }
      if (!finalUrl) {
        const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packedMatch) {
          const unpacked = unpackEval(packedMatch[1], parseInt(packedMatch[2]), packedMatch[4].split("|"));
          const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i) || unpacked.match(/https?:\/\/[^"' \t\n\r]+\.m3u8[^"' \t\n\r]*/i);
          if (m3u8Match) {
            finalUrl = m3u8Match[1] || m3u8Match[0];
          }
        }
      }
      if (!finalUrl) {
        const rawMatch = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (rawMatch)
          finalUrl = rawMatch[0];
      }
      if (finalUrl) {
        if (finalUrl.startsWith("/"))
          finalUrl = baseOrigin + finalUrl;
        finalUrl = finalUrl.replace(/\\/g, "");
        let q = "1080p";
        const qMatch = finalUrl.match(/[_-](\d{3,4})[pP]?/);
        if (qMatch)
          q = qMatch[1] + "p";
        console.log(`[StreamWish] URL resuelta satisfactoriamente (Calidad: ${q})`);
        return {
          url: finalUrl,
          quality: q,
          serverName: "StreamWish",
          headers: {
            "User-Agent": UA2,
            "Referer": baseOrigin + "/",
            "Origin": baseOrigin
          }
        };
      }
      return null;
    } catch (e) {
      console.log(`[StreamWish] Error cr\xEDtico: ${e.message}`);
      return null;
    }
  });
}
var import_axios2, UA2;
var init_hlswish = __esm({
  "src/resolvers/hlswish.js"() {
    import_axios2 = __toESM(require("axios"));
    UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  }
});

// src/utils/aes-gcm.js
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
var import_crypto_js;
var init_aes_gcm = __esm({
  "src/utils/aes-gcm.js"() {
    import_crypto_js = __toESM(require("crypto-js"));
  }
});

// src/utils/config.js
var API_KEYS;
var init_config = __esm({
  "src/utils/config.js"() {
    API_KEYS = {
      FILEMOON: "42605q5ytvlhmu9eris67",
      VIDHIDE: "27261mmymf1etcdwfdvr3",
      STREAMWISH: "10801lny3tlwanfupzu4m",
      MIXDROP: "gAR2UJ0JE2RKlhJJCqE"
    };
  }
});

// src/resolvers/filemoon.js
function decryptByse(playback) {
  return __async(this, null, function* () {
    try {
      const keyArr = [];
      for (const p of playback.key_parts) {
        const bin = base64Decode(p.replace(/-/g, "+").replace(/_/g, "/"));
        new Uint8Array(bin.split("").map((c) => c.charCodeAt(0))).forEach((b) => keyArr.push(b));
      }
      const key = new Uint8Array(keyArr);
      const ivBase = playback.iv.replace(/-/g, "+").replace(/_/g, "/");
      const ivBin = base64Decode(ivBase);
      const iv = new Uint8Array(ivBin.split("").map((c) => c.charCodeAt(0)));
      const payloadBase = playback.payload.replace(/-/g, "+").replace(/_/g, "/");
      const payloadBin = base64Decode(payloadBase);
      const ciphertextWithTag = new Uint8Array(payloadBin.split("").map((c) => c.charCodeAt(0)));
      if (typeof crypto !== "undefined" && crypto.subtle) {
        try {
          const cryptoKey = yield crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]);
          const decryptedArr = yield crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertextWithTag);
          return JSON.parse(utf8Decode(new Uint8Array(decryptedArr)));
        } catch (e) {
          console.log("[Byse] Subtle fail");
        }
      }
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
      const hostname = new URL(url).hostname;
      const codeMatch = url.match(/\/(?:e|tmgk|d)\/([a-zA-Z0-9]+)/);
      if (!codeMatch)
        return null;
      const code = codeMatch[1];
      console.log(`[Byse/Filemoon] Resolviendo Estructural v5.6.5: ${code} (${hostname})`);
      const defaultHeaders = {
        "User-Agent": UA3,
        "Referer": url,
        "Origin": `https://${hostname}`,
        "x-embed-origin": "ww3.gnulahd.nu",
        // Autorización GnulaHD
        "x-embed-referer": "https://ww3.gnulahd.nu/",
        "x-embed-parent": url
      };
      if (API_KEYS.FILEMOON) {
        try {
          const apiRes = yield fetch(`https://filemoon.sx/api/file/direct_link?key=${API_KEYS.FILEMOON}&file_code=${code}`);
          const apiData = yield apiRes.json();
          if (apiData.result && apiData.result.url) {
            return {
              url: apiData.result.url,
              quality: "HD",
              serverName: "Filemoon",
              headers: defaultHeaders
            };
          }
        } catch (e) {
        }
      }
      try {
        const detailsRes = yield fetch(`https://${hostname}/api/videos/${code}/embed/details`, { headers: defaultHeaders });
        const details = yield detailsRes.json();
        let targetCode = code;
        let targetHost = hostname;
        let refererForPlayback = url;
        if (details.embed_frame_url) {
          const frameUrl = details.embed_frame_url;
          const frameUri = new URL(frameUrl);
          targetCode = frameUri.pathname.split("/").pop();
          targetHost = frameUri.hostname;
          refererForPlayback = frameUrl;
        }
        const playbackHeaders = __spreadProps(__spreadValues({}, defaultHeaders), { "Referer": refererForPlayback, "x-embed-parent": url });
        const playbackRes = yield fetch(`https://${targetHost}/api/videos/${targetCode}/embed/playback`, { headers: playbackHeaders });
        const playbackData = yield playbackRes.json();
        if (playbackData.playback) {
          const decrypted = yield decryptByse(playbackData.playback);
          if (decrypted && decrypted.sources) {
            const best = decrypted.sources[0];
            return {
              url: best.url,
              quality: "HD",
              serverName: "Filemoon/Byse",
              headers: playbackHeaders
            };
          }
        }
      } catch (apiErr) {
        console.log(`[Byse/Filemoon] API Flow failed: ${apiErr.message}`);
      }
      try {
        const apiRes = yield fetch(`https://${hostname}/api/videos/${code}`, { headers: defaultHeaders });
        const data = yield apiRes.json();
        if (data.playback) {
          const decrypted = yield decryptByse(data.playback);
          if (decrypted && decrypted.sources) {
            const best = decrypted.sources[0];
            return {
              url: best.url,
              quality: "HD",
              serverName: "Filemoon",
              headers: defaultHeaders
            };
          }
        }
      } catch (e) {
      }
      return null;
    } catch (e) {
      console.error(`[Filemoon] Global Error: ${e.message}`);
      return null;
    }
  });
}
var UA3;
var init_filemoon = __esm({
  "src/resolvers/filemoon.js"() {
    init_aes_gcm();
    init_string();
    init_config();
    UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
  }
});

// src/utils/resolvers.js
var resolvers_exports = {};
__export(resolvers_exports, {
  resolveEmbed: () => resolveEmbed
});
function getDirectCdnHeaders(url) {
  if (!url)
    return null;
  const s = url.toLowerCase();
  if (s.includes("vidhide") || s.includes("vhaudm") || s.includes("embedseek") || s.includes("mdfury")) {
    try {
      const origin = new URL(url).origin;
      return {
        "User-Agent": UA4,
        "Referer": origin + "/",
        "Origin": origin.replace(/\/$/, "")
      };
    } catch (e) {
      return { "User-Agent": UA4, "Referer": "https://vidhide.com/", "Origin": "https://vidhide.com" };
    }
  }
  if (s.includes("r66nv9ed.com") || s.includes("filemoon") || s.includes("byse") || s.includes("398fitus.com")) {
    let domain = "filemoon.sx";
    if (s.includes("398fitus"))
      domain = "398fitus.com";
    if (s.includes("bysevepoin"))
      domain = "bysevepoin.com";
    if (s.includes("bysebuho"))
      domain = "bysebuho.com";
    if (s.includes("bysezejataos"))
      domain = "bysezejataos.com";
    if (s.includes("byseqekaho"))
      domain = "byseqekaho.com";
    const referer = `https://${domain}/`;
    return {
      "Referer": referer,
      "Origin": `https://${domain}`,
      "User-Agent": UA4,
      "x-embed-origin": "ww3.gnulahd.nu",
      "x-embed-referer": "https://ww3.gnulahd.nu/",
      "x-embed-parent": referer
    };
  }
  if (s.includes("cloudwindow-route.com") || s.includes("awish.pro") || s.includes("streamwish")) {
    return { "User-Agent": UA4, "Referer": "https://streamwish.to/", "Origin": "https://streamwish.to" };
  }
  return null;
}
function applyPiping(result) {
  if (!result || !result.url)
    return result;
  if (result.url.includes("|") || !result.headers)
    return result;
  const headers = result.headers;
  const parts = [];
  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      parts.push(`${key}=${value}`);
    }
  }
  if (parts.length > 0) {
    result.url = `${result.url}|${parts.join("|")}`;
  }
  return result;
}
function preProcessUrl(url) {
  return __async(this, null, function* () {
    if (!url)
      return url;
    return url;
  });
}
function resolveEmbed(url) {
  return __async(this, null, function* () {
    if (!url)
      return null;
    const targetUrl = yield preProcessUrl(url);
    const s = targetUrl.toLowerCase();
    const directHeaders = getDirectCdnHeaders(targetUrl);
    if (directHeaders && (targetUrl.includes(".m3u8") || targetUrl.includes(".mp4") || targetUrl.includes(".txt"))) {
      return applyPiping({
        url: targetUrl,
        quality: "HD",
        headers: directHeaders
      });
    }
    if (s.includes("voe") || s.includes("jessicaclearout")) {
      const res = yield resolve(targetUrl);
      return res ? applyPiping(res) : null;
    }
    if (s.includes("hlswish") || s.includes("streamwish") || s.includes("hglamioz") || s.includes("embedwish") || s.includes("awish") || s.includes("dwish")) {
      const res = yield resolve2(targetUrl);
      return res ? applyPiping(res) : null;
    }
    if (s.includes("filemoon") || s.includes("398fitus") || s.includes("r66nv9ed") || s.includes("byse")) {
      const res = yield resolve3(targetUrl);
      return res ? applyPiping(res) : null;
    }
    if (s.includes(".m3u8") || s.includes(".mp4") || s.includes(".txt")) {
      return applyPiping({
        url: targetUrl,
        quality: "HD",
        headers: { "User-Agent": UA4, "Referer": targetUrl }
      });
    }
    return null;
  });
}
var UA4;
var init_resolvers = __esm({
  "src/utils/resolvers.js"() {
    init_voe();
    init_hlswish();
    init_filemoon();
    UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
  }
});

// src/utils/tmdb.js
var require_tmdb = __commonJS({
  "src/utils/tmdb.js"(exports2, module2) {
    var axios4 = require("axios");
    var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
    var titleCache = /* @__PURE__ */ new Map();
    function getTmdbTitle2(tmdbId, mediaType, retries = 2) {
      return __async(this, null, function* () {
        if (!tmdbId)
          return null;
        const cleanId = tmdbId.toString().split(":")[0];
        const cacheKey = `${cleanId}_${mediaType}`;
        if (titleCache.has(cacheKey))
          return titleCache.get(cacheKey);
        try {
          const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
          let url;
          if (cleanId.startsWith("tt")) {
            url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
            const { data } = yield axios4.get(url, { timeout: 6e3 });
            const result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
            const title = result ? result.name || result.title : null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}`;
            const { data } = yield axios4.get(url, { timeout: 6e3 });
            const title = data.name || data.title || null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          }
        } catch (e) {
          if (retries > 0) {
            console.log(`[TMDB-Rescue] Retrying ${tmdbId} (${retries} left)...`);
            yield new Promise((r) => setTimeout(r, 1e3));
            return getTmdbTitle2(tmdbId, mediaType, retries - 1);
          }
          console.log(`[TMDB-Rescue] Failed to fetch title for ${tmdbId}: ${e.message}`);
          return null;
        }
      });
    }
    function getTmdbInfo(tmdbId, mediaType) {
      return __async(this, null, function* () {
        if (!tmdbId)
          return null;
        const cleanId = tmdbId.toString().split(":")[0];
        const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
        try {
          let url;
          let result;
          if (cleanId.startsWith("tt")) {
            url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
            const { data } = yield axios4.get(url, { timeout: 6e3 });
            result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}`;
            const { data } = yield axios4.get(url, { timeout: 6e3 });
            result = data;
          }
          if (result) {
            const title = result.name || result.title;
            const date = result.release_date || result.first_air_date || "";
            const year = date.split("-")[0];
            return { title, year };
          }
          return null;
        } catch (e) {
          return null;
        }
      });
    }
    module2.exports = { getTmdbTitle: getTmdbTitle2, getTmdbInfo };
  }
});

// src/fuegocine/index.js
var axios3 = require("axios");
var { finalizeStreams } = require_engine();
var { resolveEmbed: resolveEmbed2 } = (init_resolvers(), __toCommonJS(resolvers_exports));
var { getTmdbTitle } = require_tmdb();
var BASE_URL = "https://www.fuegocine.com";
var SEARCH_BASE = `${BASE_URL}/feeds/posts/default?alt=json&max-results=10&q=`;
var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var DEFAULT_HEADERS = {
  "User-Agent": UA5,
  "Referer": `${BASE_URL}/`
};
function normalizeTitle(t) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function b64decode(str) {
  if (typeof atob !== "undefined")
    return atob(str);
  return Buffer.from(str, "base64").toString("binary");
}
function decodeUrl(url) {
  const b64Match = url.match(/[?&]r=([A-Za-z0-9+/=]+)/);
  if (b64Match) {
    try {
      const decoded = b64decode(b64Match[1]);
      return decodeUrl(decoded);
    } catch (e) {
      return url;
    }
  }
  const linkMatch = url.match(/[?&]link=([^&]+)/);
  if (linkMatch) {
    try {
      const decoded = decodeURIComponent(linkMatch[1]);
      return decodeUrl(decoded);
    } catch (e) {
      return url;
    }
  }
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([A-Za-z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.usercontent.google.com/download?id=${driveMatch[1]}&export=download&confirm=t`;
  }
  return url;
}
function extractLinks(html) {
  const links = [];
  const match = html.match(/const\s+_SV_LINKS\s*=\s*\[([\s\S]*?)\]\s*;/);
  if (!match)
    return links;
  const block = match[1];
  const entryRegex = /\{[\s\S]*?lang\s*:\s*["']([^"']+)["'][\s\S]*?name\s*:\s*["']([^"']+)["'][\s\S]*?quality\s*:\s*["']([^"']+)["'][\s\S]*?url\s*:\s*["']([^"']+)["'][\s\S]*?\}/g;
  let m;
  while ((m = entryRegex.exec(block)) !== null) {
    links.push({
      lang: m[1],
      name: m[2].replace(/&#9989;/g, "").replace(/&amp;/g, "&"),
      quality: m[3],
      url: decodeUrl(m[4])
    });
  }
  return links;
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    var _a, _b, _c, _d;
    try {
      let mediaTitle = title;
      if (!mediaTitle && tmdbId) {
        mediaTitle = yield getTmdbTitle(tmdbId, mediaType);
      }
      if (!mediaTitle)
        return [];
      const searchTitle = season ? `${mediaTitle} ${season}x${episode}` : mediaTitle;
      const { data: searchJson } = yield axios3.get(SEARCH_BASE + encodeURIComponent(searchTitle), { timeout: 8e3 });
      const entries = ((_a = searchJson.feed) == null ? void 0 : _a.entry) || [];
      const streams = [];
      for (const entry of entries) {
        const entryTitle = ((_b = entry.title) == null ? void 0 : _b.$t) || "";
        const entryUrl = (_d = (_c = entry.link) == null ? void 0 : _c.find((l) => l.rel === "alternate")) == null ? void 0 : _d.href;
        if (!entryUrl)
          continue;
        const normEntry = normalizeTitle(entryTitle);
        const normTitle = normalizeTitle(mediaTitle);
        if (!normEntry.includes(normTitle))
          continue;
        const { data: html } = yield axios3.get(entryUrl, { timeout: 8e3 });
        const links = extractLinks(html);
        for (const link of links) {
          const result = yield resolveEmbed2(link.url);
          if (result && result.url) {
            streams.push({
              langLabel: link.lang,
              serverLabel: link.name || "Server",
              url: result.url,
              quality: result.quality || link.quality || "720p",
              headers: result.headers || DEFAULT_HEADERS
            });
          }
        }
      }
      return yield finalizeStreams(streams, "FuegoCine", mediaTitle);
    } catch (e) {
      console.error("[FuegoCine] error:", e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
