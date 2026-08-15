// RADAR DE CONSOLIDACIÓN CRIMINAL — dataset (2 ventanas) + registro en tabla maestra
const fs = require("fs");
const BASE = "C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const rd = f => eval("(" + fs.readFileSync(f, "utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/, "").replace(/;\s*$/, "") + ")");

const SM = {}; for (let c = 1; c <= 32; c++) SM[c] = rd(BASE + "/series_mensuales/sm_" + String(c).padStart(2, "0") + ".js");
const P = rd(BASE + "/_nac_estatal_pop.js");
const G = rd(BASE + "/mexico_estados.geojson.js");
const NAME = {}; G.features.forEach(f => NAME[f.properties.clave_ent] = f.properties.nombre_corto || f.properties.nombre);
const L = SM[1].labels, idx = ym => L.indexOf(ym);

const annual = (c, dn, y) => { const a = SM[c].delitos[dn] || []; let s = 0; for (let m = 1; m <= 12; m++) { const i = idx(y + "-" + String(m).padStart(2, "0")); if (i >= 0) s += a[i] || 0; } return s; };
const rate = (c, dn, y) => { const pop = (P.p[String(c)] || [])[y - 2015] || 1; return annual(c, dn, y) / pop * 1e5; };

function ventana(y0, y1) {
  const rows = [];
  for (let c = 1; c <= 32; c++) {
    const h0 = rate(c, "Homicidio doloso", y0), h1 = rate(c, "Homicidio doloso", y1);
    const c0 = rate(c, "Extorsión", y0) + rate(c, "Narcomenudeo", y0);
    const c1 = rate(c, "Extorsión", y1) + rate(c, "Narcomenudeo", y1);
    const dH = (h1 / h0 - 1) * 100, dC = (c1 / c0 - 1) * 100;
    const q = dH < 0 ? (dC > 0 ? "Q2" : "Q1") : (dC > 0 ? "Q3" : "Q4");
    rows.push({
      cve: c, estado: NAME[c],
      h_ini: +h0.toFixed(2), h_fin: +h1.toFixed(2), dH_pct: +dH.toFixed(1),
      c_ini: +c0.toFixed(2), c_fin: +c1.toFixed(2), dC_pct: +dC.toFixed(1),
      cuadrante: q, score: +((-dH) + dC).toFixed(1),
    });
  }
  return rows;
}

const V19 = ventana(2019, 2025), V23 = ventana(2023, 2025);

// 1) CSV del dataset (fuente trazable)
let csv = "ventana,cve_ent,estado,tasa_homicidio_inicial,tasa_homicidio_final,delta_homicidio_pct,tasa_control_inicial,tasa_control_final,delta_control_pct,cuadrante,score\n";
V19.forEach(r => csv += `2019-2025,${r.cve},${r.estado},${r.h_ini},${r.h_fin},${r.dH_pct},${r.c_ini},${r.c_fin},${r.dC_pct},${r.cuadrante},${r.score}\n`);
V23.forEach(r => csv += `2023-2025,${r.cve},${r.estado},${r.h_ini},${r.h_fin},${r.dH_pct},${r.c_ini},${r.c_fin},${r.dC_pct},${r.cuadrante},${r.score}\n`);
fs.writeFileSync(BASE + "/datos/radar_consolidacion.csv", csv, "utf8");

// 2) JS para la futura página del radar
fs.writeFileSync(BASE + "/_radar_data.js",
  "const RADAR_DATA = " + JSON.stringify({
    nota: "Radar de consolidación criminal. control = extorsión + narcomenudeo (tasas/100k). Q1 todo baja, Q2 H baja y control sube (consolidación candidata), Q3 todo sube (disputa), Q4 H sube y control baja. 2026 excluido (preliminar). Serie armonizada anti-RNID.",
    ventanas: { "2019-2025": V19, "2023-2025": V23 },
  }) + ";\n", "utf8");

// 3) Filas para la tabla maestra
const q2_19 = V19.filter(r => r.cuadrante === "Q2");
const q2_23 = V23.filter(r => r.cuadrante === "Q2");
const slp = V19.find(r => r.estado.includes("San Luis"));
const sin = V19.find(r => r.estado === "Sinaloa");
const mor = V19.find(r => r.estado === "Morelos");
const F = "datos/radar_consolidacion.csv";
const MET = "tasas/100k anuales (series mensuales armonizadas sm_XX + población CONAPO); control = extorsión + narcomenudeo; cuadrante Q2 si ΔH<0 y Δcontrol>0; 2026 excluido por preliminar";
const esc = s => '"' + String(s).replace(/"/g, "'") + '"';
const rows = [
  ["RADAR-001", "Radar consolidación · hallazgo central", `${q2_19.length} de 32 estados`, "Cuadrante Q2 (homicidio BAJA + extorsión/narco SUBEN) ventana 2019-2025 · firma de consolidación criminal, no de pacificación", F, MET, "2025-12", "VERIFICADO", "Es un RADAR de patrones consistentes con consolidación (Durán-Martínez 2018; Trejo-Ley 2020), NO prueba de pactos ni imputación · candados: narcomenudeo operativo-dependiente, extorsión cifra negra 97% (ENVIPE)"],
  ["RADAR-002", "Radar consolidación · caso extremo", `SLP: H ${slp.dH_pct}% / control +${slp.dC_pct}%`, "San Luis Potosí, el Q2 más pronunciado del país 2019-2025", F, MET, "2025-12", "VERIFICADO", `score ${slp.score} · tasa control pasó de ${slp.c_ini} a ${slp.c_fin} por 100k`],
  ["RADAR-003", "Radar consolidación · coherencia del modelo", `Sinaloa único Q4: H +${sin.dH_pct}% / control ${sin.dC_pct}%`, "La guerra rompe el cobro: donde la plaza se disputa, sube la sangre y cae el control 2019-2025", F, MET, "2025-12", "VERIFICADO", "Consistente con la teoría: la violencia visible sube cuando el mercado criminal está en disputa (Durán-Martínez)"],
  ["RADAR-004", "Radar consolidación · Morelos", `Morelos Q3 disputa: H +${mor.dH_pct}% / control +${mor.dC_pct}%`, "Morelos en cuadrante de DISPUTA 2019-2025 (ambos suben): plaza en pelea, no consolidada", F, MET, "2025-12", "VERIFICADO", "Conecta con el expediente Morelos: extorsión #1 nacional y homicidio #2 por tasa en 2026s1"],
  ["RADAR-005", "Radar consolidación · ventana corta", `${q2_23.length} de 32 estados en Q2 (2023-2025)`, "El patrón de consolidación en la ventana reciente (administración actual)", F, MET, "2025-12", "VERIFICADO", "Toggle de ventana para blindar contra acusación de marco escogido"],
  ["ESPEJO-001", "Espejo RNID · robo de vehículo", "59,425 → 0 → 49,398", "Con la metodología RNID 2026 el 'Robo de vehículo automotor' cae a CERO por su nombre y reaparece en subtipos (coche 28,583 + moto 20,804 + embarcaciones 11) · ene-jun nacional", "datos/espejo_rnid_2026.csv", "comparación catálogo CNSP 2025 vs RNID 2026 en crudos municipales SESNSP (_espejo_rnid.py)", "2026-06", "VERIFICADO", "Quien compare por el nombre de siempre ve caídas de 100% que nunca ocurrieron"],
  ["ESPEJO-002", "Espejo RNID · narcomenudeo y extorsión", "52,001→51,929 · 5,648→5,331", "Narcomenudeo y extorsión también caen a cero por nombre y reaparecen en subtipos (posesión/venta; presencial/otros medios + tentativas) · ene-jun nacional", "datos/espejo_rnid_2026.csv", "6 subtipos vaciados = 118,203 carpetas; 30 subtipos nuevos = 140,513", "2026-06", "VERIFICADO", "El volumen se conserva: es reclasificación, no reducción"],
  ["ESPEJO-003", "Espejo RNID · límite honesto", "homicidio SIN espejo", "No existe subtipo espejo que absorba homicidio consumado: solo tentativas (1,229 hd + 452 fem) · la baja del homicidio NO es artefacto de etiqueta", "datos/espejo_rnid_2026.csv", "revisión de subtipos nuevos bajo tipo 'Homicidio'/'Feminicidio' en RNID 2026", "2026-06", "VERIFICADO", "Candado del hallazgo: el espejo fabrica bajas espurias en delitos renombrados, no oculta muertos"],
];
const lines = rows.map(r => [r[0], esc(r[1]), esc(r[2]), esc(r[3]), esc(r[4]), esc(r[5]), r[6], r[7], esc(r[8])].join(","));
fs.appendFileSync(BASE + "/datos/cifras.csv", lines.join("\n") + "\n", "utf8");

console.log("dataset:", V19.length + V23.length, "filas ->", "datos/radar_consolidacion.csv + _radar_data.js");
console.log("maestra: +" + rows.length + " filas (RADAR-001..005, ESPEJO-001..003)");
console.log("Q2 2019-2025:", q2_19.length, "| Q2 2023-2025:", q2_23.length);
console.log("SLP:", JSON.stringify(slp));
console.log("Sinaloa:", JSON.stringify(sin));
console.log("Morelos:", JSON.stringify(mor));
