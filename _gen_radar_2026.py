# -*- coding: utf-8 -*-
"""Ventana 2026 del radar: ene-jun 2019 vs ene-jun 2026, MUNICIPAL, semestre real contra semestre real.
Lee los CSV crudos (que sí traen columnas de meses). No anualiza nada."""
import csv, io, json, os

BN = r"C:\Users\SRVal\Documents\Claude\Projects\INSEGURIDAD MÉXICO\BASES_NACIONALES"
HIST = BN + r"\_SESNSP_2015-2025_oficial\Municipal-Delitos-2015-2025_may2026\Municipal-Delitos-2015-2025_may2026.csv"
RNID = BN + r"\delitos_municipales_RNID_2026\RNID-Delitos_Municipal-2026-jun2026.csv"
D = r"C:\Users\SRVal\Documents\Claude\Projects\45 DIGITAL NOTICIAS\INSEGURIDAD_MEXICO"

def sem(row):  # Enero..Junio = columnas 9..14
    s = 0
    for i in range(9, 15):
        if i < len(row):
            v = row[i].strip()
            if v:
                try: s += int(float(v))
                except: pass
    return s

def leer(path, anio):
    """{cve_mun: {'h':n,'c':n}} sumando ene-jun. Homicidio doloso por subtipo;
       control = tipo Extorsión + tipo Narcomenudeo, excluyendo tentativas (regla de la casa)."""
    out = {}
    with io.open(path, encoding="latin-1", newline="") as f:
        r = csv.reader(f); next(r)
        for row in r:
            if len(row) < 15: continue
            if anio and row[0].strip() != anio: continue
            cve = row[3].strip().zfill(5)
            tipo, sub = row[6].strip(), row[7].strip()
            if "Tentativa" in sub: continue
            n = sem(row)
            if not n: continue
            d = out.setdefault(cve, {"h": 0, "c": 0})
            if sub == "Homicidio doloso": d["h"] += n
            elif tipo in ("Extorsión", "Narcomenudeo"): d["c"] += n
    return out

print("leyendo 2019 (histórico)…"); A = leer(HIST, "2019")
print("leyendo 2026 (RNID)…");      B = leer(RNID, None)
print("municipios con datos: 2019 =", len(A), "| 2026 =", len(B))

# geometría/nombres + población
def rd(p):
    t = io.open(p, encoding="utf-8").read()
    t = t[t.find("=") + 1:].rstrip().rstrip(";")
    return json.loads(t)
GEO = rd(D + r"\_nac_muni_geo.js")
PM  = json.loads(io.open(D + r"\_tmp_pop.json", encoding="utf-8").read())
NM = {}
for f in GEO["features"]:
    k = str(f["properties"]["k"]).zfill(5)
    NM[k] = {"n": f["properties"]["n"], "e": f["properties"].get("e", "")}
def pop(cve, y):
    arr = PM["p"].get(cve) or PM["p"].get(str(int(cve)))
    if not arr: return 0
    i = PM["anios"].index(y) if y in PM["anios"] else (y - 2015)
    try: return arr[i] or 0
    except: return 0

MINPOP, MINEV, MINBASE = 50000, 12, 5
rows = []
for cve, a in A.items():
    b = B.get(cve)
    if not b or cve not in NM: continue
    p0, p1 = pop(cve, 2019), pop(cve, 2025)   # 2026 aún no en la serie de población
    if not p0 or not p1 or p1 < MINPOP: continue
    h0, h1, c0, c1 = a["h"], b["h"], a["c"], b["c"]
    if (h0 + h1) < MINEV or (c0 + c1) < MINEV: continue
    if h0 < MINBASE or c0 < MINBASE: continue
    th0, th1 = h0 / p0 * 1e5, h1 / p1 * 1e5
    tc0, tc1 = c0 / p0 * 1e5, c1 / p1 * 1e5
    if th0 <= 0 or tc0 <= 0: continue
    dH = (th1 / th0 - 1) * 100; dC = (tc1 / tc0 - 1) * 100
    q = ("Q2" if dC > 0 else "Q1") if dH < 0 else ("Q3" if dC > 0 else "Q4")
    rows.append({"cve": cve, "mun": NM[cve]["n"], "edo": NM[cve]["e"], "cve_ent": int(cve[:2]),
                 "pob": p1, "h_ini": round(th0, 2), "h_fin": round(th1, 2), "dH_pct": round(dH, 1),
                 "c_ini": round(tc0, 2), "c_fin": round(tc1, 2), "dC_pct": round(dC, 1),
                 "abs_h": h1, "abs_c": c1, "cuadrante": q, "score": round(-dH + dC, 1)})

c = {q: sum(1 for r in rows if r["cuadrante"] == q) for q in ("Q1", "Q2", "Q3", "Q4")}
print("\n=== VENTANA ene-jun 2019 → ene-jun 2026 (municipal, semestre real) ===")
print("municipios medibles:", len(rows))
print("Q2 consolidación:", c["Q2"], "| Q3 disputa:", c["Q3"], "| Q4 guerra:", c["Q4"], "| Q1 todo baja:", c["Q1"])
top = sorted([r for r in rows if r["cuadrante"] == "Q2"], key=lambda r: -r["score"])[:8]
print("\nTOP Q2:")
for r in top: print("  %-38s H %6.0f%%  C +%.0f%%" % (r["mun"] + " (" + r["edo"] + ")", r["dH_pct"], r["dC_pct"]))
mor = sorted([r for r in rows if r["cve_ent"] == 17], key=lambda r: -r["score"])
print("\nMORELOS:")
for r in mor: print("  %-22s %s  H %+.0f%%  C %+.0f%%" % (r["mun"], r["cuadrante"], r["dH_pct"], r["dC_pct"]))

# guardar: se añade como tercera ventana al dataset municipal
p = D + r"\_radar_muni_data.js"
t = io.open(p, encoding="utf-8").read()
obj = json.loads(t[t.find("=") + 1:].rstrip().rstrip(";"))
obj["ventanas"]["2019s1-2026s1"] = rows
obj["nota"] += " Ventana 2019s1-2026s1: comparación ene-jun contra ene-jun desde los CSV crudos (2026 PRELIMINAR, se revisa al alza)."
io.open(p, "w", encoding="utf-8").write("const RADAR_MUNI = " + json.dumps(obj, ensure_ascii=False) + ";\n")
print("\n-> ventana añadida a _radar_muni_data.js")

with io.open(D + r"\datos\radar_consolidacion_municipal_2026.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f); w.writerow(["cve_mun","municipio","estado","poblacion","tasa_hom_2019s1","tasa_hom_2026s1",
        "delta_homicidio_pct","tasa_control_2019s1","tasa_control_2026s1","delta_control_pct","cuadrante","score"])
    for r in rows: w.writerow([r["cve"],r["mun"],r["edo"],r["pob"],r["h_ini"],r["h_fin"],r["dH_pct"],r["c_ini"],r["c_fin"],r["dC_pct"],r["cuadrante"],r["score"]])
print("-> datos/radar_consolidacion_municipal_2026.csv")
