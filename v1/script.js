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

  })();
