# -*- coding: utf-8 -*-
"""Matriz municipal con el CATALOGO COMPLETO (55 subtipos) + Todos los delitos.
   - Orden: [Todos, ...9 nucleo actuales...] + resto alfabetico (indices 0-8 INTACTOS).
   - Codificacion dispersa: d[cve] = {indiceDelito: [12 anios]} solo series con algun valor.
   - 2026 ene-may: RNID -> historico por subtipo exacto; si no, por Tipo (excluyendo
     'Tentativa'), igual que el fix de Extorsion/Secuestro/Narcomenudeo."""
import csv, io, json, collections
HIST = r"C:\Users\SRVal\Documents\Claude\Projects\INSEGURIDAD MÉXICO\BASES_NACIONALES\_SESNSP_2015-2025_oficial\Municipal-Delitos-2015-2025_may2026\Municipal-Delitos-2015-2025_may2026.csv"
MAY  = r"C:\Users\SRVal\Documents\Claude\Projects\INSEGURIDAD MÉXICO\BASES_NACIONALES\delitos_municipales_RNID_2026\RNID-Delitos_Municipal-2026-jun2026.csv"
SC   = r"C:\Users\SRVal\Documents\Claude\Projects\45 DIGITAL NOTICIAS\INSEGURIDAD_MEXICO\series_completo.js"
OUT  = r"C:\Users\SRVal\Documents\Claude\Projects\45 DIGITAL NOTICIAS\INSEGURIDAD_MEXICO\_nac_muni_data.js"
CUR  = ['Homicidio doloso','Feminicidio','Extorsión','Narcomenudeo','Lesiones dolosas','Violencia familiar','Secuestro','Homicidio culposo']
YEARS = list(range(2015,2026)); NY=len(YEARS)+1  # + 2026 ene-may

# catálogo histórico de 55 subtipos (fuente: series_completo.js)
t=io.open(SC,encoding='utf-8').read()
CAT=set(json.loads(t[t.index('{'):t.rindex('}')+1])['1'].keys())
print("subtipos en catalogo:",len(CAT))
RESTO=sorted(s for s in CAT if s not in CUR)
DEL=['Todos los delitos']+CUR+RESTO
IDX={s:i+1 for i,s in enumerate(CUR)}; IDX.update({s:9+i for i,s in enumerate(RESTO)})
print("delitos en matriz:",len(DEL))

# --- histórico 2015-2025 ---
M=collections.defaultdict(lambda: collections.defaultdict(lambda: [0]*NY))  # cve -> sub -> [12]
TOT=collections.defaultdict(lambda: [0]*NY)
rd=csv.reader(io.open(HIST,encoding='latin-1')); next(rd)
for r in rd:
    try:
        y=int(float(r[0])); k=int(float(r[3])); sub=r[7].strip(); v=sum(int(float(x)) for x in r[9:21] if x not in ("",None))
    except Exception: continue
    if y<2015 or y>2025 or v==0: continue
    yi=y-2015
    M[k][sub][yi]+=v; TOT[k][yi]+=v

# --- 2026 ene-may (RNID) con mapeo a histórico ---
unmatched=collections.Counter()
rd=csv.reader(io.open(MAY,encoding='latin-1')); next(rd)
for r in rd:
    try:
        k=int(float(r[3])); tipo=r[6].strip(); sub=r[7].strip(); v=sum(int(float(x)) for x in r[9:15] if x not in ("",None))
    except Exception: continue
    if v==0: continue
    TOT[k][NY-1]+=v  # 'Todos los delitos' 2026 ene-jun = todo el RNID (mayo fue 826,759)
    if sub in CAT: tgt=sub
    elif ' - ' in sub and sub.split(' - ')[0].strip() in CAT and 'Tentativa' not in sub: tgt=sub.split(' - ')[0].strip()
    elif tipo in CAT and 'Tentativa' not in sub: tgt=tipo
    else: unmatched[sub]+=v; continue
    M[k][tgt][NY-1]+=v

print("RNID sin equivalente historico (no mapeado a delito, si al total):")
for s,v in unmatched.most_common(8): print("   %7d  %s"%(v,s))
print("   total sin mapear:",sum(unmatched.values()))

# --- salida dispersa ---
D={}
for k in set(M)|set(TOT):
    row={}
    tot=TOT.get(k)
    if tot and any(tot): row[0]=tot
    for sub,arr in M.get(k,{}).items():
        if sub in IDX and any(arr): row[IDX[sub]]=arr
    if row: D[k]=row
ANIOS=[str(y) for y in YEARS]+['2026 ene-jun']
io.open(OUT,'w',encoding='utf-8').write('const NAC_MUNI_DATA={anios:'+json.dumps(ANIOS,ensure_ascii=False)+',delitos:'+json.dumps(DEL,ensure_ascii=False)+',d:'+json.dumps(D,separators=(',',':'),ensure_ascii=False)+'};')

# --- cotejo ---
def nat(sub,yi):
    i=DEL.index(sub); s=0
    for k,row in D.items():
        a=row.get(i)
        if a: s+=a[yi]
    return s
i25=YEARS.index(2025); i26=NY-1
print("COTEJO nacional 2025: HD",nat('Homicidio doloso',i25),"(esp 20191) | Extorsion",nat('Extorsión',i25),"(esp 10508) | Violencia familiar",nat('Violencia familiar',i25),"(esp 266760)")
print("COTEJO 2026 ene-jun: HD",nat('Homicidio doloso',i26),"| Extorsion",nat('Extorsión',i26),"| Narco",nat('Narcomenudeo',i26),"(mayo fue: HD 6630 / Ext 4460 / Narco 43201)")
tot26=sum(row.get(0,[0]*NY)[i26] for row in D.values())
print("COTEJO Todos 2026 ene-jun:",tot26,"(mayo fue 826759) | Todos 2025:",sum(row.get(0,[0]*NY)[i25] for row in D.values()),"(esp 2016724)")
print("nuevo: Robo a casa habitacion 2025 =",nat('Robo a casa habitación',i25))
print("municipios:",len(D))
import os; print("archivo:",round(os.path.getsize(OUT)/1048576,2),"MB")
