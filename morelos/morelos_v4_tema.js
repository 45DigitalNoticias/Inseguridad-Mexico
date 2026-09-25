/* Página de un delito (Temas) · la misma para los 55 */
(function () {
  const V = MV4, $ = s => document.querySelector(s), NS = 'http://www.w3.org/2000/svg';
  const i = +document.body.dataset.i;
  const f0 = new Intl.NumberFormat('es-MX'), f1 = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 });
  const MES3 = V.mes.slice(0, 3), iPop = a => V.popAnios.indexOf(a);
  const munis = V.pares.muni.map(id => V.ent[id]), regs = V.pares.region.map(id => V.ent[id]), estados = V.pares.estado.map(id => V.ent[id]);
  const MOR = V.ent.mor, MEX = V.ent.mex;
  const pop = m => m.pop != null ? m.pop : m.pa[iPop(2025)];
  const a25 = (m, k = i) => m.a25 ? m.a25[k] : (m.d[k] ? m.d[k].a[m.d[k].a.length - 1] : 0);
  const tasa = (n, p) => p ? n / p * 1e5 : 0;
  const pctTxt = v => (v > 0 ? '+' : v < 0 ? '−' : '') + f1.format(Math.abs(v)) + '%';
  const nc = V.cmp[i] === 'afectado' || V.cmp[i] === 'espejo';
  const S = MOR.d[i] || { a: V.anios.map(() => 0), p25: 0, p26: 0 };

  // selector de delito
  const sel = $('#cambiar');
  sel.innerHTML = V.ordenFam.map(f => `<optgroup label="${f}">` + V.del.map((_, k) => k).slice(1).filter(k => V.fam[k] === f)
    .map(k => `<option value="${V.slugDel[k]}.html" ${k === i ? 'selected' : ''}>${V.del[k]}</option>`).join('') + '</optgroup>').join('');
  sel.onchange = () => location.href = sel.value;

  // ícono del delito, con el color de su tendencia
  const edoT = nc ? 'nc' : Math.max(S.p25, S.p26) < 10 || !S.p25 ? 'es' : (S.p26 - S.p25) / S.p25 >= .05 ? 'su' : (S.p26 - S.p25) / S.p25 <= -.05 ? 'ba' : 'es';
  $('#t-ico').className = 'tema-ico ' + edoT; $('#t-ico').innerHTML = icoDelito(i);

  // cifras
  const lugarNac = [...estados].sort((a, b) => tasa(a25(b), pop(b)) - tasa(a25(a), pop(a))).findIndex(e => e.id === 'e17') + 1;
  const tMor = tasa(a25(V.ent.e17), pop(V.ent.e17)), tMex = tasa(a25(MEX), MEX.pa[iPop(2025)]);
  const topM = [...munis].sort((a, b) => tasa(a25(b), pop(b)) - tasa(a25(a), pop(a)))[0];
  const cambio = nc ? '<span class="dif igual">no comparable con 2025</span>'
    : Math.max(S.p25, S.p26) < 10 ? `<span class="dif igual">${S.p25} en ene-${MES3} 2025 · pocos casos</span>`
    : S.p25 ? `<span class="dif ${S.p26 > S.p25 ? 'sube' : 'baja'}">${pctTxt((S.p26 - S.p25) / S.p25 * 100)} vs ene-${MES3} 2025</span>` : '';
  $('#t-cifras').innerHTML = `
    <div><span class="et">Carpetas en Morelos, ene-${MES3} 2026</span><span class="val">${f0.format(S.p26)}</span>${cambio}</div>
    <div><span class="et">Tasa 2025, Morelos</span><span class="val">${f1.format(tMor)}</span><span class="dif igual">por 100 mil · México ${f1.format(tMex)}${tMex ? ` · ${f1.format(tMor / tMex)} veces` : ''}</span></div>
    <div><span class="et">Lugar de Morelos en el país</span><span class="val">${a25(V.ent.e17) >= 5 ? lugarNac + '°' : 'n/d'}</span><span class="dif igual">${a25(V.ent.e17) >= 5 ? 'de 32 estados, por tasa 2025' : 'menos de 5 carpetas en 2025: no se ordena'}</span></div>
    <div><span class="et">Tasa más alta en Morelos</span><span class="val val-n">${a25(topM) ? topM.n : 'sin casos'}</span><span class="dif igual">${a25(topM) ? f1.format(tasa(a25(topM), pop(topM))) + ' por 100 mil en 2025' : ''}</span></div>`;
  const esp = V.espejo[i];
  $('#t-aviso').textContent = V.cmp[i] === 'espejo'
    ? `En todo Morelos pasó de ${f0.format(esp[0])} a ${f0.format(esp[1])} carpetas entre enero y ${V.mes}, de 2025 a 2026. Un cambio así en los 36 municipios a la vez viene de la reclasificación del RNID: 2026 no se compara contra 2025.`
    : V.cmp[i] === 'afectado' ? 'Este delito cambió de definición con la metodología RNID de 2026: la serie 2015-2025 se compara entre sí, pero 2026 no se compara contra 2025.' : '';

  // podio de municipios: los 5 con la tasa más alta
  const top5 = [...munis].map(m => ({ m, t: tasa(a25(m), pop(m)), n: a25(m) })).filter(x => x.n > 0).sort((a, b) => b.t - a.t).slice(0, 5);
  $('#t-podio').innerHTML = top5.length ? `<h3>Las cinco tasas más altas de Morelos</h3><ol class="p-top">` + top5.map((x, k) =>
    `<li class="${k === 0 ? 'oro' : k < 3 ? 'top' : ''}" onclick="location.href='../${x.m.ruta}'"><span class="pos">${k + 1}°<small>de 36</small></span><b class="pn">${x.m.n}</b>
     <span class="vx">${f1.format(x.t)}<small>por 100 mil · ${f0.format(x.n)} carpetas</small></span>
     <span class="pc">${tMor ? f1.format(x.t / tMor) + ' veces Morelos' : ''}</span></li>`).join('') + '</ol>' : '';

  // mapa (compartido)
  MapaMorelos({ raiz: '../', delito: i, fijo: true });

  // tendencia Morelos vs México, en tasa
  (function () {
    const svg = $('#t-graf'), W = 900, H = 260, B = 28, T = 22, L = 10;
    const mor = MOR.d[i] ? MOR.d[i].a.map((v, k) => tasa(v, MOR.pa[iPop(V.anios[k])])) : V.anios.map(() => 0);
    const mex = MEX.d[i] ? MEX.d[i].a.map((v, k) => tasa(v, MEX.pa[iPop(V.anios[k])])) : V.anios.map(() => 0);
    const mx = Math.max(1e-9, ...mor, ...mex), n = mor.length, gw = (W - L) / n, bw = gw * .6;
    const y = v => H - B - (H - B - T) * v / mx;
    const el = (t, a, x) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (x != null) e.textContent = x; svg.appendChild(e); };
    mor.forEach((v, k) => { const x = L + k * gw + (gw - bw) / 2; el('rect', { x, y: y(v), width: bw, height: Math.max(0, H - B - y(v)), fill: k === n - 1 ? '#FBBF24' : '#4a4f58' });
      el('text', { x: x + bw / 2, y: H - 9, 'text-anchor': 'middle' }, V.anios[k]); el('text', { x: x + bw / 2, y: y(v) - 6, 'text-anchor': 'middle', class: 'v' }, f1.format(v)); });
    el('polyline', { points: mex.map((v, k) => `${L + k * gw + gw / 2},${y(v)}`).join(' '), fill: 'none', stroke: '#F2EDE3', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    mex.forEach((v, k) => el('circle', { cx: L + k * gw + gw / 2, cy: y(v), r: 3, fill: '#F2EDE3' }));
    svg.setAttribute('aria-label', 'Tasa anual 2015 a 2025, Morelos contra México');
  })();

  // quién se movió
  (function () {
    if (nc) { $('#t-mov-c').innerHTML = '<p class="frase">No se calcula: este delito no se compara con 2025 por el cambio de metodología.</p>'; return; }
    const r = munis.map(m => ({ m, d: m.d[i] ? m.d[i].p26 - m.d[i].p25 : 0 })).filter(x => x.d).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 10);
    if (!r.length) { $('#t-mov-c').innerHTML = '<p class="frase">Ningún municipio cambió entre 2025 y 2026.</p>'; return; }
    const mx = Math.max(...r.map(x => Math.abs(x.d)));
    $('#t-mov-c').innerHTML = `<div class="bars"><div class="ejes"><span>Bajan</span><span>Suben</span></div>` + r.map(({ m, d }) => {
      const w = (Math.abs(d) / mx * 55).toFixed(1) + '%';
      return d < 0
        ? `<a class="bar" href="../${m.ruta}"><div class="izq" style="--w:${w}"><span class="et2">${m.n}<span class="n">−${f0.format(-d)}</span></span><i style="width:${w}"></i></div><div class="der"></div></a>`
        : `<a class="bar" href="../${m.ruta}"><div class="izq"></div><div class="der" style="--w:${w}"><i style="width:${w}"></i><span class="et2"><span class="n">+${f0.format(d)}</span>${m.n}</span></div></a>`;
    }).join('') + '</div>';
  })();

  // por región
  const tr = regs.map(r => ({ r, t: tasa(a25(r), pop(r)) })).sort((a, b) => b.t - a.t), mxr = Math.max(1e-9, ...tr.map(x => x.t));
  $('#t-regs').innerHTML = tr.map(({ r, t }) => `<a href="../${r.ruta}"><span class="n">${r.corto}</span><span class="b"><i style="width:${t / mxr * 100}%"></i></span><span class="v">${f1.format(t)}</span></a>`).join('') +
    `<p class="conteo">Morelos: ${f1.format(tMor)} por 100 mil.</p>`;

  // otros de la familia
  $('#t-fam').innerHTML = V.del.map((_, k) => k).slice(1).filter(k => V.fam[k] === V.fam[i] && k !== i).map(k => {
    const s = MOR.d[k];
    return `<a class="tema-c" href="${V.slugDel[k]}.html"><span class="tico">${icoDelito(k)}</span><b>${V.del[k]}</b><span class="tv">${f0.format(s ? s.p26 : 0)}<small>carpetas ene-${MES3} 2026</small></span></a>`;
  }).join('') || '<p class="ayuda">Es el único delito de su familia.</p>';
})();
