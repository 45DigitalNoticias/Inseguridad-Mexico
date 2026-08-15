// ¿El Q2 sigue rieles o frontera? Cruce medido: distancia a vía férrea y a la línea fronteriza.
const fs = require("fs");
const B = "C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const rd = f => eval("(" + fs.readFileSync(f, "utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/, "").replace(/;\s*$/, "") + ")");

const RAD = rd(B + "/_radar_muni_data.js").ventanas["2019-2025"];
const GEO = rd(B + "/_nac_muni_geo.js");
const RED = rd(B + "/red_ferroviaria.js");
const EST = rd(B + "/mexico_estados.geojson.js");

// --- centroide por municipio ---
const polysOf = ft => ft.geometry.type === "Polygon" ? [ft.geometry.coordinates] : ft.geometry.coordinates;
const CENT = {};
GEO.features.forEach(f => {
  let bx = -1, best = null;
  polysOf(f).forEach(poly => {
    const r = poly[0]; let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < r.length - 1; i++) { const [x1, y1] = r[i], [x2, y2] = r[i + 1]; const cr = x1 * y2 - x2 * y1; a += cr; cx += (x1 + x2) * cr; cy += (y1 + y2) * cr; }
    a *= .5; if (Math.abs(a) > bx) { bx = Math.abs(a); best = [cx / (6 * a), cy / (6 * a)]; }
  });
  CENT[String(f.properties.k).padStart(5, "0")] = best;
});

// --- puntos de la red ferroviaria ---
const RP = []; RED.segs.forEach(s => s.p.forEach(p => RP.push(p)));

// --- línea fronteriza norte, derivada de la geometría (envolvente superior de los 6 estados frontera) ---
const BORDER_ENT = new Set([2, 8, 5, 19, 26, 28]); // BC, Chihuahua, Coahuila, NL, Sonora, Tamaulipas
const bins = {};
EST.features.filter(f => BORDER_ENT.has(f.properties.clave_ent)).forEach(f => {
  const rings = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  rings.forEach(p => p.forEach(r => r.forEach(([x, y]) => {
    const k = Math.round(x * 10) / 10;
    if (!bins[k] || y > bins[k]) bins[k] = y;
  })));
});
const BORDER = Object.keys(bins).map(k => [+k, bins[k]]).sort((a, b) => a[0] - b[0]);

const KM = (a, b) => { const dx = (a[0] - b[0]) * 111 * Math.cos(a[1] * Math.PI / 180), dy = (a[1] - b[1]) * 111; return Math.hypot(dx, dy); };
const minDist = (c, pts) => { let m = 1e9; for (const p of pts) { const d = KM(c, p); if (d < m) m = d; } return m; };

const rows = RAD.map(r => {
  const c = CENT[r.cve]; if (!c) return null;
  return { ...r, dRiel: +minDist(c, RP).toFixed(1), dFront: +minDist(c, BORDER).toFixed(1) };
}).filter(Boolean);

const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? +(s[Math.floor(s.length / 2)]).toFixed(1) : 0; };
const q2 = rows.filter(r => r.cuadrante === "Q2"), no = rows.filter(r => r.cuadrante !== "Q2");
const pctCerca = (a, k, um) => +(100 * a.filter(r => r[k] <= um).length / a.length).toFixed(0);

console.log("=== MUESTRA: " + rows.length + " municipios (Q2=" + q2.length + ", resto=" + no.length + ") ===\n");
console.log("DISTANCIA A VÍA FÉRREA (km, mediana):   Q2 " + med(q2.map(r => r.dRiel)) + "   |  resto " + med(no.map(r => r.dRiel)));
console.log("  a ≤10 km de un riel:                  Q2 " + pctCerca(q2, "dRiel", 10) + "%   |  resto " + pctCerca(no, "dRiel", 10) + "%");
console.log("  a ≤25 km de un riel:                  Q2 " + pctCerca(q2, "dRiel", 25) + "%   |  resto " + pctCerca(no, "dRiel", 25) + "%");
console.log("\nDISTANCIA A FRONTERA NORTE (km, mediana): Q2 " + med(q2.map(r => r.dFront)) + " |  resto " + med(no.map(r => r.dFront)));
console.log("  a ≤100 km de la frontera:             Q2 " + pctCerca(q2, "dFront", 100) + "%   |  resto " + pctCerca(no, "dFront", 100) + "%");

// top Q2: ¿riel y/o frontera?
console.log("\n=== TOP 15 Q2 · su geografía ===");
[...q2].sort((a, b) => b.score - a.score).slice(0, 15).forEach(r => {
  const tags = [];
  if (r.dRiel <= 10) tags.push("RIEL " + r.dRiel + "km");
  if (r.dFront <= 100) tags.push("FRONTERA " + r.dFront + "km");
  console.log("  " + (r.mun + " (" + r.edo + ")").padEnd(40) + " score " + String(Math.round(r.score)).padStart(4) + "  " + (tags.join(" · ") || "interior, riel a " + r.dRiel + "km"));
});

// guardar dataset cruzado
let csv = "cve_mun,municipio,estado,cuadrante,score,delta_homicidio_pct,delta_control_pct,km_a_via_ferrea,km_a_frontera_norte\n";
rows.forEach(r => csv += `${r.cve},"${r.mun}","${r.edo}",${r.cuadrante},${r.score},${r.dH_pct},${r.dC_pct},${r.dRiel},${r.dFront}\n`);
fs.writeFileSync(B + "/datos/radar_cruce_ferro_frontera.csv", csv, "utf8");
console.log("\n-> datos/radar_cruce_ferro_frontera.csv");
