# Panorama estatal 32 · README

**Archivo:** `BASES_NACIONALES/panorama_estatal_32.csv`
**Script generador:** `scripts/_construir_panorama_estatal.py`
**Última construcción:** 2026-06-04
**Filas:** 32 (una por entidad federativa)
**Columnas:** 32

---

## Propósito

Dataset consolidado de seguridad por entidad federativa. Pensado como base auditable para:
- Comparativos cohorte (ej. Morelos vs estados de tamaño similar)
- Radiografías estatales nuevas (Coahuila, Nuevo León, Tamaulipas, etc.)
- Paneles nacionales del proyecto 45 Digital Noticias
- Cualquier afirmación cuantitativa estatal que el proyecto vaya a publicar

No reemplaza el reporte primario de cada estado. Es un **agregado de bases ya verificadas**.

---

## Estructura del CSV (32 columnas)

### Identificación
- `clave_ent` · 1 a 32 (catálogo INEGI)
- `entidad` · nombre oficial INEGI

### SESNSP RNID Municipal 2024 (todas las modalidades, suma de los 12 meses)
- `sesnsp_2024_total` · total carpetas estatales del fuero común
- `sesnsp_2024_hd` · homicidio doloso
- `sesnsp_2024_hc` · homicidio culposo
- `sesnsp_2024_feminicidio`
- `sesnsp_2024_extorsion`
- `sesnsp_2024_secuestro`
- `sesnsp_2024_narcomenudeo`
- `sesnsp_2024_violencia_familiar`
- `sesnsp_2024_robo_amplio` · incluye robo y allanamiento
- `sesnsp_2024_lesiones_dolosas`
- `sesnsp_2024_abuso_sexual`
- `sesnsp_2024_violacion`
- `sesnsp_2024_amenazas`

### Serie histórica homicidio doloso 2016-2024
- `serie_hd_2016` a `serie_hd_2024` · 9 columnas, una por año

### Serie carpetas totales (puntos de anclaje)
- `serie_total_2016`, `serie_total_2020`, `serie_total_2024`

### RNPDNO post-reforma (corte 3-jun-2026)
- `rnpdno_desaparecidos`
- `rnpdno_no_localizados`
- `rnpdno_loc_con_vida`
- `rnpdno_loc_sin_vida`
- `rnpdno_activos_total` · suma de desaparecidos + no localizados

---

## Fuentes primarias

| Dataset | Origen local | Corte |
|---|---|---|
| SESNSP RNID Municipal 2016-2024 | `BASES_NACIONALES/delitos_municipales_2015-2025/{año}_abr26.xlsx` | corte abril 2026 |
| RNPDNO post-reforma | `EXCEL - SEGURIDAD MORELOS/NUEVOS REPORTES DESAPARICIONES/activos_por_entidad.csv` | 3-jun-2026 |

Ambas fuentes son agregaciones de bases ya publicadas oficialmente; el script no inventa ni interpola.

---

## Método de agregación

### SESNSP 2024 (todas las cifras `sesnsp_2024_*`)
```python
df['_total'] = df[['Enero','Febrero',...,'Diciembre']].sum(axis=1)
pivote = df.groupby(['Clave_Ent','Entidad','Subtipo'])['_total'].sum()
# luego filtro por subtipo: 'doloso', 'culposo', 'feminic', 'extorsi', etc.
```

### Serie HD 2016-2024
Repetido el mismo método por cada uno de los 9 archivos anuales.

### RNPDNO
Mapeo directo por nombre con un alias dict para los 5 estados cuyo nombre INEGI difiere del que usa el CSV RNPDNO:
- `México` → `ESTADO DE MEXICO`
- `Coahuila de Zaragoza` → `COAHUILA`
- `Michoacán de Ocampo` → `MICHOACAN`
- `Veracruz de Ignacio de la Llave` → `VERACRUZ`
- `Ciudad de México` → `CIUDAD DE MEXICO`

---

## Lo que NO incluye este dataset (limitaciones)

- **CONAPO 2025 poblacional.** No hay tasas por 100K habitantes calculadas. Pendiente descarga.
- **ENSU urbana T1 2026.** No incluido. Tiene cobertura solo de 75 ciudades, no de las 32 entidades.
- **ENVIPE 2025 percepción.** Pendiente. El archivo `V_percepcion_seguridad_2025_est.xlsx` está disponible pero requiere lectura específica del cuadro de percepción.
- **Cifra negra estatal.** El SESNSP captura denuncias, no delitos efectivamente ocurridos.
- **SESNSP 2025-2026.** El archivo `2025_abr26.xlsx` en disco tiene 0 bytes (descarga pendiente).

---

## Lecturas clave del dataset (al 2024)

### Top 5 entidades por homicidio doloso 2024
1. Guanajuato — 2,553 HD · 154,108 carpetas totales · 5,672 RNPDNO activos
2. Baja California — 2,089 · 107,397 · 5,197
3. Estado de México — 1,964 · 367,922 · 14,652
4. Chihuahua — 1,705 · 78,796 · 4,298
5. Nuevo León — 1,539 · 90,187 · 7,491

### Top 5 entidades por desaparecidos activos RNPDNO (corte 3-jun-2026)
1. Estado de México — 14,652
2. Tamaulipas — 13,817 (con HD comparativamente bajo: 331)
3. Jalisco — 12,781
4. Michoacán — 7,848
5. Nuevo León — 7,491

### Para Morelos (referencia del proyecto)
Buscar fila `clave_ent=17`. Resultado debe coincidir con `cifras.csv` del DASHBOARD.

---

## Reconstrucción

```bash
cd "C:/Users/SRVal/Documents/Claude/Projects/JUICIO POLITICO/scripts"
python _construir_panorama_estatal.py
```

Tarda ~2 minutos (lee 9 XLSX nacionales de ~18MB cada uno).

---

## Trazabilidad en `cifras.csv`

Filas EST-001 a EST-004 en `DASHBOARD/cifras.csv` documentan cada componente del dataset con su fuente, método y estado de verificación.

---

## Reglas de uso

1. **Antes de publicar cualquier cifra estatal del proyecto, abrir este CSV y citar la fila exacta.** Igual que con `cifras.csv` para Morelos.
2. Si la cifra es por mes (no por año), este CSV no sirve — hay que ir al archivo SESNSP por año original.
3. Si la cifra es de 2025-2026, este CSV se queda corto — descargar el corte vigente del SESNSP primero.
4. Los RNPDNO no son acumulados desde 1964; son activos al corte del 3-jun-2026 (después de la reforma de marzo 2026 que reclasificó el padrón).
