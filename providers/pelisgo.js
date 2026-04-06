/**
 * pelisgo - Built from src/pelisgo/
 * Generated: 2026-04-06T03:15:11.329Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var COMMON_HEADERS = {
  "User-Agent": UA,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache"
};
function fetchText(_0) {
  return __async(this, arguments, function* (url, referer = BASE) {
    try {
      const headers = __spreadValues({}, COMMON_HEADERS);
      if (referer)
        headers["Referer"] = referer;
      const res = yield fetch(url, { headers });
      return yield res.text();
    } catch (e) {
      console.error(`[PelisGo HTTP] Error en ${url}: ${e.message}`);
      return "";
    }
  });
}
function fetchJson(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    try {
      const res = yield fetch(url, { headers: __spreadProps(__spreadValues(__spreadValues({}, COMMON_HEADERS), headers), { "Accept": "application/json" }) });
      return yield res.json();
    } catch (e) {
      return null;
    }
  });
}
function normalizeTitle(t) {
  if (!t)
    return "";
  return t.toLowerCase().replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o").replace(/[úùüû]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
    const url = `${TMDB_BASE}/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=es-ES`;
    try {
      const data = yield fetchJson(url);
      if (!data)
        return { title: null, originalTitle: null };
      return {
        title: type === "movie" ? data.title : data.name,
        originalTitle: type === "movie" ? data.original_title : data.original_name
      };
    } catch (e) {
      return { title: null, originalTitle: null };
    }
  });
}
function pelisgoSearch(query, type) {
  return __async(this, null, function* () {
    const url = `${BASE}/search?q=${encodeURIComponent(query)}`;
    const html = yield fetchText(url);
    if (!html)
      return [];
    const re = /href="(\/(movies|series)\/([a-z0-9\-]+))"/gi;
    const results = [];
    const seen = /* @__PURE__ */ new Set();
    const cleanQuery = normalizeTitle(query);
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
function resolveOneId(id) {
  return __async(this, null, function* () {
    try {
      const data = yield fetchJson(`${BASE}/api/download/${id}`);
      if (!(data == null ? void 0 : data.url))
        return null;
      const serverLower = (data.server || "").toLowerCase();
      if (!TARGET_SERVERS.some((s) => serverLower.includes(s)))
        return null;
      let finalUrl = data.url;
      if (serverLower.includes("buzzheavier"))
        finalUrl = yield resolveBuzzheavier(data.url);
      if (serverLower.includes("pixeldrain")) {
        const pid = data.url.split("/").pop();
        finalUrl = `https://pixeldrain.com/api/file/${pid}?download`;
      }
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
      console.log(`[PelisGo v1.4] Scann: "${title}" (${resolvedType})`);
      let paths = yield pelisgoSearch(title, resolvedType);
      if (paths.length === 0 && tmdbId) {
        const info = yield getTmdbInfo(tmdbId, resolvedType);
        if (info.originalTitle && normalizeTitle(info.originalTitle) !== normalizeTitle(title)) {
          console.log(`[PelisGo] Fallback: buscando por titulo original "${info.originalTitle}"`);
          paths = yield pelisgoSearch(info.originalTitle, resolvedType);
        }
      }
      if (paths.length === 0)
        return [];
      const slug = paths[0].split("/")[2];
      const pageUrl = resolvedType === "movie" ? `${BASE}/movies/${slug}` : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;
      const html = yield fetchText(pageUrl);
      if (!html)
        return [];
      const onlineStreams = [];
      const domainPatterns = [
        { domain: "filemoon.sx", name: "Magi (Filemoon)" },
        { domain: "f75s.com", name: "Magi (Filemoon)" },
        { domain: "desu.pelisgo.online", name: "Desu" },
        { domain: "hqq.ac", name: "Netu" },
        { domain: "embedseek.com", name: "SeekStreaming" }
      ];
      domainPatterns.forEach((p) => {
        const regex = new RegExp(`https?:[\\/\\/\\\\]+[^\\s"'<>\\\\]*${p.domain.replace(/\./g, "\\.")}[^\\s"'<>\\\\]+`, "gi");
        const matches = html.match(regex) || [];
        [...new Set(matches)].forEach((url) => {
          const cleanUrl = url.replace(/\\/g, "");
          onlineStreams.push({
            name: "PelisGo",
            title: `[Online] \xB7 ${p.name}`,
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
      console.log(`[PelisGo] Done: ${allStreams.length} stream(s) found.`);
      return allStreams;
    } catch (e) {
      console.error(`[PelisGo Error] ${e.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
