/* ============================================================
   VIVA Ciência — Landing Page Scripts
   ============================================================ */

(function () {
  'use strict';

  /* ─── Navbar: scroll background ──────────────────────── */
  const navbar = document.getElementById('navbar');

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* ─── Navbar: mobile toggle ──────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Fechar menu ao clicar em um link
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  /* ─── Scroll Reveal (IntersectionObserver) ───────────── */
  var revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: mostrar tudo se IntersectionObserver não disponível
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ─── Votação ────────────────────────────────────────── */
  var STORAGE_KEY = 'vivaciencia_votes';
  var voteToast = document.getElementById('voteToast');
  var toastTimeout;

  // Carregar votos do localStorage
  function loadVotes() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  // Salvar votos no localStorage
  function saveVotes(votes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
    } catch (e) {
      // localStorage indisponível — falha silenciosa
    }
  }

  // Mostrar toast de confirmação
  function showToast(message) {
    var textNode = voteToast.childNodes[voteToast.childNodes.length - 1];
    textNode.textContent = message || 'Voto registrado com sucesso!';
    voteToast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      voteToast.classList.remove('show');
    }, 2500);
  }

  // Atualizar visual do card após voto
  function markAsVoted(card) {
    card.classList.add('voted');
    var btn = card.querySelector('.btn-vote');
    btn.classList.add('voted');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Votado';
  }

  // Inicializar votação
  function initVoting() {
    var votes = loadVotes();
    var voteCards = document.querySelectorAll('.vote-card');

    voteCards.forEach(function (card) {
      var projectId = card.getAttribute('data-project-id');
      var countEl = card.querySelector('.count-value');
      var btn = card.querySelector('.btn-vote');

      // Restaurar contagem
      var currentCount = votes[projectId] || 0;
      countEl.textContent = currentCount;

      // Verificar se já votou neste projeto
      var votedProjects = loadVotedProjects();
      if (votedProjects.indexOf(projectId) !== -1) {
        markAsVoted(card);
      }

      // Handler de voto
      btn.addEventListener('click', function () {
        var votedList = loadVotedProjects();
        if (votedList.indexOf(projectId) !== -1) {
          showToast('Você já votou neste projeto!');
          return;
        }

        // Registrar voto
        var freshVotes = loadVotes();
        freshVotes[projectId] = (freshVotes[projectId] || 0) + 1;
        saveVotes(freshVotes);

        // Salvar que votou neste projeto
        votedList.push(projectId);
        saveVotedProjects(votedList);

        // Atualizar UI
        countEl.textContent = freshVotes[projectId];
        markAsVoted(card);
        showToast('Voto registrado com sucesso!');
      });
    });
  }

  function loadVotedProjects() {
    try {
      var data = localStorage.getItem(STORAGE_KEY + '_voted');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveVotedProjects(list) {
    try {
      localStorage.setItem(STORAGE_KEY + '_voted', JSON.stringify(list));
    } catch (e) {
      // localStorage indisponível
    }
  }

  initVoting();

  /* ─── Animação GSAP "Fusão Energética" ──────────────────── */
  function initFusaoEnergetica() {
    const pathWest = document.getElementById('path-west');
    const pathEast = document.getElementById('path-east');
    const logoCenter = document.getElementById('mapCenterLogo');
    const collisionFlash = document.getElementById('collisionFlash');
    const canvas = document.getElementById('particleCanvas');

    if (!pathWest || !pathEast) return;

    const length = pathWest.getTotalLength();

    // Configura o traçado inicial de ambas as linhas
    pathWest.style.strokeDasharray = `${length}`;
    pathWest.style.strokeDashoffset = `${length}`;

    pathEast.style.strokeDasharray = `${length}`;
    pathEast.style.strokeDashoffset = `${-length}`;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof gsap === 'undefined') {
      // Fallback estático instantâneo para acessibilidade ou sem GSAP
      pathWest.style.strokeDashoffset = '0';
      pathEast.style.strokeDashoffset = '0';
      if (logoCenter) {
        logoCenter.style.transform = 'translate(-50%, -50%) scale(1)';
        logoCenter.style.opacity = '1';
      }
      const heroEls = document.querySelectorAll('#heroEdition, #heroTitle, #heroBadges, #heroActions, #heroCountdown');
      heroEls.forEach(el => {
        if (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
      return;
    }

    // Prepara elementos para animação GSAP
    gsap.set('#heroEdition, #heroTitle, #heroBadges, #heroActions, #heroCountdown', { opacity: 0, y: 24 });
    gsap.set(logoCenter, { scale: 0, opacity: 0, xPercent: -50, yPercent: -50 });

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

    // 1. Linhas Leste (Azul) e Oeste (Verde) desenham simultaneamente (~3.2s)
    tl.to(pathWest, { strokeDashoffset: 0, duration: 3.2 }, 0);
    tl.to(pathEast, { strokeDashoffset: 0, duration: 3.2 }, 0);

    // 2. Colisão no Bico Sul -> Flash de Luz e Explosão de Partículas
    tl.add(() => {
      triggerCollisionEffects(collisionFlash, canvas);
    }, 3.0);

    // 3. Logo surge no centro com efeito Spring (scale: 0 -> 1)
    tl.to(logoCenter, {
      scale: 1,
      opacity: 1,
      duration: 0.9,
      ease: 'back.out(1.8)'
    }, 3.1);

    // 4. Fade-in e elevação do título, badges, botões e contagem regressiva
    tl.to('#heroEdition, #heroTitle, #heroBadges, #heroActions, #heroCountdown', {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.15,
      ease: 'power3.out'
    }, 3.3);
  }

  /* Partículas da Colisão no Bico Sul */
  function triggerCollisionEffects(flashEl, canvas) {
    if (flashEl && typeof gsap !== 'undefined') {
      gsap.fromTo(flashEl, 
        { scale: 0, opacity: 1 }, 
        { scale: 2.4, opacity: 0, duration: 0.7, ease: 'power2.out' }
      );
    }

    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Ponto de colisão no bico sul (aproximadamente centro inferior)
    const originX = canvas.width / 2;
    const originY = canvas.height * 0.82;

    const particles = [];
    const colors = ['#80BF41', '#B7D996', '#223D73', '#FFFFFF', '#384C73'];

    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6.5;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        radius: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      particles.forEach(p => {
        if (p.alpha <= 0) return;
        activeCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // Gravidade suave
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (activeCount > 0) {
        requestAnimationFrame(animateParticles);
      }
    }

    animateParticles();
  }

  initFusaoEnergetica();


  /* ─── Timeline JS: cálculo dinâmico via Date() ──────────── */
  function initTimelineDate() {
    const items = document.querySelectorAll('.timeline-item');
    const progressBar = document.getElementById('timelineProgress');
    if (!items.length || !progressBar) return;

    const now = new Date();
    let activeIndex = -1;
    let completedCount = 0;

    items.forEach((item, index) => {
      const startStr = item.getAttribute('data-start');
      const endStr = item.getAttribute('data-end');
      if (!startStr || !endStr) return;

      const startDate = new Date(startStr + 'T00:00:00');
      const endDate = new Date(endStr + 'T23:59:59');

      if (now > endDate) {
        item.classList.add('completed');
        completedCount++;
      } else if (now >= startDate && now <= endDate) {
        item.classList.add('active');
        activeIndex = index;
      }
    });

    if (activeIndex === -1 && completedCount < items.length) {
      const targetIdx = Math.min(completedCount, items.length - 1);
      items[targetIdx].classList.add('active');
      activeIndex = targetIdx;
    }

    const progressPercent = (Math.max(completedCount, activeIndex) / (items.length - 1)) * 100;
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      progressBar.style.height = `${Math.min(100, Math.max(0, progressPercent))}%`;
      progressBar.style.width = '100%';
    } else {
      progressBar.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
      progressBar.style.height = '100%';
    }
  }

  window.addEventListener('resize', initTimelineDate, { passive: true });
  initTimelineDate();

  /* ─── Contagem Regressiva (Hero Countdown) ─────────────── */
  function initCountdown() {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    // Data oficial do evento: 24 de Novembro de 2026 às 08:00
    const targetDate = new Date('2026-11-24T08:00:00').getTime();

    function updateTimer() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      daysEl.textContent = days < 10 ? '0' + days : days;
      hoursEl.textContent = hours < 10 ? '0' + hours : hours;
      minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
      secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  initCountdown();

  /* ─── Mascote Lampejo: Troca de GIFs (Idle / Hover) ─────── */
  function initLampejoGifSwap() {
    const lampejoContainer = document.getElementById('mascot-lampejo-container');
    const bentoContainer = document.querySelector('.areas-bento-container');
    const imgEl = lampejoContainer ? lampejoContainer.querySelector('.lampejo-img') : null;

    if (!lampejoContainer || !bentoContainer || !imgEl) return;

    // Nomes dos arquivos dos 2 GIFs (ou WebP animados)
    const IDLE_GIF = 'lampejo-idle.gif';
    const HOVER_GIF = 'lampejo-hover.gif';
    const FALLBACK_PNG = 'lampejo.png';

    // Pré-carregamento em memória do GIF de hover para troca instantânea sem lag
    const preloader = new Image();
    preloader.src = HOVER_GIF;

    let autoTriggerDone = false;

    function setHoverGif() {
      lampejoContainer.classList.add('peek-active');
      imgEl.src = HOVER_GIF;
    }

    function setIdleGif() {
      lampejoContainer.classList.remove('peek-active');
      imgEl.src = IDLE_GIF;
    }

    // Tentar definir o estado inicial Idle (ou fallback se o arquivo ainda não foi colocado na pasta)
    const checkIdle = new Image();
    checkIdle.onload = function () {
      imgEl.src = IDLE_GIF;
    };
    checkIdle.onerror = function () {
      // Caso os GIFs ainda não estejam salvos na pasta v2, usa a PNG recortada sem quebrar a página
      imgEl.src = FALLBACK_PNG;
    };
    checkIdle.src = IDLE_GIF;

    // 1. Scroll-Trigger (Dispara o GIF de destaque por 3s quando a seção fica visível)
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !autoTriggerDone) {
            autoTriggerDone = true;
            setTimeout(() => {
              setHoverGif();
              setTimeout(setIdleGif, 3000);
            }, 300);
          }
        });
      }, { threshold: 0.2 });

      observer.observe(bentoContainer);
    }

    // 2. Interação de Hover no Bento Grid
    bentoContainer.addEventListener('mouseenter', setHoverGif);
    bentoContainer.addEventListener('mouseleave', setIdleGif);

    // 3. Clique interativo no Mascote
    lampejoContainer.addEventListener('click', () => {
      lampejoContainer.classList.add('clicked');
      setHoverGif();
      setTimeout(() => {
        lampejoContainer.classList.remove('clicked');
      }, 400);
    });
  }

  initLampejoGifSwap();

})();