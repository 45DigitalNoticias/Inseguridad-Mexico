// ============================================================================
// LÁMINA -> MP4 CORTO EN LOOP (prueba de formato, 29-ago-2026)
// El HTML de la lámina ya existe: aquí solo se le inyectan animaciones CSS y
// se captura con Chrome avanzando su RELOJ VIRTUAL cuadro por cuadro
// (--virtual-time-budget), que es determinista: el cuadro N cae exactamente en
// su milisegundo, no en "lo que alcanzó a pintar". Luego el ffmpeg que trae
// Remotion arma el MP4. Nada de GIF: 256 colores destrozan los degradados.
//
//   node _gen_animacion.js "<lamina.html>" "<salida.mp4>" [segundos] [fps]
// ============================================================================
const fs=require("fs"), path=require("path");
const {execFileSync}=require("child_process"), {pathToFileURL}=require("url");
const CHROME="C:/Program Files/Google/Chrome/Application/chrome.exe";
const FFMPEG="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/_remotion-reel/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe";
const BS=String.fromCharCode(92);
const TMP=(process.env.TEMP||"C:/Windows/Temp").split(BS).join("/")+"/_anim_lamina";

// Un reel no admite carrusel, asi que las dos laminas del post se encadenan
// en el mismo archivo: mismo contenido, un solo archivo que subir.
const PAR  = process.argv[2]==="--par";
const SRCS = PAR ? [process.argv[3],process.argv[4]] : [process.argv[2]];
const OUT  = PAR ? process.argv[5] : process.argv[3];
const SEG  = +((PAR?process.argv[6]:process.argv[4])||5);
const FPS  = +((PAR?process.argv[7]:process.argv[5])||12);
if(!SRCS[0]||!OUT){
 console.error("uso: node _gen_animacion.js <lamina.html> <salida.mp4> [seg] [fps]");
 console.error("     node _gen_animacion.js --par <l1.html> <l2.html> <salida.mp4> [seg] [fps]");
 process.exit(1);}
const W=1080, H=1350, NFRAMES=Math.round(SEG*FPS);

// ---------------- coreografía ----------------
// Entra el titular, se dibuja el dato, aterriza la lectura. Los últimos ~1.4 s
// se quedan quietos: en un loop de Facebook el ojo necesita el descanso para
// leer la nota antes de que vuelva a empezar.
function css(){
 let s=`
@keyframes _fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes _fadeIn{from{opacity:0}to{opacity:1}}
@keyframes _growX{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes _pop{from{opacity:0;transform:scale(.84)}to{opacity:1;transform:scale(1)}}
@keyframes _rise{from{opacity:0;transform:scaleY(0)}to{opacity:1;transform:scaleY(1)}}
 /* El primer segundo es el que decide el scroll: a los 0.4 s ya tiene que
    haber dato en pantalla. Nada de abrir con la lámina vacía. */
 .kick{animation:_fadeUp .35s ease-out both}
 h1{animation:_fadeUp .45s .06s ease-out both}
 .sub{animation:_fadeUp .45s .16s ease-out both}
 .cuerpo>div:first-child{animation:_fadeIn .4s .2s ease-out both}
 .nota{animation:_fadeUp .6s 2.05s ease-out both}
 .foot{animation:_fadeIn .6s 2.35s ease-out both}
 /* mapas: los municipios se encienden en cascada */
 svg path{animation:_fadeIn .45s .35s ease-out both}
 svg text{animation:_pop .45s 1.5s ease-out both}
 svg line{animation:_fadeIn .4s .3s ease-out both}
 /* barras horizontales */
 .bar{transform-origin:left center;animation:_growX .65s .45s cubic-bezier(.2,.8,.25,1) both}
 .fila{animation:_fadeIn .3s .3s ease-out both}
 .vl{animation:_fadeIn .4s .8s ease-out both}
 /* divergente */
 .dbar i{animation:_growX .6s .5s cubic-bezier(.2,.8,.25,1) both}
 .dv{animation:_fadeIn .3s .35s ease-out both}
 /* columnas verticales y calendario */
 svg rect{transform-origin:center bottom;animation:_rise .55s .4s cubic-bezier(.2,.8,.25,1) both}
 /* cifra gigante y duelo */
 .gig{animation:_pop .7s .3s cubic-bezier(.2,.9,.3,1) both}
 .gun{animation:_fadeUp .5s .85s ease-out both}
 .ap{animation:_fadeUp .5s ease-out both}
 .duelo{animation:_fadeUp .6s ease-out both}
 .dcif{animation:_pop .6s .55s cubic-bezier(.2,.9,.3,1) both}
 .dbarra i{transform-origin:left center;animation:_growX .7s .85s cubic-bezier(.2,.8,.25,1) both}
`;
 // el escalonado necesita una regla por posición: CSS no sabe contar solo
 for(let i=1;i<=40;i++) s+=` .fila:nth-child(${i}){animation-delay:${(0.30+i*0.030).toFixed(3)}s}\n`;
 for(let i=1;i<=40;i++) s+=` .fila:nth-child(${i}) .bar{animation-delay:${(0.42+i*0.030).toFixed(3)}s}\n`;
 for(let i=1;i<=40;i++) s+=` .fila:nth-child(${i}) .vl{animation-delay:${(0.75+i*0.030).toFixed(3)}s}\n`;
 for(let i=1;i<=16;i++) s+=` .dv:nth-child(${i}){animation-delay:${(0.32+i*0.042).toFixed(3)}s}\n`;
 for(let i=1;i<=16;i++) s+=` .dv:nth-child(${i}) i{animation-delay:${(0.46+i*0.042).toFixed(3)}s}\n`;
 for(let i=1;i<=3;i++)  s+=` .ap:nth-child(${i}){animation-delay:${(0.95+i*0.13).toFixed(3)}s}\n`;
 for(let i=1;i<=2;i++)  s+=` .duelo:nth-child(${i}){animation-delay:${(0.25+i*0.16).toFixed(3)}s}\n`;
 // paths y rects: cascada corta, para que el mapa "prenda" y no aparezca de golpe
 for(let i=1;i<=140;i++) s+=` svg path:nth-of-type(${i}){animation-delay:${(0.32+i*0.0095).toFixed(3)}s}\n`;
 for(let i=1;i<=160;i++) s+=` svg rect:nth-of-type(${i}){animation-delay:${(0.34+i*0.0085).toFixed(3)}s}\n`;
 return s;
}

// ---------------- preparar y capturar ----------------
// Chrome NO escribe si la ruta de --screenshot trae acentos, y su reloj virtual
// se detiene mientras haya red pendiente: por eso las fuentes cargan sin gastar
// tiempo de la animacion y el cuadro N cae en su milisegundo exacto.
fs.rmSync(TMP,{recursive:true,force:true});
fs.mkdirSync(TMP,{recursive:true});
let nCuadro=0;
SRCS.forEach((src,li)=>{
 const dirSrc=path.dirname(src);
 ["logo.png"].forEach(f=>{const o=path.join(dirSrc,f); if(fs.existsSync(o)) fs.copyFileSync(o,TMP+"/"+f);});
 const html=fs.readFileSync(src,"utf8").replace("</style>", css()+"</style>");
 const HTMLTMP=TMP+"/lamina"+li+".html";
 fs.writeFileSync(HTMLTMP,html,"utf8");
 const url=pathToFileURL(HTMLTMP).href;
 process.stdout.write("lamina "+(li+1)+": "+NFRAMES+" cuadros ");
 for(let f=0;f<NFRAMES;f++){
  const ms=Math.max(1,Math.round(f*1000/FPS));
  const png=TMP+"/f"+String(nCuadro).padStart(4,"0")+".png";
  try{
   execFileSync(CHROME,["--headless=new","--disable-gpu","--no-sandbox","--hide-scrollbars",
    "--window-size="+W+","+H,"--virtual-time-budget="+ms,
    "--screenshot="+png, url],{stdio:"ignore",timeout:60000});
  }catch(e){}
  if(!fs.existsSync(png)) throw new Error("Chrome no escribio el cuadro "+nCuadro);
  if(f%10===0) process.stdout.write(".");
  nCuadro++;
 }
 console.log(" ok");
});

// ---------------- ensamblar ----------------
fs.mkdirSync(path.dirname(OUT),{recursive:true});
try{fs.rmSync(OUT,{force:true});}catch(e){}
const OUTTMP=TMP+"/salida.mp4";
execFileSync(FFMPEG,["-y","-framerate",String(FPS),"-i",TMP+"/f%04d.png",
 "-c:v","libx264","-preset","slow","-crf","20","-pix_fmt","yuv420p",
 "-r","24","-movflags","+faststart",OUTTMP],{stdio:"ignore"});
if(!fs.existsSync(OUTTMP)) throw new Error("ffmpeg no escribió el MP4");
fs.copyFileSync(OUTTMP,OUT);
const kb=Math.round(fs.statSync(OUT).size/1024);
console.log("MP4: "+OUT+"  ("+kb+" KB, "+(SEG*SRCS.length)+" s, "+W+"x"+H+")");
