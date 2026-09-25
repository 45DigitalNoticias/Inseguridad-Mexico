/* ============================================================
 * morelos_opacidad.js — sNAC7 · Transparencia institucional
 * Cruza tres dimensiones por estado:
 *   - opacidad   : % registros RNPDNO con campos en CONFIDENCIAL
 *   - desap_var  : variacion mensual desapariciones sep24-nov25 vs sep23-ago24
 *   - hd_oficial : variacion diaria homicidio doloso T1 2026 vs T1 2025 (SESNSP, donde es publica)
 *   - vol_abr26  : participacion % en total nacional abril 2026 (donde es publica)
 *
 * Fuentes:
 *   - RNPDNO publico, snapshot 1-dic-2025 (calculado a partir de rnpdno_data.csv)
 *   - SESNSP, comunicado Marcela Figueroa Franco, manianera 12-may-2026
 *
 * Calculado: 13-may-2026
 * ============================================================ */
window.OPACIDAD_DATA = {
  // Cifra agregada nacional segun cifras oficiales SESNSP corte 30-abr-2026
  national: {
    hd_baja_pct: -40.0,                  // sep-2024 a abr-2026
    hd_periodo: "sep-2024 a abr-2026",
    hd_dia_inicio: 86.9,
    hd_dia_final: 52.5,
    hd_dia_menos: 34.4,
    hd_anual_menos: 12410,               // 34 victimas/dia x 365 dias
    abr26_mes_mas_bajo: true,
    estados_con_baja: 26,
    estados_con_alza: 6,
    fuente: "SESNSP · Comunicado 12-may-2026 (Marcela Figueroa Franco)"
  },

  // Cifra agregada RNPDNO (calculado del CSV oficial)
  rnpdno: {
    total_registros: 129452,
    confidenciales: 48418,
    pct_confidencial: 37.4,
    desap_mensual_pre: 539.9,            // sep23-ago24, 12 meses, NO confidenciales
    desap_mensual_sh:  723.5,            // sep24-nov25, 15 meses, NO confidenciales
    desap_var_pct: +34.0,
    corte: "RNPDNO snapshot 1-dic-2025"
  },

  // 32 estados, ordenados de mayor a menor opacidad
  // hd_oficial: null si no hay dato publico verificado
  // vol_abr26 : null si no aparece en el top 8 nacional publicado
  estados: [
    { nombre: "Jalisco",            opacidad: 67.0, conf: 9213, tot: 13746, desap_var: +201.7, hd_oficial: null,  vol_abr26: null },
    { nombre: "Nayarit",            opacidad: 66.3, conf: 1317, tot:  1987, desap_var:  +13.2, hd_oficial: null,  vol_abr26: null },
    { nombre: "Yucatán",            opacidad: 62.5, conf:  193, tot:   309, desap_var:    null, hd_oficial: null, vol_abr26: null },
    { nombre: "CDMX",               opacidad: 59.9, conf: 4304, tot:  7183, desap_var:  +79.5, hd_oficial: null,  vol_abr26: null },
    { nombre: "Guanajuato",         opacidad: 59.8, conf: 3218, tot:  5378, desap_var:  -20.5, hd_oficial: null,  vol_abr26: 8.2 },
    { nombre: "Puebla",             opacidad: 59.4, conf: 1698, tot:  2857, desap_var:  +23.1, hd_oficial: null,  vol_abr26: null },
    { nombre: "Campeche",           opacidad: 55.4, conf:   82, tot:   148, desap_var:    null, hd_oficial: null, vol_abr26: null },
    { nombre: "Baja California Sur",opacidad: 53.0, conf:  566, tot:  1067, desap_var:    null, hd_oficial: null, vol_abr26: null },
    { nombre: "Nuevo León",         opacidad: 49.0, conf: 3469, tot:  7082, desap_var:  -20.0, hd_oficial: null,  vol_abr26: null },
    { nombre: "Oaxaca",             opacidad: 46.7, conf:  334, tot:   715, desap_var:  +20.0, hd_oficial: null,  vol_abr26: null },
    { nombre: "Aguascalientes",     opacidad: 46.3, conf:  228, tot:   492, desap_var:    null, hd_oficial: null, vol_abr26: null },
    { nombre: "Morelos",            opacidad: 40.7, conf:  832, tot:  2042, desap_var:   +7.7, hd_oficial: null,  vol_abr26: 7.1, highlight: true },
    { nombre: "San Luis Potosí",    opacidad: 40.7, conf:  504, tot:  1238, desap_var:  +12.0, hd_oficial: -80.8, vol_abr26: null, flag_oficial: true },
    { nombre: "Zacatecas",          opacidad: 39.7, conf: 1531, tot:  3860, desap_var:  -60.4, hd_oficial: -61.8, vol_abr26: null, flag_oficial: true },
    { nombre: "Durango",            opacidad: 39.6, conf:  424, tot:  1072, desap_var:    null, hd_oficial: null, vol_abr26: null },
    { nombre: "Tamaulipas",         opacidad: 39.1, conf: 5219, tot: 13336, desap_var: +122.7, hd_oficial: null,  vol_abr26: null },
    { nombre: "Tlaxcala",           opacidad: 39.1, conf:   79, tot:   202, desap_var:    null, hd_oficial: null, vol_abr26: null },
    { nombre: "Quintana Roo",       opacidad: 35.6, conf:  601, tot:  1689, desap_var:  +63.6, hd_oficial: -60.3, vol_abr26: null, flag_oficial: true },
    { nombre: "Veracruz",           opacidad: 34.8, conf: 2359, tot:  6779, desap_var:  -45.4, hd_oficial: null,  vol_abr26: 5.6 },
    { nombre: "Baja California",    opacidad: 33.8, conf: 1566, tot:  4635, desap_var:  +19.9, hd_oficial: null,  vol_abr26: 6.4 },
    { nombre: "Coahuila",           opacidad: 29.6, conf: 1071, tot:  3618, desap_var:  -78.7, hd_oficial: null,  vol_abr26: null },
    { nombre: "Sinaloa",            opacidad: 28.7, conf: 1925, tot:  6709, desap_var: +364.1, hd_oficial: null,  vol_abr26: 6.4 },
    { nombre: "Estado de México",   opacidad: 22.2, conf: 3234, tot: 14544, desap_var:  +78.8, hd_oficial: null,  vol_abr26: 5.7 },
    { nombre: "Sonora",             opacidad: 22.0, conf: 1271, tot:  5769, desap_var:   -9.0, hd_oficial: null,  vol_abr26: null },
    { nombre: "Chiapas",            opacidad: 19.9, conf:  350, tot:  1756, desap_var:   +1.4, hd_oficial: null,  vol_abr26: null },
    { nombre: "Tabasco",            opacidad: 18.3, conf:  376, tot:  2051, desap_var:  -35.8, hd_oficial: null,  vol_abr26: null },
    { nombre: "Michoacán",          opacidad: 17.3, conf: 1242, tot:  7171, desap_var:  +44.8, hd_oficial: -41.8, vol_abr26: null, flag_oficial: true },
    { nombre: "Querétaro",          opacidad: 16.4, conf:  115, tot:   700, desap_var: +121.4, hd_oficial: null,  vol_abr26: null },
    { nombre: "Hidalgo",            opacidad: 13.0, conf:  215, tot:  1652, desap_var:  +48.6, hd_oficial: null,  vol_abr26: null },
    { nombre: "Guerrero",           opacidad:  9.5, conf:  392, tot:  4124, desap_var:  -21.5, hd_oficial: null,  vol_abr26: 5.3 },
    { nombre: "Colima",             opacidad:  9.0, conf:  129, tot:  1438, desap_var:  -22.0, hd_oficial: null,  vol_abr26: null },
    { nombre: "Chihuahua",          opacidad:  8.8, conf:  361, tot:  4103, desap_var:  -25.6, hd_oficial: null,  vol_abr26: 8.2 }
  ]
};

// Clasificacion automatica de patrones por estado para el mapa bifurcado
(function classify() {
  const D = window.OPACIDAD_DATA;
  D.estados.forEach(e => {
    // Patron 1: COHERENTE BAJA — desap baja & (HD oficial baja o no se reporta)
    // Patron 2: DESACOPLE   — HD oficial baja PERO desap sube
    // Patron 3: ALTA OPACIDAD — opacidad >= 50% (no permite auditoria)
    // Patron 4: MORELOS     — caso particular
    if (e.highlight) {
      e.patron = "morelos";
    } else if (e.hd_oficial !== null && e.hd_oficial < -30 && e.desap_var !== null && e.desap_var > 0) {
      e.patron = "desacople";
    } else if (e.opacidad >= 50) {
      e.patron = "opaco";
    } else if (e.desap_var !== null && e.desap_var < -15) {
      e.patron = "coherente";
    } else if (e.desap_var !== null && e.desap_var > 50) {
      e.patron = "alza_desap";
    } else {
      e.patron = "mixto";
    }
  });
})();
