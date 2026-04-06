/**
 * pelisgo - Built from src/pelisgo/
 * Generated: 2026-04-06T07:14:05.003Z
 */
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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

// src/pelisgo/index.js
var BASE = "https://pelisgo.online";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var TMDB_KEY = "2dca580c2a14b55200e784d157207b4d";
var COMMON_HEADERS = {
  "User-Agent": UA,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache"
};
function cleanTitle(str) {
  if (!str)
    return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s\-]/gi, "").toLowerCase().trim();
}
function getSpanishTitle(tmdbId, type) {
  return __async(this, null, function* () {
    try {
      const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=es-MX`;
      const res = yield fetch(url);
      const data = yield res.json();
      return data.title || data.name || null;
    } catch (e) {
      return null;
    }
  });
}
function unpack(p, a, c, k, e, d) {
  while (c--)
    if (k[c])
      p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
  return p;
}
function fetchText(_0) {
  return __async(this, arguments, function* (url, referer = BASE) {
    try {
      const headers = __spreadValues({}, COMMON_HEADERS);
      if (referer)
        headers["Referer"] = referer;
      const res = yield fetch(url, { headers });
      return yield res.text();
    } catch (e) {
      return "";
    }
  });
}
function pelisgoSearch(query, type) {
  return __async(this, null, function* () {
    const searchStr = cleanTitle(query);
    const url = `${BASE}/search?q=${encodeURIComponent(searchStr)}`;
    const html = yield fetchText(url);
    if (!html)
      return [];
    const re = /href="(\/(movies|series)\/([a-z0-9\-]+))"/gi;
    const results = [];
    const seen = /* @__PURE__ */ new Set();
    let m;
    while ((m = re.exec(html)) !== null) {
      if (m[1].includes("/temporada/") || m[1].includes("/episodio/"))
        continue;
      const isMatch = type === "movie" && m[2] === "movies" || type === "tv" && m[2] === "series";
      if (isMatch && !seen.has(m[3])) {
        seen.add(m[3]);
        results.push(m[1]);
      }
    }
    return results;
  });
}
function resolveFilemoon(url) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(url, BASE);
      const packed = html.match(/eval\(function\(p,a,c,k,e,d\).*\)/);
      if (!packed)
        return null;
      const parts = packed[0].match(/\}\('(.*)',\s*(\d+),\s*(\d+),\s*'(.*)'\.split\('\|'\)/);
      if (!parts)
        return null;
      const unpacked = unpack(parts[1], parseInt(parts[2]), parseInt(parts[3]), parts[4].split("|"), 0, {});
      const linkMatch = unpacked.match(/file:"(.*?)"/);
      return linkMatch ? linkMatch[1] : null;
    } catch (e) {
      return null;
    }
  });
}
function getOnlineStreams(rawHtml) {
  return __async(this, null, function* () {
    const streams = [];
    try {
      const videoLinksMatch = rawHtml.match(/videoLinks[\\"' ]+:\[(.*?)\]/);
      if (!videoLinksMatch)
        return [];
      const rawLinksJson = videoLinksMatch[1];
      const urlRegex = /url[\\"' ]+:[\\"' ]+([^\s"'\\]+)[\\"' ]+/gi;
      let m;
      const seenUrls = /* @__PURE__ */ new Set();
      while ((m = urlRegex.exec(rawLinksJson)) !== null) {
        let cleanUrl = m[1].replace(/\\/g, "");
        if (seenUrls.has(cleanUrl))
          continue;
        seenUrls.add(cleanUrl);
        let label = "PelisGo";
        let direct = null;
        if (cleanUrl.includes("filemoon") || cleanUrl.includes("f75s.com")) {
          label = "Magi (Filemoon)";
          direct = yield resolveFilemoon(cleanUrl);
        } else if (cleanUrl.includes("seekstreaming") || cleanUrl.includes("embedseek")) {
          label = "SeekStreaming";
          if (cleanUrl.includes("#")) {
            const id = cleanUrl.split("#")[1];
            cleanUrl = `https://seekstreaming.com/embed/${id}`;
          }
        } else if (cleanUrl.includes("hqq.ac") || cleanUrl.includes("netu")) {
          label = "Netu";
        } else if (cleanUrl.includes("desu")) {
          label = "Desu";
        }
        if (direct) {
          streams.push({ name: "PelisGo", title: `[Directo] \xB7 ${label}`, url: direct, quality: "1080p", isM3U8: true });
        } else {
          streams.push({ name: "PelisGo", title: `[Web] \xB7 ${label}`, url: cleanUrl, quality: "1080p" });
        }
      }
      return streams;
    } catch (e) {
      return [];
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      const type = mediaType === "tv" || mediaType === "series" ? "tv" : "movie";
      console.log(`[PelisGo v1.6.4] Scann: "${title}" (${type}) tmdbId: ${tmdbId}`);
      let paths = yield pelisgoSearch(title, type);
      if (paths.length === 0 && tmdbId) {
        console.log(`[PelisGo] Reintentando con t\xEDtulo oficial de TMDB...`);
        const tmdbType = type === "tv" ? "tv" : "movie";
        const officialTitle = yield getSpanishTitle(tmdbId, tmdbType);
        if (officialTitle && officialTitle !== title) {
          console.log(`[PelisGo] Nombre detectado: "${officialTitle}"`);
          paths = yield pelisgoSearch(officialTitle, type);
        }
      }
      if (paths.length === 0)
        return [];
      const slug = paths[0].split("/")[paths[0].split("/").length - 1];
      const pageUrl = type === "movie" ? `${BASE}/movies/${slug}` : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;
      const html = yield fetchText(pageUrl);
      if (!html)
        return [];
      const onlineStreams = yield getOnlineStreams(html);
      console.log(`[PelisGo] Done: ${onlineStreams.length} stream(s) found.`);
      return onlineStreams;
    } catch (e) {
      return [];
    }
  });
}
module.exports = { getStreams };
