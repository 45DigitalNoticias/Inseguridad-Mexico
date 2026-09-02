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

## 5. Radar (los DOS niveles, cada uno con su script)
- Municipal: `python _gen_radar_2026.py` (ajustar RNID al mes). ⚠️ APPENDEA la frase a la
  `nota` de `_radar_muni_data.js`: borrar la frase del corte anterior a mano o queda doble
  (pasó en jul-2026).
- Estatal: `python _gen_radar_estatal_s1.py --validar` (debe reproducir la ventana vigente
  celda a celda) y luego `--apply`. Convención confirmada: crudos estatales, pop fin 2026.

## 6. que-mide.html + espejo (números CONTADOS del crudo, no etiquetas)
`python _gen_quemide.py --validar` (reproduce los números publicados) y luego `--apply`:
reescribe los 3 SVG (huérfanos, espejo 2025-vs-2026, composición), el KPI de huérfanos y
`datos/espejo_rnid_2026.csv`. Ajustar MES/N_MESES dentro. Revisar a mano tras el apply:
la meta description y el KPI "carpetas que caen a cero" (suma DESAPARECE del CSV espejo).

## 7. Cifras y JS hardcodeados en páginas (no las cubre ningún script)
- `index.html`: KPI "Delitos, total" y "Homicidio doloso" (2026 parcial) + la tarjeta
  de conteo.html ("hay N personas de diferencia").
- `conteo.html`: KPIs carpetas/víctimas/diferencia y % (suman los delitos QUE REPORTAN de
  casos_personas.js, 2026), botón de periodo, concat `SERIES_ANIOS.concat([...])`, t55foot.
  La referencia 2025 (249,644/291,653) NO cambia: es año cerrado.
- `estado.html`: `ritmo26 = Math.round(total*12/N)`, etiqueta del KPI y "ritmo ×N.NN",
  y en PERIODOS_R el `{label:'2026 ene-XXX', len:N}`.
- `radar.html`: texto del botón `w26` ("ene-XXX 2019 → 2026*"), y `_radar-mapa-municipal.html`
  el `<option>` equivalente.
- `index.html`: el SELLO de portada (`sello-corte` + `sello-fecha`): mes del corte y
  FECHA de actualización — se edita la fecha el día del push.
- `corte_sitio.js`: el CHIP flotante "Corte SESNSP · <mes>" de TODAS las páginas
  interiores (portada no: ahí va el sello). UNA edición: `mes`, `corto`, `actualizado`.
  morelos/ NO lo carga a propósito (track aparte con su propio corte).

## Etiquetas del corte (hardcodeadas, sin constante central — editar a mano)
`grep -rniE "jun-2026|ene-jun|CORTE JUN|corte de junio|junio 2026|enero a junio"` y actualizar en:
`index.html`, `estado.html`, `municipio.html`, `municipios.html`, `ranking-nacional.html`,
`corredores-sureste.html`, `senales.html`, `columnas/index.html`, `metodologia.html`,
`conteo.html`, `que-mide.html`, `radar.html`, `como_leer.html`, `glosario.html`, `expedientes.html`.
(Mejora futura: centralizar en `constantes_sitio.js`.)
⚠️ NO tocar: fechas RNPDNO ("3-jun-2026", "RNPDNO, junio 2026"), la firma de `como_leer.html`
("Guía de lectura · junio de 2026, actualizada en agosto de 2026": la primera fecha es de
publicación y no se mueve; la segunda se actualiza solo cuando la guía se reescriba) y
`_difusion/flyer-junio-2026/` (histórico).
⚠️ `como_leer.html` YA NO SE EDITA A MANO (21-ago-2026): se regenera con
`python "_REDISENO/_construir_como_leer.py"` y sus cifras del corte viven adentro del builder
(sello del aviso, 146,129/168,544/22,415, 38,879 y 138,133 del RNID, 8,994 de homicidio).
Morelos (`morelos/`) es track SEPARADO: sus menciones de "junio" son texto editorial fechado.

## Cotejos obligatorios (deben cuadrar antes de publicar)
- ⚠️ El cotejo de casos_personas NO es opcional: en jul-2026 el paso 3 corrió con los CSV
  nuevos pero la rebanada de 6 meses (`r[cm:cm+6]`) y la etiqueta vieja → HD salía 7,845 en
  vez de 8,994 CON el `corte` diciendo "ene-jul". El corte declarado NO prueba nada: probar
  el NÚMERO contra la matriz. (El script ya usa N_MESES; ajustarlo cada corte.)
- HD nacional == mismo número en casos_personas (carpetas) == suma municipal (paso 4 dry) == estatal. (jun = **7,842**)
- Feminicidio nacional (jun = **300**).
- **Catálogo RNID sin sorpresas**: `python _verificar_catalogo_rnid.py "<RNID-Delitos_Estatal-...csv>"`
  debe salir OK (79 subtipos, 12 huérfanos conocidos fuera de las 55: suplantación,
  retención de menores, privación ilegal, ley Olimpia, admón. de justicia, discriminación,
  tortura, pornografía infantil y las 4 tentativas; ~3.3% del total, jun-2026 = 32,776
  carpetas). Si aparece un subtipo nuevo, DECIDIR a dónde va antes de correr los pasos:
  mapear a un delito de las 55, abrirle serie propia, o dejarlo solo en el total, pero
  nunca dejar que caiga en silencio.
- `_actualizar_corte.py --validar` = 0 diferencias en histórico.
- `grep -l "2026 ene-jun" series_mun/sma_*.js | wc -l` == 32; `grep -l "<último-mes>" series_mun/smun_*.js` == 32.

## Verificar (server local, headless)
`python -m http.server 8899` → cargar `index.html`, `estado.html?estado=17`, `municipio.html?cve=17007`,
`ranking-nacional.html`, `corredores-sureste.html`. Consola limpia + etiqueta del corte correcta + 2026 presente.

## 6.bis Refrescar el AÑO CERRADO del panorama (21-ago-2026)

`python _refrescar_panorama_cerrado.py --validar` y luego `--apply`.

`_actualizar_corte.py` → `actualizar_panorama()` refresca **solo** las dos
columnas del parcial 2026 ("Deja lo demas", dice su docstring). Nadie refrescaba
las del año cerrado, así que cuando el SESNSP revisa un año ya cerrado el
panorama se quedaba con el valor viejo para siempre. Costo medido: **Tabasco
tenía 556 homicidios dolosos de 2025 cuando la serie viva ya decía 760**. El CSV
de auditoría sumaba 19,987 nacionales en vez de 20,191 (el archivo que existe
para cotejar no cuadraba con el sitio) y `municipios.html` pintaba la silueta de
Tabasco con una tasa más baja de la real. La autoridad es `series_completo.js`,
cotejada contra `_nac_estatal_data.js` y la suma municipal.

## ⚠️ Builders del rediseño (_REDISENO/, en 45 DIGITAL NOTICIAS/)
Los `_construir_*.py` parten del ARCHIVO CONGELADO pre-rediseño y de textos propios:
REGENERAR una página revive cifras/etiquetas del corte viejo. Tras cualquier regeneración,
repetir el pase de corte de esta página sobre lo regenerado. `_piezas.py` (pie + marco,
ya emite el include de corte_sitio.js) y `_construir_v3.py` (sello + etiquetas de portada)
quedaron sincronizados a jul-2026 el 20-ago-2026; el resto de builders NO.

**Desde el 21-ago-2026 esto ya no depende de acordarse.** `compuerta()` corre una
compuerta de REGRESIÓN antes de escribir: compara el HTML nuevo contra la página
publicada y se niega (exit 1) si la regeneración introduce menciones de un mes
anterior al corte vigente, pierde menciones del corte vigente, o hace desaparecer
una cifra con separador de miles que ya estaba publicada. Cuenta **ocurrencias**
sobre el documento **completo**, scripts y `<meta>` incluidos: las tres primeras
versiones de la compuerta dejaron pasar una regresión cada una por mirar solo el
texto visible o por agrupar por presencia en vez de por número.

Estado al 21-ago-2026: **los 12 builders reproducen lo publicado**. Correr
cualquiera y confiar en la compuerta; ya no hay que acordarse de nada.

Lo que se arregló para llegar ahí, por si vuelve a torcerse:
- `marco_v3()` aplica `al_corte()` a la cabeza, al cuerpo y al JS. Tres de las
  regresiones vivían fuera del texto visible: dentro de un `<script>`
  (corredores), dentro de un `<meta>` (municipio) y en versalitas
  (`SESNSP CORTE JUL-2026`, que salía en minúsculas hasta que `al_corte()`
  aprendió a respetar la caja).
- `periodos_al_corte()` para las etiquetas de rango ("2026 ene-jun",
  "enero-junio 2026") y `celdas_de_corte()` para la celda pelona
  `<td>junio 2026</td>` de la tabla de fuentes. Ninguna lleva la palabra
  "corte", y por eso `al_corte()` no las ve. Las tres respetan `3-jun-2026`.
- `CORTE_N_MESES` para lo que **no es texto**: `estado.html` declara
  `{label:'2026 ene-jul', ini:132, len:7}` y calcula `ritmo26 = total*12/7`
  con su rótulo `ritmo ×1.71`. Con el `len:6` del congelado, la página
  publicaba un ritmo proyectado mal, no una etiqueta fea.
- `conteo.html` y `estado.html` arman su propio esqueleto: se les había caído
  el include de `corte_sitio.js`, o sea el sello del corte. La compuerta ahora
  también vigila los archivos que la página deja de cargar.
- `_construir_que_mide.py` encadena `_gen_quemide.py --apply` y mide la
  regresión sobre el resultado FINAL, así que ya no hay dos comandos que
  recordar en orden. Y `_gen_quemide.py` cierra los dos números que este
  runbook mandaba revisar a mano: el KPI de las que caen a cero (la suma
  DESAPARECE del CSV espejo) y la cifra de huérfanos de la meta description.
- `columnas/index.html` salió de `_construir_consulta.py`: la mantiene el
  pipeline editorial. ⚠️ `_piezas.py` la LEE viva para armar el carrusel de la
  portada, así que reconstruirla desde el congelado envejece también el index.

## Publicar
`git add` (solo los .js de datos + los .html tocados) + commit + **push SOLO con orden literal "publica"**.
Luego IndexNow/SEO si aplica.

## Fuera de este pipeline (no olvidar, tracks aparte)
- **Corredores** (`corredores_data.js`, `corredor_ferro_data.js`): curados, la página no exhibe 2026; revisar solo si cambia la tesis.
- **Morelos sub-sitio** (`morelos/`): track SEPARADO, NUNCA blanket-replace.
- **Excel / `cifras.csv`** (capa de corroboración): al corte junio, pendiente.
- **Flyers / gráficos de difusión**: sus generadores buscan literal `'2026 ene-may'` → actualizar la etiqueta.
