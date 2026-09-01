function toggleMenu(){
  document.getElementById('drawer').classList.toggle('open');
  document.getElementById('menuBtn').classList.toggle('active');
}
function closeMenu(){
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('menuBtn').classList.remove('active');
}

/* ブログバナー：無限ループ＋自動スライド＋矢印＋ドット（両端に次/前カードがのぞく） */
(function(){
  var track = document.getElementById('blogTrack');
  if(!track) return;
  var dots = document.querySelectorAll('#blogDots span');
  var realSlides = Array.prototype.slice.call(track.querySelectorAll('.blog-slide'));
  var count = realSlides.length;
  if(count < 2) return;

  /* 先頭に最後のクローン、末尾に最初のクローンを追加してループ感を出す */
  var firstClone = realSlides[0].cloneNode(true);
  var lastClone = realSlides[count - 1].cloneNode(true);
  firstClone.setAttribute('aria-hidden', 'true');
  lastClone.setAttribute('aria-hidden', 'true');
  firstClone.tabIndex = -1;
  lastClone.tabIndex = -1;
  track.appendChild(firstClone);
  track.insertBefore(lastClone, realSlides[0]);

  var slides = Array.prototype.slice.call(track.querySelectorAll('.blog-slide'));
  var current = 1; /* 実スライド0番＝拡張配列の1番からスタート */
  var timer = null;
  var animating = false;   /* goTo によるスムーススクロール中か */
  var pollTimer = null;    /* スクロール停止監視用 */

  function targetLeft(i){
    var s = slides[i];
    return s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2;
  }
  /* クローンから実スライドへ、アニメーションなしで瞬時に飛ばす（スナップを一時解除して継ぎ目を消す） */
  function jumpInstant(i){
    track.style.scrollSnapType = 'none';
    track.scrollLeft = targetLeft(i);
    void track.offsetHeight; /* reflow を強制してから元に戻す */
    track.style.scrollSnapType = '';
  }
  function realIndex(i){
    return ((i - 1) + count) % count;
  }
  function updateDots(){
    var r = realIndex(current);
    dots.forEach(function(d, i){ d.classList.toggle('on', i === r); });
  }
  function nearestSlide(){
    var closest = 0, min = Infinity;
    var viewCenter = track.scrollLeft + track.clientWidth / 2;
    slides.forEach(function(s, i){
      var slideCenter = s.offsetLeft + s.offsetWidth / 2;
      var diff = Math.abs(slideCenter - viewCenter);
      if(diff < min){ min = diff; closest = i; }
    });
    return closest;
  }
  /* 実際にスクロールが止まるのを監視してから確定させる（アニメーション時間を決め打ちしない） */
  function waitForSettle(){
    if(pollTimer) clearInterval(pollTimer);
    var lastLeft = null, stableTicks = 0, ticks = 0;
    pollTimer = setInterval(function(){
      ticks++;
      var left = track.scrollLeft;
      if(lastLeft !== null && Math.abs(left - lastLeft) < 1){
        stableTicks++;
      } else {
        stableTicks = 0;
      }
      lastLeft = left;
      if(stableTicks >= 2 || ticks > 40){ /* 約100ms静止、最大2秒で強制終了 */
        clearInterval(pollTimer);
        pollTimer = null;
        current = nearestSlide();
        if(current === 0){ current = count; jumpInstant(current); }
        else if(current === slides.length - 1){ current = 1; jumpInstant(current); }
        updateDots();
        animating = false;
      }
    }, 50);
  }
  function goTo(i){
    if(animating) return;
    animating = true;
    current = i;
    track.scrollTo({ left: targetLeft(current), behavior: 'smooth' });
    updateDots();
    waitForSettle();
  }
  window.blogMove = function(dir){
    goTo(current + dir);
    restartTimer();
  };
  function restartTimer(){
    if(timer) clearInterval(timer);
    timer = setInterval(function(){
      if(animating) return;
      goTo(current + 1);
    }, 4500);
  }
  /* 手動スワイプ後もドット同期＋端の補正を同じ仕組みで行う */
  track.addEventListener('scroll', function(){
    if(animating) return; /* goTo() 由来のスクロール中は waitForSettle 側に任せる */
    animating = true;
    waitForSettle();
  }, { passive: true });
  dots.forEach(function(d, i){
    d.style.cursor = 'pointer';
    d.addEventListener('click', function(){ goTo(i + 1); restartTimer(); });
  });

  /* 初期位置：実スライド0番へ瞬時に移動（アニメーションなし） */
  jumpInstant(current);
  updateDots();
  restartTimer();
})();

/* 女の子の声：自動スライド */
(function(){
  var scroller = document.getElementById('voiceScroll');
  if(!scroller) return;
  var cards = scroller.querySelectorAll('.voice');
  var count = cards.length;
  if(count < 2) return;
  var current = 0;
  var timer = setInterval(function(){
    current = (current + 1) % count;
    scroller.scrollTo({ left: cards[current].offsetLeft - 2, behavior: 'smooth' });
  }, 5000);
  scroller.addEventListener('touchstart', function(){ clearInterval(timer); }, { once: true });
})();
