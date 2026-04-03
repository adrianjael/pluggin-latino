async function x() {
    const r = await fetch('https://pelispanda.org/wp-content/themes/wpreact//assets/js/bundle.js');
    const t = await r.text();
    const urls = t.match(/[\"']\/wpreact\/v1\/[\w\/]+[\"']/g); 
    console.log("Endpoints in bundle:", Array.from(new Set(urls)));
    const wp = t.match(/wp-admin\/admin-ajax\.php/g);
    console.log("Admin ajax uses:", wp ? wp.length : 0);
}
x();
