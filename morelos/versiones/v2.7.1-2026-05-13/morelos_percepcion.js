// Serie de percepción de inseguridad estatal 2011-2025
// Fuente: INEGI · Encuesta Nacional de Victimización y Percepción sobre Seguridad Pública (ENVIPE)
// Indicador: % de población de 18+ años que considera inseguro vivir en su entidad federativa
// Generado: automático desde FUENTES_EXTERNAS/INEGI_ENVIPE/derived/ — regenera con: node scripts/parse_envipe_morelos.js

const PERCEPCION = {
  anios: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],

  // Serie Morelos
  morelos: [80.75, 81.23, 86.47, 89.05, 86.25, 84.34, 86.33, 86.45, 88.52, 87.26, 86.58, 86.79, 86.97, 90.11, 90.09],

  // Serie nacional (Estados Unidos Mexicanos)
  nacional: [69.54, 66.62, 72.32, 73.25, 73.21, 72.35, 74.29, 79.39, 78.92, 78.58, 75.64, 75.91, 74.63, 73.62, 75.56],

  // Ranking 2025 — ordenado de mayor a menor percepción de inseguridad (los 32 estados)
  ranking2025: [
    { pos:  1, ent: "Morelos",             pct: 90.09 },
    { pos:  2, ent: "Tabasco",             pct: 89.83 },
    { pos:  3, ent: "Guanajuato",          pct: 88.49 },
    { pos:  4, ent: "México",              pct: 87.79 },
    { pos:  5, ent: "Zacatecas",           pct: 87.33 },
    { pos:  6, ent: "Veracruz",            pct: 82.37 },
    { pos:  7, ent: "Guerrero",            pct: 81.21 },
    { pos:  8, ent: "Colima",              pct: 81.17 },
    { pos:  9, ent: "Michoacán",           pct: 80.95 },
    { pos: 10, ent: "Sinaloa",             pct: 80.54 },
    { pos: 11, ent: "Quintana Roo",        pct: 80.30 },
    { pos: 12, ent: "Puebla",              pct: 78.18 },
    { pos: 13, ent: "Tamaulipas",          pct: 77.40 },
    { pos: 14, ent: "Jalisco",             pct: 77.36 },
    { pos: 15, ent: "Tlaxcala",            pct: 77.27 },
    { pos: 16, ent: "San Luis Potosí",     pct: 76.25 },
    { pos: 17, ent: "Ciudad de México",    pct: 75.56 },
    { pos: 18, ent: "Chiapas",             pct: 74.03 },
    { pos: 19, ent: "Baja California",     pct: 72.62 },
    { pos: 20, ent: "Chihuahua",           pct: 71.52 },
    { pos: 21, ent: "Sonora",              pct: 71.17 },
    { pos: 22, ent: "Oaxaca",              pct: 70.86 },
    { pos: 23, ent: "Campeche",            pct: 68.92 },
    { pos: 24, ent: "Nuevo León",          pct: 67.79 },
    { pos: 25, ent: "Hidalgo",             pct: 65.53 },
    { pos: 26, ent: "Querétaro",           pct: 57.08 },
    { pos: 27, ent: "Nayarit",             pct: 54.18 },
    { pos: 28, ent: "Durango",             pct: 52.17 },
    { pos: 29, ent: "Aguascalientes",      pct: 48.97 },
    { pos: 30, ent: "Yucatán",             pct: 39.59 },
    { pos: 31, ent: "Coahuila",            pct: 37.72 },
    { pos: 32, ent: "Baja California Sur", pct: 37.39 }
  ],

  // Contexto: homicidio doloso Morelos 2024 vs 2025 (para el bloque de contraste)
  // Valores tomados del panel H del propio dashboard
  homicidio_morelos: {
    anio_2024: 1598,
    anio_2025: 1385,
    delta_pct: -13.33 // ≈ -13.3%
  }
};
