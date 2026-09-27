
(()=> {
  const path=location.pathname.replace(/\/$/,'')||'/';
  document.querySelectorAll('[data-nav]').forEach(a=>{
    const href=a.getAttribute('href')||'';
    if(href==='/'?path==='/':path.startsWith(href.replace('.html',''))) a.classList.add('active');
  });

  const btn=document.querySelector('.menu-btn');
  const menu=document.querySelector('.mobile-menu');
  btn?.addEventListener('click',()=>{
    const open=menu.classList.toggle('open');
    btn.setAttribute('aria-expanded',String(open));
  });
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));

  const io=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}
  }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  if(matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.service-card,.industry').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=\`perspective(900px) rotateX(\${-y*2.5}deg) rotateY(\${x*3.5}deg) translateY(-5px)\`;
      });
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
  }

  document.getElementById('contactForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(e.currentTarget);
    const subject=\`Project inquiry — \${fd.get('service')||'Timex Solution Inc'}\`;
    const body=[
      \`Name: \${fd.get('name')||''}\`,
      \`Company: \${fd.get('company')||''}\`,
      \`Email: \${fd.get('email')||''}\`,
      \`Service: \${fd.get('service')||''}\`,
      '',
      String(fd.get('message')||'')
    ].join('\\n');
    location.href=\`mailto:team@timexsolutioninc.com?subject=\${encodeURIComponent(subject)}&body=\${encodeURIComponent(body)}\`;
  });
})();
