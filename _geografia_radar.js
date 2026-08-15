// ¿Los Q2 forman bloques continuos (ruta)? ¿Las disputas viven en sus bordes?
const fs = require("fs");
const B = "C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const rd = f => eval("(" + fs.readFileSync(f, "utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/, "").replace(/;\s*$/, "") + ")");
const GEO = rd(B + "/_nac_muni_geo.js");
const RAD = rd(B + "/_radar_muni_data.js").ventanas["2019-2025"];

const polysOf = ft => ft.geometry.type === "Polygon" ? [ft.geometry.coordinates] : ft.geometry.coordinates;
const CENT = {};
GEO.features.forEach(f => {
  let bx = -1, best = null;
  polysOf(f).forEach(poly => { const r = poly[0]; let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < r.length - 1; i++) { const [x1, y1] = r[i], [x2, y2] = r[i + 1]; const cr = x1 * y2 - x2 * y1; a += cr; cx += (x1 + x2) * cr; cy += (y1 + y2) * cr; }
    a *= .5; if (Math.abs(a) > bx) { bx = Math.abs(a); best = [cx / (6 * a), cy / (6 * a)]; } });
  CENT[String(f.properties.k).padStart(5, "0")] = best;
});
const N = RAD.filter(r => CENT[r.cve]).map(r => ({ ...r, c: CENT[r.cve] }));
const KM = (a, b) => Math.hypot((a[0] - b[0]) * 111 * Math.cos(a[1] * Math.PI / 180), (a[1] - b[1]) * 111);
const R = 100; // vecindad, km

// vecinos dentro del radar
N.forEach(m => m.vec = N.filter(o => o !== m && KM(m.c, o.c) <= R));

// 1) ¿los Q2 se pegan entre sí? (autocorrelación simple)
const share = (set, q) => { const v = set.flatMap(m => m.vec); return v.length ? 100 * v.filter(o => o.cuadrante === q).length / v.length : 0; };
const Q2 = N.filter(m => m.cuadrante === "Q2"), DIS = N.filter(m => m.cuadrante === "Q3" || m.cuadrante === "Q4"), Q1 = N.filter(m => m.cuadrante === "Q1");
const baseQ2 = 100 * Q2.length / N.length;
console.log("=== ¿SE AGRUPAN? (vecindad " + R + " km, dentro de la muestra) ===");
console.log("proporción de Q2 en el país (base)      : " + baseQ2.toFixed(1) + "%");
console.log("vecinos Q2 de un municipio Q2           : " + share(Q2, "Q2").toFixed(1) + "%");
console.log("vecinos Q2 de un municipio EN DISPUTA   : " + share(DIS, "Q2").toFixed(1) + "%");
console.log("vecinos Q2 de un municipio Q1           : " + share(Q1, "Q1") ? "" : "");
console.log("");

// 2) bloques continuos de Q2 (componentes conexas) = los "corredores"
const seen = new Set(); const bloques = [];
Q2.forEach(m => {
  if (seen.has(m.cve)) return;
  const cola = [m], comp = []; seen.add(m.cve);
  while (cola.length) { const x = cola.pop(); comp.push(x);
    x.vec.filter(o => o.cuadrante === "Q2" && !seen.has(o.cve)).forEach(o => { seen.add(o.cve); cola.push(o); }); }
  bloques.push(comp);
});
bloques.sort((a, b) => b.length - a.length);
console.log("=== BLOQUES CONTINUOS DE CONSOLIDACIÓN (Q2 encadenados a " + R + " km) ===");
console.log("bloques: " + bloques.length + " | el mayor: " + bloques[0].length + " municipios");
bloques.slice(0, 5).forEach((b, i) => {
  const edos = [...new Set(b.map(m => m.edo))];
  const top = [...b].sort((x, y) => y.score - x.score)[0];
  const lons = b.map(m => m.c[0]), lats = b.map(m => m.c[1]);
  const ext = KM([Math.min(...lons), (Math.min(...lats) + Math.max(...lats)) / 2], [Math.max(...lons), (Math.min(...lats) + Math.max(...lats)) / 2]);
  console.log(" " + (i + 1) + ") " + b.length + " municipios · " + edos.length + " estados (" + edos.slice(0, 6).join(", ") + (edos.length > 6 ? "…" : "") + ")");
  console.log("     extensión E-O ~" + Math.round(ext) + " km · núcleo: " + top.mun + " (" + top.edo + ")");
});
console.log("");

// 3) ¿las disputas están en el BORDE de los bloques?
const mix = m => { const v = m.vec; if (!v.length) return null; const q2 = v.filter(o => o.cuadrante === "Q2").length; return { q2, tot: v.length, sh: q2 / v.length }; };
const med = a => { const s = a.filter(x => x !== null).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const interiorQ2 = Q2.map(m => { const x = mix(m); return x ? x.sh : null; }).filter(x => x !== null);
const bordeDis = DIS.map(m => { const x = mix(m); return x ? x.sh : null; }).filter(x => x !== null);
console.log("=== ¿LA DISPUTA VIVE EN EL BORDE? ===");
console.log("un Q2 tiene, en promedio, " + (100 * interiorQ2.reduce((a, b) => a + b, 0) / interiorQ2.length).toFixed(0) + "% de vecinos Q2");
console.log("un municipio EN DISPUTA tiene " + (100 * bordeDis.reduce((a, b) => a + b, 0) / bordeDis.length).toFixed(0) + "% de vecinos Q2");
const aislados = DIS.filter(m => !m.vec.length).length;
console.log("disputas sin vecinos en la muestra: " + aislados + " de " + DIS.length);
console.log("");
console.log("=== LOS 10 EN DISPUTA MÁS RODEADOS DE CONSOLIDACIÓN (frontera de plaza) ===");
DIS.map(m => ({ m, x: mix(m) })).filter(o => o.x && o.x.tot >= 3).sort((a, b) => b.x.sh - a.x.sh || b.m.dH_pct - a.m.dH_pct).slice(0, 10)
  .forEach(o => console.log("  " + (o.m.mun + " (" + o.m.edo + ")").padEnd(36) + " H +" + o.m.dH_pct.toFixed(0) + "%  vecinos Q2: " + Math.round(o.x.sh * 100) + "% de " + o.x.tot));
