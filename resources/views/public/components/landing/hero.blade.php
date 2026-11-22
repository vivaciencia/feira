<!-- ═══ Hero ═══ -->
<header class="hero vt-hero vt-dark" id="topo">
    <div class="hero-math-texture" aria-hidden="true"></div>
    <div class="aurora-glow aurora-glow-1" aria-hidden="true"></div>
    <div class="aurora-glow aurora-glow-2" aria-hidden="true"></div>

    <div class="container vt-hero-grid">
        <div class="vt-hero-logo vt-hero-anim">
            <img src="{{ asset('Logo Camisa e Copo2.png') }}" alt="VIVA Ciência — Feira Científica e Tecnológica do Tocantins" width="500" height="500" fetchpriority="high">
        </div>

        <div class="vt-hero-copy">
            <h1 class="hero-title vt-hero-anim">
                Votação do projeto <span class="highlight">da galera</span>
            </h1>

            <ul class="hero-badges vt-hero-badges vt-hero-anim" aria-label="Resumo da votação">
                <li class="hero-badge"><svg class="vt-i" aria-hidden="true"><use href="#i-book-open" /></svg> <span><span id="statProjects">123</span> projetos</span></li>
                <li class="hero-badge"><svg class="vt-i" aria-hidden="true"><use href="#i-grid" /></svg> 7 áreas</li>
                <li class="hero-badge"><svg class="vt-i" aria-hidden="true"><use href="#i-shield" /></svg> 1 voto por conta Google</li>
            </ul>

            <ol class="vt-steps vt-hero-anim" aria-label="Como votar em 3 passos">
                <li><span class="vt-step-n">1</span> Entre com Google</li>
                <li aria-hidden="true" class="vt-step-sep"><svg class="vt-i"><use href="#i-arrow-right" /></svg></li>
                <li><span class="vt-step-n">2</span> Escolha</li>
                <li aria-hidden="true" class="vt-step-sep"><svg class="vt-i"><use href="#i-arrow-right" /></svg></li>
                <li><span class="vt-step-n">3</span> Confirme</li>
            </ol>

            <div class="vt-hero-actions vt-hero-anim">
                <a href="#ranking" class="btn-vote-main">
                    <svg class="vt-i" aria-hidden="true"><use href="#i-thumbs-up" /></svg>
                    Votar agora
                </a>
                <a href="#como-votar" class="btn btn-outline">
                    <svg class="vt-i" aria-hidden="true"><use href="#i-info" /></svg>
                    Como funciona
                </a>
            </div>
        </div>

        <aside class="hero-countdown-card vt-countdown vt-hero-anim" aria-labelledby="cdLabel">
            <div class="countdown-header">
                <span class="countdown-badge">
                    <svg class="vt-i" aria-hidden="true"><use href="#i-clock" /></svg>
                    <span id="cdLabel">A votação encerra em</span>
                </span>
            </div>

            <div class="countdown-grid" id="cdGrid" role="timer" aria-live="off">
                <div class="countdown-item">
                    <div class="countdown-number" id="cdDays">00</div>
                    <div class="countdown-label">Dias</div>
                </div>
                <div class="countdown-sep" aria-hidden="true">:</div>
                <div class="countdown-item">
                    <div class="countdown-number" id="cdHours">00</div>
                    <div class="countdown-label">Horas</div>
                </div>
                <div class="countdown-sep" aria-hidden="true">:</div>
                <div class="countdown-item">
                    <div class="countdown-number" id="cdMinutes">00</div>
                    <div class="countdown-label">Min</div>
                </div>
                <div class="countdown-sep" aria-hidden="true">:</div>
                <div class="countdown-item">
                    <div class="countdown-number" id="cdSeconds">00</div>
                    <div class="countdown-label">Seg</div>
                </div>
            </div>
            <p class="vt-cd-closed" id="cdClosed" hidden>Resultado oficial na cerimônia de premiação.</p>

            <div class="countdown-footer">
                <a class="vt-live-pill" href="#ranking" id="heroLive">
                    <span class="vt-live-dot" aria-hidden="true"></span>
                    <span id="heroLiveLabel">Ao vivo</span>
                    <strong id="heroTotal">0 votos</strong>
                </a>
                <span>
                    <svg class="vt-i" aria-hidden="true"><use href="#i-calendar" /></svg>
                    {{ \Carbon\CarbonImmutable::parse(config('voting.opens_at'))->setTimezone('America/Araguaina')->format('d/m H:i') }} → {{ \Carbon\CarbonImmutable::parse(config('voting.closes_at'))->setTimezone('America/Araguaina')->format('d/m H:i') }}
                </span>
            </div>
        </aside>
    </div>

    <div class="hero-transition-divider" aria-hidden="true">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 120C360 40 1080 40 1440 120V120H0Z" fill="#F2F2F2" />
        </svg>
    </div>
</header>
