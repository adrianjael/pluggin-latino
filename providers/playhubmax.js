/**
 * playhubmax - Built from src/playhubmax/
 * Generated: 2026-04-08T21:48:21.612Z
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

// src/playhubmax/index.js
var playhubmax_exports = {};
__export(playhubmax_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(playhubmax_exports);
var import_axios2 = __toESM(require("axios"));

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

// src/playhubmax/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var PHM_API = "https://api.playhubmax.com/api";
var AES_KEY_STR = "33dff3b1c1362e45e1425fcc9724d6f3";
var AES_IV_STR = "33dff3b1c1362e45";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var API_HEADERS = {
  "User-Agent": UA,
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
      const { data } = yield import_axios2.default.get(`${PHM_API}/US/en/contents?q=${encodeURIComponent(q)}`, { headers: API_HEADERS, timeout: 8e3 });
      return data.data || [];
    } catch (e) {
      return [];
    }
  });
}
function getSources(type, uuid) {
  return __async(this, null, function* () {
    try {
      const { data } = yield import_axios2.default.get(`${PHM_API}/${type}/${uuid}/sources`, { headers: API_HEADERS, timeout: 8e3 });
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
      const { data } = yield import_axios2.default.get(`${PHM_API}/en/contents/${uuid}`, { headers: API_HEADERS, timeout: 8e3 });
      return data;
    } catch (e) {
      return {};
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    var _a, _b;
    try {
      const type = mediaType === "series" || mediaType === "tv" ? "tv" : "movie";
      const { data: tmdbInfo } = yield import_axios2.default.get(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`);
      const title = type === "movie" ? tmdbInfo.title : tmdbInfo.name;
      if (!title)
        return [];
      const candidates = yield searchContents(title);
      const match = candidates.find((c) => {
        var _a2;
        return ((_a2 = c.title) == null ? void 0 : _a2.toLowerCase()) === title.toLowerCase();
      });
      if (!match)
        return [];
      let finalSources = [];
      if (type === "tv") {
        const detail = yield getContentDetail(match.uuid);
        const seasonObj = (_a = detail.seasons) == null ? void 0 : _a.find((s) => parseInt(s.seasonNumber) === parseInt(season));
        if (!seasonObj)
          return [];
        const { data: episodes } = yield import_axios2.default.get(`${PHM_API}/en/episodes?season_id=${seasonObj.id}`, { headers: API_HEADERS });
        const ep = (_b = episodes.data) == null ? void 0 : _b.find((e) => parseInt(e.episodeNumber) === parseInt(episode));
        if (!ep)
          return [];
        finalSources = yield getSources("episode", ep.uuid);
      } else {
        finalSources = yield getSources("content", match.uuid);
      }
      const streams = finalSources.map((s) => ({
        langLabel: "Latino",
        serverLabel: s.hostName || "PlayHub",
        url: s.url,
        quality: "1080p",
        headers: { "User-Agent": UA, "Referer": "https://www.playhubmax.com/" }
      }));
      return yield finalizeStreams(streams, "PlayHubMax");
    } catch (e) {
      console.error("[PlayHubMax] error:", e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
