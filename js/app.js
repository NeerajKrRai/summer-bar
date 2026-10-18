// ── STATE ─────────────────────────────────────────
const gSel={fruitGrid:[],iceGrid:[],frozenGrid:[],garnishGrid:[],vip:[]};
let sipCnt=0,curSc='sLoad',ckName='',saved=[],autoNavTimer=null;
try{
  const raw=JSON.parse(localStorage.getItem('nk_ck')||'[]');
  // keep ALL entries, just normalise fruits to array and strip image data
  saved=raw.filter(c=>c&&c.id).map(c=>({
    ...c,
    imgDataUrl:null,
    fruits:Array.isArray(c.fruits)?c.fruits:
           (typeof c.fruits==='string'?c.fruits.split(',').map(s=>({e:'🍹',n:s.trim(),c:'#3a508a'})):[]),
  }));
}catch(e){saved=[];}
// single home for the strip-images-then-write rule; a write failure must never touch in-memory cards
function persistCards(){
  try{localStorage.setItem('nk_ck',JSON.stringify(saved.map(c=>({...c,imgDataUrl:null}))));}
  catch(e){console.warn('Storage full — cards kept in memory only');}
}
persistCards();

// ── BOOT ──────────────────────────────────────────
window.addEventListener('load',()=>{
  buildOrbit();
  makeGlass(document.getElementById('ldGlass'),{asWrap:true,w:'clamp(96px,26vw,148px)'});
  makeGlass(document.getElementById('daGhost'),{});
  buildGrid('fruitGrid',FRUITS,'r',3);
  buildGrid('iceGrid',ICE,'g');
  buildGrid('frozenGrid',FROZEN,'g');
  buildGrid('garnishGrid',GARNISH,'g');
  buildPantry();
  loadGlaze();
  loadNick();
  animPct();
  autoNavTimer=setTimeout(()=>{autoNavTimer=null;go('sDash');},3500);
});

function startNewRun(){resetRun();go('sBeach');}

// ── SCREEN ROUTER ─────────────────────────────────
const SM={
  sLoad:{nav:false},sDash:{nav:false},
  sBeach:{nav:true,back:'sDash',title:'The Beach',step:''},
  sFridge:{nav:true,back:'sBeach',title:'The Fridge',step:'Step 1 of 4'},
  sFreezer:{nav:true,back:'sFridge',title:'The Freezer',step:'Step 2 of 4'},
  sGarnish:{nav:true,back:'sFreezer',title:'Garnish Table',step:'Step 3 of 4'},
  sDrink:{nav:true,back:'sGarnish',title:'Your Cocktail',step:''},
  sFile:{nav:true,back:'sDash',title:'My Cocktail File',step:''},
  sPantry:{nav:true,back:'sGarnish',title:'Secret Pantry ✨',step:'Step 4 of 4'},
  sStore:{nav:true,back:'sDash',title:'🌸 Sakura Store',step:''},
};
function go(id){
  // any manual navigation cancels a pending auto-advance (boot splash, post-save return)
  if(autoNavTimer){clearTimeout(autoNavTimer);autoNavTimer=null;}
  // dismiss any open bottom-sheet so it can never be stranded on top of another screen
  ['strawModal','herbModal','teaModal'].forEach(mid=>{const el=document.getElementById(mid);if(el)el.classList.remove('on');});
  document.querySelectorAll('.sc').forEach(s=>s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  curSc=id;
  const m=SM[id];
  const nav=document.getElementById('nav');
  if(m.nav){
    nav.classList.add('on');
    document.getElementById('nTitle').textContent=m.title;
    document.getElementById('nStep').textContent=m.step;
    document.getElementById('nBack').onclick=()=>go(m.back);
  } else nav.classList.remove('on');
  if(id==='sFreezer')spawnFlakes();
  if(id==='sDrink'){initDrink();hidePreview();}
  else if(id==='sStore'){buildStore();}
  else if(id==='sFile'){buildFile();hidePreview();}
  else if(id==='sPantry'){buildPantry();rebuildPreview();showPreview();}
  else if(['sFridge','sFreezer','sGarnish'].includes(id)){rebuildPreview();showPreview();}
  else hidePreview();
  updateGlazeWidget();
}

// ── LOADING PFX ───────────────────────────────────
function animPct(){
  let i=0;const el=document.getElementById('ldPct');
  const iv=setInterval(()=>{el.textContent=HINTS[Math.min(i,HINTS.length-1)];i++;if(i>=HINTS.length)clearInterval(iv);},720);
}
function buildOrbit(){
  const wrap=document.getElementById('orbitWrap');
  ['🍓','🫐','🍋','🍇','🌿','🍊','💙','🍉','⭐'].forEach((b,i)=>{
    const r=68+(i%3)*46,s=(i/9)*360,dur=5.2+i*.65;
    const el=document.createElement('div');el.className='bo';el.textContent=b;
    el.style.cssText=`--s:${s}deg;--r:${r}px;animation-duration:${dur}s;margin-left:-12px;margin-top:-12px;font-size:clamp(14px,3.6vw,22px)`;
    wrap.appendChild(el);
  });
}

