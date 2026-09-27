
(function(){
  "use strict";

  var SERVICE_ROUTES = new Set([
    "/web-development",
    "/app-development",
    "/digital-marketing",
    "/creative-video",
    "/tech-it",
    "/business-operations"
  ]);

  function normalizePath(pathname){
    var path=(pathname||"/").replace(/\.html$/,"").replace(/\/$/,"");
    return path||"/";
  }

  function initNavigation(){
    var path=normalizePath(window.location.pathname);
    var activePath=SERVICE_ROUTES.has(path)?"/services":path;

    document.querySelectorAll(".nav-links a,.mobile-menu a").forEach(function(link){
      var href=normalizePath(link.getAttribute("href")||"");
      var active=href===activePath;
      link.classList.toggle("active",active);
      if(active) link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });

    var button=document.querySelector(".menu-btn");
    var menu=document.querySelector(".mobile-menu");
    if(!button||!menu) return;

    function setMenu(open){
      menu.classList.toggle("open",open);
      menu.setAttribute("aria-hidden",String(!open));
      button.setAttribute("aria-expanded",String(open));
      document.body.classList.toggle("menu-open",open);
    }

    button.addEventListener("click",function(){
      setMenu(button.getAttribute("aria-expanded")!=="true");
    });

    menu.querySelectorAll("a").forEach(function(link){
      link.addEventListener("click",function(){setMenu(false)});
    });

    document.addEventListener("keydown",function(event){
      if(event.key==="Escape"&&button.getAttribute("aria-expanded")==="true"){
        setMenu(false);
        button.focus();
      }
    });

    document.addEventListener("pointerdown",function(event){
      if(button.getAttribute("aria-expanded")!=="true") return;
      if(menu.contains(event.target)||button.contains(event.target)) return;
      setMenu(false);
    });

    var desktopQuery=window.matchMedia("(min-width:901px)");
    function handleDesktop(event){if(event.matches) setMenu(false)}
    if(desktopQuery.addEventListener) desktopQuery.addEventListener("change",handleDesktop);
  }

  function initReveal(){
    var nodes=[].slice.call(document.querySelectorAll(".reveal"));
    if(!nodes.length) return;

    document.querySelectorAll(".card-grid,.industry-grid,.rows").forEach(function(group){
      [].slice.call(group.children).forEach(function(child,index){
        if(child.classList.contains("reveal")){
          child.style.setProperty("--reveal-delay",Math.min(index*55,220)+"ms");
        }
      });
    });

    if(!("IntersectionObserver" in window)||window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      nodes.forEach(function(node){node.classList.add("visible")});
      return;
    }

    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:"0px 0px -7% 0px"});

    nodes.forEach(function(node){observer.observe(node)});
  }

  function initPointerEffects(){
    if(!window.matchMedia("(pointer:fine)").matches) return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll(".btn,.nav-cta,.chip").forEach(function(element){
      element.addEventListener("pointermove",function(event){
        var rect=element.getBoundingClientRect();
        var x=(event.clientX-rect.left)/rect.width;
        var y=(event.clientY-rect.top)/rect.height;
        element.style.setProperty("--pointer-x",(x*100).toFixed(1)+"%");
        element.style.setProperty("--pointer-y",(y*100).toFixed(1)+"%");
        element.style.setProperty("--mag-x",((x-.5)*6).toFixed(2)+"px");
        element.style.setProperty("--mag-y",((y-.5)*5).toFixed(2)+"px");
      });
      element.addEventListener("pointerleave",function(){
        element.style.removeProperty("--mag-x");
        element.style.removeProperty("--mag-y");
        element.style.removeProperty("--pointer-x");
        element.style.removeProperty("--pointer-y");
      });
    });

    document.querySelectorAll(".service-card,.industry,.float-card").forEach(function(card){
      card.addEventListener("pointermove",function(event){
        var rect=card.getBoundingClientRect();
        var x=(event.clientX-rect.left)/rect.width;
        var y=(event.clientY-rect.top)/rect.height;
        card.style.setProperty("--tilt-x",((.5-y)*3.2).toFixed(2)+"deg");
        card.style.setProperty("--tilt-y",((x-.5)*4.2).toFixed(2)+"deg");
        card.style.setProperty("--spot-x",(x*100).toFixed(1)+"%");
        card.style.setProperty("--spot-y",(y*100).toFixed(1)+"%");
      });
      card.addEventListener("pointerleave",function(){
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
        card.style.removeProperty("--spot-x");
        card.style.removeProperty("--spot-y");
      });
    });
  }

  function initContactForm(){
    var form=document.getElementById("contactForm");
    if(!form) return;

    form.addEventListener("submit",function(event){
      event.preventDefault();
      if(!form.reportValidity()) return;

      var data=new FormData(form);
      var subject="Project inquiry — "+(data.get("service")||"Timex Solution Inc");
      var body=[
        "Name: "+(data.get("name")||""),
        "Company: "+(data.get("company")||""),
        "Email: "+(data.get("email")||""),
        "Service: "+(data.get("service")||""),
        "",
        String(data.get("message")||"")
      ].join("\n");

      window.location.href="mailto:team@timexsolutioninc.com?subject="+
        encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
    });
  }

  initNavigation();
  initReveal();
  initPointerEffects();
  initContactForm();
})();
