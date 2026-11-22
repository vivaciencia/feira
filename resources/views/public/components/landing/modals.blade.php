<!-- ═══ Barra inferior (mobile) ═══ -->
<div class="vt-bottombar" id="bottomBar">
    <p class="vt-bottombar-text" id="bottomText">Escolha seu projeto</p>
    <a href="#ranking" class="btn-primary vt-btn-sm" id="bottomAction">Votar</a>
</div>

<!-- ═══ Toasts ═══ -->
<div class="vt-toasts" id="toasts" role="status" aria-live="polite"></div>

<!-- ═══ Modal: detalhes do projeto ═══ -->
<div class="vt-modal" id="modalDetail" hidden>
    <div class="vt-modal-scrim" data-close></div>
    <div class="vt-modal-dialog vt-modal-dialog--wide" role="dialog" aria-modal="true" aria-labelledby="detailTitle" tabindex="-1">
        <button type="button" class="vt-modal-close" data-close aria-label="Fechar">
            <svg class="vt-i" aria-hidden="true"><use href="#i-x" /></svg>
        </button>
        <div id="detailContent"></div>
    </div>
</div>

<!-- ═══ Modal: login ═══ -->
<div class="vt-modal" id="modalLogin" hidden>
    <div class="vt-modal-scrim" data-close></div>
    <div class="vt-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="loginTitle" aria-describedby="loginDesc" tabindex="-1">
        <button type="button" class="vt-modal-close" data-close aria-label="Fechar">
            <svg class="vt-i" aria-hidden="true"><use href="#i-x" /></svg>
        </button>
        <div class="vt-modal-icon"><svg class="vt-i" aria-hidden="true"><use href="#i-shield" /></svg></div>
        <h2 class="vt-modal-title" id="loginTitle">Entre para votar</h2>
        <p class="vt-modal-text" id="loginDesc">Usamos sua conta Google só para garantir <strong>um voto por conta Google</strong>.
            <span id="loginPending"></span></p>
        <button type="button" class="vt-google-btn" id="googleBtn" data-autofocus>
            <svg class="vt-google-g" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span id="googleBtnLabel">Entrar com Google</span>
        </button>
        <p class="vt-modal-fine">
            Ao entrar, você concorda com o uso do seu nome, e-mail e ID da conta apenas para esta votação.
            A organização mantém esses dados durante a apuração e o prazo de contestação.
        </p>
    </div>
</div>

<!-- ═══ Modal: confirmação ═══ -->
<div class="vt-modal" id="modalConfirm" hidden>
    <div class="vt-modal-scrim" data-close></div>
    <div class="vt-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle" aria-describedby="confirmDesc" tabindex="-1">
        <button type="button" class="vt-modal-close" data-close aria-label="Fechar">
            <svg class="vt-i" aria-hidden="true"><use href="#i-x" /></svg>
        </button>
        <div class="vt-modal-icon vt-modal-icon--accent"><svg class="vt-i" aria-hidden="true"><use href="#i-thumbs-up" /></svg></div>
        <h2 class="vt-modal-title" id="confirmTitle">Confirmar seu voto?</h2>
        <div id="confirmDesc">
            <div class="vt-confirm-project" id="confirmProject"></div>
            <p class="vt-warning">
                <svg class="vt-i" aria-hidden="true"><use href="#i-alert" /></svg>
                Cada conta Google vota uma única vez. Depois de confirmado, o voto <strong>não pode ser alterado</strong>.
            </p>
        </div>
        <div id="turnstile"></div>
        <p class="vt-modal-fine" id="turnstileText" role="status"></p>
        <div class="vt-modal-actions">
            <button type="button" class="vt-btn vt-btn-ghost" data-close>Voltar</button>
            <button type="button" class="btn-primary vt-btn-confirm" id="confirmBtn" disabled>
                <span class="vt-spinner" aria-hidden="true"></span>
                <svg class="vt-i" aria-hidden="true"><use href="#i-check" /></svg>
                <span class="vt-btn-label">Confirmar voto</span>
            </button>
        </div>
    </div>
</div>

<!-- ═══ Modal: sucesso ═══ -->
<div class="vt-modal" id="modalSuccess" hidden>
    <div class="vt-modal-scrim" data-close></div>
    <div class="vt-modal-dialog vt-success" role="dialog" aria-modal="true" aria-labelledby="successTitle" aria-describedby="successDesc" tabindex="-1">
        <button type="button" class="vt-modal-close" data-close aria-label="Fechar">
            <svg class="vt-i" aria-hidden="true"><use href="#i-x" /></svg>
        </button>
        <img class="vt-success-mascot" id="successMascot" data-src="{{ asset('faisca-animation.webp') }}?v=6" alt="" width="180" height="180">
        <h2 class="vt-modal-title" id="successTitle">Voto registrado!</h2>
        <p class="vt-modal-text" id="successDesc"></p>
        <div class="vt-modal-actions vt-modal-actions--stack">
            <button type="button" class="btn-primary" id="successRanking" data-autofocus>
                <svg class="vt-i" aria-hidden="true"><use href="#i-award" /></svg>
                Ver no ranking
            </button>
            <a class="vt-btn vt-btn-ghost" id="successShare" href="#" target="_blank" rel="noopener">
                <svg class="vt-i" aria-hidden="true"><use href="#i-share" /></svg>
                Compartilhar no WhatsApp
            </a>
        </div>
    </div>
</div>
