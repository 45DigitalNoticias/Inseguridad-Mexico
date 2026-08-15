# -*- coding: utf-8 -*-
"""Capa de datos CASOS vs PERSONAS (carpetas vs victimas) para el dashboard nacional.
Genera casos_personas.js con, por delito contra las personas:
  - nacional: carpetas[] y victimas[] por anio (2015-2025 + 2026 ene-jun)
  - por estado (ultimo anio cerrado 2025 y 2026 parcial): carpetas, victimas
  - feminicidio: por estado, feminicidio vs homicidio doloso de MUJER (para el sub-angulo SCJN)
Fuentes oficiales SESNSP (metodologia vieja 2015-2025 = CNSP/38/15; 2026 = RNID nueva).
Los dos conteos son del propio SESNSP. Corte: junio 2026."""
import csv, io, os, json, unicodedata
from collections import defaultdict

BASE = r"C:\Users\SRVal\Documents\Claude\Projects\INSEGURIDAD MÉXICO\BASES_NACIONALES"
OFIC = os.path.join(BASE, "_SESNSP_2015-2025_oficial")
OUT  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "casos_personas.js")

def pick(folder, must):
    for root,_,files in os.walk(folder):
        for f in files:
            if f.lower().endswith(".csv") and must in f.lower(): return os.path.join(root,f)

CAR_H = pick(os.path.join(OFIC, "Estatal-Delitos-2015-2025_may2026"), "delitos")
VIC_H = pick(os.path.join(OFIC, "Estatal-Víctimas-2015-2025_may2026"), "ctimas")
CAR26 = pick(os.path.join(BASE, "delitos_estatales_RNID_2026"), "jun2026")
VIC26 = pick(os.path.join(BASE, "victimas_estatales_RNID_2026"), "jun2026")

ANIOS = [str(y) for y in range(2015,2026)] + ["2026 ene-jun"]
# delitos contra las personas (los que tienen conteo de victimas con hueco real)
DELITOS = ["Homicidio doloso","Feminicidio","Homicidio culposo","Lesiones dolosas",
           "Lesiones culposas","Secuestro","Extorsión","Trata de personas"]

def H(p): return next(csv.reader(io.open(p,encoding="latin-1")))
def ci(h,n):
    for i,c in enumerate(h):
        if n.lower() in c.lower(): return i

def hist(path):
    """(delito) -> {anio: total nac}, y (delito,estado,anio)->total, MUJER homicidio aparte."""
    h=H(path); ce=ci(h,"Entidad"); cs=ci(h,"Subtipo"); csx=ci(h,"Sexo")  # csx None en delitos
    nac=defaultdict(lambda: defaultdict(int)); est=defaultdict(lambda: defaultdict(int))
    hd_muj=defaultdict(int)  # (estado,anio) homicidio doloso mujer (solo si hay Sexo)
    rd=csv.reader(io.open(path,encoding="latin-1")); next(rd)
    for r in rd:
        try:
            sub=r[cs].strip(); y=r[0].strip(); e=r[ce].strip()
            v=sum(int(float(x)) for x in r[-12:] if x not in ("",None))
            if sub in DELITOS:
                nac[sub][y]+=v; est[(sub,e)][y]+=v
            if csx is not None and sub=="Homicidio doloso" and r[csx].strip()=="Mujer":
                hd_muj[(e,y)]+=v
        except: pass
    return nac, est, hd_muj

def rnid(path):
    h=H(path); ce=ci(h,"Entidad"); cs=ci(h,"Subtipo"); csx=ci(h,"Sexo"); cm=ci(h,"Enero")
    nac=defaultdict(int); est=defaultdict(int); hd_muj=defaultdict(int)
    rd=csv.reader(io.open(path,encoding="latin-1")); next(rd)
    for r in rd:
        try:
            sub=r[cs].strip(); e=r[ce].strip()
            v=sum(int(float(x)) for x in r[cm:cm+6] if x not in ("",None))
            if sub in DELITOS: nac[sub]+=v; est[(sub,e)]+=v
            if csx is not None and sub=="Homicidio doloso" and r[csx].strip()=="Mujer": hd_muj[e]+=v
        except: pass
    return nac, est, hd_muj

carN,carE,_          = hist(CAR_H)
vicN,vicE,vic_hdmuj  = hist(VIC_H)
carN26,carE26,_      = rnid(CAR26)
vicN26,vicE26,vic_hdmuj26 = rnid(VIC26)

# nacional por delito: series carpetas / victimas (2015-2025 + 2026)
nac = {}
for d in DELITOS:
    car = [carN[d].get(str(y),0) for y in range(2015,2026)] + [carN26.get(d,0)]
    vic = [vicN[d].get(str(y),0) for y in range(2015,2026)] + [vicN26.get(d,0)]
    nac[d] = {"carpetas":car, "victimas":vic}

# ESTADOS (catalogo INEGI)
ESTN={'1':'Aguascalientes','2':'Baja California','3':'Baja California Sur','4':'Campeche','5':'Coahuila','6':'Colima','7':'Chiapas','8':'Chihuahua','9':'Ciudad de México','10':'Durango','11':'Guanajuato','12':'Guerrero','13':'Hidalgo','14':'Jalisco','15':'México','16':'Michoacán','17':'Morelos','18':'Nayarit','19':'Nuevo León','20':'Oaxaca','21':'Puebla','22':'Querétaro','23':'Quintana Roo','24':'San Luis Potosí','25':'Sinaloa','26':'Sonora','27':'Tabasco','28':'Tamaulipas','29':'Tlaxcala','30':'Veracruz','31':'Yucatán','32':'Zacatecas'}
def _norm(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c)).lower().strip()
def match_e(nombre_reg):
    n=_norm(nombre_reg)
    for k,v in ESTN.items():          # 1) match EXACTO (evita que "Baja California" capture a "Baja California Sur")
        if _norm(v)==n: return k
    best=None; blen=-1                 # 2) contencion mas LARGA (Edomex "Mexico" no debe caer en "Ciudad de Mexico")
    for k,v in ESTN.items():
        nv=_norm(v)
        if (nv in n or n in nv) and len(nv)>blen: best=k; blen=len(nv)
    return best

# feminicidio por estado: feminicidio vs homicidio doloso mujer (2025 y 2026)
femtab=[]
regs=set(e for (d,e) in carE if d=="Feminicidio")|set(e for (e,y) in vic_hdmuj)
for reg in regs:
    k=match_e(reg)
    if not k: continue
    f25=vicE.get(("Feminicidio",reg),{}).get("2025",0); h25=vic_hdmuj.get((reg,"2025"),0)
    f26=vicE26.get(("Feminicidio",reg),0); h26=vic_hdmuj26.get(reg,0)
    femtab.append({"cve":int(k),"est":ESTN[k],"fem25":f25,"hdmuj25":h25,"fem26":f26,"hdmuj26":h26})
femtab.sort(key=lambda x:x["cve"])

payload = {
  "corte":"2026 ene-jun (junio 2026)",
  "nota":"Dos conteos oficiales del SESNSP. Carpetas=CNSP/38/15 (2015-2025) y RNID (2026). Victimas idem. 2026 nueva metodologia, no estrictamente comparable con años previos.",
  "anios":ANIOS, "delitos":DELITOS, "nac":nac, "feminicidio_estatal":femtab
}
io.open(OUT,"w",encoding="utf-8").write("const CASOS_PERSONAS = "+json.dumps(payload,ensure_ascii=False,separators=(",",":"))+";")

# cotejo
print("OK -> casos_personas.js")
print("  HD nac 2025: carpetas",nac["Homicidio doloso"]["carpetas"][10],"victimas",nac["Homicidio doloso"]["victimas"][10])
print("  Feminicidio nac 2025: carpetas",nac["Feminicidio"]["carpetas"][10],"victimas",nac["Feminicidio"]["victimas"][10])
print("  estados en tabla feminicidio:",len(femtab))
tot_c=sum(nac[d]["carpetas"][10] for d in DELITOS); tot_v=sum(nac[d]["victimas"][10] for d in DELITOS)
print("  SUMA delitos-persona 2025: carpetas",tot_c,"victimas",tot_v,"hueco",tot_v-tot_c)
