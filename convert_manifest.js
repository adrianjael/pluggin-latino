const fs = require('fs');
const oldManifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8').replace(/^\uFEFF/, ''));
const scrapers = oldManifest.scrapers || oldManifest;

// Limpiar y asegurar campos del template oficial
const cleanScrapers = scrapers.map(s => ({
  id: s.id,
  name: s.name,
  description: s.description,
  version: s.version || "1.2.0",
  author: s.author || "AdrianJael",
  supportedTypes: s.supportedTypes,
  filename: s.filename,
  enabled: s.enabled !== undefined ? s.enabled : true,
  logo: s.logo || "",
  contentLanguage: s.contentLanguage || ["es"],
  formats: s.formats || ["m3u8", "mp4"],
  limited: s.limited || false,
  disabledPlatforms: s.disabledPlatforms || [],
  supportsExternalPlayer: s.supportsExternalPlayer !== undefined ? s.supportsExternalPlayer : true
}));

// Guardar como ARRAY plano (estándar del template)
fs.writeFileSync('./manifest.json', JSON.stringify(cleanScrapers, null, 2).replace(/\r\n/g, '\n'), 'utf8');
