(function () {
  'use strict';

  /* ─── Configuração ─────────────────────────────────────── */
  var boot = window.VIVA_BOOT;
  if (!boot) return;
  var OPEN_AT = new Date(boot.snapshot.opensAt);
  var CLOSE_AT = new Date(boot.snapshot.closesAt);
  var deadlineFormat = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Araguaina', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasFlip = hasGsap && typeof window.Flip !== 'undefined';
  if (hasFlip) gsap.registerPlugin(Flip);

  var CATEGORIES = [
    { id: 'humanas', name: 'Ciências Humanas e Sociais', short: 'Humanas', icon: 'users' },
    { id: 'biologicas', name: 'Ciências Biológicas', short: 'Biológicas', icon: 'sprout' },
    { id: 'quimicas', name: 'Ciências Químicas e de Materiais', short: 'Químicas', icon: 'flask' },
    { id: 'saude', name: 'Ciências Biomédicas e da Saúde', short: 'Saúde', icon: 'activity' },
    { id: 'exatas', name: 'Ciências Exatas', short: 'Exatas', icon: 'x-circle' },
    { id: 'ambiental', name: 'Engenharia Energética, Agronômica e Ambiental', short: 'Ambiental', icon: 'leaf' },
    { id: 'engenharias', name: 'Engenharia Elétrica e Mecânica', short: 'Engenharias', icon: 'cpu' }
  ];
  var LEVEL_SHORT = { 'Fundamental I': 'Fund. I', 'Fundamental II': 'Fund. II', 'Ensino Médio': 'Médio' };
  var PROJECTS = boot.projects.map(function (project) {
    return {
      code: project.code, title: project.name, students: project.authors, cat: project.category,
      level: project.level, advisor: project.advisor, coadvisor: project.coadvisor,
      school: project.school, city: project.city, votes: project.votes_count
    };
  });
  CATEGORIES.forEach(function (category) { category.name = boot.categories[category.id]; });

  var catById = Object.create(null);
  CATEGORIES.forEach(function (c) { catById[c.id] = c; });

  function norm(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }


  PROJECTS.forEach(function (p) {
    p.slug = p.code.toLowerCase();
    p.id = p.code;
    p.hay = norm([p.code, p.title, p.students.join(' '), p.advisor, p.coadvisor || '', p.school, p.city, p.level, catById[p.cat].name].join(' '));
  });

  var byId = Object.create(null);
  PROJECTS.forEach(function (p) { byId[p.id] = p; });

  /* ─── Estado ───────────────────────────────────────────── */
  var state = {
    snapshot: boot.snapshot,
    clockOffset: Date.parse(boot.snapshot.serverTime) - Date.now(),
    live: false,
    user: boot.user,
    myVote: boot.myVote,
    tab: 'geral',
    q: '',
    pending: null,
    lastUpdate: Date.now(),
    prevIdx: null,        // ordem anterior (para setas ▲▼)
    prevKey: '',          // aba+busca a que prevIdx se refere
    prevVotes: {},
    leaderKey: '',
    hold: false,          // usuário mirando um botão: não reordenar
    dirty: false          // há atualização pendente por causa do hold
  };

  function phase() { return state.snapshot.phase; }

  function deadline(date) { return deadlineFormat.format(date); }

  /* ─── Helpers de DOM ───────────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function icon(name, cls) {
    return '<svg class="vt-i' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }

  function fmt(n) { return Number(n).toLocaleString('pt-BR'); }
  function plural(n, one, many) { return n === 1 ? one : many; }

  function catTag(cat) {
    var c = catById[cat];
    return '<span class="vt-cat-tag vt-c-' + c.id + '">' + icon(c.icon) + esc(c.short) + '</span>';
  }

  /* ─── Toasts ───────────────────────────────────────────── */
  var toasts = $('#toasts');
  function toast(msg, type) {
    var el = document.createElement('div');
    el.className = 'vt-toast vt-toast--' + (type || 'success');
    el.innerHTML = icon(type === 'info' ? 'info' : 'check-circle') + '<span>' + msg + '</span>';
    toasts.appendChild(el);
    while (toasts.children.length > 3) toasts.removeChild(toasts.firstChild);
    setTimeout(function () {
      el.classList.add('is-leaving');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 180);
    }, 4200);
  }

  /* ─── URL (deep link de área, busca e projeto) ─────────── */
  function setParam(key, value) {
    try {
      var url = new URL(window.location.href);
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) { /* file:// sem suporte */ }
  }

  function getParam(key) {
    try { return new URL(window.location.href).searchParams.get(key); } catch (e) { return null; }
  }

  /* ─── Navbar ───────────────────────────────────────────── */
  var navbar = $('#navbar');
  var navToggle = $('#navToggle');
  var navLinks = $('#navLinks');

  function onScroll() { navbar.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    navToggle.classList.toggle('active', open);
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  navToggle.addEventListener('click', function () { setMenu(!navLinks.classList.contains('open')); });
  navLinks.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) { setMenu(false); navToggle.focus(); }
  });

  /* ─── Sessão do eleitor ─────────────────────────── */
  function renderUser() {
    var logged = !!state.user;
    $('#navLogin').hidden = logged;
    $('#navUser').hidden = !logged;
    if (logged) {
      $('#navUserName').textContent = state.user.name;
      $('#navAvatar').textContent = state.user.name.charAt(0).toUpperCase();
    }
  }

  $('#navLogin').addEventListener('click', function () { setMenu(false); openLogin(null); });
  $('#navLogout').addEventListener('click', function () {
    var form = document.createElement('form');
    var csrf = document.createElement('input');
    form.method = 'post';
    form.action = boot.logoutUrl;
    csrf.type = 'hidden';
    csrf.name = '_token';
    csrf.value = $('meta[name="csrf-token"]').content;
    form.appendChild(csrf);
    document.body.appendChild(form);
    form.submit();
  });

  /* ─── Contagem regressiva e fases ──────────────────────── */
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function renderCountdown() {
    var ph = phase();
    var target = ph === 'antes' ? OPEN_AT : CLOSE_AT;
    var closed = ph === 'encerrada';
    $('#cdLabel').textContent = ph === 'antes' ? 'A votação abre em' : (closed ? 'Votação encerrada' : 'A votação encerra em');
    $('#cdGrid').hidden = closed;
    $('#cdClosed').hidden = !closed;
    if (closed) return;
    var d = Math.max(0, target.getTime() - (Date.now() + state.clockOffset));
    $('#cdDays').textContent = pad(Math.floor(d / 864e5));
    $('#cdHours').textContent = pad(Math.floor((d % 864e5) / 36e5));
    $('#cdMinutes').textContent = pad(Math.floor((d % 36e5) / 6e4));
    $('#cdSeconds').textContent = pad(Math.floor((d % 6e4) / 1e3));
  }

  var lastPhase = null;
  function renderPhase() {
    var ph = phase();
    document.body.setAttribute('data-phase', ph);
    var label = ph === 'antes' ? 'Em breve' : (ph === 'encerrada' ? 'Resultado final' : 'Ao vivo');
    $('#liveLabel').textContent = label;
    $('#heroLiveLabel').textContent = label;
    $('#rankBadgeLabel').textContent = label;
    renderCountdown();
    if (lastPhase !== null && lastPhase !== ph) {
      renderBottomBar();
    }
    lastPhase = ph;
  }

  setInterval(function () {
    renderCountdown();
    var target = phase() === 'antes' ? OPEN_AT : CLOSE_AT;
    if (phase() !== 'encerrada' && Date.now() + state.clockOffset >= target.getTime()) syncSnapshot();
    updateFreshness();
  }, 1000);

  /* ─── Botão de voto (estado por fase e por voto) ───────── */
  function voteButton(p, extraClass) {
    if (boot.display) return '';
    var ph = phase();
    var cls = 'btn-primary vt-btn-sm ' + (extraClass || '');
    var sr = '<span class="vt-sr"> — ' + esc(p.title) + '</span>';
    if (ph === 'antes') return '<button type="button" class="' + cls + '" disabled>' + icon('clock') + 'Abre em ' + deadline(OPEN_AT) + sr + '</button>';
    if (ph === 'encerrada') return '<button type="button" class="' + cls + '" disabled>Encerrada' + sr + '</button>';
    if (state.myVote === p.id) return '<button type="button" class="' + cls + ' is-mine" disabled>' + icon('check') + 'Seu voto' + sr + '</button>';
    if (state.myVote) return '<button type="button" class="' + cls + '" disabled>Já votou' + sr + '</button>';
    return '<button type="button" class="' + cls + '" data-action="vote" data-id="' + esc(p.id) + '">' + icon('thumbs-up') +
      'Votar<span class="vt-sr"> em ' + esc(p.title) + '</span></button>';
  }

  function nameButton(p) {
    return '<button type="button" class="vt-name-btn" data-action="details" data-id="' + esc(p.id) + '">' + esc(p.title) + '</button>';
  }

  /* ─── Ranking: todos os projetos, ranking denso ────────── */
  var rankBody = $('#rankBody');
  var podium = $('#podium');
  var rankList = $('#rankList');
  var rankEmpty = $('#rankEmpty');
  var rankNote = $('#rankNote');
  var rankNotice = $('#rankNotice');
  var rankTabs = $('#rankTabs');
  var results = $('#results');
  var searchInput = $('#searchInput');
  var searchClear = $('#searchClear');

  /* Ordena por votos (desc). Não há posições compartilhadas: com o mesmo
     número de votos, o desempate é a ordem alfabética do nome do projeto.
     Projetos sem votos ficam no fim, sem posição. Antes da abertura, a
     lista fica em ordem alfabética, sem posições. */
  function computeRanking(tab) {
    var list = PROJECTS.filter(function (p) { return tab === 'geral' || p.cat === tab; });
    var before = phase() === 'antes';
    list.sort(function (a, b) {
      return (before ? 0 : b.votes - a.votes) || a.title.localeCompare(b.title, 'pt-BR')
        || a.code.localeCompare(b.code, 'pt-BR');
    });
    var pos = 0;
    var rows = list.map(function (p, i) {
      var r = { p: p, idx: i, pos: null };
      if (!before && p.votes > 0) { pos += 1; r.pos = pos; }
      return r;
    });
    return rows;
  }

  function renderTabs() {
    var tabs = [{ id: 'geral', short: 'Todas', icon: 'award' }].concat(CATEGORIES);
    rankTabs.innerHTML = tabs.map(function (t) {
      var sel = state.tab === t.id;
      var n = t.id === 'geral' ? PROJECTS.length : PROJECTS.filter(function (p) { return p.cat === t.id; }).length;
      return '<button type="button" role="tab" class="vt-tab' + (t.id !== 'geral' ? ' vt-c-' + t.id : '') + '" id="tab-' + t.id + '"' +
        ' data-tab="' + t.id + '" aria-selected="' + sel + '" aria-controls="rankBody" tabindex="' + (sel ? '0' : '-1') + '">' +
        icon(t.icon) + esc(t.short) + ' <span class="vt-chip-count">' + n + '</span></button>';
    }).join('');
  }

  rankTabs.addEventListener('click', function (e) {
    var b = e.target.closest('[role="tab"]');
    if (b) selectTab(b.dataset.tab, false);
  });

  rankTabs.addEventListener('keydown', function (e) {
    var keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (keys.indexOf(e.key) === -1) return;
    e.preventDefault();
    var tabs = $all('[role="tab"]', rankTabs);
    var i = tabs.indexOf(document.activeElement);
    if (e.key === 'ArrowRight') i = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') i = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') i = 0;
    if (e.key === 'End') i = tabs.length - 1;
    selectTab(tabs[i].dataset.tab, true);
  });

  function selectTab(id, focus) {
    state.tab = id;
    $all('[role="tab"]', rankTabs).forEach(function (t) {
      var sel = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(sel));
      t.tabIndex = sel ? 0 : -1;
      if (sel && focus) t.focus();
    });
    rankBody.setAttribute('aria-labelledby', 'tab-' + id);
    setParam('area', id === 'geral' ? null : id);
    renderRanking(false);
  }

  /* Busca */
  var searchTimer;
  searchInput.addEventListener('input', function () {
    searchClear.hidden = !searchInput.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.q = searchInput.value;
      setParam('q', state.q.trim() || null);
      renderRanking(false);
    }, 160);
  });

  function clearSearch(focus) {
    searchInput.value = '';
    searchClear.hidden = true;
    state.q = '';
    setParam('q', null);
    if (focus) searchInput.focus();
  }

  searchClear.addEventListener('click', function () { clearSearch(true); renderRanking(false); });
  $('#emptyReset').addEventListener('click', function () { clearSearch(true); selectTab('geral', false); });

  /* Variação pela ordem relativa (ultrapassagens) entre snapshots. */
  function variation(r, prev) {
    var none = { cls: '', html: icon('minus') + '<span class="vt-sr">sem mudança</span>' };
    if (!prev || !r.pos) return none;
    var before = prev[r.p.id];
    if (before === undefined) return none;
    if (before > r.idx) return { cls: 'is-up', up: true, html: icon('arrow-up') + '<span>' + (before - r.idx) + '</span><span class="vt-sr"> ultrapassou ' + (before - r.idx) + '</span>' };
    if (before < r.idx) return { cls: 'is-down', html: icon('arrow-down') + '<span>' + (r.idx - before) + '</span><span class="vt-sr"> foi ultrapassado por ' + (r.idx - before) + '</span>' };
    return none;
  }

  function levelTag(p) {
    return '<span class="vt-mini-badge vt-level-badge" title="' + esc(p.level) + '">' + esc(LEVEL_SHORT[p.level] || p.level) + '</span>';
  }

  function badges(r) {
    var html = levelTag(r.p);
    if (state.myVote === r.p.id) html += '<span class="vt-mini-badge vt-mini-badge--mine">' + icon('check') + 'Seu voto</span>';
    return html;
  }

  /* Só o primeiro nome de cada autor, unidos em português ("Ana, Pedro e Júlia") */
  function firstName(full) { return String(full).trim().split(/\s+/)[0]; }

  function joinNames(names) {
    if (names.length <= 1) return names.join('');
    return names.slice(0, -1).join(', ') + ' e ' + names[names.length - 1];
  }

  function podiumPeople(p) {
    var students = joinNames(p.students.slice(0, 3).map(firstName));
    return '<ul class="vt-podium-people">' +
      '<li>' + icon('users') + '<span><span class="vt-sr">Alunos: </span>' + esc(students) + '</span></li>' +
      (p.advisor ? '<li>' + icon('user') + '<span>Orientação: ' + esc(firstName(p.advisor)) + '</span></li>' : '') +
      '<li>' + icon('home') + '<span><span class="vt-sr">Escola: </span>' + esc(p.school) + '</span></li>' +
    '</ul>';
  }

  function podiumCard(r, prev) {
    var mine = state.myVote === r.p.id;
    var v = variation(r, prev);
    return '<article class="vt-podium-card' + (mine ? ' is-mine' : '') + (v.up ? ' vt-glow' : '') + '" data-flip-id="' + esc(r.p.id) + '">' +
      '<span class="vt-podium-medal">' + icon('award') + r.pos + 'º lugar</span>' +
      '<h3 class="vt-podium-name">' + nameButton(r.p) + '</h3>' +
      '<div class="vt-badges-row">' + catTag(r.p.cat) + badges(r) + '</div>' +
      podiumPeople(r.p) +
      '<p class="vt-podium-votes"><b data-count="' + esc(r.p.id) + '">' + fmt(r.p.votes) + '</b>' + plural(r.p.votes, 'voto', 'votos') + '</p>' +
      '<div class="vt-podium-actions">' + voteButton(r.p) + '</div>' +
    '</article>';
  }

  function rowHTML(r, prev, leader) {
    var p = r.p;
    var mine = state.myVote === p.id;
    var v = variation(r, prev);
    var pct = leader ? Math.round((p.votes / leader) * 100) : 0;
    return '<li class="vt-rank-row' + (mine ? ' is-mine' : '') + (r.pos ? '' : ' is-zero') + (v.up ? ' vt-glow' : '') + '" data-flip-id="' + esc(p.id) + '">' +
      '<span class="vt-rank-pos">' + (r.pos ? r.pos + 'º<span class="vt-sr"> lugar</span>' : '–<span class="vt-sr">sem posição</span>') + '</span>' +
      '<span class="vt-rank-var ' + v.cls + '">' + v.html + '</span>' +
      '<div class="vt-rank-main">' + nameButton(p) +
        '<div class="vt-badges-row">' + catTag(p.cat) + badges(r) + '</div></div>' +
      '<div class="vt-rank-bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div>' +
      '<span class="vt-rank-votes"><b data-count="' + esc(p.id) + '">' + fmt(p.votes) + '</b>' + plural(p.votes, 'voto', 'votos') + '</span>' +
      '<div class="vt-rank-action">' + voteButton(p) + '</div>' +
    '</li>';
  }

  function renderNotice(ph) {
    if (ph === 'aberta') { rankNotice.hidden = true; return; }
    var html;
    if (ph === 'antes') {
      html = '<span class="vt-notice-icon">' + icon('clock') + '</span>' +
        '<p class="vt-notice-text"><strong>A votação abre em ' + deadline(OPEN_AT) + '</strong>' +
        '<span>Conheça os projetos abaixo. Entre com o Google agora e, na abertura, é só tocar em Votar.</span></p>' +
        (state.user ? '' : '<button type="button" class="btn-primary vt-btn-sm" data-notice-login>' + icon('log-in') + 'Entrar com Google</button>');
    } else {
      html = '<span class="vt-notice-icon">' + icon('award') + '</span>' +
        '<p class="vt-notice-text"><strong>Votação encerrada</strong>' +
        '<span>Este é o resultado final da votação popular, encerrada em ' + deadline(CLOSE_AT) + '. O anúncio oficial acontece na premiação.</span></p>';
    }
    rankNotice.innerHTML = html;
    rankNotice.hidden = false;
  }

  rankNotice.addEventListener('click', function (e) {
    if (e.target.closest('[data-notice-login]')) openLogin(null);
  });

  /* Guarda qual botão estava focado para devolver o foco após re-render */
  function focusMarker() {
    var a = document.activeElement;
    if (!a || !rankBody.contains(a) || !a.dataset) return null;
    return a.dataset.action && a.dataset.id ? { action: a.dataset.action, id: a.dataset.id } : null;
  }

  function restoreFocus(m) {
    if (!m) return;
    var el = rankBody.querySelector('[data-action="' + m.action + '"][data-id="' + CSS.escape(m.id) + '"]');
    if (el) el.focus({ preventScroll: true });
  }

  function renderRanking(animate) {
    var ph = phase();
    var total = PROJECTS.reduce(function (s, p) { return s + p.votes; }, 0);
    state.dirty = false;

    if (ph === 'antes') {
      $('#liveTotal').textContent = '0';
      $('#heroTotal').textContent = 'Abre em ' + deadline(OPEN_AT);
    } else {
      animateNumber($('#liveTotal'), total, animate);
      $('#heroTotal').textContent = fmt(total) + ' ' + plural(total, 'voto', 'votos');
    }

    renderNotice(ph);

    var all = computeRanking(state.tab);
    var q = norm(state.q.trim());
    var searching = q.length > 0;
    var leader = all.length && all[0].pos ? all[0].p.votes : 0;

    var key = state.tab + '|' + q + '|' + ph;
    var prev = state.prevKey === key ? state.prevIdx : null;
    var marker = focusMarker();
    var flipState = (animate && prev && hasFlip && !reduceMotion) ? Flip.getState('#rankBody [data-flip-id]') : null;

    /* Pódio: 1º, 2º e 3º, um projeto por degrau. Some durante a busca. */
    var showPodium = ph !== 'antes' && !searching && leader > 0;
    if (showPodium) {
      var steps = '';
      [1, 2, 3].forEach(function (n) {
        var items = all.filter(function (r) { return r.pos === n; });
        steps += '<div class="vt-step vt-step-' + n + '"><div class="vt-step-items">' +
          (items.length ? items.map(function (r) { return podiumCard(r, prev); }).join('')
            : '<div class="vt-podium-empty">' + n + 'º lugar ainda sem projeto</div>') +
          '</div></div>';
      });
      podium.innerHTML = steps;
      podium.hidden = false;
    } else {
      podium.innerHTML = '';
      podium.hidden = true;
    }

    /* Lista: todos os projetos (sem os do pódio, exceto durante a busca) */
    var rows = all.filter(function (r) {
      if (searching) return r.p.hay.indexOf(q) !== -1;
      return !(showPodium && r.pos && r.pos <= 3);
    });
    rankList.innerHTML = rows.map(function (r) { return rowHTML(r, prev, leader); }).join('');

    var areaTxt = state.tab === 'geral' ? 'em todas as áreas' : 'em ' + catById[state.tab].name;
    if (searching) {
      results.innerHTML = '<strong>' + rows.length + ' ' + plural(rows.length, 'resultado', 'resultados') + '</strong> para “' +
        esc(state.q.trim()) + '” ' + areaTxt;
    } else {
      results.innerHTML = '<strong>' + all.length + ' ' + plural(all.length, 'projeto', 'projetos') + '</strong> ' + areaTxt +
        (showPodium ? ' · demais posições abaixo do pódio' : (ph === 'antes' ? ' · em ordem alfabética até a abertura' : ''));
    }

    rankEmpty.hidden = !(searching && rows.length === 0);
    if (!rankEmpty.hidden) $('#emptyTitle').textContent = 'Nenhum projeto encontrado para “' + state.q.trim() + '”';
    $('.vt-rank-head').hidden = rows.length === 0;
    rankNote.hidden = ph === 'antes';

    if (flipState) {
      Flip.from(flipState, {
        targets: '#rankBody [data-flip-id]',
        duration: 0.6,
        ease: 'power2.inOut',
        onEnter: function (els) { return gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.3 }); }
      });
    }

    /* Contagem animada dos votos que mudaram */
    if (animate) {
      $all('[data-count]', rankBody).forEach(function (el) {
        var id = el.getAttribute('data-count');
        var before = state.prevVotes[id];
        if (before !== undefined && before !== byId[id].votes) animateFrom(el, before, byId[id].votes);
      });
    }

    /* Anúncio de troca de líder (leitor de tela) */
    var leaders = all.filter(function (r) { return r.pos === 1; }).map(function (r) { return r.p.title; });
    var lk = state.tab + ':' + leaders.join('|');
    if (prev && state.leaderKey && lk !== state.leaderKey && state.leaderKey.split(':')[0] === state.tab && leaders.length) {
      $('#rankAnnouncer').textContent = 'Novo líder: ' + leaders.join(' e ') + '.';
    }
    state.leaderKey = lk;

    var map = Object.create(null);
    all.forEach(function (r) { map[r.p.id] = r.idx; });
    state.prevIdx = map;
    state.prevKey = key;
    PROJECTS.forEach(function (p) { state.prevVotes[p.id] = p.votes; });

    restoreFocus(marker);
  }

  rankBody.addEventListener('click', function (e) {
    var b = e.target.closest('[data-action]');
    if (!b) return;
    if (b.dataset.action === 'details') openDetail(b.dataset.id);
    if (b.dataset.action === 'vote') requestVote(b.dataset.id);
  });

  /* Não reordenar a lista enquanto o usuário mira um botão:
     a atualização fica pendente e entra assim que ele sai. */
  function setHold(on) {
    if (state.hold === on) return;
    state.hold = on;
    if (!on && state.dirty && !activeModal) renderRanking(true);
  }

  rankBody.addEventListener('pointerover', function (e) {
    setHold(!!e.target.closest('[data-action]'));
  });
  rankBody.addEventListener('pointerleave', function () { setHold(false); });
  rankBody.addEventListener('focusin', function (e) { if (e.target.closest('[data-action]')) setHold(true); });
  rankBody.addEventListener('focusout', function (e) {
    if (!e.relatedTarget || !rankBody.contains(e.relatedTarget)) setHold(false);
  });

  function animateFrom(el, from, to) {
    if (!hasGsap || reduceMotion) { el.textContent = fmt(to); return; }
    var o = { v: from };
    gsap.to(o, { v: to, duration: 0.6, ease: 'power1.out', onUpdate: function () { el.textContent = fmt(Math.round(o.v)); } });
  }

  function animateNumber(el, to, animate) {
    var from = parseInt(String(el.textContent).replace(/\D/g, ''), 10);
    if (animate && !isNaN(from) && from !== to) animateFrom(el, from, to);
    else el.textContent = fmt(to);
  }

  function updateFreshness() {
    var el = $('#liveUpdated');
    var ph = phase();
    if (ph === 'antes') {
      el.textContent = (state.live ? 'Conectado' : 'Reconectando…') + ' · abre em ' + deadline(OPEN_AT);
      return;
    }
    if (ph === 'encerrada') { el.textContent = 'encerrada em ' + deadline(CLOSE_AT); return; }
    if (!state.live) { el.textContent = 'reconectando…'; return; }
    if (state.dirty) { el.textContent = 'novos votos chegando…'; return; }
    var s = Math.round((Date.now() - state.lastUpdate) / 1000);
    el.textContent = s < 3 ? 'atualizado agora' : 'atualizado há ' + s + 's';
  }

  var syncing = false;
  var polling = null;

  function votingComponent() {
    return window.Livewire?.find($('#votingApp').getAttribute('wire:id'));
  }

  function applySnapshot(snapshot) {
    var phaseOrder = { antes: 0, aberta: 1, encerrada: 2 };
    if (!snapshot || snapshot.totalVotes < state.snapshot.totalVotes
      || phaseOrder[snapshot.phase] < phaseOrder[state.snapshot.phase]
      || Date.parse(snapshot.serverTime) < Date.parse(state.snapshot.serverTime)) return;

    var phaseChanged = snapshot.phase !== phase();
    var changed = phaseChanged || snapshot.totalVotes !== state.snapshot.totalVotes;
    state.snapshot = snapshot;
    state.clockOffset = Date.parse(snapshot.serverTime) - Date.now();
    state.lastUpdate = Date.now();
    PROJECTS.forEach(function (project) {
      var count = Number(snapshot.counts[project.code] ?? 0);
      if (project.votes !== count) changed = true;
      project.votes = count;
    });

    if (phaseChanged) {
      renderPhase();
      if (activeModal?.id === 'modalConfirm' && phase() !== 'aberta') closeModal();
    }
    if (changed) {
      if (state.hold || activeModal) state.dirty = true;
      else renderRanking(true);
    }
    updateFreshness();
  }

  async function syncSnapshot() {
    var wire = votingComponent();
    if (!wire || syncing) return;
    syncing = true;
    try {
      applySnapshot(await wire.$call('fetchSnapshot'));
    } catch (error) {
      console.warn('Sincronização da votação indisponível.', error);
    } finally {
      syncing = false;
    }
  }

  function setConnection(live) {
    state.live = live;
    $('#liveStatus').dataset.transport = live ? 'reverb' : 'polling';
    if (live) {
      clearInterval(polling);
      polling = null;
      syncSnapshot();
    } else if (!polling) {
      polling = setInterval(syncSnapshot, 10000);
    }
    updateFreshness();
  }

  window.addEventListener('load', function () {
    setConnection(false);
    if (!window.Echo) return;
    var channel = window.Echo.channel('voting.ranking');
    channel.listen('.ranking.updated', applySnapshot)
      .subscribed(function () { setConnection(true); })
      .error(function () { setConnection(false); });
    window.Echo.connector.pusher.connection.bind('state_change', function (status) {
      if (status.current !== 'connected') setConnection(false);
    });
  });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) syncSnapshot();
  });

  /* ─── Modais ───────────────────────────────────────────── */
  var activeModal = null;
  var returnFocus = null;
  var returnMarker = null;

  function focusables(root) {
    return $all('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
      .filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }

  function openModal(id) {
    var m = document.getElementById(id);
    if (activeModal) closeModal(true, true);
    else {
      returnFocus = document.activeElement;
      returnMarker = focusMarker();
    }
    m.hidden = false;
    m.classList.remove('is-closing');
    document.body.classList.add('vt-lock');
    void m.offsetWidth;
    m.classList.add('is-open');
    activeModal = m;
    var target = m.querySelector('[data-autofocus]') || m.querySelector('.vt-modal-dialog');
    setTimeout(function () { target.focus(); }, 40);
  }

  function closeModal(instant, keepFocus) {
    var m = activeModal;
    if (!m) return;
    activeModal = null;
    m.classList.remove('is-open');
    m.classList.add('is-closing');
    var done = function () {
      m.hidden = true;
      m.classList.remove('is-closing');
      if (!activeModal) document.body.classList.remove('vt-lock');
    };
    if (instant || reduceMotion) done(); else setTimeout(done, 160);
    if (m.id === 'modalDetail') setParam('projeto', null);
    if (!keepFocus) {
      if (state.dirty) renderRanking(false);
      if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
      else if (returnMarker) {
        var el = rankBody.querySelector('[data-action="' + returnMarker.action + '"][data-id="' + CSS.escape(returnMarker.id) + '"]') ||
          rankBody.querySelector('[data-action="details"][data-id="' + CSS.escape(returnMarker.id) + '"]');
        if (el) el.focus();
      }
    }
  }

  document.addEventListener('click', function (e) {
    if (activeModal && e.target.closest('[data-close]') && activeModal.contains(e.target)) {
      var link = e.target.closest('a[href^="#"]');
      closeModal(false, !!link);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!activeModal) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key === 'Tab') {
      var f = focusables(activeModal);
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === activeModal.querySelector('.vt-modal-dialog'))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  /* Detalhes */
  function openDetail(id) {
    var p = byId[id];
    if (!p) return;
    var c = catById[p.cat];
    var ph = phase();
    var hint = ph === 'aberta' && !state.myVote
      ? 'Cada conta Google vota uma única vez.'
      : (state.myVote === p.id ? 'Você votou neste projeto.' : '');
    $('#detailContent').innerHTML =
      '<div class="vt-detail-hero vt-area-' + c.id + '">' + icon(c.icon) + '<span class="project-tag">' + esc(c.name) + '</span></div>' +
      '<div class="vt-detail-body">' +
        '<h2 id="detailTitle">' + esc(p.title) + '</h2>' +
        (p.summary ? '<p>' + esc(p.summary) + '</p>' : '') +
        '<dl class="vt-detail-facts">' +
          '<div class="vt-span-2"><dt>Alunos</dt><dd><ul class="vt-student-list">' +
            p.students.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></dd></div>' +
          (p.advisor ? '<div class="vt-span-2"><dt>Orientação</dt><dd>' + esc(p.advisor) + '</dd></div>' : '') +
          (p.coadvisor ? '<div class="vt-span-2"><dt>Coorientação</dt><dd>' + esc(p.coadvisor) + '</dd></div>' : '') +
          '<div class="vt-span-2"><dt>Escola</dt><dd>' + esc(p.school) + '</dd></div>' +
          '<div><dt>Cidade</dt><dd>' + esc(p.city) + '</dd></div>' +
          '<div><dt>Nível</dt><dd>' + esc(p.level) + '</dd></div>' +
          '<div><dt>Área</dt><dd>' + esc(c.name) + '</dd></div>' +
          '<div><dt>Código</dt><dd>' + esc(p.code) + '</dd></div>' +
        '</dl>' +
        '<div class="vt-detail-cta">' + voteButton(p).replace('data-action="vote"', 'data-detail-vote').replace(' vt-btn-sm', '') +
          (hint ? '<p>' + hint + '</p>' : '') + '</div>' +
      '</div>';
    setParam('projeto', p.slug);
    openModal('modalDetail');
  }

  $('#detailContent').addEventListener('click', function (e) {
    var b = e.target.closest('[data-detail-vote]');
    if (b) requestVote(b.dataset.id);
  });

  /* Login */
  function openLogin(pendingId) {
    state.pending = pendingId;
    var btn = $('#googleBtn');
    btn.classList.remove('is-loading');
    $('#googleBtnLabel').textContent = 'Entrar com Google';
    $('#loginPending').textContent = pendingId
      ? 'Depois de entrar, você volta direto para confirmar o voto em “' + byId[pendingId].title + '”.'
      : (phase() === 'antes' ? 'Entre agora para votar assim que a votação abrir.' : '');
    openModal('modalLogin');
  }

  $('#googleBtn').addEventListener('click', function () {
    var url = new URL(boot.googleUrl);
    if (state.pending) url.searchParams.set('project', state.pending);
    window.location.assign(url);
  });

  var widget = null;
  var turnstileToken = '';

  function openConfirm(id) {
    var p = byId[id];
    var c = catById[p.cat];
    state.pending = id;
    $('#confirmProject').innerHTML =
      '<span class="vt-confirm-thumb vt-area-' + c.id + '">' + icon(c.icon) + '</span>' +
      '<div><strong>' + esc(p.title) + '</strong>' + catTag(p.cat) + '</div>';
    var btn = $('#confirmBtn');
    var status = $('#turnstileText');
    btn.disabled = true;
    turnstileToken = '';
    openModal('modalConfirm');
    if (!boot.siteKey || !window.turnstile) {
      status.textContent = 'Verificação indisponível. Recarregue a página e tente novamente.';
      return;
    }

    status.textContent = 'Conclua a verificação para confirmar o voto.';
    if (widget !== null) window.turnstile.remove(widget);
    widget = window.turnstile.render('#turnstile', {
      sitekey: boot.siteKey,
      action: 'vote',
      callback: function (token) {
        turnstileToken = token;
        status.textContent = '';
        btn.disabled = false;
      },
      'expired-callback': function () { turnstileToken = ''; btn.disabled = true; },
      'error-callback': function () {
        turnstileToken = '';
        btn.disabled = true;
        status.textContent = 'A verificação falhou. Tente novamente.';
      }
    });
  }

  $('#confirmBtn').addEventListener('click', async function () {
    var btn = this;
    if (!state.pending || !turnstileToken || btn.disabled) return;
    btn.classList.add('is-loading');
    btn.disabled = true;
    $('.vt-btn-label', btn).textContent = 'Registrando…';
    try {
      var result = await votingComponent().$call('castVote', state.pending, turnstileToken);
      if (result.status === 'ok' || result.status === 'already_voted') {
        state.myVote = result.votedCode;
        state.pending = null;
        applySnapshot(result.snapshot);
        renderRanking(false);
        renderBottomBar();
        if (result.status === 'ok') openSuccess(byId[state.myVote]);
        else {
          closeModal();
          toast('Você já tem um voto registrado.', 'info');
          syncSnapshot();
        }
      } else if (result.status === 'unauthenticated') {
        openLogin(state.pending);
      } else {
        var messages = {
          closed: 'A votação está fora do horário de confirmação.',
          invalid_project: 'Este projeto está indisponível.',
          rate_limited: 'Aguarde um minuto antes de tentar novamente.',
          verification_failed: 'A verificação falhou. Tente novamente.'
        };
        toast(messages[result.status] || 'Não foi possível confirmar o voto.', 'info');
        syncSnapshot();
      }
    } catch (error) {
      toast('Não foi possível confirmar a resposta. Tente novamente para consultar seu voto.', 'info');
    } finally {
      btn.classList.remove('is-loading');
      $('.vt-btn-label', btn).textContent = 'Confirmar voto';
      turnstileToken = '';
      if (activeModal?.id === 'modalConfirm' && widget !== null) window.turnstile.reset(widget);
    }
  });

  /* Sucesso */
  function openSuccess(p) {
    var img = $('#successMascot');
    if (!img.getAttribute('src')) img.setAttribute('src', img.getAttribute('data-src'));
    $('#successDesc').innerHTML = 'Seu voto em <strong>' + esc(p.title) + '</strong> foi computado. Obrigado por apoiar a ciência feita no Tocantins!';
    var base = window.location.href.split('?')[0].split('#')[0];
    var text = 'Votei no projeto "' + p.title + '" na Votação Popular da VIVA Ciência 2026! Vote também: ' + base + '?projeto=' + p.slug;
    $('#successShare').setAttribute('href', 'https://wa.me/?text=' + encodeURIComponent(text));
    openModal('modalSuccess');
    if (hasGsap && !reduceMotion) {
      gsap.fromTo(img, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)', delay: 0.1 });
    }
  }

  $('#successRanking').addEventListener('click', function () {
    closeModal(false, true);
    clearSearch(false);
    if (state.tab !== 'geral') selectTab('geral', false); else renderRanking(false);
    var target = rankBody.querySelector('.is-mine') || document.getElementById('ranking');
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  /* ─── Fluxo de voto ────────────────────────────────────── */
  function requestVote(id) {
    var p = byId[id];
    if (!p || boot.display) return;
    var ph = phase();
    if (ph === 'antes') { toast('A votação abre em ' + deadline(OPEN_AT) + '.', 'info'); return; }
    if (ph === 'encerrada') { toast('A votação foi encerrada em ' + deadline(CLOSE_AT) + '.', 'info'); return; }
    if (state.myVote) {
      toast('Você já votou em “' + esc(byId[state.myVote]?.title || state.myVote) + '”. Cada conta Google vota uma única vez.', 'info');
      return;
    }
    if (!state.user) { openLogin(id); return; }
    openConfirm(id);
  }

  /* ─── Barra inferior (mobile) ──────────────────────────── */
  function renderBottomBar() {
    var text = $('#bottomText');
    var action = $('#bottomAction');
    var ph = phase();
    if (state.myVote) {
      text.innerHTML = icon('check-circle') + '<span>Seu voto: ' + esc(byId[state.myVote]?.title || state.myVote) + '</span>';
      action.textContent = 'Ver ranking';
    } else if (ph === 'antes') {
      text.innerHTML = icon('clock') + '<span>Votação abre em ' + deadline(OPEN_AT) + '</span>';
      action.textContent = 'Ver projetos';
    } else if (ph === 'encerrada') {
      text.innerHTML = icon('award') + '<span>Votação encerrada</span>';
      action.textContent = 'Resultado';
    } else {
      text.innerHTML = icon('thumbs-up') + '<span>Escolha seu projeto favorito</span>';
      action.textContent = 'Votar';
    }
    action.setAttribute('href', '#ranking');
  }

  /* ─── Reveal no scroll ─────────────────────────────────── */
  var reveals = $all('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    /* threshold 0: basta 1px na tela. Com proporção (ex.: 0.05), blocos mais
       altos que a tela — como o ranking com 123 projetos no celular — nunca
       atingiam a fração exigida e ficavam invisíveis para sempre. */
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ─── Entrada do hero ──────────────────────────────────── */
  if (hasGsap && !reduceMotion) {
    gsap.from('.vt-hero-anim', { opacity: 0, y: 24, duration: 0.85, stagger: 0.12, ease: 'power3.out', delay: 0.1 });
  }

  /* ─── Inicialização ────────────────────────────────────── */
  $('#statProjects').textContent = PROJECTS.length;

  /* As abas de área só aparecem a partir de 768px (ver CSS). Abaixo disso,
     o ranking volta para "Todas", para nunca ficar filtrado sem controle visível. */
  var tabsMQ = window.matchMedia('(min-width: 768px)');

  var areaParam = getParam('area');
  if (areaParam && catById[areaParam] && tabsMQ.matches) state.tab = areaParam;
  var qParam = getParam('q');
  if (qParam) { state.q = qParam; searchInput.value = qParam; searchClear.hidden = false; }

  renderUser();
  renderTabs();
  rankBody.setAttribute('aria-labelledby', 'tab-' + state.tab);
  renderPhase();
  renderRanking(false);
  renderBottomBar();
  updateFreshness();

  function onTabsMQ() { if (!tabsMQ.matches && state.tab !== 'geral') selectTab('geral', false); }
  if (tabsMQ.addEventListener) tabsMQ.addEventListener('change', onTabsMQ);
  else if (tabsMQ.addListener) tabsMQ.addListener(onTabsMQ);

  if (boot.error) toast(esc(boot.error), 'info');
  if (boot.confirmProject && phase() === 'aberta' && state.user && !state.myVote) {
    window.addEventListener('load', function () { requestVote(boot.confirmProject); });
  }
  var projParam = getParam('projeto')?.toLowerCase();
  if (projParam) {
    var target = PROJECTS.filter(function (p) { return p.slug === projParam; })[0];
    if (target) openDetail(target.id);
  }
})();
