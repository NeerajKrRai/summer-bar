// ── ITEM GRIDS ────────────────────────────────────
function buildGrid(gid,data,style,max){
  const g=document.getElementById(gid);g.innerHTML='';
  data.forEach((item,i)=>{
    const el=document.createElement('div');el.className='ic';el.id=`${gid}_${i}`;
    el.innerHTML=`<div class="ic-ck">✓</div><div class="ic-em">${item.e}</div><div class="ic-nm">${item.n}</div>${item.s?`<div class="ic-sk">${item.s}</div>`:''}`;
    el.onclick=()=>togItem(gid,i,item,style,max);
    g.appendChild(el);
  });
}
function togItem(gid,i,item,style,max){
  const el=document.getElementById(`${gid}_${i}`);
  const cls=style==='r'?'sr':'sg';
  const arr=gSel[gid];
  const idx=arr.findIndex(x=>x.i===i);
  if(idx>=0){
    arr.splice(idx,1);el.classList.remove(cls);
    reactToSelection(gid,i,item,false);
    rebuildPreview();
  } else {
    if(max&&arr.length>=max){shk(el);return;}
    // herb pack / tea bag confirm via modal, then land in gSel like any other pick
    if(item.pack){ openHerbPack(); return; }
    if(item.teabag){ openTeaBag(); return; }
    arr.push({i,...item});el.classList.add(cls);
    reactToSelection(gid,i,item,true);
    rebuildPreview();
  }
  if(gid==='fruitGrid')updFrCnt();
}
function shk(el){el.style.animation='none';el.offsetHeight;el.style.animation='shake .35s ease';el.addEventListener('animationend',()=>el.style.animation='',{once:true});}
function updFrCnt(){
  const n=gSel.fruitGrid.length;
  document.getElementById('fruitCnt').textContent=n<3?`Choose ${3-n} more fruit${3-n!==1?'s':''}`:'✦ Perfect selection!';
  document.getElementById('fruitNext').classList.toggle('on',n===3);
}

// ── SNOWFLAKES ────────────────────────────────────
function spawnFlakes(){
  const l=document.getElementById('flkLayer');l.innerHTML='';
  const fl=['❄','✦','✧','❅','·'];
  for(let i=0;i<22;i++){
    const el=document.createElement('div');el.className='flk';
    el.textContent=fl[i%fl.length];
    el.style.cssText=`left:${Math.random()*100}%;animation-duration:${5.5+Math.random()*6}s;animation-delay:${-Math.random()*9}s;font-size:${10+Math.random()*14}px`;
    l.appendChild(el);
  }
}

// ── SWITCH ────────────────────────────────────────
let swCnt=0;
function resetSwitch(){
  if(autoNavTimer){clearTimeout(autoNavTimer);autoNavTimer=null;}
  swCnt=0;
  const sw=document.getElementById('swTrk');
  if(sw)sw.className='sw-trk';
  const h=document.getElementById('swHint');
  if(h)h.textContent='0 / 2 clicks';
}
function clickSw(){
  // a fresh tap cancels any armed auto-advance so re-tapping can't yank you to the Pantry
  if(autoNavTimer){clearTimeout(autoNavTimer);autoNavTimer=null;}
  if(swCnt>=2)resetSwitch();
  swCnt++;
  const sw=document.getElementById('swTrk');
  document.getElementById('swHint').textContent=`${swCnt} / 2 clicks`;
  if(swCnt===1)sw.className='sw-trk on1';
  if(swCnt===2){sw.className='sw-trk on2';autoNavTimer=setTimeout(()=>{autoNavTimer=null;resetSwitch();go('sPantry');},900);}
}


// ── LIVE PREVIEW GLASS ────────────────────────────
// the preview is DERIVED from gSel every time — no parallel emoji list to drift
let previewEmojis=[];

function previewFor(x){
  if(x.pack) return x.herbs.map(h=>h.split(' ')[0]);
  if(x.teabag) return ['🫖','☕'];
  return [x.e];
}
function rebuildPreview(){
  previewEmojis=[...gSel.fruitGrid,...gSel.iceGrid,...gSel.frozenGrid,...gSel.garnishGrid,...gSel.vip].flatMap(previewFor);
  refreshPreviewGlass();
}
function showPreview(){
  const wrap=document.getElementById('previewWrap');
  wrap.classList.add('on');
  refreshPreviewGlass();
}
function hidePreview(){
  document.getElementById('previewWrap').classList.remove('on');
}
function refreshPreviewGlass(){
  const svg=document.getElementById('previewGlass');
  const f=gSel.fruitGrid[0];
  const lc=f?.c||'#3a508a', lc2=darken(lc,32), fe=f?.e||'🍹';
  const gs=previewEmojis.slice(0,3).join('')||'';
  _fillGlass(svg,lc,lc2,'transparent',fe,gs,'pv');

  const addDiv=document.getElementById('previewAdditions');
  addDiv.innerHTML=previewEmojis.map(e=>`<span class="preview-add-em">${e}</span>`).join('');
}

// ── HERB PACK MODAL ───────────────────────────────
function openHerbPack(){
  const herbs=ICE.find(x=>x.pack);
  const list=document.getElementById('herbList');
  list.innerHTML=herbs.herbs.map(h=>`<div class="hm-herb-row"><span>${h.split(' ')[0]}</span>${h.split(' ').slice(1).join(' ')}</div>`).join('');
  document.getElementById('herbModal').classList.add('on');
  initSwipeDown('herbSheet','herbModal', ()=>{
    document.getElementById('herbModal').classList.remove('on');
  });
}
function confirmHerbPack(){
  const i=ICE.findIndex(x=>x.pack);
  if(!gSel.iceGrid.some(x=>x.pack)){
    gSel.iceGrid.push({i,...ICE[i]});
    const el=document.getElementById(`iceGrid_${i}`);
    if(el)el.classList.add('sg');
  }
  rebuildPreview();
  document.getElementById('herbModal').classList.remove('on');
  showToast('🌿 Herbs dropped in!');
}

// ── TEA BAG MODAL ─────────────────────────────────
function openTeaBag(){
  document.getElementById('teaModal').classList.add('on');
  initSwipeDown('teaSheet','teaModal', ()=>{
    document.getElementById('teaModal').classList.remove('on');
  });
}
function confirmTeaBag(){
  const i=GARNISH.findIndex(x=>x.teabag);
  if(!gSel.garnishGrid.some(x=>x.teabag)){
    gSel.garnishGrid.push({i,...GARNISH[i]});
    const el=document.getElementById(`garnishGrid_${i}`);
    if(el)el.classList.add('sg');
  }
  rebuildPreview();
  document.getElementById('teaModal').classList.remove('on');
  showToast('🫖 Iced tea blooming!');
}

// ── SWIPE DOWN TO DISMISS ─────────────────────────
function initSwipeDown(sheetId, modalId, onDismiss){
  const sheet=document.getElementById(sheetId);
  if(sheet.dataset.swipeBound)return; // listeners persist on the static sheet — bind once
  sheet.dataset.swipeBound='1';
  let startY=0, dragging=false;
  function onStart(y){startY=y;dragging=true;sheet.style.transition='none';}
  function onMove(y){
    if(!dragging)return;
    const dy=Math.max(0,y-startY);
    sheet.style.transform=`translateY(${dy}px)`;
  }
  function onEnd(y){
    if(!dragging)return; dragging=false;
    const dy=y-startY;
    sheet.style.transition='transform .35s cubic-bezier(.25,.8,.25,1)';
    if(dy>90){ sheet.style.transform='translateY(100%)'; setTimeout(()=>{sheet.style.transform='';onDismiss();},350); }
    else sheet.style.transform='';
  }
  sheet.addEventListener('touchstart',e=>onStart(e.touches[0].clientY),{passive:true});
  sheet.addEventListener('touchmove',e=>onMove(e.touches[0].clientY),{passive:true});
  sheet.addEventListener('touchend',e=>onEnd(e.changedTouches[0].clientY),{passive:true});
}

// ── SECRET PANTRY ─────────────────────────────────
const VIP_ITEMS=[
  {e:'🫚',n:'Summer Ginger',  vip:true},
  {e:'🌸',n:'Mini Sakura Tea',vip:true},
  {e:'🧊',n:'Sakura Ice',     vip:true},
  {e:'🍯',n:'Honey Dew Drizzle',vip:true},
  {e:'🫧',n:'Rose Bubbles',   vip:true},
  {e:'🌺',n:'Hibiscus Syrup', vip:true},
  {e:'🍑',n:'Peach Mochi Cube',vip:true},
  {e:'💜',n:'Butterfly Pea',  vip:true},
  {e:'🌙',n:'Moon Jelly',     vip:true},
  {e:'⭐',n:'Gold Leaf',      vip:true},
  {e:'🫐',n:'Wild Bluebell',  vip:true},
  {e:'🍵',n:'Matcha Frost',   vip:true},
];
const UNLOCK_AT=10;
// VIP is a one-time earned milestone — deleting cards later must not revoke it
let vipUnlocked=false;
try{vipUnlocked=localStorage.getItem('nk_vip')==='1';}catch(e){}

function isPantryUnlocked(){ return vipUnlocked || saved.length>=UNLOCK_AT; }

function buildPantry(){
  const locked=document.getElementById('pantryLocked');
  const unlocked=document.getElementById('pantryUnlocked');

  if(isPantryUnlocked()){
    locked.style.display='none';
    unlocked.style.display='flex';
    buildVipGrid();
    buildPantryStars();
  } else {
    // show tease - still let them skip to drink
    locked.style.display='flex';
    unlocked.style.display='none';
    document.getElementById('pantryCount').textContent=saved.length;
    const pct=Math.min(100,(saved.length/UNLOCK_AT)*100);
    document.getElementById('pantryFill').style.width=pct+'%';
  }
}

function buildVipGrid(){
  gSel.vip=[];
  const grid=document.getElementById('vipGrid');
  grid.innerHTML='';
  VIP_ITEMS.forEach((item,i)=>{
    const el=document.createElement('div');
    el.className='vip-card';
    el.id='vip_'+i;
    el.innerHTML='<div class="ic-ck">✓</div><div class="vip-em">'+item.e+'</div><div class="vip-nm">'+item.n+'</div><div class="vip-badge">VIP</div>';
    el.onclick=()=>togVip(i,item,el);
    grid.appendChild(el);
  });
}

function togVip(i,item,el){
  const idx=gSel.vip.findIndex(x=>x.i===i);
  if(idx>=0){ gSel.vip.splice(idx,1); el.classList.remove('sel'); }
  else { gSel.vip.push({i,...item}); el.classList.add('sel'); }
  // glaze is earned when the cocktail is SAVED (saveDrink) — tile toggling mints nothing
  rebuildPreview();
}

function buildPantryStars(){
  const c=document.getElementById('pantryStars'); c.innerHTML='';
  const sp=['✦','✧','⭐','🌸','💫','✨','🌟'];
  for(let i=0;i<28;i++){
    const el=document.createElement('div'); el.className='pstar';
    el.textContent=sp[i%sp.length];
    el.style.cssText='left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;animation-duration:'+(2+Math.random()*4)+'s;animation-delay:'+(Math.random()*4)+'s;font-size:'+(8+Math.random()*14)+'px';
    c.appendChild(el);
  }
}

function goSip(){
  go('sDrink');
}

// unlock celebration — fires exactly once, ever (persisted milestone)
function checkUnlock(){
  if(!vipUnlocked && saved.length>=UNLOCK_AT){
    vipUnlocked=true;
    try{localStorage.setItem('nk_vip','1');}catch(e){}
    showUnlockCelebration();
  }
  buildPantry();
}

function showUnlockCelebration(){
  const overlay=document.getElementById('unlockOverlay');
  overlay.classList.add('on');
  // sparkles
  const sp=document.getElementById('ulSparkle'); sp.innerHTML='';
  const items=['✨','🌸','⭐','💫','🌟','🎉','💜','🌺'];
  for(let i=0;i<30;i++){
    const el=document.createElement('div'); el.className='ul-sp';
    el.textContent=items[i%items.length];
    el.style.cssText='left:'+Math.random()*100+'%;animation-duration:'+(3+Math.random()*4)+'s;animation-delay:'+(Math.random()*3)+'s;font-size:'+(12+Math.random()*18)+'px';
    sp.appendChild(el);
  }
  confetti();
}

function closeUnlock(){
  document.getElementById('unlockOverlay').classList.remove('on');
  go('sPantry');
}



// ── NICKNAME SYSTEM ───────────────────────────────
let chefName = '';

function loadNick(){
  // storage access can throw (restricted browsers) — the nick modal must never trap the app
  try{chefName = localStorage.getItem('nk_chef') || '';}catch(e){chefName='';}
  if(chefName){
    document.getElementById('nickModal').classList.add('done');
    updateNickDisplay();
  }
}

function saveNick(){
  const val = document.getElementById('nickInput').value.trim();
  if(!val) return;
  chefName = val;
  try{localStorage.setItem('nk_chef', chefName);}catch(e){}
  document.getElementById('nickModal').classList.add('done');
  updateNickDisplay();
  showToast('Welcome, Chef ' + chefName + '!! 🌸');
}

function updateNickDisplay(){
  const el = document.getElementById('dashWelcome');
  if(el && chefName) el.textContent = 'Welcome back, Chef ' + chefName + ' ❆';
}

