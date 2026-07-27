(function () {
  'use strict';

  // ───────────────────────── Navegação entre etapas ─────────────────────────
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var initialized = {};

  function goToStep(n) {
    steps.forEach(function (s) { s.classList.remove('is-active'); });
    var target = document.getElementById('step-' + n);
    if (!target) return;
    target.classList.add('is-active');
    var progress = target.getAttribute('data-progress');
    if (progress !== null) {
      var fill = target.querySelector('.fh-progress-fill');
      if (fill) requestAnimationFrame(function () { fill.style.width = progress + '%'; });
    }
    window.scrollTo(0, 0);
    if (!initialized[n]) {
      initialized[n] = true;
      if (n === '7' || n === 7) initStep7();
      if (n === '8' || n === 8) initStep8();
      if (n === '9' || n === 9) initStep9();
    }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-next]');
    if (!el) return;
    var next = el.getAttribute('data-next');
    if (el.classList.contains('quiz-opt')) {
      el.classList.add('selected');
      setTimeout(function () { goToStep(next); }, 250);
    } else {
      goToStep(next);
    }
  });

  // ───────────────────────── Step 7 — revelação ─────────────────────────
  function initStep7() {
    var loader = document.getElementById('reveal-loader');
    var lines = document.querySelectorAll('#step-7 .reveal-line');
    var btn = document.getElementById('btn-step7');

    lines.forEach(function (line) {
      var delay = parseInt(line.getAttribute('data-delay'), 10) || 0;
      setTimeout(function () { line.classList.add('is-shown'); }, delay);
    });

    setTimeout(function () { if (loader) loader.style.display = 'none'; }, 2000);

    if (btn) {
      var btnDelay = parseInt(btn.getAttribute('data-delay'), 10) || 0;
      setTimeout(function () { btn.classList.remove('is-hidden'); }, btnDelay);
    }
  }

  // ───────────────────────── Step 8 — escolha das cartas ─────────────────────────
  function initStep8() {
    var CARDS = [
      { src: 'img/card-roda-da-fortuna.png', alt: 'A Roda da Fortuna' },
      { src: 'img/card-o-louco.png', alt: 'O Louco' },
      { src: 'img/card-a-torre.png', alt: 'A Torre' }
    ];
    var maxPicks = 3;
    var pickCount = 0;
    var done = false;
    var swoosh = document.getElementById('cs-swoosh');
    var resultBtn = document.getElementById('btn-step8');

    CARDS.forEach(function (c) { var pre = new Image(); pre.src = c.src; });

    function unlockAudio() {
      if (!swoosh) return;
      swoosh.volume = 0;
      var p = swoosh.play();
      if (p && p.then) {
        p.then(function () { swoosh.pause(); swoosh.currentTime = 0; swoosh.volume = 1; }).catch(function () { swoosh.volume = 1; });
      } else {
        swoosh.pause(); swoosh.currentTime = 0; swoosh.volume = 1;
      }
    }
    function playSound() {
      if (!swoosh) return;
      try {
        swoosh.currentTime = 0;
        swoosh.volume = 1;
        var p = swoosh.play();
        if (p && p.then) p.catch(function () {});
        setTimeout(function () { try { swoosh.pause(); swoosh.currentTime = 0; } catch (e) {} }, 500);
      } catch (e) {}
    }

    function csSparkles(cx, cy) {
      var count = 16;
      for (var i = 0; i < count; i++) {
        var el = document.createElement('div');
        el.className = 'cs-sparkle';
        var angle = (i / count) * Math.PI * 2;
        var dist = 30 + Math.random() * 65;
        var size = (2 + Math.random() * 5) + 'px';
        el.style.cssText = [
          'left:' + cx + 'px',
          'top:' + cy + 'px',
          'width:' + size,
          'height:' + size,
          'background:' + (Math.random() > 0.4 ? '#F0D080' : '#9B59D0'),
          '--tx:' + (Math.cos(angle) * dist) + 'px',
          '--ty:' + (Math.sin(angle) * dist) + 'px',
          '--dur:' + (0.5 + Math.random() * 0.6) + 's',
          '--delay:' + (Math.random() * 0.12) + 's'
        ].join(';');
        document.body.appendChild(el);
        el.addEventListener('animationend', function () { this.remove(); });
      }
    }

    function csReveal(card) {
      if (done) return;
      if (card.dataset.revealed) return;
      if (pickCount >= maxPicks) return;
      card.dataset.revealed = '1';
      var pick = pickCount;
      pickCount++;
      var img = card.querySelector('.cs-img');
      img.src = CARDS[pick].src;
      img.alt = CARDS[pick].alt;
      var badge = card.querySelector('.cs-badge');
      badge.textContent = pick + 1;
      var rect = card.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      card.classList.add('cs-flipped', 'cs-done');
      csSparkles(cx, cy);
      if (pickCount >= maxPicks) {
        done = true;
        setTimeout(function () {
          document.querySelectorAll('#step-8 .cs-card:not(.cs-flipped)').forEach(function (c) { c.classList.add('cs-inactive'); });
          if (resultBtn) resultBtn.classList.remove('is-hidden');
        }, 300);
      }
    }

    document.querySelectorAll('#step-8 .cs-card').forEach(function (card) {
      card.addEventListener('touchstart', function (e) {
        e.preventDefault();
        unlockAudio();
        setTimeout(function () { playSound(); }, 20);
        csReveal(card);
      }, { passive: false });
      card.addEventListener('click', function () {
        if (card.dataset.revealed) return;
        playSound();
        csReveal(card);
      });
    });
  }

  // ───────────────────────── Step 9 — VSL ─────────────────────────
  function initStep9() {
    // O player só é injetado (e o script da Converteai só é carregado) quando
    // o usuário chega nesta etapa — nada de vídeo iniciando em background lá no step 1.
    var container = document.getElementById('vsl-container');
    if (container) {
      var player = document.createElement('vturb-smartplayer');
      player.id = 'vid-6a62f700627039667ff3b433';
      player.style.cssText = 'display: block; margin: 0 auto; width: 100%; max-width: 400px;';
      var placeholder = document.createElement('div');
      placeholder.className = 'vturb-player-placeholder';
      placeholder.style.cssText = 'position: relative; width: 100%; padding: 133.33333333333331% 0 0; z-index: 0; background-color: black;';
      player.appendChild(placeholder);
      container.appendChild(player);

      var s = document.createElement('script');
      s.src = 'https://scripts.converteai.net/4d063052-ebb4-4a44-96e2-84dbb61688f2/players/6a62f700627039667ff3b433/v4/player.js';
      s.async = true;
      document.head.appendChild(s);
    }
  }

})();
