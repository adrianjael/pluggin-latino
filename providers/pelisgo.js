/**
 * pelisgo - Built from src/pelisgo/
 * Generated: 2026-04-06T03:12:54.628Z
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
var TMDB_BASE = "https://api.themoviedb.org/3";
var TARGET_SERVERS = ["buzzheavier", "pixeldrain"];
function fetchJson(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    try {
      const res = yield fetch(url, { headers: __spreadValues({ "User-Agent": UA }, headers) });
      return yield res.json();
    } catch (e) {
      return null;
    }
  });
}
function fetchText(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    try {
      const res = yield fetch(url, { headers: __spreadValues({ "User-Agent": UA }, headers) });
      return yield res.text();
    } catch (e) {
      return "";
    }
  });
}
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `${TMDB_BASE}/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=es-ES`;
    const data = yield fetchJson(url);
    if (!data)
      return { title: null, originalTitle: null };
    return {
      title: type === "movie" ? data.title : data.name,
      originalTitle: type === "movie" ? data.original_title : data.original_name
    };
  });
}
function pelisgoSearch(query, type) {
  return __async(this, null, function* () {
    const url = `${BASE}/search?q=${encodeURIComponent(query)}`;
    const html = yield fetchText(url, { "Referer": `${BASE}/` });
    const re = /href="(\/(movies|series)\/([a-z0-9\-]+))"/gi;
    const results = [];
    const seen = /* @__PURE__ */ new Set();
    let m;
    while ((m = re.exec(html)) !== null) {
      const fullPath = m[1];
      const itemType = m[2];
      const slug = m[3];
      if (fullPath.includes("/temporada/") || fullPath.includes("/episodio/"))
        continue;
      const isMatch = type === "movie" && itemType === "movies" || type === "tv" && itemType === "series";
      if (isMatch && !seen.has(slug)) {
        seen.add(slug);
        results.push(fullPath);
      }
    }
    return results;
  });
}
function resolveBuzzheavier(url) {
  return __async(this, null, function* () {
    const id = url.split("/").pop();
    const dlUrl = `https://buzzheavier.com/${id}/download`;
    try {
      const res = yield fetch(dlUrl, {
        method: "GET",
        headers: { "User-Agent": UA, "HX-Request": "true", "HX-Current-URL": `https://buzzheavier.com/${id}`, "Referer": `https://buzzheavier.com/${id}` },
        redirect: "follow"
      });
      return res.headers.get("hx-redirect") || null;
    } catch (e) {
      return null;
    }
  });
}
function resolvePixeldrain(url) {
  return __async(this, null, function* () {
    const id = url.split("/").pop();
    return `https://pixeldrain.com/api/file/${id}?download`;
  });
}
function resolveOneId(id) {
  return __async(this, null, function* () {
    try {
      const data = yield fetchJson(`${BASE}/api/download/${id}`, { "Accept": "application/json" });
      if (!(data == null ? void 0 : data.url))
        return null;
      const serverLower = (data.server || "").toLowerCase();
      if (!TARGET_SERVERS.some((s) => serverLower.includes(s)))
        return null;
      let finalUrl = data.url;
      if (serverLower.includes("buzzheavier"))
        finalUrl = yield resolveBuzzheavier(data.url);
      if (serverLower.includes("pixeldrain"))
        finalUrl = yield resolvePixeldrain(data.url);
      return finalUrl ? { server: data.server, url: finalUrl, quality: data.quality || "1080p", language: data.language || "Latino" } : null;
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      const resolvedType = mediaType === "tv" || mediaType === "series" ? "tv" : "movie";
      console.log(`[PelisGo] v3.9 Request: "${title}" (${resolvedType})`);
      let paths = yield pelisgoSearch(title, resolvedType);
      if (paths.length === 0 && tmdbId) {
        const info = yield getTmdbInfo(tmdbId, resolvedType);
        if (info.originalTitle && info.originalTitle !== title) {
          console.log(`[PelisGo] Re-intentando con: ${info.originalTitle}`);
          paths = yield pelisgoSearch(info.originalTitle, resolvedType);
        }
      }
      if (paths.length === 0)
        return [];
      const slug = paths[0].split("/")[2];
      const pageUrl = resolvedType === "movie" ? `${BASE}/movies/${slug}` : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;
      const html = yield fetchText(pageUrl);
      const onlineStreams = [];
      const urlPatterns = [
        { regex: /https?:(?:\\[/\\]|[/]){2}(?:filemoon\.sx|f75s\.com)(?:\\[/\\]|[/])e(?:\\[/\\]|[/])[a-z0-9]+/gi, server: "Magi (Filemoon)" },
        { regex: /https?:(?:\\[/\\]|[/]){2}desu\.pelisgo\.online(?:\\[/\\]|[/])embed(?:\\[/\\]|[/])[a-z0-9]+/gi, server: "Desu" },
        { regex: /https?:(?:\\[/\\]|[/]){2}hqq\.ac(?:\\[/\\]|[/])e(?:\\[/\\]|[/])[a-z0-9]+/gi, server: "Netu" },
        { regex: /https?:(?:\\[/\\]|[/]){2}[a-z0-9.]+\.embedseek\.com(?:\\[/\\]|[/])#[a-z0-9]+/gi, server: "SeekStreaming" }
      ];
      urlPatterns.forEach((p) => {
        const matches = html.match(p.regex) || [];
        [...new Set(matches)].forEach((url) => {
          const cleanUrl = url.replace(/\\/g, "");
          onlineStreams.push({
            name: "PelisGo",
            title: `[Online] \xB7 ${p.server}`,
            url: cleanUrl,
            quality: "1080p",
            headers: { "User-Agent": UA, "Referer": BASE }
          });
        });
      });
      const downloadIds = function(h) {
        const re = /\/download\/([a-z0-9]+)/g;
        const ids = [];
        let m;
        while ((m = re.exec(h)) !== null)
          ids.push(m[1]);
        return [...new Set(ids)];
      }(html);
      const downloadResults = yield Promise.all(downloadIds.map((id) => resolveOneId(id)));
      const downloadStreams = downloadResults.filter((r) => r !== null).map((link) => {
        const langLabel = link.language ? `[${link.language.toUpperCase()}] ` : "";
        return {
          name: "PelisGo",
          title: `${langLabel}${link.server} \xB7 ${link.quality}`,
          url: link.url,
          quality: link.quality,
          headers: { "User-Agent": UA, "Referer": `${BASE}/` }
        };
      });
      const allStreams = [...onlineStreams, ...downloadStreams];
      console.log(`[PelisGo] \xC9xito: ${allStreams.length} stream(s) encontrados.`);
      return allStreams;
    } catch (e) {
      console.error(`[PelisGo] Error Fatal: ${e.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
