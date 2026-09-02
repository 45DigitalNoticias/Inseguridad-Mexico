# -*- coding: utf-8 -*-
"""
_refrescar_panorama_cerrado.py — pone al dia las columnas del AÑO CERRADO de
panorama_estatal_32.csv y regenera panorama_estatal.js.

POR QUE EXISTE (21-ago-2026). `_actualizar_corte.py` -> actualizar_panorama()
refresca SOLO las dos columnas del parcial 2026 y su docstring lo dice con todas
sus letras: "Deja lo demas". Nadie refresca las columnas del año cerrado, asi que
cuando el SESNSP revisa un año ya cerrado, el panorama se queda con el valor
viejo para siempre.

Lo que costo: Tabasco tenia 556 homicidios dolosos en 2025 cuando la serie viva
ya decia 760, una revision de +204 que nunca bajo al panorama. Consecuencias
medidas: el CSV de auditoria sumaba 19,987 homicidios nacionales en vez de
20,191 (o sea, el archivo que existe para cotejar no cuadraba con el sitio), y
municipios.html pintaba la silueta de Tabasco con una tasa mas baja de la real,
porque colorEstado() lee la tasa de este mismo archivo.

LA AUTORIDAD es series_completo.js: los 55 delitos por estado y año, que es de
donde salen las paginas. Se comprobo contra dos fuentes mas (_nac_estatal_data.js
y la suma municipal de _nac_muni_data.js): las tres dan 760 para Tabasco.

Las definiciones de las columnas compuestas NO se adivinaron, se dedujeron
comprobando cual formula cuadra en los 32 estados:
  robo_amplio = todos los "Robo*" + "Otros robos"   (cuadra 32/32)
  violacion   = "Violación simple" + "Violación equiparada"  (cuadra 31/32; el
                unico que fallaba era Tabasco, por lo mismo)

Uso:
    python _refrescar_panorama_cerrado.py --validar   # no escribe, solo enseña
    python _refrescar_panorama_cerrado.py --apply     # escribe csv + js

Correr DESPUES de `_actualizar_corte.py` en cada corte.
"""
import csv
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SERIES = os.path.join(HERE, "series_completo.js")
PANO_CSV = os.path.join(HERE, "datos", "panorama_estatal_32.csv")
PANO_JS = os.path.join(HERE, "panorama_estatal.js")

ANIO_CERRADO = 2025


def cargar_series():
    s = io.open(SERIES, encoding="utf-8").read()
    anios = json.loads(re.search(r"SERIES_ANIOS\s*=\s*(\[[^\]]+\])", s).group(1))
    datos = json.loads(re.search(r"SERIES_COMPLETO\s*=\s*(\{.*\})\s*;?\s*$", s, re.S).group(1))
    return anios, datos


def columnas(S, anios, anio):
    """Todas las columnas del año cerrado para UN estado, con su definicion."""
    i = anios.index(anio)
    g = lambda d: S.get(d, [0] * len(anios))[i]
    robo = sum(g(d) for d in S if d.lower().startswith("robo") or d == "Otros robos")
    return {
        "sesnsp_%d_total" % anio: sum(a[i] for a in S.values()),
        "sesnsp_%d_hd" % anio: g("Homicidio doloso"),
        "sesnsp_%d_hc" % anio: g("Homicidio culposo"),
        "sesnsp_%d_feminicidio" % anio: g("Feminicidio"),
        "sesnsp_%d_extorsion" % anio: g("Extorsión"),
        "sesnsp_%d_secuestro" % anio: g("Secuestro"),
        "sesnsp_%d_narcomenudeo" % anio: g("Narcomenudeo"),
        "sesnsp_%d_violencia_familiar" % anio: g("Violencia familiar"),
        "sesnsp_%d_robo_amplio" % anio: robo,
        "sesnsp_%d_lesiones_dolosas" % anio: g("Lesiones dolosas"),
        "sesnsp_%d_abuso_sexual" % anio: g("Abuso sexual"),
        "sesnsp_%d_violacion" % anio: g("Violación simple") + g("Violación equiparada"),
        "sesnsp_%d_amenazas" % anio: g("Amenazas"),
    }


def tasas(vals, pob, anio):
    """Las tasas se RECALCULAN de los valores corregidos, no se copian."""
    if not pob:
        return {}
    t = lambda v: v / pob * 1e5
    return {
        "tasa_hd_100k_%d" % anio: round(t(vals["sesnsp_%d_hd" % anio]), 2),
        "tasa_feminicidio_100k_%d" % anio: round(t(vals["sesnsp_%d_feminicidio" % anio]), 3),
        "tasa_extorsion_100k_%d" % anio: round(t(vals["sesnsp_%d_extorsion" % anio]), 2),
        "tasa_total_100k_%d" % anio: round(t(vals["sesnsp_%d_total" % anio]), 1),
        "tasa_secuestro_100k_%d" % anio: round(t(vals["sesnsp_%d_secuestro" % anio]), 3),
        "tasa_violencia_familiar_100k_%d" % anio: round(t(vals["sesnsp_%d_violencia_familiar" % anio]), 1),
        "tasa_violacion_100k_%d" % anio: round(t(vals["sesnsp_%d_violacion" % anio]), 2),
    }


def main():
    aplicar = "--apply" in sys.argv
    if not aplicar and "--validar" not in sys.argv:
        print(__doc__)
        return 2

    anios, SC = cargar_series()
    assert ANIO_CERRADO in anios, "series_completo.js no llega a %d" % ANIO_CERRADO

    rows = list(csv.DictReader(io.open(PANO_CSV, encoding="utf-8-sig")))
    campos = list(rows[0].keys())
    cambios = []

    for r in rows:
        S = SC.get(r["clave_ent"])
        if not S:
            print("  AVISO: clave %s sin serie, se deja intacta" % r["clave_ent"])
            continue
        nuevo = columnas(S, anios, ANIO_CERRADO)
        # la serie historica de homicidio, año por año
        for y in anios:
            c = "serie_hd_%d" % y
            if c in campos:
                nuevo[c] = S["Homicidio doloso"][anios.index(y)]
        for y in (2015, 2020, ANIO_CERRADO):
            c = "serie_total_%d" % y
            if c in campos and y in anios:
                nuevo[c] = sum(a[anios.index(y)] for a in S.values())
        pob = int(float(r["poblacion_%d" % ANIO_CERRADO] or 0))
        nuevo.update(tasas(nuevo, pob, ANIO_CERRADO))

        for c, v in nuevo.items():
            if c not in campos:
                continue
            viejo = r[c]
            if str(viejo) != str(v) and float(viejo or 0) != float(v):
                cambios.append((r["entidad"], c, viejo, v))
                r[c] = str(v)

    if not cambios:
        print("PANORAMA: el año cerrado ya estaba al dia. Nada que hacer.")
        return 0

    print("PANORAMA · columnas del año cerrado %d que no cuadraban (%d):\n" % (ANIO_CERRADO, len(cambios)))
    ancho = max(len(c[1]) for c in cambios)
    for ent, col, viejo, nuevo_v in cambios:
        print("   %-22s %-*s %10s -> %-10s" % (ent, ancho, col, viejo, nuevo_v))

    if not aplicar:
        print("\n--validar: no se escribio nada. Corre con --apply para fijarlo.")
        return 0

    # CSV a temporal y mover: si algo truena, el archivo bueno sigue entero
    tmp = PANO_CSV + ".tmp"
    with io.open(tmp, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        w.writerows(rows)
    assert os.path.getsize(tmp) > 5000, "el CSV salio demasiado chico"
    os.replace(tmp, PANO_CSV)

    # el .js se regenera DESDE el csv, igual que hace _actualizar_corte.py
    def conv(x):
        try:
            return int(x) if x != "" and float(x) == int(float(x)) else (float(x) if x != "" else x)
        except Exception:
            return x

    dictrows = list(csv.DictReader(io.open(PANO_CSV, encoding="utf-8-sig")))
    arr = [{k: conv(v) for k, v in row.items()} for row in dictrows]
    cab = ("// PANORAMA_ESTATAL - columnas 2026 derivadas de la matriz.\n"
           "// Año cerrado %d refrescado desde series_completo.js por "
           "_refrescar_panorama_cerrado.py\n" % ANIO_CERRADO)
    tmp = PANO_JS + ".tmp"
    io.open(tmp, "w", encoding="utf-8").write(
        cab + "const PANORAMA_ESTATAL = " + json.dumps(arr, ensure_ascii=False, separators=(",", ":")) + ";")
    assert os.path.getsize(tmp) > 20000, "el JS salio demasiado chico"
    os.replace(tmp, PANO_JS)

    print("\nescrito: %s" % PANO_CSV)
    print("escrito: %s" % PANO_JS)
    return 0


if __name__ == "__main__":
    sys.exit(main())
