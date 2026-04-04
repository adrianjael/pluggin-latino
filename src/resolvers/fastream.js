import axios from 'axios';
import { detectQuality } from './quality.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function unpackPacker(data) {
  const match = data.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)\)\)/);
  if (!match) return null;

  let [, p, a, c, k] = match;
  a = parseInt(a); c = parseInt(c); k = k.split('|');

  while (c--) {
    if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
  }
  return p;
}

export async function resolve(url) {
  try {
    console.log(`[Fastream] Resolviendo: ${url}`);
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': UA, 'Referer': 'https://www3.seriesmetro.net/' },
      timeout: 10000
    });

    const unpacked = unpackPacker(data);
    if (!unpacked) {
        // Probamos si la URL ya está en el HTML sin Packer
        const m3u8Match = data.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/)?.[1];
        if (m3u8Match) {
            const quality = await detectQuality(m3u8Match, { 'Referer': 'https://fastream.to/' });
            return { url: m3u8Match, quality, headers: { 'User-Agent': UA, 'Referer': 'https://fastream.to/' } };
        }
        return null;
    }

    const m3u8 = unpacked.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/)?.[1];
    if (!m3u8) return null;

    const quality = await detectQuality(m3u8, { 'Referer': 'https://fastream.to/' });
    return {
      url: m3u8,
      quality,
      headers: { 'User-Agent': UA, 'Referer': 'https://fastream.to/' }
    };
  } catch (e) {
    console.log(`[Fastream] Error: ${e.message}`);
    return null;
  }
}
