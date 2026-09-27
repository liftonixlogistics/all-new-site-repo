
(()=> {
  const section=document.querySelector('.experience');
  const sticky=document.querySelector('.experience-sticky');
  const canvas=document.getElementById('robotCanvas');
  if(!section||!sticky||!canvas) return;
  const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
  const chapters=[...document.querySelectorAll('.chapter')];
  const bar=document.getElementById('homeProgress');
  const pct=document.getElementById('homePercent');
  const note=document.querySelector('.scroll-note');
  const dots=[...document.querySelectorAll('.home-dots i')];
  const status=document.getElementById('frameStatus');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TOTAL=241;
  const pad=n=>String(n).padStart(3,'0');
  let portrait=matchMedia('(max-width:760px)').matches;
  let folder=portrait?'/assets/robot/mobile':'/assets/robot/desktop';
  let cache=new Map(), pending=new Map(), failed=0;
  let target=0,smooth=0,last=performance.now(),drawn=-1,lastGood=null;

  function url(i){return \`\${folder}/ezgif-frame-\${pad(i+1)}.jpg\`}
  function load(i){
    if(i<0||i>=TOTAL) return Promise.resolve(null);
    if(cache.has(i)) return Promise.resolve(cache.get(i));
    if(pending.has(i)) return pending.get(i);
    const p=new Promise(resolve=>{
      const img=new Image();
      img.decoding='async';
      img.onload=()=>{cache.set(i,img);pending.delete(i);resolve(img)};
      img.onerror=()=>{pending.delete(i);failed++;resolve(null)};
      img.src=url(i);
    });
    pending.set(i,p);return p;
  }
  function warm(center){
    const ahead=portrait?14:18, behind=6;
    for(let d=-behind;d<=ahead;d++) load(center+d);
    // keep enough frames around the current position without retaining the full sequence in RAM
    if(cache.size>64){
      for(const [k] of cache){
        if(Math.abs(k-center)>30) cache.delete(k);
      }
    }
  }
  function resize(){
    const r=canvas.getBoundingClientRect();
    const dpr=Math.min(devicePixelRatio||1,2);
    const w=Math.max(1,Math.round(r.width*dpr));
    const h=Math.max(1,Math.round(r.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;drawn=-1}
  }
  function render(i){
    resize();
    i=Math.max(0,Math.min(TOTAL-1,Math.round(i)));
    if(i===drawn) return;
    drawn=i;
    const img=cache.get(i);
    if(!img){load(i).then(a=>{if(a){lastGood=a;drawn=-1;render(i)}});warm(i);if(!lastGood) return}
    const source=img||lastGood;
    if(!source) return;
    lastGood=source;
    const cw=canvas.width,ch=canvas.height,iw=source.naturalWidth,ih=source.naturalHeight;
    const scale=Math.max(cw/iw,ch/ih);
    const dw=iw*scale,dh=ih*scale,dx=(cw-dw)/2,dy=(ch-dh)/2;
    ctx.fillStyle='#08060d';ctx.fillRect(0,0,cw,ch);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(source,dx,dy,dw,dh);
    canvas.classList.add('ready');
    status.textContent=\`Original frame \${i+1}/\${TOTAL}\`;
    warm(i);
  }
  function read(){
    if(reduced){target=.78;return}
    const r=section.getBoundingClientRect();
    const max=Math.max(1,section.offsetHeight-innerHeight);
    target=Math.max(0,Math.min(1,-r.top/max));
  }
  function update(p){
    let active=0;
    chapters.forEach((ch,i)=>{
      const a=+ch.dataset.start,b=+ch.dataset.end;
      const on=p>=a&&p<b;
      ch.classList.toggle('active',on);
      if(on) active=i;
    });
    dots.forEach((d,i)=>d.classList.toggle('active',i===active));
    bar.style.width=(p*100).toFixed(2)+'%';
    pct.textContent=String(Math.round(p*100)).padStart(2,'0')+'%';
    note?.classList.toggle('hide',p>.055);
  }
  function tick(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    const a=1-Math.exp(-(portrait?10:13)*dt);
    smooth+=(target-smooth)*a;
    update(smooth);
    render(smooth*(TOTAL-1));
    requestAnimationFrame(tick);
  }
  function resetForViewport(){
    const next=matchMedia('(max-width:760px)').matches;
    if(next!==portrait){
      portrait=next;folder=portrait?'/assets/robot/mobile':'/assets/robot/desktop';
      cache.clear();pending.clear();lastGood=null;drawn=-1;failed=0;
      load(0).then(()=>render(0));
    }
    read();drawn=-1;
  }
  addEventListener('scroll',read,{passive:true});
  addEventListener('resize',resetForViewport,{passive:true});
  read();
  load(0).then(first=>{
    if(first){lastGood=first;render(0);for(let i=1;i<18;i++)load(i)}
    else if(status) status.textContent='Robot frames ready to be added';
  });
  requestAnimationFrame(tick);
})();
