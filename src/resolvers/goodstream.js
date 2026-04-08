import axios from 'axios';
import { detectQuality } from './quality.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

export async function resolve(embedUrl) {
  try {
    console.log(`[GoodStream] Resolviendo: ${embedUrl}`);

    const response = await axios.get(embedUrl, {
      headers: {
        'User-Agent': UA,
        'Referer': 'https://goodstream.one',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    const match = response.data.match(/file:\s*"([^"]+)"/);
    if (!match) {
      console.log('[GoodStream] No se encontró patrón file:"..."');
      return null;
    }

    const videoUrl = match[1];
    const refererHeaders = { 'Referer': embedUrl, 'Origin': 'https://goodstream.one', 'User-Agent': UA };
    const quality = await detectQuality(videoUrl, refererHeaders);
    console.log(`[GoodStream] URL encontrada (${quality}): ${videoUrl.substring(0, 80)}...`);

    return { url: videoUrl, quality, headers: refererHeaders };
  } catch (err) {
    console.log(`[GoodStream] Error: ${err.message}`);
    return null;
  }
}
