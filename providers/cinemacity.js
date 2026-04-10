/**
 * cinemacity - Built from src/cinemacity/
 * Generated: 2026-04-10T20:19:58.684Z
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
var import_axios = __toESM(require("axios"));
var cheerio = __toESM(require("cheerio"));

// src/utils/m3u8.js
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
      console.log(`[m3u8] Validation soft-fail for ${url.substring(0, 40)}... : ${error.message}`);
      const isKnown = url.includes("awish") || url.includes("vimeos") || url.includes("voe") || url.includes("filemoon");
      return __spreadProps(__spreadValues({}, stream), { verified: isKnown });
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
      let q = "";
      if (s.siteQuality && (s.siteQuality === "CAM" || s.siteQuality === "TS")) {
        q = s.siteQuality;
      } else if (s.verified) {
        q = s.quality;
      } else if (s.siteQuality) {
        q = s.siteQuality;
      }
      const lang = normalizeLanguage(s.langLabel || s.language);
      const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url);
      const check = s.verified && q !== "CAM" && q !== "TS" ? " \u2713" : "";
      const qualityPrefix = q ? `${q}${check} | ` : "";
      return {
        name: providerName || s.name || "Provider",
        title: `${qualityPrefix}${lang} | ${server}`,
        url: s.url,
        quality: q || "",
        // Vacío para evitar etiquetas 'HD' automáticas en la App
        headers: s.headers || {}
      };
    });
  });
}

// src/cinemacity/index.js
var MAIN_URL = "https://cinemacity.cc";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var HEADERS = {
  "User-Agent": UA2,
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
      const { data } = yield import_axios.default.get(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`);
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
      const { data: searchHtml } = yield import_axios.default.get(searchUrl, { headers: HEADERS });
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
      const { data: pageHtml } = yield import_axios.default.get(mediaUrl, { headers: HEADERS });
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
