# -*- coding: utf-8 -*-
"""Refresca SOLO el punto parcial 2026 de las series municipales al corte nuevo.
   Fuente: CSV RNID municipal (metodologia 2026). Conserva 2015-2025 intactos.
     - sma_*.js  : reemplaza el valor ANUAL 2026 por (municipio, subtipo) = suma ene..N_MESES; reetiqueta.
     - smun_*.js : AGREGA los meses nuevos (p.ej. 2026-05, 2026-06) por (municipio, indicador).
   Reusa padre() y el universo KEYS55 (union de subtipos ya presentes en los sma) del batch original.
   DRY por default; --apply para escribir. Idempotente (no re-aplica si ya esta al corte).
   Este es el paso que faltaba en el pipeline de corte nuevo (el batch _sma_batch32 murio con sus fuentes)."""
import csv, io, json, glob, os, collections, sys

DRY = ("--apply" not in sys.argv)
N_MESES = 6                                  # ene-jun
LABEL   = "2026 ene-jun"
MES_LABELS = ["2026-%02d" % m for m in range(1, N_MESES+1)]   # 2026-01 .. 2026-06
RNID = r"C:\Users\SRVal\Documents\Claude\Projects\INSEGURIDAD MÉXICO\BASES_NACIONALES\delitos_municipales_RNID_2026\RNID-Delitos_Municipal-2026-jun2026.csv"
SM   = r"C:\Users\SRVal\Documents\Claude\Projects\45 DIGITAL NOTICIAS\INSEGURIDAD_MEXICO\series_mun"

def padre(s):
    if s.startswith('Robo de vehículo automotor - '): return 'Robo de vehículo automotor'
    if s.startswith('Robo de maquinaria - '): return 'Robo de maquinaria'
    if s in ('Narcomenudeo con fines de venta','Narcomenudeo posesión simple'): return 'Narcomenudeo'
    if s in ('Extorsión presencial','Extorsión por otros medios'): return 'Extorsión'
    if s in ('Secuestro con calidad de rehén','Secuestro exprés','Secuestro extorsivo','Secuestro para causar daño'): return 'Secuestro'
    if s.startswith('Trata de personas con'): return 'Trata de personas'
    return s

def load(fn):
    t = io.open(fn, encoding="utf-8").read()
    i, j = t.index("{"), t.rindex("}")+1
    return t[:i], json.loads(t[i:j]), t[j:]

# 1) KEYS55 = union de subtipos presentes en los sma existentes
sma_files  = sorted(glob.glob(os.path.join(SM, "sma_*.js")))
smun_files = sorted(glob.glob(os.path.join(SM, "smun_*.js")))
VALID = set()
for fn in sma_files:
    _, o, _ = load(fn)
    for m in o["munis"].values(): VALID.update(m.keys())
print("Subtipos validos (KEYS55 desde sma):", len(VALID))

# 2) Agregacion desde el CSV RNID: SMA anual (ene..N) y IND mensual (indicadores smun)
SMA = collections.defaultdict(lambda: collections.defaultdict(int))              # (ent,cve)->sub->suma
IND = collections.defaultdict(lambda: collections.defaultdict(lambda:[0]*N_MESES))  # (ent,cve)->indicador->[N]
drop = 0
rd = csv.reader(io.open(RNID, encoding="latin-1")); next(rd)
for r in rd:
    try:
        ent = int(float(r[1])); clave = int(float(r[3])); cve = clave - ent*1000
        tipo = r[6].strip(); sub_raw = r[7].strip()
        meses = [int(float(x)) if x not in ("", None) else 0 for x in r[9:9+N_MESES]]
    except Exception:
        continue
    sub = padre(sub_raw); tot = sum(meses)
    if tot:
        if sub in VALID: SMA[(ent,cve)][sub] += tot
        else: drop += tot
    D = IND[(ent,cve)]
    for i in range(N_MESES): D["total"][i] += meses[i]
    if sub == "Homicidio doloso":
        for i in range(N_MESES): D["hd"][i] += meses[i]
    elif sub == "Feminicidio":
        for i in range(N_MESES): D["feminicidio"][i] += meses[i]
    elif sub == "Extorsión":
        for i in range(N_MESES): D["extorsion"][i] += meses[i]
    elif sub == "Narcomenudeo":
        for i in range(N_MESES): D["narcomenudeo"][i] += meses[i]
    elif sub == "Violencia familiar":
        for i in range(N_MESES): D["violencia_familiar"][i] += meses[i]
    elif sub_raw in ("Violación simple","Violación equiparada"):
        for i in range(N_MESES): D["violacion"][i] += meses[i]
    if tipo == "Secuestro":
        for i in range(N_MESES): D["secuestro"][i] += meses[i]

# 3) Cotejo nacional (anclas: HD ~7842, Feminicidio ~300 estatal jun-2026)
natHD  = sum(m.get("Homicidio doloso",0) for m in SMA.values())
natFem = sum(m.get("Feminicidio",0) for m in SMA.values())
natTot = sum(sum(m.values()) for m in SMA.values())
print("COTEJO nacional 2026 ene-jun (municipal):")
print("  HD          =", natHD, " (ref estatal 7842)")
print("  Feminicidio =", natFem, " (ref estatal ~300)")
print("  Todos(VALID)=", natTot, " | subtipos sin equivalente excluidos:", drop)

# 4) Actualiza sma_*.js (solo el punto 2026)
sma_patched = {}; added_subs = 0
for fn in sma_files:
    ent = int(os.path.basename(fn)[4:6]); pre, o, suf = load(fn)
    anios = o["anios"]; i26 = len(anios)-1
    if anios[i26] == LABEL:
        print("  sma %02d ya en %s, salto" % (ent, LABEL)); sma_patched[fn]=pre+json.dumps(o,ensure_ascii=False,separators=(",",":"))+suf; continue
    for cve, cat in o["munis"].items():
        src = SMA.get((ent,int(cve)), {})
        for sub, arr in cat.items(): arr[i26] = src.get(sub, 0)
        for sub, val in src.items():
            if sub not in cat and val:
                a=[0]*len(anios); a[i26]=val; cat[sub]=a; added_subs+=1
    o["anios"][i26] = LABEL
    sma_patched[fn] = pre + json.dumps(o, ensure_ascii=False, separators=(",",":")) + suf
print("sma: subtipos nuevos agregados (0 en ene-abr, >0 en may-jun):", added_subs)

# 5) Actualiza smun_*.js (agrega meses nuevos)
smun_patched = {}; appended = 0
for fn in smun_files:
    ent = int(os.path.basename(fn)[5:7]); pre, o, suf = load(fn)
    lab = o["labels"]
    nuevos = [m for m in MES_LABELS if m not in lab]   # los que faltan (p.ej. 2026-05, 2026-06)
    if not nuevos:
        print("  smun %02d ya tiene %s, salto" % (ent, MES_LABELS[-1])); smun_patched[fn]=pre+json.dumps(o,ensure_ascii=False,separators=(",",":"))+suf; continue
    idxs = [int(m[-2:])-1 for m in nuevos]             # indices de mes (0-based) a agregar
    o["labels"] = lab + nuevos
    for cve, ind in o["munis"].items():
        src = IND.get((ent,int(cve)), {})
        for k, arr in ind.items():
            vals = src.get(k, [0]*N_MESES)
            for mi in idxs: arr.append(vals[mi])
        appended += 1
    smun_patched[fn] = pre + json.dumps(o, ensure_ascii=False, separators=(",",":")) + suf
print("smun: series con meses agregados:", appended, "| meses:", nuevos if smun_files else [])

print("\nMODO:", "DRY (no escribe) — corre con --apply" if DRY else "APLICAR (escribe)")
if not DRY:
    for fn,c in sma_patched.items():  io.open(fn,"w",encoding="utf-8").write(c)
    for fn,c in smun_patched.items(): io.open(fn,"w",encoding="utf-8").write(c)
    print("ESCRITOS:", len(sma_patched), "sma +", len(smun_patched), "smun")
