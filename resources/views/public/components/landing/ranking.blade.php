<!-- ═══ Ranking ao vivo + votação ═══ -->
@props(['projects'])
<section class="section vt-ranking" id="ranking" aria-labelledby="rankingTitle">
    <div class="container">
        <div class="section-header reveal">
            <span class="section-badge">
                <span class="vt-live-dot vt-live-dot--light" aria-hidden="true"></span>
                <span id="rankBadgeLabel">Ao vivo</span>
            </span>
            <h2 class="section-title" id="rankingTitle">Ranking ao vivo</h2>
        </div>

        <div class="vt-rank-panel">
            <div class="vt-rank-controls" id="rankControls">
                <div class="vt-rank-toolbar">
                    <p class="vt-live-status" id="liveStatus">
                        <span class="vt-live-dot" aria-hidden="true"></span>
                        <strong id="liveLabel">Ao vivo</strong>
                        <span class="vt-live-sep" aria-hidden="true">·</span>
                        <span><b id="liveTotal">0</b> votos</span>
                        <span class="vt-live-sep" aria-hidden="true">·</span>
                        <span id="liveUpdated">atualizado agora</span>
                    </p>
                    <div class="vt-search vt-rank-search">
                        <label for="searchInput" class="vt-sr">Buscar projetos</label>
                        <svg class="vt-i vt-search-icon" aria-hidden="true"><use href="#i-search" /></svg>
                        <input type="search" id="searchInput" placeholder="Buscar projeto, aluno, escola ou cidade" autocomplete="off"
                            enterkeyhint="search">
                        <button type="button" class="vt-search-clear" id="searchClear" aria-label="Limpar busca" hidden>
                            <svg class="vt-i" aria-hidden="true"><use href="#i-x" /></svg>
                        </button>
                    </div>
                </div>
                <div class="vt-tabs" role="tablist" aria-label="Filtrar ranking por área" id="rankTabs"></div>
            </div>

            <div class="vt-rank-body" id="rankBody" wire:ignore role="tabpanel" aria-labelledby="tab-geral">
                <div class="vt-notice" id="rankNotice" hidden></div>
                <div class="vt-podium" id="podium"></div>
                <p class="vt-results" id="results" aria-live="polite"></p>
                <div class="vt-rank-head" aria-hidden="true">
                    <span>Pos.</span><span></span><span>Projeto</span><span></span><span>Votos</span><span></span>
                </div>
                <ol class="vt-rank-list" id="rankList">
                    @foreach ($projects as $project)
                        <li>{{ $project['name'] }}</li>
                    @endforeach
                </ol>
                <div class="vt-empty" id="rankEmpty" hidden>
                    <span class="vt-empty-icon"><svg class="vt-i" aria-hidden="true"><use href="#i-search" /></svg></span>
                    <h3 id="emptyTitle">Nenhum projeto encontrado</h3>
                    <p>Confira a grafia ou tente o nome de um aluno, da escola ou da cidade.</p>
                    <button type="button" class="vt-btn vt-btn-ghost" id="emptyReset">Limpar busca e filtros</button>
                </div>
                <p class="vt-rank-note" id="rankNote">
                    <svg class="vt-i" aria-hidden="true"><use href="#i-info" /></svg>
                    Não há posições compartilhadas: com o mesmo número de votos, fica à frente o projeto que vem antes na ordem alfabética.
                </p>
            </div>
        </div>

        <p class="vt-sr" aria-live="polite" id="rankAnnouncer"></p>
    </div>
</section>
