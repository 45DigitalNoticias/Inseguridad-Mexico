# Combo de difusión — Dashboard *Inseguridad México*

**Programa:** 45 Digital Noticias
**Fecha de armado:** 20 de junio de 2026
**Pieza pilar:** Dashboard *Inseguridad México* (https://45digitalnoticias.github.io/Inseguridad-Mexico/)
**Firma:** SRVO · **Marca:** 45 Digital Noticias
**Generado con:** skill `difusion-editorial`

> Material interno de difusión. Lo publicable son los textos de redes; el pitch y estas notas son de trabajo. La carpeta vive en el repo publicado: decidir antes de pushear si se quiere pública.

---

## Tesis

A mi juicio (OPINIÓN), la baja oficial de la violencia no se explica solo por menos delitos, sino en parte por su migración contable hacia los cajones "Otros…". El valor del tablero es que cualquiera puede cotejar cada cifra con su fuente.

## Datos verificados (del propio tablero, trazables a `cifras.csv`)

- ✅ Catálogo completo de **55 delitos**, serie 2015-2025, 32 estados. Fuentes oficiales: SESNSP, RNPDNO, ENVIPE, CONAPO, INEGI. Cortes abr-jun 2026.
- ✅ Homicidio doloso 2025: **19,987 carpetas, 21.5% menos que en 2024**. Rango estatal de 2 a 73 por 100 mil.
- ✅ **22 señales de reclasificación** (cruce 2018→2024), el delito específico cae mientras su categoría espejo "Otros…" sube:
  - Secuestro **−100%** / "Otros contra la libertad" **+563%**
  - Violación simple **−37.2%** / "Otros delitos sexuales" **+4,418%**
  - Homicidio doloso **−25.4%** / "Otros contra la vida" **+10,733%**
- ✅ Corredor del Istmo: homicidio en la ruta **+71.5%** (2021-2024), mientras el resto regional quedó plano (−0.4%) y el país bajó −10%.
- ✅ Morelos: tras relevar a su jefe de seguridad se presentó como caso de éxito con −62.8%, "la misma baja contada de cuatro formas".

> No se afirma fraude. Se muestra el dato y se publica cada serie completa: el lector audita. Causas posibles de las señales: cambio de criterio de captura, reforma legal o reclasificación.

---

## Índice del combo

| Archivo | Para qué | Canal |
|---|---|---|
| `caption-facebook.txt` | Texto del muro, con emojis, no se expande | Facebook |
| `hilo-x.txt` | Hilo de 6 posts, sobrio | X / publicaciones encadenadas |
| `texto-reel.txt` | Guion de reel (para armar en Remotion) | Reel vertical |
| `prompt-imagen.txt` | Prompts de portada + stills + animación (ES/EN, modelo + proporción) | Imagen |
| `outreach.txt` | Pitch a medios + cláusula de atribución | PR |

## Pilar A — SEO / citabilidad (pendiente de aplicar al dashboard)

El `<head>` del dashboard tiene `<title>` y `lang`, pero **falta `meta description`, Open Graph, canonical y JSON-LD**. Para un tablero corresponde `JSON-LD Dataset` (no `Article`): `creator` Person SRVO, `publisher` Organization 45 Digital Noticias, `temporalCoverage` 2015-2025, `spatialCoverage` México, `isBasedOn` las cinco fuentes oficiales, `license` = atribución. Sumar un bloque-respuesta de 40-60 palabras que conteste "¿bajó la violencia en México en 2025?" en lenguaje declarativo, para que un LLM lo extraiga.

## Qué falta de parte del usuario

1. Generar las imágenes con los prompts (`prompt-imagen.txt`) y pegarlas en esta carpeta.
2. Renderizar el reel en Remotion a partir de `texto-reel.txt`.
3. Confirmar la URL exacta publicada del dashboard antes de difundir.
4. Decidir si se aplica el Pilar A (inyectar SEO + JSON-LD en el dashboard) y si esta carpeta se publica o queda interna.
