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
  var mobileQuery=window.matchMedia("(max-width:760px)");
  var reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var FRAME_COUNT=241;
  var SOURCE={
    desktop:{folder:"/assets/robot/desktop",width:1912,height:1080},
    mobile:{folder:"/assets/robot/mobile",width:1080,height:1912}
  };

  var mode=mobileQuery.matches?"mobile":"desktop";
  var source=SOURCE[mode];
  var generation=0;

  var blobs=new Map();
  var bitmaps=new Map();
  var blobPending=new Map();
  var decodePending=new Map();
  var failed=new Set();

  var target=0;
  var smooth=0;
  var lastTime=performance.now();
  var lastDrawn=-1;
  var lastActive=-1;
  var raf=0;
  var running=true;
  var backgroundStarted=false;
  var assetsPresent=null;

  function clamp(v,min,max){return Math.min(max,Math.max(min,v))}
  function pad(n){return String(n).padStart(3,"0")}
  function frameUrl(index){return source.folder+"/ezgif-frame-"+pad(index+1)+".jpg"}

  function disposeBitmap(bitmap){
    if(bitmap&&typeof bitmap.close==="function"){
      try{bitmap.close()}catch(e){}
    }
  }

  function clearDecoded(){
    bitmaps.forEach(disposeBitmap);
    bitmaps.clear();
    decodePending.clear();
    lastDrawn=-1;
  }

  function resetAssets(){
    generation++;
    clearDecoded();
    blobs.clear();
    blobPending.clear();
    failed.clear();
    backgroundStarted=false;
    assetsPresent=null;
    canvas.classList.remove("ready");
  }

  function fetchBlob(index,priority){
    if(index<0||index>=FRAME_COUNT||failed.has(index)) return Promise.resolve(null);
    if(blobs.has(index)) return Promise.resolve(blobs.get(index));
    if(blobPending.has(index)) return blobPending.get(index);

    var currentGeneration=generation;
    var request=fetch(frameUrl(index),{
      cache:"force-cache",
      priority:priority?"high":"auto"
    }).then(function(response){
      if(!response.ok) throw new Error("HTTP "+response.status);
      return response.blob();
    }).then(function(blob){
      blobPending.delete(index);
      if(currentGeneration!==generation) return null;
      blobs.set(index,blob);
      if(index===0) assetsPresent=true;
      return blob;
    }).catch(function(){
      blobPending.delete(index);
      if(currentGeneration!==generation) return null;
      failed.add(index);
      if(index===0) assetsPresent=false;
      return null;
    });

    blobPending.set(index,request);
    return request;
  }

  function decodeWithImage(blob){
    return new Promise(function(resolve){
      var url=URL.createObjectURL(blob);
      var image=new Image();
      image.decoding="async";
      image.onload=function(){
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror=function(){
        URL.revokeObjectURL(url);
        resolve(null);
      };
      image.src=url;
    });
  }

  function trimDecoded(center){
    var max=mode==="mobile"?18:24;
    if(bitmaps.size<=max) return;

    var keys=[].slice.call(bitmaps.keys()).sort(function(a,b){
      return Math.abs(b-center)-Math.abs(a-center);
    });

    while(bitmaps.size>max&&keys.length){
      var key=keys.shift();
      var bitmap=bitmaps.get(key);
      bitmaps.delete(key);
      disposeBitmap(bitmap);
    }
  }

  function decodeFrame(index){
    if(index<0||index>=FRAME_COUNT||failed.has(index)) return Promise.resolve(null);
    if(bitmaps.has(index)) return Promise.resolve(bitmaps.get(index));
    if(decodePending.has(index)) return decodePending.get(index);

    var currentGeneration=generation;
    var promise=fetchBlob(index,true).then(function(blob){
      if(!blob||currentGeneration!==generation) return null;

      if("createImageBitmap" in window){
        return createImageBitmap(blob).catch(function(){return decodeWithImage(blob)});
      }
      return decodeWithImage(blob);
    }).then(function(bitmap){
      decodePending.delete(index);
      if(!bitmap||currentGeneration!==generation){
        disposeBitmap(bitmap);
        return null;
      }

      bitmaps.set(index,bitmap);
      trimDecoded(index);
      return bitmap;
    }).catch(function(){
      decodePending.delete(index);
      return null;
    });

    decodePending.set(index,promise);
    return promise;
  }

  function nearestDecoded(index){
    if(bitmaps.has(index)) return bitmaps.get(index);
    for(var d=1;d<=5;d++){
      if(bitmaps.has(index-d)) return bitmaps.get(index-d);
      if(bitmaps.has(index+d)) return bitmaps.get(index+d);
    }
    return null;
  }

  function resizeCanvas(){
    var rect=canvas.getBoundingClientRect();
    if(rect.width<=0||rect.height<=0) return false;

    var maxDpr=Math.min(
      window.devicePixelRatio||1,
      source.width/Math.max(1,rect.width),
      source.height/Math.max(1,rect.height),
      2
    );
    maxDpr=Math.max(1,maxDpr);

    var width=Math.max(1,Math.round(rect.width*maxDpr));
    var height=Math.max(1,Math.round(rect.height*maxDpr));

    if(canvas.width!==width||canvas.height!==height){
      canvas.width=width;
      canvas.height=height;
      lastDrawn=-1;
    }
    return true;
  }

  function draw(bitmap){
    if(!bitmap||!resizeCanvas()) return;

    var iw=bitmap.width||bitmap.naturalWidth||source.width;
    var ih=bitmap.height||bitmap.naturalHeight||source.height;
    var cw=canvas.width;
    var ch=canvas.height;
    var scale=Math.max(cw/iw,ch/ih);
    var dw=iw*scale;
    var dh=ih*scale;
    var dx=(cw-dw)/2;
    var dy=(ch-dh)/2;

    ctx.fillStyle="#08060d";
    ctx.fillRect(0,0,cw,ch);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality="high";
    ctx.drawImage(bitmap,dx,dy,dw,dh);
    canvas.classList.add("ready");
  }

  function preloadDecoded(center,direction){
    var ahead=mode==="mobile"?6:8;
    var behind=mode==="mobile"?3:4;
    var forward=direction>=0;

    for(var a=1;a<=ahead;a++){
      decodeFrame(center+(forward?a:-a));
    }
    for(var b=1;b<=behind;b++){
      decodeFrame(center+(forward?-b:b));
    }
  }

  function render(progress){
    var index=clamp(Math.round(progress*(FRAME_COUNT-1)),0,FRAME_COUNT-1);
    if(index===lastDrawn) return;

    var existing=nearestDecoded(index);
    if(existing){
      draw(existing);
      lastDrawn=index;
    }

    var direction=target-smooth;
    preloadDecoded(index,direction);

    decodeFrame(index).then(function(bitmap){
      var wanted=clamp(Math.round(smooth*(FRAME_COUNT-1)),0,FRAME_COUNT-1);
      if(bitmap&&Math.abs(wanted-index)<=2){
        draw(bitmap);
        lastDrawn=index;
      }
    });
  }

  function warmNetwork(){
    if(backgroundStarted||assetsPresent===false) return;
    backgroundStarted=true;

    var next=1;
    var workers=mode==="mobile"?4:6;

    function worker(){
      if(next>=FRAME_COUNT||assetsPresent===false) return Promise.resolve();
      var index=next++;
      return fetchBlob(index,false).then(worker);
    }

    for(var i=0;i<workers;i++) worker();
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
      if("inert" in chapter) chapter.inert=!active;
      if(active) activeIndex=index;
    });

    if(activeIndex!==lastActive){
      lastActive=activeIndex;
      dots.forEach(function(dot,index){
        dot.classList.toggle("active",index===activeIndex);
      });
    }

    if(progressBar) progressBar.style.width=(progress*100).toFixed(2)+"%";
    if(progressText) progressText.textContent=String(Math.round(progress*100)).padStart(2,"0")+"%";
    if(scrollNote) scrollNote.classList.toggle("hide",progress>.055);
  }

  function tick(now){
    if(!running) return;

    var dt=Math.min(.05,(now-lastTime)/1000);
    lastTime=now;

    var response=mode==="mobile"?13:16;
    var alpha=1-Math.exp(-response*dt);
    smooth+=(target-smooth)*alpha;

    updateUI(smooth);
    render(smooth);

    raf=requestAnimationFrame(tick);
  }

  function start(){
    if(running&&raf) return;
    running=true;
    lastTime=performance.now();
    raf=requestAnimationFrame(tick);
  }

  function stop(){
    running=false;
    if(raf) cancelAnimationFrame(raf);
    raf=0;
  }

  function setMode(){
    var nextMode=mobileQuery.matches?"mobile":"desktop";
    if(nextMode===mode) return;

    mode=nextMode;
    source=SOURCE[mode];
    resetAssets();
    initializeFrames();
  }

  function initializeFrames(){
    fetchBlob(0,true).then(function(blob){
      if(!blob) return;
      return decodeFrame(0);
    }).then(function(first){
      if(!first) return;
      draw(first);
      lastDrawn=0;
      warmNetwork();
      preloadDecoded(0,1);
    });
  }

  window.addEventListener("scroll",readScroll,{passive:true});
  window.addEventListener("resize",function(){
    readScroll();
    lastDrawn=-1;
  },{passive:true});

  if(mobileQuery.addEventListener){
    mobileQuery.addEventListener("change",setMode);
  }

  document.addEventListener("visibilitychange",function(){
    if(document.hidden) stop();
    else start();
  });

  readScroll();
  smooth=reducedMotion?target:target;
  updateUI(smooth);
  initializeFrames();

  if(reducedMotion){
    decodeFrame(Math.round(.84*(FRAME_COUNT-1))).then(function(bitmap){
      if(bitmap) draw(bitmap);
    });
  }else{
    raf=requestAnimationFrame(tick);
  }
})();