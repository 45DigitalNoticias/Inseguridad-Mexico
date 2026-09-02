
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
