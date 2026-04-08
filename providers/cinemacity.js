/**
 * cinemacity - Built from src/cinemacity/
 * Generated: 2026-04-08T22:14:02.182Z
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

// src/cinemacity/index.js
var cinemacity_exports = {};
__export(cinemacity_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(cinemacity_exports);
var import_axios2 = __toESM(require("axios"));
var cheerio = __toESM(require("cheerio"));

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

// src/cinemacity/index.js
var MAIN_URL = "https://cinemacity.cc";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var HEADERS = {
  "User-Agent": UA,
  "Cookie": "dle_user_id=32729; dle_password=894171c6a8dab18ee594d5c652009a35;",
  "Referer": `${MAIN_URL}/`
};
function normalizeTitle(t) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function atobPolyfill(str) {
  return Buffer.from(str, "base64").toString("binary");
}
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const type = mediaType === "movie" ? "movie" : "tv";
      const { data } = yield import_axios2.default.get(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`);
      return {
        title: type === "movie" ? data.title : data.name,
        year: (type === "movie" ? data.release_date || "" : data.first_air_date || "").slice(0, 4)
      };
    } catch (e) {
      return { title: null };
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    var _a;
    try {
      const { title, year } = yield getTmdbInfo(tmdbId, mediaType);
      if (!title)
        return [];
      const searchUrl = `${MAIN_URL}/index.php?do=search&subaction=search&story=${encodeURIComponent(title)}`;
      const { data: searchHtml } = yield import_axios2.default.get(searchUrl, { headers: HEADERS });
      const $search = cheerio.load(searchHtml);
      let mediaUrl = null;
      $search("div.dar-short_item").each((i, el) => {
        const anchor = $search(el).find("a").first();
        const href = anchor.attr("href");
        const entryText = anchor.text().trim();
        if (href && (normalizeTitle(entryText).includes(normalizeTitle(title)) || entryText.includes(year))) {
          mediaUrl = href;
          return false;
        }
      });
      if (!mediaUrl)
        return [];
      const { data: pageHtml } = yield import_axios2.default.get(mediaUrl, { headers: HEADERS });
      const $page = cheerio.load(pageHtml);
      let fileData = null;
      $page("script").each((i, el) => {
        const script = $page(el).html() || "";
        const atobMatch = script.match(/atob\s*\(\s*['"](.*?)['"]\s*\)/);
        if (atobMatch) {
          const decoded = atobPolyfill(atobMatch[1]);
          const fileMatch = decoded.match(/file\s*:\s*(['"])(.*?)\1/) || decoded.match(/file\s*:\s*(\[.*?\])/);
          if (fileMatch) {
            try {
              const raw = fileMatch[2] || fileMatch[1];
              fileData = raw.startsWith("[") ? JSON.parse(raw) : raw;
            } catch (e) {
              fileData = fileMatch[2] || fileMatch[1];
            }
            return false;
          }
        }
      });
      if (!fileData)
        return [];
      const streams = [];
      const processStr = (str, quality = "HD") => {
        if (str.includes("[") && str.includes("]")) {
          const m = str.match(/\[(.*?)\](.*)/);
          if (m)
            streams.push({ url: m[2], q: m[1] });
        } else {
          streams.push({ url: str, q: quality });
        }
      };
      if (mediaType === "movie") {
        const movieFile = Array.isArray(fileData) ? fileData[0].file : fileData;
        processStr(movieFile);
      } else {
        const seasonLabel = `Season ${season}`;
        const sObj = fileData.find((s) => {
          var _a2, _b;
          return ((_a2 = s.title) == null ? void 0 : _a2.includes(seasonLabel)) || ((_b = s.title) == null ? void 0 : _b.includes(`S${season}`));
        });
        const epLabel = `Episode ${episode}`;
        const eObj = (_a = sObj == null ? void 0 : sObj.folder) == null ? void 0 : _a.find((e) => {
          var _a2, _b;
          return ((_a2 = e.title) == null ? void 0 : _a2.includes(epLabel)) || ((_b = e.title) == null ? void 0 : _b.includes(`E${episode}`));
        });
        if (eObj == null ? void 0 : eObj.file)
          processStr(eObj.file);
      }
      const standardStreams = streams.map((s) => ({
        langLabel: "Espa\xF1ol",
        serverLabel: "CinemaCity",
        url: s.url,
        quality: s.q,
        headers: HEADERS
      }));
      return yield finalizeStreams(standardStreams, "CinemaCity");
    } catch (e) {
      console.error("[CinemaCity] error:", e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
