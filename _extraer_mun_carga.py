# -*- coding: utf-8 -*-
# Extrae la geometria real de los municipios-foco del corredor de carga
# desde series_mun/gm_<estado>.json (la misma que usa municipio.html).
# Salida: corredor_mun_geo.js  ->  const CORREDOR_MUN_GEO = FeatureCollection
import json, os, unicodedata, io

BASE = os.path.dirname(os.path.abspath(__file__))
SM   = os.path.join(BASE, "series_mun")

def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode("ascii")
    return s.lower().strip()

# nombre_display, estado(cve 2d), busqueda, ARTF robo al tren 24-25, SESNSP robo a transportista (estado 2025)
HS = [
 ("Silao",                  "11", "silao",                     299, 19),
 ("Torreon",                "05", "torreon",                   298, 11),
 ("El Fuerte",              "25", "el fuerte",                 295,  3),
 ("Aguascalientes",         "01", "aguascalientes",            289,  0),
 ("Culiacan",               "25", "culiacan",                  209,  3),
 ("Irapuato",               "11", "irapuato",                  194, 19),
 ("Cosio",                  "01", "cosio",                     191,  0),
 ("Hermosillo",             "26", "hermosillo",                189,  6),
 ("Pabellon de Arteaga",    "01", "pabellon de arteaga",       176,  0),
 ("Ramos Arizpe",           "05", "ramos arizpe",              168, 11),
 ("San Fco. de los Romo",   "01", "san francisco de los romo", 138,  0),
 ("Gomez Palacio",          "10", "gomez palacio",             134,  0),
 ("Encarnacion de Diaz",    "14", "encarnacion de diaz",       128,102),
 ("Apaseo el Grande",       "11", "apaseo el grande",          125, 19),
 ("Parras",                 "05", "parras",                    119, 11),
]

def find_feature(estado, busqueda):
    path = os.path.join(SM, "gm_%s.json" % estado)
    with io.open(path, "r", encoding="utf-8") as f:
        gj = json.load(f)
    b = norm(busqueda)
    best = None
    for ft in gj.get("features", []):
        nm = norm(ft["properties"].get("nombre",""))
        if nm == b:                 return ft   # match exacto
        if nm.startswith(b) or b in nm or nm in b:
            best = best or ft
    return best

out = {"type":"FeatureCollection","features":[]}
faltan = []
for disp, edo, bus, artf, st in HS:
    ft = find_feature(edo, bus)
    if not ft:
        faltan.append((disp, edo, bus)); continue
    out["features"].append({
        "type":"Feature",
        "properties":{"nombre":disp,"artf":artf,"st":st,
                      "real":ft["properties"].get("nombre",""),"edo":edo},
        "geometry":ft["geometry"]
    })

js = "const CORREDOR_MUN_GEO=" + json.dumps(out, ensure_ascii=False, separators=(",",":")) + ";\n"
with io.open(os.path.join(BASE,"corredor_mun_geo.js"),"w",encoding="utf-8") as f:
    f.write(js)

print("Municipios extraidos:", len(out["features"]), "/", len(HS))
for ft in out["features"]:
    print("  OK  %-22s <- %s (edo %s)  ARTF=%d st=%d" % (
        ft["properties"]["nombre"], ft["properties"]["real"],
        ft["properties"]["edo"], ft["properties"]["artf"], ft["properties"]["st"]))
if faltan:
    print("FALTAN:", faltan)
print("Tamano archivo:", os.path.getsize(os.path.join(BASE,"corredor_mun_geo.js")), "bytes")
