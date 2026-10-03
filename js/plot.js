/* ===== 輕量 SVG 坐標平面繪圖引擎（無外部套件） ===== */
(function(){
const NS = 'http://www.w3.org/2000/svg';
const COL = {blue:'#2f9cf0', green:'#12a874', orange:'#ff8a3d', red:'#e5484d', pink:'#ff5fa2', violet:'#a259ff', ink:'var(--axis)', sun:'#ffb020', pri:'#5b5bf6', sky:'#2f9cf0', coral:'#ff6b6b'};
function el(tag, attrs, parent){ const e=document.createElementNS(NS,tag); for(const k in attrs){ if(attrs[k]!==undefined && attrs[k]!==null) e.setAttribute(k,attrs[k]); } if(parent) parent.appendChild(e); return e; }
const fmt = v => { if(Math.abs(v-Math.round(v))<1e-9) return String(Math.round(v)).replace('-','−'); return (Math.round(v*100)/100).toString().replace('-','−'); };

/* 半平面裁切（Sutherland–Hodgman）：保留 a x + b y <= c */
function clip(poly, a, b, c){
  const out=[]; const n=poly.length; if(!n) return out;
  const f = p => a*p[0]+b*p[1]-c;
  for(let i=0;i<n;i++){
    const P=poly[i], Q=poly[(i+1)%n], fp=f(P), fq=f(Q);
    if(fp<=1e-9) out.push(P);
    if((fp<-1e-9 && fq>1e-9) || (fp>1e-9 && fq<-1e-9)){
      const t=fp/(fp-fq); out.push([P[0]+t*(Q[0]-P[0]), P[1]+t*(Q[1]-P[1])]);
    }
  }
  return out;
}
/* 求可行解區域：cons = [[a,b,c,strict], ...] 代表 a x + b y <= c */
function region(cons, box){
  let poly = [[box[0],box[2]],[box[1],box[2]],[box[1],box[3]],[box[0],box[3]]];
  for(const k of cons){ poly = clip(poly,k[0],k[1],k[2]); if(!poly.length) break; }
  // 去除重複點
  const res=[]; for(const p of poly){ const q=res[res.length-1]; if(!q || Math.hypot(p[0]-q[0],p[1]-q[1])>1e-7) res.push(p); }
  if(res.length>1){ const a=res[0], z=res[res.length-1]; if(Math.hypot(a[0]-z[0],a[1]-z[1])<1e-7) res.pop(); }
  return res;
}
/* 真正的頂點（兩條限制直線交點且滿足所有限制），以及是否有界 */
function vertices(cons){
  const vs=[];
  for(let i=0;i<cons.length;i++) for(let j=i+1;j<cons.length;j++){
    const [a1,b1,c1]=cons[i],[a2,b2,c2]=cons[j]; const d=a1*b2-a2*b1; if(Math.abs(d)<1e-12) continue;
    const x=(c1*b2-c2*b1)/d, y=(a1*c2-a2*c1)/d;
    if(cons.every(k=>k[0]*x+k[1]*y<=k[2]+1e-7) && !vs.some(v=>Math.hypot(v[0]-x,v[1]-y)<1e-7)) vs.push([x,y]);
  }
  // 依角度排序
  if(vs.length>2){ const cx=vs.reduce((s,v)=>s+v[0],0)/vs.length, cy=vs.reduce((s,v)=>s+v[1],0)/vs.length; vs.sort((p,q)=>Math.atan2(p[1]-cy,p[0]-cx)-Math.atan2(q[1]-cy,q[0]-cx)); }
  return vs;
}
function bounded(cons){ const big=1e6; const r=region(cons,[-big,big,-big,big]); if(!r.length) return true; return r.every(p=>Math.abs(p[0])<big*0.5 && Math.abs(p[1])<big*0.5); }
/* 目標函數 p x + q y 在區域上的最大/最小（考慮無界） */
function optimize(cons, p, q){
  const vs=vertices(cons);
  const r1=region(cons,[-1e4,1e4,-1e4,1e4]), r2=region(cons,[-2e4,2e4,-2e4,2e4]);
  if(!r1.length) return {empty:true, vs:[]};
  const f=v=>p*v[0]+q*v[1];
  const mx1=Math.max(...r1.map(f)), mx2=Math.max(...r2.map(f)), mn1=Math.min(...r1.map(f)), mn2=Math.min(...r2.map(f));
  const vv=vs.map(v=>({x:v[0],y:v[1],val:f(v)}));
  const maxExists=Math.abs(mx2-mx1)<1e-6 && vv.length>0, minExists=Math.abs(mn2-mn1)<1e-6 && vv.length>0;
  return {empty:false, vs:vv, max:maxExists?mx1:null, min:minExists?mn1:null, maxExists, minExists, bounded:bounded(cons)};
}
class Plot{
  constructor(host, o){
    this.host = typeof host==='string'? document.querySelector(host): host;
    this.o = Object.assign({x:[-5,5], y:[-5,5], w:400, grid:1, labels:true, equal:true, pad:18}, o||{});
    this.build();
  }
  build(){
    const o=this.o; const [x0,x1]=o.x,[y0,y1]=o.y;
    const W=o.w; const pl=o.padL||o.pad, pr=o.padR||o.pad; this.pl=pl; const sx=(W-pl-pr)/(x1-x0);
    const sy = o.equal? sx : (o.h? (o.h-2*o.pad)/(y1-y0) : sx);
    const H = o.h || (y1-y0)*sy + 2*o.pad;
    this.W=W; this.H=H; this.sx=sx; this.sy=sy;
    this.host.innerHTML='';
    this.svg = el('svg',{viewBox:`0 0 ${W} ${H}`, role:'img', 'aria-label':o.aria||'坐標平面'}, this.host);
    el('rect',{x:0,y:0,width:W,height:H,rx:10,style:'fill:var(--card)'},this.svg);
    this.gGrid=el('g',{},this.svg); this.gReg=el('g',{},this.svg); this.gAxis=el('g',{},this.svg);
    this.gLine=el('g',{},this.svg); this.gDyn=el('g',{},this.svg); this.gPt=el('g',{},this.svg); this.gTop=el('g',{},this.svg);
    this.drawGrid();
  }
  X(x){ return this.pl+(x-this.o.x[0])*this.sx; }
  Y(y){ return this.H-this.o.pad-(y-this.o.y[0])*this.sy; }
  inv(px,py){ const r=this.svg.getBoundingClientRect(); const ux=(px-r.left)/r.width*this.W, uy=(py-r.top)/r.height*this.H; return [this.o.x[0]+(ux-this.pl)/this.sx, this.o.y[0]+(this.H-this.o.pad-uy)/this.sy]; }
  drawGrid(){
    const o=this.o, g=this.gGrid; const gx=o.gx||o.grid, gy=o.gy||o.grid;
    if(gx){ for(let x=Math.ceil(o.x[0]/gx)*gx; x<=o.x[1]+1e-9; x+=gx) el('line',{x1:this.X(x),y1:this.Y(o.y[0]),x2:this.X(x),y2:this.Y(o.y[1]),style:'stroke:var(--grid)','stroke-width':1},g);
      for(let y=Math.ceil(o.y[0]/gy)*gy; y<=o.y[1]+1e-9; y+=gy) el('line',{x1:this.X(o.x[0]),y1:this.Y(y),x2:this.X(o.x[1]),y2:this.Y(y),style:'stroke:var(--grid)','stroke-width':1},g); }
    const a=this.gAxis, axis='stroke:var(--axis)';
    if(o.y[0]<=0 && o.y[1]>=0){ el('line',{x1:this.X(o.x[0]),y1:this.Y(0),x2:this.X(o.x[1])+8,y2:this.Y(0),style:axis,'stroke-width':1.6},a); el('path',{d:`M${this.X(o.x[1])+12} ${this.Y(0)} l-9 -4 v8z`,style:'fill:var(--axis)'},a); el('text',{x:this.X(o.x[1])+3,y:this.Y(0)+16,'font-size':14,'font-style':'italic','font-family':'serif',style:'fill:var(--axis)'},a).textContent='x'; }
    if(o.x[0]<=0 && o.x[1]>=0){ el('line',{x1:this.X(0),y1:this.Y(o.y[0]),x2:this.X(0),y2:this.Y(o.y[1])-8,style:axis,'stroke-width':1.6},a); el('path',{d:`M${this.X(0)} ${this.Y(o.y[1])-12} l-4 9 h8z`,style:'fill:var(--axis)'},a); el('text',{x:this.X(0)+6,y:this.Y(o.y[1])-2,'font-size':14,'font-style':'italic','font-family':'serif',style:'fill:var(--axis)'},a).textContent='y';
      if(o.y[0]<=0 && o.y[1]>=0) el('text',{x:this.X(0)-13,y:this.Y(0)+15,'font-size':13,'font-style':'italic','font-family':'serif',style:'fill:var(--axis)'},a).textContent='O'; }
    if(o.ticks){ const t=o.ticks; for(let x=Math.ceil(o.x[0]/t[0])*t[0]; x<=o.x[1]; x+=t[0]){ if(Math.abs(x)<1e-9) continue; el('text',{x:this.X(x),y:this.Y(0)+14,'font-size':11,'text-anchor':'middle',style:'fill:var(--muted)'},a).textContent=fmt(x);} for(let y=Math.ceil(o.y[0]/t[1])*t[1]; y<=o.y[1]; y+=t[1]){ if(Math.abs(y)<1e-9) continue; el('text',{x:this.X(0)-5,y:this.Y(y)+4,'font-size':11,'text-anchor':'end',style:'fill:var(--muted)'},a).textContent=fmt(y);} }
  }
  /* 直線 ax+by=c 與視窗交出的線段 */
  seg(a,b,c){
    const o=this.o; const pts=[]; const [x0,x1]=o.x,[y0,y1]=o.y;
    if(Math.abs(b)>1e-12){ for(const x of [x0,x1]){ const y=(c-a*x)/b; if(y>=y0-1e-9&&y<=y1+1e-9) pts.push([x,y]); } }
    if(Math.abs(a)>1e-12){ for(const y of [y0,y1]){ const x=(c-b*y)/a; if(x>=x0-1e-9&&x<=x1+1e-9) pts.push([x,y]); } }
    const u=[]; for(const p of pts) if(!u.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-7)) u.push(p);
    return u.length>=2? [u[0],u[1]] : null;
  }
  line(L, g){
    const s=this.seg(L.a,L.b,L.c); if(!s) return null; g=g||this.gLine;
    const color=COL[L.color]||L.color||COL.ink;
    const ln=el('line',{x1:this.X(s[0][0]),y1:this.Y(s[0][1]),x2:this.X(s[1][0]),y2:this.Y(s[1][1]),'stroke-width':L.w||2.4,'stroke-linecap':'round','stroke-dasharray':L.dash?'7 6':null,style:`stroke:${color}`},g);
    if(L.label){
      const A=s[0],B=s[1]; const [P,Q]=(A[0]<B[0]||(A[0]===B[0]&&A[1]<B[1]))?[A,B]:[B,A];
      let p, anchor=L.anchor, dx=L.dx, dy=L.dy;
      if(L.at){ p=L.at; }
      else if(L.side==='end'){ p=Q; anchor=anchor||'start'; dx=dx===undefined?6:dx; dy=dy===undefined?5:dy; }
      else if(L.side==='start'){ p=P; anchor=anchor||'end'; dx=dx===undefined?-6:dx; dy=dy===undefined?5:dy; }
      else { const t=L.pos===undefined?0.88:L.pos; const [U,V]=(A[1]>B[1]||(A[1]===B[1]&&A[0]>B[0]))?[B,A]:[A,B]; p=[U[0]+(V[0]-U[0])*t, U[1]+(V[1]-U[1])*t]; }
      if(dx===undefined) dx=6; if(dy===undefined) dy=-6; anchor=anchor||'start';
      const px=this.X(p[0])+dx, py=this.Y(p[1])+dy, est=String(L.label).length*(L.size||15)*0.55;
      if(!L.at && !L.side){ if(anchor==='start' && px+est>this.W-4){ anchor='end'; dx=-Math.abs(dx); } if(anchor==='end' && px-est<4){ anchor='start'; dx=Math.abs(dx); } if(py<14) dy+=18; if(py>this.H-4) dy-=16; }
      this.text({x:p[0],y:p[1],t:L.label,color:color,dx,dy,anchor,italic:true,size:L.size},g);
    }
    return ln;
  }
  shade(cons, opt, g){
    opt=opt||{}; const o=this.o; const m=2/this.sx;
    const poly=region(cons,[o.x[0]-m,o.x[1]+m,o.y[0]-m,o.y[1]+m]); if(poly.length<3) return null;
    return el('polygon',{points:poly.map(p=>this.X(p[0])+','+this.Y(p[1])).join(' '),style:`fill:${opt.fill||'var(--region)'};stroke:${opt.stroke||'none'}`,'stroke-width':opt.sw||0},g||this.gReg);
  }
  poly(pts, opt, g){ opt=opt||{}; return el('polygon',{points:pts.map(p=>this.X(p[0])+','+this.Y(p[1])).join(' '),style:`fill:${opt.fill||'none'};stroke:${COL[opt.stroke]||opt.stroke||'none'}`,'stroke-width':opt.sw||2.4,'stroke-dasharray':opt.dash?'7 6':null},g||this.gReg); }
  segment(S, g){ const color=COL[S.color]||S.color||COL.ink; return el('line',{x1:this.X(S.p[0]),y1:this.Y(S.p[1]),x2:this.X(S.q[0]),y2:this.Y(S.q[1]),'stroke-width':S.w||2.6,'stroke-linecap':'round','stroke-dasharray':S.dash?'7 6':null,style:`stroke:${color}`},g||this.gLine); }
  point(P, g){
    g=g||this.gPt; const color=COL[P.color]||P.color||COL.ink;
    const c=el('circle',{cx:this.X(P.x),cy:this.Y(P.y),r:P.r||4.5,style:P.open?`fill:var(--card);stroke:${color}`:`fill:${color};stroke:var(--card)`,'stroke-width':P.open?2.2:1.5},g);
    if(P.label) this.text({x:P.x,y:P.y,t:P.label,color:P.lc||'var(--ink)',dx:P.dx===undefined?7:P.dx,dy:P.dy===undefined?-7:P.dy,anchor:P.anchor||'start',size:P.size||14,weight:600},g);
    return c;
  }
  text(T, g){
    const t=el('text',{x:this.X(T.x)+(T.dx||0),y:this.Y(T.y)+(T.dy||0),'font-size':T.size||15,'text-anchor':T.anchor||'start','font-weight':T.weight||600,'font-family':T.italic?'"Times New Roman",serif':null,'font-style':T.italic?'italic':null,style:`fill:${COL[T.color]||T.color||'var(--ink)'};paint-order:stroke;stroke:var(--card);stroke-width:3px`},g||this.gTop);
    t.textContent=T.t; return t;
  }
  clearDyn(){ this.gDyn.innerHTML=''; }
  draw(spec){
    (spec.regions||[]).forEach(r=>this.shade(r.cons,r));
    (spec.polys||[]).forEach(p=>this.poly(p.pts,p));
    (spec.lines||[]).forEach(l=>this.line(l));
    (spec.segs||[]).forEach(s=>this.segment(s));
    (spec.points||[]).forEach(p=>this.point(p));
    (spec.texts||[]).forEach(t=>this.text(t));
    return this;
  }
}

/* ===== 課本圖形定義 ===== */
const L=(a,b,c,color,label,extra)=>Object.assign({a,b,c,color,label},extra||{});
const ge=(a,b,c,strict)=>[-a,-b,-c,!!strict];   // a x + b y >= c
const le=(a,b,c,strict)=>[a,b,c,!!strict];      // a x + b y <= c
const F = {
  f1:{o:{x:[-4,4],y:[-4,4],grid:0}, s:{lines:[L(2.6,1,-4,'blue'),L(2.6,1,0,'blue'),L(2.6,1,4,'blue')], segs:[{p:[-2.2,0],q:[2.2,0],color:'orange',w:2},{p:[0,-3.2],q:[0,3.2],color:'orange',w:2}]}},
  f2:{o:{x:[-4,4],y:[-4,4],padR:110,w:470}, s:{lines:[L(1,-1,0,'blue','L₀：x−y=0',{side:'end'})]}},
  f3:{o:{x:[-4,4],y:[-4,4],padR:120,w:480}, s:{lines:[L(1,-1,0,'blue','L₀：x−y=0',{side:'end'}),L(1,-1,1,'green','L₁：x−y=1',{side:'end'}),L(1,-1,2,'orange','L₂：x−y=2',{side:'end'}),L(1,-1,3,'red','L₃：x−y=3',{side:'end'})]}},
  f4:{o:{x:[-4,4],y:[-4,4],padR:110,w:470}, s:{lines:[L(1,-1,0,'blue','L₀：x−y=0',{side:'end'})]}},
  f4ans:{o:{x:[-4,4],y:[-4,4],padL:120,padR:100,w:540}, s:{lines:[L(1,-1,0,'blue','L₀：x−y=0',{side:'end'}),L(1,-1,-1,'green','L₄：x−y=−1',{side:'start'}),L(1,-1,-2,'orange','L₅：x−y=−2',{side:'start'}),L(1,-1,-3,'red','L₆：x−y=−3',{side:'start'})]}},
  f5:{o:{x:[-7,9],y:[-1,10]}, s:{lines:[L(1,1,1,'blue','L₁：x+y−1=0',{at:[-1,2],anchor:'end',dx:-4,dy:5}),L(1,1,2,'green','L₂：x+y−2=0',{at:[-1,3],anchor:'end',dx:-4,dy:5}),L(1,1,3,'orange','L₃：x+y−3=0',{at:[-1,4],anchor:'end',dx:-4,dy:5}),L(1,1,8,'red','Lₙ：x+y−n=0',{at:[-1,9],anchor:'end',dx:-4,dy:5})], texts:[{x:2.4,y:3.4,t:'⋰',size:20}]}},
  f6:{o:{x:[-2,10],y:[-2,10],pad:24}, s:{lines:[L(2,1,2,'blue','L₁：2x+y=2',{at:[1.2,-2],dy:18,anchor:'middle',dx:0}),L(2,1,4,'green','L₂：2x+y=4',{at:[-1.2,6.6],dy:0,anchor:'start',dx:10}),L(2,1,6,'orange','L₃：2x+y=6',{at:[5,-2],dy:18,anchor:'middle',dx:0})], points:[{x:1,y:0,label:'(1, 0)',dy:16},{x:2,y:0,label:'(2, 0)',dy:16},{x:3,y:0,label:'(3, 0)',dy:16}]}},
  f7a:{o:{x:[-2,4],y:[-2,4],grid:0}, s:{lines:[L(1,1,2,'blue','L：x+y=2',{pos:.08,dy:16,dx:-30})]}},
  f7b:{o:{x:[-2,4],y:[-2,4],grid:0}, s:{regions:[{cons:[ge(1,1,2,true)],fill:'rgba(18,168,116,.25)'}],lines:[L(1,1,2,'blue','L：x+y=2',{dash:true,pos:.08,dy:16,dx:-30})],texts:[{x:3.1,y:3.3,t:'E₁',color:'green',italic:true}]}},
  f7c:{o:{x:[-2,4],y:[-2,4],grid:0}, s:{regions:[{cons:[le(1,1,2,true)],fill:'rgba(255,138,61,.25)'}],lines:[L(1,1,2,'blue','L：x+y=2',{dash:true,pos:.08,dy:16,dx:-30})],texts:[{x:-1.6,y:-1.5,t:'E₂',color:'orange',italic:true}]}},
  f8a:{o:{x:[-2,4],y:[-2,4],grid:0}, s:{regions:[{cons:[ge(1,1,2)],fill:'rgba(18,168,116,.25)'}],lines:[L(1,1,2,'blue','L：x+y=2',{pos:.08,dy:16,dx:-30})]}},
  f8b:{o:{x:[-2,4],y:[-2,4],grid:0}, s:{regions:[{cons:[le(1,1,2)],fill:'rgba(255,138,61,.25)'}],lines:[L(1,1,2,'blue','L：x+y=2',{pos:.08,dy:16,dx:-30})]}},
  f8c:{o:{x:[-2,4],y:[-2,4],grid:0}, s:{regions:[{cons:[le(1,1,2,true)],fill:'rgba(255,138,61,.25)'}],lines:[L(1,1,2,'blue','L：x+y=2',{dash:true,pos:.08,dy:16,dx:-30})]}},
  f9:{o:{x:[-4,4],y:[-4,4]}, s:{regions:[{cons:[le(1,-2,-2)],fill:'rgba(47,156,240,.25)'}],lines:[L(1,-2,-2,'blue','L₁：x−2y+2=0',{pos:.12,dy:18,dx:-10})]}},
  f10:{o:{x:[-4,4],y:[-4,4]}, s:{regions:[{cons:[ge(1,1,-2,true)],fill:'rgba(255,138,61,.25)'}],lines:[L(1,1,-2,'orange','L₂：x+y+2=0',{dash:true,pos:.05,dy:16,dx:-20})]}},
  f11:{o:{x:[-4,4],y:[-4,4]}, s:{regions:[{cons:[le(1,-2,-2),ge(1,1,-2,true)],fill:'var(--region2)'}],lines:[L(1,-2,-2,'blue','L₁：x−2y+2=0',{pos:.12,dy:18,dx:-10}),L(1,1,-2,'orange','L₂：x+y+2=0',{dash:true,pos:.05,dy:16,dx:-20})],segs:[{p:[-2,0],q:[4,3],color:'red'}],points:[{x:-2,y:0,open:true,color:'red'}]}},
  blank4:{o:{x:[-4,4],y:[-4,4]}, s:{}},
  blank5:{o:{x:[-5,5],y:[-5,5]}, s:{}},
  f12ans:{o:{x:[-4,4],y:[-4,4]}, s:{regions:[{cons:[le(2,-1,2)],fill:'rgba(47,156,240,.25)'}],lines:[L(2,-1,2,'blue','2x−y−2=0',{pos:.9,dx:-80})]}},
  f13ans:{o:{x:[-4,4],y:[-4,4]}, s:{regions:[{cons:[le(2,-1,2),ge(1,3,3,true)],fill:'var(--region2)'}],lines:[L(2,-1,2,'blue','2x−y−2=0',{pos:.9,dx:-80}),L(1,3,3,'orange','x+3y−3=0',{dash:true,pos:.05,dy:16,dx:0})],points:[{x:9/7,y:4/7,open:true,color:'red'}]}},
  f14:{o:{x:[-4,8],y:[-3,6],ticks:[2,2]}, s:{regions:[{cons:[ge(1,2,6),le(1,-1,2),le(0,1,4)]}],lines:[L(1,2,6,'ink','x+2y=6',{at:[-3.8,4.9],dx:0,dy:-4}),L(1,-1,2,'ink','x−y=2',{pos:.97,dx:-50}),L(0,1,4,'ink','y=4',{at:[7,4],dy:-6,dx:0})],polys:[{pts:[[-2,4],[10/3,4/3],[6,4]],stroke:'blue'}],points:[{x:-2,y:4,label:'A(−2, 4)',dx:-8,dy:-8,anchor:'end'},{x:10/3,y:4/3,label:'B(10/3, 4/3)',dx:8,dy:14},{x:6,y:4,label:'C(6, 4)',dx:-6,dy:-10,anchor:'end'}]}},
  f15:{o:{x:[-4,8],y:[-3,6],ticks:[2,2]}, s:{regions:[{cons:[ge(1,2,6),le(1,-1,2),le(0,1,4)]}],lines:[L(1,2,6,'ink'),L(1,-1,2,'ink'),L(0,1,4,'ink'),L(1,1,2,'green','x+y=2',{at:[-1,3],dy:28,dx:10}),L(1,1,10,'green','x+y=10',{at:[4.6,5.4],dx:8,dy:4})],polys:[{pts:[[-2,4],[10/3,4/3],[6,4]],stroke:'blue'}],points:[{x:-2,y:4,label:'A(−2, 4)',dx:-8,anchor:'end'},{x:10/3,y:4/3,label:'B(10/3, 4/3)',dx:8,dy:16},{x:6,y:4,label:'C(6, 4)',dx:-6,dy:-10,anchor:'end'}]}},
  f16:{o:{x:[-1,5],y:[-1,4.2]}, s:{regions:[{cons:[le(1,2,6),le(2,1,6),ge(1,0,0),ge(0,1,0)]}],lines:[L(1,2,6,'ink','x+2y=6',{pos:.12,dy:20,dx:-30}),L(2,1,6,'ink','2x+y=6',{pos:.02,dy:4,dx:6})],polys:[{pts:[[0,0],[3,0],[2,2],[0,3]],stroke:'blue'}],points:[{x:0,y:0},{x:3,y:0,label:'A(3, 0)',dy:16,dx:-8,anchor:'end'},{x:2,y:2,label:'B(2, 2)',dx:-8,anchor:'end',dy:14},{x:0,y:3,label:'C(0, 3)',dx:-6,anchor:'end',dy:-4}]}},
  f17:{o:{x:[-1,5],y:[-1,4.2]}, s:{regions:[{cons:[le(1,2,6),le(2,1,6),ge(1,0,0),ge(0,1,0)]}],lines:[L(1,2,6,'ink','x+2y=6',{pos:.12,dy:20,dx:-30}),L(2,1,6,'ink','2x+y=6',{pos:.02,dy:4,dx:6}),L(1,3,0,'orange','',{dash:true,w:1.6}),L(1,3,3,'orange','',{dash:true,w:1.6}),L(1,3,8,'orange','',{dash:true,w:1.6}),L(1,3,9,'orange','',{dash:true,w:1.6})],polys:[{pts:[[0,0],[3,0],[2,2],[0,3]],stroke:'blue'}],points:[{x:0,y:0},{x:3,y:0,label:'A(3, 0)',dy:16,dx:-8,anchor:'end'},{x:2,y:2,label:'B(2, 2)',dx:-8,anchor:'end',dy:14},{x:0,y:3,label:'C(0, 3)',dx:-6,anchor:'end',dy:-4}]}},
  f20:{o:{x:[-2,16],y:[-3,24],gx:2,gy:2,equal:false,h:420,ticks:[4,4]}, s:{regions:[{cons:[le(5,4,80),le(3,1,30),ge(1,0,0),ge(0,1,0)]}],lines:[L(5,4,80,'ink','5x+4y=80',{pos:.03,dy:16,dx:-10}),L(3,1,30,'ink','3x+y=30',{pos:.03,dy:16,dx:-58}),L(25,12,100,'orange','',{dash:true,w:1.5}),L(25,12,200,'orange','',{dash:true,w:1.5}),L(25,12,2080/7,'orange','',{dash:true,w:1.8})],polys:[{pts:[[0,0],[10,0],[40/7,90/7],[0,20]],stroke:'blue'}],points:[{x:40/7,y:90/7,label:'(40/7, 90/7)',color:'sun',r:6}]}},
  f21:{o:{x:[-1,12],y:[-1,12],ticks:[2,2]}, s:{regions:[{cons:[ge(1,2,8),ge(2,1,10),ge(1,0,0),ge(0,1,0)]}],lines:[L(1,2,8,'ink','x+2y=8',{pos:.03,dy:16,dx:4}),L(2,1,10,'ink','2x+y=10',{pos:.02,dy:16,dx:-70})],segs:[{p:[0,12],q:[0,10],color:'blue'},{p:[0,10],q:[4,2],color:'blue'},{p:[4,2],q:[8,0],color:'blue'},{p:[8,0],q:[12,0],color:'blue'}],points:[{x:0,y:10,label:'(0, 10)',dx:-6,anchor:'end'},{x:4,y:2,label:'(4, 2)',dx:6,dy:-6},{x:8,y:0,label:'(8, 0)',dy:-8}]}},
  pr4ans:{o:{x:[-2,14],y:[-2,14],ticks:[5,5]}, s:{regions:[{cons:[ge(1,1,10),le(1,-1,0),le(0,1,10)]}],lines:[L(1,1,10,'ink','x+y=10',{pos:.05,dy:16}),L(1,-1,0,'ink','x−y=0',{pos:.95,dx:-50}),L(0,1,10,'ink','y=10',{at:[12,10],dy:-6})],points:[{x:5,y:5,label:'(5, 5)',dy:16},{x:10,y:10,label:'(10, 10) 最大',color:'sun',r:6,dy:18,dx:-20},{x:0,y:10,label:'(0, 10) 最小',color:'coral',r:6,dx:6,dy:-8}]}},
  pr5ans:{o:{x:[-2,22],y:[-2,34],gx:2,gy:2,ticks:[6,6],equal:false,h:380}, s:{regions:[{cons:[le(5,2,90),le(1,1,30),ge(1,0,0),ge(0,1,0)]}],lines:[L(5,2,90,'ink','5x+2y=90',{pos:.05,dy:16,dx:-10}),L(1,1,30,'ink','x+y=30',{pos:.08,dy:16})],points:[{x:0,y:0},{x:18,y:0,label:'(18, 0)',dy:-8},{x:10,y:20,label:'(10, 20)',color:'sun',r:6},{x:0,y:30,label:'(0, 30)',dx:6}]}},
  pr6ans:{o:{x:[-1,12],y:[-1,10],ticks:[2,2]}, s:{regions:[{cons:[ge(4,2,16),ge(2,7,20),ge(1,0,0),ge(0,1,0)]}],lines:[L(4,2,16,'ink','4x+2y=16',{pos:.95,dx:6}),L(2,7,20,'ink','2x+7y=20',{pos:.05,dy:16})],points:[{x:0,y:8,label:'(0, 8)',dx:6},{x:3,y:2,label:'(3, 2)',color:'sun',r:6,dx:6,dy:-6},{x:10,y:0,label:'(10, 0)',dy:-8}]}},
  e1ans:{o:{x:[-6,10],y:[-8,8],ticks:[2,2]}, s:{regions:[{cons:[le(3,2,12),ge(1,1,2,true)],fill:'var(--region2)'}],lines:[L(3,2,12,'blue','3x+2y−12=0',{pos:.9,dx:6}),L(1,1,2,'orange','x+y−2=0',{dash:true,pos:.1,dx:6,dy:12})],points:[{x:8,y:-6,open:true,color:'red',label:'(8, −6)',dx:8}]}},
  e2:{o:{x:[-1,8],y:[-1,4]}, s:{regions:[{cons:[le(2,3,12),ge(1,-3,-3,true)],fill:'var(--region2)'}],lines:[L(2,3,12,'blue'),L(1,-3,-3,'orange','',{dash:true})],segs:[{p:[3,2],q:[7.5,-1],color:'red'}],points:[{x:3,y:2,open:true,color:'red',label:'(3, 2)',dy:-8},{x:0,y:1,open:true,color:'red',label:'(0, 1)',dy:14},{x:6,y:0,color:'red',label:'(6, 0)',dy:-8}]}},
  e4:{o:{x:[-0.5,4.5],y:[-0.5,4.5],grid:0}, s:{lines:[L(1,-2,0,'blue','L：x−2y=0',{pos:.97,dx:-90,dy:-8})],points:[{x:1,y:2,label:'A',color:'orange',dx:-14,dy:5},{x:2.5,y:2,label:'D',color:'orange'},{x:1,y:3.5,label:'B',color:'orange',dx:-14,dy:5},{x:2.5,y:3.5,label:'C',color:'orange'}]}},
  e6:{o:{x:[-4,3],y:[-3,4],grid:0}, s:{lines:[L(-3,1,-3,'blue','L₁',{pos:.97}),L(-3,1,1.5,'green','L₂',{pos:.97}),L(-3,1,6,'orange','L₃',{pos:.97,anchor:'end',dx:-6})]}},
  e7:{o:{x:[-3.2,2.2],y:[-0.8,4.2],grid:0}, s:{polys:[{pts:[[-1.5,0],[0.5,0],[1.5,1.732],[0.5,3.464],[-1.5,3.464],[-2.5,1.732]],stroke:'sky'}],points:[{x:-1.5,y:0,label:'A',dy:16,dx:-4},{x:0.5,y:0,label:'B',dy:16},{x:1.5,y:1.732,label:'C'},{x:0.5,y:3.464,label:'D'},{x:-1.5,y:3.464,label:'E',dx:-14},{x:-2.5,y:1.732,label:'F',dx:-16}]}},
  e7ans:{o:{x:[-3.2,2.2],y:[-0.8,4.2],grid:0}, s:{polys:[{pts:[[-1.5,0],[0.5,0],[1.5,1.732],[0.5,3.464],[-1.5,3.464],[-2.5,1.732]],stroke:'sky'}],lines:[L(3,-2,1.5,'pink','k 最大',{dash:true,pos:.9,dx:4}),L(3,-2,1.036,'violet','',{dash:true,w:1.5})],points:[{x:0.5,y:0,label:'B',dy:16,color:'sun',r:6},{x:1.5,y:1.732,label:'C'}]}},
  e8ans:{o:{x:[-5,50],y:[-5,55],gx:5,gy:5,ticks:[10,10]}, s:{regions:[{cons:[le(1,1,50),ge(1,1,30),le(1,0,40),ge(1,0,0),ge(0,1,0),le(0,1,50)]}],lines:[L(1,1,50,'ink','x+y=50',{pos:.05,dy:16}),L(1,1,30,'ink','x+y=30',{pos:.05,dy:16,dx:-40}),L(1,0,40,'ink','x=40',{at:[40,50],dx:4})],points:[{x:40,y:10,label:'(40, 10)',color:'sun',r:6,dx:6},{x:30,y:0},{x:40,y:0},{x:0,y:50},{x:0,y:30}]}},
  e9:{o:{x:[-6,24],y:[-3,38],equal:true,grid:5}, s:{regions:[{cons:[ge(2,-1,7),le(1,-1,-14),ge(4,3,19)]}],lines:[L(2,-1,7,'ink'),L(1,-1,-14,'ink'),L(4,3,19,'ink')],polys:[{pts:[[4,1],[21,35],[-23/7,75/7]],stroke:'blue'}],points:[{x:4,y:1,label:'A',dy:16},{x:21,y:35,label:'B',dx:-16},{x:-23/7,y:75/7,label:'C',dx:-16},{x:5,y:3,color:'red',label:'(5, 3)',dx:8,dy:10},{x:7,y:7,color:'red',label:'(7, 7)',dx:8,dy:6}]}},
  e5ans:{o:{x:[-1,4],y:[-1,4.5]}, s:{regions:[{cons:[le(3,2,6),ge(1,0,0),ge(0,1,0)]}],lines:[L(3,2,6,'ink','3x+2y=6',{pos:.05,dy:16})],points:[[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[2,0]].map(p=>({x:p[0],y:p[1],color:'pink',r:6}))}},
  e10ans:{o:{x:[-2,30],y:[-2,46],gx:2,gy:2,ticks:[6,6],equal:false,h:440}, s:{regions:[{cons:[ge(7,2,84),ge(1,2,24),ge(3,2,60),ge(1,0,0),ge(0,1,0)]}],lines:[L(7,2,84,'ink','7x+2y=84',{pos:.95,dx:6}),L(1,2,24,'ink','x+2y=24',{pos:.05,dy:-8,dx:0}),L(3,2,60,'ink','3x+2y=60',{pos:.95,dx:6}),L(5,4,102,'pink','5x+4y=102',{dash:true,pos:.2,dx:4})],points:[{x:0,y:42,label:'(0, 42)',dx:6},{x:6,y:21,label:'(6, 21)',dx:6},{x:18,y:3,label:'(18, 3)',color:'sun',r:6,dx:6,dy:-8},{x:24,y:0,label:'(24, 0)',dy:-8}]}},
  x1:{o:{x:[-1,12],y:[-1,12],ticks:[2,2]}, s:{regions:[{cons:[ge(1,2,8),ge(2,1,10),ge(1,0,0),ge(0,1,0)]}],lines:[L(1,2,8,'ink'),L(2,1,10,'ink'),L(3,2,16,'pink','最小',{dash:true,pos:.1,dx:6}),L(3,2,30,'violet','',{dash:true}),L(3,2,40,'violet','還可再大…',{dash:true,pos:.8,dx:-60})],points:[{x:4,y:2,color:'sun',r:6}]}},
  x2:{o:{x:[-1,5],y:[-1,4.2]}, s:{regions:[{cons:[le(1,2,6),le(2,1,6),ge(1,0,0),ge(0,1,0)]}],lines:[L(1,2,6,'pink','x+2y=6',{pos:.12,dy:20,dx:-30,w:3})],segs:[{p:[0,3],q:[2,2],color:'sun',w:6}],points:[{x:2,y:2,label:'B',color:'sun'},{x:0,y:3,label:'C',color:'sun',dx:-14}]}},
  x3:{o:{x:[-2,7],y:[-2,7]}, s:{regions:[{cons:[le(1,1,2)],fill:'rgba(47,156,240,.22)'},{cons:[ge(1,1,5)],fill:'rgba(255,95,162,.22)'}],lines:[L(1,1,2,'blue','x+y=2',{pos:.1,dy:16}),L(1,1,5,'pink','x+y=5',{pos:.9,dx:6})],texts:[{x:2,y:2.3,t:'沒有交集！',color:'red'}]}}
};
window.LP = {Plot, region, vertices, optimize, bounded, FIGS:F, fmt, le, ge, L, COL};
})();
