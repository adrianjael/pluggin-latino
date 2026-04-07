/**
 * cinemacity - Built from src/cinemacity/
 * Generated: 2026-04-07T22:22:13.367Z
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
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));
var MAIN_URL = "https://cinemacity.cc";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var HEADERS = {
  "User-Agent": UA,
  "Cookie": "dle_user_id=32729; dle_password=894171c6a8dab18ee594d5c652009a35;",
  "Referer": `${MAIN_URL}/`
};
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType === "movie" ? "movie" : "tv"}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`;
      const res = yield fetch(url);
      const data = yield res.json();
      return {
        title: data.title || data.name,
        year: (data.release_date || data.first_air_date || "").substring(0, 4)
      };
    } catch (e) {
      return null;
    }
  });
}
function decodeBase64(input) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = String(input).replace(/=+$/, "");
  let output = "";
  for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    var _a;
    try {
      const tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
      if (!tmdbInfo)
        return [];
      const searchUrl = `${MAIN_URL}/index.php?do=search&subaction=search&story=${encodeURIComponent(tmdbInfo.title)}`;
      const searchRes = yield fetch(searchUrl, { headers: HEADERS });
      const $search = import_cheerio_without_node_native.default.load(yield searchRes.text());
      let mediaUrl = null;
      $search("div.dar-short_item").each((i, el) => {
        const anchor = $search(el).find("a").first();
        const href = anchor.attr("href");
        const entryText = anchor.text().toLowerCase();
        if (href && (entryText.includes(tmdbInfo.title.toLowerCase()) || entryText.includes(tmdbInfo.year))) {
          mediaUrl = href;
          return false;
        }
      });
      if (!mediaUrl)
        return [];
      const pageRes = yield fetch(mediaUrl, { headers: HEADERS });
      const $page = import_cheerio_without_node_native.default.load(yield pageRes.text());
      let fileData = null;
      $page("script").each((i, el) => {
        const script = $page(el).html() || "";
        const atobMatch = script.match(/atob\s*\(\s*['"](.*?)['"]\s*\)/);
        if (atobMatch) {
          const decoded = decodeBase64(atobMatch[1]);
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
      let urls = [];
      if (mediaType === "movie") {
        const movieFile = Array.isArray(fileData) ? fileData[0].file : fileData;
        urls.push({ url: movieFile, q: "HD" });
      } else {
        const sObj = fileData.find((s) => {
          var _a2, _b;
          return ((_a2 = s.title) == null ? void 0 : _a2.includes(`Season ${season}`)) || ((_b = s.title) == null ? void 0 : _b.includes(`S${season}`));
        });
        const eObj = (_a = sObj == null ? void 0 : sObj.folder) == null ? void 0 : _a.find((e) => {
          var _a2, _b;
          return ((_a2 = e.title) == null ? void 0 : _a2.includes(`Episode ${episode}`)) || ((_b = e.title) == null ? void 0 : _b.includes(`E${episode}`));
        });
        if (eObj == null ? void 0 : eObj.file)
          urls.push({ url: eObj.file, q: "HD" });
      }
      const streams = [];
      urls.forEach((item) => {
        const parts = item.url.split(",");
        parts.forEach((p) => {
          const qMatch = p.match(/\[(.*?)\](.*)/);
          streams.push({
            name: "CinemaCity",
            title: `${qMatch ? qMatch[1] : "720p"} \xB7 Latino \xB7 CinemaCity`,
            url: qMatch ? qMatch[2] : p,
            quality: qMatch ? qMatch[1] : "720p",
            headers: HEADERS
          });
        });
      });
      return streams;
    } catch (e) {
      return [];
    }
  });
}
