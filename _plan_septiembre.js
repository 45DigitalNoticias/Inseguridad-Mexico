// Calendario de SEPTIEMBRE 2026 — 31 días (31 ago a 30 sep) x 3 publicaciones.
// Reglas que respeta el planificador:
//  1. ningún par delito+escala se repite en el mes
//  2. ningún delito se repite dentro de la misma semana
//  3. cada escala usa sus 7 formatos, uno por día, rotando el arranque cada semana
//  4. los tres acentos del día son distintos y ninguna escala repite acento en días seguidos
// La semana 1 va escrita a mano (es la que ya se produjo); de la 2 en adelante asigna solo.
const fs=require("fs");
const BASE="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const RAIZ="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/PROGRAMACIÓN FACEBOOK/GRÁFICAS SEMANALES/2026-09 Inseguridad (3 al dia)";
const rd=f=>eval("("+fs.readFileSync(f,"utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/,"").replace(/;\s*$/,"")+")");
const MU=rd(BASE+"/_nac_muni_data.js");
const GEO=rd(BASE+"/_nac_muni_geo.js");
const SM={}; for(let c=1;c<=32;c++) SM[c]=rd(BASE+"/series_mensuales/sm_"+String(c).padStart(2,"0")+".js");
const L=SM[1].labels, M26=SM[1].meses_2026, IDX26=L.indexOf("2026-01"), AI26=MU.anios.length-1;
const featsMor=GEO.features.filter(f=>String(f.properties.k).padStart(5,"0").startsWith("17"));

// --------- inventario real, para no proponer delitos sin datos ---------
const EXCLUIR=d=>d.startsWith("Otros")||d==="Todos los delitos"||d==="Feminicidio";
const inv=MU.delitos.filter(d=>!EXCLUIR(d)).map(d=>{
 const di=MU.delitos.indexOf(d);
 let mor=0, muni=0;
 featsMor.forEach(f=>{const k=String(f.properties.k).padStart(5,"0");const v=(MU.d[k]&&MU.d[k][di]?MU.d[k][di][AI26]:0)||0;mor+=v;if(v>0)muni++;});
 let nac=0; for(let c=1;c<=32;c++){const s=SM[c].delitos[d];if(s)for(let i=IDX26;i<IDX26+M26;i++)nac+=s[i]||0;}
 return {d,mor,muni,nac};
});
const BOLSA={
 MUNICIPAL: inv.filter(o=>o.muni>=12&&o.mor>=40).sort((a,b)=>b.mor-a.mor).map(o=>o.d),
 ESTATAL:   inv.filter(o=>o.mor>=40).sort((a,b)=>b.mor-a.mor).map(o=>o.d),
 NACIONAL:  inv.filter(o=>o.nac>=800).sort((a,b)=>b.nac-a.nac).map(o=>o.d),
};
const FMT={
 MUNICIPAL:["mapa-morelos","barras-municipios","duelo","cambio-25-26","mapa-tasa","concentracion","tasa-vs-volumen"],
 ESTATAL:  ["curva-mensual","calendario","anos-barras","2025-vs-2026","cifra-gigante","peso-nacional","morelos-vs-media"],
 NACIONAL: ["mapa-nacional","ranking-32","top10-municipios","waffle","curva-nacional","vecinos","cambio-nacional"],
};
const ACC=["cian","oro","rojo","verde","violeta","naranja","magenta","aqua"];
const ESCALAS=["MUNICIPAL","ESTATAL","NACIONAL"];

// --------- semana 1, tal como se produjo ---------
const S1=[
 ["2026-08-31","Robo de vehículo automotor","Violencia familiar","Homicidio doloso"],
 ["2026-09-01","Narcomenudeo","Extorsión","Violación simple"],
 ["2026-09-02","Amenazas","Fraude","Abuso sexual"],
 ["2026-09-03","Robo a negocio","Despojo","Homicidio culposo"],
 ["2026-09-04","Daño a la propiedad","Abuso de confianza","Robo de autopartes"],
 ["2026-09-05","Lesiones culposas","Robo a transeúnte en vía pública","Incumplimiento de obligaciones de asistencia familiar"],
 ["2026-09-06","Robo a casa habitación","Lesiones dolosas","Allanamiento de morada"],
];
const usados={MUNICIPAL:new Set(),ESTATAL:new Set(),NACIONAL:new Set()};
const dias=[];
S1.forEach((r,i)=>{
 const posts=ESCALAS.map((es,j)=>{usados[es].add(r[j+1]);
  return {es,delito:r[j+1],fmt:FMT[es][i],acc:ACC[(i*3+j)%8]};});
 dias.push({f:r[0],posts,semana:1});
});

// --------- de la semana 2 en adelante ---------
const DIAS_MES=[]; for(let d=7;d<=30;d++) DIAS_MES.push("2026-09-"+String(d).padStart(2,"0"));
const NOMBRE_DIA=f=>["domingo","lunes","martes","miércoles","jueves","viernes","sábado"][new Date(f+"T12:00:00").getDay()];
let faltantes=[];
DIAS_MES.forEach((f,idx)=>{
 const semana=2+Math.floor((idx+ (0))/7);           // 7-13 = semana 2, 14-20 = 3, 21-27 = 4, 28-30 = 5
 const diaSem=idx%7;
 const enEstaSemana=new Set();
 dias.filter(d=>d.semana===semana).forEach(d=>d.posts.forEach(p=>enEstaSemana.add(p.delito)));
 const posts=ESCALAS.map((es,j)=>{
  const fmt=FMT[es][(diaSem+(semana-1)*2)%7];        // el arranque de formatos se corre cada semana
  const cand=BOLSA[es].find(d=>!usados[es].has(d)&&!enEstaSemana.has(d));
  if(cand){usados[es].add(cand);enEstaSemana.add(cand);}
  else faltantes.push(f+" "+es);
  return {es,delito:cand||"— AGREGADO TEMÁTICO POR PROGRAMAR —",fmt,acc:ACC[(idx*3+j)%8]};});
 dias.push({f,posts,semana});
});

// --------- salida ---------
const HORA={MUNICIPAL:"09:00",ESTATAL:"14:00",NACIONAL:"20:00"};
let md=`# Calendario de septiembre 2026 — inseguridad, 3 publicaciones al día

**Regla vigente desde el 29 de agosto de 2026.** Cada día salen **tres** publicaciones,
una por escala, cada una con **su propio delito** y **su propio formato gráfico**.
Cada publicación son **2 láminas** (la gráfica protagonista y su apoyo) de 1080x1350,
renderizadas al doble (2160x2700).

- **09:00 MUNICIPAL** — los 36 municipios de Morelos (dato acumulado enero-julio 2026).
- **14:00 ESTATAL** — Morelos en el tiempo (serie mensual 2015-2026).
- **20:00 NACIONAL** — los 32 estados y los municipios del país.

Nada se repite: ningún par delito+escala vuelve en el mes, ningún delito se repite dentro
de la misma semana y cada escala recorre sus siete formatos antes de volver al primero.

Fuente de todo: **SESNSP**, datos abiertos, **corte julio 2026** (cifra preliminar) +
**CONAPO** para las tasas.

| Fecha | Día | Sem | 09:00 MUNICIPAL | 14:00 ESTATAL | 20:00 NACIONAL |
|---|---|---|---|---|---|
`;
dias.forEach(d=>{
 const c=d.posts.map(p=>`${p.delito}<br><i>${p.fmt}</i>`);
 md+=`| ${d.f} | ${NOMBRE_DIA(d.f)} | ${d.semana} | ${c[0]} | ${c[1]} | ${c[2]} |\n`;
});
md+=`
## Los 21 formatos que rotan

| MUNICIPAL | ESTATAL | NACIONAL |
|---|---|---|
| mapa de Morelos | curva mes a mes | mapa del país |
| barras por municipio | calendario de estacionalidad | ranking de los 32 |
| duelo Cuautla-Cuernavaca | enero-julio año por año | los 10 municipios del país |
| quién sube y quién baja | 2025 contra 2026, mes a mes | de cada 100 carpetas |
| mapa por tasa | la cifra del año | curva nacional |
| concentración | peso de Morelos en el país | Morelos y sus vecinos |
| tasa contra volumen | Morelos contra el promedio | quién sube y quién baja en el país |

## Qué falta por resolver

${faltantes.length?`Hay **${faltantes.length} huecos** al final del mes: se acabaron los delitos
con datos suficientes para esa escala sin repetir. Esos días piden **agregado temático**
(un cruce declarado, no un delito suelto). Los candidatos, en orden:

1. **Todos los delitos** (el agregado general del SESNSP).
2. **Robo, todas sus modalidades** (vehículo, casa, negocio, transeúnte, transporte, autopartes, ganado, maquinaria, banco, transportista).
3. **Delitos sexuales** (violación simple y equiparada, abuso, acoso y hostigamiento sexual).
4. **Contra la familia** (violencia familiar, incumplimiento de pensión, otros contra la familia).
5. **Patrimoniales sin violencia** (fraude, abuso de confianza, daño a la propiedad, despojo, extorsión).
6. **Contra la vida y la integridad** (homicidio doloso y culposo, lesiones dolosas y culposas).

Huecos: ${faltantes.join(" · ")}

Cada agregado tiene que declarar en la lámina **qué suma**, o la cifra no es auditable.`
:"Ninguno: el mes completo queda cubierto con delitos individuales."}

## Lo que queda fuera a propósito

- **Feminicidio**, que merece pieza propia con el estándar SCJN (solo una de cada cuatro
  muertes violentas de mujeres se clasifica así), no este molde genérico.
- Las **categorías bolsa** del SESNSP ("Otros robos", "Otros delitos del Fuero Común"…),
  que no dicen nada al lector.
- Los delitos con **una o dos carpetas** en Morelos, donde cualquier porcentaje engaña.
`;
fs.writeFileSync(RAIZ+"/_CALENDARIO SEPTIEMBRE.md",md,"utf8");
console.log("bolsas disponibles -> MUNICIPAL "+BOLSA.MUNICIPAL.length+" | ESTATAL "+BOLSA.ESTATAL.length+" | NACIONAL "+BOLSA.NACIONAL.length);
console.log("dias planeados: "+dias.length+"  publicaciones: "+dias.length*3);
console.log("huecos por agotamiento: "+faltantes.length+(faltantes.length?"  -> "+faltantes.join(", "):""));
console.log("escrito: "+RAIZ+"/_CALENDARIO SEPTIEMBRE.md");
