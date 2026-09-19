// Calendario de SEPTIEMBRE 2026 — se arma con lo REALMENTE producido.
// Lee el _plan_semana.json de cada carpeta de semana y, con lo que queda del
// catálogo, dice qué está disponible para los días que faltan. Antes planificaba
// a ciegas; ahora el calendario y las carpetas no pueden discrepar.
const fs=require("fs");
const BASE="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO";
const RAIZ="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/PROGRAMACIÓN FACEBOOK/GRÁFICAS SEMANALES/2026-09 Inseguridad (3 al dia)";
const rd=f=>eval("("+fs.readFileSync(f,"utf8").replace(/^(const\s+\w+\s*=|[^=]*=)/,"").replace(/;\s*$/,"")+")");
const MU=rd(BASE+"/_nac_muni_data.js");
const GEO=rd(BASE+"/_nac_muni_geo.js");
const SM={}; for(let c=1;c<=32;c++) SM[c]=rd(BASE+"/series_mensuales/sm_"+String(c).padStart(2,"0")+".js");
const L=SM[1].labels, M26=SM[1].meses_2026, IDX26=L.indexOf("2026-01"), AI26=MU.anios.length-1;
const MESN=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const MES_CORTE=MESN[M26-1];   // el mes del corte sale del dato (19-sep-2026), no va escrito
const featsMor=GEO.features.filter(f=>String(f.properties.k).padStart(5,"0").startsWith("17"));

// ---- lo producido ----
const semanas=fs.readdirSync(RAIZ).filter(d=>d.startsWith("SEMANA")).sort();
const filas=[]; const usados={MUNICIPAL:new Set(),ESTATAL:new Set(),NACIONAL:new Set()};
semanas.forEach((s,i)=>{
 const plan=JSON.parse(fs.readFileSync(RAIZ+"/"+s+"/_plan_semana.json","utf8"));
 plan.forEach(p=>{usados[p.escala].add(p.delito); filas.push(Object.assign({semana:i+1,carpeta:s},p));});
});
const porDia={};
filas.forEach(p=>{(porDia[p.fecha]=porDia[p.fecha]||{fecha:p.fecha,dia:p.dia,semana:p.semana})[p.escala]=p;});
const dias=Object.values(porDia).sort((a,b)=>a.fecha<b.fecha?-1:1);

// ---- lo que queda del catálogo ----
const EXCLUIR=d=>d.startsWith("Otros")||d==="Feminicidio";
const inv=MU.delitos.filter(d=>!EXCLUIR(d)).map(d=>{
 const di=MU.delitos.indexOf(d);
 let mor=0,muni=0;
 featsMor.forEach(f=>{const k=String(f.properties.k).padStart(5,"0");const v=(MU.d[k]&&MU.d[k][di]?MU.d[k][di][AI26]:0)||0;mor+=v;if(v>0)muni++;});
 let nac=0; for(let c=1;c<=32;c++){const s=SM[c].delitos[d];if(s)for(let i=IDX26;i<IDX26+M26;i++)nac+=s[i]||0;}
 return {d,mor,muni,nac};
});
const AGREGADOS=["Robo, todas sus modalidades","Delitos sexuales","Delitos contra la familia",
 "Delitos patrimoniales sin robo","Delitos contra la vida y la integridad","Robo en transporte","Todos los delitos"];
const libre=(es,d)=>!usados[es].has(d);
const DISPONIBLE={
 MUNICIPAL: inv.filter(o=>o.muni>=10&&o.mor>=25&&libre("MUNICIPAL",o.d)).map(o=>o.d)
             .concat(AGREGADOS.filter(a=>libre("MUNICIPAL",a))),
 ESTATAL:   inv.filter(o=>o.mor>=15&&o.d!=="Todos los delitos"&&libre("ESTATAL",o.d)).map(o=>o.d)
             .concat(AGREGADOS.filter(a=>a!=="Todos los delitos"&&libre("ESTATAL",a))),
 NACIONAL:  inv.filter(o=>o.nac>=800&&o.d!=="Todos los delitos"&&libre("NACIONAL",o.d)).map(o=>o.d)
             .concat(AGREGADOS.filter(a=>a!=="Todos los delitos"&&libre("NACIONAL",a))),
};
const FALTAN=["2026-09-28","2026-09-29","2026-09-30"].filter(f=>!porDia[f]);

let md=`# Calendario de septiembre 2026 — inseguridad, 3 publicaciones al día

**Regla vigente desde el 29 de agosto de 2026.** Cada día salen **tres** publicaciones,
una por escala, cada una con **su propio delito** y **su propio formato gráfico**, y cada
una es un carrusel de **2 láminas** de 1080x1350 renderizadas al doble (2160x2700).

- **10:30 MUNICIPAL** — los 36 municipios de Morelos (acumulado enero-${MES_CORTE} 2026).
- **14:30 ESTATAL** — Morelos en el tiempo (serie mensual 2015-2026).
- **20:00 NACIONAL** — los 32 estados y los municipios del país.

Nada se repite: ningún par delito+escala vuelve en el mes, ningún delito se repite dentro
de la misma semana y cada escala recorre sus siete formatos antes de volver al primero.

Fuente de todo: **SESNSP**, datos abiertos, **corte ${MES_CORTE} 2026** (cifra preliminar) +
**CONAPO** para las tasas.

## Lo producido (${filas.length} publicaciones, ${filas.length*2} láminas)

| Fecha | Día | Sem | 10:30 MUNICIPAL | 14:30 ESTATAL | 20:00 NACIONAL |
|---|---|---|---|---|---|
`;
dias.forEach(d=>{
 const c=["MUNICIPAL","ESTATAL","NACIONAL"].map(es=>d[es]?`${d[es].word}<br><i>${d[es].formatos[0]}</i>`:"—");
 md+=`| ${d.fecha} | ${d.dia} | ${d.semana} | ${c[0]} | ${c[1]} | ${c[2]} |\n`;
});

md+=`
## Lo que falta: ${FALTAN.length} días (${FALTAN.join(", ")})

Son ${FALTAN.length*3} publicaciones para cerrar el mes. Esto es lo que queda sin usar en
cada escala, ya descontado todo lo producido:

| Escala | Disponibles | Cuáles |
|---|---|---|
| MUNICIPAL | ${DISPONIBLE.MUNICIPAL.length} | ${DISPONIBLE.MUNICIPAL.join(", ")||"—"} |
| ESTATAL | ${DISPONIBLE.ESTATAL.length} | ${DISPONIBLE.ESTATAL.join(", ")||"—"} |
| NACIONAL | ${DISPONIBLE.NACIONAL.length} | ${DISPONIBLE.NACIONAL.join(", ")||"—"} |

## Los agregados temáticos

Cuando se acabaron los delitos individuales con datos suficientes, la veta que siguió
fueron los cruces. **La lámina declara en el pie qué suma cada uno**, porque una cifra
que no se puede reconstruir no es auditable:

- **Robo, todas sus modalidades** — las 14 modalidades del catálogo, incluida "otros robos".
- **Delitos sexuales** — violación simple y equiparada, abuso, acoso y hostigamiento sexual, y otros contra la libertad sexual.
- **Delitos contra la familia** — violencia familiar, incumplimiento de pensión y otros contra la familia.
- **Delitos patrimoniales sin robo** — fraude, abuso de confianza, daño a la propiedad, despojo, extorsión y otros contra el patrimonio.
- **Delitos contra la vida y la integridad** — homicidio doloso y culposo, feminicidio, lesiones dolosas y culposas, y otros contra la vida.
- **Robo en transporte** — colectivo, público individual e individual.
- **Todos los delitos** — el agregado del SESNSP. Solo sirve en escala **municipal**: la
  serie mensual por estado no trae esa llave. Se rotula "delitos denunciados", que es lo
  que de verdad mide.

## Lo que queda fuera a propósito

- **Feminicidio** como pieza suelta: merece una propia con el estándar SCJN (solo una de
  cada cuatro muertes violentas de mujeres se clasifica así), no este molde. Dentro del
  agregado "contra la vida" sí entra, y ahí va declarado.
- Las **categorías bolsa** del SESNSP ("Otros robos", "Otros delitos del Fuero Común"…)
  como delito suelto; dentro de un agregado sí suman, para que la cifra cierre.
- Los delitos con **una o dos carpetas** en Morelos, donde cualquier porcentaje engaña.
`;
fs.writeFileSync(RAIZ+"/_CALENDARIO SEPTIEMBRE.md",md,"utf8");
console.log("semanas leidas: "+semanas.length+"  publicaciones: "+filas.length);
console.log("faltan: "+(FALTAN.join(", ")||"nada"));
["MUNICIPAL","ESTATAL","NACIONAL"].forEach(es=>console.log("  disponibles "+es+": "+DISPONIBLE[es].length));
console.log("escrito: "+RAIZ+"/_CALENDARIO SEPTIEMBRE.md");
