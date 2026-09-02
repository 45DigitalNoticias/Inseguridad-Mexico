
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
