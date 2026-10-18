// ── TILT ──────────────────────────────────────────
let tiltOk=false,lastTilt=0;
function reqTilt(){
  if(tiltOk)return;
  if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
    DeviceOrientationEvent.requestPermission().then(r=>{if(r==='granted'){tiltOk=true;listenTilt();}}).catch(()=>{});
  } else {tiltOk=true;listenTilt();}
}
function listenTilt(){
  window.addEventListener('deviceorientation',e=>{
    if(curSc!=='sDrink')return;
    // the straw picker auto-opens over the drink — don't drain the cup behind it
    const sm=document.getElementById('strawModal');
    if(sm&&sm.classList.contains('on'))return;
    const t=Math.abs(e.gamma||0);
    if(t>28&&Date.now()-lastTilt>900){lastTilt=Date.now();takeSip();}
  },{passive:true});
}
document.addEventListener('click',()=>{if(!tiltOk&&curSc==='sDrink')reqTilt();},{once:false});

// ── CONFETTI ──────────────────────────────────────
function confetti(){
  const COLS=['#C97B84','#2D6A4F','#52B788','#E8A0A8','#95D5B2','#F5EFE6','#3A508A'];
  for(let i=0;i<48;i++){
    setTimeout(()=>{
      const el=document.createElement('div');el.className='cp';
      const w=6+Math.random()*10,h=6+Math.random()*10;
      el.style.cssText=`left:${Math.random()*100}vw;top:-20px;width:${w}px;height:${h}px;background:${COLS[~~(Math.random()*COLS.length)]};animation-duration:${2+Math.random()*2.2}s;animation-delay:${Math.random()*.4}s;border-radius:${Math.random()>.5?'50%':'2px'}`;
      document.body.appendChild(el);setTimeout(()=>el.remove(),4500);
    },i*32);
  }
}

// ── TOAST ────────────────────────────────────────
let toastTimer=null;
function showToast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');
  if(toastTimer)clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{t.classList.remove('on');toastTimer=null;},2700);
}

// ── RENAME INPUT — Enter key ──────────────────────
window.addEventListener('DOMContentLoaded',()=>{
  const inp=document.getElementById('rmInput');
  if(inp) inp.addEventListener('keydown',e=>{if(e.key==='Enter')confirmDownload();});
  const ni=document.getElementById('nickInput');
  if(ni) ni.addEventListener('keydown',e=>{if(e.key==='Enter')saveNick();});
});

