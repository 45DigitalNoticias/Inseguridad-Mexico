// RADAR MUNICIPAL — mismo indicador, escala municipio (matriz anual _nac_muni_data.js)
const fs = require("fs");
const BASE = "C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const rd = f => eval("(" + fs.readFileSync(f, "utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/, "").replace(/;\s*$/, "") + ")");

const MU = rd(BASE + "/_nac_muni_data.js");
const GEO = rd(BASE + "/_nac_muni_geo.js");
const PM = rd(BASE + "/_nac_muni_pop.js");
const G = rd(BASE + "/mexico_estados.geojson.js");
const ENT = {}; G.features.forEach(f => ENT[f.properties.clave_ent] = f.properties.nombre_corto || f.properties.nombre);
const NM = {}; GEO.features.forEach(f => { const k = String(f.properties.k).padStart(5, "0"); NM[k] = { n: f.properties.n, e: f.properties.e }; });

const iH = MU.delitos.indexOf("Homicidio doloso");
const iE = MU.delitos.indexOf("Extorsión");
const iN = MU.delitos.indexOf("Narcomenudeo");
// índices de año: anios = [2015..2025, "2026 ene-jun"]
const yi = y => MU.anios.indexOf(y) >= 0 ? MU.anios.indexOf(y) : (y - 2015);
const val = (k, di, y) => ((MU.d[k] && MU.d[k][di]) ? (MU.d[k][di][yi(y)] || 0) : 0);
const pop = (k, y) => { const arr = (PM.p && (PM.p[k] || PM.p[String(k)])) || null; if (!arr) return 0; const i = (PM.anios ? PM.anios.indexOf(y) : -1); return arr[i >= 0 ? i : (y - 2015)] || 0; };

function ventana(y0, y1, minPop, minEventos, minBase) {
  const rows = [];
  Object.keys(MU.d).forEach(k => {
    const key = String(k).padStart(5, "0");
    const meta = NM[key]; if (!meta) return;
    const p0 = pop(k, y0), p1 = pop(k, y1);
    if (!p0 || !p1 || p1 < minPop) return;
    const h0 = val(k, iH, y0), h1 = val(k, iH, y1);
    const c0 = val(k, iE, y0) + val(k, iN, y0), c1 = val(k, iE, y1) + val(k, iN, y1);
    // umbral de eventos: evita municipios donde 1 caso = 300%
    if ((h0 + h1) < minEventos || (c0 + c1) < minEventos) return;
    // BASE INICIAL mínima: sin esto, pasar de 1 a 40 casos da +3900% y no significa nada
    if (h0 < minBase || c0 < minBase) return;
    const th0 = h0 / p0 * 1e5, th1 = h1 / p1 * 1e5;
    const tc0 = c0 / p0 * 1e5, tc1 = c1 / p1 * 1e5;
    if (th0 <= 0 || tc0 <= 0) return;
    const dH = (th1 / th0 - 1) * 100, dC = (tc1 / tc0 - 1) * 100;
    const q = dH < 0 ? (dC > 0 ? "Q2" : "Q1") : (dC > 0 ? "Q3" : "Q4");
    rows.push({
      cve: key, mun: meta.n, edo: meta.e, cve_ent: +key.slice(0, 2),
      pob: p1, h_ini: +th0.toFixed(2), h_fin: +th1.toFixed(2), dH_pct: +dH.toFixed(1),
      c_ini: +tc0.toFixed(2), c_fin: +tc1.toFixed(2), dC_pct: +dC.toFixed(1),
      abs_h: h1, abs_c: c1, cuadrante: q, score: +((-dH) + dC).toFixed(1),
    });
  });
  return rows;
}

const MINPOP = 50000, MINEV = 12, MINBASE = 5;
const V19 = ventana(2019, 2025, MINPOP, MINEV, MINBASE);
const V23 = ventana(2023, 2025, MINPOP, MINEV, MINBASE);

let csv = "ventana,cve_mun,municipio,estado,poblacion,tasa_homicidio_ini,tasa_homicidio_fin,delta_homicidio_pct,tasa_control_ini,tasa_control_fin,delta_control_pct,carpetas_homicidio_fin,carpetas_control_fin,cuadrante,score\n";
const line = (v, r) => `${v},${r.cve},"${r.mun}","${r.edo}",${r.pob},${r.h_ini},${r.h_fin},${r.dH_pct},${r.c_ini},${r.c_fin},${r.dC_pct},${r.abs_h},${r.abs_c},${r.cuadrante},${r.score}\n`;
V19.forEach(r => csv += line("2019-2025", r)); V23.forEach(r => csv += line("2023-2025", r));
fs.writeFileSync(BASE + "/datos/radar_consolidacion_municipal.csv", csv, "utf8");

fs.writeFileSync(BASE + "/_radar_muni_data.js",
  "const RADAR_MUNI = " + JSON.stringify({
    nota: `Radar municipal. Filtros: población ≥${MINPOP}, ≥${MINEV} eventos sumados por eje y ≥${MINBASE} en el año inicial de cada eje (evita que 1 caso = 300%). control = extorsión + narcomenudeo. 2026 excluido (preliminar).`,
    minPop: MINPOP, minEv: MINEV, minBase: MINBASE,
    ventanas: { "2019-2025": V19, "2023-2025": V23 },
  }) + ";\n", "utf8");

const q2 = V19.filter(r => r.cuadrante === "Q2").sort((a, b) => b.score - a.score);
console.log("municipios analizados:", V19.length, "| ventana corta:", V23.length);
console.log("Q2:", q2.length, "| Q3:", V19.filter(r => r.cuadrante === "Q3").length, "| Q1:", V19.filter(r => r.cuadrante === "Q1").length, "| Q4:", V19.filter(r => r.cuadrante === "Q4").length);
console.log("\nTOP 12 Q2 (consolidación candidata):");
q2.slice(0, 12).forEach(r => console.log("  " + (r.mun + " (" + r.edo + ")").padEnd(38) + " H " + r.dH_pct.toFixed(0) + "%  C +" + r.dC_pct.toFixed(0) + "%  score " + r.score.toFixed(0)));
const mor = V19.filter(r => r.cve_ent === 17).sort((a, b) => b.score - a.score);
console.log("\nMORELOS:");
mor.forEach(r => console.log("  " + r.mun.padEnd(22) + " " + r.cuadrante + "  H " + r.dH_pct.toFixed(0) + "%  C " + (r.dC_pct > 0 ? "+" : "") + r.dC_pct.toFixed(0) + "%"));
