(function(){
  "use strict";

  var section=document.querySelector(".experience");
  var video=document.getElementById("robotVideo");
  if(!section||!video) return;

  var chapters=[].slice.call(document.querySelectorAll(".chapter"));
  var progressBar=document.getElementById("homeProgress");
  var progressText=document.getElementById("homePercent");
  var scrollNote=document.querySelector(".scroll-note");
  var dots=[].slice.call(document.querySelectorAll(".home-dots i"));
  var reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileQuery=window.matchMedia("(max-width:760px)");

  var SOURCES={
    desktop:"/assets/robot/desktop.mp4",
    mobile:"/assets/robot/mobile.mp4"
  };

  var target=0;
  var smooth=0;
  var lastTime=performance.now();
  var duration=8.033333;
  var sourceKey="";
  var ready=false;
  var animationId=0;
  var running=true;
  var lastSeek=-1;
  var lastActive=-1;

  function clamp(value,min,max){
    return Math.min(max,Math.max(min,value));
  }

  function wantedSource(){
    return mobileQuery.matches?"mobile":"desktop";
  }

  function setSource(force){
    var next=wantedSource();
    if(!force&&next===sourceKey) return;

    sourceKey=next;
    ready=false;
    lastSeek=-1;
    video.classList.remove("ready");
    video.pause();
    video.removeAttribute("src");
    video.load();

    video.src=SOURCES[next];
    video.preload="auto";
    video.load();
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

  function seek(progress){
    if(!ready||!Number.isFinite(duration)||duration<=0) return;

    var desired=clamp(progress,0,1)*Math.max(.001,duration-.001);

    // All-intra video makes exact seeks inexpensive; the threshold prevents
    // needless currentTime writes when scroll is almost stationary.
    if(lastSeek>=0&&Math.abs(desired-lastSeek)<1/90) return;

    lastSeek=desired;
    try{
      video.currentTime=desired;
    }catch(error){
      // Metadata can race with an early scroll event on some mobile browsers.
    }
  }

  function tick(now){
    if(!running) return;

    var delta=Math.min(.05,(now-lastTime)/1000);
    lastTime=now;

    var response=mobileQuery.matches?11:14;
    var alpha=1-Math.exp(-response*delta);
    smooth+=(target-smooth)*alpha;

    updateUI(smooth);
    seek(smooth);

    animationId=requestAnimationFrame(tick);
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

  video.addEventListener("loadedmetadata",function(){
    if(Number.isFinite(video.duration)&&video.duration>0) duration=video.duration;
    ready=true;

    // Force the first decoded frame to paint immediately.
    var initial=reducedMotion ? .84 : smooth;
    lastSeek=-1;
    seek(initial);

    if(video.readyState>=2) video.classList.add("ready");
  });

  video.addEventListener("loadeddata",function(){
    video.classList.add("ready");
  });

  video.addEventListener("canplay",function(){
    video.classList.add("ready");
  });

  video.addEventListener("error",function(){
    ready=false;
    video.classList.remove("ready");
  });

  window.addEventListener("scroll",readScroll,{passive:true});
  window.addEventListener("resize",function(){
    readScroll();
  },{passive:true});

  if(mobileQuery.addEventListener){
    mobileQuery.addEventListener("change",function(){
      setSource(true);
      readScroll();
    });
  }

  document.addEventListener("visibilitychange",function(){
    if(document.hidden) stop();
    else start();
  });

  readScroll();
  if(reducedMotion) smooth=target;
  updateUI(smooth);
  setSource(true);

  if(!reducedMotion){
    animationId=requestAnimationFrame(tick);
  }
})();