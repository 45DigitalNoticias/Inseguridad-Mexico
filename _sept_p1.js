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
