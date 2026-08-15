// Combos FB Dia 24-28 (NACIONAL): mapa 32 estados + timeline nacional + top-10 municipios del país.
const fs=require("fs");
const BASE="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const GS="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/PROGRAMACIÓN FACEBOOK/GRÁFICAS SEMANALES";
const COMBOS=GS+"/2026-08 Inseguridad Morelos (FB)/1 COMBOS (carrusel 3x dia)";
const LOGO=GS+"/2026-08 Inseguridad Morelos (FB)/3 MAPAS sueltos/Semana 1/logo.png";
const rd=f=>eval("("+fs.readFileSync(f,"utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/,"").replace(/;\s*$/,"")+")");

const MU=rd(BASE+"/_nac_muni_data.js");
const GEO=rd(BASE+"/_nac_muni_geo.js");
const G=rd(BASE+"/mexico_estados.geojson.js");
const P=rd(BASE+"/_nac_estatal_pop.js");
const NAME={}; G.features.forEach(f=>NAME[f.properties.clave_ent]=f.properties.nombre_corto||f.properties.nombre);
const MNM={}; GEO.features.forEach(f=>{const k=String(f.properties.k).padStart(5,"0"); MNM[k]={n:f.properties.n,e:f.properties.e};});
const SM={}; for(let c=1;c<=32;c++) SM[c]=rd(BASE+"/series_mensuales/sm_"+String(c).padStart(2,"0")+".js");
const L=SM[1].labels;
const MESN=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const mlabel=l=>{const [y,m]=l.split("-");return MESN[+m-1]+" de "+y;};
const STEPS=[10,20,30,40,50,60,80,100,120,150,170,200,250,300,400,500,600,800,1000,1200,1500,2000,2500,3000,4000,5000,6000,8000,10000,12000,15000,20000,25000,30000];
const niceMax=m=>{for(const s of STEPS) if(m<=s) return s; return Math.ceil(m/10000)*10000;};

// proyección nacional
const polysOf=g=> g.type==="Polygon"?[g.coordinates]:g.coordinates;
let xmin=999,xmax=-999,ymin=999,ymax=-999;
G.features.forEach(f=>polysOf(f.geometry).forEach(poly=>poly[0].forEach(([x,y])=>{xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);})));
const xcorr=Math.cos((ymin+ymax)/2*Math.PI/180);
const MW=1004,MH=700,mpad=10;
const xext=(xmax-xmin)*xcorr, yext=(ymax-ymin);
const mscale=Math.min((MW-2*mpad)/xext,(MH-2*mpad)/yext);
const OX=(MW-xext*mscale)/2, OY=(MH-yext*mscale)/2;
const px=lon=>OX+(lon-xmin)*xcorr*mscale, py=lat=>OY+(ymax-lat)*mscale;
const pathFor=f=>{let d="";polysOf(f.geometry).forEach(poly=>{const r=poly[0];d+="M"+r.map(([x,y])=>px(x).toFixed(1)+","+py(y).toFixed(1)).join("L")+"Z";});return d;};
function centroid(f){let best=null,ba=-1;polysOf(f.geometry).forEach(poly=>{const r=poly[0];let a=0,cx=0,cy=0;for(let i=0;i<r.length-1;i++){const [x1,y1]=r[i],[x2,y2]=r[i+1];const cr=x1*y2-x2*y1;a+=cr;cx+=(x1+x2)*cr;cy+=(y1+y2)*cr;}a*=0.5;if(Math.abs(a)>ba){ba=Math.abs(a);cx/=(6*a);cy/=(6*a);best=[px(cx),py(cy)];}});return best;}

const CSS=(acc,h)=>`
 :root{--bg:#0e0c0b;--ink:#f1eadb;--mut:#9a9086;--oro:#d8a53f;--line:#2a2521;--acc:${acc}}
 *{margin:0;padding:0;box-sizing:border-box}
 html,body{width:1080px;height:${h}px;background:var(--bg);color:var(--ink);font-family:"Hanken Grotesk","Segoe UI",system-ui,Arial,sans-serif;-webkit-font-smoothing:antialiased}
 .wrap{width:1080px;height:${h}px;padding:52px 60px 38px;display:flex;flex-direction:column;background:radial-gradient(1200px 720px at 80% -6%, #17120f 0%, var(--bg) 62%)}
 .kick{font-family:"JetBrains Mono","Segoe UI",monospace;color:var(--oro);font-size:22px;letter-spacing:6px;font-weight:700}
 h1{font-size:62px;font-weight:800;margin:8px 0 4px;letter-spacing:-.5px;line-height:1.0} h1 .a{color:var(--acc)}
 .sub{font-size:23px;color:var(--mut);line-height:1.3;max-width:960px}
 .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;font-size:19px;color:var(--mut);border-top:1px solid var(--line);padding-top:14px} .foot b{color:var(--ink)}
 text{font-family:"Hanken Grotesk","Segoe UI",sans-serif}`;

// ---------- 1) MAPA NACIONAL ----------
function mapaNacionalHTML(C){
 const RATE={};
 G.features.forEach(f=>{const c=f.properties.clave_ent;
  const a=SM[c].delitos[C.delito]||[]; const n=a.length; let t=0; for(let i=n-6;i<n;i++)t+=a[i]||0;
  const pop=(P.p[String(c)]||[])[11]||1; RATE[c]=t/pop*1e5;});
 const maxR=Math.max(...Object.values(RATE));
 const ranked=Object.entries(RATE).map(([c,r])=>({c:+c,r})).sort((a,b)=>b.r-a.r);
 const A=r=> r<=0?0.03:Math.max(0.07,Math.pow(r/maxR,0.7));
 let glow=""; ranked.slice(0,3).forEach(o=>{const f=G.features.find(ft=>ft.properties.clave_ent===o.c);glow+=`<path d="${pathFor(f)}" fill="${C.acc}" fill-opacity="0.5" filter="url(#glow)"/>`;});
 let paths=""; G.features.forEach(f=>{paths+=`<path d="${pathFor(f)}" fill="${C.acc}" fill-opacity="${A(RATE[f.properties.clave_ent]).toFixed(3)}" stroke="#2b2521" stroke-width="1"/>`;});
 let labs=""; ranked.slice(0,5).forEach((o,i)=>{const f=G.features.find(ft=>ft.properties.clave_ent===o.c);const cc=centroid(f);if(!cc)return;
  const big=i===0; const fs2=big?24:19;
  labs+=`<text x="${cc[0].toFixed(0)}" y="${cc[1].toFixed(0)}" fill="#fff" font-size="${fs2}" font-weight="${big?900:800}" text-anchor="middle" style="paint-order:stroke;stroke:#0e0c0b;stroke-width:5px">${NAME[o.c]}</text>`;
  labs+=`<text x="${cc[0].toFixed(0)}" y="${(cc[1]+fs2).toFixed(0)}" fill="${C.acc}" font-size="${fs2-3}" font-weight="800" text-anchor="middle" style="paint-order:stroke;stroke:#0e0c0b;stroke-width:5px">${o.r.toFixed(1)}</text>`;});
 const t1=ranked[0];
 C._top1=NAME[t1.c]; C._top1rate=t1.r.toFixed(1);
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${CSS(C.acc,1200)}
 .legend{display:flex;align-items:center;gap:12px;justify-content:flex-end;margin:8px 0 -6px}
 .legend .g{width:220px;height:14px;border-radius:7px;background:linear-gradient(90deg, ${C.acc}0d, ${C.acc})}
 .legend span{font-size:18px;color:var(--mut);font-weight:700}
 .mapbox{display:flex;justify-content:center;align-items:center;flex:1}
 .lead{font-size:26px;color:var(--ink);margin:6px 0 0} .lead b{color:${C.acc};font-weight:800}
 </style></head><body><div class="wrap">
 <div class="kick">RADIOGRAFÍA NACIONAL · MAPA</div>
 <h1>El mapa ${C.art} <span class="a">${C.word}</span> en México</h1>
 <div class="sub">Cada estado pintado por intensidad: tasa de carpetas por 100 mil habitantes, enero a junio de 2026 (cifra preliminar).</div>
 <div class="legend"><span>menos</span><i class="g"></i><span>más carpetas</span></div>
 <div class="mapbox"><svg width="1004" height="700" viewBox="0 0 1004 700">
  <defs><filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter></defs>
  ${glow}${paths}${labs}</svg></div>
 <div class="lead"><b>${NAME[t1.c]}</b> encabeza el país, con una tasa de <b>${t1.r.toFixed(1)}</b> por cada 100 mil habitantes.</div>
 <div class="foot"><div>Fuente: <b>SESNSP</b> + <b>CONAPO</b> (población). Corte junio 2026, cifra preliminar. Cotejo propio.</div><img src="logo.png" style="height:44px;opacity:.95;display:block"></div>
</div></body></html>`;
}

// ---------- 2) TIMELINE NACIONAL ----------
function timelineNacionalHTML(C){
 const N=L.length; const val=new Array(N).fill(0);
 for(let c=1;c<=32;c++){const a=SM[c].delitos[C.delito]||[];for(let i=0;i<N;i++)val[i]+=a[i]||0;}
 const prelim=L.indexOf("2026-01");
 const peakIdx=val.indexOf(Math.max(...val)), peakVal=val[peakIdx], peakLbl=mlabel(L[peakIdx]), peakPrelim=peakIdx>=prelim;
 const yMax=niceMax(Math.max(...val)), half=yMax/2;
 const PX0=64,PX1=944,PW=PX1-PX0, PY_TOP=44,BY=486,CH=BY-PY_TOP;
 const x=i=>PX0+i/(N-1)*PW, y=v=>BY-v/yMax*CH;
 let solid=""; for(let i=0;i<=prelim;i++) solid+=(i?"L":"M")+x(i).toFixed(1)+","+y(val[i]).toFixed(1);
 let dash=""; for(let i=prelim;i<N;i++) dash+=(i===prelim?"M":"L")+x(i).toFixed(1)+","+y(val[i]).toFixed(1);
 let arp=""; for(let i=0;i<N;i++) arp+="L"+x(i).toFixed(1)+","+y(val[i]).toFixed(1);
 const area=`M${PX0},${BY} ${arp.replace(/^L/,"L")} L${PX1},${BY} Z`;
 const fmt=v=>v>=1000?(v/1000).toFixed(v%1000===0?0:1)+"k":v;
 let grid=""; [0,half,yMax].forEach(v=>{const yy=y(v).toFixed(1);grid+=`<line x1="${PX0}" y1="${yy}" x2="${PX1}" y2="${yy}" stroke="#241f1b" stroke-width="1"/><text x="${PX0-10}" y="${(y(v)+5).toFixed(1)}" fill="#6f665c" font-size="16" font-weight="700" text-anchor="end">${fmt(v)}</text>`;});
 let xax=""; [[0,"2015"],[24,"2017"],[48,"2019"],[72,"2021"],[96,"2023"],[120,"2025"]].forEach(([i,t])=>{xax+=`<text x="${x(i).toFixed(1)}" y="${BY+26}" fill="#8a8177" font-size="16" font-weight="700" text-anchor="middle">${t}</text>`;});
 const xp=x(prelim);
 const band=`<rect x="${xp.toFixed(1)}" y="${PY_TOP}" width="${(PX1-xp).toFixed(1)}" height="${CH}" fill="rgba(240,230,210,0.05)"/><line x1="${xp.toFixed(1)}" y1="${PY_TOP}" x2="${xp.toFixed(1)}" y2="${BY}" stroke="rgba(255,255,255,.28)" stroke-width="1.4" stroke-dasharray="3 5"/><text x="${PX1-6}" y="${PY_TOP+22}" fill="#c9c2b6" font-size="15" font-weight="800" text-anchor="end">2026*</text><text x="${PX1-6}" y="${PY_TOP+40}" fill="#9a9086" font-size="12.5" font-weight="700" text-anchor="end">preliminar</text>`;
 let peak=`<circle cx="${x(peakIdx).toFixed(1)}" cy="${y(peakVal).toFixed(1)}" r="6" fill="#fff"/>`;
 if(!peakPrelim){const pkx=x(peakIdx),pky=y(peakVal),anc=pkx>PX1-110?"end":(pkx<PX0+80?"start":"middle");peak+=`<text x="${pkx.toFixed(1)}" y="${(pky-26).toFixed(1)}" fill="#fff" font-size="26" font-weight="900" text-anchor="${anc}">${peakVal.toLocaleString('es-MX')}</text><text x="${pkx.toFixed(1)}" y="${(pky-8).toFixed(1)}" fill="#f0c9ba" font-size="14" font-weight="700" text-anchor="${anc}">${peakLbl.replace(" de "," ")}</text>`;}
 const svg=`<svg width="1004" height="522" viewBox="0 0 1004 522"><defs><linearGradient id="ar2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.acc}" stop-opacity="0.82"/><stop offset="1" stop-color="${C.acc}" stop-opacity="0.06"/></linearGradient></defs>${grid}${band}<path d="${area}" fill="url(#ar2)"/><path d="${solid}" fill="none" stroke="${C.acc}" stroke-width="2.6" stroke-linejoin="round"/><path d="${dash}" fill="none" stroke="${C.acc}" stroke-width="2.4" stroke-linejoin="round" stroke-dasharray="5 4" opacity="0.85"/>${peak}${xax}</svg>`;
 const noteExtra=peakPrelim?" (mes aún preliminar)":"";
 C._peak=peakVal.toLocaleString('es-MX'); C._peakLbl=peakLbl;
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${CSS(C.acc,1210)}
 svg{margin-top:22px;width:1004px;height:522px;align-self:center}
 .note{margin-top:26px;background:linear-gradient(180deg,#151210,#100d0b);border:1px solid var(--line);border-left:5px solid var(--acc);border-radius:14px;padding:20px 26px}
 .note p{font-size:22px;color:var(--ink);line-height:1.42} .note b{color:var(--acc);font-weight:800}
 .note .e{color:var(--mut);font-size:20px;margin-top:8px}
 </style></head><body><div class="wrap">
 <div class="kick">RADIOGRAFÍA NACIONAL · LÍNEA DEL TIEMPO</div>
 <h1>${C.art1} <span class="a">${C.word}</span> en México, mes a mes</h1>
 <div class="sub">Carpetas en todo el país, por mes, de 2015 a junio de 2026.</div>
 ${svg}
 <div class="note"><p>El mes con más carpetas fue <b>${peakLbl}</b>, con <b>${peakVal.toLocaleString('es-MX')}</b> en un solo mes${noteExtra}.</p>
 <p class="e">Ojo con la cola: <b>los meses de 2026 son cifra preliminar y suelen ajustarse al alza</b>. Los delitos los cuenta cada fiscalía: esto muestra cuándo, no por qué.</p></div>
 <div class="foot"><div>Fuente: <b>SESNSP</b>, datos abiertos (corte junio 2026). Cotejo propio.</div><img src="logo.png" style="height:44px;opacity:.95;display:block"></div>
</div></body></html>`;
}

// ---------- 3) TOP-10 MUNICIPIOS DEL PAÍS ----------
function top10MuniHTML(C){
 const di=MU.delitos.indexOf(C.delito);
 const r=[];
 Object.keys(MU.d).forEach(k=>{const v=(MU.d[k][di]||[])[11]||0; if(v>0){const kk=String(k).padStart(5,"0"); const m=MNM[kk]; if(m) r.push([m.n,m.e,v,kk]);}});
 r.sort((a,b)=>b[2]-a[2]);
 const top=r.slice(0,10), maxV=top[0][2];
 let list=""; top.forEach(([n,e,v,kk],i)=>{const isMor=kk.startsWith("17");
  list+=`<div class="row${isMor?' me':''}"><span class="rk">${i+1}</span><span class="nm">${n} <i>· ${e}</i></span><span class="barwrap"><i class="bar" style="width:${Math.max(8,Math.round(400*v/maxV))}px"></i></span><span class="val">${v.toLocaleString('es-MX')}</span></div>`;});
 C._m1=top[0][0]+" ("+top[0][1]+") "+top[0][2].toLocaleString('es-MX');
 const morIn=top.findIndex(t=>t[3].startsWith("17"));
 C._morTop=morIn>=0?(morIn+1)+"º "+top[morIn][0]:null;
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${CSS(C.acc,1350)}
 .row{display:flex;align-items:center;height:64px;border-bottom:1px solid #1c1815}
 .rk{width:52px;font-family:"JetBrains Mono","Segoe UI",monospace;font-size:24px;color:#6f665c;font-weight:700}
 .nm{width:400px;font-size:26px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .nm i{font-style:normal;font-weight:600;font-size:19px;color:var(--mut)}
 .barwrap{flex:1;display:flex;align-items:center} .bar{height:18px;border-radius:9px;background:${C.acc};display:block;opacity:.92}
 .val{width:110px;text-align:right;font-size:27px;font-weight:800;color:${C.acc}}
 .row.me{background:linear-gradient(90deg, ${C.acc}22, ${C.acc}00);border-radius:10px;border-bottom:1px solid transparent}
 .lead{font-size:25px;color:var(--ink);margin:14px 0 10px} .lead b{color:${C.acc};font-weight:800}
 </style></head><body><div class="wrap">
 <div class="kick">RADIOGRAFÍA NACIONAL · MUNICIPIOS</div>
 <h1>Los 10 municipios con más <span class="a">${C.word}</span> del país</h1>
 <div class="sub">Carpetas de investigación, enero a junio de 2026 (cifra preliminar).</div>
 <div class="lead">Encabeza <b>${top[0][0]}</b> (${top[0][1]}), con <b>${top[0][2].toLocaleString('es-MX')}</b> carpetas en el semestre.</div>
 <div>${list}</div>
 <div class="foot"><div>Fuente: <b>SESNSP</b>, datos abiertos municipales (corte junio 2026). Cotejo propio.</div><img src="logo.png" style="height:44px;opacity:.95;display:block"></div>
</div></body></html>`;
}

const CR=[
 {day:24, slug:"homicidio",          delito:"Homicidio doloso",   word:"homicidio",          art:"del",   art1:"El", acc:"#f26b3a", folder:"Dia 24 - NACIONAL Homicidio"},
 {day:25, slug:"extorsion",          delito:"Extorsión",          word:"extorsión",          art:"de la", art1:"La", acc:"#f2c63c", folder:"Dia 25 - NACIONAL Extorsion"},
 {day:26, slug:"violencia-familiar", delito:"Violencia familiar", word:"violencia familiar", art:"de la", art1:"La", acc:"#b06fe8", folder:"Dia 26 - NACIONAL Violencia familiar"},
 {day:27, slug:"narcomenudeo",       delito:"Narcomenudeo",       word:"narcomenudeo",       art:"del",   art1:"El", acc:"#82e564", folder:"Dia 27 - NACIONAL Narcomenudeo"},
 {day:28, slug:"fraude",             delito:"Fraude",             word:"fraude",             art:"del",   art1:"El", acc:"#ffcf3d", folder:"Dia 28 - NACIONAL Fraude"},
];

let manifest=[];
CR.forEach(C=>{
 const dir=COMBOS+"/"+C.folder;
 fs.mkdirSync(dir,{recursive:true});
 fs.copyFileSync(LOGO, dir+"/logo.png");
 const files=[["1-mapa-nacional", mapaNacionalHTML(C), 1200],["2-timeline-nacional", timelineNacionalHTML(C), 1210],["3-top10-municipios", top10MuniHTML(C), 1350]];
 files.forEach(([base,html,h])=>{ fs.writeFileSync(dir+"/"+base+".html", html, "utf8"); manifest.push(dir+"/"+base+".html|"+dir+"/"+base+".png|1080|"+h); });
 console.log("dia"+C.day+" "+C.slug+"  OK  top-estado: "+C._top1+" ("+C._top1rate+")  pico-mes: "+C._peakLbl+" "+C._peak+"  muni#1: "+C._m1+(C._morTop?"  [Morelos en top10: "+C._morTop+"]":""));
});
fs.writeFileSync(BASE+"/_manifest_combo_nac.txt", manifest.join("\n")+"\n", "utf8");
console.log("manifest: "+manifest.length+" htmls");
