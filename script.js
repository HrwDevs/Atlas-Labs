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

/* ══════════════════════════════════════════════════════════════
   1. LENIS SMOOTH SCROLL (with mobile-safe fallback)
══════════════════════════════════════════════════════════════ */
try {
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.25,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function lenisRaf(time){ lenis.raf(time); requestAnimationFrame(lenisRaf); }
    requestAnimationFrame(lenisRaf);
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }
} catch(e) { console.warn('Lenis failed, using native scroll', e); }

if (typeof gsap !== 'undefined') { gsap.ticker.lagSmoothing(0); }

/* ══════════════════════════════════════════════════════════════
   2. GSAP SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.rv').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: el.classList.contains('d1') ? 0.1
             : el.classList.contains('d2') ? 0.22
             : el.classList.contains('d3') ? 0.34 : 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Hero stagger
  const heroTl = gsap.timeline({ delay: 0.2 });
  heroTl
    .fromTo('.h-eyebrow',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    .fromTo('.h-title .inn',
      { y: '108%' },
      { y: '0%', duration: 0.75, ease: 'expo.out', stagger: 0.08 }, '-=0.3')
    .fromTo('.h-sub',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
    .fromTo('.h-btns',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
    .fromTo('.h-scroll',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=0.3');

  gsap.fromTo('nav',
    { opacity: 0, y: -12 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 }
  );

  gsap.utils.toArray('.p-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
      {
        opacity: 1, x: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 82%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  gsap.fromTo('.c-item',
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: {
        trigger: '.c-grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
} else {
  // GSAP unavailable — make all .rv elements visible immediately
  document.querySelectorAll('.rv,.h-eyebrow,.h-sub,.h-btns,.h-scroll').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}



/* ══════════════════════════════════════════════════════════════
   4. ENHANCED MAGNETIC CURSOR (desktop only)
══════════════════════════════════════════════════════════════ */
if (window.matchMedia('(hover: hover)').matches && typeof gsap !== 'undefined') {
  try {
    document.querySelectorAll('.mag, .btn-p, .btn-g, .n-cta').forEach(el => {
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);

      clone.addEventListener('mousemove', e => {
        const r = clone.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * 0.35;
        const dy = (e.clientY - r.top  - r.height / 2) * 0.35;
        gsap.to(clone, { x: dx, y: dy, duration: 0.25, ease: 'power2.out' });
        gsap.to('#cur-ring', { scale: 1.8, borderColor: 'var(--accent)', duration: 0.2 });
      });

      clone.addEventListener('mouseleave', () => {
        gsap.to(clone, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        gsap.to('#cur-ring', { scale: 1, borderColor: 'rgba(201,169,110,.45)', duration: 0.35 });
      });
    });

    // Click burst
    document.addEventListener('click', e => {
      const burst = document.createElement('div');
      burst.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;
        width:6px;height:6px;border-radius:50%;background:var(--accent);
        pointer-events:none;z-index:9998;transform:translate(-50%,-50%);`;
      document.body.appendChild(burst);
      gsap.to(burst, { scale: 6, opacity: 0, duration: 0.55, ease: 'power2.out',
        onComplete: () => burst.remove() });
    });
  } catch(e) { console.warn('Magnetic cursor failed', e); }
}

/* ══════════════════════════════════════════════════════════════
   5. PARTICLE BACKGROUND
══════════════════════════════════════════════════════════════ */
try {
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], mouse = { x: -9999, y: -9999 };

    function resizeCanvas(){
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    // Fewer particles on mobile for performance
    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile
      ? Math.min(55, Math.floor((window.innerWidth * window.innerHeight) / 14000))
      : Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 9000));

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    function drawParticles(){
      ctx.clearRect(0, 0, W, H);

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(201,169,110,${(1 - dist/130) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        const md = Math.sqrt(mdx*mdx + mdy*mdy);
        if (md < 100 && md > 0) {
          const force = (100 - md) / 100;
          p.vx += (mdx / md) * force * 0.6;
          p.vy += (mdy / md) * force * 0.6;
        }
        const spd = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (spd > 2) { p.vx = (p.vx/spd)*2; p.vy = (p.vy/spd)*2; }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grad.addColorStop(0, `rgba(201,169,110,${p.alpha})`);
        grad.addColorStop(1, `rgba(201,169,110,0)`);
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }
} catch(e) { console.warn('Particles failed', e); }

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

/* ── CATEGORY FILTERING ── */
function filterProducts(category) {
  // Update active tab
  document.querySelectorAll('.cat-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-filter') === category);
  });

  // Show/hide products based on category
  document.querySelectorAll('.p-card').forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    if (cardCategory === category) {
      card.style.display = 'grid';
      // Force instantly visible — bypasses GSAP's scroll-triggered
      // fade-in, which would otherwise wait for a scroll position
      // calculated before the tab filter changed the page layout.
      card.style.opacity = '1';
      card.style.transform = 'none';
      card.style.animation = 'fadeIn .35s ease-out';
    } else {
      card.style.display = 'none';
    }
  });

  // Hide category dividers that don't match
  document.querySelectorAll('.cat-divider').forEach(divider => {
    divider.style.display = (divider.getAttribute('id') === category) ? 'flex' : 'none';
  });

  // Recalculate scroll trigger positions now that the layout has
  // changed size, so any remaining scroll-based effects stay accurate.
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
}

document.querySelectorAll('.cat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    filterProducts(tab.getAttribute('data-filter'));
  });
});

// Apply default filter (Performance) immediately on initial render
filterProducts('performance');
