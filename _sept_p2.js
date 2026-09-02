
// ---------------- shell visual (ADN de casa) ----------------
const W=1080, H=1350;
const FUENTE_SESNSP=`Fuente: <b>SESNSP</b>, datos abiertos (${CORTE}). Cotejo propio.`;
const FUENTE_TASA=`Fuente: <b>SESNSP</b> + <b>CONAPO</b> (población). Corte julio 2026, cifra preliminar.`;
const FUENTE_MUNI=`Fuente: <b>SESNSP</b>, datos abiertos municipales (${CORTE}). Cotejo propio.`;

function shell({acc,kick,h1,sub,cuerpo,nota,fuente,extraCSS}){
 return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
<style>
 :root{--bg:#0e0c0b;--ink:#f1eadb;--mut:#9a9086;--oro:#d8a53f;--line:#2a2521;--acc:${acc}}
 *{margin:0;padding:0;box-sizing:border-box}
 html,body{width:${W}px;height:${H}px;background:var(--bg);color:var(--ink);font-family:"Hanken Grotesk","Segoe UI",system-ui,Arial,sans-serif;-webkit-font-smoothing:antialiased}
 .wrap{width:${W}px;height:${H}px;padding:46px 54px 32px;display:flex;flex-direction:column;background:radial-gradient(1200px 720px at 80% -6%, #17120f 0%, var(--bg) 62%)}
 .kick{font-family:"JetBrains Mono","Segoe UI",monospace;color:var(--oro);font-size:20px;letter-spacing:5px;font-weight:700}
 h1{font-family:"Bricolage Grotesque","Hanken Grotesk","Segoe UI",sans-serif;font-size:56px;font-weight:800;margin:8px 0 4px;letter-spacing:-.8px;line-height:1.02}
 h1 .a{color:var(--acc)}
 .sub{font-size:21px;color:var(--mut);line-height:1.32;max-width:960px}
 .cuerpo{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;overflow:hidden}
 .nota{margin-top:16px;background:linear-gradient(180deg,#151210,#100d0b);border:1px solid var(--line);border-left:5px solid var(--acc);border-radius:13px;padding:16px 22px}
 .nota h3{font-family:"JetBrains Mono","Segoe UI",monospace;font-size:14px;letter-spacing:3px;color:var(--mut);font-weight:700;margin-bottom:6px}
 .nota p{font-size:21px;color:var(--ink);line-height:1.36} .nota b{color:var(--acc);font-weight:800}
 .nota .e{color:var(--mut);font-size:17.5px;margin-top:6px;line-height:1.32}
 .foot{margin-top:14px;display:flex;justify-content:space-between;align-items:flex-end;font-size:17px;color:var(--mut);border-top:1px solid var(--line);padding-top:12px}
 .foot b{color:var(--ink)}
 text{font-family:"Hanken Grotesk","Segoe UI",sans-serif}
 svg{align-self:center}
 ${extraCSS||""}
</style></head><body><div class="wrap">
 <div class="kick">${kick}</div>
 <h1>${h1}</h1>
 <div class="sub">${sub}</div>
 <div class="cuerpo">${cuerpo}</div>
 ${nota?`<div class="nota"><h3>LO QUE DICE</h3>${nota}</div>`:""}
 <div class="foot"><div>${fuente}</div><img src="logo.png" style="height:40px;opacity:.95;display:block"></div>
</div></body></html>`;
}

// ---------------- primitivas ----------------
// MAPA coropletico (sirve para Morelos y para el pais)
function P_mapa({pr,features,valor,acc,etiquetas,keyOf,nombreOf,fmt}){
 const vals={}; features.forEach(f=>vals[keyOf(f)]=valor(f)||0);
 const arr=Object.values(vals), maxV=Math.max(...arr)||1;
 const A=v=> v<=0?0.035:Math.max(0.07,Math.pow(v/maxV,0.72));
 const ranked=Object.entries(vals).sort((a,b)=>b[1]-a[1]);
 let glow=""; ranked.slice(0,3).forEach(([k])=>{const f=features.find(ft=>String(keyOf(ft))===String(k)); if(f) glow+=`<path d="${pr.pathFor(f)}" fill="${acc}" fill-opacity="0.45" filter="url(#glow)"/>`;});
 let paths=""; features.forEach(f=>{paths+=`<path d="${pr.pathFor(f)}" fill="${acc}" fill-opacity="${A(vals[keyOf(f)]).toFixed(3)}" stroke="#2b2521" stroke-width="1"/>`;});
 let labs=""; const puestas=[];
 if(etiquetas) ranked.slice(0,etiquetas).forEach(([k,v],i)=>{
  const f=features.find(ft=>String(keyOf(ft))===String(k)); if(!f) return;
  const cc=pr.centroid(f); if(!cc) return; const big=i===0, fs=big?23:18; let ly=cc[1];
  while(puestas.some(p=>Math.abs(p.x-cc[0])<118 && Math.abs(p.y-ly)<46)) ly+=40;
  puestas.push({x:cc[0],y:ly});
  // el nombre no puede salirse del lienzo: Quintana Roo se cortaba en el borde
  const anc=cc[0]>pr.W-120?"end":(cc[0]<120?"start":"middle");
  const tx=Math.min(Math.max(cc[0],6),pr.W-6).toFixed(0);
  labs+=`<text x="${tx}" y="${ly.toFixed(0)}" fill="#fff" font-size="${fs}" font-weight="${big?900:800}" text-anchor="${anc}" style="paint-order:stroke;stroke:#0e0c0b;stroke-width:5px">${nombreOf(f)}</text>`;
  labs+=`<text x="${tx}" y="${(ly+fs).toFixed(0)}" fill="${acc}" font-size="${fs-3}" font-weight="800" text-anchor="${anc}" style="paint-order:stroke;stroke:#0e0c0b;stroke-width:5px">${fmt(v)}</text>`;});
 return `<div style="display:flex;align-items:center;gap:12px;justify-content:flex-end;margin-bottom:2px">
  <span style="font-size:16px;color:#9a9086;font-weight:700">menos</span>
  <i style="width:200px;height:12px;border-radius:6px;background:linear-gradient(90deg, ${acc}0d, ${acc});display:block"></i>
  <span style="font-size:16px;color:#9a9086;font-weight:700">más</span></div>
  <svg width="${pr.W}" height="${pr.H}" viewBox="0 0 ${pr.W} ${pr.H}">
  <defs><filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter></defs>
  ${glow}${paths}${labs}</svg>`;
}

// BARRAS horizontales con destacado (top-10, ranking 32, vecinos, tablas de apoyo)
function P_barras({items,fmt,alto,columnas,nombreAncho}){
 const maxV=Math.max(...items.map(i=>Math.abs(i.v)))||1;
 const visibles=columnas===2?Math.ceil(items.length/2):items.length;
 const h=alto||Math.max(28,Math.min(100,Math.floor(806/visibles))), na=nombreAncho||(columnas===2?232:330);
 const anchoBar=columnas===2?92:380;
 const fila=(it,i)=>{
  const w=Math.max(5,Math.round(anchoBar*Math.abs(it.v)/maxV));
  return `<div class="fila${it.on?" on":""}" style="height:${h}px">
   <span class="rk">${it.rk!==undefined?it.rk:i+1}</span>
   <span class="nm" style="width:${na}px">${it.n}${it.sub?` <i>· ${it.sub}</i>`:""}</span>
   <span class="bw"><i class="bar" style="width:${w}px"></i></span>
   <span class="vl" style="width:${columnas===2?78:104}px">${fmt(it.v)}</span></div>`;};
 if(columnas===2){
  const mitad=Math.ceil(items.length/2);
  return `<div style="display:flex;gap:24px">
   <div style="flex:1">${items.slice(0,mitad).map(fila).join("")}</div>
   <div style="flex:1">${items.slice(mitad).map((it,i)=>fila(it,i+mitad)).join("")}</div></div>`;
 }
 return `<div>${items.map(fila).join("")}</div>`;
}
const CSS_BARRAS=acc=>`
 .fila{display:flex;align-items:center;border-bottom:1px solid #1c1815}
 .rk{width:42px;font-family:"JetBrains Mono","Segoe UI",monospace;font-size:19px;color:#6f665c;font-weight:700;flex:none}
 .nm{font-size:22px;font-weight:700;color:#c9c2b6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:none}
 .nm i{font-style:normal;font-weight:600;font-size:17px;color:#7d746a}
 .bw{flex:1;display:flex;align-items:center;min-width:0} .bar{height:14px;border-radius:7px;background:#5c534a;display:block}
 .vl{text-align:right;font-size:23px;font-weight:800;color:#9a9086;font-variant-numeric:tabular-nums;flex:none}
 .fila.on{background:linear-gradient(90deg, ${acc}26, ${acc}00);border-radius:9px;border-bottom:1px solid transparent}
 .fila.on .rk{color:${acc}} .fila.on .nm{color:#fff;font-weight:900}
 .fila.on .bar{background:${acc};height:17px} .fila.on .vl{color:${acc};font-weight:900}`;

// DIVERGENTE (sube y baja): cian mejora, rojo deterioro
function P_diverge({items,fmt}){
 const maxV=Math.max(...items.map(i=>Math.abs(i.v)))||1, MID=470, ANCHO=270;
 const H_=Math.max(30,Math.min(80,Math.floor(770/items.length)));
 return `<div style="--dvh:${H_}px;position:relative"><i style="position:absolute;left:${MID}px;top:0;bottom:34px;width:1px;background:#3a342e"></i>${items.map(it=>{
  const w=Math.max(4,Math.round(ANCHO*Math.abs(it.v)/maxV)), sube=it.v>=0;
  const col=sube?"#d03b3b":"#3987e5";
  return `<div class="dv">
   <span class="dn">${it.n}</span>
   <span class="dbar"><i style="width:${w}px;background:${col};left:${sube?MID:MID-w}px"></i></span>
   <span class="dvl" style="color:${col}">${fmt(it.v)}</span></div>`;}).join("")}
  <div class="dleg"><span><i style="background:#3987e5"></i>baja</span><span><i style="background:#d03b3b"></i>sube</span></div></div>`;
}
const CSS_DIVERGE=`
 .dv{display:flex;align-items:center;height:var(--dvh,48px);border-bottom:1px solid #1c1815;position:relative}
 .dn{width:300px;font-size:23px;font-weight:700;color:#c9c2b6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .dbar{position:absolute;left:0;right:0;top:0;height:var(--dvh,48px)}
 .dbar i{position:absolute;top:calc(50% - 8px);height:16px;border-radius:8px;display:block}
 .dvl{margin-left:auto;width:130px;text-align:right;font-size:23px;font-weight:800;font-variant-numeric:tabular-nums;z-index:2}
 .dleg{display:flex;gap:22px;justify-content:flex-end;margin-top:12px;font-size:17px;color:#9a9086;font-weight:700}
 .dleg i{display:inline-block;width:16px;height:16px;border-radius:4px;margin-right:7px;vertical-align:-2px}`;

// LINEA / AREA temporal, con la cola de 2026 punteada y su banda de preliminar
function P_linea({series,acc,ancho,alto,xticks,fmtY,marcarPico}){
 const AW=ancho||940, AH=alto||720;
 const PX0=76,PX1=AW-16,PW=PX1-PX0,PY=30,BY=AH-40,CH=BY-PY;
 const N=series[0].v.length;
 const maxAll=Math.max(...series.map(s=>Math.max(...s.v)));
 const yMax=niceMax(maxAll), x=i=>PX0+i/(N-1)*PW, y=v=>BY-v/yMax*CH;
 let grid=""; [0,yMax/2,yMax].forEach(v=>{const yy=y(v).toFixed(1);
  grid+=`<line x1="${PX0}" y1="${yy}" x2="${PX1}" y2="${yy}" stroke="#241f1b" stroke-width="1"/>`+
        `<text x="${PX0-10}" y="${(y(v)+5).toFixed(1)}" fill="#6f665c" font-size="15" font-weight="700" text-anchor="end">${(fmtY||kfmt)(v)}</text>`;});
 let xax=""; (xticks||[]).forEach(([i,t])=>{xax+=`<text x="${x(i).toFixed(1)}" y="${BY+26}" fill="#8a8177" font-size="15" font-weight="700" text-anchor="middle">${t}</text>`;});
 const pre=series[0].prelim;
 let band="";
 if(pre!==undefined && pre>=0){const xp=x(pre);
  band=`<rect x="${xp.toFixed(1)}" y="${PY}" width="${(PX1-xp).toFixed(1)}" height="${CH}" fill="rgba(240,230,210,0.05)"/>`+
   `<line x1="${xp.toFixed(1)}" y1="${PY}" x2="${xp.toFixed(1)}" y2="${BY}" stroke="rgba(255,255,255,.28)" stroke-width="1.4" stroke-dasharray="3 5"/>`+
   `<text x="${PX1-4}" y="${BY-26}" fill="#c9c2b6" font-size="15" font-weight="800" text-anchor="end">2026*</text>`+
   `<text x="${PX1-4}" y="${BY-9}" fill="#9a9086" font-size="13" font-weight="700" text-anchor="end">preliminar</text>`;}
 let capas="", defs="";
 series.forEach((s,si)=>{
  const col=s.color||acc, corte=(s.prelim!==undefined&&s.prelim>=0)?s.prelim:N-1;
  let solid="",dash="",arp="";
  for(let i=0;i<=corte;i++) solid+=(i?"L":"M")+x(i).toFixed(1)+","+y(s.v[i]).toFixed(1);
  for(let i=corte;i<N;i++) dash+=(i===corte?"M":"L")+x(i).toFixed(1)+","+y(s.v[i]).toFixed(1);
  for(let i=0;i<N;i++) arp+="L"+x(i).toFixed(1)+","+y(s.v[i]).toFixed(1);
  if(s.area!==false){defs+=`<linearGradient id="ar${si}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity="0.75"/><stop offset="1" stop-color="${col}" stop-opacity="0.05"/></linearGradient>`;
   capas+=`<path d="M${PX0},${BY} ${arp} L${PX1},${BY} Z" fill="url(#ar${si})"/>`;}
  capas+=`<path d="${solid}" fill="none" stroke="${col}" stroke-width="2.8" stroke-linejoin="round"/>`;
  if(dash) capas+=`<path d="${dash}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linejoin="round" stroke-dasharray="5 4" opacity="0.85"/>`;});
 let pico="";
 if(marcarPico){const s=series[0];const pi=s.v.indexOf(Math.max(...s.v));
  const anc=x(pi)>PX1-110?"end":(x(pi)<PX0+80?"start":"middle");
  pico=`<circle cx="${x(pi).toFixed(1)}" cy="${y(s.v[pi]).toFixed(1)}" r="6" fill="#fff"/>`+
   `<text x="${x(pi).toFixed(1)}" y="${(y(s.v[pi])-26).toFixed(1)}" fill="#fff" font-size="24" font-weight="900" text-anchor="${anc}">${nf(s.v[pi])}</text>`+
   `<text x="${x(pi).toFixed(1)}" y="${(y(s.v[pi])-8).toFixed(1)}" fill="#e3d6c2" font-size="14" font-weight="700" text-anchor="${anc}">${s.picoLbl||""}</text>`;}
 let leyenda="";
 if(series.length>1) leyenda=`<div style="display:flex;gap:26px;justify-content:center;margin-top:6px;font-size:19px;color:#c9c2b6;font-weight:700">`+
  series.map(s=>`<span><i style="display:inline-block;width:26px;height:5px;border-radius:3px;background:${s.color||acc};margin-right:9px;vertical-align:4px"></i>${s.n}</span>`).join("")+`</div>`;
 return `<svg width="${AW}" height="${AH}" viewBox="0 0 ${AW} ${AH}"><defs>${defs}</defs>${grid}${band}${capas}${pico}${xax}</svg>${leyenda}`;
}

// COLUMNAS verticales (años, meses enfrentados)
function P_columnas({grupos,series,alto,fmtV,leyenda}){
 const AW=940, AH=alto||700, PX0=70,PX1=AW-10,PY=40,BY=AH-46;
 const maxAll=Math.max(...grupos.map(g=>Math.max(...g.v)));
 const yMax=niceMax(maxAll), CH=BY-PY;
 const paso=(PX1-PX0)/grupos.length, ns=grupos[0].v.length;
 const bw=Math.min(46,(paso-14)/ns);
 let grid=""; [0,yMax/2,yMax].forEach(v=>{const yy=(BY-v/yMax*CH).toFixed(1);
  grid+=`<line x1="${PX0}" y1="${yy}" x2="${PX1}" y2="${yy}" stroke="#241f1b" stroke-width="1"/><text x="${PX0-10}" y="${(+yy+5).toFixed(1)}" fill="#6f665c" font-size="15" font-weight="700" text-anchor="end">${kfmt(v)}</text>`;});
 let barras="";
 grupos.forEach((g,gi)=>{
  const x0=PX0+paso*gi+(paso-bw*ns-(ns-1)*4)/2;
  g.v.forEach((v,si)=>{
   const h=Math.max(2,v/yMax*CH), xx=x0+si*(bw+4), yy=BY-h;
   const col=series[si].color, op=g.prelim?0.55:1;
   barras+=`<rect x="${xx.toFixed(1)}" y="${yy.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${col}" opacity="${op}"${g.prelim?' stroke="'+col+'" stroke-dasharray="4 3" stroke-width="1.4"':''}/>`;
   if(g.etiqueta!==false&&ns<=2) barras+=`<text x="${(xx+bw/2).toFixed(1)}" y="${(yy-8).toFixed(1)}" fill="${col}" font-size="${ns===1?17:15}" font-weight="800" text-anchor="middle">${(fmtV||nf)(v)}</text>`;});
  barras+=`<text x="${(PX0+paso*gi+paso/2).toFixed(1)}" y="${BY+26}" fill="${g.prelim?'#c9c2b6':'#8a8177'}" font-size="15" font-weight="${g.prelim?800:700}" text-anchor="middle">${g.n}${g.prelim?"*":""}</text>`;});
 let leg="";
 if(leyenda!==false&&series.length>1) leg=`<div style="display:flex;gap:26px;justify-content:center;margin-top:8px;font-size:19px;color:#c9c2b6;font-weight:700">`+
  series.map(s=>`<span><i style="display:inline-block;width:16px;height:16px;border-radius:4px;background:${s.color};margin-right:9px;vertical-align:-2px"></i>${s.n}</span>`).join("")+`</div>`;
 return `<svg width="${AW}" height="${AH}" viewBox="0 0 ${AW} ${AH}">${grid}${barras}</svg>${leg}`;
}
