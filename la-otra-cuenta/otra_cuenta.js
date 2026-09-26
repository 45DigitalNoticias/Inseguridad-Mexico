/* La otra cuenta · renderizador de la ficha de un estado.
   Datos: ENVIPE (envipe_datos.js), geometría (envipe_mapa.js) e íconos (envipe_iconos.js), generados por
   _REDISENO/ENVIPE/_construir_envipe.py. La página define EDO (clave del estado; 17 = Morelos).
   Todo texto se arma con reglas sobre los números del estado: ninguna frase fija de un estado se aplica a otro. */
(() => {
  const D = ENVIPE, E = D.estados[EDO], N = D.estados[0], ED = D.edicion, AD = D.periodo_delitos;
  const NAC = EDO === 0;   /* la portada: el país. Ahí no se compara "contra el país": se compara el estado más alto con el más bajo */
  const $ = id => document.getElementById(id);
  const f1 = v => (Math.round(v * 10) / 10).toFixed(1);
  const f0 = v => Math.round(v).toLocaleString("es-MX");
  /* dinero: una sola unidad por tarjeta, la del total (mil millones en el país, millones en los estados) */
  let UNI = 1e6;
  const mill = v => "$" + (UNI === 1e9 ? (v / 1e9).toFixed(1) : Math.round(v / 1e6).toLocaleString("es-MX"));
  const svg = n => `<svg viewBox="0 0 24 24">${ICONOS[n] || ""}</svg>`;
  const ic = n => `<i class="ic">${svg(n)}</i>`;
  const norm = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const busca = (obj, pre) => { const k = Object.keys(obj).find(x => norm(x).startsWith(norm(pre))); return k ? obj[k] : null; };
  const ESTADOS = D.estados.slice(1);
  const PAL = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];
  const cap = t => t[0].toUpperCase() + t.slice(1);
  const primero = ind => [...ESTADOS].sort((a, b) => b[ind] - a[ind]);

  /* ------------------------------------------------ portada */
  $("rejilla-pie").innerHTML = `<span><b>${Math.round(100 - E.cifra)} de cada 100</b> delitos de ${AD} llegaron a una carpeta</span><span>${Math.round(E.cifra)} nadie los contó</span>`;
  const rj = $("rejilla"), prendidos = Math.round(100 - E.cifra);
  for (let i = 0; i < 100; i++) rj.appendChild(document.createElement("i"));
  setTimeout(() => [...rj.children].slice(100 - prendidos).forEach((c, k) => setTimeout(() => c.classList.add("c"), k * 180)), 600);
  const selE = $("cambiar");
  selE.innerHTML = `<option value="index"${NAC ? " selected" : ""}>México · todo el país</option>` + ESTADOS.map(x => `<option value="${x.slug}"${x.clave === EDO ? " selected" : ""}>${x.corto}</option>`).join("");
  selE.onchange = () => location.href = selE.value + ".html";
  document.querySelectorAll(".solo-nac").forEach(el => { if (!NAC) el.remove(); });

  /* elige tu estado (solo portada nacional) */
  if (NAC) {
    const orden = primero("miedo"), mor = ESTADOS[16];
    $("est-sub").textContent = `De ${orden[0].corto}, con ${f1(orden[0].miedo)}%, a ${orden.at(-1).corto}, con ${f1(orden.at(-1).miedo)}%. Cada estado tiene su ficha con las mismas seis preguntas.`;
    /* podio por tamaño: 1.º el más grande, 2.º un poco menor, 3.º menor que el 2.º; del 4.º en adelante, todos iguales */
    const tarjeta = (x, i) => `<a class="est ${i < 3 ? "p" + (i + 1) : ""} ${x === mor ? "nuestro" : ""}" href="${x.slug}.html"><span class="n">${x.lugar.miedo}</span><b>${x.corto}</b><span class="m">${f1(x.miedo)}%</span><span class="barra-est"><i style="width:${x.miedo}%"></i></span><span class="c">${f1(x.cifra)}% sin carpeta</span></a>`;
    $("est-grid").innerHTML = orden.map(tarjeta).join("");
  }

  /* ------------------------------------------------ lo esencial */
  const L = E.lugar;
  $("t-miedo").innerHTML = `${f1(E.miedo)}%`;
  $("t-miedo-pie").textContent = NAC ? `Adultos que se sienten inseguros en su estado · promedio del país · cuadro ${D.cuadros.miedo}` : `Percepción en el estado · el país, ${f1(N.miedo)}% · cuadro ${D.cuadros.miedo}`;
  const top3 = primero("miedo").slice(0, 3);
  if (NAC) {
    const ult = primero("miedo").at(-1), mor = ESTADOS[16];
    $("t-lugar-et").textContent = "Los estados con más miedo";
    $("t-lugar").innerHTML = `${f1(top3[0].miedo - ult.miedo)}<span class="de32 bloque">puntos entre el estado con más miedo y el de menos</span>`;
    $("t-podio").innerHTML = top3.map((x, i) => `<li class="${x.clave === 17 ? "yo" : ""}"><i>${i + 1}</i><span>${x.corto}</span><b>${f1(x.miedo)}%</b></li>`).join("")
      + (mor.lugar.miedo > 3 ? `<li class="yo"><i>${mor.lugar.miedo}</i><span>Morelos</span><b>${f1(mor.miedo)}%</b></li>` : "")
      + `<li><i>32</i><span>${ult.corto}</span><b>${f1(ult.miedo)}%</b></li>`;
  } else {
    $("t-lugar").innerHTML = `${L.miedo}<small>.º</small> <span class="de32">de 32</span>`;
    $("t-podio").innerHTML = top3.map((x, i) => `<li class="${x.clave === EDO ? "yo" : ""}"><i>${i + 1}</i><span>${x.corto}</span><b>${f1(x.miedo)}%</b></li>`).join("")
      + (L.miedo > 3 ? `<li class="yo"><i>${L.miedo}</i><span>${E.corto}</span><b>${f1(E.miedo)}%</b></li>` : "");
  }
  $("t-cifra").textContent = `${f1(E.cifra)}%`;
  const oc = primero("cifra");
  if (NAC) $("t-cifra-cmp").innerHTML = [[oc[0].corto, oc[0].cifra, "var(--red)"], ["País", N.cifra, "var(--amb)"], [oc.at(-1).corto, oc.at(-1).cifra, "var(--mut2)"]]
    .map(([t, v, c]) => `<div><span>${t.length > 9 ? t.slice(0, 8) + "." : t}</span><u><i style="width:${v}%;background:${c}"></i></u><b>${f1(v)}%</b></div>`).join("");
  else $("t-cifra-cmp").innerHTML = `<div><span>${E.corto.length > 9 ? "Estado" : E.corto}</span><u><i style="width:${E.cifra}%;background:var(--amb)"></i></u><b>${f1(E.cifra)}%</b></div><div><span>País</span><u><i style="width:${N.cifra}%;background:var(--mut2)"></i></u><b>${f1(N.cifra)}%</b></div>`;
  $("t-cifra-pie").textContent = `Cifra oculta de ${AD} · cuadro ${D.cuadros.cifra}`;
  const cambio = (E.inc / E.inc_ant - 1) * 100, cambioN = (N.inc / N.inc_ant - 1) * 100;
  $("t-inc").innerHTML = `<span class="${cambio <= 0 ? "grad-cool" : "grad"}">${cambio > 0 ? "+" : "−"}${f1(Math.abs(cambio))}%</span>`;
  const mx = Math.max(E.inc, E.inc_ant);
  $("t-inc-cmp").innerHTML = `<div><span>${AD - 1}</span><u><i style="width:${E.inc_ant / mx * 100}%;background:var(--line2)"></i></u><b>${f0(E.inc_ant)}</b></div><div><span>${AD}</span><u><i style="width:${E.inc / mx * 100}%;background:${cambio <= 0 ? "var(--teal)" : "var(--red)"}"></i></u><b>${f0(E.inc)}</b></div>`;
  const bajaron = ESTADOS.filter(x => x.inc < x.inc_ant).length;
  $("t-inc-pie").textContent = NAC ? `Bajaron en ${bajaron} de 32 estados · cuadro ${D.cuadros.inc}` : `El país: ${cambioN > 0 ? "+" : "−"}${f1(Math.abs(cambioN))}% · cuadro ${D.cuadros.inc}`;
  const C = E.costo;
  UNI = C.total >= 1e11 ? 1e9 : 1e6;
  $("t-costo").innerHTML = `${mill(C.total)}<small class="uni">${UNI === 1e9 ? "mil millones de pesos" : "millones de pesos"}</small>`;
  const pc = x => x / (C.perdidas + C.proteccion + C.danos) * 100;
  $("t-reparto").innerHTML = `<div style="width:${pc(C.perdidas)}%;background:var(--red)"></div><div style="width:${pc(C.proteccion)}%;background:var(--amb)"></div><div style="width:${pc(C.danos)}%;background:var(--mut2)"></div>`;
  $("t-ley").innerHTML = `<span><span><i style="background:var(--red)"></i>Pérdidas de las víctimas</span><b>${mill(C.perdidas)}</b></span><span><span><i style="background:var(--amb)"></i>Gasto en protegerse</span><b>${mill(C.proteccion)}</b></span><span><span><i style="background:var(--mut2)"></i>Gastos por daños a la salud</span><b>${mill(C.danos)}</b></span>`;
  $("t-costo-pie").textContent = `$${f0(C.promedio)} por persona afectada · cuadro ${D.cuadros.costo}`;
  $("dos-sub").textContent = `Lo que llegó a una fiscalía, contra lo que la encuesta estima que pasó en ${NAC ? "el país" : E.corto} en ${AD}.`;
  $("dos-barras").innerHTML = `<div class="bd"><div class="q">Carpetas del SESNSP<b>${f0(E.carpetas)}</b></div><div class="pista"><div class="relleno" style="width:${Math.max(1.5, E.carpetas / E.delitos * 100)}%"></div></div></div>
    <div class="bd envipe"><div class="q">Delitos según la ENVIPE<b>${f0(E.delitos)}</b></div><div class="pista"><div class="relleno" style="width:100%"></div></div></div>`;
  $("dos-cav").textContent = `No son el mismo universo: una carpeta puede reunir varios delitos, la encuesta solo pregunta a mayores de 18 y no mide homicidios. La medida limpia es la cifra oculta del propio INEGI, ${f1(E.cifra)}%. Las barras enseñan el orden de magnitud, no una resta.`;

  /* mini serie */
  const serie = (el, W, H, pad, grande) => {
    const A = Object.keys(E.serie).map(Number), x0 = pad, x1 = W - (grande ? 80 : pad), y0 = grande ? 16 : 10, y1 = H - (grande ? 34 : 22), lo = 0 + 50, hi = 100;
    const x = a => x0 + (a - A[0]) / (A.at(-1) - A[0]) * (x1 - x0), y = v => y1 - (Math.max(v, lo) - lo) / (hi - lo) * (y1 - y0);
    const pm = A.map(a => [x(a), y(E.serie[a])]), pn = A.filter(a => N.serie[a] != null).map(a => [x(a), y(N.serie[a])]);
    let g = `<defs><linearGradient id="gw${W}" x1="0" x2="1"><stop offset="0" stop-color="#FBBF24"/><stop offset="1" stop-color="#D64A3A"/></linearGradient>
      <linearGradient id="ga${W}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="rgba(251,191,36,.22)"/><stop offset="1" stop-color="rgba(251,191,36,0)"/></linearGradient></defs>`;
    (grande ? [50, 60, 70, 80, 90, 100] : [80, 100]).forEach(v => g += `<line x1="${x0}" x2="${x1}" y1="${y(v)}" y2="${y(v)}" stroke="#2D3139" stroke-dasharray="${v === 80 ? "0" : "3 5"}"/>` + (grande ? `<text x="${x0 - 10}" y="${y(v) + 4}" text-anchor="end">${v}%</text>` : v === 100 ? `<text x="${x1}" y="${y(v) - 3}" text-anchor="end">100%</text>` : ""));
    if (grande) { A.forEach(a => { if ((a - A[0]) % 3 === 1 || a === A.at(-1)) g += `<text x="${x(a)}" y="${H - 8}" text-anchor="middle">${a}</text>`; });
      g += `<path d="M${pm.map(p => p.join(",")).join(" L")} L${pm.at(-1)[0]},${y1} L${pm[0][0]},${y1} Z" fill="url(#ga${W})"/>`; }
    else g += `<text x="${x0}" y="${H - 4}">${A[0]}</text><text x="${x1}" y="${H - 4}" text-anchor="end">${A.at(-1)}</text>`;
    if (!NAC) g += `<path d="M${pn.map(p => p.join(",")).join(" L")}" fill="none" stroke="#8A8072" stroke-width="${grande ? 2.5 : 2}"/>`;
    g += `<path d="M${pm.map(p => p.join(",")).join(" L")}" fill="none" stroke="url(#gw${W})" stroke-width="${grande ? 4 : 3.5}" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += `<circle cx="${pm.at(-1)[0]}" cy="${pm.at(-1)[1]}" r="${grande ? 6 : 4.5}" fill="#D64A3A"/>`;
    if (grande) g += `<text x="${x1 + 12}" y="${pm.at(-1)[1] + 4}" fill="#FBBF24" style="font-weight:700">${NAC ? "País" : E.corto.length > 10 ? "Estado" : E.corto}</text>` + (NAC ? "" : `<text x="${x1 + 12}" y="${pn.at(-1)[1] + 4}">País</text>`);
    el.innerHTML = g;
  };
  serie($("mini-serie"), 300, 130, 6, false);

  /* ------------------------------------------------ 1 · el miedo */
  const anios = Object.keys(E.serie).map(Number), minS = Math.min(...Object.values(E.serie)), antes = E.serie[ED - 1];
  const sobre80 = minS >= 80;
  $("p1-tit").textContent = NAC ? `${cap(PAL[Math.round(E.miedo / 10)])} de cada diez tienen miedo.` : sobre80 ? "El miedo que no se mueve." : L.miedo <= 5 ? "Entre los estados con más miedo." : E.miedo > N.miedo ? "Más miedo que el país." : "Menos miedo que el país.";
  $("p1-sub").textContent = NAC ? `${f1(E.miedo)}% de los adultos considera inseguro vivir en su estado. Un año antes, ${f1(antes)}%.`
    : `${f1(E.miedo)}% considera inseguro vivir en ${E.corto}. Un año antes, ${f1(antes)}%.` + (sobre80 ? ` Desde ${anios[0]}, nunca ha bajado de 80%.` : "");
  $("p1-preg").textContent = NAC ? "En términos de delincuencia, ¿vivir en tu estado es…?" : `En términos de delincuencia, ¿vivir en ${E.corto} es…?`;
  const lider = primero("miedo")[0];
  $("p1-resp").innerHTML = NAC ? `<div class="grande grad">${f1(E.miedo)}%</div><p>de los adultos del país contestó <b>inseguro</b>. El estado con más miedo es ${lider.corto}, con ${f1(lider.miedo)}%.</p><p class="tu"></p>`
    : `<div class="grande grad">${f1(E.miedo)}%</div><p>de los adultos de ${E.corto} contestó <b>inseguro</b>. ${L.miedo === 1 ? "Ningún estado tiene más miedo." : L.miedo === 2 ? `Solo ${lider.corto} está peor.` : `Es el lugar ${L.miedo} de 32.`}</p><p class="tu"></p>`;
  $("ceb-nota").textContent = `Pero ni en casa desaparece. % que se siente inseguro en cada lugar.`;
  const CEB = [["en el estado", E.miedo, "#FBBF24", "map"], ["en su municipio", E.municipio, "#E67E39", "building-2"], ["en su colonia", E.colonia, "#D64A3A", "signpost"], ["en su casa", E.casa, "#8a2a20", "house"]];
  const ceb = $("cebolla");
  ceb.innerHTML = CEB.map(([t, v, c, i], k) => `<div class="capa ${k === 3 ? "ult" : ""}" style="width:${100 - k * 24}%;height:${100 - k * 24}%;background:${c};transition-delay:${k * .18}s"><div class="rot"><div class="fila">${ic(i)}<b>${f1(v)}%</b></div><span>${t}</span></div></div>`).join("");
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { ceb.classList.add("ver"); o.disconnect(); } }), {threshold: .3}).observe(ceb);
  $("linea-tit").innerHTML = `${ic("shield-alert")}${sobre80 ? `${anios.length} años arriba de 80%, a un paso del techo` : `${anios.length} años de encuesta`}`;
  $("linea-nota").textContent = NAC ? `Adultos que consideran inseguro vivir en su estado, promedio del país, ${anios[0]} a ${ED}.` : `Percepción de inseguridad en la entidad, ${anios[0]} a ${ED}. ${E.corto} contra el país.`;
  serie($("linea"), 1000, 320, 48, true);

  /* ------------------------------------------------ 2 · los lugares */
  const LUG = [["El cajero", "El cajero en la calle", "credit-card"], ["El banco", "El banco", "landmark"], ["El transporte", "El transporte público", "bus"], ["La calle", "La calle", "footprints"],
    ["La carretera", "La carretera", "route"], ["El mercado", "El mercado", "store"], ["El parque", "El parque", "trees"], ["El centro comercial", "El centro comercial", "shopping-bag"],
    ["La escuela", "La escuela", "school"], ["El autom", "El automóvil", "car"], ["Su trabajo", "Su trabajo", "briefcase"], ["Su casa", "Su casa", "house"]]
    .map(([k, t, i]) => ({t, i, m: busca(E.lugares, k), p: busca(N.lugares, k)})).filter(x => x.m != null).sort((a, b) => b.m - a.m);
  const masT = LUG[0], arriba = LUG.filter(x => x.m > x.p).length;
  $("p2-sub").textContent = NAC ? `En el país, el lugar más temido es ${masT.t.toLowerCase()}: ${f1(masT.m)}% se siente inseguro ahí.` : arriba === LUG.length ? `En cada uno de los ${LUG.length} lugares, ${E.corto} siente más inseguridad que el país.` : arriba === 0 ? `En ninguno de los ${LUG.length} lugares ${E.corto} siente más inseguridad que el país.` : `En ${arriba} de los ${LUG.length} lugares, ${E.corto} siente más inseguridad que el país.`;
  $("p2-preg").textContent = NAC ? "¿Dónde crees que la gente se siente más insegura?" : `¿Dónde crees que ${E.corto} se siente más inseguro?`;
  const opc2 = [LUG.find(x => x.t === "La calle"), LUG.find(x => x.t === "El transporte público"), masT].filter((x, i, a) => x && a.indexOf(x) === i);
  if (opc2.length < 3) opc2.push(LUG.find(x => !opc2.includes(x)));
  $("p2-opc").innerHTML = opc2.map(x => `<button>${ic(x.i)}${x.t}</button>`).join("");
  $("p2-resp").innerHTML = `<div class="grande grad">${f1(masT.m)}%</div><p>se siente inseguro en <b>${masT.t.toLowerCase()}</b>, el lugar más temido ${NAC ? "del país" : "en " + E.corto + ". En el país, " + f1(masT.p) + "%"}.</p><p class="tu"></p>`;
  $("espacios").innerHTML = LUG.map(x => `<div class="pt"><span class="n">${ic(x.i)}${x.t}</span><div class="riel">${NAC ? `<div class="tramo" style="left:0;width:${x.m}%"></div>` : `<div class="tramo" style="left:${Math.min(x.p, x.m)}%;width:${Math.abs(x.m - x.p)}%"></div><i class="p" style="left:${x.p}%"></i>`}<i class="m" style="left:${x.m}%"></i></div><span class="v">${f1(x.m)}%</span></div>`).join("");
  if (NAC) $("ley-lugares").innerHTML = `<span><i style="background:var(--amb)"></i>% del país que se siente inseguro en cada lugar</span>`;

  /* ------------------------------------------------ 3 · la vida diaria */
  const DJ = [["Permitir que", "Dejar que los niños salgan solos", "baby", "de quienes viven con menores"], ["Salir de noche", "Salir de noche", "moon"], ["Usar joyas", "Usar joyas", "gem"],
    ["Llevar dinero", "Llevar efectivo", "banknote"], ["Llegar muy tarde", "Llegar tarde o dejar la casa sola", "clock"], ["Visitar parientes", "Visitar parientes o amigos", "users"],
    ["Salir a caminar", "Salir a caminar", "footprints"], ["Tomar taxi", "Tomar taxi", "car-taxi-front"], ["Salir a comer", "Salir a comer o cenar", "utensils"], ["Ir al cine", "Ir al cine o al teatro", "clapperboard"],
    ["Llevar tarjeta", "Llevar tarjeta", "credit-card"], ["Ir al estadio", "Ir al estadio", "trophy"], ["Viajar por carretera", "Viajar por carretera", "route"], ["Usar transporte", "Usar transporte público", "bus"],
    ["Frecuentar centros", "Ir a centros comerciales", "shopping-bag"], ["Llevar tel", "Llevar celular", "smartphone"], ["Ir a la escuela", "Ir a la escuela", "graduation-cap"]]
    .map(([k, t, i, nota]) => ({t, i, nota, m: busca(E.dejo, k), p: busca(N.dejo, k)})).filter(x => x.m != null).sort((a, b) => b.m - a.m).slice(0, 9);
  $("dejo").innerHTML = DJ.map((x, i) => `<div class="dj ${i === 0 ? "gigante" : ""}"><i class="ic top">${svg(x.i)}</i><div class="v ${i === 0 ? "grad" : ""}">${f1(x.m)}%</div><div class="n">${x.t}</div><div class="p">${NAC ? (x.nota || "de los adultos del país") : (x.nota ? x.nota + " · " : "") + "país " + f1(x.p) + "%"}</div><div class="b"><i style="width:${x.m}%"></i>${NAC ? "" : `<u style="left:${x.p}%"></u>`}</div></div>`).join("");
  if (NAC) $("dejo-fuente").textContent = `Fuente: INEGI, ENVIPE ${ED}, cuadro 5.32 · % de los adultos que dejó de hacerlo por miedo`;
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.querySelectorAll(".b i").forEach((b, k) => setTimeout(() => b.style.transform = "scaleX(1)", k * 90)); o.disconnect(); } }), {threshold: .25}).observe($("dejo"));

  /* ------------------------------------------------ 4 · el silencio */
  const R = E.razones, RN = N.razones;
  const RA = [["Por pérdida", "Pérdida de tiempo", "hourglass"], ["Por desconfianza", "Desconfianza en la autoridad", "user-x"], ["Por trámites", "Trámites largos y difíciles", "file-stack"], ["Por actitud", "Actitud hostil de la autoridad", "angry"], ["Por miedo a que", "Miedo a que lo extorsionaran", "hand-coins"]];
  const RO = [["Por ser delito", "Delito de poca importancia", "minimize-2"], ["Otra", "Otra", "ellipsis"], ["Por no tener", "No tenía pruebas", "search-x"], ["Por miedo al", "Miedo al agresor", "triangle-alert"]];
  const aut = busca(R, "Por causas atribuibles"), otr = busca(R, "Por otras causas");
  const mxR = Math.max(...[...RA, ...RO].map(([k]) => Math.max(busca(R, k) || 0, busca(RN, k) || 0))) * 1.08;
  const bloque = (t, tot, arr, cls) => `<div class="vis ${cls}"><h3>${t}<b class="${cls ? "" : "grad"}">${f1(tot)}%</b></h3>` + arr.map(([k, n, i]) => {
    const m = busca(R, k) || 0, p = busca(RN, k) || 0;
    return `<div class="rz"><span>${ic(i)}${n}</span><div class="b"><i style="width:${m / mxR * 100}%"></i>${NAC ? "" : `<u style="left:${p / mxR * 100}%"></u>`}</div><em>${f1(m)}%</em></div>`;
  }).join("") + `</div>`;
  $("razones").innerHTML = bloque("Por la autoridad", aut, RA, "") + bloque("Por otras causas", otr, RO, "otros");
  const desc = busca(R, "Por desconfianza"), descN = busca(RN, "Por desconfianza");
  $("p4-sub").textContent = `En ${NAC ? "el país" : E.corto}, ${f1(aut)}% de los delitos sin denuncia se callaron por algo que tiene que ver con la autoridad, no con el delito.`;
  const dmax = [...ESTADOS].sort((a, b) => busca(b.razones, "Por desconfianza") - busca(a.razones, "Por desconfianza"))[0];
  $("p4-cita").innerHTML = NAC ? `En el país, la desconfianza en la autoridad pesa <span class="grad">${f1(desc)}%</span>. En ${dmax.corto} llega a ${f1(busca(dmax.razones, "Por desconfianza"))}%.`
    : `En ${E.corto}, la desconfianza en la autoridad pesa <span class="grad">${f1(desc)}%</span>. En el país, ${f1(descN)}%.`;
  if (NAC) $("raz-fuente").textContent = `Fuente: INEGI, ENVIPE ${ED}, cuadro 3.13 · % de los delitos sin denuncia`;

  /* ------------------------------------------------ 5 · la confianza */
  const AU = [["Policía de Tránsito", "Policía de tránsito", "traffic-cone", 0, "la policía de tránsito"], ["Jueces", "Jueces", "gavel", 0, "los jueces"],
    ["Policía Preventiva", "Policía municipal", "siren", 0, "la policía municipal"], ["Ministerio", "Ministerio Público y fiscalía", "scale", 0, "el Ministerio Público y la fiscalía"],
    ["Policía Estatal", "Policía estatal", "shield", 0, "la policía estatal"], ["Policía Ministerial", "Policía ministerial", "fingerprint", 0, "la policía ministerial"],
    ["Fiscalía General", "FGR", "landmark", 0, "la FGR"], ["Guardia Nacional", "Guardia Nacional", "shield-half", 1, "la Guardia Nacional"],
    ["Ejército", "Ejército", "swords", 1, "el Ejército"], ["Marina", "Marina", "anchor", 1, "la Marina"], ["Fuerza Aérea", "Fuerza Aérea", "plane", 1, "la Fuerza Aérea"]]
    .map(([k, t, i, mil, fr]) => ({t, i, mil, fr, m: busca(E.corrupcion, k), p: busca(N.corrupcion, k)})).filter(x => x.m != null);
  const civ = AU.filter(x => !x.mil).sort((a, b) => b.m - a.m), mil = AU.filter(x => x.mil).sort((a, b) => b.m - a.m), orden = [...AU].sort((a, b) => b.m - a.m);
  $("p5-sub").textContent = `En ${NAC ? "el país" : E.corto}, donde más gente percibe corrupción es en ${orden[0].fr}: ${f1(orden[0].m)}%.`;
  $("p5-preg").textContent = NAC ? "¿En qué autoridad crees que más gente percibe corrupción?" : `¿Cuál autoridad percibe ${E.corto} como la más corrupta?`;
  const opc5 = [AU.find(x => x.t === "Policía municipal"), AU.find(x => x.t === "Jueces"), orden[0]].filter((x, i, a) => x && a.indexOf(x) === i);
  const transito = AU.find(x => x.t === "Policía de tránsito");
  if (opc5.length < 3) opc5.push(transito && !opc5.includes(transito) ? transito : orden.find(x => !opc5.includes(x)));
  $("p5-opc").innerHTML = opc5.map(x => `<button>${ic(x.i)}${x.t}</button>`).join("");
  $("p5-resp").innerHTML = `<div class="grande grad">${f1(orden[0].m)}%</div><p>percibe corrupción en <b>${orden[0].fr}</b>. Siguen ${orden[1].fr} (${f1(orden[1].m)}%) y ${orden[2].fr} (${f1(orden[2].m)}%).</p><p class="tu"></p>`;
  const fila = x => `<div class="au ${x.mil ? "militar" : ""}"><span class="n">${ic(x.i)}${x.t}</span><div class="barra-c"><i style="width:${x.m}%"></i>${NAC ? "" : `<u style="left:${x.p}%"></u>`}</div><span class="v">${f1(x.m)}%</span></div>`;
  $("espectro").innerHTML = `<h3>${ic("scale")}% que ve corrupta a cada autoridad</h3><p class="nota" style="padding-left:30px">${NAC ? "Promedio del país." : E.corto + " en color, el país en la línea blanca."} Solo cuenta a quien identifica a la autoridad.</p><div class="sep">Autoridades civiles</div>${civ.map(fila).join("")}<div class="sep">Fuerzas armadas y Guardia</div>${mil.map(fila).join("")}`;

  /* ------------------------------------------------ 6 · lo que viene */
  const T = E.tendencia, TN = N.tendencia, mal = T.igual_mal + T.empeorara, malN = TN.igual_mal + TN.empeorara, dec = Math.round(mal / 10);
  $("p6-tit").textContent = dec === 1 ? "Uno de cada diez no espera nada mejor." : `${cap(PAL[dec])} de cada diez no esperan nada mejor.`;
  $("p6-sub").textContent = NAC ? `En el país, ${f1(mal)}% cree que su colonia seguirá igual de mal o empeorará.` : `En ${E.corto}, ${f1(mal)}% cree que su colonia seguirá igual de mal o empeorará. En el país, ${f1(malN)}%.`;
  const barra = t => `<div class="seg"><div class="e" style="width:${t.empeorara}%">${f1(t.empeorara)}</div><div class="im" style="width:${t.igual_mal}%">${f1(t.igual_mal)}</div><div class="ib" style="width:${t.igual_bien}%">${f1(t.igual_bien)}</div><div class="me" style="width:${t.mejorara}%">${f1(t.mejorara)}</div></div>`;
  $("apilada").innerHTML = NAC ? `<div class="ap"><div class="t">País</div>${barra(T)}</div>` : `<div class="ap"><div class="t">${E.corto}</div>${barra(T)}</div><div class="ap"><div class="t">País</div>${barra(TN)}</div>`;

  /* ------------------------------------------------ el mapa de los 32 */
  (() => {
    const G = ENVIPE_MAPA;
    ESTADOS.forEach(e => e.cambio = (e.inc / e.inc_ant - 1) * 100); N.cambio = cambioN;
    const IND = {
      miedo: {t: "Miedo", ico: "shield-alert", fmt: v => f1(v) + "%", c: ["#2a211a", "#FBBF24", "#D64A3A"], alto: "del que más miedo tiene al que menos", pie: `% que considera inseguro vivir en su estado · ENVIPE ${ED}, cuadro ${D.cuadros.miedo}`},
      cifra: {t: "Cifra oculta", ico: "eye-off", fmt: v => f1(v) + "%", c: ["#2a211a", "#E67E39", "#D64A3A"], alto: "del que más delitos deja sin contar al que menos", pie: `% de delitos de ${AD} sin denuncia o sin carpeta · ENVIPE ${ED}, cuadro ${D.cuadros.cifra}`},
      prev: {t: "Víctimas", ico: "users-round", fmt: v => f0(v), c: ["#2a211a", "#FBBF24", "#D64A3A"], alto: "del que más víctimas tiene al que menos", pie: `víctimas por cada 100 mil habitantes en ${AD} · ENVIPE ${ED}, cuadro ${D.cuadros.prev}`},
      cambio: {t: "Cambio en delitos", ico: "trending-down", fmt: v => (v > 0 ? "+" : "−") + f1(Math.abs(v)) + "%", div: true, alto: "del que más subió al que más bajó", pie: `delitos por cada 100 mil, ${AD} contra ${AD - 1} · ENVIPE ${ED} y ${ED - 1}, cuadro ${D.cuadros.inc}`},
    };
    const cont = $("mapa");
    cont.innerHTML = `<svg viewBox="${G.viewBox}" role="img" aria-label="Mapa de los 32 estados">${ESTADOS.map(e => `<path class="${e.clave === EDO ? "mor" : ""}" d="${G.d[e.clave]}"><title>${e.corto}</title></path>`).join("")}</svg>`;
    const paths = [...cont.querySelectorAll("path")];
    const mezcla = (a, b, t) => { const h = x => [1, 3, 5].map(k => parseInt(x.slice(k, k + 2), 16)); const A = h(a), B = h(b); return `rgb(${A.map((v, k) => Math.round(v + (B[k] - v) * t)).join(",")})`; };
    const base = NAC ? ESTADOS.indexOf(primero("miedo")[0]) : EDO - 1;
    let actual = "miedo", sel = base;
    const color = (k, v, lo, hi) => {
      const I = IND[k];
      if (I.div) { const m = Math.max(Math.abs(lo), Math.abs(hi)); return v >= 0 ? mezcla("#2a211a", "#D64A3A", Math.min(1, v / m)) : mezcla("#2a211a", "#4BA3A3", Math.min(1, -v / m)); }
      const t = (v - lo) / (hi - lo); return t < .5 ? mezcla(I.c[0], I.c[1], t * 2) : mezcla(I.c[1], I.c[2], (t - .5) * 2);
    };
    function lado(i) {
      sel = i; const I = IND[actual], e = ESTADOS[i], ord = [...ESTADOS].sort((a, b) => b[actual] - a[actual]);
      $("l-edo").textContent = e.corto;
      $("l-dato").innerHTML = `<span class="${e.clave === EDO ? "grad" : ""}">${I.fmt(e[actual])}</span>`;
      $("l-lugar").textContent = `Lugar ${ord.indexOf(e) + 1} de 32 · ${I.alto}`;
      $("l-vs").textContent = `El país: ${I.fmt(N[actual])}`;
      $("l-top").innerHTML = ord.slice(0, 6).map(x => `<li class="${x.clave === EDO ? "mor" : ""}" data-i="${ESTADOS.indexOf(x)}"><span>${x.corto}</span><b>${I.fmt(x[actual])}</b></li>`).join("");
      document.querySelectorAll("#l-top li").forEach(li => li.onclick = () => lado(+li.dataset.i));
      $("l-ir").innerHTML = e.clave === EDO ? "" : `<a href="${e.slug}.html">Ver la ficha de ${e.corto} ›</a>`;
      paths.forEach((p, k) => p.classList.toggle("sel", k === i && e.clave !== EDO));
    }
    function pinta(k) {
      actual = k; const I = IND[k], vals = ESTADOS.map(e => e[k]), lo = Math.min(...vals), hi = Math.max(...vals);
      paths.forEach((p, i) => p.style.fill = color(k, ESTADOS[i][k], lo, hi));
      $("esc-min").textContent = I.fmt(lo); $("esc-max").textContent = I.fmt(hi);
      $("esc-g").style.background = I.div ? "linear-gradient(90deg,#4BA3A3,#2a211a,#D64A3A)" : `linear-gradient(90deg,${I.c.join(",")})`;
      $("m-fuente").textContent = "Fuente: INEGI, " + I.pie;
      document.querySelectorAll("#selector span").forEach(x => x.classList.toggle("on", x.dataset.k === k));
      lado(sel);
    }
    $("selector").innerHTML = Object.entries(IND).map(([k, I]) => `<span data-k="${k}" role="button" tabindex="0">${ic(I.ico)}${I.t}</span>`).join("");
    document.querySelectorAll("#selector span").forEach(x => { x.onclick = () => pinta(x.dataset.k); x.onkeydown = ev => { if (ev.key === "Enter") pinta(x.dataset.k); }; });
    paths.forEach((p, i) => { p.onmouseenter = () => lado(i); p.onclick = () => lado(i); });
    cont.onmouseleave = () => lado(base);
    pinta("miedo");
  })();

  /* ------------------------------------------------ íconos estáticos, encuestas, navegador */
  document.querySelectorAll("[data-ico]").forEach(el => el.innerHTML = svg(el.dataset.ico));
  document.querySelectorAll(".encuesta").forEach(card => card.querySelectorAll(".opciones button").forEach(b => b.addEventListener("click", () => {
    card.querySelectorAll(".opciones button").forEach(x => x.classList.remove("marcada"));
    b.classList.add("marcada"); card.classList.add("contestada");
    card.querySelector(".tu").textContent = `Tú marcaste: ${b.textContent.trim().toLowerCase()}.`;
  })));
  (() => {
    const links = [...document.querySelectorAll(".capitulos a")], av = $("avance");
    const activar = id => links.forEach(a => { const on = a.dataset.cap === id; a.classList.toggle("on", on); if (on) a.scrollIntoView({block: "nearest", inline: "center", behavior: "smooth"}); });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) activar(e.target.id); }), {rootMargin: "-45% 0px -50% 0px"});
    links.map(a => $(a.dataset.cap)).filter(Boolean).forEach(s => io.observe(s));
    const mide = () => { const h = document.documentElement; av.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%"; };
    addEventListener("scroll", mide, {passive: true}); mide();
  })();
})();
