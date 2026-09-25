/* Mapa de los 36 municipios como menú · compartido por la portada y los Temas
   MapaMorelos({ raiz, delito, fijo }) pinta #m-svg, #m-filas, #m-cab, #m-ley y usa #m-del / #m-med si existen */
window.MapaMorelos = function (op) {
  const V = MV4, $ = s => document.querySelector(s);
  const f0 = new Intl.NumberFormat('es-MX'), f1 = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 });
  const MES3 = V.mes.slice(0, 3), iPop = a => V.popAnios.indexOf(a);
  const munis = V.pares.muni.map(id => V.ent[id]);
  const pop = m => m.pa[iPop(2025)], a25 = (m, i) => { const s = m.d[i]; return s ? s.a[s.a.length - 1] : 0; };
  const tasa = (n, p) => p ? n / p * 1e5 : 0;
  const pctTxt = v => (v > 0 ? '+' : v < 0 ? '−' : '') + f1.format(Math.abs(v)) + '%';
  const url = m => (op.raiz || '') + m.ruta;
  let mi = op.delito, mm = 't';
  const md = $('#m-del');
  if (md && !op.fijo) {
    md.innerHTML = `<option value="0">Todos los delitos</option>` + V.ordenFam.map(f => `<optgroup label="${f}">` +
      V.del.map((_, i) => i).slice(1).filter(i => V.fam[i] === f).map(i => `<option value="${i}" ${i === mi ? 'selected' : ''}>${V.largo[i]}</option>`).join('') + '</optgroup>').join('');
    md.onchange = () => { mi = +md.value; pinta(); };
  }
  const SEQ = ['#E2DD9A', '#E67E39', '#D64A3A', '#B42222'];
  const mez = (a, b, k) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  const escala = (st, t) => { t = Math.max(0, Math.min(1, t)); const n = st.length - 1, j = Math.min(n - 1, Math.floor(t * n)); return mez(st[j], st[j + 1], t * n - j); };
  const valor = m => { const s = m.d[mi]; if (mm === 't') return tasa(a25(m, mi), pop(m)); if (mm === 'n') return s ? s.p26 : 0; return s && s.p25 >= 10 ? (s.p26 - s.p25) / s.p25 * 100 : null; };
  const txtV = v => v == null ? 'menos de 10 casos' : mm === 'c' ? pctTxt(v) : mm === 't' ? f1.format(v) : f0.format(v);
  const svg = $('#m-svg'); svg.setAttribute('viewBox', `0 0 ${V.geo.w} ${V.geo.h}`);
  function pinta() {
    const vals = munis.map(valor), ok = vals.filter(v => v != null).sort((a, b) => a - b);
    const lim = Math.max(1, ...ok.map(Math.abs).filter(x => x < 400));
    const nc = mm === 'c' && (V.cmp[mi] === 'afectado' || V.cmp[mi] === 'espejo');
    const todosCero = mm !== 'c' && !ok.some(v => v > 0);
    const col = v => v == null || nc || todosCero ? '#2a2724' : mm === 'c'
      ? (v < 0 ? escala(['#3a3f48', '#4BA3A3', '#00808A'], -v / lim) : escala(['#3a3f48', '#E67E39', '#B42222'], v / lim))
      : (v === 0 ? '#2a2724' : escala(SEQ, ok.filter(x => x <= v).length / ok.length));
    svg.innerHTML = munis.map((m, j) => `<a href="${url(m)}" aria-label="${m.n}"><path d="${m.p}" data-id="${m.id}" style="fill:${col(vals[j])}"/></a>`).join('');
    $('#m-ley').innerHTML = nc ? 'Este delito no se compara con 2025 por el cambio de metodología.'
      : mm === 'c' ? '<span>baja</span><i style="background:linear-gradient(90deg,#00808A,#4BA3A3,#3a3f48,#E67E39,#B42222)"></i><span>sube</span><span class="gris">gris: menos de 10 casos</span>'
      : `<span>menor</span><i style="background:linear-gradient(90deg,${SEQ.join(',')})"></i><span>mayor</span><span class="gris">gris: sin casos</span>`;
    const orden = munis.map((m, j) => ({ m, v: vals[j] })).sort((a, b) => (b.v ?? -1e9) - (a.v ?? -1e9));
    const mx = Math.max(1, ...orden.map(o => Math.abs(o.v || 0)).filter(x => x < 400));
    $('#m-cab').innerHTML = `<b>${V.del[mi]}</b><span>${mm === 't' ? 'tasa 2025 por 100 mil' : mm === 'n' ? `carpetas ene-${MES3} 2026` : `cambio ene-${MES3} 2026 vs 2025`}</span>`;
    $('#m-filas').innerHTML = orden.map((o, j) => `<a href="${url(o.m)}" data-id="${o.m.id}"><span class="p">${o.v == null || nc ? '·' : j + 1}</span><span class="n">${o.m.n}</span>
      <span class="b"><i style="width:${o.v == null || nc ? 0 : Math.min(100, Math.abs(o.v) / mx * 100)}%;background:${col(o.v)}"></i></span><span class="v">${nc ? 'n/c' : txtV(o.v)}</span></a>`).join('');
    const tip = $('#m-tip'), caja = svg.parentElement;
    const marca = id => { svg.querySelectorAll('path').forEach(p => p.classList.toggle('hl', p.dataset.id === id)); document.querySelectorAll('#m-filas a').forEach(a => a.classList.toggle('hl', a.dataset.id === id)); };
    svg.querySelectorAll('path').forEach(p => {
      const m = V.ent[p.dataset.id], v = valor(m);
      p.onmousemove = ev => { const b = caja.getBoundingClientRect(); tip.innerHTML = `<b>${m.n}</b><span>Región ${m.reg}</span><span>${nc ? 'no comparable' : txtV(v)}</span>`; let x = ev.clientX - b.left + 14, y = ev.clientY - b.top + 14; if (x + 200 > b.width) x -= 220; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.style.opacity = 1; marca(m.id); };
      p.onmouseleave = () => { tip.style.opacity = 0; marca(null); };
    });
    document.querySelectorAll('#m-filas a').forEach(a => { a.onmouseenter = () => marca(a.dataset.id); a.onmouseleave = () => marca(null); });
  }
  document.querySelectorAll('#m-med button').forEach(b => b.onclick = () => { mm = b.dataset.m; document.querySelectorAll('#m-med button').forEach(x => x.classList.toggle('on', x === b)); pinta(); });
  pinta();
};
