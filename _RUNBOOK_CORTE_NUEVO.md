# RUNBOOK — actualizar el dashboard a un CORTE NUEVO del SESNSP

> Correr **TODO** esto cada corte. Correr solo una parte fue la causa del desfase de jul-2026
> (portada en junio, municipal congelado en abril). Los `_refrescar_municipal.py`/`_refrescar_smun.py`
> **solo tocan 2015-2025**; el punto 2026 municipal lo pone el paso 4 (nuevo).

## 0. Bajar el crudo
A `INSEGURIDAD MÉXICO/BASES_NACIONALES/`:
- `delitos_municipales_RNID_2026/RNID-Delitos_Municipal-2026-<mes>2026.csv`
- `delitos_estatales_RNID_2026/RNID-Delitos_Estatal-2026-<mes>2026.csv`
- `victimas_estatales_RNID_2026/` y `victimas_municipales_RNID_2026/` (para el paso 3)
- El histórico 2015-2025 (`_SESNSP_2015-2025_oficial/`) NO cambia (metodología CNSP/38/15 cerrada).
- Guardar el ZIP en `_cortes_anteriores/` con fecha (audit trail).

## Antes de escribir: respaldar
Copiar `_nac_muni_data.js` + `_nac_estatal_data.js` + `series_2026.js` + `panorama_estatal.js` +
`series_mensuales/` + `series_mun/` a `*.BACKUP_<corte>_YYYY-MM-DD`.

## Los 4 scripts (en `INSEGURIDAD_MEXICO/`, en orden)
Cada uno tiene la ruta/mes/etiqueta HARDCODEADA adentro: **ajustar antes de correr** (buscar el `<mes>2026`).

| # | Comando | Escribe | Ajustar dentro |
|---|---------|---------|----------------|
| 1 | `python _generar_matriz_55.py` | `_nac_muni_data.js` (matriz única, base de todo) | `RNID_RAW`, rebanada `r[9:9+N]`, `ANIOS` etiqueta |
| 2 | `python _actualizar_corte.py` | `_nac_estatal_data.js`, `series_2026.js`, `panorama_estatal.js/.csv`, `series_mensuales/sm_XX.js` (ESTATAL mensual) | corre `--validar BACKUP` primero (0 difs esperadas) |
| 3 | `python _generar_casos_personas.py` | `casos_personas.js` (panel Casos ≠ personas) | `pick("jun2026")` CAR26/VIC26, `N_MESES`, `corte` |
| 4 | `python _refrescar_muni_2026.py --apply` | `series_mun/sma_XX.js` + `smun_XX.js` (MUNICIPAL drill-down) | `RNID`, `N_MESES`, `LABEL`, `MES_LABELS` — corre DRY sin `--apply` 1º |

> ⚠️ `series_mensuales/` (estatal, paso 2) ≠ `series_mun/` (municipal, paso 4). Son distintos y por eso
> se desincronizaron. El paso 4 es quirúrgico: solo el punto 2026, conserva 2015-2025.

## Etiquetas del corte (hardcodeadas, sin constante central — editar a mano)
`grep -rniE "jun-2026|ene-jun|CORTE JUN|corte de junio"` y actualizar en:
`index.html`, `estado.html`, `municipio.html`, `municipios.html`, `ranking-nacional.html`,
`corredores-sureste.html`, `senales.html`, `columnas/index.html`, `metodologia.html`.
(Mejora futura: centralizar en `constantes_sitio.js`.)

## Cotejos obligatorios (deben cuadrar antes de publicar)
- HD nacional == mismo número en casos_personas (carpetas) == suma municipal (paso 4 dry) == estatal. (jun = **7,842**)
- Feminicidio nacional (jun = **300**).
- `_actualizar_corte.py --validar` = 0 diferencias en histórico.
- `grep -l "2026 ene-jun" series_mun/sma_*.js | wc -l` == 32; `grep -l "<último-mes>" series_mun/smun_*.js` == 32.

## Verificar (server local, headless)
`python -m http.server 8899` → cargar `index.html`, `estado.html?estado=17`, `municipio.html?cve=17007`,
`ranking-nacional.html`, `corredores-sureste.html`. Consola limpia + etiqueta del corte correcta + 2026 presente.

## Publicar
`git add` (solo los .js de datos + los .html tocados) + commit + **push SOLO con orden literal "publica"**.
Luego IndexNow/SEO si aplica.

## Fuera de este pipeline (no olvidar, tracks aparte)
- **Corredores** (`corredores_data.js`, `corredor_ferro_data.js`): curados, la página no exhibe 2026; revisar solo si cambia la tesis.
- **Morelos sub-sitio** (`morelos/`): track SEPARADO, NUNCA blanket-replace.
- **Excel / `cifras.csv`** (capa de corroboración): al corte junio, pendiente.
- **Flyers / gráficos de difusión**: sus generadores buscan literal `'2026 ene-may'` → actualizar la etiqueta.
