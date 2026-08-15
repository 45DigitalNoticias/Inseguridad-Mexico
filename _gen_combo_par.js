// Combos por PARES (delitos 24-29): cada delito nuevo sale con sus dos combos
// del mismo día, directo a la estructura de una carpeta por delito:
//   NN - Delito/MAÑANA estatal/  -> 3 láminas (mapa municipal + timeline Morelos
//                                   + ranking federal) + caption
//   NN - Delito/NOCHE nacional/  -> 4 láminas (mapa nacional + MAPA ESTATAL +
//                                   timeline nacional + top-10 municipios) + caption
// La 4ª lámina nace del pedido del 14-ago-2026: "aparte del mapa nacional,
// quiero el estatal". El mapa estatal de la noche es la MISMA lámina municipal
// de la mañana (mismos datos, mismo color): se renderiza una vez y se copia.
// Moldes: _gen_combo_batch3.js (estatal) y _gen_combo_nac2.js (nacional).
// Captions con datos CALCULADOS de las mismas series; nada inventado.
const fs=require("fs");
const BASE="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const GS="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/PROGRAMACIÓN FACEBOOK/GRÁFICAS SEMANALES";
const UMB=GS+"/2026-08 Inseguridad Morelos (FB)";
const COMBOS=UMB+"/1 COMBOS (carrusel 3x dia)";
const LOGO=UMB+"/3 MAPAS sueltos/Semana 1/logo.png";
const rd=f=>eval("("+fs.readFileSync(f,"utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/,"").replace(/;\s*$/,"")+")");

const MU=rd(BASE+"/_nac_muni_data.js");
const GEO=rd(BASE+"/_nac_muni_geo.js");
const G=rd(BASE+"/mexico_estados.geojson.js");
const P=rd(BASE+"/_nac_estatal_pop.js");
const NAME={}; G.features.forEach(f=>NAME[f.properties.clave_ent]=f.properties.nombre_corto||f.properties.nombre);
const MNM={}; GEO.features.forEach(f=>{const k=String(f.properties.k).padStart(5,"0"); MNM[k]={n:f.properties.n,e:f.properties.e};});
const SM={}; for(let c=1;c<=32;c++) SM[c]=rd(BASE+"/series_mensuales/sm_"+String(c).padStart(2,"0")+".js");
const O17=SM[17];
const L=SM[1].labels;
const MESN=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const mlabel=l=>{const [y,m]=l.split("-");return MESN[+m-1]+" de "+y;};
const STEPS=[10,20,30,40,50,60,80,100,120,150,170,200,250,300,400,500,600,800,1000,1200,1500,2000,2500,3000,4000,5000,6000,8000,10000,12000,15000,20000,25000,30000];
const niceMax=m=>{for(const s of STEPS) if(m<=s) return s; return Math.ceil(m/10000)*10000;};
const fR=r=> r>=0.1||r===0 ? r.toFixed(1) : r.toFixed(2);   // tasas diminutas: '0.0' parece error
const polysOf=g=> (g.geometry?g.geometry:g).type==="Polygon"?(g.geometry?g.geometry:g).coordinates&&[(g.geometry?g.geometry:g).coordinates]:(g.geometry?g.geometry:g).coordinates;

// ---- proyección Morelos (municipal) ----
const feats=GEO.features.filter(f=>String(f.properties.k).padStart(5,"0").startsWith("17"));
{var m_xmin=999,m_xmax=-999,m_ymin=999,m_ymax=-999;}
const pOf=ft=> ft.geometry.type==="Polygon"?[ft.geometry.coordinates]:ft.geometry.coordinates;
feats.forEach(ft=>pOf(ft).forEach(poly=>poly[0].forEach(([x,y])=>{m_xmin=Math.min(m_xmin,x);m_xmax=Math.max(m_xmax,x);m_ymin=Math.min(m_ymin,y);m_ymax=Math.max(m_ymax,y);})));
const m_xcorr=Math.cos((m_ymin+m_ymax)/2*Math.PI/180);
const mMW=680,mMH=680,m_pad=18;
const m_xext=(m_xmax-m_xmin)*m_xcorr, m_yext=(m_ymax-m_ymin);
const m_scale=Math.min((mMW-2*m_pad)/m_xext,(mMH-2*m_pad)/m_yext);
const m_OX=(mMW-m_xext*m_scale)/2, m_OY=(mMH-m_yext*m_scale)/2;
const m_px=lon=>m_OX+(lon-m_xmin)*m_xcorr*m_scale, m_py=lat=>m_OY+(m_ymax-lat)*m_scale;
const m_pathFor=ft=>{let d="";pOf(ft).forEach(poly=>{const r=poly[0];d+="M"+r.map(([x,y])=>m_px(x).toFixed(1)+","+m_py(y).toFixed(1)).join("L")+"Z";});return d;};
const mname={}; feats.forEach(f=>mname[String(f.properties.k).padStart(5,"0")]=f.properties.n);
const mvalues=delito=>{const di=MU.delitos.indexOf(delito);const o={};feats.forEach(f=>{const k=String(f.properties.k).padStart(5,"0");o[k]=(MU.d[k]&&MU.d[k][di]?MU.d[k][di][11]:0)||0;});return o;};

// ---- proyección nacional (32 estados) ----
{var n_xmin=999,n_xmax=-999,n_ymin=999,n_ymax=-999;}
const gOf=f=> f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates;
G.features.forEach(f=>gOf(f).forEach(poly=>poly[0].forEach(([x,y])=>{n_xmin=Math.min(n_xmin,x);n_xmax=Math.max(n_xmax,x);n_ymin=Math.min(n_ymin,y);n_ymax=Math.max(n_ymax,y);})));
const n_xcorr=Math.cos((n_ymin+n_ymax)/2*Math.PI/180);
const nMW=1004,nMH=700,n_pad=10;
const n_xext=(n_xmax-n_xmin)*n_xcorr, n_yext=(n_ymax-n_ymin);
const n_scale=Math.min((nMW-2*n_pad)/n_xext,(nMH-2*n_pad)/n_yext);
const n_OX=(nMW-n_xext*n_scale)/2, n_OY=(nMH-n_yext*n_scale)/2;
const n_px=lon=>n_OX+(lon-n_xmin)*n_xcorr*n_scale, n_py=lat=>n_OY+(n_ymax-lat)*n_scale;
const n_pathFor=f=>{let d="";gOf(f).forEach(poly=>{const r=poly[0];d+="M"+r.map(([x,y])=>n_px(x).toFixed(1)+","+n_py(y).toFixed(1)).join("L")+"Z";});return d;};
function n_centroid(f){let best=null,ba=-1;gOf(f).forEach(poly=>{const r=poly[0];let a=0,cx=0,cy=0;for(let i=0;i<r.length-1;i++){const [x1,y1]=r[i],[x2,y2]=r[i+1];const cr=x1*y2-x2*y1;a+=cr;cx+=(x1+x2)*cr;cy+=(y1+y2)*cr;}a*=0.5;if(Math.abs(a)>ba){ba=Math.abs(a);cx/=(6*a);cy/=(6*a);best=[n_px(cx),n_py(cy)];}});return best;}

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

// ================= LÁMINAS ESTATALES (molde batch3) =================
function mapaMunicipalHTML(C){
 const V=mvalues(C.delito); const arr=Object.values(V);
 const total=arr.reduce((a,c)=>a+c,0), maxV=Math.max(...arr)||1;
 if(total===0) throw new Error("Sin carpetas municipales 2026 para "+C.delito);
 const A=v=> v<=0?0.035:Math.max(0.06,Math.pow(v/maxV,0.72));
 const ranked=Object.entries(V).sort((a,b)=>b[1]-a[1]);
 let glow=""; ranked.slice(0,3).forEach(([k])=>{const f=feats.find(ft=>String(ft.properties.k).padStart(5,"0")===k); if(f) glow+=`<path d="${m_pathFor(f)}" fill="${C.acc}" fill-opacity="0.5" filter="url(#glow)"/>`;});
 let paths=""; feats.forEach(f=>{const k=String(f.properties.k).padStart(5,"0");paths+=`<path d="${m_pathFor(f)}" fill="${C.acc}" fill-opacity="${A(V[k]).toFixed(3)}" stroke="#2b2521" stroke-width="1"/>`;});
 // con pocas carpetas en el estado, el porcentaje engaña ("el 50%" = 1 de 2)
 // y un top-10 lleno de ceros se ve mal: se da el total desnudo y solo los
 // municipios que sí tienen carpetas
 const bajo=total<20;
 const visibles=bajo?ranked.filter(([,v])=>v>0):ranked.slice(0,10);
 const rows=visibles.map(([k,v],i)=>`<div class="row"><span class="rk">${i+1}</span><span class="nm">${mname[k]}</span><span class="barwrap"><i class="bar" style="width:${Math.max(6,Math.round(360*v/maxV))}px"></i></span><span class="val">${v.toLocaleString('es-MX')}</span></div>`).join("");
 const share1=Math.round(1000*ranked[0][1]/total)/10;
 C._share1=share1; C._muni1=mname[ranked[0][0]]; C._muni1v=ranked[0][1];
 C._totalE=total; C._bajo=bajo; C._conCarpetas=visibles.length;
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${CSS(C.acc,1580)}
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
 </style></head><body><div class="wrap">
  <div class="kick">RADIOGRAFÍA MORELOS · MAPA</div>
  <h1>El mapa ${C.art} <span class="a">${C.word}</span></h1>
  <div class="sub">Cada municipio pintado por intensidad: entre más encendido, más carpetas. Primer semestre de 2026.</div>
  <div class="legend"><span>menos</span><i class="g"></i><span>más carpetas</span></div>
  <div class="mapbox"><svg width="680" height="680" viewBox="0 0 680 680">
   <defs><filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="10"/></filter></defs>
   ${glow}${paths}</svg></div>
  <div class="lead">${bajo
   ? `En todo el estado van <b>${total.toLocaleString('es-MX')}</b> carpetas en el semestre; encabeza <b>${mname[ranked[0][0]]}</b> con <b>${ranked[0][1].toLocaleString('es-MX')}</b>.`
   : `El municipio más golpeado concentra el <b>${share1}%</b> de las carpetas de todo el estado.`}</div>
  <div class="tbl"><h2>${bajo?"Los municipios con carpetas en 2026":"Los 10 municipios con más carpetas"}</h2>${rows}</div>
  <div class="foot"><div>Fuente: <b>SESNSP</b>, datos abiertos (corte junio 2026). Cotejo propio.</div><img src="logo.png" style="height:44px;opacity:.95;display:block"></div>
 </div></body></html>`;
}

function timelineEstatalHTML(C){
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
 C._peakE=peakVal; C._peakELbl=peakLbl; C._peakEPrelim=peakPrelim;
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${CSS(C.acc,1210)}
 svg{margin-top:22px;width:952px;height:522px;align-self:center}
 .note{margin-top:26px;background:linear-gradient(180deg,#151210,#100d0b);border:1px solid var(--line);border-left:5px solid var(--acc);border-radius:14px;padding:20px 26px}
 .note p{font-size:22px;color:var(--ink);line-height:1.42} .note b{color:var(--acc);font-weight:800}
 .note .e{color:var(--mut);font-size:20px;margin-top:8px}
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

function rankingFederalHTML(C){
 const rows=[]; for(let c=1;c<=32;c++){const a=SM[c].delitos[C.delito]||[];const n=a.length;let t=0;for(let i=n-6;i<n;i++)t+=a[i]||0;const pop=(P.p[String(c)]||[])[11]||1;rows.push({c,name:NAME[c],rate:t/pop*1e5});}
 rows.sort((a,b)=>b.rate-a.rate);
 const maxR=rows[0].rate, morPos=rows.findIndex(r=>r.c===17)+1, mor=rows.find(r=>r.c===17);
 let list=""; rows.forEach((r,i)=>{const isM=r.c===17,w=Math.max(4,Math.round(360*r.rate/(maxR||1)));list+=`<div class="row${isM?' me':''}"><span class="rk">${i+1}</span><span class="nm">${r.name}</span><span class="barwrap"><i class="bar" style="width:${w}px"></i></span><span class="val">${fR(r.rate)}</span></div>`;});
 C._morPos=morPos; C._morRateE=fR(mor.rate);
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${CSS(C.acc,1620)}
 h1{font-size:54px}
 .lead{font-size:27px;color:var(--ink);margin:14px 0 8px} .lead b{color:var(--acc);font-weight:800}
 .row{display:flex;align-items:center;height:36px;border-bottom:1px solid #1a1613}
 .rk{width:40px;font-family:"JetBrains Mono","Segoe UI",monospace;font-size:18px;color:#6f665c;font-weight:700}
 .nm{width:280px;font-size:22px;font-weight:600;color:#c9c2b6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .barwrap{flex:1;display:flex;align-items:center} .bar{height:13px;border-radius:7px;background:#5c534a;display:block}
 .val{width:78px;text-align:right;font-size:22px;font-weight:700;color:#9a9086}
 .row.me{background:linear-gradient(90deg, ${C.acc}24, ${C.acc}00);border-radius:8px;border-bottom:1px solid transparent}
 .row.me .rk{color:var(--acc)} .row.me .nm{color:#fff;font-weight:800;font-size:24px}
 .row.me .bar{background:var(--acc);height:16px} .row.me .val{color:var(--acc);font-weight:900;font-size:25px}
 </style></head><body><div class="wrap">
 <div class="kick">RADIOGRAFÍA NACIONAL · RANKING</div>
 <h1>${C.art1} <span class="a">${C.word}</span>: Morelos frente a los 32 estados</h1>
 <div class="sub">Tasa de carpetas por 100 mil habitantes, enero a junio de 2026 (cifra preliminar).</div>
 <div class="lead">Morelos es el <b>#${morPos}</b> del país en ${C.word}, con una tasa de <b>${fR(mor.rate)}</b>.</div>
 <div>${list}</div>
 <div class="foot"><div>Fuente: <b>SESNSP</b> + <b>CONAPO</b> (población). Corte junio 2026, cifra preliminar. Cotejo propio.</div><img src="logo.png" style="height:44px;opacity:.95;display:block"></div>
</div></body></html>`;
}

// ================= LÁMINAS NACIONALES (molde nac2) =================
function mapaNacionalHTML(C){
 const RATE={};
 G.features.forEach(f=>{const c=f.properties.clave_ent;
  const a=SM[c].delitos[C.delito]||[]; const n=a.length; let t=0; for(let i=n-6;i<n;i++)t+=a[i]||0;
  const pop=(P.p[String(c)]||[])[11]||1; RATE[c]=t/pop*1e5;});
 const maxR=Math.max(...Object.values(RATE));
 const ranked=Object.entries(RATE).map(([c,r])=>({c:+c,r})).sort((a,b)=>b.r-a.r);
 const A=r=> r<=0?0.03:Math.max(0.07,Math.pow(r/(maxR||1),0.7));
 let glow=""; ranked.slice(0,3).forEach(o=>{const f=G.features.find(ft=>ft.properties.clave_ent===o.c);glow+=`<path d="${n_pathFor(f)}" fill="${C.acc}" fill-opacity="0.5" filter="url(#glow)"/>`;});
 let paths=""; G.features.forEach(f=>{paths+=`<path d="${n_pathFor(f)}" fill="${C.acc}" fill-opacity="${A(RATE[f.properties.clave_ent]).toFixed(3)}" stroke="#2b2521" stroke-width="1"/>`;});
 let labs=""; const puestas=[];
 ranked.slice(0,5).forEach((o,i)=>{const f=G.features.find(ft=>ft.properties.clave_ent===o.c);const cc=n_centroid(f);if(!cc)return;
  const big=i===0; const fs2=big?24:19;
  let ly=cc[1];
  while(puestas.some(p=>Math.abs(p.x-cc[0])<112 && Math.abs(p.y-ly)<48)) ly+=42;
  puestas.push({x:cc[0], y:ly});
  labs+=`<text x="${cc[0].toFixed(0)}" y="${ly.toFixed(0)}" fill="#fff" font-size="${fs2}" font-weight="${big?900:800}" text-anchor="middle" style="paint-order:stroke;stroke:#0e0c0b;stroke-width:5px">${NAME[o.c]}</text>`;
  labs+=`<text x="${cc[0].toFixed(0)}" y="${(ly+fs2).toFixed(0)}" fill="${C.acc}" font-size="${fs2-3}" font-weight="800" text-anchor="middle" style="paint-order:stroke;stroke:#0e0c0b;stroke-width:5px">${fR(o.r)}</text>`;});
 const t1=ranked[0];
 C._top1=NAME[t1.c]; C._top1rate=fR(t1.r);
 const mi=ranked.findIndex(o=>o.c===17);
 C._morRank=mi+1; C._morRate=fR(ranked[mi].r);
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
 <div class="lead"><b>${NAME[t1.c]}</b> encabeza el país, con una tasa de <b>${fR(t1.r)}</b> por cada 100 mil habitantes.</div>
 <div class="foot"><div>Fuente: <b>SESNSP</b> + <b>CONAPO</b> (población). Corte junio 2026, cifra preliminar. Cotejo propio.</div><img src="logo.png" style="height:44px;opacity:.95;display:block"></div>
</div></body></html>`;
}

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
 C._peak=peakVal.toLocaleString('es-MX'); C._peakLbl=peakLbl; C._peakPrelim=peakPrelim;
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

function top10MuniHTML(C){
 const di=MU.delitos.indexOf(C.delito);
 const r=[];
 Object.keys(MU.d).forEach(k=>{const v=(MU.d[k][di]||[])[11]||0; if(v>0){const kk=String(k).padStart(5,"0"); const m=MNM[kk]; if(m) r.push([m.n,m.e,v,kk]);}});
 r.sort((a,b)=>b[2]-a[2]);
 const top=r.slice(0,10), maxV=top[0][2];
 let list=""; top.forEach(([n,e,v,kk],i)=>{const isMor=kk.startsWith("17");
  list+=`<div class="row${isMor?' me':''}"><span class="rk">${i+1}</span><span class="nm">${n} <i>· ${e}</i></span><span class="barwrap"><i class="bar" style="width:${Math.max(8,Math.round(400*v/maxV))}px"></i></span><span class="val">${v.toLocaleString('es-MX')}</span></div>`;});
 C._m1n=top[0][0]; C._m1e=top[0][1]; C._m1v=top[0][2].toLocaleString('es-MX');
 const morIn=top.findIndex(t=>t[3].startsWith("17"));
 C._morTop=morIn>=0?{pos:morIn+1,n:top[morIn][0]}:null;
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

// ================= CAPTIONS =================
function capitalizar(s){return s.charAt(0).toUpperCase()+s.slice(1);}

function captionManana(C){
 const peakNote=C._peakEPrelim?" (mes aún preliminar)":"";
 const sugerida=C._morPos<=3?"la federal (ranking, gancho #"+C._morPos+" nacional)":"el mapa";
 const artlow=C.art1.toLowerCase();
 return `🎠 CARRUSEL (3 láminas) · 1ª sugerida: ${sugerida}

🔴 ${C.art1} ${C.word} en Morelos, en 3 escalas.

Un mismo delito, de tu cuadra al mapa nacional 👇

🗺️ DÓNDE: ${C._bajo
 ? `en todo el estado van ${C._totalE.toLocaleString('es-MX')} carpetas en el semestre; encabeza ${C._muni1} con ${C._muni1v.toLocaleString('es-MX')}.`
 : `${C._muni1} concentra el ${C._share1}% de las carpetas del estado (${C._muni1v.toLocaleString('es-MX')} en el semestre).`}
📈 CUÁNDO: el mes con más carpetas fue ${C._peakELbl}, con ${C._peakE} en un solo mes${peakNote}.
📊 EL PAÍS: Morelos, #${C._morPos} de los 32 estados (tasa ${C._morRateE}).

👉 Desliza para ver las 3 láminas.
🔎 Revisa ${artlow} ${C.word} en tu municipio, con mapa: https://45digitalnoticias.github.io/Inseguridad-Mexico/municipio.html
📲 facebook.com/45DigitalMx

(Los meses de 2026 son cifra preliminar.)

#Morelos #${C.tag} #Seguridad #Datos #45DigitalNoticias
`;
}

function captionNoche(C){
 const peakNote=C._peakPrelim?" (mes aún preliminar)":"";
 const morMuni=C._morTop?` ${C._morTop.n} mete a Morelos al top-10 (#${C._morTop.pos}).`:"";
 const mapaLinea = C._morRank===1
  ? `Morelos encabeza la tasa nacional (${C._morRate}): el #1 del país en este delito.`
  : `${C._top1} encabeza la tasa nacional (${C._top1rate}); Morelos es #${C._morRank} (${C._morRate}).`;
 return `🎠 CARRUSEL (4 láminas) · 1ª sugerida: el mapa nacional
📌 NOCHE nacional del delito ${C.folder} (su mañana estatal sale el mismo día).

🌙 ${C.art1} ${C.word} en México, en 4 láminas.

En la mañana lo viste en Morelos; ahora el país completo, y dónde queda Morelos adentro 👇

🗺️ EL PAÍS: ${mapaLinea}
📍 MORELOS: ${C._bajo
 ? `apenas ${C._totalE.toLocaleString('es-MX')} carpetas en el semestre en todo el estado; encabeza ${C._muni1}.`
 : `${C._muni1} concentra el ${C._share1}% de las carpetas del estado.`}
📈 CUÁNDO: la curva mes a mes desde 2015; el pico fue ${C._peakLbl}, con ${C._peak} carpetas en un solo mes${peakNote}.
🏙️ MUNICIPIOS: encabeza ${C._m1n} (${C._m1e}), con ${C._m1v} carpetas en el semestre.${morMuni}

👉 Desliza para ver las 4 láminas.
🔎 Compara tu estado y tu municipio en el panel: https://45digitalnoticias.github.io/Inseguridad-Mexico/
📲 facebook.com/45DigitalMx

#México #${C.tag} #Seguridad #Datos #45DigitalNoticias
`;
}

// ================= CATÁLOGO (tanda vigente; las anteriores ya corrieron) =================
// Tanda 1 (24-29, corrida el 14-ago-2026): Secuestro, Acoso sexual, Robo de
// autopartes, Robo a transportista, Robo de ganado, Trata de personas.
// Feminicidio queda fuera A PROPÓSITO: con el estándar SCJN de la casa (solo
// ~1 de 4 asesinatos de mujeres se clasifica así) merece pieza propia, no
// este molde genérico.
const CR=[
 {num:"30", delito:"Robo en transporte público colectivo", word:"robo en transporte colectivo", art:"del", art1:"El", acc:"#ff8c42", tag:"RoboEnTransporte", folder:"30 - Robo en transporte colectivo"},
 {num:"31", delito:"Corrupción de menores",  word:"corrupción de menores",  art:"de la",  art1:"La",  acc:"#b784f5", tag:"CorrupcionDeMenores", folder:"31 - Corrupcion de menores"},
 // Violencia de género (distinta a la familiar) quedó FUERA: Morelos registra
 // 0 carpetas en 2026 en esa etiqueta (caen en violencia familiar u otras).
 {num:"32", delito:"Contra el medio ambiente", word:"delitos ambientales", art:"de los", art1:"Los", acc:"#3ec9a7", tag:"DelitosAmbientales", folder:"32 - Delitos ambientales"},
 {num:"33", delito:"Robo de maquinaria",     word:"robo de maquinaria",     art:"del",    art1:"El",  acc:"#ffc93c", tag:"RoboDeMaquinaria", folder:"33 - Robo de maquinaria"},
 {num:"34", delito:"Robo a institución bancaria", word:"robo a banco",      art:"del",    art1:"El",  acc:"#4aa3ff", tag:"RoboABanco", folder:"34 - Robo a banco"},
 {num:"35", delito:"Electorales",            word:"delitos electorales",    art:"de los", art1:"Los", acc:"#7ce07a", tag:"DelitosElectorales", folder:"35 - Delitos electorales"},
];

let manifest=[];
CR.forEach(C=>{
 if(!SM[17].delitos[C.delito]) throw new Error("Llave inexistente en series: "+C.delito);
 if(MU.delitos.indexOf(C.delito)<0) throw new Error("Llave inexistente en matriz municipal: "+C.delito);
 const dirBase=COMBOS+"/"+C.folder+" — PUBLICAR PAR";
 const dirM=dirBase+"/MAÑANA estatal", dirN=dirBase+"/NOCHE nacional";
 fs.mkdirSync(dirM,{recursive:true}); fs.mkdirSync(dirN,{recursive:true});
 fs.copyFileSync(LOGO, dirM+"/logo.png"); fs.copyFileSync(LOGO, dirN+"/logo.png");
 // mañana (3)
 const mFiles=[["1-mapa-municipal", mapaMunicipalHTML(C), 1580],
               ["2-timeline-estatal", timelineEstatalHTML(C), 1210],
               ["3-ranking-federal", rankingFederalHTML(C), 1620]];
 mFiles.forEach(([b,h,alto])=>{fs.writeFileSync(dirM+"/"+b+".html",h,"utf8");manifest.push(dirM+"/"+b+".html|"+dirM+"/"+b+".png|1080|"+alto);});
 // noche (4): la 2ª es el MISMO mapa municipal; se copia el PNG tras el render
 const nFiles=[["1-mapa-nacional", mapaNacionalHTML(C), 1200],
               ["3-timeline-nacional", timelineNacionalHTML(C), 1210],
               ["4-top10-municipios", top10MuniHTML(C), 1350]];
 nFiles.forEach(([b,h,alto])=>{fs.writeFileSync(dirN+"/"+b+".html",h,"utf8");manifest.push(dirN+"/"+b+".html|"+dirN+"/"+b+".png|1080|"+alto);});
 fs.writeFileSync(dirM+"/caption.txt", captionManana(C), "utf8");
 fs.writeFileSync(dirN+"/caption.txt", captionNoche(C), "utf8");
 console.log(C.folder+"  OK  Morelos federal #"+C._morPos+" ("+C._morRateE+")  nac #1: "+C._top1+" ("+C._top1rate+")  muni Mor: "+C._muni1+" "+C._share1+"%  muni nac: "+C._m1n+" "+C._m1v);
});
fs.writeFileSync(BASE+"/_manifest_combo_par.txt", manifest.join("\n")+"\n", "utf8");
console.log("manifest: "+manifest.length+" htmls (la lámina 2 de cada noche se copia del mapa municipal)");
