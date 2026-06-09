/* ── CURSOR ── */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0,raf=true;

document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY });
document.addEventListener('mousedown', () => document.body.classList.add('clicking'));
document.addEventListener('mouseup',   () => document.body.classList.remove('clicking'));

(function loop(){
  dot.style.left=mx+'px'; dot.style.top=my+'px';
  rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(loop);
})();

document.querySelectorAll('a,button,.p-card,.c-item').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hov'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hov'));
});

/* ── SCROLL PROGRESS ── */
const prog = document.getElementById('prog');
function onScroll(){
  const pct = window.scrollY/(document.body.scrollHeight-innerHeight)*100;
  prog.style.width = pct+'%';
  document.getElementById('nav').classList.toggle('stuck', window.scrollY>50);
}
window.addEventListener('scroll', onScroll, {passive:true});

/* ── HAMBURGER ── */
const hbg     = document.getElementById('hbg');
const mobMenu = document.getElementById('mobMenu');
hbg.addEventListener('click',()=>{
  hbg.classList.toggle('open');
  mobMenu.classList.toggle('open');
});
document.querySelectorAll('.ml').forEach(l=>l.addEventListener('click',()=>{
  hbg.classList.remove('open'); mobMenu.classList.remove('open');
}));

/* ── MAGNETIC EFFECT ── */
document.querySelectorAll('.mag').forEach(el=>{
  el.addEventListener('mousemove', e=>{
    const r=el.getBoundingClientRect();
    const dx=(e.clientX-r.left-r.width/2)*.3;
    const dy=(e.clientY-r.top-r.height/2)*.3;
    el.style.transition='transform .1s';
    el.style.transform=`translate(${dx}px,${dy}px)`;
  });
  el.addEventListener('mouseleave',()=>{
    el.style.transition='transform .55s cubic-bezier(.16,1,.3,1)';
    el.style.transform='translate(0,0)';
  });
});

/* ── SCROLL REVEAL ── */
const rvObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); rvObs.unobserve(e.target); }
  });
},{threshold:.1});
document.querySelectorAll('.rv').forEach(el=>rvObs.observe(el));

/* ── COUNTER ANIMATION ── */
function animCount(el, target, pre='', suf='', dur=1700){
  let start=null;
  const step=ts=>{
    if(!start) start=ts;
    const p=Math.min((ts-start)/dur,1);
    const e=1-Math.pow(1-p,3);
    el.textContent=pre+Math.round(e*target)+suf;
    if(p<1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const cntObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const el=e.target;
      animCount(el,+el.dataset.count,el.dataset.pre||'',el.dataset.suf||'');
      cntObs.unobserve(el);
    }
  });
},{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>cntObs.observe(el));

/* ── 3D CARD TILT ── */
document.querySelectorAll('.tilt').forEach(card=>{
  card.addEventListener('mousemove', e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transition='transform .08s';
    card.style.transform=`perspective(1400px) rotateY(${x*4}deg) rotateX(${-y*2.5}deg) scale3d(1.008,1.008,1.008)`;
  });
  card.addEventListener('mouseleave',()=>{
    card.style.transition='transform .6s cubic-bezier(.16,1,.3,1)';
    card.style.transform='perspective(1400px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
  });
});

/* ── PARALLAX HERO ORB ── */
const orb = document.querySelector('.h-orb');
window.addEventListener('scroll',()=>{
  if(orb) orb.style.transform=`translate(-50%, calc(-60% + ${window.scrollY*.25}px))`;
},{passive:true});

/* ── SMOOTH ANCHOR ── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); }
  });
});

/* ── LOADER ──────────────────────────────────────────────────── */
(function(){
  document.body.style.overflow = 'hidden';
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('ldFill');
  const glow   = document.getElementById('ldGlow');
  const pct    = document.getElementById('ldPct');

  let progress = 0;
  const steps = [
    {target:22, delay:50},  {target:45, delay:35},
    {target:68, delay:55},  {target:84, delay:65},
    {target:94, delay:80},  {target:100,delay:60}
  ];
  let stepIdx = 0;

  function runStep(){
    if(stepIdx >= steps.length) return;
    const {target, delay} = steps[stepIdx++];
    const increment = (target - progress) / 18;
    function tick(){
      progress = Math.min(progress + increment, target);
      const p = Math.round(progress);
      fill.style.width = p + '%';
      glow.style.opacity = p > 2 ? '1' : '0';
      if(pct) pct.textContent = p + '%';
      if(progress < target) requestAnimationFrame(tick);
      else setTimeout(runStep, delay);
    }
    requestAnimationFrame(tick);
  }

  // Start slightly delayed for the CSS animations to play first
  setTimeout(runStep, 900);

  // Dismiss loader when at 100%
  function dismiss(){
    if(progress >= 99){
      setTimeout(()=>{
        loader.classList.add('hide');
        document.body.style.overflow = '';
        setTimeout(()=>{ if(loader.parentNode) loader.parentNode.removeChild(loader); }, 950);
      }, 300);
    } else {
      setTimeout(dismiss, 80);
    }
  }
  setTimeout(dismiss, 900);
})();