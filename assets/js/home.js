
(function(){
  "use strict";

  var section=document.querySelector(".experience");
  var canvas=document.getElementById("robotCanvas");
  if(!section||!canvas) return;

  var ctx=canvas.getContext("2d",{alpha:false,desynchronized:true});
  if(!ctx) return;

  var chapters=[].slice.call(document.querySelectorAll(".chapter"));
  var progressBar=document.getElementById("homeProgress");
  var progressText=document.getElementById("homePercent");
  var scrollNote=document.querySelector(".scroll-note");
  var dots=[].slice.call(document.querySelectorAll(".home-dots i"));
  var reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileQuery=window.matchMedia("(max-width:760px)");

  var FRAME_COUNT=241;
  var DESKTOP_SIZE={width:1912,height:1080};
  var MOBILE_SIZE={width:1080,height:1912};

  var portrait=mobileQuery.matches;
  var folder=portrait?"/assets/robot/mobile":"/assets/robot/desktop";
  var frameSize=portrait?MOBILE_SIZE:DESKTOP_SIZE;

  var cache=new Map();
  var pending=new Map();
  var generation=0;
  var assetsAvailable=null;
  var target=0;
  var smooth=0;
  var lastTime=performance.now();
  var lastDrawn=-1;
  var currentCenter=0;
  var animationId=0;
  var running=true;

  function clamp(value,min,max){
    return Math.min(max,Math.max(min,value));
  }

  function padFrame(number){
    return String(number).padStart(3,"0");
  }

  function frameUrl(index){
    return folder+"/ezgif-frame-"+padFrame(index+1)+".jpg";
  }

  function cacheLimit(){
    return portrait?12:18;
  }

  function rememberFrame(index,image){
    cache.delete(index);
    cache.set(index,image);

    var max=cacheLimit();
    if(cache.size<=max) return;

    var candidates=[].slice.call(cache.keys()).sort(function(a,b){
      return Math.abs(b-currentCenter)-Math.abs(a-currentCenter);
    });

    while(cache.size>max&&candidates.length){
      cache.delete(candidates.shift());
    }
  }

  function loadFrame(index){
    if(index<0||index>=FRAME_COUNT||assetsAvailable===false) return Promise.resolve(null);
    if(cache.has(index)){
      var existing=cache.get(index);
      rememberFrame(index,existing);
      return Promise.resolve(existing);
    }
    if(pending.has(index)) return pending.get(index);

    var requestGeneration=generation;
    var promise=new Promise(function(resolve){
      var image=new Image();
      image.decoding="async";

      image.onload=function(){
        pending.delete(index);
        if(requestGeneration!==generation){resolve(null);return}
        assetsAvailable=true;
        rememberFrame(index,image);
        resolve(image);
      };

      image.onerror=function(){
        pending.delete(index);
        if(index===0&&requestGeneration===generation) assetsAvailable=false;
        resolve(null);
      };

      image.src=frameUrl(index);
    });

    pending.set(index,promise);
    return promise;
  }

  function prefetchAround(center,direction){
    if(assetsAvailable===false) return;

    currentCenter=center;
    var ahead=portrait?7:10;
    var behind=portrait?3:5;
    var forward=direction>=0;

    for(var step=1;step<=ahead;step++){
      loadFrame(center+(forward?step:-step));
    }
    for(var back=1;back<=behind;back++){
      loadFrame(center+(forward?-back:back));
    }
  }

  function nearestCached(index){
    if(cache.has(index)) return cache.get(index);
    for(var distance=1;distance<=4;distance++){
      if(cache.has(index-distance)) return cache.get(index-distance);
      if(cache.has(index+distance)) return cache.get(index+distance);
    }
    return null;
  }

  function resizeCanvas(){
    var rect=canvas.getBoundingClientRect();
    if(rect.width<=0||rect.height<=0) return;

    var device=window.devicePixelRatio||1;
    var sourceDprX=frameSize.width/rect.width;
    var sourceDprY=frameSize.height/rect.height;
    var dpr=Math.max(1,Math.min(device,2,sourceDprX,sourceDprY));

    var width=Math.max(1,Math.round(rect.width*dpr));
    var height=Math.max(1,Math.round(rect.height*dpr));

    if(canvas.width!==width||canvas.height!==height){
      canvas.width=width;
      canvas.height=height;
      lastDrawn=-1;
    }
  }

  function drawImageCover(image){
    var cw=canvas.width;
    var ch=canvas.height;
    var iw=image.naturalWidth||frameSize.width;
    var ih=image.naturalHeight||frameSize.height;
    var scale=Math.max(cw/iw,ch/ih);
    var dw=iw*scale;
    var dh=ih*scale;
    var dx=(cw-dw)/2;
    var dy=(ch-dh)/2;

    ctx.fillStyle="#08060d";
    ctx.fillRect(0,0,cw,ch);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality="high";
    ctx.drawImage(image,dx,dy,dw,dh);
    canvas.classList.add("ready");
  }

  function renderFrame(frameFloat){
    resizeCanvas();

    var index=clamp(Math.round(frameFloat),0,FRAME_COUNT-1);
    if(index===lastDrawn) return;
    lastDrawn=index;

    var image=nearestCached(index);
    var direction=target-smooth;
    prefetchAround(index,direction);

    if(image){
      drawImageCover(image);
      return;
    }

    loadFrame(index).then(function(loaded){
      if(!loaded) return;
      if(Math.abs(index-Math.round(smooth*(FRAME_COUNT-1)))<=2){
        lastDrawn=-1;
        renderFrame(smooth*(FRAME_COUNT-1));
      }
    });
  }

  function readScroll(){
    if(reducedMotion){
      target=.84;
      return;
    }

    var rect=section.getBoundingClientRect();
    var distance=Math.max(1,section.offsetHeight-window.innerHeight);
    target=clamp(-rect.top/distance,0,1);
  }

  function updateUI(progress){
    var activeIndex=0;

    chapters.forEach(function(chapter,index){
      var start=Number(chapter.dataset.start);
      var end=Number(chapter.dataset.end);
      var active=progress>=start&&progress<end;
      chapter.classList.toggle("active",active);
      chapter.setAttribute("aria-hidden",String(!active));
      if(active) activeIndex=index;
    });

    dots.forEach(function(dot,index){
      dot.classList.toggle("active",index===activeIndex);
    });

    if(progressBar) progressBar.style.width=(progress*100).toFixed(2)+"%";
    if(progressText) progressText.textContent=String(Math.round(progress*100)).padStart(2,"0")+"%";
    if(scrollNote) scrollNote.classList.toggle("hide",progress>.055);
  }

  function tick(now){
    if(!running) return;

    var delta=Math.min(.05,(now-lastTime)/1000);
    lastTime=now;
    var smoothing=1-Math.exp(-(portrait?10:13)*delta);
    smooth+=(target-smooth)*smoothing;

    updateUI(smooth);
    renderFrame(smooth*(FRAME_COUNT-1));
    animationId=requestAnimationFrame(tick);
  }

  function resetForViewport(){
    var nextPortrait=mobileQuery.matches;

    if(nextPortrait!==portrait){
      portrait=nextPortrait;
      folder=portrait?"/assets/robot/mobile":"/assets/robot/desktop";
      frameSize=portrait?MOBILE_SIZE:DESKTOP_SIZE;
      generation+=1;
      cache.clear();
      pending.clear();
      assetsAvailable=null;
      lastDrawn=-1;
      loadFrame(0).then(function(first){
        if(first) drawImageCover(first);
      });
    }

    readScroll();
    lastDrawn=-1;
  }

  function start(){
    if(running&&animationId) return;
    running=true;
    lastTime=performance.now();
    animationId=requestAnimationFrame(tick);
  }

  function stop(){
    running=false;
    if(animationId) cancelAnimationFrame(animationId);
    animationId=0;
  }

  window.addEventListener("scroll",readScroll,{passive:true});
  window.addEventListener("resize",resetForViewport,{passive:true});
  document.addEventListener("visibilitychange",function(){
    if(document.hidden) stop();
    else start();
  });

  readScroll();
  updateUI(target);

  loadFrame(0).then(function(first){
    if(!first) return;
    drawImageCover(first);
    for(var index=1;index<Math.min(FRAME_COUNT,portrait?8:12);index++) loadFrame(index);
  });

  if(reducedMotion){
    loadFrame(Math.round(.84*(FRAME_COUNT-1))).then(function(image){
      if(image) drawImageCover(image);
    });
  }

  animationId=requestAnimationFrame(tick);
})();
