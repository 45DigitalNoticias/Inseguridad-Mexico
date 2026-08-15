// Registra el radar MUNICIPAL en la tabla maestra (datos/cifras.csv)
const fs = require("fs");
const rd = f => eval("(" + fs.readFileSync(f, "utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/, "").replace(/;\s*$/, "") + ")");
const V = rd("_radar_muni_data.js").ventanas["2019-2025"];
const q2 = V.filter(r => r.cuadrante === "Q2").sort((a, b) => b.score - a.score);
const top = q2[0], cul = V.find(r => r.mun === "Culiacán");
const F = "datos/radar_consolidacion_municipal.csv";
const MET = "tasas/100k por municipio (matriz anual + poblacion CONAPO); control = extorsion + narcomenudeo; filtros: pob>=50k, >=12 eventos por eje y >=5 en el anio inicial (evita ratios de base cero); 2026 excluido";
const q = s => '"' + String(s).replace(/"/g, "'") + '"';

const rows = [
  ["RADARMUN-001", "Radar municipal · hallazgo", q2.length + " de " + V.length + " municipios",
   "Cuadrante Q2 (homicidio baja + control sube) a escala municipal, ventana 2019-2025", F, MET, "2025-12", "VERIFICADO",
   "Muestra: municipios de 50 mil habitantes o mas con base suficiente. Radar de patrones, NO veredicto"],
  ["RADARMUN-002", "Radar municipal · caso extremo", top.mun + " (" + top.edo + "): H " + top.dH_pct + "% / control +" + top.dC_pct + "%",
   "El municipio con el patron mas pronunciado del pais", F, MET, "2025-12", "VERIFICADO",
   "score " + top.score + " · tasa control de " + top.c_ini + " a " + top.c_fin + " por 100k"],
  ["RADARMUN-003", "Radar municipal · coherencia del modelo", "Culiacan Q4: H +" + cul.dH_pct + "% / control " + cul.dC_pct + "%",
   "La guerra rompe el cobro: en la plaza en disputa sube la sangre y cae el control", F, MET, "2025-12", "VERIFICADO",
   "Validacion interna del modelo a escala municipal (Duran-Martinez 2018)"],
  ["RADARMUN-004", "Radar municipal · concentracion", "San Luis Potosi 6/6 municipios en Q2",
   "El estado con el 100% de sus municipios analizables en cuadrante de consolidacion", F, MET, "2025-12", "VERIFICADO",
   "Le siguen Nuevo Leon 12/14, Quintana Roo 4/5, Veracruz 21/27, Guanajuato 20/27"],
  ["RADARMUN-005", "Radar municipal · filtro anti-artefacto", V.length + " de 2,478 municipios",
   "Solo entran los que tienen base estadistica suficiente", F, MET, "2025-12", "VERIFICADO",
   "Sin el umbral de base inicial aparecian falsos +11,000% (Villa de Alvarez) y +3,835% (Apaseo el Alto): en municipios chicos un caso mueve el porcentaje"],
];
const lines = rows.map(r => [r[0], q(r[1]), q(r[2]), q(r[3]), q(r[4]), q(r[5]), r[6], r[7], q(r[8])].join(","));
fs.appendFileSync("datos/cifras.csv", lines.join("\n") + "\n", "utf8");
console.log("maestra: +" + rows.length + " filas (RADARMUN-001..005)");
console.log("top:", top.mun, top.edo, "| Culiacan Q4:", cul.dH_pct + "% /", cul.dC_pct + "%");
