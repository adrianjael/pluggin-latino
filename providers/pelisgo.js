/**
 * pelisgo - Built from src/pelisgo/
 * Generated: 2026-04-04T06:51:43.495Z
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
var TMDB_KEY = "2dca580c2a14b55200e784d157207b4d";
var TMDB_BASE = "https://api.themoviedb.org/3";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var TARGET_SERVERS = ["buzzheavier", "google drive", "googledrive", "pixeldrain"];
function fetchJson(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    const res = yield fetch(url, { headers: __spreadValues({ "User-Agent": UA }, headers) });
    return res.json();
  });
}
function fetchText(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    const res = yield fetch(url, { headers: __spreadValues({ "User-Agent": UA }, headers) });
    return res.text();
  });
}
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `${TMDB_BASE}/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=es-ES`;
    try {
      const data = yield fetchJson(url);
      const title = type === "movie" ? data.title || data.original_title : data.name || data.original_name;
      const originalTitle = type === "movie" ? data.original_title || data.title : data.original_name || data.name;
      const year = (type === "movie" ? data.release_date || "" : data.first_air_date || "").slice(0, 4);
      return { title, originalTitle, year };
    } catch (e) {
      return { title: null, originalTitle: null, year: "" };
    }
  });
}
function pelisgoSearch(query, type) {
  return __async(this, null, function* () {
    const url = `${BASE}/search?q=${encodeURIComponent(query)}`;
    try {
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
    } catch (e) {
      return [];
    }
  });
}
function extractDownloadIds(html) {
  const re = /\/download\/([a-z0-9]+)/g;
  const ids = [];
  const seen = {};
  let m;
  while ((m = re.exec(html)) !== null) {
    if (!seen[m[1]]) {
      seen[m[1]] = true;
      ids.push(m[1]);
    }
  }
  return ids;
}
function resolveBuzzheavier(url) {
  return __async(this, null, function* () {
    var _a;
    const id = (_a = url.match(/buzzheavier\.com\/([^/?&#]+)/)) == null ? void 0 : _a[1];
    if (!id)
      return null;
    const dlUrl = `https://buzzheavier.com/${id}/download`;
    try {
      const res = yield fetch(dlUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": `https://buzzheavier.com/${id}`,
          "HX-Request": "true",
          "HX-Current-URL": `https://buzzheavier.com/${id}`,
          "Accept": "text/html, */*"
        },
        redirect: "manual"
      });
      const redirect = res.headers.get("hx-redirect");
      return redirect || null;
    } catch (e) {
      return null;
    }
  });
}
function resolveOneId(id) {
  return __async(this, null, function* () {
    var _a, _b, _c;
    try {
      const data = yield fetchJson(`${BASE}/api/download/${id}`, { "Accept": "application/json" });
      if (!data || !data.url)
        return null;
      const serverName = (data.server || "").toLowerCase();
      const isTarget = TARGET_SERVERS.some((s) => serverName.includes(s));
      if (!isTarget)
        return null;
      let finalUrl = data.url;
      if (serverName.includes("buzzheavier")) {
        finalUrl = yield resolveBuzzheavier(data.url);
      } else if (serverName.includes("pixeldrain")) {
        const pid = (_a = data.url.match(/pixeldrain\.com\/u\/([^?&#/]+)/)) == null ? void 0 : _a[1];
        if (pid)
          finalUrl = `https://pixeldrain.com/api/file/${pid}?download`;
      } else if (serverName.includes("google drive") || serverName.includes("googledrive")) {
        const gid = ((_b = data.url.match(/\/d\/([^/?&#]+)/)) == null ? void 0 : _b[1]) || ((_c = data.url.match(/[?&]id=([^&]+)/)) == null ? void 0 : _c[1]);
        if (gid)
          finalUrl = `https://drive.usercontent.google.com/download?id=${gid}&export=download&confirm=t`;
      }
      if (!finalUrl)
        return null;
      return {
        server: data.server || "PelisGo",
        quality: data.quality || "HD",
        language: data.language || "",
        url: finalUrl
      };
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      const resolvedType = mediaType === "tv" || mediaType === "series" ? "tv" : "movie";
      console.log(`[PelisGo] Request: "${title}" (${resolvedType})`);
      let paths = yield pelisgoSearch(title, resolvedType);
      if (paths.length === 0 && tmdbId) {
        const info = yield getTmdbInfo(tmdbId, resolvedType);
        if (info.originalTitle && info.originalTitle !== title) {
          console.log(`[PelisGo] Fallback searching: ${info.originalTitle}`);
          paths = yield pelisgoSearch(info.originalTitle, resolvedType);
        }
        if (paths.length === 0 && info.title && info.title !== title) {
          paths = yield pelisgoSearch(info.title, resolvedType);
        }
      }
      if (paths.length === 0)
        return [];
      const slug = paths[0].split("/")[2];
      const pageUrl = resolvedType === "movie" ? `${BASE}/movies/${slug}` : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;
      console.log(`[PelisGo] Resolved Page: ${pageUrl}`);
      const html = yield fetchText(pageUrl);
      const ids = extractDownloadIds(html);
      const results = yield Promise.all(ids.map((id) => resolveOneId(id)));
      const validLinks = results.filter((r) => r !== null);
      return validLinks.map((link) => {
        const langLabel = link.language ? `[${link.language.toUpperCase()}] ` : "";
        return {
          name: "PelisGo",
          title: `${langLabel}${link.server} \xB7 ${link.quality}`,
          url: link.url,
          quality: link.quality,
          headers: {
            "User-Agent": UA,
            "Referer": `${BASE}/`
          }
        };
      });
    } catch (e) {
      console.error(`[PelisGo] Error: ${e.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
