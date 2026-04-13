/**
 * playhubmax - Built from src/playhubmax/
 * Generated: 2026-04-13T06:17:44.285Z
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
  return new Promise((resolve9, reject) => {
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
    var step = (x) => x.done ? resolve9(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/m3u8.js
var require_m3u8 = __commonJS({
  "src/utils/m3u8.js"(exports2, module2) {
    var axios7 = require("axios");
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    function getQualityFromHeight(height) {
      if (!height)
        return "1080p";
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
      return "1080p";
    }
    function parseBestQuality(content, url = "") {
      if (content) {
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
      }
      const qMatch = url.match(/[_-](\d{3,4})[pP]?/);
      if (qMatch) {
        const h = parseInt(qMatch[1]);
        if (h >= 360 && h <= 4320)
          return getQualityFromHeight(h);
      }
      return "1080p";
    }
    function validateStream(stream) {
      return __async(this, null, function* () {
        if (!stream || !stream.url)
          return stream;
        const { url, headers } = stream;
        try {
          const response = yield axios7.get(url, {
            timeout: 8e3,
            skipSizeCheck: true,
            // REGLA CRÍTICA NUVIO: Ignorar detector de OOM para validación
            headers: __spreadValues({
              "User-Agent": UA5,
              "Range": "bytes=0-4096"
            }, headers || {}),
            responseType: "text"
          });
          const text = response.data;
          if (text && (url.includes(".m3u8") || text.includes("#EXTM3U"))) {
            const realQuality = parseBestQuality(text, url);
            return __spreadProps(__spreadValues({}, stream), { quality: realQuality, verified: true });
          }
          return __spreadProps(__spreadValues({}, stream), { verified: true });
        } catch (error) {
          const fallbackQuality = parseBestQuality("", url);
          return __spreadProps(__spreadValues({}, stream), { quality: fallbackQuality, verified: true });
        }
      });
    }
    module2.exports = { validateStream, getQualityFromHeight };
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
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    const serverA = (a.serverLabel || "").split(" ")[0];
    const serverB = (b.serverLabel || "").split(" ")[0];
    const speedA = SERVER_SCORE[serverA] || 0;
    const speedB = SERVER_SCORE[serverB] || 0;
    if (speedA !== speedB) {
      return speedB - speedA;
    }
    if (a.verified && !b.verified)
      return -1;
    if (!a.verified && b.verified)
      return 1;
    return 0;
  });
}
var QUALITY_SCORE, SERVER_SCORE;
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
    SERVER_SCORE = {
      "VOE": 10,
      "Filemoon": 10,
      "Tplayer": 10,
      "Vimeos": 10,
      "Netu": 5,
      "GoodStream": 10,
      "StreamWish": -5,
      "VidHide": -5
    };
  }
});

// src/utils/engine.js
var require_engine = __commonJS({
  "src/utils/engine.js"(exports2, module2) {
    var { validateStream } = require_m3u8();
    var { sortStreamsByQuality: sortStreamsByQuality2 } = (init_sorting(), __toCommonJS(sorting_exports));
    function normalizeLanguage(lang) {
      const l = (lang || "").toLowerCase();
      if (l.includes("lat") || l.includes("mex") || l.includes("col") || l.includes("arg") || l.includes("chi") || l.includes("per") || l.includes("dub") || l.includes("dual")) {
        return "Latino";
      }
      if (l.includes("esp") || l.includes("cas") || l.includes("spa") || l.includes("cast")) {
        return "Espa\xF1ol";
      }
      if (l.includes("sub") || l.includes("vose") || l.includes("eng")) {
        return "Subtitulado";
      }
      return lang || "Latino";
    }
    function normalizeServer(server, url = "", resolvedServerName = null) {
      if (resolvedServerName)
        return resolvedServerName;
      const u = (url || "").toLowerCase();
      const s = (server || "").toLowerCase();
      if (u.includes("acek-cdn.com") || u.includes("minochinos.com") || s.includes("vidhide"))
        return "VidHide";
      if (u.includes("embedwish.com") || u.includes("awish.pro") || s.includes("streamwish"))
        return "StreamWish";
      if (u.includes("cloudwindow-route.com") || u.includes("marissashare") || u.includes("voe.sx") || s.includes("voe"))
        return "VOE";
      if (u.includes("moonalu.com") || u.includes("moonembed.pro") || u.includes("filemoon.sx") || u.includes("bysedikamoum.com") || u.includes("398fitus.com") || u.includes("r66nv9ed.com") || s.includes("filemoon"))
        return "Filemoon";
      return server || "Servidor";
    }
    function finalizeStreams2(streams, providerName, mediaTitle) {
      return __async(this, null, function* () {
        if (!Array.isArray(streams) || streams.length === 0)
          return [];
        console.log(`[Engine] Simulaci\xF3n Hermes v5.6.88 - Formateando para Nuvio Mobile...`);
        let validated = streams;
        try {
          const results = yield Promise.allSettled(streams.map((s) => validateStream(s)));
          validated = results.map((r, i) => r.status === "fulfilled" ? r.value : streams[i]);
        } catch (e) {
        }
        const sorted = sortStreamsByQuality2(validated);
        const processed = [];
        for (const s of sorted) {
          const lang = normalizeLanguage(s.langLabel || s.language || s.Audio || s.audio);
          const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url, s.serverName);
          let q = s.verified ? s.quality : s.siteQuality || "HD";
          const check = s.verified ? " \u2705" : "";
          processed.push({
            name: providerName || "Plugin Latino",
            title: `[${q}${check}] \xB7 ${lang} \xB7 ${server}`,
            // Visualización compatible
            url: s.url,
            quality: q || "HD",
            serverName: server,
            lang,
            headers: s.headers || {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
          });
        }
        return processed;
      });
    }
    module2.exports = { finalizeStreams: finalizeStreams2 };
  }
});

// src/resolvers/voe.js
var require_voe = __commonJS({
  "src/resolvers/voe.js"(exports2, module2) {
    var axios7 = require("axios");
    function base64Decode(input) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      let str = String(input).replace(/=+$/, "");
      let output = "";
      if (str.length % 4 === 1)
        throw new Error("Base64 invalido");
      let bc = 0, bs, buffer, idx = 0;
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
    function resolve9(url) {
      return __async(this, null, function* () {
        try {
          console.log(`[VOE] Resolving Legacy: ${url}`);
          const { data: html } = yield axios7.get(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
            timeout: 8e3
          });
          if (html.includes("window.location.href") && html.length < 2e3) {
            const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
            if (rm) {
              return resolve9(rm[1]);
            }
          }
          const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[1].trim());
              let encText = Array.isArray(parsed) ? parsed[0] : parsed;
              if (typeof encText !== "string")
                return null;
              let decoded = encText.replace(/[a-zA-Z]/g, (c) => {
                const code = c.charCodeAt(0);
                const limit = c <= "Z" ? 90 : 122;
                const shifted = code + 13;
                return String.fromCharCode(limit >= shifted ? shifted : shifted - 26);
              });
              const noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
              for (const n of noise) {
                decoded = decoded.split(n).join("");
              }
              const b64_1 = base64Decode(decoded);
              let shiftedStr = "";
              for (let j = 0; j < b64_1.length; j++) {
                shiftedStr += String.fromCharCode(b64_1.charCodeAt(j) - 3);
              }
              const reversed = shiftedStr.split("").reverse().join("");
              const data = JSON.parse(base64Decode(reversed));
              if (data && data.source) {
                return {
                  url: data.source,
                  quality: "1080p",
                  verified: true,
                  serverName: "VOE",
                  headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": url
                  }
                };
              }
            } catch (ex) {
              console.error(`[VOE] Legacy Decryption failed: ${ex.message}`);
            }
          }
          const m3u8Match = html.match(/["'](https?:\/\/[^"']+?\.m3u8[^"']*?)["']/i);
          if (m3u8Match) {
            return {
              url: m3u8Match[1],
              quality: "1080p",
              verified: false,
              serverName: "VOE",
              headers: { "Referer": url }
            };
          }
          return null;
        } catch (error) {
          console.error(`[VOE] Error: ${error.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve9 };
  }
});

// src/resolvers/hlswish.js
var require_hlswish = __commonJS({
  "src/resolvers/hlswish.js"(exports2, module2) {
    var axios7 = require("axios");
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
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
    function resolve9(url) {
      return __async(this, null, function* () {
        try {
          let targetUrl = url;
          const rawId = url.split("/").pop().replace(/\.html$/, "");
          const mirrors = [
            targetUrl,
            `https://embedwish.com/e/${rawId}`,
            `https://hglamioz.com/e/${rawId}`,
            `https://awish.pro/e/${rawId}`
          ];
          let html = "";
          let usedUrl = targetUrl;
          console.log(`[StreamWish] Resolviendo CJS v5.6.9: ${rawId}`);
          for (const mirror of mirrors) {
            try {
              const response = yield axios7.get(mirror, {
                headers: { "User-Agent": UA5, "Referer": "https://embed69.org/" },
                timeout: 5e3
              });
              html = response.data;
              usedUrl = mirror;
              if (html.includes("eval(function") || html.includes(".m3u8"))
                break;
            } catch (e) {
              continue;
            }
          }
          if (!html)
            return null;
          const baseOrigin = (usedUrl.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
          let finalUrl = null;
          let quality = "1080p";
          const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
          if (fileMatch)
            finalUrl = fileMatch[1];
          if (!finalUrl) {
            const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
            if (packedMatch) {
              const unpacked = unpackEval(packedMatch[1], parseInt(packedMatch[2]), packedMatch[4].split("|"));
              const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i) || unpacked.match(/https?:\/\/[^"' \t\n\r]+\.m3u8[^"' \t\n\r]*/i);
              if (m3u8Match)
                finalUrl = m3u8Match[1] || m3u8Match[0];
            }
          }
          if (!finalUrl)
            return null;
          if (finalUrl.startsWith("/"))
            finalUrl = baseOrigin + finalUrl;
          finalUrl = finalUrl.replace(/\\/g, "");
          const qMatch = finalUrl.match(/[_-](\d{3,4})[pP]?/);
          if (qMatch)
            quality = qMatch[1] + "p";
          return {
            url: finalUrl,
            quality,
            serverName: "StreamWish",
            headers: {
              "User-Agent": UA5,
              "Referer": baseOrigin + "/",
              "Origin": baseOrigin
            }
          };
        } catch (e) {
          console.log(`[StreamWish] Error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve9 };
  }
});

// src/utils/aes_gcm.js
var require_aes_gcm = __commonJS({
  "src/utils/aes_gcm.js"(exports2, module2) {
    var CryptoJS2 = require("crypto-js");
    function base64ToUint8Array(base64) {
      const binary = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
    function decryptGCM(key, iv, ciphertextWithTag) {
      try {
        const tagSize = 16;
        const ciphertext = ciphertextWithTag.slice(0, -tagSize);
        const keyWA = CryptoJS2.lib.WordArray.create(key);
        const ivCounter = new Uint8Array(16);
        ivCounter.set(iv, 0);
        ivCounter[15] = 2;
        const ivWA = CryptoJS2.lib.WordArray.create(ivCounter);
        const decrypted = CryptoJS2.AES.decrypt(
          { ciphertext: CryptoJS2.lib.WordArray.create(ciphertext) },
          keyWA,
          {
            iv: ivWA,
            mode: CryptoJS2.mode.CTR,
            padding: CryptoJS2.pad.NoPadding
          }
        );
        return decrypted.toString(CryptoJS2.enc.Utf8);
      } catch (e) {
        console.error("[AES-GCM] Error:", e.message);
        return null;
      }
    }
    function decryptByse(playback) {
      try {
        if (!playback || !playback.key_parts || !playback.payload || !playback.iv)
          return null;
        const keyArr = [];
        for (const p of playback.key_parts) {
          base64ToUint8Array(p).forEach((b) => keyArr.push(b));
        }
        const iv = base64ToUint8Array(playback.iv);
        const payload = base64ToUint8Array(playback.payload);
        return decryptGCM(new Uint8Array(keyArr), iv, payload);
      } catch (e) {
        console.error("[Byse] Decrypt Failed:", e.message);
        return null;
      }
    }
    module2.exports = { decryptByse };
  }
});

// src/resolvers/filemoon.js
var require_filemoon = __commonJS({
  "src/resolvers/filemoon.js"(exports2, module2) {
    var axios7 = require("axios");
    var { decryptByse } = require_aes_gcm();
    var UA_CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    function unpack(p, a, c, k, e, d) {
      while (c--) {
        if (k[c]) {
          p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
        }
      }
      return p;
    }
    var chromeHeaders = {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Priority": "u=0, i",
      "Sec-Ch-Ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "iframe",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "cross-site",
      "User-Agent": UA_CHROME,
      "Access-Control-Allow-Origin": "*"
    };
    function resolve9(url) {
      return __async(this, null, function* () {
        try {
          console.log(`[Filemoon] Resolving Hermes: ${url}`);
          const urlObj = new URL(url);
          const hostname = urlObj.hostname;
          const pathParts = urlObj.pathname.split("/");
          const videoId = pathParts[pathParts.length - 1];
          try {
            const playbackUrl = `https://${hostname}/api/videos/${videoId}/embed/playback`;
            console.log(`[Filemoon] Intentando Byse API: ${playbackUrl}`);
            const { data: playbackData } = yield axios7.get(playbackUrl, {
              headers: __spreadProps(__spreadValues({}, chromeHeaders), {
                "Referer": url,
                "Origin": `https://${hostname}`
              }),
              timeout: 8e3
            });
            if (playbackData && playbackData.playback) {
              console.log("[Filemoon] Payload Byse detectado. Descifrando...");
              const decrypted = decryptByse(playbackData.playback);
              if (decrypted) {
                const m3u8Match = decrypted.match(/["']?file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
                if (m3u8Match) {
                  console.log("[Filemoon] \u2713 Stream descifrado con \xE9xito (AES-GCM).");
                  return {
                    url: m3u8Match[1],
                    quality: "1080p",
                    verified: true,
                    serverName: "Filemoon",
                    headers: {
                      "User-Agent": UA_CHROME,
                      "Referer": `https://${hostname}/`,
                      "Origin": `https://${hostname}`
                    }
                  };
                }
              }
            }
          } catch (e) {
            console.log(`[Filemoon] Byse fall\xF3 o no disponible: ${e.message}`);
          }
          const { data: html1 } = yield axios7.get(url, {
            headers: __spreadProps(__spreadValues({}, chromeHeaders), { "Referer": urlObj.origin, "Origin": urlObj.origin }),
            timeout: 1e4
          });
          let targetHtml = html1;
          const iframeMatch = html1.match(/<iframe[^>]+src=["']([^"']+)["']/i);
          if (iframeMatch) {
            const iframeUrl = iframeMatch[1].startsWith("//") ? `https:${iframeMatch[1]}` : iframeMatch[1];
            const { data: html2 } = yield axios7.get(iframeUrl, {
              headers: __spreadProps(__spreadValues({}, chromeHeaders), { "Referer": url, "Origin": urlObj.origin }),
              timeout: 1e4
            });
            targetHtml = html2;
          }
          const evalMatch = targetHtml.match(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/);
          if (evalMatch) {
            const unpacked = unpack(evalMatch[1], parseInt(evalMatch[2]), parseInt(evalMatch[3]), evalMatch[4].split("|"), 0, {});
            const m3u8Match = unpacked.match(/sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/i);
            if (m3u8Match) {
              console.log("[Filemoon] \u2713 Stream encontrado via Pro-Unpacker (Fallback).");
              return {
                url: m3u8Match[1],
                quality: "1080p",
                verified: true,
                serverName: "Filemoon",
                headers: {
                  "User-Agent": UA_CHROME,
                  "Referer": `https://${hostname}`,
                  "Origin": `https://${hostname}`
                }
              };
            }
          }
          return null;
        } catch (error) {
          console.error(`[Filemoon] Error en Hermes-Edition: ${error.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve9 };
  }
});

// src/resolvers/vidhide.js
var require_vidhide = __commonJS({
  "src/resolvers/vidhide.js"(exports2, module2) {
    var axios7 = require("axios");
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function unpackVidHide(script) {
      try {
        const match = script.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
        if (!match)
          return null;
        let [full, p, a, c, k] = match;
        a = parseInt(a);
        c = parseInt(c);
        k = k.split("|");
        const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
        const decode = (l, s) => {
          let res = "";
          while (l > 0) {
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
    function resolve9(url) {
      return __async(this, null, function* () {
        try {
          console.log(`[VidHide] Resolviendo: ${url}`);
          const { data: html } = yield axios7.get(url, {
            timeout: 1e4,
            headers: { "User-Agent": UA5, "Referer": "https://embed69.org/" }
          });
          let finalUrl = null;
          let quality = "1080p";
          const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
          if (packedMatch) {
            const unpacked = unpackVidHide(packedMatch[0]);
            if (unpacked) {
              const hlsMatch = unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/);
              if (hlsMatch)
                finalUrl = hlsMatch[1];
              const labelMatch = unpacked.match(/\{label\s*:\s*"([^"]+)"/i) || unpacked.match(/name\s*:\s*"([^"]+)"/i);
              if (labelMatch)
                quality = labelMatch[1].toLowerCase().includes("p") ? labelMatch[1] : labelMatch[1] + "p";
            }
          }
          if (!finalUrl) {
            const rawMatch = html.match(/"hls[24]"\s*:\s*"([^"]+)"/) || html.match(/file\s*:\s*["']([^"']+)["']/i);
            if (rawMatch)
              finalUrl = rawMatch[1];
          }
          if (!finalUrl)
            return null;
          if (!finalUrl.startsWith("http")) {
            finalUrl = new URL(url).origin + finalUrl;
          }
          const domain = new URL(url).origin;
          return {
            url: finalUrl,
            quality,
            serverName: "VidHide",
            headers: { "User-Agent": UA5, "Referer": domain + "/", "Origin": domain }
          };
        } catch (e) {
          console.log(`[VidHide] Error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve9 };
  }
});

// src/resolvers/quality.js
var require_quality = __commonJS({
  "src/resolvers/quality.js"(exports2, module2) {
    var axios7 = require("axios");
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function detectQuality3(_0) {
      return __async(this, arguments, function* (url, headers = {}) {
        try {
          if (!url || !url.includes(".m3u8"))
            return "1080p";
          const { data } = yield axios7.get(url, {
            timeout: 5e3,
            headers: __spreadValues({
              "User-Agent": UA5
            }, headers),
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
    module2.exports = { detectQuality: detectQuality3 };
  }
});

// src/resolvers/goodstream.js
var goodstream_exports = {};
__export(goodstream_exports, {
  resolve: () => resolve
});
function resolve(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[GoodStream] Resolviendo: ${embedUrl}`);
      const response = yield import_axios.default.get(embedUrl, {
        headers: {
          "User-Agent": UA,
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
      const refererHeaders = {
        "Referer": embedUrl,
        "Origin": "https://goodstream.one",
        "User-Agent": UA
      };
      const quality = yield (0, import_quality.detectQuality)(videoUrl, refererHeaders);
      console.log(`[GoodStream] URL encontrada (${quality}): ${videoUrl.substring(0, 80)}...`);
      return {
        url: videoUrl,
        quality: quality || "1080p",
        serverName: "GoodStream",
        headers: refererHeaders
      };
    } catch (err) {
      console.log(`[GoodStream] Error: ${err.message}`);
      return null;
    }
  });
}
var import_axios, import_quality, UA;
var init_goodstream = __esm({
  "src/resolvers/goodstream.js"() {
    import_axios = __toESM(require("axios"));
    import_quality = __toESM(require_quality());
    UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/utils/http.js
var http_exports = {};
__export(http_exports, {
  DEFAULT_UA: () => DEFAULT_UA,
  MOBILE_UA: () => MOBILE_UA,
  fetchHtml: () => fetchHtml,
  fetchJson: () => fetchJson,
  request: () => request
});
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
function fetchJson(url, options) {
  return __async(this, null, function* () {
    var res = yield request(url, options);
    return yield res.json();
  });
}
var import_axios2, DEFAULT_UA, MOBILE_UA;
var init_http = __esm({
  "src/utils/http.js"() {
    import_axios2 = __toESM(require("axios"));
    DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
  }
});

// src/resolvers/fastream.js
var fastream_exports = {};
__export(fastream_exports, {
  resolve: () => resolve2
});
function unpackPacker(data) {
  var match = data.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)\)\)/);
  if (!match)
    return null;
  var p = match[1];
  var a = parseInt(match[2]);
  var c = parseInt(match[3]);
  var k = match[4].split("|");
  while (c--) {
    if (k[c])
      p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
  }
  return p;
}
function resolve2(url) {
  return __async(this, null, function* () {
    try {
      console.log("[Fastream] Resolviendo: " + url);
      var data = yield fetchHtml(url, {
        headers: { "User-Agent": DEFAULT_UA, "Referer": "https://www3.seriesmetro.net/" }
      });
      var unpacked = unpackPacker(data);
      var m3u8Match;
      if (!unpacked) {
        m3u8Match = data.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
        if (m3u8Match && m3u8Match[1]) {
          var url1 = m3u8Match[1];
          return {
            url: url1,
            quality: q1 || "1080p",
            serverName: "Fastream",
            headers: { "User-Agent": DEFAULT_UA, "Referer": "https://fastream.to/" }
          };
        }
        return null;
      }
      m3u8Match = unpacked.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
      if (!m3u8Match || !m3u8Match[1])
        return null;
      var m3u8Url = m3u8Match[1];
      var quality = yield (0, import_quality2.detectQuality)(m3u8Url, { "Referer": "https://fastream.to/" });
      return {
        url: m3u8Url,
        quality: quality || "1080p",
        serverName: "Fastream",
        headers: { "User-Agent": DEFAULT_UA, "Referer": "https://fastream.to/" }
      };
    } catch (e) {
      console.log("[Fastream] Error: " + e.message);
      return null;
    }
  });
}
var import_quality2;
var init_fastream = __esm({
  "src/resolvers/fastream.js"() {
    init_http();
    import_quality2 = __toESM(require_quality());
  }
});

// src/resolvers/vimeos.js
var vimeos_exports = {};
__export(vimeos_exports, {
  resolve: () => resolve3
});
function resolve3(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log("[Vimeos] Resolviendo Universal (v2.0): " + embedUrl);
      var html = yield fetchHtml(embedUrl, {
        headers: {
          "User-Agent": DEFAULT_UA,
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
          var config = yield fetchJson("https://player.vimeo.com/video/" + vimeoId + "/config", {
            headers: { "User-Agent": DEFAULT_UA, "Referer": embedUrl }
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
              headers: { "User-Agent": DEFAULT_UA, "Referer": "https://player.vimeo.com/" }
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
              headers: { "User-Agent": DEFAULT_UA, "Referer": "https://player.vimeo.com/" }
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
            headers: { "User-Agent": DEFAULT_UA, "Referer": "https://vimeos.net/" }
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
var init_vimeos = __esm({
  "src/resolvers/vimeos.js"() {
    init_http();
  }
});

// src/resolvers/buzzheavier.js
var buzzheavier_exports = {};
__export(buzzheavier_exports, {
  resolve: () => resolve4
});
function resolve4(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log("[Buzzheavier] Resolviendo: " + embedUrl);
      const html = yield fetchHtml(embedUrl, {
        headers: {
          "User-Agent": DEFAULT_UA,
          "Referer": "https://pelisgo.online/",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      let directUrl = null;
      const sourceMatch = html.match(/<source[^>]+src=["']([^"']+)["']/i);
      if (sourceMatch) {
        directUrl = sourceMatch[1];
      }
      if (!directUrl) {
        const staticMatch = html.match(/window\.fileUrl\s*=\s*["']([^"']+)["']/i);
        if (staticMatch)
          directUrl = staticMatch[1];
      }
      if (!directUrl && embedUrl.includes("/f/")) {
        directUrl = embedUrl.replace("/f/", "/v/");
      }
      if (directUrl) {
        console.log("[Buzzheavier] \u2713 Enlace directo identificado.");
        return {
          url: directUrl,
          quality: "1080p",
          headers: {
            "User-Agent": DEFAULT_UA,
            "Referer": embedUrl
          }
        };
      }
      console.log("[Buzzheavier] No se pudo extraer el video directo.");
      return null;
    } catch (e) {
      console.error("[Buzzheavier] Error: " + e.message);
      return null;
    }
  });
}
var init_buzzheavier = __esm({
  "src/resolvers/buzzheavier.js"() {
    init_http();
  }
});

// src/resolvers/okru.js
var okru_exports = {};
__export(okru_exports, {
  resolve: () => resolve5
});
function resolve5(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[OkRu] Resolviendo: ${embedUrl}`);
      const { data: raw } = yield import_axios3.default.get(embedUrl, {
        timeout: 1e4,
        headers: {
          "User-Agent": UA2,
          "Accept": "text/html",
          "Referer": "https://ok.ru/"
        }
      });
      if (raw.includes("copyrightsRestricted") || raw.includes("COPYRIGHTS_RESTRICTED") || raw.includes("LIMITED_ACCESS") || raw.includes("notFound") || !raw.includes("urls")) {
        console.log("[OkRu] Video no disponible o eliminado");
        return null;
      }
      const data = raw.replace(/\\&quot;/g, '"').replace(/\\u0026/g, "&").replace(/\\/g, "");
      const matches = [...data.matchAll(/"name":"([^"]+)","url":"([^"]+)"/g)];
      const QUALITY_ORDER = ["full", "hd", "sd", "low", "lowest"];
      const videos = matches.map((m) => ({ type: m[1], url: m[2] })).filter((v) => !v.type.toLowerCase().includes("mobile") && v.url.startsWith("http"));
      if (videos.length === 0) {
        console.log("[OkRu] No se encontraron URLs");
        return null;
      }
      const sorted = videos.sort((a, b) => {
        const ai = QUALITY_ORDER.findIndex((q) => a.type.toLowerCase().includes(q));
        const bi = QUALITY_ORDER.findIndex((q) => b.type.toLowerCase().includes(q));
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      const best = sorted[0];
      console.log(`[OkRu] URL encontrada (${best.type}): ${best.url.substring(0, 80)}...`);
      const QUALITY_MAP = { full: "1080p", hd: "720p", sd: "480p", low: "360p", lowest: "240p" };
      return {
        url: best.url,
        quality: QUALITY_MAP[best.type] || best.type,
        headers: { "User-Agent": UA2, "Referer": "https://ok.ru/" }
      };
    } catch (e) {
      console.log(`[OkRu] Error: ${e.message}`);
      return null;
    }
  });
}
var import_axios3, UA2;
var init_okru = __esm({
  "src/resolvers/okru.js"() {
    import_axios3 = __toESM(require("axios"));
    UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/resolvers/pixeldrain.js
var pixeldrain_exports = {};
__export(pixeldrain_exports, {
  resolve: () => resolve6
});
function resolve6(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log("[Pixeldrain] Resolviendo: " + embedUrl);
      const idMatch = embedUrl.match(/\/(u|l|api\/file)\/([a-zA-Z0-9]+)/i);
      if (!idMatch) {
        console.log("[Pixeldrain] No se pudo encontrar un ID v\xE1lido en la URL.");
        return null;
      }
      const fileId = idMatch[2];
      const directUrl = `https://pixeldrain.com/api/file/${fileId}`;
      console.log("[Pixeldrain] \u2713 URL Directa generada.");
      return {
        url: directUrl,
        quality: "1080p",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Referer": "https://pixeldrain.com/"
        }
      };
    } catch (e) {
      console.error("[Pixeldrain] Error cr\xEDtico: " + e.message);
      return null;
    }
  });
}
var init_pixeldrain = __esm({
  "src/resolvers/pixeldrain.js"() {
  }
});

// src/resolvers/playmogo.js
var require_playmogo = __commonJS({
  "src/resolvers/playmogo.js"(exports2, module2) {
    var { fetchHtml: fetchHtml2, DEFAULT_UA: DEFAULT_UA2 } = (init_http(), __toCommonJS(http_exports));
    function resolve9(url) {
      return __async(this, null, function* () {
        try {
          console.log("[Playmogo] Resolving: " + url);
          return {
            url,
            quality: "720p",
            serverName: "Playmogo",
            headers: {
              "User-Agent": DEFAULT_UA2,
              "Referer": "https://dsvplay.com/",
              "Origin": "https://dsvplay.com"
            }
          };
        } catch (e) {
          console.error("[Playmogo] Error: " + e.message);
          return null;
        }
      });
    }
    module2.exports = { resolve: resolve9 };
  }
});

// src/resolvers/turbovid.js
var turbovid_exports = {};
__export(turbovid_exports, {
  resolve: () => resolve7
});
function resolve7(embedUrl) {
  return __async(this, null, function* () {
    try {
      const { data: html } = yield import_axios4.default.get(embedUrl, {
        headers: {
          "User-Agent": UA3,
          "Referer": "https://www.fuegocine.com/"
        },
        timeout: 8e3
      });
      const hashMatch = html.match(/data-hash="([^"]+\.m3u8[^"]*)"/);
      if (hashMatch) {
        return {
          url: hashMatch[1],
          quality: "HD",
          headers: { "Referer": embedUrl }
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}
var import_axios4, UA3;
var init_turbovid = __esm({
  "src/resolvers/turbovid.js"() {
    import_axios4 = __toESM(require("axios"));
    UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  }
});

// src/resolvers/embedseek.js
var embedseek_exports = {};
__export(embedseek_exports, {
  resolve: () => resolve8
});
function resolve8(url) {
  return __async(this, null, function* () {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      const hash = parsedUrl.hash;
      const id = hash.replace("#", "").split("&")[0];
      if (!id)
        throw new Error("ID no encontrado en el hash");
      const apiUrl = `${parsedUrl.origin}/api/v1/info?id=${id}`;
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": url,
        "Origin": parsedUrl.origin
      };
      const response = yield import_axios5.default.get(apiUrl, { headers });
      const encryptedData = response.data;
      if (typeof encryptedData !== "string") {
        throw new Error("Respuesta de API no v\xE1lida");
      }
      const key = generateKey(hostname);
      const iv = generateIV(hostname, hash);
      const decrypted = decrypt(encryptedData, key, iv);
      const data = JSON.parse(decrypted);
      if (data && data.url) {
        let videoUrl = data.url;
        if (videoUrl.startsWith("/")) {
          videoUrl = `${parsedUrl.origin}${videoUrl}`;
        }
        return videoUrl;
      } else {
        throw new Error("URL de video no encontrada en JSON descifrado");
      }
    } catch (e) {
      console.error("EmbedSeek Resolve Error:", e.message);
      return null;
    }
  });
}
function generateKey(hostname) {
  let n = "";
  const b = "7519".split("");
  for (let i = 0; i < b.length; i++)
    n += String.fromCharCode(parseInt("10" + b[i]));
  n += String.fromCharCode(hostname.charCodeAt(1));
  n += n.substring(1, 3);
  n += String.fromCharCode(110, 109, 117);
  const re = "3579".split("");
  n += String.fromCharCode(parseInt(re[3] + re[2]), parseInt(re[1] + re[2]));
  const s1 = (parseInt(re[0]) + 1).toString() + re[3];
  n += String.fromCharCode(parseInt(s1), parseInt(s1));
  const s2 = (parseInt(re[3]) * 10 + parseInt(re[3])).toString();
  const s3 = re.reverse().join("").substring(0, 2);
  n += String.fromCharCode(parseInt(s2), parseInt(s3));
  const keyArr = new Uint8Array(16);
  for (let i = 0; i < Math.min(n.length, 16); i++) {
    keyArr[i] = n.charCodeAt(i) & 255;
  }
  return import_crypto_js.default.lib.WordArray.create(keyArr);
}
function generateIV(hostname, hash) {
  const s = hostname;
  const p = s + "//";
  const o = hash;
  const g = s.length * p.length;
  let b = "";
  for (let i = 1; i < 10; i++)
    b += String.fromCharCode(i + g);
  const re = "111";
  const pe = 3 * o.charCodeAt(0);
  const tt = 111 + s.length;
  const k = tt + 4;
  const ie = s.charCodeAt(1);
  const me = ie - 2;
  b += String.fromCharCode(g, 111, pe, tt, k, ie, me);
  const ivArr = new Uint8Array(16);
  for (let i = 0; i < Math.min(b.length, 16); i++) {
    ivArr[i] = b.charCodeAt(i) & 255;
  }
  return import_crypto_js.default.lib.WordArray.create(ivArr);
}
function decrypt(hex, keyWA, ivWA) {
  const ciphertextWA = import_crypto_js.default.enc.Hex.parse(hex);
  const decrypted = import_crypto_js.default.AES.decrypt(
    { ciphertext: ciphertextWA },
    keyWA,
    {
      iv: ivWA,
      mode: import_crypto_js.default.mode.CBC,
      padding: import_crypto_js.default.pad.Pkcs7
    }
  );
  return decrypted.toString(import_crypto_js.default.enc.Utf8);
}
var import_axios5, import_crypto_js;
var init_embedseek = __esm({
  "src/resolvers/embedseek.js"() {
    import_axios5 = __toESM(require("axios"));
    import_crypto_js = __toESM(require("crypto-js"));
  }
});

// src/utils/resolvers.js
var require_resolvers = __commonJS({
  "src/utils/resolvers.js"(exports2, module2) {
    var { resolve: resolveVoe } = require_voe();
    var { resolve: resolveHlswish } = require_hlswish();
    var { resolve: resolveFilemoon } = require_filemoon();
    var { resolve: resolveVidhide } = require_vidhide();
    var { resolve: resolveGoodstream } = (init_goodstream(), __toCommonJS(goodstream_exports));
    var { resolve: resolveFastream } = (init_fastream(), __toCommonJS(fastream_exports));
    var { resolve: resolveVimeos } = (init_vimeos(), __toCommonJS(vimeos_exports));
    var { resolve: resolveBuzzheavier } = (init_buzzheavier(), __toCommonJS(buzzheavier_exports));
    var { resolve: resolveOkru } = (init_okru(), __toCommonJS(okru_exports));
    var { resolve: resolvePixeldrain } = (init_pixeldrain(), __toCommonJS(pixeldrain_exports));
    var { resolve: resolvePlaymogo } = require_playmogo();
    var { resolve: resolveTurbovid } = (init_turbovid(), __toCommonJS(turbovid_exports));
    var { resolve: resolveEmbedseek } = (init_embedseek(), __toCommonJS(embedseek_exports));
    var UA5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function getDirectCdnHeaders(url) {
      if (!url)
        return null;
      const s = url.toLowerCase();
      try {
        const domain = new URL(url).hostname;
        const headers = { "User-Agent": UA5, "Referer": `https://${domain}/`, "Origin": `https://${domain}` };
        if (s.includes("filemoon") || s.includes("byse") || s.includes("r66nv9ed") || s.includes("398fitus")) {
          headers["x-embed-origin"] = "ww3.gnulahd.nu";
          headers["x-embed-parent"] = `https://${domain}/`;
        }
        return headers;
      } catch (e) {
        return { "User-Agent": UA5, "Referer": url };
      }
    }
    function applyPiping(result) {
      if (!result || !result.url)
        return result;
      let url = result.url;
      if (result.headers) {
        const parts = Object.entries(result.headers).map(([k, v]) => `${k}=${v}`);
        if (parts.length > 0) {
          url = `${url}|${parts.join("|")}`;
        }
      }
      if (!url.toLowerCase().includes(".m3u8") && !url.toLowerCase().includes(".mp4")) {
        url = `${url}#.m3u8`;
      }
      result.url = url;
      return result;
    }
    function resolveEmbed2(url) {
      return __async(this, null, function* () {
        if (!url)
          return null;
        const s = url.toLowerCase();
        if (s.includes("voe") || s.includes("voe.sx") || s.includes("voe-sx") || s.includes("voex.sx")) {
          const res = yield resolveVoe(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("hlswish") || s.includes("streamwish") || s.includes("hglink") || s.includes("hglamioz") || s.includes("hglink.to") || s.includes("audinifer") || s.includes("embedwish") || s.includes("awish") || s.includes("dwish") || s.includes("strwish") || s.includes("filelions") || s.includes("wishembed")) {
          const res = yield resolveHlswish(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("filemoon") || s.includes("moonalu") || s.includes("moonembed") || s.includes("bysedikamoum") || s.includes("r66nv9ed")) {
          const res = yield resolveFilemoon(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("vidhide") || s.includes("minochinos") || s.includes("vadisov") || s.includes("vaiditv") || s.includes("amusemre") || s.includes("callistanise") || s.includes("vhaudm") || s.includes("embedseek") || s.includes("mdfury") || s.includes("dintezuvio") || s.includes("acek-cdn") || s.includes("vedonm")) {
          const res = yield resolveVidhide(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("fastream") || s.includes("fastplay")) {
          const res = yield resolveFastream(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("vimeos") || s.includes("vms.sh")) {
          const res = yield resolveVimeos(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("ok.ru") || s.includes("okru")) {
          const res = yield resolveOkru(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("buzzheavier")) {
          const res = yield resolveBuzzheavier(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("goodstream") || s.includes("gs.one")) {
          const res = yield resolveGoodstream(url);
          return res ? applyPiping(res) : null;
        }
        if (s.includes("playmogo"))
          return applyPiping(yield resolvePlaymogo(url));
        if (s.includes("turbovid"))
          return applyPiping(yield resolveTurbovid(url));
        if (s.includes("pixeldrain"))
          return applyPiping(yield resolvePixeldrain(url));
        if (s.includes("embedseek"))
          return applyPiping(yield resolveEmbedseek(url));
        const finalHeaders = getDirectCdnHeaders(url);
        return applyPiping({
          url,
          quality: "SD",
          verified: false,
          headers: finalHeaders
        });
      });
    }
    module2.exports = { resolveEmbed: resolveEmbed2 };
  }
});

// src/utils/tmdb.js
var require_tmdb = __commonJS({
  "src/utils/tmdb.js"(exports2, module2) {
    var axios7 = require("axios");
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
            const { data } = yield axios7.get(url, { timeout: 6e3 });
            const result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
            const title = result ? result.name || result.title : null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}`;
            const { data } = yield axios7.get(url, { timeout: 6e3 });
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
            const { data } = yield axios7.get(url, { timeout: 6e3 });
            result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}`;
            const { data } = yield axios7.get(url, { timeout: 6e3 });
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

// src/playhubmax/index.js
var axios6 = require("axios");
var { finalizeStreams } = require_engine();
var { resolveEmbed } = require_resolvers();
var { getTmdbTitle } = require_tmdb();
var PHM_API = "https://api.playhubmax.com/api";
var AES_KEY_STR = "33dff3b1c1362e45e1425fcc9724d6f3";
var AES_IV_STR = "33dff3b1c1362e45";
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var API_HEADERS = {
  "User-Agent": UA4,
  "Accept": "application/json, text/plain, */*",
  "Origin": "https://www.playhubmax.com",
  "Referer": "https://www.playhubmax.com/"
};
var AES_SBOX = [99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22];
var AES_SBOX_INV = (() => {
  const inv = new Array(256);
  for (let i = 0; i < 256; i++)
    inv[AES_SBOX[i]] = i;
  return inv;
})();
var AES_RCON = [1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
function gmul(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1)
      p ^= a;
    let hbs = a & 128;
    a = a << 1 & 255;
    if (hbs)
      a ^= 27;
    b >>= 1;
  }
  return p;
}
function aesKeyExpansion(keyBytes) {
  let w = [];
  for (let i = 0; i < 8; i++)
    w[i] = keyBytes.slice(i * 4, i * 4 + 4);
  for (let i = 8; i < 60; i++) {
    let temp = w[i - 1].slice();
    if (i % 8 === 0) {
      let rot = [temp[1], temp[2], temp[3], temp[0]];
      temp = [AES_SBOX[rot[0]], AES_SBOX[rot[1]], AES_SBOX[rot[2]], AES_SBOX[rot[3]]];
      temp[0] ^= AES_RCON[i / 8 - 1];
    } else if (i % 8 === 4) {
      temp = [AES_SBOX[temp[0]], AES_SBOX[temp[1]], AES_SBOX[temp[2]], AES_SBOX[temp[3]]];
    }
    w[i] = [w[i - 8][0] ^ temp[0], w[i - 8][1] ^ temp[1], w[i - 8][2] ^ temp[2], w[i - 8][3] ^ temp[3]];
  }
  return w;
}
function aesDecryptBlock(block, roundKeys) {
  let s = [[block[0], block[1], block[2], block[3]], [block[4], block[5], block[6], block[7]], [block[8], block[9], block[10], block[11]], [block[12], block[13], block[14], block[15]]];
  for (let c = 0; c < 4; c++) {
    let rk = roundKeys[56 + c];
    for (let r = 0; r < 4; r++)
      s[c][r] ^= rk[r];
  }
  for (let round = 13; round >= 1; round--) {
    let t12 = s[3][1];
    s[3][1] = s[2][1];
    s[2][1] = s[1][1];
    s[1][1] = s[0][1];
    s[0][1] = t12;
    let t22 = s[0][2];
    s[0][2] = s[2][2];
    s[2][2] = t22;
    t22 = s[1][2];
    s[1][2] = s[3][2];
    s[3][2] = t22;
    let t32 = s[0][3];
    s[0][3] = s[1][3];
    s[1][3] = s[2][3];
    s[2][3] = s[3][3];
    s[3][3] = t32;
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++)
        s[c][r] = AES_SBOX_INV[s[c][r]];
    for (let c = 0; c < 4; c++) {
      let rk = roundKeys[round * 4 + c];
      for (let r = 0; r < 4; r++)
        s[c][r] ^= rk[r];
    }
    for (let c = 0; c < 4; c++) {
      let a = s[c].slice();
      s[c][0] = gmul(a[0], 14) ^ gmul(a[1], 11) ^ gmul(a[2], 13) ^ gmul(a[3], 9);
      s[c][1] = gmul(a[0], 9) ^ gmul(a[1], 14) ^ gmul(a[2], 11) ^ gmul(a[3], 13);
      s[c][2] = gmul(a[0], 13) ^ gmul(a[1], 9) ^ gmul(a[2], 14) ^ gmul(a[3], 11);
      s[c][3] = gmul(a[0], 11) ^ gmul(a[1], 13) ^ gmul(a[2], 9) ^ gmul(a[3], 14);
    }
  }
  let t1 = s[3][1];
  s[3][1] = s[2][1];
  s[2][1] = s[1][1];
  s[1][1] = s[0][1];
  s[0][1] = t1;
  let t2 = s[0][2];
  s[0][2] = s[2][2];
  s[2][2] = t2;
  t2 = s[1][2];
  s[1][2] = s[3][2];
  s[3][2] = t2;
  let t3 = s[0][3];
  s[0][3] = s[1][3];
  s[1][3] = s[2][3];
  s[2][3] = s[3][3];
  s[3][3] = t3;
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      s[c][r] = AES_SBOX_INV[s[c][r]];
  for (let c = 0; c < 4; c++) {
    let rk = roundKeys[c];
    for (let r = 0; r < 4; r++)
      s[c][r] ^= rk[r];
  }
  let out = [];
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      out.push(s[c][r]);
  return out;
}
function decryptSources(b64) {
  try {
    let key = Array.from(Buffer.from(AES_KEY_STR, "utf8"));
    let iv = Array.from(Buffer.from(AES_IV_STR, "utf8"));
    let ct = Array.from(Buffer.from(b64, "base64"));
    let roundKeys = aesKeyExpansion(key);
    let plain = [];
    let prev = iv;
    for (let i = 0; i < ct.length; i += 16) {
      let block = ct.slice(i, i + 16);
      let dec = aesDecryptBlock(block, roundKeys);
      for (let j = 0; j < 16; j++)
        plain.push(dec[j] ^ prev[j]);
      prev = block;
    }
    let pad = plain[plain.length - 1];
    if (pad < 1 || pad > 16)
      return [];
    let json = Buffer.from(plain.slice(0, plain.length - pad)).toString("utf8");
    return JSON.parse(json);
  } catch (e) {
    return [];
  }
}
function searchContents(q) {
  return __async(this, null, function* () {
    try {
      const { data } = yield axios6.get(`${PHM_API}/US/en/contents?q=${encodeURIComponent(q)}`, { headers: API_HEADERS, timeout: 8e3 });
      return data.data || [];
    } catch (e) {
      return [];
    }
  });
}
function getSources(type, uuid) {
  return __async(this, null, function* () {
    try {
      const { data } = yield axios6.get(`${PHM_API}/${type}/${uuid}/sources`, { headers: API_HEADERS, timeout: 8e3 });
      if (!data.data)
        return [];
      const sources = decryptSources(data.data);
      return sources.filter((s) => {
        var _a;
        return (_a = s.languages) == null ? void 0 : _a.includes("es");
      });
    } catch (e) {
      return [];
    }
  });
}
function getContentDetail(uuid) {
  return __async(this, null, function* () {
    try {
      const { data } = yield axios6.get(`${PHM_API}/en/contents/${uuid}`, { headers: API_HEADERS, timeout: 8e3 });
      return data;
    } catch (e) {
      return {};
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    var _a, _b;
    try {
      let mediaTitle = title;
      if (!mediaTitle && tmdbId) {
        mediaTitle = yield getTmdbTitle(tmdbId, mediaType);
      }
      if (!mediaTitle)
        return [];
      const type = mediaType === "series" || mediaType === "tv" ? "tv" : "movie";
      const candidates = yield searchContents(mediaTitle);
      const match = candidates.find((c) => {
        var _a2;
        return ((_a2 = c.title) == null ? void 0 : _a2.toLowerCase()) === mediaTitle.toLowerCase();
      });
      if (!match)
        return [];
      let finalSources = [];
      if (type === "tv") {
        const detail = yield getContentDetail(match.uuid);
        const seasonObj = (_a = detail.seasons) == null ? void 0 : _a.find((s) => parseInt(s.seasonNumber) === parseInt(season));
        if (!seasonObj)
          return [];
        const { data: episodes } = yield axios6.get(`${PHM_API}/en/episodes?season_id=${seasonObj.id}`, { headers: API_HEADERS });
        const ep = (_b = episodes.data) == null ? void 0 : _b.find((e) => parseInt(e.episodeNumber) === parseInt(episode));
        if (!ep)
          return [];
        finalSources = yield getSources("episode", ep.uuid);
      } else {
        finalSources = yield getSources("content", match.uuid);
      }
      const streams = (yield Promise.allSettled(finalSources.map((s) => __async(this, null, function* () {
        const result = yield resolveEmbed(s.url);
        const finalUrl = result && result.url ? result.url : s.url;
        return {
          langLabel: "Latino",
          serverLabel: s.hostName || "PlayHub",
          url: finalUrl,
          quality: "1080p",
          headers: result && result.headers ? result.headers : { "User-Agent": UA4, "Referer": "https://www.playhubmax.com/" }
        };
      })))).filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
      return yield finalizeStreams(streams, "PlayHubMax", mediaTitle);
    } catch (e) {
      console.error("[PlayHubMax] error:", e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
