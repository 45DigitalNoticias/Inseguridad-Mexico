// ¿Cuánto país representan los 315 municipios analizables del radar?
const fs = require("fs");
const B = "C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const rd = f => eval("(" + fs.readFileSync(f, "utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/, "").replace(/;\s*$/, "") + ")");

const MU = rd(B + "/_nac_muni_data.js");
const PM = rd(B + "/_nac_muni_pop.js");
const RAD = rd(B + "/_radar_muni_data.js").ventanas["2019-2025"];
const inRadar = new Set(RAD.map(r => r.cve));

const iH = MU.delitos.indexOf("Homicidio doloso");
const iE = MU.delitos.indexOf("Extorsión");
const iN = MU.delitos.indexOf("Narcomenudeo");
const iT = MU.delitos.indexOf("TOTAL ESTATAL");
const Y = 2025, yi = MU.anios.indexOf(Y) >= 0 ? MU.anios.indexOf(Y) : (Y - 2015);
const v = (k, di) => ((MU.d[k] && MU.d[k][di]) ? (MU.d[k][di][yi] || 0) : 0);
const pop = k => { const a = (PM.p && (PM.p[k] || PM.p[String(k)])) || null; if (!a) return 0; const i = (PM.anios ? PM.anios.indexOf(Y) : -1); return a[i >= 0 ? i : (Y - 2015)] || 0; };

let tot = { n: 0, pob: 0, h: 0, c: 0, t: 0 }, dentro = { n: 0, pob: 0, h: 0, c: 0, t: 0 };
let chicos = 0, chicosPob = 0;
Object.keys(MU.d).forEach(k => {
  const key = String(k).padStart(5, "0");
  const p = pop(k), h = v(k, iH), c = v(k, iE) + v(k, iN), t = iT >= 0 ? v(k, iT) : 0;
  tot.n++; tot.pob += p; tot.h += h; tot.c += c; tot.t += t;
  if (inRadar.has(key)) { dentro.n++; dentro.pob += p; dentro.h += h; dentro.c += c; dentro.t += t; }
  else if (p > 0 && p < 50000) { chicos++; chicosPob += p; }
});
const pc = (a, b) => (100 * a / b).toFixed(1) + "%";
console.log("=== COBERTURA DEL RADAR MUNICIPAL (año 2025) ===");
console.log("municipios en el radar : " + dentro.n + " de " + tot.n + "  (" + pc(dentro.n, tot.n) + " de las unidades)");
console.log("POBLACIÓN cubierta     : " + (dentro.pob / 1e6).toFixed(1) + " M de " + (tot.pob / 1e6).toFixed(1) + " M  -> " + pc(dentro.pob, tot.pob));
console.log("HOMICIDIOS cubiertos   : " + dentro.h.toLocaleString("es-MX") + " de " + tot.h.toLocaleString("es-MX") + "  -> " + pc(dentro.h, tot.h));
console.log("EXTORSIÓN+NARCO        : " + dentro.c.toLocaleString("es-MX") + " de " + tot.c.toLocaleString("es-MX") + "  -> " + pc(dentro.c, tot.c));
if (tot.t) console.log("TODOS LOS DELITOS      : " + dentro.t.toLocaleString("es-MX") + " de " + tot.t.toLocaleString("es-MX") + "  -> " + pc(dentro.t, tot.t));
console.log("\nmunicipios menores de 50 mil hab: " + chicos + " (" + (chicosPob / 1e6).toFixed(1) + " M hab, " + pc(chicosPob, tot.pob) + " del país)");
