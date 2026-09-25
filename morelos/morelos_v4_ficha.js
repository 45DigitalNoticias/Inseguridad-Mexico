/* Ficha Morelos v4 · UNA lógica para municipio, región y estado
   Cada página declara su entidad (data-id). Sus pares y su referencia salen de MV4:
   municipio → 36 municipios y Morelos · región → 7 regiones y Morelos · estado → 32 estados y México */
(function () {
  const V = MV4, $ = s => document.querySelector(s), NS = 'http://www.w3.org/2000/svg';
  const M = V.ent[document.body.dataset.id], RAIZ = document.body.dataset.raiz || '';
  const TIPO = M.tipo, R = V.ent[V.ref[TIPO]], P = V.pares[TIPO].map(id => V.ent[id]);
  const YO = TIPO === 'estado' ? 'e17' : M.id;                 // Morelos en la lista nacional
  const NP = P.length, PAR1 = { muni: 'municipio', region: 'región', estado: 'estado' }[TIPO];
  const f0 = new Intl.NumberFormat('es-MX'), f1 = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 });
  const MES3 = V.mes.slice(0, 3);
  const TODOS = 0, HD = V.largo.indexOf('Homicidio doloso');
  const iPop = a => V.popAnios.indexOf(a);
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const munis = V.pares.muni.map(id => V.ent[id]);
  const url = e => RAIZ + e.ruta;

  const S = (m, i) => m.d ? m.d[i] : null;
  const a25 = (m, i) => { if (m.a25) return m.a25[i]; const s = S(m, i); return s ? s.a[s.a.length - 1] : 0; };
  const pop = m => m.pop != null ? m.pop : m.pa[iPop(2025)];
  const tasa = (n, p) => p ? n / p * 1e5 : 0;
  const pctTxt = v => (v > 0 ? '+' : v < 0 ? '−' : '') + f1.format(Math.abs(v)) + '%';

  // Estado de un delito en ESTA entidad, periodo contra periodo
  function est(i, m = M) {
    const s = S(m, i);
    if (!s || (!s.p25 && !s.p26)) return { c: 'cero' };
    if (V.cmp[i] === 'afectado' || V.cmp[i] === 'espejo') return { c: 'nc', s };
    if (Math.max(s.p25, s.p26) < 10) return { c: 'es', s, poco: 1 };
    if (!s.p25) return { c: 'su', s, v: 999, fuerte: 1 };
    const v = (s.p26 - s.p25) / s.p25 * 100;
    return { c: v >= 5 ? 'su' : v <= -5 ? 'ba' : 'es', s, v, fuerte: Math.abs(v) >= 30 };
  }
  const idx55 = V.del.map((_, i) => i).slice(1);

  // ---------- barra: sección activa y selector de municipio ----------
  document.querySelectorAll('.barra nav a').forEach(a => a.classList.toggle('on', a.dataset.n === document.body.dataset.nav));
  const sel = $('#cambiar');
  sel.innerHTML = `<option value="">${TIPO === 'muni' ? M.n : 'Ir a un municipio…'}</option>` + Object.keys(V.regiones).map(r =>
    `<optgroup label="Región ${r}">` +
    munis.filter(m => m.reg === r).sort((a, b) => a.n.localeCompare(b.n, 'es'))
      .map(m => `<option value="${url(m)}">${m.n}</option>`).join('') + '</optgroup>').join('');
  sel.onchange = () => { if (sel.value) location.href = sel.value; };

  // ---------- localizador ----------
  const loc = $('#loc');
  if (TIPO === 'estado') loc.closest('.loc').remove();
  else {
    const mios = TIPO === 'region' ? M.hijos : [M.id];
    loc.setAttribute('viewBox', `0 0 ${V.geo.w} ${V.geo.h}`);
    loc.innerHTML = munis.map(m => `<path d="${m.p}" class="${mios.includes(m.id) ? 'yo' : m.reg === M.reg ? 'reg' : ''}"/>`).join('');
  }
  if (TIPO !== 'estado') document.querySelectorAll('.solo-estado').forEach(n => n.remove());
  $('#t-podio').textContent = TIPO === 'estado' ? 'Dónde queda Morelos en el país' : TIPO === 'region' ? 'Dónde queda más arriba entre las regiones' : 'Dónde queda más arriba en Morelos';

  // ================= A · qué sube, qué baja =================
  const FLECHA = up => `<svg class="fl" viewBox="0 0 16 16" aria-hidden="true"><path d="${up ? 'M8 13V3M3.5 7.5 8 3l4.5 4.5' : 'M8 3v10M3.5 8.5 8 13l4.5-4.5'}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>`;
  let filtroA = null;   // null = todos · 'su' · 'ba' · 'es'
  function A() {
    const g = { su: [], es: [], ba: [] }, nc = [], cero = [];
    idx55.forEach(i => { const e = est(i); if (e.c === 'cero') cero.push(i); else if (e.c === 'nc') nc.push(i); else g[e.c].push([i, e]); });
    Object.values(g).forEach(l => l.sort((a, b) => b[1].s.p26 - a[1].s.p26));
    const vols = idx55.map(i => (S(M, i) || {}).p26 || 0).filter(v => v > 0).sort((a, b) => a - b);
    const q = p => vols[Math.floor(vols.length * p)] || 0;
    const gr = n => n >= q(.8) ? 'g3' : n >= q(.45) ? 'g2' : 'g1';
    const tot = S(M, TODOS), vt = tot && tot.p25 ? (tot.p26 - tot.p25) / tot.p25 * 100 : 0;
    const IGUAL = '<svg class="fl" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6h10M3 10h10" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    const valor = (e, k) => k === 'es'
      ? (e.poco ? `${f0.format(e.s.p25)}→${f0.format(e.s.p26)}` : `${IGUAL}${pctTxt(e.v)}`)
      : `${FLECHA(k === 'su')}${e.v === 999 ? 'nuevo' : f1.format(Math.abs(e.v)) + '%'}`;
    const fila = ([i, e], k) => `<button class="mv ${gr(e.s.p26)} ${e.fuerte && k !== 'es' ? 'fuerte' : ''}" data-i="${i}">
        <span class="mv-n">${V.del[i]}</span><span class="mv-v">${valor(e, k)}</span></button>`;
    const lista = k => g[k].map(x => fila(x, k)).join('') || '<p class="mv-vacio">Ninguno</p>';
    const TIT = { su: 'Suben', ba: 'Bajan', es: 'Estables o con menos de 10 casos' };
    const lado = (k, ancho) => `<div class="lado ${k} ${ancho ? 'ancho' : ''}"><h4>${k === 'es' ? IGUAL : FLECHA(k === 'su')}${TIT[k]}<span class="cuenta">${g[k].length}</span></h4><div class="filas-mv">${lista(k)}</div></div>`;
    const cuerpo = filtroA
      ? lado(filtroA, true)
      : `<div class="duo">${lado('su')}${lado('ba')}</div>
         <p class="estables"><b>Estables o con menos de 10 casos:</b> ${g.es.map(([i]) => `<button data-i="${i}">${V.del[i]}</button>`).join(', ') || 'ninguno'}.</p>`;
    const mc = (k, n, txt) => `<button class="mc ${k} ${filtroA === k ? 'on' : ''} ${filtroA && filtroA !== k ? 'off' : ''}" data-f="${k}" aria-pressed="${filtroA === k}"><b>${n}</b><span>${txt}</span></button>`;
    $('#A').innerHTML = `
      <div class="marcador">
        ${mc('su', g.su.length, g.su.length === 1 ? 'delito sube' : 'delitos suben')}
        ${mc('ba', g.ba.length, g.ba.length === 1 ? 'baja' : 'bajan')}
        ${mc('es', g.es.length, 'estables o con pocos casos')}
        <button class="mc tot ${filtroA ? 'off' : ''}" data-f="" aria-pressed="${!filtroA}"><b class="${vt >= 1 ? 'sube' : vt <= -1 ? 'baja' : 'igual'}">${pctTxt(vt)}</b><span>${f0.format(tot ? tot.p26 : 0)} carpetas en total</span></button>
      </div>
      <div class="proporcion">
        <button class="su ${filtroA && filtroA !== 'su' ? 'off' : ''}" data-f="su" style="flex:${g.su.length}" aria-label="Ver solo los que suben"></button>
        <button class="es ${filtroA && filtroA !== 'es' ? 'off' : ''}" data-f="es" style="flex:${g.es.length}" aria-label="Ver solo los estables"></button>
        <button class="ba ${filtroA && filtroA !== 'ba' ? 'off' : ''}" data-f="ba" style="flex:${g.ba.length}" aria-label="Ver solo los que bajan"></button>
      </div>
      <p class="pista-f">${filtroA ? `Mostrando solo: <b>${TIT[filtroA].toLowerCase()}</b>. <button data-f="">Ver todos</button>` : 'Toca un número para ver solo ese grupo.'}</p>
      ${cuerpo}
      <p class="resto">${nc.length ? `<button id="ver-nc">${nc.length} no comparables</button> con 2025 por el cambio de metodología · ` : ''}${cero.length} sin casos en ninguno de los dos años.</p>
      <p class="estables nc-lista" id="nc-lista">${nc.map(i => `<button data-i="${i}">${V.del[i]}</button>`).join(', ')}.</p>`;
    const b = $('#ver-nc'); if (b) b.onclick = () => $('#nc-lista').classList.toggle('abierta');
    document.querySelectorAll('#A [data-i]').forEach(p => p.onclick = () => abre(+p.dataset.i));
    document.querySelectorAll('#A [data-f]').forEach(p => p.onclick = () => {
      const f = p.dataset.f || null;
      filtroA = filtroA === f ? null : f;
      A(); marcaSel();
    });
  }

  // ================= B · los que más se movieron =================
  function B() {
    const r = idx55.map(i => [i, est(i)]).filter(([, e]) => e.s && e.c !== 'nc')
      .map(([i, e]) => [i, e.s.p26 - e.s.p25]).filter(([, d]) => d !== 0)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 10);
    if (!r.length) { $('#B').innerHTML = '<p class="frase">Ningún delito comparable cambió entre 2025 y 2026.</p>'; return; }
    const mx = Math.max(...r.map(x => Math.abs(x[1])));
    $('#B').innerHTML = `<div class="bars"><div class="ejes"><span>Bajan</span><span>Suben</span></div>` + r.map(([i, d]) => {
      const w = (Math.abs(d) / mx * 55).toFixed(1) + '%';
      return d < 0
        ? `<div class="bar" data-i="${i}" tabindex="0"><div class="izq" style="--w:${w}"><span class="et2">${V.del[i]}<span class="n">−${f0.format(-d)}</span></span><i style="width:${w}"></i></div><div class="der"></div></div>`
        : `<div class="bar" data-i="${i}" tabindex="0"><div class="izq"></div><div class="der" style="--w:${w}"><i style="width:${w}"></i><span class="et2"><span class="n">+${f0.format(d)}</span>${V.del[i]}</span></div></div>`;
    }).join('') + `</div><p class="resto">Diferencia en carpetas, enero a ${V.mes} de 2026 menos el mismo periodo de 2025.</p>`;
    document.querySelectorAll('#B .bar').forEach(b => { b.onclick = () => abre(+b.dataset.i); b.onkeydown = e => { if (e.key === 'Enter') abre(+b.dataset.i); }; });
  }

  // ================= C · dónde está el volumen (columnas ordenadas) =================
  const FON = { su: '#E67E39', sf: '#B42222', ba: '#4BA3A3', bf: '#00808A', es: '#3a3f48' };
  function C() {
    const box = $('#C'), W = box.clientWidth, movil = W < 640;
    const CAB = 24, MINB = 34, MINCOL = 118;
    let fams = V.ordenFam.map(f => {
      const items = idx55.filter(i => V.fam[i] === f).map(i => ({ i, e: est(i), v: (S(M, i) || {}).p26 || 0 })).filter(x => x.v > 0);
      return { f, items, v: items.reduce((t, a) => t + a.v, 0) };
    }).filter(g => g.v).sort((a, b) => b.v - a.v);
    const total = fams.reduce((t, g) => t + g.v, 0) || 1;
    // escritorio: las familias demasiado angostas para leerse se juntan en una columna final
    if (!movil) {
      const chicas = fams.filter(g => g.v / total * W < MINCOL);
      if (chicas.length > 1) {
        fams = fams.filter(g => !chicas.includes(g));
        fams.push({ f: 'Otras familias', items: chicas.flatMap(g => g.items), v: chicas.reduce((t, g) => t + g.v, 0) });
      }
    }
    // dentro de cada familia: de mayor a menor; lo que no cabe con nombre se agrupa al final
    const agrupa = (g, util, min) => {
      const its = g.items.slice().sort((a, b) => b.v - a.v), ok = [], chicos = [];
      its.forEach(x => (x.v / g.v * util >= min ? ok : chicos).push(x));
      if (chicos.length === 1) ok.push(chicos[0]);
      else if (chicos.length) ok.push({ resto: chicos.map(x => x.i), v: chicos.reduce((t, x) => t + x.v, 0) });
      return ok;
    };
    const celda = (r, x, y, w, h) => {
      const chico = w < 110 || h < 52, lab = w > 40 && h > 24;
      if (r.resto) return `<div class="r agrup ${chico ? 'ch' : ''}" data-resto="${r.resto.join(',')}" tabindex="0" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${lab ? `<b>+${r.resto.length} delitos más</b>${h > 50 ? `<small>${f0.format(r.v)}</small>` : ''}` : ''}</div>`;
      const e = r.e, bg = e.c === 'nc' ? '' : e.c === 'su' ? (e.fuerte ? FON.sf : FON.su) : e.c === 'ba' ? (e.fuerte ? FON.bf : FON.ba) : FON.es;
      const claro = (e.c === 'su' || e.c === 'ba') && !e.fuerte;
      return `<div class="r ${e.c === 'nc' ? 'nc' : ''} ${claro ? 'claro' : ''} ${chico ? 'ch' : ''}" data-i="${r.i}" tabindex="0" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${bg ? 'background:' + bg : ''}">${lab ? `<b>${V.del[r.i]}</b>${h > 50 ? `<small>${f0.format(r.v)}</small>` : ''}` : ''}</div>`;
    };
    let html = '', H;
    if (!movil) {
      // una columna por familia, ancho según su peso, delitos apilados de mayor a menor
      H = 500; let x = 0;
      // ancho proporcional, con un mínimo legible por columna; el resto se reparte en proporción
      const piso = fams.map(g => g.v / total * W < MINCOL);
      const fijo = piso.filter(Boolean).length * MINCOL, vLibre = fams.reduce((t, g, k) => t + (piso[k] ? 0 : g.v), 0) || 1;
      const anchos = fams.map((g, k) => piso[k] ? MINCOL : g.v / vLibre * (W - fijo));
      fams.forEach((g, k) => {
        const w = anchos[k];
        html += `<span class="famt" style="left:${x}px;top:0;width:${w}px">${g.f}</span>`;
        const ok = agrupa(g, H - CAB, MINB), sum = ok.reduce((t, r) => t + r.v, 0);
        let y = CAB;
        ok.forEach(r => { const h = r.v / sum * (H - CAB); html += celda(r, x, y, w, h); y += h; });
        x += w;
      });
    } else {
      // teléfono: una fila por familia, alto según su peso, delitos de izquierda a derecha
      const ALTO = 560; let y = 0;
      fams.forEach(g => {
        const h = Math.max(92, g.v / total * ALTO);
        html += `<span class="famt" style="left:0;top:${y}px;width:${W}px">${g.f}</span>`;
        const ok = agrupa(g, W, 84), sum = ok.reduce((t, r) => t + r.v, 0);
        let x = 0;
        ok.forEach(r => { const w = r.v / sum * W; html += celda(r, x, y + CAB, w, h - CAB); x += w; });
        y += h + 8;
      });
      H = y;
    }
    box.style.height = H + 'px';
    box.innerHTML = html + '<div class="tm-tip" id="tm-tip"></div>';
    const tip = $('#tm-tip');
    const texto = b => {
      if (b.dataset.resto) {
        const ids = b.dataset.resto.split(',').map(Number);
        return `<b>${ids.length} delitos con pocos casos</b>` + ids.map(i => `<span>${V.del[i]} · ${f0.format(S(M, i).p26)}</span>`).join('');
      }
      const i = +b.dataset.i, e = est(i), s = S(M, i);
      const c = e.c === 'nc' ? 'no comparable con 2025' : e.poco ? `${f0.format(s.p25)} en 2025 · pocos casos` : e.v === 999 ? 'nuevo en 2026' : e.v != null ? `${pctTxt(e.v)} contra 2025` : '';
      return `<b>${V.largo[i]}</b><span>${f0.format(s.p26)} carpetas, ene-${MES3} 2026</span><span>${c}</span>`;
    };
    const muestra = (b, ev) => {
      tip.innerHTML = texto(b);
      const bx = box.getBoundingClientRect(), r = b.getBoundingClientRect();
      let x = ev && ev.clientX ? ev.clientX - bx.left + 14 : r.left - bx.left + 10, y = ev && ev.clientY ? ev.clientY - bx.top + 14 : r.top - bx.top + 10;
      tip.style.opacity = 1;
      if (x + tip.offsetWidth > bx.width) x = Math.max(4, x - tip.offsetWidth - 28);
      if (y + tip.offsetHeight > bx.height) y = Math.max(4, y - tip.offsetHeight - 28);
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    };
    box.querySelectorAll('.r').forEach(b => {
      b.onmousemove = ev => muestra(b, ev);
      b.onmouseleave = () => tip.style.opacity = 0;
      b.onfocus = () => muestra(b);
      b.onblur = () => tip.style.opacity = 0;
      b.onclick = ev => { if (b.dataset.resto) { muestra(b, ev); return; } abre(+b.dataset.i); };
    });
    marcaSel();
  }

  // ================= D · explora un delito, con filtros =================
  let actual = null, medida = 'n';
  const fdel = $('#f-del');
  fdel.innerHTML = `<option value="0">Todos los delitos</option>` + V.ordenFam.map(f =>
    `<optgroup label="${f}">` + idx55.filter(i => V.fam[i] === f)
      .sort((a, b) => ((S(M, b) || {}).p26 || 0) - ((S(M, a) || {}).p26 || 0))
      .map(i => `<option value="${i}">${V.largo[i]}${S(M, i) ? '' : ' · sin casos'}</option>`).join('') + '</optgroup>').join('');
  fdel.onchange = () => abre(+fdel.value, false);
  const RAP = ['Todos los delitos', 'Homicidio doloso', 'Feminicidio', 'Extorsión', 'Robo de vehículo automotor', 'Violencia familiar', 'Narcomenudeo', 'Robo a negocio'].map(s => V.largo.indexOf(s));
  $('#rapidos').innerHTML = RAP.map(i => `<button data-i="${i}">${V.del[i]}</button>`).join('');
  document.querySelectorAll('#rapidos button').forEach(b => b.onclick = () => abre(+b.dataset.i, false));
  document.querySelectorAll('#f-med button').forEach(b => b.onclick = () => {
    medida = b.dataset.m; document.querySelectorAll('#f-med button').forEach(x => x.classList.toggle('on', x === b)); abre(actual, false);
  });

  function el(tag, at, txt) { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; }
  // serie de la referencia (Morelos o México) para comparar en tasa
  function datos(i) {
    const s = S(M, i) || { a: V.anios.map(() => 0), p25: 0, p26: 0, m25: Array(V.n).fill(0), m26: Array(V.n).fill(0) };
    if (medida === 'n') return { s, e: null };
    const r = S(R, i) || { a: V.anios.map(() => 0) }, p25 = M.pa[iPop(2025)], p26 = M.pa[iPop(2026)];
    return {
      s: { a: s.a.map((v, k) => tasa(v, M.pa[iPop(V.anios[k])])), p25: tasa(s.p25, p25), p26: tasa(s.p26, p26), m25: s.m25.map(v => tasa(v, p25)), m26: s.m26.map(v => tasa(v, p26)) },
      e: { a: r.a.map((v, k) => tasa(v, R.pa[iPop(V.anios[k])])), p25: r.p25 != null ? tasa(r.p25, R.pa[iPop(2025)]) : null, p26: r.p26 != null ? tasa(r.p26, R.pa[iPop(2026)]) : null }
    };
  }
  const fmtV = v => medida === 'n' ? f0.format(Math.round(v)) : f1.format(v);

  function grafAnual(D) {
    const svg = $('#g-anual'); svg.innerHTML = '';
    const { s, e } = D, A = s.a, n = A.length;
    const W = 560, H = 230, B = 26, T = 20;
    const mx = Math.max(1e-9, ...A, s.p25, s.p26, ...(e ? [...e.a, e.p25, e.p26] : []));
    const anchoA = 400, gw = anchoA / n, bw = gw * .66;
    const y = v => H - B - (H - B - T) * v / mx;
    const iMax = A.indexOf(Math.max(...A));
    A.forEach((v, k) => {
      const x = k * gw + (gw - bw) / 2;
      svg.appendChild(el('rect', { x, y: y(v), width: bw, height: Math.max(0, H - B - y(v)), fill: k === n - 1 ? '#E4DCCE' : k === iMax && v > 0 ? '#E67E39' : '#4a4f58' }));
      if (k % 2 === 0 || k === n - 1) svg.appendChild(el('text', { x: x + bw / 2, y: H - 8, 'text-anchor': 'middle' }, String(V.anios[k]).slice(2)));
      if ((k === n - 1 || k === iMax) && v > 0) svg.appendChild(el('text', { x: x + bw / 2, y: y(v) - 6, 'text-anchor': 'middle', class: 'v' }, fmtV(v)));
    });
    if (e) {
      svg.appendChild(el('polyline', { points: e.a.map((v, k) => `${k * gw + gw / 2},${y(v)}`).join(' '), fill: 'none', stroke: '#F2EDE3', 'stroke-width': 1.8, 'stroke-dasharray': '4 3' }));
      e.a.forEach((v, k) => svg.appendChild(el('circle', { cx: k * gw + gw / 2, cy: y(v), r: 2.4, fill: '#F2EDE3' })));
    }
    const x0 = anchoA + 34, pw = 44;
    svg.appendChild(el('line', { x1: anchoA + 16, x2: anchoA + 16, y1: T, y2: H - B, stroke: '#2D3139' }));
    [[s.p25, e && e.p25, '25', '#8A8072'], [s.p26, e && e.p26, '26', '#FBBF24']].forEach(([v, ve, t, c], k) => {
      const x = x0 + k * (pw + 12);
      svg.appendChild(el('rect', { x, y: y(v), width: pw, height: Math.max(0, H - B - y(v)), fill: c }));
      svg.appendChild(el('text', { x: x + pw / 2, y: y(v) - 6, 'text-anchor': 'middle', class: 'v' }, fmtV(v)));
      svg.appendChild(el('text', { x: x + pw / 2, y: H - 8, 'text-anchor': 'middle' }, `${MES3} ${t}`));
      if (e && ve != null) svg.appendChild(el('line', { x1: x - 4, x2: x + pw + 4, y1: y(ve), y2: y(ve), stroke: '#F2EDE3', 'stroke-width': 2, 'stroke-dasharray': '4 3' }));
    });
    $('#g-anual-t').textContent = medida === 'n' ? 'Diez años · carpetas por año' : 'Diez años · tasa por 100 mil habitantes';
    $('#ley-anual').innerHTML = e ? `<span><i class="lE"></i>${R.n}, misma medida</span>` : '';
    svg.setAttribute('aria-label', `Serie anual 2015 a 2025 y enero a ${V.mes} de 2025 y 2026`);
  }
  function grafMes(D) {
    const svg = $('#g-mes'); svg.innerHTML = '';
    const W = 360, H = 230, B = 26, T = 14, L = 34, R = 8, { s } = D;
    const mx = Math.max(1e-9, ...s.m25, ...s.m26), n = V.n;
    const x = k => L + (W - L - R) * (n === 1 ? .5 : k / (n - 1)), y = v => H - B - (H - B - T) * v / mx;
    [0, .5, 1].forEach(f => {
      const v = mx * f;
      svg.appendChild(el('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: '#2D3139' }));
      svg.appendChild(el('text', { x: L - 6, y: y(v) + 3, 'text-anchor': 'end' }, fmtV(v)));
    });
    V.meses.forEach((m, k) => svg.appendChild(el('text', { x: x(k), y: H - 8, 'text-anchor': 'middle' }, m)));
    [[s.m25, '#8A8072', 1.6], [s.m26, '#FBBF24', 2.4]].forEach(([arr, c, w]) => {
      svg.appendChild(el('polyline', { points: arr.map((v, k) => `${x(k)},${y(v)}`).join(' '), fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linejoin': 'round' }));
      arr.forEach((v, k) => svg.appendChild(el('circle', { cx: x(k), cy: y(v), r: w + .6, fill: c })));
    });
    $('#g-mes-t').textContent = medida === 'n' ? '2026 mes a mes, contra 2025' : '2026 mes a mes, tasa por 100 mil';
  }
  function lugar(i) {
    const t = P.map(m => ({ c: m.id, t: tasa(a25(m, i), pop(m)) })).sort((a, b) => b.t - a.t), yo = V.ent[YO];
    return { pos: t.findIndex(x => x.c === YO) + 1, t: tasa(a25(yo, i), pop(yo)), te: tasa(a25(R, i), pop(R)) };
  }
  function marcaSel() {
    document.querySelectorAll('#A [data-i], #B [data-i], #C [data-i]').forEach(b => b.classList.toggle('sel', +b.dataset.i === actual));
    document.querySelectorAll('#rapidos button').forEach(b => b.classList.toggle('on', +b.dataset.i === actual));
  }
  function abre(i, scroll = true) {
    actual = i; fdel.value = i; marcaSel();
    const s = S(M, i), e = i === TODOS ? { c: 'x', s } : est(i);
    $('#d-fam').textContent = i === TODOS ? 'Todo el catálogo' : V.fam[i];
    $('#d-nom').innerHTML = `<span class="d-ico">${icoDelito(i)}</span>${V.largo[i]}`;
    const dif = e.c === 'nc' ? '<span class="dif igual">no comparable</span>'
      : s && Math.max(s.p25, s.p26) < 10 ? `<span class="dif igual">${s.p25} en ene-${MES3} 2025</span>`
      : s && s.p25 ? `<span class="dif ${s.p26 > s.p25 ? 'sube' : s.p26 < s.p25 ? 'baja' : 'igual'}">${pctTxt((s.p26 - s.p25) / s.p25 * 100)}</span>` : '<span class="dif igual">sin base</span>';
    $('#d-nums').innerHTML = `<div><span class="et">2025 completo</span><b>${f0.format(a25(M, i))}</b></div><div><span class="et">ene-${MES3} 2026</span><b>${f0.format(s ? s.p26 : 0)}</b>${dif}</div>`;
    const esp = V.espejo[i];
    $('#d-aviso').textContent = V.cmp[i] === 'espejo'
      ? `Este delito pasó de ${f0.format(esp[0])} a ${f0.format(esp[1])} carpetas en todo Morelos entre enero y ${V.mes}, de 2025 a 2026. Un cambio así en los 36 municipios a la vez viene de la reclasificación del RNID, no del fenómeno: no se compara contra 2025.`
      : V.cmp[i] === 'afectado'
      ? 'Este delito cambió de definición con la metodología RNID de 2026 o perdió subtipos que ahora se cuentan aparte. Las barras 2015-2025 se comparan entre sí; 2026 no se compara contra 2025.'
      : i === TODOS ? 'El total 2026 incluye el catálogo RNID completo, con subtipos nuevos: compáralo con 2025 con cautela.'
      : (s && Math.max(s.p25, s.p26) < 10 && (s.p25 || s.p26)) ? 'Pocos casos: una sola carpeta mueve mucho el porcentaje.' : '';
    const D = datos(i); grafAnual(D); grafMes(D);
    const L = lugar(i);
    $('#d-lugar').innerHTML = a25(M, i)
      ? `Tasa 2025: <b>${f1.format(L.t)}</b> por cada 100 mil habitantes, contra <b>${f1.format(L.te)}</b> de ${R.n}. Lugar <b>${L.pos} de ${NP}</b>, donde 1 es la tasa más alta.`
      : `Sin carpetas en 2025. ${R.n}: ${f1.format(L.te)} por cada 100 mil habitantes.`;
    const tl = $('#d-tema'); tl.hidden = i === TODOS; tl.href = RAIZ + 'temas/' + V.slugDel[i] + '.html';
    if (scroll) $('#explora').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  document.querySelectorAll('#senales li[data-i], .mas-sen li[data-i]').forEach(li => li.onclick = () => abre(+li.dataset.i));

  // ================= podio: dónde queda más arriba =================
  function podio() {
    const rangoPor = (i, f) => { const t = P.map(m => ({ c: m.id, t: f(m) })).sort((a, b) => b.t - a.t); return t.findIndex(x => x.c === YO) + 1; };
    let min = 5, filas = idx55.filter(i => a25(M, i) >= min);
    if (filas.length < 3) { min = 1; filas = idx55.filter(i => a25(M, i) >= 1); }
    filas = filas.map(i => {
      const L = lugar(i);
      return { i, pos: L.pos, t: L.t, te: L.te, veces: L.te ? L.t / L.te : 0, posN: rangoPor(i, m => a25(m, i)) };
    }).sort((a, b) => a.pos - b.pos || b.veces - a.veces);
    const top3 = filas.filter(f => f.pos <= 3).length, uno = filas.filter(f => f.pos === 1);
    filas = filas.slice(0, 10);
    const dondeP = TIPO === 'estado' ? 'del país' : TIPO === 'region' ? 'entre las regiones' : 'de Morelos';
    $('#frase-podio').innerHTML = uno.length
      ? `${M.n} tiene la tasa más alta ${dondeP} en <b>${uno.length === 1 ? V.del[uno[0].i].toLowerCase() : uno.length + ' delitos'}</b>${top3 > uno.length ? ` y está en el top 3 en otros ${top3 - uno.length}` : ''}.`
      : top3 ? `${M.n} está en el top 3 ${dondeP} en <b>${top3} ${top3 === 1 ? 'delito' : 'delitos'}</b>.`
      : filas.length ? `Su lugar más alto es el ${filas[0].pos}° de ${NP}, en ${V.del[filas[0].i].toLowerCase()}.` : 'Sin delitos con casos suficientes para ordenar.';
    const mxT = Math.max(...filas.slice(0, 5).map(f => Math.max(f.t, f.te))) || 1;
    const clase = f => f.pos === 1 ? 'oro' : f.pos <= 3 ? 'top' : '';
    const veces = f => f.veces ? `<span class="vx ${f.veces < 1.1 ? 'bajo' : ''}">${f1.format(f.veces)}<small>veces ${R.n}</small></span>` : '';
    $('#podio-top').innerHTML = filas.slice(0, 5).map(f => `<li class="${clase(f)}" data-i="${f.i}" tabindex="0">
      <span class="pos">${f.pos}°<small>de ${NP}</small></span>
      <b class="pn">${V.del[f.i]}</b>
      ${veces(f)}
      <span class="cmpb"><span><i style="width:${f.t / mxT * 100}%"></i><em>${f1.format(f.t)}</em></span><span class="e"><i style="width:${f.te / mxT * 100}%"></i><em>${f1.format(f.te)} ${R.n}</em></span></span>
      <span class="pc">${f.posN}° en número de carpetas</span></li>`).join('');
    $('#podio-resto').innerHTML = filas.slice(5).map(f => `<li class="${clase(f)}" data-i="${f.i}" tabindex="0">
      <span class="pos">${f.pos}°</span><span class="pn"><b>${V.del[f.i]}</b><em>${f1.format(f.t)} vs ${f1.format(f.te)}${f.veces >= 1.1 ? ` · ${f1.format(f.veces)} veces` : ''}</em></span></li>`).join('');
    if (min === 1) $('.nota-podio').textContent = 'Muy pocos casos: se ordenan todos sus delitos con al menos 1 carpeta, y una sola carpeta mueve mucho la tasa.';
    document.querySelectorAll('#podio-top li, #podio-resto li').forEach(li => {
      const go = () => { if (medida !== 't') $('#f-med button[data-m="t"]').click(); abre(+li.dataset.i); };
      li.onclick = go; li.onkeydown = e => { if (e.key === 'Enter') go(); };
    });
  }

  // ================= dónde se ubica entre sus pares =================
  const CLAVES = ['Todos los delitos', 'Homicidio doloso', 'Extorsión', 'Robo de vehículo automotor', 'Violencia familiar', 'Narcomenudeo', 'Robo a negocio'].map(s => V.largo.indexOf(s));
  $('#franjas').innerHTML = CLAVES.map(i => {
    const vals = P.map(m => ({ c: m.id, n: m.corto || m.n, t: tasa(a25(m, i), pop(m)) }));
    const mx = Math.max(...vals.map(v => v.t)) || 1, L = lugar(i);
    const puntos = vals.filter(v => v.c !== YO).map(v => `<i style="left:${v.t / mx * 100}%" title="${v.n}: ${f1.format(v.t)}"></i>`).join('');
    return `<div class="franja" data-i="${i}" tabindex="0"><span class="fn">${V.del[i]}</span>
      <div class="pista">${puntos}<i class="est" style="left:${L.te / mx * 100}%" title="${R.n}: ${f1.format(L.te)}"></i><i class="yo" style="left:${L.t / mx * 100}%" title="${M.n}: ${f1.format(L.t)}"></i></div>
      <span class="fl"><b>${f1.format(L.t)}</b> · lugar ${L.pos}</span></div>`;
  }).join('');
  document.querySelectorAll('.franja').forEach(f => {
    const go = () => { if (medida !== 't') $('#f-med button[data-m="t"]').click(); abre(+f.dataset.i); };
    f.onclick = go; f.onkeydown = e => { if (e.key === 'Enter') go(); };
  });

  // ================= hijos / vecinos =================
  // municipio → su región · región → sus municipios · estado → las 7 regiones
  const grupo = TIPO === 'muni' ? munis.filter(m => m.reg === M.reg) : M.hijos.map(id => V.ent[id]);
  grupo.sort((a, b) => a.n.localeCompare(b.n, 'es'));
  const thd = m => tasa(a25(m, HD), pop(m)), mxr = Math.max(...grupo.map(thd)) || 1;
  $('#vecinos').innerHTML = grupo.map(m => {
    const t = S(m, TODOS) || { p25: 0, p26: 0 }, v = t.p25 ? (t.p26 - t.p25) / t.p25 * 100 : 0;
    return `<a href="${url(m)}" class="${m.id === M.id ? 'yo' : ''}"><b>${m.n}</b>
      <em>${f0.format(t.p26)} carpetas ene-${MES3} · <span class="${v >= 1 ? 'sube' : v <= -1 ? 'baja' : 'igual'}">${pctTxt(v)}</span></em>
      <em>Homicidio doloso: ${f1.format(thd(m))} por 100 mil</em>
      <span class="mini"><i style="width:${thd(m) / mxr * 100}%"></i></span></a>`;
  }).join('');
  const serie = TIPO === 'muni' ? grupo : TIPO === 'region' ? P.slice().sort((a, b) => a.n.localeCompare(b.n, 'es')) : [];
  const k = serie.findIndex(m => m.id === M.id);
  if (k >= 0 && serie.length > 1) {
    const ant = serie[(k - 1 + serie.length) % serie.length], sig = serie[(k + 1) % serie.length], q = TIPO === 'muni' ? 'en la región' : 'región';
    $('#pasos').innerHTML = `<a href="${url(ant)}"><small>← Anterior ${q}</small>${ant.n}</a><a href="${url(sig)}"><small>Siguiente ${q} →</small>${sig.n}</a>`;
  }

  // ================= solo portada: mapa de los 36 como menú =================
  function mapa36() { MapaMorelos({ raiz: RAIZ, delito: HD }); }
  function temas() {
    const T = ['Homicidio doloso', 'Feminicidio', 'Extorsión', 'Narcomenudeo', 'Robo de vehículo automotor', 'Violencia familiar', 'Robo a negocio', 'Lesiones dolosas'].map(s => V.largo.indexOf(s));
    $('#temas-grid').innerHTML = T.map(i => {
      const e = est(i), s = S(M, i), L = lugar(i);
      const c = e.c === 'nc' ? '<span class="igual">no comparable</span>' : e.v != null && e.v !== 999 ? `<span class="${e.v > 0 ? 'sube' : 'baja'}">${pctTxt(e.v)}</span>` : '';
      const ed = e.c === 'nc' ? 'nc' : e.c === 'su' ? 'su' : e.c === 'ba' ? 'ba' : 'es';
      return `<a class="tema-c" href="${RAIZ}temas/${V.slugDel[i]}.html"><span class="tico ${ed}">${icoDelito(i)}</span><span class="tf">${V.fam[i]}</span><b>${V.del[i]}</b>
        <span class="tv">${f0.format(s ? s.p26 : 0)}<small>carpetas ene-${MES3} 2026 ${c}</small></span><span class="tl">${a25(V.ent.e17, i) >= 5 ? L.pos + '° de 32 estados en tasa 2025' : 'muy pocos casos para ordenar'}</span></a>`;
    }).join('');
  }

  // ================= arranque =================
  podio(); A(); B(); C();
  if (TIPO === 'estado') { mapa36(); temas(); }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(C, 150); });
  const primera = document.querySelector('#senales li[data-i]');
  abre(primera ? +primera.dataset.i : HD, false);
})();
