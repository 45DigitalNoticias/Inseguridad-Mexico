# -*- coding: utf-8 -*-
"""ORQUESTADOR DE CORTE — una sola fuente, un solo comando.

Deriva TODAS las bases nacionales que alimentan la pagina DESDE la matriz unica
(_nac_muni_data.js), al MISMO corte. Nunca mas una base en un corte y otra en otro.

Flujo del proyecto:
  1) Llega corte nuevo del SESNSP -> se baja el crudo a BASES_NACIONALES.
  2) `python _generar_matriz_55.py`  -> reescribe la MATRIZ (_nac_muni_data.js).
  3) `python _actualizar_corte.py`   -> ESTE script deriva de la matriz:
        - _nac_estatal_data.js   (suma municipal -> estado, 9 delitos)
        - series_2026.js         (parcial del anio en curso, por subtipo, por estado)
        - panorama_estatal.js / .csv  (solo columnas del parcial 2026 + su corte)
     Estampa el corte en cada archivo. Coteja. NO toca lo estatico (2015-2025).

Estaticos que NO se tocan (no dependen del corte): series_completo.js,
delitos_completo.js, geo, poblacion. Fuentes externas (se fijan con su fecha, no
salen de la matriz): RNPDNO (desaparecidos), CONAPO (poblacion), ENVIPE (percepcion).

Uso:
  python _actualizar_corte.py                 # deriva del _nac_muni_data.js actual y escribe
  python _actualizar_corte.py --validar BACKUP # compara derivacion vs archivos actuales, NO escribe
"""
import json, sys, io, os, argparse, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
MATRIZ   = os.path.join(HERE, "_nac_muni_data.js")
ESTATAL  = os.path.join(HERE, "_nac_estatal_data.js")
SERIES26 = os.path.join(HERE, "series_2026.js")
PANO_JS  = os.path.join(HERE, "panorama_estatal.js")
PANO_CSV = os.path.join(HERE, "datos", "panorama_estatal_32.csv")
SM_DIR   = os.path.join(HERE, "series_mensuales")
# crudos (mismos que _generar_matriz_55.py). Al cambiar de corte, ajustar RNID.
HIST_RAW = r"C:\Users\SRVal\Documents\Claude\Projects\INSEGURIDAD MÉXICO\BASES_NACIONALES\_SESNSP_2015-2025_oficial\Municipal-Delitos-2015-2025_may2026\Municipal-Delitos-2015-2025_may2026.csv"
RNID_RAW = r"C:\Users\SRVal\Documents\Claude\Projects\INSEGURIDAD MÉXICO\BASES_NACIONALES\delitos_municipales_RNID_2026\RNID-Delitos_Municipal-2026-jun2026.csv"
N_MESES_2026 = 6  # ene-jun

# indices 0-8 de la matriz = los 9 delitos del estatal (Todos + 8 nucleo)
EST_DELITOS = ['Todos los delitos','Homicidio doloso','Feminicidio','Extorsión',
               'Narcomenudeo','Lesiones dolosas','Violencia familiar','Secuestro','Homicidio culposo']

def cargar_matriz(path):
    s = io.open(path, encoding='utf-8').read()
    anios   = json.loads(s[s.find('anios:')+6 : s.find(']', s.find('anios:'))+1])
    delitos = json.loads(s[s.find('delitos:')+8 : s.find(']', s.find('delitos:'))+1])
    d, _    = json.JSONDecoder().raw_decode(s, s.find('d:{')+2)
    return anios, delitos, d

def estados_de(d):
    # cve municipio -> cve estado (2 primeros digitos, o 1 para claves de 4)
    est = {}
    for k, row in d.items():
        e = k[:2] if len(k) >= 5 else k[:len(k)-3]  # 17006 -> '17'; 9002 -> '9'
        # normalizar: clave estado sin cero a la izquierda
        ei = str(int(k) // 1000)
        est.setdefault(ei, []).append(k)
    return est

def derivar(matriz_path):
    anios, delitos, d = cargar_matriz(matriz_path)
    NY = len(anios)
    idx_nombre = {i: n for i, n in enumerate(delitos)}
    nombre_idx = {n: i for i, n in enumerate(delitos)}
    est_munis = estados_de(d)

    # ---- ESTATAL (9 delitos, denso) ----
    est_d = {}
    for e, munis in est_munis.items():
        filas = []
        for dn in EST_DELITOS:
            di = str(nombre_idx[dn])
            serie = [0]*NY
            for k in munis:
                a = d[k].get(di)
                if a:
                    for i in range(NY):
                        serie[i] += a[i]
            filas.append(serie)
        est_d[e] = filas

    # ---- SERIES 2026 PARCIAL (por subtipo, por estado) ----
    ip = NY - 1  # indice del parcial (ultimo anio)
    ser26 = {}
    for e, munis in est_munis.items():
        sub = {}
        for k in munis:
            for di, arr in d[k].items():
                di = int(di)
                if di == 0:  # 'Todos' no es subtipo
                    continue
                v = arr[ip]
                if v:
                    sub[idx_nombre[di]] = sub.get(idx_nombre[di], 0) + v
        ser26[e] = sub

    return anios, est_d, ser26, d, nombre_idx

def escribir_estatal(anios, est_d):
    payload = ('const NAC_EST_DATA={anios:' + json.dumps(anios, ensure_ascii=False) +
               ',delitos:' + json.dumps(EST_DELITOS, ensure_ascii=False) +
               ',d:' + json.dumps(est_d, separators=(',', ':')) + '};')
    io.open(ESTATAL, 'w', encoding='utf-8').write(payload)

def escribir_series26(ser26, corte):
    head = '// SERIES_2026_PARCIAL — derivado de la matriz unica. Corte: %s\n' % corte
    payload = head + 'const SERIES_2026_PARCIAL = ' + json.dumps(ser26, ensure_ascii=False, separators=(',', ':')) + ';'
    io.open(SERIES26, 'w', encoding='utf-8').write(payload)

def actualizar_panorama(d, nombre_idx, anios, corte):
    """Solo refresca las columnas del parcial 2026 (total y hd) desde la matriz. Deja lo demas."""
    import csv
    ip = len(anios) - 1
    est_munis = estados_de(d)
    def est_val(e, dn):
        di = str(nombre_idx[dn]); s = 0
        for k in est_munis.get(e, []):
            a = d[k].get(di)
            if a: s += a[ip]
        return s
    rows = list(csv.reader(io.open(PANO_CSV, encoding='utf-8-sig')))
    hdr = rows[0]
    ci_tot = hdr.index('sesnsp_2026_parcial_total')
    ci_hd  = hdr.index('sesnsp_2026_parcial_hd')
    ci_ent = hdr.index('clave_ent')
    cambios = []
    for r in rows[1:]:
        e = str(int(r[ci_ent]))
        nt = est_val(e, 'Todos los delitos'); nh = est_val(e, 'Homicidio doloso')
        if r[ci_tot] != str(nt) or r[ci_hd] != str(nh):
            cambios.append((r[hdr.index('entidad')], r[ci_tot], nt, r[ci_hd], nh))
        r[ci_tot] = str(nt); r[ci_hd] = str(nh)
    # escribir CSV
    with io.open(PANO_CSV, 'w', encoding='utf-8-sig', newline='') as f:
        csv.writer(f).writerows(rows)
    # regenerar panorama_estatal.js desde el CSV (mismo shape: array de objetos)
    dictrows = list(csv.DictReader(io.open(PANO_CSV, encoding='utf-8-sig')))
    def conv(x):
        try:
            return int(x) if x != '' and float(x) == int(float(x)) else (float(x) if x != '' else x)
        except Exception:
            return x
    arr = [{k: conv(v) for k, v in row.items()} for row in dictrows]
    head = '// PANORAMA_ESTATAL — columnas 2026 derivadas de la matriz. Corte parcial: %s\n' % corte
    io.open(PANO_JS, 'w', encoding='utf-8').write(head + 'const PANORAMA_ESTATAL = ' + json.dumps(arr, ensure_ascii=False, separators=(',', ':')) + ';')
    return cambios

def construir_mensuales():
    """Series mensuales sm_XX.js (por estado) desde el CRUDO (columnas de mes).
    Historico 2015-2025 + RNID 2026 (N_MESES_2026). Agrega municipal->estado.
    Subtipos = catalogo completo de la matriz (55) + 'TOTAL ESTATAL' (total mensual real)."""
    import csv
    from collections import defaultdict
    sm = io.open(MATRIZ, encoding='utf-8').read()
    DELM = json.loads(sm[sm.find('delitos:')+8 : sm.find(']', sm.find('delitos:'))+1])
    CAT = set(DELM[1:])  # 55 subtipos (sin 'Todos')
    def mapear(sub, tipo):
        if sub in CAT: return sub
        if ' - ' in sub and sub.split(' - ')[0].strip() in CAT and 'Tentativa' not in sub: return sub.split(' - ')[0].strip()
        if tipo in CAT and 'Tentativa' not in sub: return tipo
        return None
    NMH = 11*12; N26 = N_MESES_2026; NT = NMH + N26
    # estado -> subtipo -> [NT] ; y total estatal
    data = defaultdict(lambda: defaultdict(lambda: [0]*NT))
    tot  = defaultdict(lambda: [0]*NT)
    # historico 2015-2025 (todos los subtipos entran; el total suma todo)
    rd = csv.reader(io.open(HIST_RAW, encoding='latin-1')); next(rd)
    for r in rd:
        try:
            y = int(float(r[0])); e = int(float(r[1]))
            if y < 2015 or y > 2025: continue
            sub = r[7].strip(); base = (y-2015)*12
            for m in range(12):
                x = r[9+m]
                if x not in ("", None):
                    v = int(float(x)); data[e][sub][base+m] += v; tot[e][base+m] += v
        except Exception: continue
    # 2026 RNID (subtipos mapeados al catalogo; total suma TODO)
    rd = csv.reader(io.open(RNID_RAW, encoding='latin-1')); next(rd)
    for r in rd:
        try:
            e = int(float(r[1]))
            for m in range(N26):
                x = r[9+m]
                if x not in ("", None): tot[e][NMH+m] += int(float(x))
            tgt = mapear(r[7].strip(), r[6].strip())
            if tgt:
                for m in range(N26):
                    x = r[9+m]
                    if x not in ("", None): data[e][tgt][NMH+m] += int(float(x))
        except Exception: continue
    labels = ["%d-%02d" % (y, m) for y in range(2015, 2026) for m in range(1, 13)] + ["2026-%02d" % m for m in range(1, N26+1)]
    n = 0
    for e in sorted(data):
        delitos = {}
        for s in sorted(CAT):                      # catalogo completo, uniforme (aunque sea 0)
            delitos[s] = data[e].get(s, [0]*NT)
        delitos["TOTAL ESTATAL"] = tot[e]
        obj = {"labels": labels, "meses_2026": N26, "delitos": delitos}
        payload = "const SERIE_MENSUAL = " + json.dumps(obj, ensure_ascii=False, separators=(',', ':')) + ";"
        io.open(os.path.join(SM_DIR, "sm_%02d.js" % e), 'w', encoding='utf-8').write(payload)
        n += 1
    # cotejo: TOTAL ESTATAL nacional (suma de meses 2026) vs matriz Todos
    tot_nac_2026 = sum(sum(tot[e][NMH:]) for e in tot)
    return n, tot_nac_2026, labels[-1]

def cotejo(anios, est_d, ser26, d, nombre_idx):
    ip = len(anios) - 1
    def nac_matriz(dn):
        di = str(nombre_idx[dn]); return sum(v[di][ip] for v in d.values() if di in v)
    def nac_est(dn):
        i = EST_DELITOS.index(dn); return sum(est_d[e][i][ip] for e in est_d)
    print("  corte (matriz):", anios[-1])
    for dn in ['Todos los delitos','Homicidio doloso','Extorsión','Narcomenudeo']:
        print("  %-20s matriz=%d  estatal=%d  %s" % (dn, nac_matriz(dn), nac_est(dn),
              'OK' if nac_matriz(dn) == nac_est(dn) else '‼ DIFIERE'))
    # Morelos control
    i_ext = EST_DELITOS.index('Extorsión')
    print("  Morelos extorsion parcial: estatal=%d (antes 0/bug) | series_2026 Morelos total=%d | matriz Todos=%d"
          % (est_d['17'][i_ext][ip], sum(ser26['17'].values()), nac_matriz('Todos los delitos')))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--validar', metavar='BACKUP', help='matriz de respaldo (ej. mayo) para comparar sin escribir')
    a = ap.parse_args()

    if a.validar:
        # derivar desde ambas matrices y comparar la parte ESTABLE (2015-2025) con los archivos actuales
        anios_b, est_b, ser_b, db, ni_b = derivar(a.validar)
        # cargar estatal actual
        s = io.open(ESTATAL, encoding='utf-8').read()
        d_act, _ = json.JSONDecoder().raw_decode(s, s.find('d:{')+2)
        ny = len(anios_b); estables = ny - 1
        difs = 0; celdas = 0
        for e in est_b:
            for i in range(len(EST_DELITOS)):
                for yr in range(estables):  # solo 2015-2025
                    celdas += 1
                    if est_b[e][i][yr] != d_act.get(e, [[0]*ny]*9)[i][yr]:
                        difs += 1
        print("VALIDACION estatal 2015-2025 (derivado-de-matriz-mayo vs archivo actual):")
        print("  celdas comparadas: %d  |  diferencias: %d" % (celdas, difs))
        print("  -> %s" % ("IDENTICO: la derivacion reproduce el historico, seguro pasar a junio" if difs == 0
                            else "HAY DIFERENCIAS: revisar antes de escribir"))
        # mostrar el fix del parcial 2026 que introduce la derivacion
        ip = ny - 1; i_ext = EST_DELITOS.index('Extorsión')
        print("  Nota parcial-2026: estatal actual Morelos extorsion =",
              d_act['17'][i_ext][ip], "-> derivado =", est_b['17'][i_ext][ip], "(corrige el bug)")
        return

    anios, est_d, ser26, d, nombre_idx = derivar(MATRIZ)
    corte = anios[-1]
    escribir_estatal(anios, est_d)
    escribir_series26(ser26, corte)
    cambios = actualizar_panorama(d, nombre_idx, anios, corte)
    print("BASES DERIVADAS DE LA MATRIZ (corte %s):" % corte)
    print("  _nac_estatal_data.js  OK")
    print("  series_2026.js        OK")
    print("  panorama (js+csv)     OK  (%d estados con parcial 2026 actualizado)" % len(cambios))
    print("SERIES MENSUALES (desde el crudo)...")
    n_sm, tot_sm, ult = construir_mensuales()
    print("  series_mensuales/sm_XX.js  OK  (%d estados, hasta %s)" % (n_sm, ult))
    print("--- cotejo ---")
    cotejo(anios, est_d, ser26, d, nombre_idx)
    # cotejo mensual: suma de TOTAL ESTATAL 2026 == matriz Todos 2026
    ip = len(anios)-1
    tot_matriz = sum(v['0'][ip] for v in d.values() if '0' in v)
    print("  mensual: sum(TOTAL ESTATAL 2026)=%d  vs matriz Todos 2026=%d  %s"
          % (tot_sm, tot_matriz, 'OK' if tot_sm == tot_matriz else '‼ DIFIERE'))

if __name__ == '__main__':
    main()
