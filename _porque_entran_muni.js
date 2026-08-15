// ¿Por qué entran los que entran al radar municipal y por qué los demás no?
// Replica EXACTO el filtro de _gen_radar_muni.js y cuenta a cuántos mata cada criterio,
// con lo que cada grupo representa en población, homicidios y cobro.
const fs = require("fs");
const BASE = "C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const rd = f => eval("(" + fs.readFileSync(f, "utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/, "").replace(/;\s*$/, "") + ")");

const MU = rd(BASE + "/_nac_muni_data.js");
const GEO = rd(BASE + "/_nac_muni_geo.js");
const PM = rd(BASE + "/_nac_muni_pop.js");
const NM = {}; GEO.features.forEach(f => { const k = String(f.properties.k).padStart(5, "0"); NM[k] = 1; });

const iH = MU.delitos.indexOf("Homicidio doloso");
const iE = MU.delitos.indexOf("Extorsión");
const iN = MU.delitos.indexOf("Narcomenudeo");
const yi = y => MU.anios.indexOf(y) >= 0 ? MU.anios.indexOf(y) : (y - 2015);
const val = (k, di, y) => ((MU.d[k] && MU.d[k][di]) ? (MU.d[k][di][yi(y)] || 0) : 0);
const pop = (k, y) => { const a = (PM.p && (PM.p[k] || PM.p[String(k)])) || null; if (!a) return 0; const i = (PM.anios ? PM.anios.indexOf(y) : -1); return a[i >= 0 ? i : (y - 2015)] || 0; };

const MINPOP = 50000, MINEV = 12, MINBASE = 5, Y0 = 2019, Y1 = 2025;
const B = {};                       // buckets
const add = (n, k, p, h, c) => { (B[n] = B[n] || { n: 0, pob: 0, h: 0, c: 0 }); B[n].n++; B[n].pob += p; B[n].h += h; B[n].c += c; };

let TOT = { n: 0, pob: 0, h: 0, c: 0 };
Object.keys(MU.d).forEach(k => {
  const key = String(k).padStart(5, "0");
  const p1 = pop(k, Y1);
  const h1 = val(k, iH, Y1), c1 = val(k, iE, Y1) + val(k, iN, Y1);
  TOT.n++; TOT.pob += p1; TOT.h += h1; TOT.c += c1;

  if (!NM[key])                    return add("1 sin geometría en el mapa", key, p1, h1, c1);
  const p0 = pop(k, Y0);
  if (!p0 || !p1)                  return add("2 sin serie de población", key, p1, h1, c1);
  if (p1 < MINPOP)                 return add("3 menos de 50 mil habitantes", key, p1, h1, c1);
  const h0 = val(k, iH, Y0), c0 = val(k, iE, Y0) + val(k, iN, Y0);
  if ((h0 + h1) < MINEV || (c0 + c1) < MINEV) return add("4 muy pocos casos en total (menos de 12 en un eje)", key, p1, h1, c1);
  if (h0 < MINBASE || c0 < MINBASE)           return add("5 base de 2019 demasiado chica (menos de 5)", key, p1, h1, c1);
  const th0 = h0 / p0 * 1e5, tc0 = c0 / p0 * 1e5;
  if (th0 <= 0 || tc0 <= 0)        return add("6 tasa inicial en cero", key, p1, h1, c1);
  add("0 ENTRAN AL RADAR", key, p1, h1, c1);
});

const pc = (a, b) => (100 * a / b).toFixed(1) + "%";
console.log("=== POR QUÉ ENTRAN LOS QUE ENTRAN · ventana " + Y0 + "-" + Y1 + " ===");
console.log("universo: " + TOT.n + " municipios y demarcaciones con registro en la matriz\n");
console.log("grupo".padEnd(52) + "muni".padStart(6) + "población".padStart(13) + "homicidios".padStart(12) + "cobro".padStart(11));
Object.keys(B).sort().forEach(k => {
  const b = B[k];
  console.log(k.padEnd(52) + String(b.n).padStart(6) + pc(b.pob, TOT.pob).padStart(13) + pc(b.h, TOT.h).padStart(12) + pc(b.c, TOT.c).padStart(11));
});
const e = B["0 ENTRAN AL RADAR"];
console.log("\nEn una línea: " + e.n + " municipios, " + (e.pob / 1e6).toFixed(1) + " millones de habitantes (" +
  pc(e.pob, TOT.pob) + "), " + pc(e.h, TOT.h) + " de los homicidios y " + pc(e.c, TOT.c) + " del cobro del país.");
