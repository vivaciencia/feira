<!-- ═══ Navbar ═══ -->
<nav class="navbar vt-nav" id="navbar" aria-label="Principal">
    <div class="container">
        <div class="nav-links" id="navLinks">
            <a href="#ranking">Ranking</a>
            <a href="#como-votar">Como votar</a>
            <div class="vt-auth" id="authSlot">
                <button type="button" class="nav-cta" id="navLogin">
                    <svg class="vt-i" aria-hidden="true"><use href="#i-log-in" /></svg>
                    Entrar com Google
                </button>
                <div class="vt-user" id="navUser" hidden>
                    <span class="vt-avatar" id="navAvatar" aria-hidden="true">V</span>
                    <span class="vt-user-name" id="navUserName">Visitante</span>
                    <button type="button" class="vt-icon-btn" id="navLogout" aria-label="Sair da conta">
                        <svg class="vt-i" aria-hidden="true"><use href="#i-log-out" /></svg>
                    </button>
                </div>
            </div>
        </div>

        <button type="button" class="nav-toggle vt-nav-toggle" id="navToggle" aria-label="Abrir menu"
            aria-expanded="false" aria-controls="navLinks">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</nav>
