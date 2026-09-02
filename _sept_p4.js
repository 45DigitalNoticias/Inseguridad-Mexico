
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
