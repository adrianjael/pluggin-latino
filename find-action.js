const fs = require('fs');
const bundleText = fs.readFileSync('bundle.js', 'utf8');

// Match `action: "word"` or `action: 'word'`
const regex = /action\s*:\s*["']([^"']+)["']/g;
const matches = [];
let m;
while ((m = regex.exec(bundleText)) !== null) {
   matches.push(m[1]);
}
console.log("Actions:", Array.from(new Set(matches)));

// also find API strings starting with `http` or `/wp-json`
const urlRegex = /["'](https?:\/\/[^"']+|:[^"']+|\/wp-json\/[^"']+)["']/g;
const matchedUrls = [];
while ((m = urlRegex.exec(bundleText)) !== null) {
   if (m[1].includes('pelispanda') || m[1].includes('wp-json'))
      matchedUrls.push(m[1]);
}
console.log("URLs:", Array.from(new Set(matchedUrls)));
