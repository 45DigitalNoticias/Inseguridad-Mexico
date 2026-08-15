// Combos FB Dia 19-23 (Morelos): mapa municipal + timeline estatal + ranking federal.
// Recreado del batch2 (el original vivía en el scratchpad y el temp se limpió).
const fs=require("fs");
const BASE="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const GS="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/PROGRAMACIÓN FACEBOOK/GRÁFICAS SEMANALES";
const UMB=GS+"/2026-08 Inseguridad Morelos (FB)";
const COMBOS=UMB+"/1 COMBOS (carrusel 3x dia)";
const LOGO=UMB+"/3 MAPAS sueltos/Semana 1/logo.png";
const rd=f=>eval("("+fs.readFileSync(f,"utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/,"").replace(/;\s*$/,"")+")");

const MU=rd(BASE+"/_nac_muni_data.js");
const GEO=rd(BASE+"/_nac_muni_geo.js");
const O17=rd(BASE+"/series_mensuales/sm_17.js");
const P=rd(BASE+"/_nac_estatal_pop.js");
const G=rd(BASE+"/mexico_estados.geojson.js");
const NAME={}; G.features.forEach(f=>NAME[f.properties.clave_ent]=f.properties.nombre_corto||f.properties.nombre);
const SM={}; for(let c=1;c<=32;c++) SM[c]=rd(BASE+"/series_mensuales/sm_"+String(c).padStart(2,"0")+".js");

// ---- proyeccion mapa Morelos ----
const feats=GEO.features.filter(f=>String(f.properties.k).padStart(5,"0").startsWith("17"));
let xmin=999,xmax=-999,ymin=999,ymax=-999;
const polysOf=ft=> ft.geometry.type==="Polygon"?[ft.geometry.coordinates]:ft.geometry.coordinates;
feats.forEach(ft=>polysOf(ft).forEach(poly=>poly[0].forEach(([x,y])=>{xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);})));
const xcorr=Math.cos((ymin+ymax)/2*Math.PI/180);
const MW=680,MH=680,mpad=18;
const xext=(xmax-xmin)*xcorr, yext=(ymax-ymin);
const mscale=Math.min((MW-2*mpad)/xext,(MH-2*mpad)/yext);
const drawW=xext*mscale, drawH=yext*mscale, OX=(MW-drawW)/2, OY=(MH-drawH)/2;
const px=lon=>OX+(lon-xmin)*xcorr*mscale, py=lat=>OY+(ymax-lat)*mscale;
const pathFor=ft=>{let d="";polysOf(ft).forEach(poly=>{const r=poly[0];d+="M"+r.map(([x,y])=>px(x).toFixed(1)+","+py(y).toFixed(1)).join("L")+"Z";});return d;};
const mname={}; feats.forEach(f=>mname[String(f.properties.k).padStart(5,"0")]=f.properties.n);
const mvalues=delito=>{const di=MU.delitos.indexOf(delito);const o={};feats.forEach(f=>{const k=String(f.properties.k).padStart(5,"0");o[k]=(MU.d[k]&&MU.d[k][di]?MU.d[k][di][11]:0)||0;});return o;};

const MESN=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const mlabel=l=>{const [y,m]=l.split("-");return MESN[+m-1]+" de "+y;};
const STEPS=[10,20,30,40,50,60,80,100,120,150,170,200,250,300,400,500,600,800,1000,1200,1500,2000,3000];
const niceMax=m=>{for(const s of STEPS) if(m<=s) return s; return Math.ceil(m/1000)*1000;};

// ---------- MAPA (municipal) ----------
function mapHTML(C){
 const V=mvalues(C.delito); const arr=Object.values(V);
 const total=arr.reduce((a,c)=>a+c,0), maxV=Math.max(...arr)||1;
 const A=v=> v<=0?0.035:Math.max(0.06,Math.pow(v/maxV,0.72));
 const ranked=Object.entries(V).sort((a,b)=>b[1]-a[1]);
 let glow=""; ranked.slice(0,3).forEach(([k])=>{const f=feats.find(ft=>String(ft.properties.k).padStart(5,"0")===k); if(f) glow+=`<path d="${pathFor(f)}" fill="${C.acc}" fill-opacity="0.5" filter="url(#glow)"/>`;});
 let paths=""; feats.forEach(f=>{const k=String(f.properties.k).padStart(5,"0");paths+=`<path d="${pathFor(f)}" fill="${C.acc}" fill-opacity="${A(V[k]).toFixed(3)}" stroke="#2b2521" stroke-width="1"/>`;});
 const rows=ranked.slice(0,10).map(([k,v],i)=>`<div class="row"><span class="rk">${i+1}</span><span class="nm">${mname[k]}</span><span class="barwrap"><i class="bar" style="width:${Math.max(6,Math.round(360*v/maxV))}px"></i></span><span class="val">${v.toLocaleString('es-MX')}</span></div>`).join("");
 const share1=Math.round(1000*ranked[0][1]/total)/10;
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
  :root{--bg:#0e0c0b;--ink:#f1eadb;--mut:#9a9086;--oro:#d8a53f;--line:#2a2521}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1080px;height:1580px;background:var(--bg);color:var(--ink);font-family:"Hanken Grotesk","Segoe UI",system-ui,Arial,sans-serif;-webkit-font-smoothing:antialiased}
  .wrap{width:1080px;height:1580px;padding:56px 64px 40px;display:flex;flex-direction:column;background:radial-gradient(1200px 720px at 80% -6%, #17120f 0%, var(--bg) 62%)}
  .kick{font-family:"JetBrains Mono","Segoe UI",monospace;color:var(--oro);font-size:22px;letter-spacing:6px;font-weight:700}
  h1{font-size:62px;font-weight:800;margin:8px 0 6px;letter-spacing:-.5px;line-height:1.0} h1 .a{color:${C.acc}}
  .sub{font-size:24px;color:var(--mut);line-height:1.3;max-width:952px}
  .legend{display:flex;align-items:center;gap:12px;justify-content:flex-end;margin:10px 0 -8px}
  .legend .g{width:220px;height:14px;border-radius:7px;background:linear-gradient(90deg, ${C.acc}0d, ${C.acc})}
  .legend span{font-size:18px;color:var(--mut);font-weight:700}
  .mapbox{display:flex;justify-content:center;margin:2px 0}
  .lead{font-size:25px;color:var(--ink);margin:2px 0 12px} .lead b{color:${C.acc};font-weight:800}
  .tbl h2{font-size:21px;letter-spacing:2px;color:var(--mut);font-weight:800;text-transform:uppercase;margin-bottom:6px}
  .row{display:flex;align-items:center;height:43px;border-bottom:1px solid #1c1815}
  .rk{width:42px;font-family:"JetBrains Mono","Segoe UI",monospace;font-size:21px;color:var(--mut);font-weight:700}
  .nm{width:330px;font-size:25px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .barwrap{flex:1;display:flex;align-items:center} .bar{height:15px;border-radius:8px;background:${C.acc};display:block}
  .val{width:104px;text-align:right;font-size:26px;font-weight:800;color:${C.acc}}
  .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;font-size:19px;color:var(--mut);border-top:1px solid var(--line);padding-top:14px} .foot b{color:var(--ink)}
 </style></head><body><div class="wrap">
  <div class="kick">RADIOGRAFÍA MORELOS · MAPA</div>
  <h1>El mapa ${C.art} <span class="a">${C.word}</span></h1>
  <div class="sub">Cada municipio pintado por intensidad: entre más encendido, más carpetas. Primer semestre de 2026.</div>
  <div class="legend"><span>menos</span><i class="g"></i><span>más carpetas</span></div>
  <div class="mapbox"><svg width="680" height="680" viewBox="0 0 680 680">
   <defs><filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="10"/></filter></defs>
   ${glow}${paths}</svg></div>
  <div class="lead">El municipio más golpeado concentra el <b>${share1}%</b> de las carpetas de todo el estado.</div>
  <div class="tbl"><h2>Los 10 municipios con más carpetas</h2>${rows}</div>
  <div class="foot"><div>Fuente: <b>SESNSP</b>, datos abiertos (corte junio 2026). Cotejo propio.</div><img src="logo.png" style="height:44px;opacity:.95;display:block"></div>
 </div></body></html>`;
}

// ---------- TIMELINE (estatal) ----------
function timelineHTML(C){
 const val=O17.delitos[C.delito]; const N=val.length, labels=O17.labels;
 const prelim=labels.indexOf("2026-01");
 const peakIdx=val.indexOf(Math.max(...val)), peakVal=val[peakIdx], peakLbl=mlabel(labels[peakIdx]), peakPrelim=peakIdx>=prelim;
 const yMax=niceMax(Math.max(...val)), half=yMax/2;
 const PX0=48,PX1=944,PW=PX1-PX0, PY_TOP=44,BY=486,CH=BY-PY_TOP;
 const x=i=>PX0+i/(N-1)*PW, y=v=>BY-v/yMax*CH;
 let solid=""; for(let i=0;i<=prelim;i++) solid+=(i?"L":"M")+x(i).toFixed(1)+","+y(val[i]).toFixed(1);
 let dash=""; for(let i=prelim;i<N;i++) dash+=(i===prelim?"M":"L")+x(i).toFixed(1)+","+y(val[i]).toFixed(1);
 let arp=""; for(let i=0;i<N;i++) arp+="L"+x(i).toFixed(1)+","+y(val[i]).toFixed(1);
 const area=`M${PX0},${BY} ${arp.replace(/^L/,"L")} L${PX1},${BY} Z`;
 let grid=""; [0,half,yMax].forEach(v=>{const yy=y(v).toFixed(1);grid+=`<line x1="${PX0}" y1="${yy}" x2="${PX1}" y2="${yy}" stroke="#241f1b" stroke-width="1"/><text x="${PX0-10}" y="${(y(v)+5).toFixed(1)}" fill="#6f665c" font-size="16" font-weight="700" text-anchor="end">${v}</text>`;});
 let xax=""; [[0,"2015"],[24,"2017"],[48,"2019"],[72,"2021"],[96,"2023"],[120,"2025"]].forEach(([i,t])=>{xax+=`<text x="${x(i).toFixed(1)}" y="${BY+26}" fill="#8a8177" font-size="16" font-weight="700" text-anchor="middle">${t}</text>`;});
 const xp=x(prelim);
 const band=`<rect x="${xp.toFixed(1)}" y="${PY_TOP}" width="${(PX1-xp).toFixed(1)}" height="${CH}" fill="rgba(240,230,210,0.05)"/><line x1="${xp.toFixed(1)}" y1="${PY_TOP}" x2="${xp.toFixed(1)}" y2="${BY}" stroke="rgba(255,255,255,.28)" stroke-width="1.4" stroke-dasharray="3 5"/><text x="${PX1-6}" y="${PY_TOP+22}" fill="#c9c2b6" font-size="15" font-weight="800" text-anchor="end">2026*</text><text x="${PX1-6}" y="${PY_TOP+40}" fill="#9a9086" font-size="12.5" font-weight="700" text-anchor="end">preliminar</text>`;
 let peak=`<circle cx="${x(peakIdx).toFixed(1)}" cy="${y(peakVal).toFixed(1)}" r="6" fill="#fff"/>`;
 if(!peakPrelim){const pkx=x(peakIdx),pky=y(peakVal),anc=pkx>PX1-100?"end":(pkx<PX0+70?"start":"middle");peak+=`<text x="${pkx.toFixed(1)}" y="${(pky-26).toFixed(1)}" fill="#fff" font-size="26" font-weight="900" text-anchor="${anc}">${peakVal}</text><text x="${pkx.toFixed(1)}" y="${(pky-8).toFixed(1)}" fill="#f0c9ba" font-size="14" font-weight="700" text-anchor="${anc}">${peakLbl.replace(" de "," ")}</text>`;}
 const svg=`<svg width="952" height="522" viewBox="0 0 952 522"><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.acc}" stop-opacity="0.82"/><stop offset="1" stop-color="${C.acc}" stop-opacity="0.06"/></linearGradient></defs>${grid}${band}<path d="${area}" fill="url(#ar)"/><path d="${solid}" fill="none" stroke="${C.acc}" stroke-width="2.6" stroke-linejoin="round"/><path d="${dash}" fill="none" stroke="${C.acc}" stroke-width="2.4" stroke-linejoin="round" stroke-dasharray="5 4" opacity="0.85"/>${peak}${xax}</svg>`;
 const noteExtra=peakPrelim?" (mes aún preliminar)":"";
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
 :root{--bg:#0e0c0b;--ink:#f1eadb;--mut:#9a9086;--oro:#d8a53f;--line:#2a2521;--acc:${C.acc}}
 *{margin:0;padding:0;box-sizing:border-box}
 html,body{width:1080px;height:1210px;background:var(--bg);color:var(--ink);font-family:"Hanken Grotesk","Segoe UI",system-ui,Arial,sans-serif;-webkit-font-smoothing:antialiased}
 .wrap{width:1080px;height:1210px;padding:56px 64px 40px;display:flex;flex-direction:column;background:radial-gradient(1200px 720px at 82% -6%, #17120f 0%, var(--bg) 62%)}
 .kick{font-family:"JetBrains Mono","Segoe UI",monospace;color:var(--oro);font-size:22px;letter-spacing:6px;font-weight:700}
 h1{font-size:62px;font-weight:800;margin:8px 0 6px;letter-spacing:-.5px;line-height:1.02} h1 .a{color:var(--acc)}
 .sub{font-size:24px;color:var(--mut);line-height:1.3;max-width:952px}
 svg{margin-top:22px;width:952px;height:522px}
 .note{margin-top:26px;background:linear-gradient(180deg,#151210,#100d0b);border:1px solid var(--line);border-left:5px solid var(--acc);border-radius:14px;padding:20px 26px}
 .note p{font-size:22px;color:var(--ink);line-height:1.42} .note b{color:var(--acc);font-weight:800}
 .note .e{color:var(--mut);font-size:20px;margin-top:8px}
 .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;font-size:19px;color:var(--mut);border-top:1px solid var(--line);padding-top:14px} .foot b{color:var(--ink)}
</style></head><body><div class="wrap">
 <div class="kick">RADIOGRAFÍA MORELOS · LÍNEA DEL TIEMPO</div>
 <h1>${C.art1} <span class="a">${C.word}</span> en Morelos, mes a mes</h1>
 <div class="sub">Carpetas por ${C.word} al mes, de 2015 a junio de 2026.</div>
 ${svg}
 <div class="note"><p>El mes con más carpetas fue <b>${peakLbl}</b>, con <b>${peakVal}</b> en un solo mes${noteExtra}.</p>
 <p class="e">Ojo con la cola: <b>los meses de 2026 son cifra preliminar y suelen ajustarse al alza</b>. Los delitos los cuenta la Fiscalía: esto muestra cuándo, no por qué.</p></div>
 <div class="foot"><div>Fuente: <b>SESNSP</b>, datos abiertos (corte junio 2026). Cotejo propio.</div><img src="logo.png" style="height:44px;opacity:.95;display:block"></div>
</div></body></html>`;
}

// ---------- RANKING (federal) ----------
function rankingHTML(C){
 const rows=[]; for(let c=1;c<=32;c++){const a=SM[c].delitos[C.delito]||[];const n=a.length;let t=0;for(let i=n-6;i<n;i++)t+=a[i]||0;const pop=(P.p[String(c)]||[])[11]||1;rows.push({c,name:NAME[c],rate:t/pop*1e5});}
 rows.sort((a,b)=>b.rate-a.rate);
 const maxR=rows[0].rate, morPos=rows.findIndex(r=>r.c===17)+1, mor=rows.find(r=>r.c===17);
 let list=""; rows.forEach((r,i)=>{const isM=r.c===17,w=Math.max(4,Math.round(360*r.rate/maxR));list+=`<div class="row${isM?' me':''}"><span class="rk">${i+1}</span><span class="nm">${r.name}</span><span class="barwrap"><i class="bar" style="width:${w}px"></i></span><span class="val">${r.rate.toFixed(1)}</span></div>`;});
 C._morPos=morPos;
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
 :root{--bg:#0e0c0b;--ink:#f1eadb;--mut:#9a9086;--oro:#d8a53f;--line:#2a2521;--acc:${C.acc}}
 *{margin:0;padding:0;box-sizing:border-box}
 html,body{width:1080px;height:1620px;background:var(--bg);color:var(--ink);font-family:"Hanken Grotesk","Segoe UI",system-ui,Arial,sans-serif;-webkit-font-smoothing:antialiased}
 .wrap{width:1080px;height:1620px;padding:56px 64px 40px;display:flex;flex-direction:column;background:radial-gradient(1200px 720px at 82% -6%, #17120f 0%, var(--bg) 62%)}
 .kick{font-family:"JetBrains Mono","Segoe UI",monospace;color:var(--oro);font-size:22px;letter-spacing:6px;font-weight:700}
 h1{font-size:54px;font-weight:800;margin:8px 0 6px;letter-spacing:-.5px;line-height:1.04} h1 .a{color:var(--acc)}
 .sub{font-size:23px;color:var(--mut);line-height:1.3;max-width:952px}
 .lead{font-size:27px;color:var(--ink);margin:14px 0 8px} .lead b{color:var(--acc);font-weight:800}
 .row{display:flex;align-items:center;height:36px;border-bottom:1px solid #1a1613}
 .rk{width:40px;font-family:"JetBrains Mono","Segoe UI",monospace;font-size:18px;color:#6f665c;font-weight:700}
 .nm{width:280px;font-size:22px;font-weight:600;color:#c9c2b6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .barwrap{flex:1;display:flex;align-items:center} .bar{height:13px;border-radius:7px;background:#5c534a;display:block}
 .val{width:78px;text-align:right;font-size:22px;font-weight:700;color:#9a9086}
 .row.me{background:linear-gradient(90deg, ${C.acc}24, ${C.acc}00);border-radius:8px;border-bottom:1px solid transparent}
 .row.me .rk{color:var(--acc)} .row.me .nm{color:#fff;font-weight:800;font-size:24px}
 .row.me .bar{background:var(--acc);height:16px} .row.me .val{color:var(--acc);font-weight:900;font-size:25px}
 .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;font-size:19px;color:var(--mut);border-top:1px solid var(--line);padding-top:14px} .foot b{color:var(--ink)}
</style></head><body><div class="wrap">
 <div class="kick">RADIOGRAFÍA NACIONAL · RANKING</div>
 <h1>${C.art1} <span class="a">${C.word}</span>: Morelos frente a los 32 estados</h1>
 <div class="sub">Tasa de carpetas por 100 mil habitantes, enero a junio de 2026 (cifra preliminar).</div>
 <div class="lead">Morelos es el <b>#${morPos}</b> del país en ${C.word}, con una tasa de <b>${mor.rate.toFixed(1)}</b>.</div>
 <div>${list}</div>
 <div class="foot"><div>Fuente: <b>SESNSP</b> + <b>CONAPO</b> (población). Corte junio 2026, cifra preliminar. Cotejo propio.</div><img src="logo.png" style="height:44px;opacity:.95;display:block"></div>
</div></body></html>`;
}

const CR=[
 {day:19, slug:"abuso-confianza",  delito:"Abuso de confianza",                        word:"abuso de confianza",              art:"del",     art1:"El",  acc:"#e39b3b", folder:"Dia 19 - Abuso de confianza"},
 {day:20, slug:"allanamiento",     delito:"Allanamiento de morada",                    word:"allanamiento de morada",          art:"del",     art1:"El",  acc:"#66c7ee", folder:"Dia 20 - Allanamiento de morada"},
 {day:21, slug:"servidores",       delito:"Delitos cometidos por servidores públicos", word:"delitos de servidores públicos",  art:"de los",  art1:"Los", acc:"#d3455b", folder:"Dia 21 - Servidores publicos"},
 {day:22, slug:"falsificacion",    delito:"Falsificación",                             word:"falsificación",                   art:"de la",   art1:"La",  acc:"#a8c94a", folder:"Dia 22 - Falsificacion"},
 {day:23, slug:"hostigamiento",    delito:"Hostigamiento sexual",                      word:"hostigamiento sexual",            art:"del",     art1:"El",  acc:"#e58fc0", folder:"Dia 23 - Hostigamiento sexual"},
];

let manifest=[];
CR.forEach(C=>{
 const dir=COMBOS+"/"+C.folder;
 fs.mkdirSync(dir,{recursive:true});
 fs.copyFileSync(LOGO, dir+"/logo.png");
 const files=[["1-mapa-municipal", mapHTML(C), 1580],["2-timeline-estatal", timelineHTML(C), 1210],["3-ranking-federal", rankingHTML(C), 1620]];
 files.forEach(([base,html,h])=>{ fs.writeFileSync(dir+"/"+base+".html", html, "utf8"); manifest.push(dir+"/"+base+".html|"+dir+"/"+base+".png|1080|"+h); });
 console.log("dia"+C.day+" "+C.slug+"  OK  (#"+C._morPos+" nac)");
});
fs.writeFileSync(BASE+"/_manifest_combo3.txt", manifest.join("\n")+"\n", "utf8");
console.log("manifest: "+manifest.length+" htmls");
