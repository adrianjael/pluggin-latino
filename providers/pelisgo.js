/**
 * pelisgo - Built from src/pelisgo/
 * Generated: 2026-04-07T22:55:51.513Z
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

// src/pelisgo/index.js
var import_axios6 = __toESM(require("axios"));

// src/resolvers/filemoon.js
var import_axios = __toESM(require("axios"));

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
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
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
function resolve(url) {
  return __async(this, null, function* () {
    try {
      const origin = new URL(url).origin;
      const idMatch = url.match(/\/e\/([a-zA-Z0-9]+)/);
      if (!idMatch)
        return null;
      const id = idMatch[1];
      try {
        const apiRes = yield import_axios.default.get(`https://${new URL(url).hostname}/api/videos/${id}`, {
          headers: { "User-Agent": UA, "Referer": url }
        });
        const data = yield apiRes.data;
        if (data.playback) {
          const decrypted = yield decryptByse(data.playback);
          if (decrypted && decrypted.sources) {
            const best = decrypted.sources[0];
            return { url: best.url, quality: best.height ? `${best.height}p` : "1080p", isM3U8: true, headers: { "User-Agent": UA, "Referer": origin + "/", "Origin": origin } };
          }
        }
      } catch (e) {
      }
      const res = yield import_axios.default.get(url, { headers: { "User-Agent": UA, "Referer": url } });
      const html = yield res.text();
      const fm = html.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/);
      if (fm)
        return { url: fm[1], quality: "1080p", isM3U8: true, headers: { "User-Agent": UA, "Referer": origin + "/", "Origin": origin } };
      return null;
    } catch (e) {
      return null;
    }
  });
}

// src/resolvers/voe.js
var import_axios2 = __toESM(require("axios"));
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
      const res = yield import_axios2.default.get(url, { headers: { "User-Agent": UA2 } });
      let html = yield res.text();
      if (html.includes("Redirecting") || html.length < 1500) {
        const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm) {
          const res2 = yield import_axios2.default.get(rm[1], { headers: { "User-Agent": UA2 } });
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

// src/resolvers/vimeos.js
var import_axios3 = __toESM(require("axios"));
var UA3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function resolve3(embedUrl) {
  return __async(this, null, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
      console.log(`[Vimeos] Resolviendo v\xEDa fetch: ${embedUrl}`);
      const res = yield import_axios3.default.get(embedUrl, {
        headers: {
          "User-Agent": UA3,
          "Referer": "https://vimeos.net/",
          "Accept": "text/html"
        }
      });
      const html = yield res.text();
      const vimeoIdMatch = html.match(/vimeo\.com\/video\/(\d+)/i) || embedUrl.match(/\/(\d{7,10})/);
      if (vimeoIdMatch) {
        const vimeoId = vimeoIdMatch[1];
        try {
          const configRes = yield import_axios3.default.get(`https://player.vimeo.com/video/${vimeoId}/config`, {
            headers: { "User-Agent": UA3, "Referer": embedUrl }
          });
          const config = yield configRes.data;
          const hlsUrl = (_e = (_d = (_c = (_b = (_a = config.request) == null ? void 0 : _a.files) == null ? void 0 : _b.hls) == null ? void 0 : _c.cdns) == null ? void 0 : _d.default) == null ? void 0 : _e.url;
          if (hlsUrl) {
            return {
              url: hlsUrl,
              quality: "1080p",
              isM3U8: true,
              headers: { "User-Agent": UA3, "Referer": "https://player.vimeo.com/" }
            };
          }
          const progressive = (_g = (_f = config.request) == null ? void 0 : _f.files) == null ? void 0 : _g.progressive;
          if (progressive && progressive.length > 0) {
            const best = progressive.sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0))[0];
            return {
              url: best.url,
              quality: best.quality ? `${best.quality}p` : "1080p",
              headers: { "User-Agent": UA3, "Referer": "https://player.vimeo.com/" }
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
            headers: { "User-Agent": UA3, "Referer": "https://vimeos.net/" }
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

// src/resolvers/hlswish.js
var import_axios4 = __toESM(require("axios"));
var UA4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
      const origin = new URL(targetUrl).origin;
      const res = yield import_axios4.default.get(targetUrl, {
        headers: { "User-Agent": UA4, "Referer": origin + "/", "Origin": origin }
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
        return { url: finalUrl, quality: "1080p", headers: { "User-Agent": UA4, "Referer": origin + "/" } };
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}

// src/resolvers/vidhide.js
var import_axios5 = __toESM(require("axios"));
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
      const origin = new URL(url).origin;
      const res = yield import_axios5.default.get(url, {
        headers: { "User-Agent": UA5, "Referer": origin + "/" }
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
        headers: { "User-Agent": UA5, "Referer": origin + "/", "Origin": origin }
      };
    } catch (e) {
      return null;
    }
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
  if (norm1.length > 5 && norm2.length > 5) {
    const ratio = Math.min(norm1.length, norm2.length) / Math.max(norm1.length, norm2.length);
    if ((norm2.includes(norm1) || norm1.includes(norm2)) && ratio > 0.8) {
      return 0.9;
    }
  }
  const words1 = new Set(norm1.split(/\s+/).filter((w) => w.length > 2));
  const words2 = new Set(norm2.split(/\s+/).filter((w) => w.length > 2));
  if (words1.size === 0 || words2.size === 0) {
    return norm1 === norm2 ? 1 : norm1.includes(norm2) || norm2.includes(norm1) ? 0.5 : 0;
  }
  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = /* @__PURE__ */ new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

// src/pelisgo/index.js
var BASE = "https://pelisgo.online";
var UA6 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var SERVER_LABELS = {
  "filemoon": "Filemoon",
  "f75s": "Filemoon",
  "voe": "VOE",
  "vimeos": "Vimeos",
  "streamwish": "StreamWish",
  "hglink": "StreamWish",
  "sw": "StreamWish",
  "wishembed": "StreamWish",
  "vidhide": "VidHide",
  "minochinos": "VidHide",
  "dintezuvio": "VidHide",
  "buzzheavier": "BuzzHeavier",
  "pixeldrain": "PixelDrain"
};
var COMMON_HEADERS = {
  "User-Agent": UA6,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Referer": BASE
};
function fetchText(_0) {
  return __async(this, arguments, function* (url, referer = BASE) {
    try {
      const headers = __spreadProps(__spreadValues({}, COMMON_HEADERS), { Referer: referer });
      const res = yield import_axios6.default.get(url, { headers });
      return yield res.text();
    } catch (e) {
      return "";
    }
  });
}
function resolvePelisGoDownload(id) {
  return __async(this, null, function* () {
    try {
      const res = yield import_axios6.default.get(`https://pelisgo.online/api/download/${id}`, { headers: COMMON_HEADERS });
      const data = yield res.data;
      return data.url || null;
    } catch (e) {
      return null;
    }
  });
}
function getOnlineStreams(rawHtml) {
  return __async(this, null, function* () {
    const streamPromises = [];
    const seenUrls = /* @__PURE__ */ new Set();
    const vMatch = rawHtml.match(/videoLinks[\\"' ]+:\[(.*?)\]/);
    if (vMatch) {
      const urlRegex = /url[\\"' ]+:[\\"' ]+([^\s"'\\]+)[\\"' ]+/gi;
      let m;
      while ((m = urlRegex.exec(vMatch[1])) !== null) {
        const url = m[1].replace(/\\/g, "");
        if (seenUrls.has(url))
          continue;
        seenUrls.add(url);
        streamPromises.push((() => __async(this, null, function* () {
          const s = url.toLowerCase();
          let resolved = null;
          let srvKey = "unknown";
          if (s.includes("filemoon") || s.includes("f75s")) {
            srvKey = "filemoon";
            resolved = yield resolve(url);
          } else if (s.includes("voe")) {
            srvKey = "voe";
            resolved = yield resolve2(url);
          } else if (s.includes("vimeos")) {
            srvKey = "vimeos";
            resolved = yield resolve3(url);
          } else if (s.includes("streamwish") || s.includes("hglink") || s.includes("wishembed")) {
            srvKey = "streamwish";
            resolved = yield resolve4(url);
          } else if (s.includes("vidhide") || s.includes("minochinos") || s.includes("dintezuvio")) {
            srvKey = "vidhide";
            resolved = yield resolve5(url);
          }
          if (resolved && resolved.url) {
            return {
              name: "PelisGo",
              title: `${resolved.quality || "1080p"} \xB7 Latino \xB7 ${SERVER_LABELS[srvKey] || srvKey}`,
              url: resolved.url,
              quality: resolved.quality || "1080p",
              isM3U8: true,
              headers: resolved.headers || { "User-Agent": UA6, "Referer": url }
            };
          }
          return null;
        }))());
      }
    }
    const dlRegex = /\{[^{}]*?server[\\"' ]+:[\\"' ]+(Buzzheavier|Pixeldrain)[^{}]*?url[\\"' ]+:[\\"' ]+([^"'\s]+)[^}]*?\}/gi;
    let dm;
    while ((dm = dlRegex.exec(rawHtml)) !== null) {
      const server = dm[1];
      const maybeUrl = dm[2].replace(/\\/g, "");
      streamPromises.push((() => __async(this, null, function* () {
        let direct = maybeUrl;
        if (maybeUrl.includes("/download/")) {
          const id = maybeUrl.split("/").pop().replace(/[^\w]/g, "");
          direct = yield resolvePelisGoDownload(id);
        }
        if (direct && direct.startsWith("http")) {
          return {
            name: "PelisGo",
            title: `1080p \xB7 Latino \xB7 ${SERVER_LABELS[server.toLowerCase()] || server}`,
            url: direct,
            quality: "1080p"
          };
        }
        return null;
      }))());
    }
    const settledResults = yield Promise.allSettled(streamPromises);
    return settledResults.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      const type = mediaType === "tv" || mediaType === "series" ? "tv" : "movie";
      const searchUrl = `${BASE}/search?q=${encodeURIComponent(title)}`;
      const htmlSearch = yield fetchText(searchUrl);
      const re = /href="(\/(movies|series)\/([a-z0-9\-]+))"/gi;
      const paths = [];
      let m;
      while ((m = re.exec(htmlSearch)) !== null) {
        if (m[1].includes("/temporada/") || m[1].includes("/episodio/"))
          continue;
        if (type === "movie" && m[2] === "movies" || type === "tv" && m[2] === "series")
          paths.push(m[1]);
      }
      if (paths.length === 0)
        return [];
      const best = paths[0];
      const slug = best.split("/").pop();
      if (calculateSimilarity(title, slug.replace(/-/g, " ")) < 0.3)
        return [];
      const pageUrl = type === "movie" ? `${BASE}/movies/${slug}` : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;
      const pageHtml = yield fetchText(pageUrl);
      return yield getOnlineStreams(pageHtml);
    } catch (e) {
      return [];
    }
  });
}
module.exports = { getStreams };
