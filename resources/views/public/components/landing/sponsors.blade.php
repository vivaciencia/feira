@php
    $sponsors = [
        [
            'logo' => 'partners/ifto.png',
            'title' => 'IFTO — Instituto Federal do Tocantins',
            'alt' => 'IFTO — Instituto Federal do Tocantins',
        ],
        [
            'logo' => 'partners/tocantins.png',
            'title' => 'Governo do Tocantins',
            'alt' => 'Governo do Tocantins',
        ],
        [
            'logo' => 'partners/cnpq.png',
            'title' => 'CNPq — Conselho Nacional de Desenvolvimento Científico e Tecnológico',
            'alt' => 'CNPq',
        ],
        [
            'logo' => 'partners/fapt.png',
            'title' => 'FAPT — Fundação de Amparo à Pesquisa do Tocantins',
            'alt' => 'FAPT',
        ],
        [
            'logo' => 'partners/mec.png',
            'title' => 'MEC — Ministério da Educação',
            'alt' => 'MEC',
        ],
        [
            'logo' => 'partners/mcti.png',
            'title' => 'MCTI — Ministério da Ciência, Tecnologia e Inovações',
            'alt' => 'MCTI',
        ],
    ];

    $reversedSponsors = array_reverse($sponsors);
@endphp

<!-- ═══ Patrocinadores (carrossel infinito) ═══ -->
<section class="section sponsors-section" id="patrocinadores">
    <div class="container">
        <div class="section-header reveal">
            <span class="section-badge">
                <svg class="vt-i" aria-hidden="true"><use href="#i-heart" /></svg>
                Apoiadores & Parceiros
            </span>
            <h2 class="section-title">Patrocinadores Institucionais</h2>
            <p class="section-subtitle">
                Instituições e empresas que impulsionam o futuro da pesquisa científica no Tocantins.
            </p>
        </div>
    </div>

    <!-- Faixa 1: Realização e Órgãos Públicos de Pesquisa -->
    <div class="sponsor-carousel-row">
        <div class="sponsor-track">
            @for ($set = 0; $set < 4; $set++)
                @foreach ($sponsors as $sponsor)
                    <div class="sponsor-card" title="{{ $sponsor['title'] }}">
                        <img src="{{ asset($sponsor['logo']) }}" alt="{{ $sponsor['alt'] }}" loading="lazy">
                    </div>
                @endforeach
            @endfor
        </div>
    </div>

    <!-- Faixa 2: Sentido Inverso -->
    <div class="sponsor-carousel-row">
        <div class="sponsor-track reverse">
            @for ($set = 0; $set < 4; $set++)
                @foreach ($reversedSponsors as $sponsor)
                    <div class="sponsor-card" title="{{ $sponsor['title'] }}">
                        <img src="{{ asset($sponsor['logo']) }}" alt="{{ $sponsor['alt'] }}" loading="lazy">
                    </div>
                @endforeach
            @endfor
        </div>
    </div>
</section>
