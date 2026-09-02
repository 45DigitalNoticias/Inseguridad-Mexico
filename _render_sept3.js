// Render del manifest de septiembre: Chrome headless (NUNCA Edge, se traga el
// --screenshot sin escribir), al DOBLE de resolución -> PNG de 2160x2700.
// Uso: node _render_sept3.js [desde] [hasta]
const fs=require("fs"), {execFileSync}=require("child_process"), {pathToFileURL}=require("url");
const CHROME="C:/Program Files/Google/Chrome/Application/chrome.exe";
const MAN="C:/Users/SRVal/Documents/Claude/Projects/45 DIGITAL NOTICIAS/INSEGURIDAD_MEXICO/_manifest_sept3.txt";
const lineas=fs.readFileSync(MAN,"utf8").trim().split("\n");
const arg2=process.argv[2];
const SOLO=(arg2==="--solo")?process.argv[3]:null;
const desde=SOLO?0:+(arg2||0), hasta=SOLO?lineas.length:+(process.argv[3]||lineas.length);
// Chrome NO escribe si la ruta de --screenshot trae acentos (PROGRAMACIÓN,
// GRÁFICAS): sale con exito y deja 0 bytes. Se captura a un temporal ASCII y
// node hace la copia al destino final, que sí respeta los acentos.
const TMP=(process.env.TEMP||"C:/Windows/Temp").replace(/\\/g,"/")+"/_sept_render";
fs.mkdirSync(TMP,{recursive:true});
let ok=0, mal=[];
lineas.slice(desde,hasta).forEach((ln,i)=>{
 const [html,png,w,h]=ln.split("|");
 if(SOLO&&png.indexOf(SOLO)<0) return;
 const tmpPng=TMP+"/lam_"+String(desde+i).padStart(3,"0")+".png";
 try{fs.rmSync(tmpPng,{force:true});}catch(e){}
 try{
  execFileSync(CHROME,["--headless=new","--disable-gpu","--no-sandbox","--hide-scrollbars",
   "--force-device-scale-factor=2","--window-size="+w+","+h,
   "--virtual-time-budget=9000",
   "--screenshot="+tmpPng, pathToFileURL(html).href],{stdio:"ignore",timeout:90000});
 }catch(e){}
 if(fs.existsSync(tmpPng)&&fs.statSync(tmpPng).size>1000){
  fs.mkdirSync(png.split("/").slice(0,-1).join("/"),{recursive:true});
  fs.copyFileSync(tmpPng,png);}
 const existe=fs.existsSync(png), tam=existe?fs.statSync(png).size:0;
 if(existe&&tam>40000){ok++;console.log(String(desde+i+1).padStart(3)+"  OK   "+(tam/1024).toFixed(0)+" KB  "+png.split("/").slice(-2).join("/"));}
 else {mal.push(png);console.log(String(desde+i+1).padStart(3)+"  FALLA "+tam+" bytes  "+png);}

});
console.log("\nrenderizadas "+ok+" de "+(hasta-desde));
if(mal.length){console.log("FALTAN:\n"+mal.join("\n"));process.exit(1);}
