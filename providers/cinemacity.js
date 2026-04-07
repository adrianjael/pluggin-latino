/**
 * cinemacity - Built from src/cinemacity/
 * Generated: 2026-04-07T18:01:21.447Z
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
      return streams.map((s) => ({
        name: "CinemaCity",
        title: `[Cinema] ${s.q} \xB7 Direct`,
        url: s.url,
        quality: s.q,
        headers: HEADERS
      }));
    } catch (e) {
      console.error("[CinemaCity] error:", e.message);
      return [];
    }
  });
}
