/**
 * cuevana_gs - Built from src/cuevana_gs/
 * Generated: 2026-04-04T05:42:17.990Z
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

// src/cuevana_gs/extractor.js
var BASE_URL = "https://cuevana.gs";
var BASE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  "Referer": BASE_URL,
  "Accept-Language": "es-ES,es;q=0.9"
};
function unpackEval(payload, radix, symtab) {
  return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function(match) {
    let result = 0;
    const digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < match.length; i++) {
      let pos = digits.indexOf(match[i]);
      if (pos === -1 || pos >= radix)
        return match;
      result = result * radix + pos;
    }
    if (result >= symtab.length)
      return match;
    return symtab[result] && symtab[result] !== "" ? symtab[result] : match;
  });
}
function extractM3u8FromHtml(html) {
  let unpacked = "";
  const packMatch = html.match(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/);
  if (packMatch) {
    try {
      unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
    } catch (e) {
    }
  } else {
    unpacked = html;
  }
  unpacked = unpacked.replace(/k:\/\//g, "https://");
  const m = unpacked.match(/https?:\/\/[^"'\s\\]+?\.m3u8[^"'\s\\]*/i);
  if (m)
    return m[0].replace(/\\/g, "");
  const vimeosImgMatch = html.match(/img src=["']([^"']+\/(i|thumbs)\/\d+\/\d+\/([a-zA-Z0-9]+)\.jpg)["']/i);
  if (vimeosImgMatch) {
    const id = vimeosImgMatch[3];
    console.log(`[Cuevana.gs] Vimeos Fallback: ID=${id} from image.`);
    const tMatch = html.match(/t=([a-zA-Z0-9\-_]+)/);
    const sMatch = html.match(/s=(\d+)/);
    const eMatch = html.match(/e=([a-zA-Z0-9\-_]+)/);
    const vMatch = html.match(/v=(\d+)/);
    const srvMatch = html.match(/srv=([a-zA-Z0-9]+)/);
    if (tMatch && sMatch) {
      const p1Match = vimeosImgMatch[1].match(/\/(\d+)\/\d+\//);
      const p2Match = vimeosImgMatch[1].match(/\/(\d+)\//);
      const p1 = p1Match ? p1Match[1] : "00009";
      const p2 = p2Match ? p2Match[1] : "02";
      return `https://p4.vimeos.zip/hls2/${p2}/${p1}/${id}_,n,h,.urlset/master.m3u8?t=${tMatch[1]}&s=${sMatch[1]}&e=${eMatch[1] || "43200"}&v=${vMatch ? vMatch[1] : ""}&srv=${srvMatch ? srvMatch[1] : "s9"}&i=0.3&sp=0&fr=${id}&r=e`;
    }
  }
  return null;
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
function fetchHtml(_0) {
  return __async(this, arguments, function* (url, referer = BASE_URL) {
    const res = yield fetch(url, { headers: __spreadProps(__spreadValues({}, BASE_HEADERS), { Referer: referer }) });
    return res.text();
  });
}
function resolveGenericEmbed(embedUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchHtml(embedUrl, "https://cuevana.gs/");
      return extractM3u8FromHtml(html);
    } catch (e) {
      return null;
    }
  });
}
function resolveVoesx(embedUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchHtml(embedUrl, embedUrl);
      if (html.includes("Redirecting") || html.length < 1e3) {
        const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
        if (rm)
          return resolveVoesx(rm[1]);
      }
      const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
      if (jsonMatch) {
        try {
          let encText = JSON.parse(jsonMatch[1].trim())[0];
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
          if (data && data.source)
            return data.source;
        } catch (ex) {
        }
      }
      return extractM3u8FromHtml(html);
    } catch (e) {
      return null;
    }
  });
}
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
      const res = yield fetch(url, { headers: { "User-Agent": BASE_HEADERS["User-Agent"] } });
      const html = yield res.text();
      let title = "";
      let year = "";
      const titleMatch = html.match(/<title>(.*?)(?:\s+&\#8212;|\s+-|\s+\()/);
      if (titleMatch)
        title = titleMatch[1].trim();
      const yearMatch = html.match(/\((\d{4})\)/);
      if (yearMatch)
        year = yearMatch[1];
      return { title, year };
    } catch (e) {
    }
    return { title: null, year: "" };
  });
}
function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
  return __async(this, null, function* () {
    var _a, _b, _c, _d, _e, _f;
    const isMovie = mediaType === "movie";
    const targetType = isMovie ? "movies" : "tvshows";
    console.log(`[Cuevana.gs] Extracting: ${providedTitle || tmdbId} (${mediaType}) S${season}E${episode}`);
    try {
      const tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
      let searchTitle = providedTitle || tmdbInfo.title;
      const year = tmdbInfo.year;
      function performSearch(query) {
        return __async(this, null, function* () {
          console.log(`[Cuevana.gs] Searching: "${query}"`);
          const encodedQuery = encodeURIComponent(query);
          const searchUrl = `${BASE_URL}/wp-api/v1/search?postType=any&q=${encodedQuery}&postsPerPage=10`;
          try {
            const searchRes = yield fetch(searchUrl, { headers: BASE_HEADERS });
            return yield searchRes.json();
          } catch (err) {
            return { error: true };
          }
        });
      }
      let searchJson = yield performSearch(`${searchTitle} ${year}`);
      if ((searchJson.error || !((_b = (_a = searchJson.data) == null ? void 0 : _a.posts) == null ? void 0 : _b.length)) && providedTitle && tmdbInfo.title) {
        searchJson = yield performSearch(`${tmdbInfo.title} ${year}`);
      }
      if ((searchJson.error || !((_d = (_c = searchJson.data) == null ? void 0 : _c.posts) == null ? void 0 : _d.length)) && tmdbInfo.title) {
        searchJson = yield performSearch(tmdbInfo.title);
      }
      if (searchJson.error || !((_f = (_e = searchJson.data) == null ? void 0 : _e.posts) == null ? void 0 : _f.length)) {
        searchJson = yield performSearch(searchTitle);
      }
      if (searchJson.error || !searchJson.data || !searchJson.data.posts || searchJson.data.posts.length === 0) {
        console.log(`[Cuevana.gs] No results found in any search attempt.`);
        return [];
      }
      const posts = searchJson.data.posts;
      const normalizedTarget = (tmdbInfo.title || searchTitle).toLowerCase().replace(/[^a-z0-9]/g, "");
      let post = posts.find((p) => p.type === targetType && p.title.toLowerCase().replace(/[^a-z0-9]/g, "").includes(normalizedTarget)) || posts.find((p) => p.type === targetType) || posts[0];
      let postId = post._id;
      console.log(`[Cuevana.gs] Best match: "${post.title}" (postId: ${postId}) [Type: ${post.type}]`);
      if (!isMovie && season && episode) {
        console.log(`[Cuevana.gs] TV Mode: Resolving postId for S${season}E${episode}...`);
        try {
          const episodesUrl = `${BASE_URL}/wp-api/v1/single/episodes/list?_id=${postId}&season=${season}&postsPerPage=100`;
          const epRes = yield fetch(episodesUrl, { headers: BASE_HEADERS });
          const epJson = yield epRes.json();
          if (!epJson.error && epJson.data && epJson.data.posts) {
            const episodes = epJson.data.posts;
            const epMatch = episodes.find((e) => parseInt(e.episode_number) === parseInt(episode));
            if (epMatch) {
              postId = epMatch._id;
              console.log(`[Cuevana.gs] Episode postId resolved via API: ${postId}`);
            } else {
              console.log(`[Cuevana.gs] No episode match found in API for E${episode}.`);
            }
          } else {
            console.log(`[Cuevana.gs] Error in episodes API response or empty results.`);
          }
        } catch (err) {
          console.error(`[Cuevana.gs] Error resolving episodes via API: ${err.message}`);
        }
      }
      let playerUrl = `${BASE_URL}/wp-api/v1/player?postId=${postId}&demo=0`;
      const playerRes = yield fetch(playerUrl, { headers: BASE_HEADERS });
      const playerJson = yield playerRes.json();
      if (playerJson.error || !playerJson.data || !playerJson.data.embeds || playerJson.data.embeds.length === 0) {
        console.log(`[Cuevana.gs] No embeds found for postId: ${postId}`);
        return [];
      }
      const embeds = playerJson.data.embeds;
      console.log(`[Cuevana.gs] Embeds found: ${embeds.length}`);
      const streamPromises = embeds.map(function(embed) {
        const proxyUrl = embed.url;
        const lang = embed.lang || "Latino";
        const quality = embed.quality || "HD";
        let server = "unknown";
        try {
          const urlObj = new URL(proxyUrl);
          server = (urlObj.searchParams.get("server") || "unknown").toLowerCase();
        } catch (e) {
        }
        if (server === "goodstream")
          return null;
        console.log(`[Cuevana.gs] -> Resolving [${server}] ${lang} ${quality}`);
        return fetchHtml(proxyUrl, BASE_URL).then(function(proxyHtml) {
          const iframeMatch = proxyHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
          if (!iframeMatch)
            return null;
          const embedUrl = iframeMatch[1];
          let resolvePromise;
          if (server === "voe") {
            resolvePromise = resolveVoesx(embedUrl);
          } else {
            resolvePromise = resolveGenericEmbed(embedUrl);
          }
          return resolvePromise.then(function(finalUrl) {
            if (!finalUrl || !finalUrl.startsWith("http"))
              return null;
            const isVimeos = server.includes("vimeos");
            const mobileUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
            return {
              name: "Cuevana.gs",
              title: server + " (" + lang + ") " + quality,
              url: finalUrl,
              quality,
              headers: {
                "User-Agent": mobileUA,
                "Referer": isVimeos ? "https://vimeos.net/" : embedUrl,
                "Origin": isVimeos ? "https://vimeos.net" : void 0
              }
            };
          });
        }).catch(function() {
          return null;
        });
      });
      const results = yield Promise.all(streamPromises);
      const streams = results.filter(function(s) {
        return s !== null;
      });
      console.log(`[Cuevana.gs] Final streams: ${streams.length}`);
      return streams;
    } catch (error) {
      console.error(`[Cuevana.gs] Global Error: ${error.message}`);
      return [];
    }
  });
}

// src/cuevana_gs/index.js
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      return yield extractStreams(tmdbId, mediaType, season, episode, title);
    } catch (e) {
      console.error(`[Cuevana.gs] Index error: ${e.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
