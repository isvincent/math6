/* ===== 線性規劃互動學習網：主程式 ===== */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const {Plot, region, vertices, optimize, FIGS, fmt} = window.LP;
const D = window.LPDATA;
const KEY='lp-learn-v1', SKEY='lp-learn-settings-v1';

/* ---------------- 狀態與儲存 ---------------- */
const blank=()=>({name:'',lessons:{},reveals:{},checks:{},ex:{},labs:{},practice:{},bestStreak:0,quiz:[],log:[],visits:{},time:0,reflect:'',created:new Date().toISOString()});
function load(k,def){ try{ const v=JSON.parse(localStorage.getItem(k)); return v&&typeof v==='object'? Object.assign(def,v): def; }catch(e){ return def; } }
let S=load(KEY,blank());
let SET=load(SKEY,{fullscreen:'off',sound:'on',device:'auto',layout:'auto',lang:'zh',font:'normal',theme:'system'});
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
function saveSet(){ try{ localStorage.setItem(SKEY,JSON.stringify(SET)); }catch(e){} }
function log(ev,detail){ S.log.push({t:new Date().toISOString(),ev,d:detail||''}); if(S.log.length>600) S.log.splice(0,S.log.length-600); save(); }

/* ---------------- i18n ---------------- */
const lang=()=>SET.lang==='en'?'en':'zh';
const t=k=>(D.T[lang()][k]!==undefined?D.T[lang()][k]:D.T.zh[k]);
const L=o=>typeof o==='object'&&o!==null?(o[lang()]||o.zh):o;
function applyLang(){
  document.documentElement.lang = lang()==='en'?'en':'zh-Hant-TW';
  $$('[data-i18n]').forEach(e=>{ if(e.dataset.zh===undefined) e.dataset.zh=e.innerHTML; const k=e.dataset.i18n; e.innerHTML = (lang()==='en'&&D.EN[k])? D.EN[k] : e.dataset.zh; });
  document.title = lang()==='en'? 'Linear Programming | Interactive Learning' : '線性規劃｜互動學習網';
  renderPre(); buildPTypes(); refreshAll();
  if(curP) renderPQ(); if(quiz && !quiz.done) renderQ();
  if(labC.ready) updateC();
  presetOptions();
}

/* ---------------- 音效（Web Audio，無外部檔案） ---------------- */
let AC=null;
function tone(f,d,type,v,delay){ if(SET.sound!=='on') return; try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); const o=AC.createOscillator(), g=AC.createGain(); const t0=AC.currentTime+(delay||0); o.type=type||'sine'; o.frequency.setValueAtTime(f,t0); g.gain.setValueAtTime(v||.12,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+d); o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0+d+.02);}catch(e){} }
const SND={ click:()=>tone(660,.07,'triangle',.08), ok:()=>{tone(660,.12,'sine',.13);tone(990,.18,'sine',.13,.1);}, bad:()=>{tone(220,.22,'sawtooth',.07);tone(180,.25,'sawtooth',.06,.08);}, win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.25,'triangle',.12,i*.12)), tick:()=>tone(1200,.03,'square',.03), pop:()=>tone(880,.06,'sine',.08) };

/* ---------------- 提示訊息 / 彩帶 ---------------- */
let toastT; function toast(m){ const e=$('#toast'); e.textContent=m; e.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>e.classList.remove('show'),2200); }
function confetti(){ if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const c=$('#confetti'), x=c.getContext('2d'); c.width=innerWidth; c.height=innerHeight; const cols=['#5b5bf6','#ff5fa2','#ffb020','#14b88a','#2f9cf0','#a259ff']; const P=Array.from({length:160},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,vx:(Math.random()-.5)*4,vy:2+Math.random()*4,s:5+Math.random()*7,r:Math.random()*6,c:cols[Math.floor(Math.random()*6)]})); let n=0; (function f(){ x.clearRect(0,0,c.width,c.height); P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.05;p.r+=.1;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore();}); if(++n<220) requestAnimationFrame(f); else x.clearRect(0,0,c.width,c.height); })(); }

/* ---------------- 設定 ---------------- */
function applySettings(){
  const h=document.documentElement;
  h.classList.remove('fs-small','fs-normal','fs-large'); h.classList.add('fs-'+SET.font);
  const dark = SET.theme==='dark' || (SET.theme==='system' && matchMedia('(prefers-color-scheme: dark)').matches);
  h.dataset.theme = dark?'dark':'light';
  const w=innerWidth; const dev = SET.device==='auto'? (w<640?'mobile':w<1024?'tablet':'desktop') : SET.device;
  h.classList.remove('dev-mobile','dev-tablet','dev-desktop'); h.classList.add('dev-'+dev);
  const lay = SET.layout==='auto'? (innerHeight>innerWidth?'portrait':'landscape') : SET.layout;
  h.classList.remove('lay-portrait','lay-landscape'); h.classList.add('lay-'+lay);
  SET.fullscreen = document.fullscreenElement?'on':'off';
  $$('#settingsDlg .seg').forEach(s=>{ const k=s.dataset.set; $$('button',s).forEach(b=>b.classList.toggle('on',b.dataset.v===SET[k])); });
}
function setOpt(k,v){
  if(k==='fullscreen'){ if(v==='on'){ const r=document.documentElement; (r.requestFullscreen||r.webkitRequestFullscreen||function(){toast(t('fsNo'));}).call(r); } else if(document.fullscreenElement){ document.exitFullscreen(); } return; }
  SET[k]=v; saveSet(); applySettings(); if(k==='lang') applyLang(); log('setting',k+'='+v);
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applySettings);
addEventListener('resize',()=>applySettings());
document.addEventListener('fullscreenchange',applySettings);

/* ---------------- 路由 ---------------- */
const PAGES=['home','lesson','lab','exercise','practice','quiz','extend','record'];
function go(p,opts){
  if(!PAGES.includes(p)) p='home';
  $$('.page').forEach(e=>e.classList.toggle('active',e.id==='page-'+p));
  $$('.tab').forEach(b=>{ b.classList.toggle('active',b.dataset.page===p); if(b.dataset.page===p) b.scrollIntoView({block:'nearest',inline:'center'}); });
  S.visits[p]=(S.visits[p]||0)+1; log('visit',p);
  if(location.hash!=='#'+p) history.replaceState(null,'','#'+p);
  if(p==='record') renderRecord();
  if(p==='practice' && !curP) newPQ();
  if(p==='lab'){ showLab((opts&&opts.lab)||curLab||'A'); }
  if(!(opts&&opts.keepScroll)) scrollTo({top:0,behavior:'instant'});
  refreshAll();
}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]'); if(g){ e.preventDefault(); SND.click(); go(g.dataset.go,{lab:g.dataset.lab}); return; }
  const tb=e.target.closest('.tab'); if(tb){ SND.click(); go(tb.dataset.page); return; }
  const tr=e.target.closest('[data-track="pdf"]'); if(tr){ log('download','教材 PDF'); toast('📄 '+(lang()==='en'?'Downloading textbook PDF':'正在下載原始教材 PDF')); }
});
addEventListener('hashchange',()=>{ const p=location.hash.slice(1); if(PAGES.includes(p) && !$('#page-'+p).classList.contains('active')) go(p); });

/* ---------------- 靜態圖形 ---------------- */
function renderFigs(){ $$('[data-fig]').forEach(h=>{ const f=FIGS[h.dataset.fig]; if(!f) return; new Plot(h,Object.assign({aria:'圖形 '+h.dataset.fig},f.o)).draw(f.s); }); }

/* 圖 15：可拖曳的 x+y=k */
function setupF15(){
  const host=$('#f15plot'); const f=FIGS.f15; const P=new Plot(host,f.o).draw(f.s);
  const sl=$('#f15slider'); const cons=[[-1,-2,-6],[1,-1,2],[0,1,4]];
  const upd=()=>{ const k=+sl.value; $('#f15k').textContent=fmt(k); P.clearDyn(); const hit=k>=2-1e-9&&k<=10+1e-9;
    P.line({a:1,b:1,c:k,color:hit?'#ff5fa2':'#a0a4c8',dash:true,w:3,label:'x+y='+fmt(k),pos:.95,dx:-70,dy:14},P.gDyn);
    if(hit){ const seg=region(cons.concat([[1,1,k],[-1,-1,-k]]),[-50,50,-50,50]); if(seg.length>=2){ const a=seg[0], b=seg.reduce((m,p)=>Math.hypot(p[0]-a[0],p[1]-a[1])>Math.hypot(m[0]-a[0],m[1]-a[1])?p:m,a); P.segment({p:a,q:b,color:'#ffb020',w:6},P.gDyn);} }
    $('#f15read').innerHTML = hit? `🟢 ${lang()==='en'?'The line meets the feasible region; feasible points on it (orange) all give':'直線通過可行解區域，線上橘色部分的可行解都使'} <span class="m"><i>x</i>＋<i>y</i>＝${fmt(k)}</span>${k===10?'　⭐ '+(lang()==='en'?'maximum at C(6, 4)':'最大值，在 C(6, 4)'):''}${k===2?'　⭐ '+(lang()==='en'?'minimum at A(−2, 4)':'最小值，在 A(−2, 4)'):''}` : `⚪ ${lang()==='en'?'The line no longer meets the feasible region':'直線不再通過可行解區域'}`;
  };
  sl.addEventListener('input',()=>{ SND.tick(); upd(); });
  upd();
}

/* ---------------- 教材互動 ---------------- */
function parseNum(s){ s=String(s).trim().replace(/−/g,'-').replace(/，/g,',').replace(/\s/g,''); if(!s) return NaN; if(/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(s)){ const [a,b]=s.split('/').map(Number); return a/b; } return Number(s); }
function setupChecks(root){
  $$('[data-check]',root).forEach(box=>{
    if(box.dataset.ready) return; box.dataset.ready=1;
    const cfg=JSON.parse(box.dataset.check); const fb=box.nextElementSibling;
    const record=(ok,detail)=>{ const c=S.checks[cfg.id]||(S.checks[cfg.id]={tries:0,ok:false}); c.tries++; if(ok) c.ok=true; log('check',cfg.id+(ok?' ✔ ':' ✘ ')+detail);
      const ex=box.closest('.exitem'); if(ok && ex){ S.ex[ex.dataset.ex]='ok'; markSelf(ex); } save(); refreshAll(); };
    const show=(ok,msg)=>{ fb.className='feedback show '+(ok?'ok':'bad'); fb.innerHTML=(ok?'🎉 '+t('correct'):'🤔 '+t('wrong'))+' '+(msg||''); ok?SND.ok():SND.bad(); };
    if(cfg.type==='choice'){
      $$('button[data-v]',box).forEach(b=>b.addEventListener('click',()=>{ $$('button',box).forEach(x=>x.classList.remove('mint','coral')); const ok=b.dataset.v===cfg.answer; b.classList.add(ok?'mint':'coral'); show(ok, ok?'':(lang()==='en'?'Open the solution below for help.':'可以展開下方詳解看看喔！')); record(ok,b.dataset.v); }));
    } else {
      cfg.labels.forEach((lb,i)=>{ const w=document.createElement('label'); w.style.display='inline-flex'; w.style.alignItems='center'; w.style.gap='.3rem'; w.innerHTML=`<span>${lb}</span><input class="inp num" inputmode="decimal" aria-label="${lb}">`; box.appendChild(w); });
      const btn=document.createElement('button'); btn.className='btn sm pri'; btn.textContent='✅ '+t('checkAns'); box.appendChild(btn);
      const run=()=>{ const ins=$$('input',box); const vals=ins.map(i=>parseNum(i.value)); if(vals.some(isNaN)){ fb.className='feedback show hint'; fb.textContent=t('enterNum'); return; }
        const okEach=vals.map((v,i)=>Math.abs(v-cfg.answer[i])<1e-6); ins.forEach((i,k)=>i.style.borderColor=okEach[k]?'var(--ok)':'var(--bad)');
        const ok=okEach.every(Boolean); show(ok, ok?'':(okEach.some(Boolean)?t('partial')+'。':'')+(lang()==='en'?' Try the hint / solution.':'試試看提示或詳解。')); record(ok,vals.join(',')); };
      btn.addEventListener('click',run); $$('input',box).forEach(i=>i.addEventListener('keydown',e=>{ if(e.key==='Enter') run(); }));
    }
  });
}
function setupLesson(){
  $$('[data-done]').forEach(b=>{ const k=b.dataset.done; const paint=()=>{ b.classList.toggle('on',!!S.lessons[k]); };
    paint(); b.addEventListener('click',()=>{ S.lessons[k]=!S.lessons[k]; if(S.lessons[k]){ SND.win(); toast(t('markDone')); log('complete',k); } save(); paint(); refreshAll(); }); });
  $$('details.reveal').forEach(d=>d.addEventListener('toggle',()=>{ if(d.open){ SND.pop(); const id=d.dataset.track || ((d.closest('.exitem')?'ex'+d.closest('.exitem').dataset.ex:'')+':'+(d.querySelector('summary').textContent.trim().slice(0,6))); if(!S.reveals[id]){ S.reveals[id]=1; log('reveal',id); } } }));
  setupChecks(document);
}

/* ---------------- 習題自我標記 ---------------- */
function markSelf(ex){ const id=ex.dataset.ex; $$('.selfmark button',ex).forEach(b=>b.classList.toggle('on',S.ex[id]===b.dataset.m)); }
function setupExercises(){
  $$('.exitem').forEach(ex=>{ const box=$('.selfmark',ex); box.innerHTML=`<button class="btn sm mint" data-m="ok"></button><button class="btn sm sun" data-m="retry"></button>`;
    $$('button',box).forEach(b=>b.addEventListener('click',()=>{ S.ex[ex.dataset.ex]=b.dataset.m; b.dataset.m==='ok'?SND.ok():SND.click(); log('exercise','第'+ex.dataset.ex+'題 '+(b.dataset.m==='ok'?'答對':'再練習')); save(); markSelf(ex); refreshAll(); }));
    markSelf(ex); });
}
function paintSelfLabels(){ $$('.selfmark button').forEach(b=>b.textContent=b.dataset.m==='ok'?t('got'):t('retry')); }

/* ---------------- 先備知識 ---------------- */
function renderPre(){ const box=$('#preChecks'); box.innerHTML=t('pre').map((p,i)=>`<label style="display:flex;gap:.5rem;align-items:center;padding:.3rem 0;cursor:pointer"><input type="checkbox" data-pre="${i}" style="width:22px;height:22px;accent-color:var(--mint)" ${S.lessons['pre'+i]?'checked':''}> ${p}</label>`).join('')+`<p class="muted" style="font-size:.88rem">${lang()==='en'?'Not sure about any item? Review Book 1 or start with Lab A and B.':'有不熟的項目嗎？可先複習第一冊，或從實驗室 A、B 開始暖身。'}</p>`;
  $$('[data-pre]',box).forEach(c=>c.addEventListener('change',()=>{ S.lessons['pre'+c.dataset.pre]=c.checked; SND.pop(); save(); })); }

/* ---------------- 實驗室共用 ---------------- */
let curLab='A';
function showLab(id){ curLab=id; $$('[data-labtab]').forEach(b=>b.classList.toggle('pri',b.dataset.labtab===id)); $$('.lab-panel').forEach(p=>p.classList.toggle('active',p.id==='lab-'+id)); }
function labUse(id){ if(!labUse.seen) labUse.seen={}; if(labUse.seen[id]) return; labUse.seen[id]=1; S.labs[id]=(S.labs[id]||0)+1; log('lab','實驗室 '+id); save(); refreshAll(); }
const lin=(a,b,c,rel)=>{ // a x + b y (+c) rel
  const term=(k,v,first)=>{ if(k===0) return ''; const s=k<0?'－':(first?'':'＋'); const m=Math.abs(k)===1?'':fmt(Math.abs(k)); return (first&&k<0?'−':s)+m+`<i>${v}</i>`; };
  let s=term(a,'x',true); s+=term(b,'y',!s); if(c!==undefined&&c!==null&&c!==0) s+=(c<0?'－':'＋')+fmt(Math.abs(c)); if(!s) s='0'; return `<span class="m">${s}${rel||''}</span>`; };

/* Lab A */
const labA={ghost:false,timer:null};
function setupLabA(){
  const P=new Plot('#plotA',{x:[-10,10],y:[-10,10],grid:1,ticks:[2,2]});
  const ra=$('#rA_a'), rb=$('#rA_b'), rc=$('#rA_c');
  const upd=()=>{ let a=+ra.value,b=+rb.value,c=+rc.value; if(a===0&&b===0){ b=1; rb.value=1; }
    $('#aA').textContent=fmt(a); $('#aB').textContent=fmt(b); $('#aC').textContent=fmt(c);
    P.gLine.innerHTML=''; P.clearDyn(); P.gPt.innerHTML='';
    if(labA.ghost) for(let k=-10;k<=10;k+=2) P.line({a,b,c:-k,color:'#a259ff',w:1.2,dash:true});
    P.line({a,b,c:-c,color:'#ff5fa2',w:3.5,label:'',},P.gDyn);
    const xi = a!==0? -c/a : null, yi = b!==0? -c/b : null;
    if(xi!==null && Math.abs(xi)<=10) P.point({x:xi,y:0,color:'sun',r:6,label:'('+fmt(xi)+', 0)',dy:16});
    if(yi!==null && Math.abs(yi)<=10) P.point({x:0,y:yi,color:'sky',r:6,label:'(0, '+fmt(yi)+')',dx:8});
    const slope = b!==0? fmt(-a/b) : (lang()==='en'?'undefined (vertical)':'不存在（鉛直線）');
    $('#readA').innerHTML=`<b>${lin(a,b,c,'＝0')}</b><br>📐 ${t('slope')}：<b>${slope}</b>　🟡 ${t('xint')}：<b>${xi===null?t('none'):fmt(xi)}</b>　🔵 ${t('yint')}：<b>${yi===null?t('none'):fmt(yi)}</b>`;
  };
  [ra,rb,rc].forEach(r=>r.addEventListener('input',()=>{ SND.tick(); labUse('A'); upd(); }));
  $('#ghostA').addEventListener('click',()=>{ labA.ghost=!labA.ghost; SND.click(); labUse('A'); upd(); });
  $('#animA').addEventListener('click',()=>{ labUse('A'); if(labA.timer){ clearInterval(labA.timer); labA.timer=null; return; } let d=1; labA.timer=setInterval(()=>{ let v=+rc.value+d; if(v>10||v<-10){ d=-d; v=+rc.value+d; } rc.value=v; SND.tick(); upd(); },350); });
  upd();
}

/* Lab B */
const labB={sign:'<=',pt:null,shade:true};
function setupLabB(){
  const P=new Plot('#plotB',{x:[-8,8],y:[-8,8],grid:1,ticks:[2,2]});
  const ra=$('#rB_a'), rb=$('#rB_b'), rc=$('#rB_c');
  const sym={'<':'＜','<=':'≤','>':'＞','>=':'≥'};
  const upd=()=>{ let a=+ra.value,b=+rb.value,c=+rc.value; if(a===0&&b===0){ b=1; rb.value=1; }
    $('#bA').textContent=fmt(a); $('#bB').textContent=fmt(b); $('#bC').textContent=fmt(c);
    const s=labB.sign, strict=(s==='<'||s==='>');
    $('#ineqB').innerHTML=lin(a,b,c,' '+sym[s]+' 0');
    P.gReg.innerHTML=''; P.gLine.innerHTML=''; P.gPt.innerHTML=''; P.clearDyn();
    const cons = (s[0]==='<')? [a,b,-c,strict] : [-a,-b,c,strict];
    if(labB.shade) P.shade([cons],{fill:'rgba(20,184,138,.28)'});
    P.line({a,b,c:-c,color:'#2f9cf0',w:3,dash:strict});
    let msg=`${strict?'➖ '+(lang()==='en'?'No “=” → boundary is <b>dashed</b>.':'不含等號 → 界線畫<b>虛線</b>。'):'➖ '+(lang()==='en'?'Has “=” → boundary is <b>solid</b>.':'含等號 → 界線畫<b>實線</b>。')}`;
    if(labB.pt){ const [x,y]=labB.pt; const v=a*x+b*y+c; const ok= s==='<'?v<0: s==='<='?v<=0: s==='>'?v>0 : v>=0;
      P.point({x,y,color:ok?'#12a874':'#e5484d',r:7,label:`(${fmt(x)}, ${fmt(y)})`});
      msg+=`<br>🎯 ${lang()==='en'?'Substitute':'代入'} (${fmt(x)}, ${fmt(y)})：${fmt(a)}·(${fmt(x)})＋${fmt(b)}·(${fmt(y)})＋(${fmt(c)})＝<b>${fmt(v)}</b> ${ok?'✔':'✘'} ${sym[s]} 0<br>⇒ ${v===0?(lang()==='en'?'the point is on the boundary, ':'點在界線上，'):''}<b class="${ok?'badge-ok':'badge-bad'}">${ok?t('inRegion'):t('notRegion')}</b>`;
      if(!(v===0) && labB.pt[0]===0 && labB.pt[1]===0) msg+=`<br>💡 ${lang()==='en'?'So the solution is the half-plane '+(ok?'containing':'not containing')+' the origin.':'所以解區域是'+(ok?'含':'不含')+'原點的那一側。'}`;
    } else msg+=`<br>👆 ${lang()==='en'?'Tap the graph to place a test point.':'點一下圖形放置測試點。'}`;
    $('#readB').innerHTML=msg;
  };
  [ra,rb,rc].forEach(r=>r.addEventListener('input',()=>{ SND.tick(); labUse('B'); upd(); }));
  $$('#signB button').forEach(b=>b.addEventListener('click',()=>{ labB.sign=b.dataset.s; $$('#signB button').forEach(x=>x.classList.toggle('on',x===b)); SND.click(); labUse('B'); upd(); }));
  P.svg.addEventListener('pointerdown',e=>{ const [x,y]=P.inv(e.clientX,e.clientY); labB.pt=[Math.round(x*2)/2,Math.round(y*2)/2]; SND.pop(); labUse('B'); upd(); });
  $('#originB').addEventListener('click',()=>{ labB.pt=[0,0]; SND.pop(); labUse('B'); upd(); });
  $('#showB').addEventListener('click',()=>{ labB.shade=!labB.shade; SND.click(); upd(); });
  upd();
}

/* 不等式解析：回傳 [a,b,c,strict] 代表 a x + b y <= c */
function parseLinear(expr){
  expr=expr.replace(/\s/g,'').replace(/−|－/g,'-').replace(/＋/g,'+'); if(!expr) throw 0;
  let a=0,b=0,c=0; const re=/([+-]?)(\d*\.?\d*(?:\/\d+)?)(\*?)([xy]?)/g; let m, pos=0;
  while(pos<expr.length){ re.lastIndex=pos; m=re.exec(expr); if(!m||m.index!==pos||m[0]==='') throw 0; pos=re.lastIndex;
    const sg=m[1]==='-'?-1:1; let num=m[2]===''?1:parseNum(m[2]); if(isNaN(num)) throw 0; if(m[4]==='' && m[2]==='') throw 0;
    if(m[4]==='x') a+=sg*num; else if(m[4]==='y') b+=sg*num; else c+=sg*num; }
  return [a,b,c];
}
function parseIneq(s){
  const r=s.replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/＜/g,'<').replace(/＞/g,'>').replace(/＝/g,'=');
  const m=r.match(/^(.*?)(<=|>=|<|>|=<|=>)(.*)$/); if(!m) throw 0;
  const op=m[2].replace('=<','<=').replace('=>','>=');
  const [a1,b1,c1]=parseLinear(m[1]), [a2,b2,c2]=parseLinear(m[3]);
  let a=a1-a2,b=b1-b2,c=c2-c1; const strict=!op.includes('=');
  if(a===0&&b===0) throw 0;
  return op[0]==='<'?[a,b,c,strict]:[-a,-b,-c,strict];
}
function niceStep(r){ const raw=r/10; const p=Math.pow(10,Math.floor(Math.log10(raw))); const n=raw/p; return (n<1.5?1:n<3.5?2:n<7.5?5:10)*p; }
function autoView(cons){
  const vs=vertices(cons); const pts=vs.concat([[0,0]]); const bd=LP.bounded(cons);
  let x0=Math.min(...pts.map(p=>p[0])), x1=Math.max(...pts.map(p=>p[0])), y0=Math.min(...pts.map(p=>p[1])), y1=Math.max(...pts.map(p=>p[1]));
  let rx=Math.max(x1-x0,2), ry=Math.max(y1-y0,2); const ex=bd?.18:.5;
  x0-=rx*.15; y0-=ry*.15; x1+=rx*ex; y1+=ry*ex;
  if(!bd){ const r=region(cons,[-1e4,1e4,-1e4,1e4]); if(r.some(p=>p[0]<-1e3)) x0-=rx*.5; if(r.some(p=>p[1]<-1e3)) y0-=ry*.5; }
  rx=x1-x0; ry=y1-y0; const equal = ry/rx<2.2 && rx/ry<2.2;
  const g=niceStep(Math.max(rx,ry)), gx=equal?g:niceStep(rx), gy=equal?g:niceStep(ry);
  return {x:[x0,x1],y:[y0,y1],equal,h:equal?undefined:400,gx,gy,ticks:[gx*2,gy*2]};
}

/* Lab C */
const labC={ready:false};
function presetOptions(){ const sel=$('#presetC'); const v=sel.value; sel.innerHTML=D.PRESETS.map(p=>`<option value="${p.id}">${L(p)}</option>`).join('')+`<option value="custom">✏️ ${lang()==='en'?'Custom':'自訂'}</option>`; sel.value=v||'intro'; }
function loadPreset(id){ const p=D.PRESETS.find(x=>x.id===id); if(!p) return; $('#consC').value=p.cons.join('\n'); $('#objP').value=p.p; $('#objQ').value=p.q; applyC(); }
function applyC(){
  $('#errC').textContent='';
  const lines=$('#consC').value.split(/\n|,|，|;/).map(s=>s.trim()).filter(Boolean);
  const cons=[]; for(const ln of lines){ try{ cons.push(parseIneq(ln)); }catch(e){ $('#errC').textContent=t('parseErr')+ln; SND.bad(); return; } }
  const p=parseNum($('#objP').value), q=parseNum($('#objQ').value); if(isNaN(p)||isNaN(q)||(p===0&&q===0)){ $('#errC').textContent=t('parseErr')+'objective'; return; }
  labC.cons=cons; labC.lines=lines; labC.p=p; labC.q=q; labC.opt=optimize(cons,p,q);
  const v=autoView(cons); labC.P=new Plot('#plotC',v); const P=labC.P;
  if(!labC.opt.empty){ P.shade(cons); }
  cons.forEach(k=>P.line({a:k[0],b:k[1],c:k[2],color:'#2b2f4d',w:1.8,dash:k[3]}));
  const vs=labC.opt.vs||[];
  // k 範圍：視窗四角
  const corners=[[v.x[0],v.y[0]],[v.x[1],v.y[0]],[v.x[0],v.y[1]],[v.x[1],v.y[1]]].map(c=>p*c[0]+q*c[1]);
  const kmin=Math.min(...corners), kmax=Math.max(...corners); const step=niceStep(kmax-kmin)/20;
  const sl=$('#rC_k'); sl.min=kmin; sl.max=kmax; sl.step=step;
  sl.value = vs.length? vs.reduce((s,x)=>s+x.val,0)/vs.length : (kmin+kmax)/2;
  const pretty=x=>'<span class="m">'+x.replace(/<=|=</g,' ≤ ').replace(/>=|=>/g,' ≥ ').replace(/</g,' ＜ ').replace(/>/g,' ＞ ').replace(/\+/g,'＋').replace(/-/g,'－').replace(/([xy])/g,'<i>$1</i>')+'</span>';
  $('#sysC').innerHTML=(lang()==='en'?'Constraints: ':'限制條件：')+`<span class="sys">${lines.map(x=>`<span>${pretty(x)}</span>`).join('')}</span><br>${lang()==='en'?'Objective: ':'目標函數：'}<b>${lin(p,q)}</b>`;
  $('#tableC').innerHTML=''; labC.ready=true; updateC();
}
function updateC(){
  const {P,p,q,opt,cons}=labC; if(!P) return; const k=+$('#rC_k').value; $('#kC').textContent=fmt(k);
  P.clearDyn(); P.gPt.innerHTML='';
  (opt.vs||[]).forEach(v=>{ const isMax=opt.maxExists&&Math.abs(v.val-opt.max)<1e-6, isMin=opt.minExists&&Math.abs(v.val-opt.min)<1e-6; P.point({x:v.x,y:v.y,color:isMax?'#ffb020':isMin?'#ff6b6b':'#2b2f4d',r:isMax||isMin?6.5:4.5,label:`(${fmt(v.x)}, ${fmt(v.y)})`,size:12}); });
  let hit=false;
  if(!opt.empty){ const lo=opt.minExists?opt.min:-Infinity, hi=opt.maxExists?opt.max:Infinity; hit = k>=lo-1e-9 && k<=hi+1e-9; }
  P.line({a:p,b:q,c:k,color:hit?'#ff5fa2':'#a0a4c8',w:3.2,dash:true},P.gDyn);
  if(hit){ const seg=region(cons.concat([[p,q,k+1e-9],[-p,-q,-k+1e-9]]),[-1e4,1e4,-1e4,1e4]); if(seg.length>=1){ let a=seg[0],b=seg[0]; seg.forEach(s=>{ seg.forEach(r=>{ if(Math.hypot(s[0]-r[0],s[1]-r[1])>Math.hypot(a[0]-b[0],a[1]-b[1])){a=s;b=r;} }); }); P.segment({p:a,q:b,color:'#ffb020',w:6},P.gDyn); } }
  let html='';
  if(opt.empty) html=`🚫 ${t('empty')}`;
  else { html = hit? `🟢 ${t('hitRegion')} <b>${fmt(k)}</b>` : `⚪ ${t('missRegion')}`;
    const mx=opt.maxExists? `<b>${fmt(opt.max)}</b>` : t('noMax'), mn=opt.minExists? `<b>${fmt(opt.min)}</b>` : t('noMin');
    html+=`<br>⬆️ ${t('maxIs')}：${mx}　⬇️ ${t('minIs')}：${mn}`; }
  $('#readC').innerHTML=html;
}
function setupLabC(){
  presetOptions();
  $('#presetC').addEventListener('change',e=>{ SND.click(); labUse('C'); if(e.target.value!=='custom') loadPreset(e.target.value); else { $('#consC').closest('details').open=true; $('#consC').focus(); } });
  $('#applyC').addEventListener('click',()=>{ SND.click(); labUse('C'); $('#presetC').value='custom'; applyC(); log('lab','實驗室 C 自訂：'+$('#consC').value.replace(/\n/g,'; ')); });
  $('#rC_k').addEventListener('input',()=>{ SND.tick(); labUse('C'); updateC(); });
  let drag=false; const host=$('#plotC');
  const mv=e=>{ if(!drag||!labC.P) return; const [x,y]=labC.P.inv(e.clientX,e.clientY); const sl=$('#rC_k'); sl.value=labC.p*x+labC.q*y; updateC(); };
  host.addEventListener('pointerdown',e=>{ drag=true; labUse('C'); host.setPointerCapture&&host.setPointerCapture(e.pointerId); mv(e); });
  host.addEventListener('pointermove',mv); host.addEventListener('pointerup',()=>drag=false); host.addEventListener('pointercancel',()=>drag=false);
  let timer=null;
  $('#sweepC').addEventListener('click',()=>{ labUse('C'); if(timer){ clearInterval(timer); timer=null; return; } const sl=$('#rC_k'); let v=+sl.min; timer=setInterval(()=>{ v+=(+sl.max-+sl.min)/90; if(v>+sl.max){ clearInterval(timer); timer=null; return; } sl.value=v; updateC(); SND.tick(); },60); });
  const jump=w=>{ labUse('C'); const o=labC.opt; if(o.empty) return; const ok=w==='max'?o.maxExists:o.minExists; if(!ok){ SND.bad(); toast(w==='max'?t('maxIs')+' '+t('noMax'):t('minIs')+' '+t('noMin')); return; } $('#rC_k').value=w==='max'?o.max:o.min; updateC(); SND.ok(); };
  $('#maxC').addEventListener('click',()=>jump('max')); $('#minC').addEventListener('click',()=>jump('min'));
  $('#vertC').addEventListener('click',()=>{ labUse('C'); SND.pop(); const o=labC.opt; if(o.empty||!o.vs.length){ $('#tableC').innerHTML=''; return; }
    $('#tableC').innerHTML=`<table class="tbl"><tr><th>${t('vtx')} (<i>x</i>, <i>y</i>)</th><th>${lin(labC.p,labC.q)}</th></tr>`+o.vs.map(v=>{ const isMax=o.maxExists&&Math.abs(v.val-o.max)<1e-6, isMin=o.minExists&&Math.abs(v.val-o.min)<1e-6; return `<tr class="${isMax?'best':isMin?'worst':''}"><td>(${fmt(v.x)}, ${fmt(v.y)})</td><td>${fmt(v.val)} ${isMax?'⬆️ '+t('maxIs'):''}${isMin?'⬇️ '+t('minIs'):''}</td></tr>`; }).join('')+`</table>`+(o.bounded?'':`<p class="note">${lang()==='en'?'⚠️ Unbounded region: check with the parallel-line method whether each extremum exists.':'⚠️ 區域無界：須用平行線法確認極值是否存在！'}</p>`); });
  loadPreset('intro');
}

/* Lab D */
const labD={th:Math.PI/4,timer:null,edge:0};
function setupLabD(){
  const cons=[[1,2,6],[2,1,6],[-1,0,0],[0,-1,0]]; const vs=vertices(cons);
  const P=new Plot('#plotD',{x:[-1.5,5],y:[-1.5,4.5]}); P.shade(cons); P.poly(vs,{stroke:'blue'}); cons.forEach(k=>P.line({a:k[0],b:k[1],c:k[2],color:'#2b2f4d',w:1.4}));
  const upd=()=>{ const th=labD.th, p=Math.cos(th), q=Math.sin(th); $('#dTh').textContent=Math.round(th*180/Math.PI)%360+'°';
    P.clearDyn(); P.gPt.innerHTML='';
    const vals=vs.map(v=>p*v[0]+q*v[1]); const mx=Math.max(...vals), mn=Math.min(...vals);
    const best=vs.filter((v,i)=>Math.abs(vals[i]-mx)<1e-4);
    P.line({a:p,b:q,c:mx,color:'#ff5fa2',w:3,dash:true},P.gDyn); P.line({a:p,b:q,c:mn,color:'#a259ff',w:2,dash:true},P.gDyn);
    if(best.length>1) P.segment({p:best[0],q:best[1],color:'#ffb020',w:7},P.gDyn);
    const cx=1.4, cy=1.2; P.segment({p:[cx,cy],q:[cx+p*1.2,cy+q*1.2],color:'#14b88a',w:3},P.gDyn); P.point({x:cx+p*1.2,y:cy+q*1.2,color:'#14b88a',r:5},P.gDyn);
    vs.forEach((v,i)=>P.point({x:v[0],y:v[1],color:Math.abs(vals[i]-mx)<1e-4?'#ffb020':'#2b2f4d',r:Math.abs(vals[i]-mx)<1e-4?7:4.5,label:`(${fmt(v[0])}, ${fmt(v[1])})`,size:12}));
    const pr=Math.round(p*100)/100, qr=Math.round(q*100)/100;
    $('#readD').innerHTML=`${lang()==='en'?'Objective':'目標函數'} ≈ ${lin(pr,qr)}　🟢 ${lang()==='en'?'arrow = direction of increase':'箭頭＝增加方向'}<br>⬆️ ${best.length>1?`<b class="badge-ok">${t('multi')}</b> (${fmt(best[0][0])}, ${fmt(best[0][1])})～(${fmt(best[1][0])}, ${fmt(best[1][1])})`:`${t('maxAtV')} <b>(${fmt(best[0][0])}, ${fmt(best[0][1])})</b>`}`;
  };
  const rD=$('#rD'); rD.addEventListener('input',()=>{ labD.th=+rD.value*Math.PI/180; SND.tick(); labUse('D'); upd(); });
  $('#animD').addEventListener('click',()=>{ labUse('D'); if(labD.timer){ clearInterval(labD.timer); labD.timer=null; return; } labD.timer=setInterval(()=>{ labD.th=(labD.th+Math.PI/90)%(2*Math.PI); rD.value=Math.round(labD.th*180/Math.PI)%360; upd(); },70); });
  $('#snapD').addEventListener('click',()=>{ labUse('D'); const n=vs.length; const i=labD.edge%n; labD.edge++; const a=vs[i], b=vs[(i+1)%n]; const ex=b[0]-a[0], ey=b[1]-a[1]; let th=Math.atan2(-ex,ey); // 外法向量
      const cxm=vs.reduce((s,v)=>s+v[0],0)/n, cym=vs.reduce((s,v)=>s+v[1],0)/n; if(Math.cos(th)*(a[0]-cxm)+Math.sin(th)*(a[1]-cym)<0) th+=Math.PI; labD.th=(th+2*Math.PI)%(2*Math.PI); rD.value=Math.round(labD.th*180/Math.PI)%360; SND.ok(); upd(); });
  upd();
}

/* Lab E */
const labE={sel:new Set()};
function setupLabE(){
  const make=(a,b,c)=>{ labE.a=a; labE.b=b; labE.c=c; labE.sel=new Set(); const xm=Math.floor(c/a), ym=Math.floor(c/b); const N=Math.max(xm,ym)+1;
    const P=new Plot('#plotE',{x:[-1,N+.6],y:[-1,N+.6],grid:1}); labE.P=P; P.shade([[a,b,c],[-1,0,0],[0,-1,0]]); P.line({a,b,c,color:'#2b2f4d',label:fmt(a)+'x+'+fmt(b)+'y='+fmt(c),pos:.08,dy:16});
    labE.ans=new Set(); for(let x=0;x<=xm;x++) for(let y=0;y<=ym;y++) if(a*x+b*y<=c) labE.ans.add(x+','+y);
    for(let x=0;x<=N;x++) for(let y=0;y<=N;y++){ const g=document.createElementNS('http://www.w3.org/2000/svg','g'); g.style.cursor='pointer';
      const hit=document.createElementNS('http://www.w3.org/2000/svg','circle'); hit.setAttribute('cx',P.X(x)); hit.setAttribute('cy',P.Y(y)); hit.setAttribute('r',Math.max(11,P.sx*.42)); hit.setAttribute('fill','transparent');
      const dot=document.createElementNS('http://www.w3.org/2000/svg','circle'); dot.setAttribute('cx',P.X(x)); dot.setAttribute('cy',P.Y(y)); dot.setAttribute('r',5); dot.setAttribute('style','fill:var(--card);stroke:var(--muted)'); dot.setAttribute('stroke-width',2);
      g.appendChild(hit); g.appendChild(dot); g.dataset.k=x+','+y; P.gTop.appendChild(g);
      g.addEventListener('click',()=>{ const k=g.dataset.k; labUse('E'); if(labE.sel.has(k)){ labE.sel.delete(k); dot.setAttribute('r',5); dot.setAttribute('style','fill:var(--card);stroke:var(--muted)'); } else { labE.sel.add(k); dot.setAttribute('r',7.5); dot.setAttribute('style','fill:#ff5fa2;stroke:#fff'); } SND.pop(); $('#cntE').textContent=labE.sel.size; }); }
    $('#sysE').innerHTML=`<span class="sys"><span>${lin(a,b,null,' ≤ '+c)}</span><span><i>x</i> ≥ 0，<i>y</i> ≥ 0</span><span>${lang()==='en'?'x, y integers':'<i>x</i>，<i>y</i> 為整數'}</span></span>`; $('#cntE').textContent=0; $('#fbE').className='feedback'; };
  $('#checkE').addEventListener('click',()=>{ labUse('E'); const miss=[...labE.ans].filter(k=>!labE.sel.has(k)).length, extra=[...labE.sel].filter(k=>!labE.ans.has(k)).length; const ok=!miss&&!extra; const fb=$('#fbE'); fb.className='feedback show '+(ok?'ok':'bad');
    fb.innerHTML= ok? `🎉 ${t('correct')} ${lang()==='en'?'Total':'共'} <b>${labE.ans.size}</b> ${lang()==='en'?'points':'組'}` : `🤔 ${lang()==='en'?`Missing ${miss}, extra ${extra}. Hint: fix x = 0, 1, 2… and count y.`:`少選 ${miss} 個、多選 ${extra} 個。提示：固定 x＝0, 1, 2… 再數 y。`}`; ok?SND.ok():SND.bad(); log('lab','格子點 '+(ok?'✔':'✘')); });
  $('#newE').addEventListener('click',()=>{ SND.click(); const a=1+Math.floor(Math.random()*4), b=1+Math.floor(Math.random()*4); const c=Math.max(a,b)+Math.floor(Math.random()*Math.min(a,b)*3)+1; make(a,b,c); });
  $('#showE').addEventListener('click',()=>{ SND.pop(); $$('#plotE g[data-k]').forEach(g=>{ const dot=g.lastChild; if(labE.ans.has(g.dataset.k)){ dot.setAttribute('style','fill:#ffb020;stroke:#fff'); dot.setAttribute('r',7); } }); $('#fbE').className='feedback show hint'; $('#fbE').innerHTML=`👀 ${lang()==='en'?'Answer':'答案'}：${labE.ans.size} ${lang()==='en'?'points':'組'}`; });
  make(3,2,6);
}
function setupLabs(){ $$('[data-labtab]').forEach(b=>b.addEventListener('click',()=>{ SND.click(); showLab(b.dataset.labtab); })); setupLabA(); setupLabB(); setupLabC(); setupLabD(); setupLabE(); }

/* ---------------- 練習（隨機出題） ---------------- */
let ptype='mix', curP=null, pStreak=0;
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1)); const pick=a=>a[Math.floor(Math.random()*a.length)];
const nz=(a,b)=>{ let v=0; while(v===0) v=ri(a,b); return v; };
const gcd=(a,b)=>{ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; };
function buildPTypes(){ $('#ptypes').innerHTML=D.PTYPES.map(p=>{ const st=S.practice[p.id]||{t:0,c:0}; return `<button class="type-card ${p.id===ptype?'on':''}" data-pt="${p.id}"><div class="ic">${p.ic}</div><b>${L({zh:p.zh,en:p.en})}</b><small>${L({zh:p.dz,en:p.de})}</small><br><small>✔ ${st.c}/${st.t}</small></button>`; }).join('');
  $$('[data-pt]').forEach(b=>b.addEventListener('click',()=>{ ptype=b.dataset.pt; SND.click(); buildPTypes(); newPQ(); })); }
function genP(type){
  if(type==='mix') type=pick(['shift','side','cross','lp','lp']);
  const en=lang()==='en';
  if(type==='shift'){ const a=ri(1,4), b=nz(-4,4), c=ri(-6,6), n=ri(1,4), dir=pick(['right','left','up','down']);
    const ans= dir==='right'? c+a*n : dir==='left'? c-a*n : dir==='up'? c+b*n : c-b*n;
    const dz={right:'向右',left:'向左',up:'向上',down:'向下'}[dir];
    return {type, q: en?`Shift the line ${lin(a,b,null,'＝'+fmt(c))} <b>${dir}</b> by ${n} unit(s). The new line is ${lin(a,b,null,'＝')} <b>?</b>`:`將直線 ${lin(a,b,null,'＝'+fmt(c))} <b>${dz}平移 ${n} 單位</b>，所得直線為 ${lin(a,b,null,'＝')}<b>？</b>`,
      input:{kind:'num',labels:[en?'constant =':'常數項＝']}, ans:[ans],
      hint: dir==='right'||dir==='left'? (en?`Replace x by x ${dir==='right'?'−':'+'} ${n}.`:`把 x 換成 x ${dir==='right'?'－':'＋'} ${n}．`) : (en?`Replace y by y ${dir==='up'?'−':'+'} ${n}.`:`把 y 換成 y ${dir==='up'?'－':'＋'} ${n}．`),
      ex: en?`Answer ${fmt(ans)}. The coefficients stay the same (parallel); only the constant changes.`:`${dir==='right'||dir==='left'?`${fmt(a)}(x ${dir==='right'?'－':'＋'} ${n})`:`${fmt(b)}(y ${dir==='up'?'－':'＋'} ${n})`} 展開後移項，常數項為 <b>${fmt(ans)}</b>．係數不變（斜率不變），只有常數項改變．`,
      fig:{o:{x:[-8,8],y:[-8,8]},s:{lines:[{a,b,c,color:'blue',label:en?'original':'原直線'}]}}, figAns:{o:{x:[-8,8],y:[-8,8]},s:{lines:[{a,b,c,color:'blue'},{a,b,c:ans,color:'pink',label:en?'new':'新直線'}]}} };
  }
  if(type==='side'){ const a=nz(-4,4), b=nz(-4,4); const c=nz(-6,6); const s=pick(['<','<=','>','>=']); const sym={'<':'＜','<=':'≤','>':'＞','>=':'≥'}[s];
    const v=c; const containsO = s==='<'?v<0: s==='<='?v<=0: s==='>'?v>0 : v>=0; const solid=s.includes('=');
    const opts=en?['Contains origin, solid line','Contains origin, dashed line','Excludes origin, solid line','Excludes origin, dashed line']:['含原點的一側，界線畫實線','含原點的一側，界線畫虛線','不含原點的一側，界線畫實線','不含原點的一側，界線畫虛線'];
    const a_i=(containsO?0:2)+(solid?0:1);
    const cons=s[0]==='<'?[a,b,-c,!solid]:[-a,-b,c,!solid];
    return {type, q: en?`The graph of ${lin(a,b,c,' '+sym+' 0')} is…`:`不等式 ${lin(a,b,c,' '+sym+' 0')} 的圖形是？`, input:{kind:'mc',opts}, ans:a_i,
      hint: en?'Substitute the origin (0, 0); check whether “=” is included.':'把原點 (0, 0) 代入看看是否成立；再看有沒有等號．',
      ex: en?`Origin: ${fmt(c)} ${sym} 0 is ${containsO?'true':'false'}; ${solid?'“=” included → solid':'strict → dashed'}.`:`原點代入得 ${fmt(c)} ${sym} 0，${containsO?'成立':'不成立'}，所以取${containsO?'含':'不含'}原點的一側；${solid?'含等號 → 實線':'不含等號 → 虛線'}．`,
      figAns:{o:{x:[-8,8],y:[-8,8]},s:{regions:[{cons:[cons],fill:'rgba(20,184,138,.28)'}],lines:[{a,b,c:-c,color:'blue',dash:!solid}],points:[{x:0,y:0,color:containsO?'green':'red',label:'O'}]}} };
  }
  if(type==='cross'){ const x0=ri(-4,5), y0=ri(-4,5); let a1,b1,a2,b2; do{ a1=nz(-4,4); b1=nz(-4,4); a2=nz(-4,4); b2=nz(-4,4); }while(a1*b2-a2*b1===0);
    const c1=a1*x0+b1*y0, c2=a2*x0+b2*y0;
    return {type, q: en?`Find the vertex (intersection) of ${lin(a1,b1,null,'＝'+fmt(c1))} and ${lin(a2,b2,null,'＝'+fmt(c2))}.`:`求兩界線 ${lin(a1,b1,null,'＝'+fmt(c1))} 與 ${lin(a2,b2,null,'＝'+fmt(c2))} 的交點（頂點）坐標．`, input:{kind:'num',labels:['x＝','y＝']}, ans:[x0,y0],
      hint: en?'Use elimination or substitution.':'用加減消去法或代入消去法解聯立方程式．', ex: en?`Intersection (${fmt(x0)}, ${fmt(y0)}). Check by substituting.`:`交點為 <b>(${fmt(x0)}, ${fmt(y0)})</b>，代回兩式驗算皆成立．`,
      figAns:{o:{x:[-8,8],y:[-8,8]},s:{lines:[{a:a1,b:b1,c:c1,color:'blue'},{a:a2,b:b2,c:c2,color:'orange'}],points:[{x:x0,y:y0,color:'sun',r:6,label:`(${x0}, ${y0})`}]}} };
  }
  // lp
  let pts, tries=0;
  while(true){ tries++;
    if(Math.random()<.55){ const p=ri(3,8), tt=ri(3,8), r=ri(1,p), s=ri(1,tt); pts=[[0,0],[p,0],[r,s],[0,tt]]; }
    else { pts=[[ri(-2,3),ri(-2,2)],[ri(4,8),ri(-1,3)],[ri(0,6),ri(4,8)]]; }
    const n=pts.length; let sg=0, ok=true; for(let i=0;i<n;i++){ const A=pts[i],B=pts[(i+1)%n],C=pts[(i+2)%n]; const cr=(B[0]-A[0])*(C[1]-B[1])-(B[1]-A[1])*(C[0]-B[0]); if(Math.abs(cr)<1e-9){ok=false;break;} const s=Math.sign(cr); if(sg&&s!==sg){ok=false;break;} sg=s; }
    if(ok || tries>200) break; }
  const n=pts.length, cx=pts.reduce((s,p)=>s+p[0],0)/n, cy=pts.reduce((s,p)=>s+p[1],0)/n;
  const cons=pts.map((A,i)=>{ const B=pts[(i+1)%n]; let a=B[1]-A[1], b=A[0]-B[0], c=a*A[0]+b*A[1]; const g=gcd(gcd(a,b),c); a/=g; b/=g; c/=g; if(a*cx+b*cy>c){a=-a;b=-b;c=-c;} return [a,b,c]; });
  const show=k=>{ const [a,b,c]=k; if(a<=0&&b<=0) return lin(-a,-b,null,' ≥ '+fmt(-c)); return lin(a,b,null,' ≤ '+fmt(c)); };
  const P=nz(-5,5), Q=nz(-5,5); const want=pick(['max','min']); const vals=pts.map(v=>P*v[0]+Q*v[1]); const ans=want==='max'?Math.max(...vals):Math.min(...vals);
  const best=pts[vals.indexOf(ans)];
  const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]); const view={x:[Math.min(0,...xs)-1.5,Math.max(...xs)+1.5],y:[Math.min(0,...ys)-1.5,Math.max(...ys)+1.5]};
  const wz=want==='max'?'最大值':'最小值', we=want==='max'?'maximum':'minimum';
  return {type:'lp', q: en?`On the feasible region <span class="sys">${cons.map(k=>`<span>${show(k)}</span>`).join('')}</span>, find the <b>${we}</b> of ${lin(P,Q)}.`:`在 <span class="sys">${cons.map(k=>`<span>${show(k)}</span>`).join('')}</span> 的可行解區域中，求目標函數 ${lin(P,Q)} 的<b>${wz}</b>．`,
    input:{kind:'num',labels:[en?we+' =':wz+'＝']}, ans:[ans],
    hint: en?`Vertices: ${pts.map(p=>`(${fmt(p[0])}, ${fmt(p[1])})`).join(', ')}. Substitute each one.`:`可行解區域的頂點為 ${pts.map(p=>`(${fmt(p[0])}, ${fmt(p[1])})`).join('、')}，逐一代入比大小（頂點法）．`,
    ex: `<table class="tbl"><tr><th>${t('vtx')}</th>${pts.map(p=>`<td>(${fmt(p[0])}, ${fmt(p[1])})</td>`).join('')}</tr><tr><th>${lin(P,Q)}</th>${vals.map(v=>`<td${v===ans?' style="background:color-mix(in srgb,var(--mint) 25%,transparent);font-weight:800"':''}>${fmt(v)}</td>`).join('')}</tr></table>${en?we+' = ':wz+'為 '}<b>${fmt(ans)}</b>${en?' at ':'，發生在 '}(${fmt(best[0])}, ${fmt(best[1])})．`,
    fig:{o:view,s:{regions:[{cons}],lines:cons.map(k=>({a:k[0],b:k[1],c:k[2],color:'ink',w:1.6}))}},
    figAns:{o:view,s:{regions:[{cons}],lines:cons.map(k=>({a:k[0],b:k[1],c:k[2],color:'ink',w:1.6})).concat([{a:P,b:Q,c:ans,color:'pink',dash:true,w:3}]),points:pts.map(p=>({x:p[0],y:p[1],label:`(${fmt(p[0])}, ${fmt(p[1])})`,color:p===best?'sun':'ink',r:p===best?6.5:4.5,size:12}))}} };
}
function newPQ(){ curP=genP(ptype); curP.done=false; curP.tries=0; curP.hintUsed=false; renderPQ(); }
function renderPQ(){
  const p=curP; if(!p) return; const meta=D.PTYPES.find(x=>x.id===p.type)||D.PTYPES[4];
  $('#ptag').textContent=meta.ic+' '+L({zh:meta.zh,en:meta.en}); $('#pq').innerHTML=p.q;
  const st=Object.values(S.practice).reduce((s,v)=>({t:s.t+v.t,c:s.c+v.c}),{t:0,c:0}); $('#pacc').textContent=st.t?Math.round(st.c/st.t*100)+'%':'—'; $('#pstreak').textContent=pStreak;
  const fh=$('#pfig'); fh.innerHTML=''; if(p.showFig||(p.done&&p.figAns)){ const f=p.done&&p.figAns?p.figAns:p.fig; if(f){ const d=document.createElement('div'); d.className='plot'; fh.appendChild(d); new Plot(d,f.o).draw(f.s);} }
  else if(p.fig){ const b=document.createElement('button'); b.className='btn sm ghost'; b.textContent='📈 '+(lang()==='en'?'Show graph':'顯示圖形'); b.onclick=()=>{ p.showFig=true; SND.pop(); renderPQ(); }; fh.appendChild(b); }
  const box=$('#pin'); box.innerHTML='';
  if(p.input.kind==='num'){ box.className='ans-row'; p.input.labels.forEach(lb=>{ const w=document.createElement('label'); w.style.cssText='display:inline-flex;align-items:center;gap:.3rem'; w.innerHTML=`<span>${lb}</span><input class="inp num" inputmode="decimal">`; box.appendChild(w); }); $$('input',box).forEach(i=>i.addEventListener('keydown',e=>{ if(e.key==='Enter') submitP(); })); }
  else { box.className='opts'; p.input.opts.forEach((o,i)=>{ const b=document.createElement('button'); b.className='opt'; b.dataset.i=i; b.innerHTML=`<span class="k">${'ABCD'[i]}</span>${o}`; b.onclick=()=>{ if(p.done) return; $$('.opt',box).forEach(x=>x.classList.remove('picked')); b.classList.add('picked'); p.pick=i; SND.click(); }; box.appendChild(b); }); }
  $('#pfb').className='feedback'; $('#psubmit').disabled=false;
}
function submitP(){
  const p=curP; if(!p||p.done) return; let ok;
  if(p.input.kind==='num'){ const v=$$('#pin input').map(i=>parseNum(i.value)); if(v.some(isNaN)){ const fb=$('#pfb'); fb.className='feedback show hint'; fb.textContent=t('enterNum'); return; } ok=v.every((x,i)=>Math.abs(x-p.ans[i])<1e-6); }
  else { if(p.pick===undefined){ const fb=$('#pfb'); fb.className='feedback show hint'; fb.textContent=lang()==='en'?'Choose an option first.':'請先選擇一個選項。'; return; } ok=p.pick===p.ans; }
  p.tries++; const st=S.practice[p.type]||(S.practice[p.type]={t:0,c:0});
  const fb=$('#pfb');
  if(ok){ if(p.tries===1){ st.c++; } st.t++; p.done=true; pStreak = p.tries===1? pStreak+1 : 0; S.bestStreak=Math.max(S.bestStreak||0,pStreak);
    SND.ok(); if(pStreak>0&&pStreak%5===0){ SND.win(); confetti(); toast(`🔥 ${pStreak} ${lang()==='en'?'in a row!':'連擊！'}`); }
    log('practice',p.type+' ✔'+(p.tries>1?'（第'+p.tries+'次）':'')); renderPQ(); fb.className='feedback show ok'; fb.innerHTML=`🎉 ${t('correct')} ${p.ex}`; $('#psubmit').disabled=true;
    if(p.input.kind==='mc') $$('#pin .opt')[p.ans].classList.add('correct');
  } else { SND.bad(); pStreak=0; $('#pstreak').textContent=0;
    if(p.input.kind==='mc'){ const b=$$('#pin .opt')[p.pick]; b.classList.add('wrong'); }
    if(p.tries>=2){ st.t++; p.done=true; log('practice',p.type+' ✘'); renderPQ(); fb.className='feedback show bad'; fb.innerHTML=`📖 ${t('answer')}：${p.input.kind==='mc'?p.input.opts[p.ans]:p.ans.map(fmt).join(', ')}<br>${p.ex}`; $('#psubmit').disabled=true; if(p.input.kind==='mc') $$('#pin .opt')[p.ans].classList.add('correct'); }
    else { fb.className='feedback show bad'; fb.innerHTML=`🤔 ${t('wrong')} ${t('hintPrefix')}${p.hint}<br><small>${lang()==='en'?'One more try!':'再試一次！'}</small>`; }
  }
  save(); buildPTypes(); refreshAll();
}
function setupPractice(){ buildPTypes(); $('#psubmit').onclick=submitP; $('#pnext').onclick=()=>{ SND.click(); if(curP&&!curP.done&&curP.tries>0){ const st=S.practice[curP.type]||(S.practice[curP.type]={t:0,c:0}); st.t++; save(); } newPQ(); }; $('#phint').onclick=()=>{ if(!curP) return; curP.hintUsed=true; SND.pop(); const fb=$('#pfb'); fb.className='feedback show hint'; fb.innerHTML='💡 '+curP.hint; if(curP.fig&&!curP.showFig){ curP.showFig=true; const keep=fb.innerHTML; renderPQ(); fb.className='feedback show hint'; fb.innerHTML=keep; } }; }

/* ---------------- 測驗 ---------------- */
let quiz=null;
function startQuiz(){
  const pool=D.QUIZ.map((q,i)=>i).sort(()=>Math.random()-.5).slice(0,10);
  quiz={items:pool.map(i=>{ const q=D.QUIZ[i]; const order=q.o.map((_,k)=>k).sort(()=>Math.random()-.5); return {i,order,ans:order.indexOf(q.a),pick:null}; }),cur:0,done:false,start:Date.now()};
  $('#quizStart').hidden=true; $('#quizResult').hidden=true; $('#quizBox').hidden=false; SND.win(); log('quiz','開始測驗'); renderQ();
}
function renderQ(){
  const it=quiz.items[quiz.cur], q=D.QUIZ[it.i];
  $('#qnum').textContent=`${quiz.cur+1} / ${quiz.items.length}`; $('#qtopic').textContent=q.t; $('#qbar').style.width=((quiz.cur)/quiz.items.length*100)+'%';
  $('#qtext').innerHTML=L(q.q); const box=$('#qopts'); box.innerHTML='';
  it.order.forEach((k,j)=>{ const b=document.createElement('button'); b.className='opt'+(it.pick===j?' picked':''); b.innerHTML=`<span class="k">${'ABCD'[j]}</span>${L(q.o[k])}`; b.onclick=()=>{ it.pick=j; SND.click(); $$('.opt',box).forEach(x=>x.classList.remove('picked')); b.classList.add('picked'); }; box.appendChild(b); });
  $('#qprev').disabled=quiz.cur===0; $('#qnext').innerHTML= quiz.cur===quiz.items.length-1? '📮 '+(lang()==='en'?'Submit':'交卷') : '➡️ '+t('next')+'' ;
}
function finishQuiz(){
  const un=quiz.items.filter(x=>x.pick===null).length;
  if(un && !confirm(lang()==='en'?`${un} unanswered. Submit anyway?`:`還有 ${un} 題未作答，確定交卷嗎？`)) return;
  quiz.done=true; const right=quiz.items.filter(x=>x.pick===x.ans).length; const score=right*10; const pass=score>=80;
  S.quiz.push({d:new Date().toISOString(),score,right,total:quiz.items.length,sec:Math.round((Date.now()-quiz.start)/1000),wrong:quiz.items.filter(x=>x.pick!==x.ans).map(x=>D.QUIZ[x.i].t)}); log('quiz',`測驗 ${score} 分`); save();
  pass?(SND.win(),confetti()):SND.bad();
  const r=$('#quizResult'); $('#quizBox').hidden=true; r.hidden=false;
  r.innerHTML=`<div class="result-hero"><div class="score">${score}</div><div>${t('score')}（${right}/${quiz.items.length}）</div><h3>${pass?t('pass'):t('notPass')}</h3><div class="btn-row" style="justify-content:center"><button class="btn pri" id="retake">🔁 ${t('retake')}</button><button class="btn" data-go="practice">🎯 ${L({zh:'去練習',en:'Practice'})}</button><button class="btn" data-go="record">📊 ${L({zh:'看歷程',en:'Record'})}</button></div></div><h3>📋 ${t('review')}</h3>`+
    quiz.items.map((x,n)=>{ const q=D.QUIZ[x.i], ok=x.pick===x.ans; return `<div class="review-item ${ok?'ok':'bad'}"><b>${n+1}. ${ok?'✅':'❌'}</b> ${L(q.q)}<br>${t('yourAns')}：${x.pick===null?'—':L(q.o[x.order[x.pick]])}　｜　${t('answer')}：<b>${L(q.o[q.a])}</b><br><span class="muted">💡 ${L(q.e)}</span></div>`; }).join('');
  $('#retake').onclick=startQuiz; refreshAll(); scrollTo({top:0,behavior:'smooth'});
}
function setupQuiz(){ $('#quizGo').onclick=startQuiz; $('#qprev').onclick=()=>{ if(quiz.cur>0){ quiz.cur--; SND.click(); renderQ(); } }; $('#qnext').onclick=()=>{ if(quiz.cur<quiz.items.length-1){ quiz.cur++; SND.click(); renderQ(); } else finishQuiz(); }; }

/* ---------------- 進度計算 ---------------- */
function stats(){
  const lessonN=['s0','s1','s2','s3'].filter(k=>S.lessons[k]).length;
  const labN=['A','B','C','D','E'].filter(k=>S.labs[k]).length;
  const exN=Object.values(S.ex).filter(v=>v==='ok').length;
  const pr=Object.values(S.practice).reduce((s,v)=>({t:s.t+v.t,c:s.c+v.c}),{t:0,c:0});
  const best=S.quiz.length?Math.max(...S.quiz.map(q=>q.score)):null;
  const overall=Math.round(lessonN/4*25 + labN/5*15 + exN/10*20 + Math.min(pr.c,10)/10*15 + (best===null?0:Math.min(best,80)/80*20) + (S.lessons.ext?5:0));
  return {lessonN,labN,exN,pr,best,overall};
}
function refreshAll(){
  const s=stats();
  $('#topProgress').style.width=s.overall+'%';
  $('#ringAll').style.setProperty('--p',s.overall); $('#ringAllTxt').textContent=s.overall+'%';
  $('#stLesson').textContent=s.lessonN+'/4'; $('#stPractice').textContent=s.pr.t; $('#stPracAcc').textContent=(lang()==='en'?'Accuracy ':'正確率 ')+(s.pr.t?Math.round(s.pr.c/s.pr.t*100)+'%':'—'); $('#stQuiz').textContent=s.best===null?'—':s.best;
  $('#ringEx').style.setProperty('--p',s.exN*10); $('#ringExTxt').textContent=s.exN+'/10';
  const done={lesson:['s1','s2','s3'].every(k=>S.lessons[k]),lab:s.labN>=3,exercise:s.exN>=6,practice:s.pr.c>=10,quiz:(s.best||0)>=80,extend:!!S.lessons.ext,record:(S.visits.record||0)>0};
  $$('#roadmap .step').forEach(b=>b.classList.toggle('done',!!done[b.dataset.step]));
  paintSelfLabels();
  return s;
}

/* ---------------- 學習歷程 ---------------- */
const fdt=iso=>{ const d=new Date(iso); return d.toLocaleString(lang()==='en'?'en-US':'zh-TW',{hour12:false}); };
const EVN={visit:['造訪','Visit'],complete:['完成小節','Section done'],reveal:['查看解答','Viewed solution'],check:['自我檢核','Self-check'],exercise:['習題標記','Exercise'],lab:['實驗室','Lab'],practice:['練習','Practice'],quiz:['測驗','Quiz'],download:['下載','Download'],setting:['設定','Setting'],reflect:['反思','Reflection'],start:['開始','Start']};
const evName=e=>EVN[e]?EVN[e][lang()==='en'?1:0]:e;
function renderRecord(){
  const s=refreshAll();
  const card=(ic,v,l)=>`<div class="card stat"><div style="font-size:2rem">${ic}</div><div><div class="big">${v}</div><div class="muted">${l}</div></div></div>`;
  $('#recStats').innerHTML=card('⏱️',Math.round(S.time/60)+' '+t('min'),t('time'))+card('📘',s.lessonN+'/4',t('lessonDone'))+card('🧪',s.labN+'/5',t('labUsed'))+card('📝',s.exN+'/10',t('exDone'))+card('🎯',s.pr.c+'/'+s.pr.t,t('pracCorrect'))+card('🏆',s.best===null?'—':s.best,t('quizBest'))+card('🔥',S.bestStreak||0,lang()==='en'?'Best streak':'最高連擊')+card('📈',s.overall+'%',lang()==='en'?'Overall':'整體完成度');
  $('#recBars').innerHTML=D.PTYPES.filter(p=>p.id!=='mix').map(p=>{ const st=S.practice[p.id]||{t:0,c:0}; const pc=st.t?Math.round(st.c/st.t*100):0; return `<div class="bar-row"><span>${p.ic} ${L({zh:p.zh,en:p.en})}</span><div class="pbar"><i style="width:${pc}%"></i></div><span>${st.c}/${st.t}</span></div>`; }).join('');
  $('#recQuiz').innerHTML=S.quiz.length? `<div class="tbl-wrap"><table class="tbl" style="width:100%"><tr><th>#</th><th>${lang()==='en'?'Time':'時間'}</th><th>${lang()==='en'?'Score':'分數'}</th><th>${lang()==='en'?'Duration':'用時'}</th></tr>${S.quiz.map((q,i)=>`<tr class="${q.score>=80?'best':''}"><td>${i+1}</td><td>${fdt(q.d)}</td><td>${q.score}</td><td>${Math.floor(q.sec/60)}:${String(q.sec%60).padStart(2,'0')}</td></tr>`).join('')}</table></div>` : `<p class="muted">${t('noData')}</p>`;
  const items=[['s0',L({zh:'章首導讀與歷史',en:'Intro & history'})],['s1',L({zh:'1 平行直線系',en:'1 Parallel lines'})],['s2',L({zh:'2 二元一次不等式',en:'2 Inequalities'})],['s3',L({zh:'3 線性規劃',en:'3 Linear programming'})],['ext',L({zh:'延伸學習',en:'Extension'})]].map(([k,n])=>[n,!!S.lessons[k]])
    .concat(['A','B','C','D','E'].map(k=>[(lang()==='en'?'Lab ':'實驗室 ')+k,!!S.labs[k]]))
    .concat(Array.from({length:10},(_,i)=>[(lang()==='en'?'Exercise ':'習題 ')+(i+1)+(S.ex[i+1]==='retry'?(lang()==='en'?' (retry)':'（再練習）'):''),S.ex[i+1]==='ok']));
  $('#recChecklist').innerHTML=items.map(([n,ok])=>`<div>${ok?'✅':'⬜'} ${n}</div>`).join('');
  $('#reflect').value=S.reflect||'';
  const rows=S.log.slice().reverse().slice(0,200);
  $('#recLog').innerHTML= rows.length? `<table><tr><th>${lang()==='en'?'Time':'時間'}</th><th>${lang()==='en'?'Event':'事件'}</th><th>${lang()==='en'?'Detail':'內容'}</th></tr>${rows.map(r=>`<tr><td>${fdt(r.t)}</td><td>${evName(r.ev)}</td><td>${String(r.d).replace(/</g,'&lt;')}</td></tr>`).join('')}</table>` : `<p class="muted" style="padding:1rem">${t('noData')}</p>`;
}
function dl(name,content,type){ const b=new Blob([content],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500); log('download',name); }
const stamp=()=>new Date().toISOString().slice(0,10);
function reportHTML(){
  const s=stats(); const esc=x=>String(x).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const pr=D.PTYPES.filter(p=>p.id!=='mix').map(p=>{ const st=S.practice[p.id]||{t:0,c:0}; return `<tr><td>${p.zh}</td><td>${st.c}</td><td>${st.t}</td></tr>`; }).join('');
  return `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><title>線性規劃學習報告</title><style>body{font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif;max-width:820px;margin:2rem auto;padding:0 1rem;line-height:1.7;color:#222}h1{color:#5b5bf6}table{border-collapse:collapse;width:100%;margin:.6rem 0}td,th{border:1px solid #ccd;padding:.35rem .6rem;text-align:left}th{background:#eef}.k{display:inline-block;background:#f4f6ff;border-radius:10px;padding:.5rem 1rem;margin:.3rem}</style></head><body>
  <h1>📐 線性規劃｜學習歷程報告</h1><p>學生：<b>${esc(S.name||'（未填寫）')}</b>　產生時間：${new Date().toLocaleString('zh-TW',{hour12:false})}</p>
  <div><span class="k">整體完成度 <b>${s.overall}%</b></span><span class="k">學習時間 <b>${Math.round(S.time/60)} 分鐘</b></span><span class="k">教材小節 <b>${s.lessonN}/4</b></span><span class="k">實驗室 <b>${s.labN}/5</b></span><span class="k">習題答對 <b>${s.exN}/10</b></span><span class="k">練習 <b>${s.pr.c}/${s.pr.t}</b></span><span class="k">測驗最高 <b>${s.best===null?'—':s.best}</b></span><span class="k">最高連擊 <b>${S.bestStreak||0}</b></span></div>
  <h2>測驗紀錄</h2><table><tr><th>#</th><th>時間</th><th>分數</th><th>答錯主題</th></tr>${S.quiz.map((q,i)=>`<tr><td>${i+1}</td><td>${new Date(q.d).toLocaleString('zh-TW',{hour12:false})}</td><td>${q.score}</td><td>${(q.wrong||[]).join('、')||'—'}</td></tr>`).join('')||'<tr><td colspan="4">尚無</td></tr>'}</table>
  <h2>練習表現</h2><table><tr><th>題型</th><th>首次答對</th><th>作答題數</th></tr>${pr}</table>
  <h2>習題自評</h2><table><tr>${Array.from({length:10},(_,i)=>`<th>${i+1}</th>`).join('')}</tr><tr>${Array.from({length:10},(_,i)=>`<td>${S.ex[i+1]==='ok'?'✅':S.ex[i+1]==='retry'?'🔁':'—'}</td>`).join('')}</tr></table>
  <h2>學習反思</h2><p style="white-space:pre-wrap;border:1px dashed #aab;padding:.8rem;border-radius:8px">${esc(S.reflect||'（未填寫）')}</p>
  <h2>活動紀錄（最近 100 筆）</h2><table><tr><th>時間</th><th>事件</th><th>內容</th></tr>${S.log.slice(-100).reverse().map(r=>`<tr><td>${new Date(r.t).toLocaleString('zh-TW',{hour12:false})}</td><td>${EVN[r.ev]?EVN[r.ev][0]:r.ev}</td><td>${esc(r.d)}</td></tr>`).join('')}</table>
  <p style="color:#888;font-size:.85rem">本報告由「線性規劃互動學習網」產生，可用瀏覽器「列印 → 另存為 PDF」。</p></body></html>`;
}
function setupRecord(){
  $('#dlHtml').onclick=()=>{ SND.pop(); dl(`線性規劃學習報告_${S.name||'student'}_${stamp()}.html`,reportHTML(),'text/html;charset=utf-8'); };
  $('#dlCsv').onclick=()=>{ SND.pop(); const rows=[['時間','事件','內容']].concat(S.log.map(r=>[fdt(r.t),evName(r.ev),r.d])); dl(`線性規劃活動紀錄_${stamp()}.csv`,'﻿'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\r\n'),'text/csv;charset=utf-8'); };
  $('#dlJson').onclick=()=>{ SND.pop(); dl(`線性規劃學習資料_${stamp()}.json`,JSON.stringify(Object.assign({app:'線性規劃互動學習網',exported:new Date().toISOString()},S),null,2),'application/json'); };
  $('#resetAll').onclick=()=>{ if(!confirm(t('resetQ'))) return; S=blank(); save(); labUse.seen={}; $$('[data-done]').forEach(b=>b.classList.remove('on')); $$('.exitem').forEach(markSelf); $('#studentName').value=''; renderPre(); buildPTypes(); renderRecord(); toast(t('cleared')); SND.bad(); };
  $('#saveReflect').onclick=()=>{ S.reflect=$('#reflect').value; log('reflect',S.reflect.slice(0,60)); save(); toast(t('saved')); SND.ok(); };
  const nm=$('#studentName'); nm.value=S.name||''; nm.addEventListener('change',()=>{ S.name=nm.value.trim(); save(); toast(t('saved')); });
}

/* ---------------- 設定對話框與快捷鍵 ---------------- */
function setupSettings(){
  const dlg=$('#settingsDlg');
  $('#btnSettings').onclick=()=>{ SND.click(); applySettings(); dlg.showModal?dlg.showModal():dlg.setAttribute('open',''); };
  $('#closeSet').onclick=()=>{ SND.click(); dlg.close?dlg.close():dlg.removeAttribute('open'); };
  dlg.addEventListener('click',e=>{ if(e.target===dlg) dlg.close(); });
  $$('#settingsDlg .seg').forEach(s=>$$('button',s).forEach(b=>b.addEventListener('click',()=>{ const k=s.dataset.set, v=b.dataset.v; if(k==='sound' && v==='on'){ SET.sound='on'; } setOpt(k,v); SND.click(); applySettings(); })));
  document.addEventListener('keydown',e=>{ if(e.target.matches('input,textarea,select')) return; if(e.key==='f'||e.key==='F') setOpt('fullscreen',document.fullscreenElement?'off':'on'); if(e.key==='m'||e.key==='M'){ setOpt('sound',SET.sound==='on'?'off':'on'); toast('🔊 '+(SET.sound==='on'?t('on')||'ON':'OFF')); } });
}

/* ---------------- 啟動 ---------------- */
function init(){
  applySettings(); renderFigs(); setupF15(); setupLesson(); setupExercises(); setupLabs(); setupPractice(); setupQuiz(); setupRecord(); setupSettings();
  applyLang();
  if(!S.log.length) log('start','首次使用');
  setInterval(()=>{ if(document.visibilityState==='visible'){ S.time+=15; save(); } },15000);
  const p=location.hash.slice(1); go(PAGES.includes(p)?p:'home');
}
D.T.zh.on='開啟'; D.T.en.on='ON';
init();
})();
