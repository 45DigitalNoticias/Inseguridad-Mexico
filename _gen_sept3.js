// ============================================================================
// SEPTIEMBRE 2026 — 3 publicaciones al día (MUNICIPAL / ESTATAL / NACIONAL)
// Regla nueva del 29-ago-2026: se acaba el par mañana/noche del mismo delito.
// Ahora cada día son TRES posts, cada uno de su propia escala, su propio
// delito y su propio formato gráfico. Nada se repite: ni el par delito+escala
// en el mes, ni el delito dentro de la semana, ni el formato dentro de la
// escala en la semana.
// Cada publicación = 2 láminas (protagonista + apoyo) de 1080x1350, que se
// renderizan al doble (2160x2700) para que la imagen aguante el zoom.
// Moldes heredados de _gen_combo_par.js; corte actualizado a JULIO 2026.
// ============================================================================
const fs=require("fs"), path=require("path");
const BASE="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const GS="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/PROGRAMACIÓN FACEBOOK/GRÁFICAS SEMANALES";
const RAIZ=GS+"/2026-09 Inseguridad (3 al dia)";
const LOGO=GS+"/2026-08 Inseguridad Morelos (FB)/3 MAPAS sueltos/Semana 1/logo.png";
const rd=f=>eval("("+fs.readFileSync(f,"utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/,"").replace(/;\s*$/,"")+")");

const MU=rd(BASE+"/_nac_muni_data.js");
const GEO=rd(BASE+"/_nac_muni_geo.js");
const G=rd(BASE+"/mexico_estados.geojson.js");
const P=rd(BASE+"/_nac_estatal_pop.js");
const PM=rd(BASE+"/_nac_muni_pop.js"); const PMp=PM.p||PM;
const NAME={}; G.features.forEach(f=>NAME[f.properties.clave_ent]=f.properties.nombre_corto||f.properties.nombre);
// en una lamina titulada "en Mexico", un estado llamado "Mexico" se lee como el pais
NAME[15]="Edo. de México";
const MNM={}; GEO.features.forEach(f=>{const k=String(f.properties.k).padStart(5,"0"); MNM[k]={n:f.properties.n,e:f.properties.e};});
const SM={}; for(let c=1;c<=32;c++) SM[c]=rd(BASE+"/series_mensuales/sm_"+String(c).padStart(2,"0")+".js");
const O17=SM[17], L=SM[1].labels, NL=L.length;
const M26=SM[1].meses_2026;                 // meses cerrados de 2026 (7 = ene-jul)
const IDX26=L.indexOf("2026-01");           // primer mes preliminar
const IDX25=L.indexOf("2025-01");           // para comparar mismos meses
const AI26=MU.anios.length-1;               // índice del acumulado 2026 en la matriz municipal
const AI25=MU.anios.indexOf("2025");
const MESN=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const MESC=["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const PERIODO="enero a julio de 2026";
const CORTE="corte julio 2026";
const mlabel=l=>{const [y,m]=l.split("-");return MESN[+m-1]+" de "+y;};
const nf=v=>Math.round(v).toLocaleString("es-MX");
const fR=r=> r>=10?r.toFixed(1) : (r>=0.1||r===0 ? r.toFixed(1) : r.toFixed(2));
const STEPS=[5,10,20,30,40,50,60,80,100,120,150,170,200,250,300,400,500,600,800,1000,1200,1500,2000,2500,3000,4000,5000,6000,8000,10000,12000,15000,20000,25000,30000,40000,50000];
const niceMax=m=>{for(const s of STEPS) if(m<=s) return s; return Math.ceil(m/10000)*10000;};
const kfmt=v=>v>=1000?(v/1000).toFixed(v%1000===0?0:1)+" mil":nf(v);

// ---------------- datos ----------------
const serieEdo =(d,c)=> (SM[c].delitos[d]||new Array(NL).fill(0));
const serieNac = d =>{const a=new Array(NL).fill(0);for(let c=1;c<=32;c++){const s=SM[c].delitos[d];if(s)for(let i=0;i<NL;i++)a[i]+=s[i]||0;}return a;};
const acum=(a,ini,n)=>{let t=0;for(let i=ini;i<ini+n;i++)t+=a[i]||0;return t;};
const popEdo=c=>(P.p[String(c)]||[])[11]||1;
const popEdo25=c=>(P.p[String(c)]||[])[10]||1;
const popMuni=k=>{const a=PMp[String(+k)]||PMp[k]||[];return a[11]||a[a.length-1]||1;};
const featsMor=GEO.features.filter(f=>String(f.properties.k).padStart(5,"0").startsWith("17"));
const mname={}; featsMor.forEach(f=>mname[String(f.properties.k).padStart(5,"0")]=f.properties.n);
function muniMor(delito,ai){const di=MU.delitos.indexOf(delito);const o={};featsMor.forEach(f=>{const k=String(f.properties.k).padStart(5,"0");o[k]=(MU.d[k]&&MU.d[k][di]?MU.d[k][di][ai]:0)||0;});return o;}
function muniPais(delito,ai){const di=MU.delitos.indexOf(delito);const r=[];Object.keys(MU.d).forEach(k=>{const v=(MU.d[k][di]||[])[ai]||0;if(v>0){const kk=String(k).padStart(5,"0");const m=MNM[kk];if(m)r.push({k:kk,n:m.n,e:m.e,v});}});return r.sort((a,b)=>b.v-a.v);}
function tasasEdo(delito){const r=[];for(let c=1;c<=32;c++){const t=acum(serieEdo(delito,c),IDX26,M26);r.push({c,name:NAME[c],v:t,rate:t/popEdo(c)*1e5});}return r.sort((a,b)=>b.rate-a.rate);}

// ---------------- proyecciones ----------------
function proyeccion(features,W,H,pad){
 let xmin=999,xmax=-999,ymin=999,ymax=-999;
 const pOf=ft=> ft.geometry.type==="Polygon"?[ft.geometry.coordinates]:ft.geometry.coordinates;
 features.forEach(ft=>pOf(ft).forEach(poly=>poly[0].forEach(([x,y])=>{xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);})));
 const xcorr=Math.cos((ymin+ymax)/2*Math.PI/180);
 const xext=(xmax-xmin)*xcorr, yext=(ymax-ymin);
 const scale=Math.min((W-2*pad)/xext,(H-2*pad)/yext);
 const OX=(W-xext*scale)/2, OY=(H-yext*scale)/2;
 const px=lon=>OX+(lon-xmin)*xcorr*scale, py=lat=>OY+(ymax-lat)*scale;
 const pathFor=ft=>{let d="";pOf(ft).forEach(poly=>{const r=poly[0];d+="M"+r.map(([x,y])=>px(x).toFixed(1)+","+py(y).toFixed(1)).join("L")+"Z";});return d;};
 const centroid=ft=>{let best=null,ba=-1;pOf(ft).forEach(poly=>{const r=poly[0];let a=0,cx=0,cy=0;for(let i=0;i<r.length-1;i++){const [x1,y1]=r[i],[x2,y2]=r[i+1];const cr=x1*y2-x2*y1;a+=cr;cx+=(x1+x2)*cr;cy+=(y1+y2)*cr;}a*=0.5;if(Math.abs(a)>ba){ba=Math.abs(a);cx/=(6*a);cy/=(6*a);best=[px(cx),py(cy)];}});return best;};
 return {pathFor,centroid,W,H};
}
const PR_MOR=proyeccion(featsMor,880,790,6);
const PR_NAC=proyeccion(G.features,968,700,6);

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

// CALENDARIO de estacionalidad (anios x meses)
function P_calendario({filas,acc,maxV}){
 const cell=62, gap=6, x0=104;
 const AW=x0+12*(cell+gap), AH=34+filas.length*(cell+gap)+10;
 let out=`<svg width="${AW}" height="${AH}" viewBox="0 0 ${AW} ${AH}">`;
 MESC.forEach((m,i)=>{out+=`<text x="${x0+i*(cell+gap)+cell/2}" y="20" fill="#8a8177" font-size="15" font-weight="700" text-anchor="middle">${m}</text>`;});
 filas.forEach((f,r)=>{
  const y=34+r*(cell+gap);
  out+=`<text x="${x0-14}" y="${y+cell/2+6}" fill="${f.prelim?"#c9c2b6":"#8a8177"}" font-size="17" font-weight="${f.prelim?800:700}" text-anchor="end">${f.n}${f.prelim?"*":""}</text>`;
  f.v.forEach((v,i)=>{
   const x=x0+i*(cell+gap);
   if(v===null){out+=`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="7" fill="#141110" stroke="#1e1a17"/>`;return;}
   const op=v<=0?0.05:Math.max(0.09,Math.pow(v/maxV,0.75));
   out+=`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="7" fill="${acc}" fill-opacity="${op.toFixed(3)}" stroke="#241f1b"/>`;
   if(v/maxV>0.62) out+=`<text x="${x+cell/2}" y="${y+cell/2+6}" fill="#0e0c0b" font-size="16" font-weight="900" text-anchor="middle">${v}</text>`;});});
 return out+`</svg>`;
}

// DUELO entre dos plazas
function P_duelo({a,b,acc,unidad}){
 const max=Math.max(a.v,b.v)||1;
 const caja=(o,principal)=>`<div class="duelo ${principal?"pri":""}">
   <div class="dtit">${o.n}</div>
   <div><div class="dcif">${nf(o.v)}</div><div class="dun">${unidad}</div></div>
   <div><div class="dbarra"><i style="width:${Math.max(6,Math.round(100*o.v/max))}%"></i></div>
   <div class="dpie">${o.pie}</div></div></div>`;
 return `<div style="display:flex;gap:26px;align-items:stretch;height:730px;margin:auto 0">${caja(a,a.v>=b.v)}${caja(b,b.v>a.v)}</div>`;
}
const CSS_DUELO=acc=>`
 .duelo{flex:1;background:linear-gradient(180deg,#151210,#100d0b);border:1px solid #2a2521;border-radius:18px;padding:52px 34px 46px;display:flex;flex-direction:column;justify-content:space-between}
 .duelo.pri{border-color:${acc}66;box-shadow:0 0 0 1px ${acc}22 inset}
 .dtit{font-size:34px;font-weight:800;color:#f1eadb;margin-bottom:10px}
 .dcif{font-family:"Bricolage Grotesque","Hanken Grotesk",sans-serif;font-size:128px;font-weight:800;line-height:1;color:#5c534a;letter-spacing:-3px}
 .duelo.pri .dcif{color:${acc}}
 .dun{font-size:19px;color:#9a9086;font-weight:700;margin-top:4px}
 .dbarra{height:16px;border-radius:8px;background:#1c1815;margin:30px 0 22px;overflow:hidden}
 .dbarra i{display:block;height:16px;border-radius:8px;background:#5c534a}
 .duelo.pri .dbarra i{background:${acc}}
 .dpie{font-size:21px;color:#c9c2b6;line-height:1.34}`;

// CIFRA gigante con tres apoyos
function P_cifra({cifra,unidad,apoyos,acc}){
 return `<div style="text-align:center">
  <div class="gig">${cifra}</div>
  <div class="gun">${unidad}</div>
  <div class="tres">${apoyos.map(a=>`<div class="ap"><div class="apv">${a.v}</div><div class="apn">${a.n}</div></div>`).join("")}</div></div>`;
}
const CSS_CIFRA=acc=>`
 .gig{font-family:"Bricolage Grotesque","Hanken Grotesk",sans-serif;font-size:280px;font-weight:800;line-height:.92;color:${acc};letter-spacing:-10px}
 .gun{font-size:27px;color:#c9c2b6;font-weight:700;margin-top:10px}
 .tres{display:flex;gap:20px;margin-top:44px}
 .ap{flex:1;background:linear-gradient(180deg,#151210,#100d0b);border:1px solid #2a2521;border-radius:15px;padding:22px 16px}
 .apv{font-size:46px;font-weight:800;color:#f1eadb;line-height:1}
 .apn{font-size:18px;color:#9a9086;font-weight:700;margin-top:8px;line-height:1.28}`;

// WAFFLE: de cada 100 carpetas del pais, cuantas pone cada estado
function P_waffle({partes,acc}){
 const cell=76, gap=8;
 let celdas=[], i=0;
 partes.forEach(p=>{for(let k=0;k<p.n;k++) celdas.push(p);});
 while(celdas.length<100) celdas.push(partes[partes.length-1]);
 celdas=celdas.slice(0,100);
 let out=`<svg width="${10*(cell+gap)}" height="${10*(cell+gap)}" viewBox="0 0 ${10*(cell+gap)} ${10*(cell+gap)}">`;
 celdas.forEach((p,idx)=>{
  const x=(idx%10)*(cell+gap), y=Math.floor(idx/10)*(cell+gap);
  out+=`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="10" fill="${p.color}" fill-opacity="${p.op||1}"/>`;});
 out+=`</svg>`;
 const leg=`<div style="display:flex;flex-wrap:wrap;gap:14px 26px;justify-content:center;margin-top:22px;font-size:20px;color:#c9c2b6;font-weight:700">`+
  partes.map(p=>`<span><i style="display:inline-block;width:17px;height:17px;border-radius:5px;background:${p.color};opacity:${p.op||1};margin-right:9px;vertical-align:-2px"></i>${p.n} de cada 100 · ${p.et}</span>`).join("")+`</div>`;
 return out+leg;
}

// ============================================================================
// LÁMINAS MUNICIPALES (Morelos, 36 municipios, acumulado enero-julio 2026)
// ============================================================================
const CUAUTLA="17006", CUERNAVACA="17007";
function datosMuni(C){
 const V=muniMor(C.delito,AI26);
 const rank=Object.entries(V).map(([k,v])=>({k,n:mname[k],v,tasa:v/popMuni(k)*1e5})).sort((a,b)=>b.v-a.v);
 const total=rank.reduce((a,c)=>a+c.v,0);
 if(total===0) throw new Error("Sin carpetas municipales 2026 en Morelos para "+C.delito);
 const conCarpetas=rank.filter(r=>r.v>0);
 C._totalMor=total; C._muni1=rank[0].n; C._muni1v=rank[0].v;
 C._share1=Math.round(1000*rank[0].v/total)/10;
 C._bajo=total<20; C._conCarpetas=conCarpetas.length;
 const porTasa=[...conCarpetas].sort((a,b)=>b.tasa-a.tasa);
 C._tasa1=porTasa[0];
 return {V,rank,total,conCarpetas,porTasa};
}

function L_mapaMorelos(C,modo){
 const D=datosMuni(C);
 const porTasa=modo==="tasa";
 const val=f=>{const k=String(f.properties.k).padStart(5,"0"); const o=D.rank.find(r=>r.k===k); return porTasa?(o?o.tasa:0):(o?o.v:0);};
 const cuerpo=P_mapa({pr:PR_MOR,features:featsMor,valor:val,acc:C.acc,etiquetas:4,
  keyOf:f=>String(f.properties.k).padStart(5,"0"),nombreOf:f=>f.properties.n,
  fmt:v=>porTasa?fR(v):nf(v)});
 const lider=porTasa?D.porTasa[0]:D.rank[0];
 const nota=porTasa
  ? `<p>Medido por habitante, el municipio más golpeado es <b>${lider.n}</b>: <b>${fR(lider.tasa)}</b> carpetas por cada 100 mil.</p>
     <p class="e">El mapa por tasa cambia el retrato: los municipios chicos con pocos casos pueden pesar más que la capital. Los meses de 2026 son cifra preliminar.</p>`
  : `<p>${C._bajo?`En todo el estado van <b>${nf(D.total)}</b> carpetas; encabeza <b>${D.rank[0].n}</b> con <b>${nf(D.rank[0].v)}</b>.`
      :`<b>${D.rank[0].n}</b> concentra el <b>${C._share1}%</b> de las carpetas del estado: <b>${nf(D.rank[0].v)}</b> de ${nf(D.total)}.`}</p>
     <p class="e">Cuenta carpetas de investigación abiertas, no delitos ocurridos: donde no se denuncia, el mapa se ve tranquilo. Los meses de 2026 son cifra preliminar.</p>`;
 C._tituloTasa=porTasa;
 return shell({acc:C.acc,kick:"MORELOS · MAPA MUNICIPAL",
  h1:porTasa?`${C.art1} <span class="a">${C.word}</span> por habitante`:`El mapa ${C.art} <span class="a">${C.word}</span>`,
  sub:porTasa?`Carpetas por cada 100 mil habitantes en cada municipio, ${PERIODO}. Población CONAPO.`
             :`Cada municipio pintado por intensidad: entre más encendido, más carpetas. ${capitalizar(PERIODO)}.`,
  cuerpo,nota,fuente:porTasa?FUENTE_TASA:FUENTE_MUNI});
}

function L_barrasMunicipios(C,modo){
 const D=datosMuni(C);
 const porTasa=modo==="tasa";
 const base=porTasa?D.porTasa:D.rank;
 const lista=(C._bajo?D.conCarpetas:base.slice(0,10)).slice(0,12);
 const items=lista.map(o=>({n:o.n,v:porTasa?o.tasa:o.v,on:o.k===CUAUTLA}));
 const cuerpo=P_barras({items,fmt:v=>porTasa?fR(v):nf(v)});
 const nota=porTasa
  ? `<p><b>${D.porTasa[0].n}</b> encabeza por habitante, con <b>${fR(D.porTasa[0].tasa)}</b> carpetas por cada 100 mil; en número crudo va en el lugar <b>${D.rank.findIndex(r=>r.k===D.porTasa[0].k)+1}</b>.</p>
     <p class="e">Volumen y tasa cuentan cosas distintas: uno dice dónde hay más casos, el otro dónde es más probable que te toque.</p>`
  : `<p>${C._bajo?`Solo <b>${D.conCarpetas.length}</b> de los 36 municipios registran carpetas en el periodo.`
      :`Los tres primeros juntan <b>${Math.round(1000*(D.rank[0].v+D.rank[1].v+D.rank[2].v)/D.total)/10}%</b> de las carpetas del estado.`}</p>
     <p class="e">Carpetas abiertas ${PERIODO}, cifra preliminar. Cuautla va resaltado.</p>`;
 return shell({acc:C.acc,kick:"MORELOS · MUNICIPIOS",
  h1:porTasa?`Dónde pega más ${C.art} <span class="a">${C.word}</span>, por habitante`
            :`Los municipios con más <span class="a">${C.word}</span>`,
  sub:porTasa?`Carpetas por cada 100 mil habitantes, ${PERIODO} (cifra preliminar).`
             :`Carpetas de investigación por municipio, ${PERIODO} (cifra preliminar).`,
  cuerpo,nota,fuente:porTasa?FUENTE_TASA:FUENTE_MUNI,extraCSS:CSS_BARRAS(C.acc)});
}

function L_dueloMunicipios(C){
 const D=datosMuni(C);
 const a=D.rank.find(r=>r.k===CUAUTLA), b=D.rank.find(r=>r.k===CUERNAVACA);
 const cuerpo=P_duelo({acc:C.acc,unidad:`carpetas ${PERIODO}`,
  a:{n:"Cuautla",v:a.v,pie:`${fR(a.tasa)} por cada 100 mil habitantes`},
  b:{n:"Cuernavaca",v:b.v,pie:`${fR(b.tasa)} por cada 100 mil habitantes`}});
 const gana=a.v>=b.v?"Cuautla":"Cuernavaca";
 const ganaT=a.tasa>=b.tasa?"Cuautla":"Cuernavaca";
 const vuelta=gana!==ganaT?`<p class="e">Y se voltea al medir por habitante: ahí manda <b>${ganaT}</b>. Cuernavaca tiene casi el doble de población que Cuautla.</p>`
  :`<p class="e">Cuernavaca tiene casi el doble de población que Cuautla, así que la comparación por habitante también importa.</p>`;
 C._duelo={a,b,gana,ganaT};
 return shell({acc:C.acc,kick:"MORELOS · CARA A CARA",
  h1:`Cuautla contra Cuernavaca: <span class="a">${C.word}</span>`,
  sub:`Carpetas de investigación en las dos ciudades más grandes del estado, ${PERIODO}.`,
  cuerpo,nota:`<p>Manda <b>${gana}</b> en número de carpetas: <b>${nf(Math.max(a.v,b.v))}</b> contra ${nf(Math.min(a.v,b.v))}.</p>${vuelta}`,
  fuente:FUENTE_TASA,extraCSS:CSS_DUELO(C.acc)});
}

function L_cambioMunicipios(C){
 const V26=muniMor(C.delito,AI26), V25=muniMor(C.delito,AI25);
 let items=Object.keys(V26).map(k=>{
  const r26=V26[k]/M26, r25=V25[k]/12;          // carpetas AL MES, unica comparacion honesta
  return {k,n:mname[k],r26,r25,d:r26-r25,v25:V25[k],v26:V26[k]};
 });
 // el umbral se adapta: con delitos chicos, pedir 12 carpetas deja la lamina vacia
 let UMB=12, sel0=items.filter(o=>o.v25+o.v26>=UMB);
 if(sel0.length<8){UMB=6; sel0=items.filter(o=>o.v25+o.v26>=UMB);}
 if(sel0.length<5){UMB=3; sel0=items.filter(o=>o.v25+o.v26>=UMB);}
 items=sel0.sort((a,b)=>b.d-a.d);
 C._umbral=UMB;
 // con pocos municipios se muestran todos en orden; partir en dos extremos
 // dejaba una fila fuera de orden al final
 const sel = items.length<=12 ? items
   : [...items.slice(0,6),...items.slice(-6)].filter((o,i,a)=>a.findIndex(x=>x.k===o.k)===i);
 const cuerpo=P_diverge({items:sel.map(o=>({n:o.n,v:o.d})),fmt:v=>(v>=0?"+":"")+v.toFixed(1)});
 const sube=items[0], baja=items[items.length-1];
 C._cambio={sube,baja};
 return shell({acc:C.acc,kick:"MORELOS · QUIÉN SUBE Y QUIÉN BAJA",
  h1:`<span class="a">${capitalizar(C.word)}</span>: el ritmo cambió`,
  sub:`Diferencia en carpetas <b>al mes</b> entre 2025 completo y ${PERIODO}. Solo municipios con al menos ${C._umbral} carpetas sumadas entre los dos años.`,
  cuerpo,
  nota:`<p>El que más aceleró es <b>${sube.n}</b>: pasó de ${sube.r25.toFixed(1)} a <b>${sube.r26.toFixed(1)}</b> carpetas al mes. El que más bajó, <b>${baja.n}</b>, de ${baja.r25.toFixed(1)} a ${baja.r26.toFixed(1)}.</p>
   <p class="e">Se compara ritmo mensual porque 2026 solo lleva ${M26} meses; es la comparación que no infla ni desinfla. Cifra preliminar.</p>`,
  fuente:FUENTE_MUNI,extraCSS:CSS_DIVERGE});
}

function L_concentracion(C){
 const D=datosMuni(C);
 let acu=0, mitad=0;
 for(const r of D.rank){acu+=r.v; mitad++; if(acu>=D.total/2) break;}
 const items=D.rank.slice(0,12).map((r,i)=>({n:r.n,v:r.v,on:i<mitad}));
 const cuerpo=P_barras({items,fmt:nf});
 C._mitad=mitad;
 return shell({acc:C.acc,kick:"MORELOS · CONCENTRACIÓN",
  h1:`<span class="a">${mitad}</span> municipios hacen la mitad`,
  sub:`De las ${nf(D.total)} carpetas por ${C.word} del estado (${PERIODO}), la mitad se levanta en muy pocos lugares. Resaltados, los que la completan.`,
  cuerpo,
  nota:`<p>Bastan <b>${mitad}</b> de los 36 municipios para juntar el <b>50%</b> de las carpetas por ${C.word} de todo Morelos.</p>
   <p class="e">Concentración no es lo mismo que peligro: donde hay más denuncia también hay más registro. Cifra preliminar de 2026.</p>`,
  fuente:FUENTE_MUNI,extraCSS:CSS_BARRAS(C.acc)});
}

function L_tasaVsVolumen(C){
 const D=datosMuni(C);
 const top=D.porTasa.slice(0,10);
 const items=top.map(o=>({n:o.n,sub:`${nf(o.v)} carpetas`,v:o.tasa,on:o.k===D.rank[0].k}));
 const cuerpo=P_barras({items,fmt:fR,nombreAncho:380});
 const cap=D.rank[0], chico=top.find(o=>o.k!==D.rank[0].k&&o.v<cap.v/3)||top[0];
 return shell({acc:C.acc,kick:"MORELOS · TASA CONTRA VOLUMEN",
  h1:`El municipio chico que sale caro`,
  sub:`Carpetas por ${C.word} por cada 100 mil habitantes, ${PERIODO}. Al lado, el número crudo de carpetas.`,
  cuerpo,
  nota:`<p><b>${chico.n}</b> tiene ${nf(chico.v)} carpetas, muchas menos que ${cap.n}, y aun así su tasa es de <b>${fR(chico.tasa)}</b> por cada 100 mil, contra ${fR(cap.tasa)} de ${cap.n}, que es el municipio con más carpetas del estado.</p>
   <p class="e">La tasa reparte entre habitantes: en municipios chicos, pocos casos pesan mucho, y por eso se lee junto al volumen, nunca sola.</p>`,
  fuente:FUENTE_TASA,extraCSS:CSS_BARRAS(C.acc)});
}

function capitalizar(s){return s.charAt(0).toUpperCase()+s.slice(1);}
const XT=[[0,"2015"],[24,"2017"],[48,"2019"],[72,"2021"],[96,"2023"],[120,"2025"]];

// ============================================================================
// LÁMINAS ESTATALES (Morelos, serie mensual 2015-2026)
// ============================================================================
function datosEdo(C){
 const s=serieEdo(C.delito,17);
 const a26=acum(s,IDX26,M26), a25=acum(s,IDX25,M26), a25full=acum(s,IDX25,12);
 const pico=s.indexOf(Math.max(...s));
 C._edo26=a26; C._edo25=a25; C._edoDelta=a25?Math.round(1000*(a26-a25)/a25)/10:0;
 C._picoV=s[pico]; C._picoLbl=mlabel(L[pico]); C._picoPrelim=pico>=IDX26;
 return {s,a26,a25,a25full,pico};
}

function L_curvaEstatal(C){
 const D=datosEdo(C);
 const cuerpo=P_linea({acc:C.acc,ancho:940,xticks:XT,marcarPico:true,
  series:[{n:"Morelos",v:D.s,prelim:IDX26,picoLbl:C._picoLbl.replace(" de "," ")}]});
 const nota=`<p>El mes con más carpetas fue <b>${C._picoLbl}</b>, con <b>${nf(C._picoV)}</b> en un solo mes${C._picoPrelim?" (mes aún preliminar)":""}.</p>
  <p class="e">Ojo con la cola: <b>los meses de 2026 son preliminares y suelen ajustarse al alza</b>. La curva muestra cuándo, no por qué.</p>`;
 return shell({acc:C.acc,kick:"MORELOS · LÍNEA DEL TIEMPO",
  h1:`${C.art1} <span class="a">${C.word}</span> en Morelos, mes a mes`,
  sub:`Carpetas de investigación al mes, de enero de 2015 a julio de 2026.`,
  cuerpo,nota,fuente:FUENTE_SESNSP});
}

function L_calendarioEstatal(C){
 const D=datosEdo(C);
 const filas=[]; let maxV=0;
 MU.anios.forEach((a,ai)=>{
  const y=a.slice(0,4), i0=L.indexOf(y+"-01"); if(i0<0) return;
  const v=[]; for(let m=0;m<12;m++){const idx=i0+m; v.push(idx<L.length&&(idx<IDX26+M26)?D.s[idx]:null);}
  v.forEach(x=>{if(x!==null)maxV=Math.max(maxV,x);});
  filas.push({n:y,v,prelim:y==="2026"});});
 const cuerpo=P_calendario({filas,acc:C.acc,maxV});
 // mes mas cargado del historico
 const porMes=new Array(12).fill(0), cnt=new Array(12).fill(0);
 filas.forEach(f=>f.v.forEach((v,m)=>{if(v!==null){porMes[m]+=v;cnt[m]++;}}));
 const prom=porMes.map((t,m)=>t/(cnt[m]||1));
 const alto=prom.indexOf(Math.max(...prom)), bajo=prom.indexOf(Math.min(...prom));
 C._mesAlto=MESN[alto]; C._mesBajo=MESN[bajo];
 return shell({acc:C.acc,kick:"MORELOS · ESTACIONALIDAD",
  h1:`¿Hay meses ${C.art} <span class="a">${C.word}</span>?`,
  sub:`Cada cuadro es un mes desde 2015: entre más encendido, más carpetas. Julio de 2026 es el último dato.`,
  cuerpo,
  nota:`<p>En promedio, el mes más cargado del año es <b>${C._mesAlto}</b> y el más ligero, <b>${C._mesBajo}</b>.</p>
   <p class="e">La estacionalidad se lee en el promedio de once años, no en un solo año. Los meses de 2026 son cifra preliminar.</p>`,
  fuente:FUENTE_SESNSP});
}

function L_aniosEstatal(C){
 const D=datosEdo(C);
 const grupos=[];
 for(let y=2015;y<=2026;y++){
  const i0=L.indexOf(y+"-01"); if(i0<0) continue;
  grupos.push({n:String(y).slice(2),v:[acum(D.s,i0,M26)],prelim:y===2026});}
 const cuerpo=P_columnas({grupos,series:[{n:"enero-julio",color:C.acc}],leyenda:false});
 const v26=grupos[grupos.length-1].v[0], v15=grupos[0].v[0];
 const maxG=grupos.reduce((a,b)=>b.v[0]>a.v[0]?b:a);
 C._anioAlto="20"+maxG.n; C._anioAltoV=maxG.v[0];
 return shell({acc:C.acc,kick:"MORELOS · AÑO CONTRA AÑO",
  h1:`Once años de <span class="a">${C.word}</span>, mismos meses`,
  sub:`Carpetas de enero a julio de cada año, para que la comparación sea pareja. 2026 marcado como preliminar.`,
  cuerpo,
  nota:`<p>El peor enero-julio fue el de <b>${C._anioAlto}</b>, con <b>${nf(C._anioAltoV)}</b> carpetas. En 2026 van <b>${nf(v26)}</b>${v26>v15?", por encima":", por debajo"} de las ${nf(v15)} de 2015.</p>
   <p class="e">Se comparan los mismos siete meses de cada año: si se pusiera 2026 completo contra años enteros, la caída sería del calendario, no del delito.</p>`,
  fuente:FUENTE_SESNSP});
}

function L_comparativo2526(C){
 const D=datosEdo(C);
 const grupos=[];
 for(let m=0;m<M26;m++) grupos.push({n:MESC[m],v:[D.s[IDX25+m],D.s[IDX26+m]]});
 const cuerpo=P_columnas({grupos,series:[{n:"2025",color:"#5c534a"},{n:"2026*",color:C.acc}]});
 const dif=C._edoDelta;
 let peores=0; for(let m=0;m<M26;m++) if(D.s[IDX26+m]>D.s[IDX25+m]) peores++;
 return shell({acc:C.acc,kick:"MORELOS · 2025 CONTRA 2026",
  h1:`<span class="a">${capitalizar(C.word)}</span>: mes contra mes`,
  sub:`Los mismos siete meses de 2025 y de 2026 en Morelos, uno junto al otro.`,
  cuerpo,
  nota:`<p>En lo que va de 2026 van <b>${nf(D.a26)}</b> carpetas contra ${nf(D.a25)} del año pasado: <b>${dif>=0?"+":""}${fR(dif)}%</b>. ${peores===M26?`Los ${M26} meses salieron`:`${peores} de los ${M26} meses salieron`} peor que su equivalente de 2025.</p>
   <p class="e">2026 es cifra preliminar y suele ajustarse al alza, así que la diferencia real puede ser mayor, no menor.</p>`,
  fuente:FUENTE_SESNSP});
}

function L_cifraEstatal(C){
 const D=datosEdo(C);
 const dias=Math.round(30.4*M26);
 const cada=(dias*24)/D.a26;
 const cadaTxt=cada>=24?`una cada ${(cada/24).toFixed(1)} días`:(cada>=1?`una cada ${cada.toFixed(1)} horas`:`${(1/cada).toFixed(1)} por hora`);
 const V=muniMor(C.delito,AI26);
 const top=Object.entries(V).sort((a,b)=>b[1]-a[1])[0];
 const cuerpo=P_cifra({acc:C.acc,cifra:nf(D.a26),unidad:`carpetas por ${C.word} en Morelos, ${PERIODO}`,
  apoyos:[{v:capitalizar(cadaTxt.replace(/^una /,"").replace(/^(\d)/,"cada $1")),n:"se abre una carpeta"},
          {v:(C._edoDelta>=0?"+":"")+fR(C._edoDelta)+"%",n:"contra los mismos meses de 2025"},
          {v:mname[top[0]],n:`encabeza con ${nf(top[1])} carpetas`}]});
 return shell({acc:C.acc,kick:"MORELOS · LA CIFRA",
  h1:`Lo que va del año en <span class="a">${C.word}</span>`,
  sub:`Carpetas de investigación abiertas en Morelos, ${PERIODO} (cifra preliminar).`,
  cuerpo,
  nota:`<p>Son <b>${nf(D.a26)}</b> carpetas en ${M26} meses: ${cadaTxt}. Contra el mismo tramo de 2025, <b>${C._edoDelta>=0?"+":""}${fR(C._edoDelta)}%</b>.</p>
   <p class="e">Carpetas abiertas, no delitos ocurridos: la ENVIPE del INEGI calcula que más del 90% de los delitos no se denuncia.</p>`,
  fuente:FUENTE_SESNSP,extraCSS:CSS_CIFRA(C.acc)});
}

function L_pesoNacional(C){
 const sMor=serieEdo(C.delito,17), sNac=serieNac(C.delito);
 const items=[];
 for(let y=2015;y<=2026;y++){
  const i0=L.indexOf(y+"-01"); if(i0<0) continue;
  const n=(y===2026)?M26:12;
  const m=acum(sMor,i0,n), t=acum(sNac,i0,n);
  items.push({n:String(y),v:t?100*m/t:0,on:y===2026});}
 const popNac=Object.keys(P.p).reduce((a,k)=>a+((P.p[k]||[])[11]||0),0);
 const pesoPob=100*popEdo(17)/popNac;
 const cuerpo=P_barras({items:items.map(i=>({n:i.n,v:i.v,on:i.on,rk:""})),fmt:v=>fR(v)+"%",nombreAncho:110});
 const ult=items[items.length-1].v;
 C._peso=fR(ult); C._pesoPob=fR(pesoPob);
 return shell({acc:C.acc,kick:"MORELOS · PESO EN EL PAÍS",
  h1:`Cuánto pone Morelos ${C.art} <span class="a">${C.word}</span> del país`,
  sub:`Porcentaje de las carpetas del país que se levantan en Morelos, año por año.`,
  cuerpo,
  nota:`<p>En 2026 Morelos aporta el <b>${fR(ult)}%</b> de las carpetas del país por ${C.word}, con <b>${fR(pesoPob)}%</b> de la población nacional.</p>
   <p class="e">Arriba de su peso poblacional significa que el estado aporta más de lo que le tocaría por tamaño; abajo, menos. También pesa cuánto se denuncia en cada entidad.</p>`,
  fuente:FUENTE_TASA,extraCSS:CSS_BARRAS(C.acc)});
}

function L_morelosVsMedia(C){
 const sMor=serieEdo(C.delito,17), sNac=serieNac(C.delito);
 const popNac=Object.keys(P.p).reduce((a,k)=>a+((P.p[k]||[])[11]||0),0);
 const tMor=sMor.map(v=>v/popEdo(17)*1e5), tNac=sNac.map(v=>v/popNac*1e5);
 const cuerpo=P_linea({acc:C.acc,ancho:940,xticks:XT,fmtY:v=>fR(v),
  series:[{n:"Morelos",v:tMor,prelim:IDX26,color:C.acc},
          {n:"Promedio del país",v:tNac,prelim:IDX26,color:"#8a8177",area:false}]});
 const mM=acum(tMor,IDX26,M26), mN=acum(tNac,IDX26,M26);
 const veces=mN?(mM/mN):0;
 C._veces=veces.toFixed(1);
 return shell({acc:C.acc,kick:"MORELOS · CONTRA EL PROMEDIO",
  h1:`Morelos y el país en <span class="a">${C.word}</span>`,
  sub:`Carpetas por cada 100 mil habitantes al mes: la línea de Morelos contra el promedio nacional.`,
  cuerpo,
  nota:`<p>En lo que va de 2026 Morelos acumula <b>${fR(mM)}</b> carpetas por cada 100 mil habitantes; el país, ${fR(mN)}. Es <b>${veces>=1?veces.toFixed(1)+" veces":"el "+Math.round(veces*100)+"%"}</b> ${veces>=1?"la tasa nacional":"de la tasa nacional"}.</p>
   <p class="e">La tasa corrige por población, que es lo único que hace comparables a estados de tamaños muy distintos. Cifra preliminar de 2026.</p>`,
  fuente:FUENTE_TASA});
}

// ============================================================================
// LÁMINAS NACIONALES (32 estados y municipios del país)
// ============================================================================
function datosNac(C){
 const R=tasasEdo(C.delito);
 const mi=R.findIndex(r=>r.c===17);
 C._morPos=mi+1; C._morRate=fR(R[mi].rate); C._morV=R[mi].v;
 C._top1=R[0].name; C._top1rate=fR(R[0].rate);
 return {R,mi};
}

function L_mapaNacional(C){
 const D=datosNac(C);
 const rate={}; D.R.forEach(r=>rate[r.c]=r.rate);
 const cuerpo=P_mapa({pr:PR_NAC,features:G.features,acc:C.acc,etiquetas:5,
  valor:f=>rate[f.properties.clave_ent]||0,
  keyOf:f=>f.properties.clave_ent,nombreOf:f=>NAME[f.properties.clave_ent],fmt:fR});
 return shell({acc:C.acc,kick:"MÉXICO · MAPA",
  h1:`El mapa ${C.art} <span class="a">${C.word}</span> en México`,
  sub:`Cada estado pintado por su tasa: carpetas por cada 100 mil habitantes, ${PERIODO} (cifra preliminar).`,
  cuerpo,
  nota:`<p><b>${D.R[0].name}</b> encabeza el país con <b>${fR(D.R[0].rate)}</b> por cada 100 mil. Morelos es el <b>#${C._morPos}</b>, con ${C._morRate}.</p>
   <p class="e">Mide denuncia registrada, no delito ocurrido: un estado puede verse bajo porque ahí se denuncia menos.</p>`,
  fuente:FUENTE_TASA});
}

function L_ranking32(C){
 const D=datosNac(C);
 const items=D.R.map((r,i)=>({n:r.name,v:r.rate,on:r.c===17,rk:i+1}));
 const cuerpo=P_barras({items,fmt:fR,columnas:2,nombreAncho:190});
 return shell({acc:C.acc,kick:"MÉXICO · RANKING",
  h1:`Morelos frente a los 32 en <span class="a">${C.word}</span>`,
  sub:`Tasa de carpetas por cada 100 mil habitantes, ${PERIODO} (cifra preliminar).`,
  cuerpo,
  nota:`<p>Morelos es el <b>#${C._morPos}</b> del país en ${C.word}, con una tasa de <b>${C._morRate}</b>; encabeza ${D.R[0].name} con ${fR(D.R[0].rate)}.</p>
   <p class="e">La tasa reparte los casos entre habitantes: sin ella, los estados grandes siempre saldrían primero.</p>`,
  fuente:FUENTE_TASA,extraCSS:CSS_BARRAS(C.acc)});
}

function L_top10Municipios(C){
 const r=muniPais(C.delito,AI26);
 const top=r.slice(0,10);
 const items=top.map(o=>({n:o.n,sub:o.e,v:o.v,on:o.k.startsWith("17")}));
 const cuerpo=P_barras({items,fmt:nf,nombreAncho:420});
 const morIn=top.findIndex(o=>o.k.startsWith("17"));
 const mor1=r.find(o=>o.k.startsWith("17"));
 const posMor=r.findIndex(o=>o.k.startsWith("17"))+1;
 C._m1n=top[0].n; C._m1e=top[0].e; C._m1v=top[0].v;
 C._morMuni=mor1?mor1.n:null; C._morMuniPos=posMor;
 return shell({acc:C.acc,kick:"MÉXICO · MUNICIPIOS",
  h1:`Los 10 municipios con más <span class="a">${C.word}</span>`,
  sub:`Carpetas de investigación en todo el país, ${PERIODO} (cifra preliminar).`,
  cuerpo,
  nota:`<p>Encabeza <b>${top[0].n}</b> (${top[0].e}), con <b>${nf(top[0].v)}</b> carpetas. ${morIn>=0?`De Morelos entra <b>${top[morIn].n}</b> en el lugar ${morIn+1}.`:`El primero de Morelos es <b>${mor1?mor1.n:"ninguno"}</b>, en el lugar ${posMor} del país.`}</p>
   <p class="e">Son municipios de tamaños muy distintos: en volumen crudo, los más poblados casi siempre encabezan.</p>`,
  fuente:FUENTE_MUNI,extraCSS:CSS_BARRAS(C.acc)});
}

function L_waffleNacional(C){
 const D=datosNac(C);
 const porVol=[...D.R].sort((a,b)=>b.v-a.v);
 const total=porVol.reduce((a,c)=>a+c.v,0);
 const COL=["#3987e5","#c98500","#d03b3b","#3ec9a7"];
 const partes=[]; let usado=0;
 porVol.slice(0,4).forEach((r,i)=>{const n=Math.max(1,Math.round(100*r.v/total)); usado+=n; partes.push({n,et:r.name,color:COL[i]});});
 const mor=porVol.find(r=>r.c===17), nMor=Math.round(100*mor.v/total);
 if(!porVol.slice(0,4).some(r=>r.c===17)&&nMor>=1){partes.push({n:nMor,et:"Morelos",color:"#9085e9"});usado+=nMor;}
 partes.push({n:Math.max(0,100-usado),et:"el resto del país",color:"#3a342e"});
 const cuerpo=P_waffle({partes,acc:C.acc});
 const posVol=porVol.findIndex(r=>r.c===17)+1;
 return shell({acc:C.acc,kick:"MÉXICO · DE CADA 100",
  h1:`De cada 100 carpetas por <span class="a">${C.word}</span>`,
  sub:`Cómo se reparten en el país las ${nf(total)} carpetas de ${PERIODO}. Cada cuadro es una de cada cien.`,
  cuerpo,
  nota:`<p><b>${porVol[0].name}</b> pone ${Math.round(100*porVol[0].v/total)} de cada 100 carpetas del país. Morelos aporta <b>${nMor<1?"menos de 1":nMor}</b> y va en el lugar <b>${posVol}</b> por volumen.</p>
   <p class="e">En volumen crudo mandan los estados más poblados; por eso al lado se lee siempre la tasa por habitante.</p>`,
  fuente:FUENTE_SESNSP});
}

function L_curvaNacional(C){
 const s=serieNac(C.delito);
 const pico=s.indexOf(Math.max(...s));
 const cuerpo=P_linea({acc:C.acc,ancho:940,xticks:XT,marcarPico:true,
  series:[{n:"México",v:s,prelim:IDX26,picoLbl:mlabel(L[pico]).replace(" de "," ")}]});
 const a26=acum(s,IDX26,M26), a25=acum(s,IDX25,M26);
 const d=a25?Math.round(1000*(a26-a25)/a25)/10:0;
 C._nacDelta=d; C._nac26=a26;
 return shell({acc:C.acc,kick:"MÉXICO · LÍNEA DEL TIEMPO",
  h1:`${C.art1} <span class="a">${C.word}</span> en el país, mes a mes`,
  sub:`Carpetas en los 32 estados, de enero de 2015 a julio de 2026.`,
  cuerpo,
  nota:`<p>El pico fue <b>${mlabel(L[pico])}</b>, con <b>${nf(s[pico])}</b> carpetas en un solo mes. En 2026 van ${nf(a26)}: <b>${d>=0?"+":""}${fR(d)}%</b> contra los mismos meses de 2025.</p>
   <p class="e">Los meses de 2026 son preliminares y suelen ajustarse al alza cuando cada fiscalía completa su reporte.</p>`,
  fuente:FUENTE_SESNSP});
}

function L_vecinos(C){
 const D=datosNac(C);
 const VEC=[17,15,09,21,12,29];
 const items=VEC.map(c=>{const r=D.R.find(x=>x.c===c);return {n:r.name,sub:nf(r.v)+" carpetas",v:r.rate,on:c===17};})
   .sort((a,b)=>b.v-a.v);
 const cuerpo=P_barras({items,fmt:fR,nombreAncho:400});
 const pos=items.findIndex(i=>i.on)+1;
 return shell({acc:C.acc,kick:"MÉXICO · LOS VECINOS",
  h1:`<span class="a">${capitalizar(C.word)}</span> en Morelos y sus vecinos`,
  sub:`Morelos, Estado de México, Ciudad de México, Puebla, Guerrero y Tlaxcala. Tasa por cada 100 mil habitantes, ${PERIODO}.`,
  cuerpo,
  nota:`<p>${pos===1
   ? `Morelos <b>encabeza</b> a sus vecinos con una tasa de <b>${C._morRate}</b>; el que sigue es ${items[1].n}, con ${fR(items[1].v)}.`
   : `Entre los seis, Morelos va en el lugar <b>${pos}</b>, con una tasa de <b>${C._morRate}</b>. Encabeza <b>${items[0].n}</b> con ${fR(items[0].v)}.`}</p>
   <p class="e">Son los estados con los que Morelos comparte frontera y corredor carretero: la comparación regional dice más que el promedio nacional.</p>`,
  fuente:FUENTE_TASA,extraCSS:CSS_BARRAS(C.acc)});
}

function L_cambioEstados(C){
 const items=[];
 for(let c=1;c<=32;c++){
  const s=serieEdo(C.delito,c);
  const a26=acum(s,IDX26,M26), a25=acum(s,IDX25,M26);
  if(a25+a26<40) continue;
  items.push({c,n:NAME[c],v:a25?100*(a26-a25)/a25:0,a26,a25});}
 items.sort((a,b)=>b.v-a.v);
 const arriba=items.slice(0,6), abajo=items.slice(-6);
 let sel=[...arriba,...abajo];
 const mor=items.find(i=>i.c===17);
 if(mor&&!sel.some(i=>i.c===17)) sel.splice(6,0,mor);
 sel=sel.filter((o,i,a)=>a.findIndex(x=>x.c===o.c)===i);
 const cuerpo=P_diverge({items:sel.map(o=>({n:o.n+(o.c===17?" ◄":""),v:o.v})),fmt:v=>(v>=0?"+":"")+fR(v)+"%"});
 C._cambioNac={sube:items[0],baja:items[items.length-1],mor};
 return shell({acc:C.acc,kick:"MÉXICO · QUIÉN SUBE Y QUIÉN BAJA",
  h1:`<span class="a">${capitalizar(C.word)}</span>: 2026 contra 2025`,
  sub:`Cambio porcentual entre enero-julio de 2025 y los mismos meses de 2026, por estado. Solo estados con volumen suficiente.`,
  cuerpo,
  nota:`<p>El que más sube es <b>${items[0].n}</b> (${fR(items[0].v)}%) y el que más baja, <b>${items[items.length-1].n}</b> (${fR(items[items.length-1].v)}%). ${mor?`Morelos: <b>${mor.v>=0?"+":""}${fR(mor.v)}%</b>.`:""}</p>
   <p class="e">Los porcentajes grandes suelen venir de bases chicas. 2026 es preliminar y tiende a ajustarse al alza, así que las bajas pueden achicarse.</p>`,
  fuente:FUENTE_SESNSP,extraCSS:CSS_DIVERGE});
}

// ---------------- registro de formatos ----------------
const FORMATOS={
 "mapa-morelos":       C=>L_mapaMorelos(C,"vol"),
 "mapa-tasa":          C=>L_mapaMorelos(C,"tasa"),
 "barras-municipios":  C=>L_barrasMunicipios(C,"vol"),
 "barras-municipios-tasa": C=>L_barrasMunicipios(C,"tasa"),
 "duelo":              L_dueloMunicipios,
 "cambio-25-26":       L_cambioMunicipios,
 "concentracion":      L_concentracion,
 "tasa-vs-volumen":    L_tasaVsVolumen,
 "curva-mensual":      L_curvaEstatal,
 "calendario":         L_calendarioEstatal,
 "anos-barras":        L_aniosEstatal,
 "2025-vs-2026":       L_comparativo2526,
 "cifra-gigante":      L_cifraEstatal,
 "peso-nacional":      L_pesoNacional,
 "morelos-vs-media":   L_morelosVsMedia,
 "mapa-nacional":      L_mapaNacional,
 "ranking-32":         L_ranking32,
 "top10-municipios":   L_top10Municipios,
 "waffle":             L_waffleNacional,
 "curva-nacional":     L_curvaNacional,
 "vecinos":            L_vecinos,
 "cambio-nacional":    L_cambioEstados,
};

// ============================================================================
// CATÁLOGO DE DELITOS (llave exacta de la serie + palabra de casa)
// ============================================================================
const D_={
 "Robo de vehículo automotor":{w:"robo de vehículo",a:"del",a1:"El",t:"RoboDeVehiculo",e:"🚗"},
 "Narcomenudeo":{w:"narcomenudeo",a:"del",a1:"El",t:"Narcomenudeo",e:"💊"},
 "Amenazas":{w:"amenazas",a:"de las",a1:"Las",t:"Amenazas",e:"⚠️"},
 "Robo a negocio":{w:"robo a negocio",a:"del",a1:"El",t:"RoboANegocio",e:"🏪"},
 "Daño a la propiedad":{w:"daño a la propiedad",a:"del",a1:"El",t:"DanoALaPropiedad",e:"🧱"},
 "Lesiones culposas":{w:"lesiones culposas",a:"de las",a1:"Las",t:"LesionesCulposas",e:"🚑"},
 "Robo a casa habitación":{w:"robo a casa habitación",a:"del",a1:"El",t:"RoboACasa",e:"🏠"},
 "Violencia familiar":{w:"violencia familiar",a:"de la",a1:"La",t:"ViolenciaFamiliar",e:"🚨"},
 "Extorsión":{w:"extorsión",a:"de la",a1:"La",t:"Extorsion",e:"📞"},
 "Fraude":{w:"fraude",a:"del",a1:"El",t:"Fraude",e:"🎣"},
 "Despojo":{w:"despojo",a:"del",a1:"El",t:"Despojo",e:"📜"},
 "Abuso de confianza":{w:"abuso de confianza",a:"del",a1:"El",t:"AbusoDeConfianza",e:"🤝"},
 "Robo a transeúnte en vía pública":{w:"robo a transeúnte",a:"del",a1:"El",t:"RoboATranseunte",e:"🚶"},
 "Lesiones dolosas":{w:"lesiones dolosas",a:"de las",a1:"Las",t:"LesionesDolosas",e:"🩹"},
 "Homicidio doloso":{w:"homicidio doloso",a:"del",a1:"El",t:"HomicidioDoloso",e:"🔴"},
 "Violación simple":{w:"violación",a:"de la",a1:"La",t:"Violacion",e:"🟣"},
 "Abuso sexual":{w:"abuso sexual",a:"del",a1:"El",t:"AbusoSexual",e:"🟣"},
 "Homicidio culposo":{w:"homicidio culposo",a:"del",a1:"El",t:"HomicidioCulposo",e:"🚧"},
 "Robo de autopartes":{w:"robo de autopartes",a:"del",a1:"El",t:"RoboDeAutopartes",e:"🔧"},
 "Incumplimiento de obligaciones de asistencia familiar":{w:"incumplimiento de pensión",a:"del",a1:"El",t:"PensionAlimenticia",e:"👶"},
 "Allanamiento de morada":{w:"allanamiento de morada",a:"del",a1:"El",t:"Allanamiento",e:"🚪"},
 "Delitos cometidos por servidores públicos":{w:"delitos de servidores públicos",a:"de los",a1:"Los",t:"ServidoresPublicos",e:"🏛️"},
 "Falsificación":{w:"falsificación",a:"de la",a1:"La",t:"Falsificacion",e:"📄"},
 "Hostigamiento sexual":{w:"hostigamiento sexual",a:"del",a1:"El",t:"HostigamientoSexual",e:"🟠"},
};
const ACC={cian:"#3987e5",oro:"#c98500",rojo:"#d03b3b",verde:"#3ec9a7",violeta:"#9085e9",naranja:"#ff8c42",magenta:"#e0559b",aqua:"#37b9c4"};

// ============================================================================
// LAS SEMANAS
// Cada día: 3 publicaciones (municipal, estatal, nacional), cada una con su
// delito, su formato protagonista y su lámina de apoyo.
// Los horarios de la semana 2 en adelante salen de la medición de la casa:
// la tarde-noche rinde y la mañana temprano no, y el programa cierra a las 10.
// ============================================================================
const SEMANAS={
 1:{nombre:"SEMANA 1 (31 ago - 06 sep)", dias:[
 {f:"2026-08-31",d:"lunes",posts:[
  {es:"MUNICIPAL",h:"09h",delito:"Robo de vehículo automotor",acc:ACC.cian,   lam:["mapa-morelos","barras-municipios"]},
  {es:"ESTATAL",  h:"14h",delito:"Violencia familiar",        acc:ACC.oro,    lam:["curva-mensual","2025-vs-2026"]},
  {es:"NACIONAL", h:"20h",delito:"Homicidio doloso",          acc:ACC.rojo,   lam:["mapa-nacional","ranking-32"]}]},
 {f:"2026-09-01",d:"martes",posts:[
  {es:"MUNICIPAL",h:"09h",delito:"Narcomenudeo",              acc:ACC.verde,  lam:["barras-municipios","barras-municipios-tasa"]},
  {es:"ESTATAL",  h:"14h",delito:"Extorsión",                 acc:ACC.violeta,lam:["calendario","curva-mensual"]},
  {es:"NACIONAL", h:"20h",delito:"Violación simple",          acc:ACC.naranja,lam:["ranking-32","mapa-nacional"]}]},
 {f:"2026-09-02",d:"miércoles",posts:[
  {es:"MUNICIPAL",h:"09h",delito:"Amenazas",                  acc:ACC.magenta,lam:["duelo","barras-municipios"]},
  {es:"ESTATAL",  h:"14h",delito:"Fraude",                    acc:ACC.aqua,   lam:["anos-barras","curva-mensual"]},
  {es:"NACIONAL", h:"20h",delito:"Abuso sexual",              acc:ACC.cian,   lam:["top10-municipios","ranking-32"]}]},
 {f:"2026-09-03",d:"jueves",posts:[
  {es:"MUNICIPAL",h:"09h",delito:"Robo a negocio",            acc:ACC.oro,    lam:["cambio-25-26","mapa-morelos"]},
  {es:"ESTATAL",  h:"14h",delito:"Despojo",                   acc:ACC.rojo,   lam:["2025-vs-2026","cifra-gigante"]},
  {es:"NACIONAL", h:"20h",delito:"Homicidio culposo",         acc:ACC.verde,  lam:["waffle","ranking-32"]}]},
 {f:"2026-09-04",d:"viernes",posts:[
  {es:"MUNICIPAL",h:"09h",delito:"Daño a la propiedad",       acc:ACC.violeta,lam:["mapa-tasa","barras-municipios-tasa"]},
  {es:"ESTATAL",  h:"14h",delito:"Abuso de confianza",        acc:ACC.naranja,lam:["cifra-gigante","curva-mensual"]},
  {es:"NACIONAL", h:"20h",delito:"Robo de autopartes",        acc:ACC.magenta,lam:["curva-nacional","cambio-nacional"]}]},
 {f:"2026-09-05",d:"sábado",posts:[
  {es:"MUNICIPAL",h:"09h",delito:"Lesiones culposas",         acc:ACC.aqua,   lam:["concentracion","barras-municipios"]},
  {es:"ESTATAL",  h:"14h",delito:"Robo a transeúnte en vía pública",acc:ACC.cian,lam:["peso-nacional","morelos-vs-media"]},
  {es:"NACIONAL", h:"20h",delito:"Incumplimiento de obligaciones de asistencia familiar",acc:ACC.oro,lam:["vecinos","mapa-nacional"]}]},
 {f:"2026-09-06",d:"domingo",posts:[
  {es:"MUNICIPAL",h:"09h",delito:"Robo a casa habitación",    acc:ACC.rojo,   lam:["tasa-vs-volumen","mapa-tasa"]},
  {es:"ESTATAL",  h:"14h",delito:"Lesiones dolosas",          acc:ACC.verde,  lam:["morelos-vs-media","anos-barras"]},
  {es:"NACIONAL", h:"20h",delito:"Allanamiento de morada",    acc:ACC.violeta,lam:["cambio-nacional","curva-nacional"]}]},
 ]},

 2:{nombre:"SEMANA 2 (07 - 13 sep)", dias:[
 {f:"2026-09-07",d:"lunes",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Violencia familiar",      acc:ACC.naranja,lam:["duelo","barras-municipios"]},
  {es:"ESTATAL",  h:"14h30",delito:"Amenazas",                acc:ACC.magenta,lam:["anos-barras","curva-mensual"]},
  {es:"NACIONAL", h:"20h00",delito:"Lesiones dolosas",        acc:ACC.aqua,   lam:["top10-municipios","ranking-32"]}]},
 {f:"2026-09-08",d:"martes",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Fraude",                  acc:ACC.cian,   lam:["cambio-25-26","mapa-morelos"]},
  {es:"ESTATAL",  h:"14h30",delito:"Lesiones culposas",       acc:ACC.oro,    lam:["2025-vs-2026","curva-mensual"]},
  {es:"NACIONAL", h:"20h00",delito:"Daño a la propiedad",     acc:ACC.rojo,   lam:["waffle","ranking-32"]}]},
 {f:"2026-09-09",d:"miércoles",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Despojo",                 acc:ACC.verde,  lam:["mapa-tasa","barras-municipios-tasa"]},
  {es:"ESTATAL",  h:"14h30",delito:"Robo de vehículo automotor",acc:ACC.violeta,lam:["cifra-gigante","curva-mensual"]},
  {es:"NACIONAL", h:"20h00",delito:"Narcomenudeo",            acc:ACC.naranja,lam:["curva-nacional","mapa-nacional"]}]},
 {f:"2026-09-10",d:"jueves",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Homicidio doloso",        acc:ACC.magenta,lam:["concentracion","barras-municipios"]},
  {es:"ESTATAL",  h:"14h30",delito:"Robo a negocio",          acc:ACC.aqua,   lam:["peso-nacional","morelos-vs-media"]},
  {es:"NACIONAL", h:"20h00",delito:"Robo a transeúnte en vía pública",acc:ACC.cian,lam:["vecinos","ranking-32"]}]},
 {f:"2026-09-11",d:"viernes",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Extorsión",               acc:ACC.oro,    lam:["tasa-vs-volumen","mapa-tasa"]},
  {es:"ESTATAL",  h:"14h30",delito:"Robo a casa habitación",  acc:ACC.rojo,   lam:["morelos-vs-media","curva-mensual"]},
  {es:"NACIONAL", h:"20h00",delito:"Abuso de confianza",      acc:ACC.verde,  lam:["cambio-nacional","curva-nacional"]}]},
 {f:"2026-09-12",d:"sábado",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Abuso sexual",            acc:ACC.violeta,lam:["mapa-morelos","barras-municipios"]},
  {es:"ESTATAL",  h:"14h30",delito:"Violación simple",        acc:ACC.naranja,lam:["curva-mensual","2025-vs-2026"]},
  {es:"NACIONAL", h:"20h00",delito:"Delitos cometidos por servidores públicos",acc:ACC.magenta,lam:["mapa-nacional","ranking-32"]}]},
 {f:"2026-09-13",d:"domingo",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Incumplimiento de obligaciones de asistencia familiar",acc:ACC.aqua,lam:["barras-municipios","mapa-morelos"]},
  {es:"ESTATAL",  h:"14h30",delito:"Allanamiento de morada",  acc:ACC.cian,   lam:["calendario","curva-mensual"]},
  {es:"NACIONAL", h:"20h00",delito:"Falsificación",           acc:ACC.oro,    lam:["ranking-32","top10-municipios"]}]},
 ]},

 3:{nombre:"SEMANA 3 (14 - 20 sep)", dias:[
 {f:"2026-09-14",d:"lunes",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Abuso de confianza",      acc:ACC.rojo,   lam:["mapa-tasa","barras-municipios-tasa"]},
  {es:"ESTATAL",  h:"14h30",delito:"Daño a la propiedad",     acc:ACC.verde,  lam:["cifra-gigante","curva-mensual"]},
  {es:"NACIONAL", h:"20h00",delito:"Violencia familiar",      acc:ACC.violeta,lam:["curva-nacional","ranking-32"]}]},
 {f:"2026-09-15",d:"martes",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Lesiones dolosas",        acc:ACC.naranja,lam:["concentracion","barras-municipios"]},
  {es:"ESTATAL",  h:"14h30",delito:"Narcomenudeo",            acc:ACC.magenta,lam:["peso-nacional","morelos-vs-media"]},
  {es:"NACIONAL", h:"20h00",delito:"Amenazas",                acc:ACC.aqua,   lam:["vecinos","mapa-nacional"]}]},
 {f:"2026-09-16",d:"miércoles",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Robo a transeúnte en vía pública",acc:ACC.cian,lam:["tasa-vs-volumen","mapa-tasa"]},
  {es:"ESTATAL",  h:"14h30",delito:"Homicidio doloso",        acc:ACC.oro,    lam:["morelos-vs-media","curva-mensual"]},
  {es:"NACIONAL", h:"20h00",delito:"Fraude",                  acc:ACC.rojo,   lam:["cambio-nacional","curva-nacional"]}]},
 {f:"2026-09-17",d:"jueves",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Violación simple",        acc:ACC.verde,  lam:["mapa-morelos","barras-municipios"]},
  {es:"ESTATAL",  h:"14h30",delito:"Abuso sexual",            acc:ACC.violeta,lam:["curva-mensual","2025-vs-2026"]},
  {es:"NACIONAL", h:"20h00",delito:"Robo de vehículo automotor",acc:ACC.naranja,lam:["mapa-nacional","ranking-32"]}]},
 {f:"2026-09-18",d:"viernes",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Allanamiento de morada",  acc:ACC.magenta,lam:["barras-municipios","mapa-morelos"]},
  {es:"ESTATAL",  h:"14h30",delito:"Incumplimiento de obligaciones de asistencia familiar",acc:ACC.aqua,lam:["calendario","curva-mensual"]},
  {es:"NACIONAL", h:"20h00",delito:"Robo a negocio",          acc:ACC.cian,   lam:["ranking-32","top10-municipios"]}]},
 {f:"2026-09-19",d:"sábado",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Homicidio culposo",       acc:ACC.oro,    lam:["duelo","barras-municipios"]},
  {es:"ESTATAL",  h:"14h30",delito:"Falsificación",           acc:ACC.rojo,   lam:["anos-barras","curva-mensual"]},
  {es:"NACIONAL", h:"20h00",delito:"Lesiones culposas",       acc:ACC.verde,  lam:["top10-municipios","ranking-32"]}]},
 {f:"2026-09-20",d:"domingo",posts:[
  {es:"MUNICIPAL",h:"10h30",delito:"Delitos cometidos por servidores públicos",acc:ACC.violeta,lam:["cambio-25-26","barras-municipios"]},
  {es:"ESTATAL",  h:"14h30",delito:"Hostigamiento sexual",    acc:ACC.naranja,lam:["2025-vs-2026","curva-mensual"]},
  {es:"NACIONAL", h:"20h00",delito:"Robo a casa habitación",  acc:ACC.magenta,lam:["waffle","ranking-32"]}]},
 ]},
};

// ============================================================================
// CAPTIONS (regla ENT-02: entre 60 y 400 caracteres, para que no los corte el "Ver más")
// ============================================================================
const LIGA="45digitalnoticias.github.io/Inseguridad-Mexico";
function pick(k,tabla,fallback){const f=tabla[k];return f?f():fallback;}
function caption(C,p){
 const E=D_[C.delito].e, W_=C.word, T=D_[C.delito].t;
 let cabeza, medio;
 if(p.es==="MUNICIPAL"){
  cabeza = C._bajo
   ? `${E} Van ${nf(C._totalMor)} carpetas por ${W_} en Morelos y ${C._conCarpetas} municipios las concentran. Encabeza ${C._muni1}.`
   : `${E} ${C._muni1} junta el ${fR(C._share1)}% de las carpetas por ${W_} de todo Morelos: ${nf(C._muni1v)} de ${nf(C._totalMor)} en lo que va del año.`;
  medio = pick(p.lam[0],{
   "mapa-morelos":()=>"Así se ve el estado, municipio por municipio 👇",
   "mapa-tasa":()=>`Medido por habitante manda ${C._tasa1?C._tasa1.n:""} 👇`,
   "barras-municipios":()=>"Los municipios, uno por uno 👇",
   "duelo":()=>`Cuautla contra Cuernavaca, cara a cara 👇`,
   "cambio-25-26":()=>C._cambio?`Quien más aceleró: ${C._cambio.sube.n} 👇`:"Quién sube y quién baja 👇",
   "concentracion":()=>`Bastan ${C._mitad} municipios para la mitad del estado 👇`,
   "tasa-vs-volumen":()=>"El municipio chico que sale caro 👇",
  },"El mapa completo 👇");
 } else if(p.es==="ESTATAL"){
  cabeza=`${E} Morelos lleva ${nf(C._edo26)} carpetas por ${W_} de enero a julio: ${C._edoDelta>=0?"+":""}${fR(C._edoDelta)}% contra los mismos meses de 2025.`;
  medio = pick(p.lam[0],{
   "curva-mensual":()=>`El peor mes de la serie fue ${C._picoLbl}, con ${nf(C._picoV)} 👇`,
   "calendario":()=>`El mes más cargado del año suele ser ${C._mesAlto} 👇`,
   "anos-barras":()=>`El peor enero-julio fue el de ${C._anioAlto} 👇`,
   "2025-vs-2026":()=>"Mes contra mes, 2025 y 2026 👇",
   "cifra-gigante":()=>"La cifra del año, en una lámina 👇",
   "peso-nacional":()=>`Morelos pone el ${C._peso}% de las carpetas del país con el ${C._pesoPob}% de la población 👇`,
   "morelos-vs-media":()=>`La tasa de Morelos es ${C._veces} veces la del país 👇`,
  },"La serie completa 👇");
 } else {
  cabeza=`${E} Morelos es el #${C._morPos} de los 32 estados en ${W_}: tasa de ${C._morRate} por cada 100 mil. Encabeza ${C._top1} con ${C._top1rate}.`;
  medio = pick(p.lam[0],{
   "mapa-nacional":()=>"El mapa del país, estado por estado 👇",
   "ranking-32":()=>"Los 32, de mayor a menor 👇",
   "top10-municipios":()=>`El municipio con más del país es ${C._m1n}, ${C._m1e} 👇`,
   "waffle":()=>"De cada 100 carpetas del país, quién pone cuántas 👇",
   "curva-nacional":()=>`En 2026 el país lleva ${C._nacDelta>=0?"+":""}${fR(C._nacDelta)}% contra 2025 👇`,
   "vecinos":()=>"Morelos contra sus cinco vecinos 👇",
   "cambio-nacional":()=>C._cambioNac?`El que más sube: ${C._cambioNac.sube.n} 👇`:"Quién sube y quién baja 👇",
  },"El país completo 👇");
 }
 const cola=`\n\n🔎 ${LIGA}\n#Morelos #${T} #Datos`;
 let txt=`${cabeza}\n\n${medio}${cola}`;
 if(txt.length>400) txt=`${cabeza}${cola}`;                    // primero cae el renglón de en medio
 if(txt.length>400) txt=`${cabeza}\n\n🔎 ${LIGA}\n#${T}`;
 return txt;
}

// ============================================================================
// MAIN — node _gen_sept3.js [número de semana]
// ============================================================================
const sinAcentos=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Za-z0-9\s-]/g,"").replace(/\s+/g," ").trim();
const NSEM=+(process.argv[2]||1);
const SEM=SEMANAS[NSEM];
if(!SEM) throw new Error("No hay semana "+NSEM+" definida en _sept_p5.js");
const DIRSEM=RAIZ+"/"+SEM.nombre, DIRHTML=DIRSEM+"/_html";
fs.mkdirSync(DIRHTML,{recursive:true});
fs.copyFileSync(LOGO,DIRHTML+"/logo.png");

let manifest=[], filas=[], avisos=[];
SEM.dias.forEach((dia,di)=>{
 const carpetaDia=DIRSEM+"/"+dia.f+" "+dia.d;
 dia.posts.forEach((p,pi)=>{
  const meta=D_[p.delito];
  if(!meta) throw new Error("Delito sin ficha: "+p.delito);
  if(!SM[17].delitos[p.delito]) throw new Error("Llave inexistente en series: "+p.delito);
  if(MU.delitos.indexOf(p.delito)<0) throw new Error("Llave inexistente en matriz municipal: "+p.delito);
  const C={delito:p.delito,word:meta.w,art:meta.a,art1:meta.a1,tag:meta.t,acc:p.acc};
  // datos base de la escala SIEMPRE, aunque el formato del día no los use:
  // de aquí sale el gancho del caption y no puede depender del molde elegido
  if(p.es==="MUNICIPAL") datosMuni(C); else if(p.es==="ESTATAL") datosEdo(C); else datosNac(C);
  const dest=carpetaDia+"/"+p.h+" "+p.es+" - "+sinAcentos(meta.w);
  fs.mkdirSync(dest,{recursive:true});
  p.lam.forEach((fmt,li)=>{
   const fn=FORMATOS[fmt];
   if(!fn) throw new Error("Formato no registrado: "+fmt);
   const html=fn(C);
   const base=`${dia.f}_${p.es}_${sinAcentos(meta.w).replace(/\s+/g,"-")}_${li+1}-${fmt}`;
   const fh=DIRHTML+"/"+base+".html", fp=dest+`/${li+1}-${fmt}.png`;
   fs.writeFileSync(fh,html,"utf8");
   manifest.push(fh+"|"+fp+"|"+W+"|"+H);});
  const cap=caption(C,p);
  fs.writeFileSync(dest+"/caption.txt",cap,"utf8");
  if(cap.length>400||cap.length<60) avisos.push(`${dia.f} ${p.es}: caption de ${cap.length} caracteres`);
  filas.push({fecha:dia.f,dia:dia.d,hora:p.h,escala:p.es,delito:p.delito,word:meta.w,
              formatos:p.lam,acc:p.acc,caption:cap.length,
              dato:p.es==="MUNICIPAL"?`${C._muni1} ${nf(C._muni1v)} de ${nf(C._totalMor)}`
                  :p.es==="ESTATAL"?`${nf(C._edo26)} carpetas, ${C._edoDelta>=0?"+":""}${fR(C._edoDelta)}%`
                  :`Morelos #${C._morPos} (tasa ${C._morRate})`});
  console.log(`${dia.f} ${p.h.padEnd(5)} ${p.es.padEnd(9)} ${meta.w.padEnd(30)} ${p.lam.join(" + ").padEnd(38)} caption ${String(cap.length).padStart(3)}`);
 });
});
fs.writeFileSync(BASE+"/_manifest_sept3.txt",manifest.join("\n")+"\n","utf8");
fs.writeFileSync(DIRSEM+"/_plan_semana.json",JSON.stringify(filas,null,1),"utf8");
console.log("\n"+SEM.nombre+" -> manifest: "+manifest.length+" laminas");
if(avisos.length) console.log("AVISOS:\n"+avisos.join("\n")); else console.log("captions: los "+filas.length+" dentro de 60-400 caracteres");
