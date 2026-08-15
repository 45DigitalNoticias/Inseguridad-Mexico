/* Genera _nac_estados_borde.js: la línea divisoria de estados + contorno nacional,
   derivada de la propia geometría municipal con clasificación EXACTA (PIP), offline. */
const fs=require('fs');
const t=fs.readFileSync('_nac_muni_geo.js','utf8').replace('const NAC_MUNI_GEO','global.G');
eval(t);
const F=global.G.features;

// 1) mapa de aristas
const em=new Map();
F.forEach(f=>{const st=(f.properties.k/1000)|0;
  f.geometry.coordinates.forEach(poly=>poly.forEach(ring=>{
    for(let i=0;i+1<ring.length;i++){
      const a=ring[i],b=ring[i+1];
      const ka=a[0].toFixed(4)+','+a[1].toFixed(4),kb=b[0].toFixed(4)+','+b[1].toFixed(4);
      if(ka===kb)continue;
      const k=ka<kb?ka+'|'+kb:kb+'|'+ka;
      let e=em.get(k);if(!e){e={n:0,s:st,d:false,a,b};em.set(k,e);}
      e.n++;if(e.s!==st)e.d=true;
    }}));});

// 2) índice espacial por celdas (bbox)
const bb=F.map(f=>{let a=1e9,b2=1e9,c=-1e9,d=-1e9;
  f.geometry.coordinates.forEach(p=>p.forEach(r=>r.forEach(([x,y])=>{if(x<a)a=x;if(x>c)c=x;if(y<b2)b2=y;if(y>d)d=y;})));
  return[a,b2,c,d];});
const CS=0.25,grid=new Map();
bb.forEach((B,i)=>{for(let gx=Math.floor(B[0]/CS);gx<=Math.floor(B[2]/CS);gx++)
  for(let gy=Math.floor(B[1]/CS);gy<=Math.floor(B[3]/CS);gy++){
    const key=gx+','+gy;let l=grid.get(key);if(!l){l=[];grid.set(key,l);}l.push(i);}});

// 3) punto-en-polígono exacto (even-odd, respeta huecos)
function pip(f,x,y){let inside=false;
  f.geometry.coordinates.forEach(poly=>poly.forEach(ring=>{
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
      if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
    }}));return inside;}
function stateAt(x,y){const l=grid.get(Math.floor(x/CS)+','+Math.floor(y/CS));if(!l)return -1;
  for(const i of l){const B=bb[i];if(x<B[0]||x>B[2]||y<B[1]||y>B[3])continue;
    if(pip(F[i],x,y))return (F[i].properties.k/1000)|0;}
  return -1;}

// 4) clasificación de huérfanos: 1ª distancia donde AMBOS lados resuelven decide
const OFFS=[0.003,0.008,0.02]; // ~330m, ~880m, ~2.2km
const border=[];let nMatch=0,nDiff=0,nCoast=0,nInt=0;
em.forEach(e=>{
  if(e.d){border.push(e);nMatch++;return;}
  if(e.n!==1)return; // compartida mismo estado → interna
  const mx=(e.a[0]+e.b[0])/2,my=(e.a[1]+e.b[1])/2;
  let dx=e.b[0]-e.a[0],dy=e.b[1]-e.a[1];const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;
  let coast=false,verdict=null;
  for(const off of OFFS){
    const s1=stateAt(mx-dy*off,my+dx*off),s2=stateAt(mx+dy*off,my-dx*off);
    if(s1>=0&&s2>=0){verdict=(s1!==s2)?'B':'I';break;}
    if((s1>=0)!==(s2>=0))coast=true;
  }
  if(verdict==='B'){border.push(e);nDiff++;}
  else if(verdict==='I')nInt++;
  else if(coast){border.push(e);nCoast++;}
  else nInt++;
});
console.log('aristas totales:',em.size);
console.log('frontera emparejada (2 estados):',nMatch,'| huérfana inter-estados:',nDiff,'| costa/contorno:',nCoast,'| descartadas internas:',nInt);
console.log('segmentos de borde:',border.length);

// 5) encadenar segmentos en polilíneas (compacta el archivo)
const key=p=>p[0].toFixed(4)+','+p[1].toFixed(4);
const adj=new Map();
border.forEach((e,i)=>{[key(e.a),key(e.b)].forEach(k=>{let l=adj.get(k);if(!l){l=[];adj.set(k,l);}l.push(i);});});
const used=new Array(border.length).fill(false);
const lines=[];
for(let i=0;i<border.length;i++){
  if(used[i])continue;used[i]=true;
  const line=[border[i].a,border[i].b];
  const extend=back=>{for(;;){
    const pt=back?line[line.length-1]:line[0];
    const l=adj.get(key(pt))||[];let nxt=-1;
    for(const si of l){if(!used[si]){nxt=si;break;}}
    if(nxt<0)break;used[nxt]=true;
    const e=border[nxt];const np=key(e.a)===key(pt)?e.b:e.a;
    back?line.push(np):line.unshift(np);
  }};
  extend(true);extend(false);
  lines.push(line);
}
const npts=lines.reduce((s,l)=>s+l.length,0);
console.log('polilíneas:',lines.length,'| puntos:',npts);
const out='const NAC_ESTADOS_BORDE='+JSON.stringify(lines.map(l=>l.map(p=>[+p[0].toFixed(4),+p[1].toFixed(4)])))+';\n';
fs.writeFileSync('_nac_estados_borde.js',out);
console.log('escrito _nac_estados_borde.js:',(out.length/1024).toFixed(0),'KB');
