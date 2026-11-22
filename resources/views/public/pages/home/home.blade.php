<div id="votingApp" @class(['vt-display' => $display])>
    <script>window.VIVA_BOOT = @js($this->initialState);</script>
    <x-public::landing.sprite />

    <x-public::landing.header />

    <x-public::landing.hero />

    <main id="conteudo">
        <x-public::landing.ranking :projects="$this->initialState['projects']" />

        <x-public::landing.how-to-vote />

        <x-public::landing.sponsors />
    </main>

    <x-public::landing.footer />

    <x-public::landing.modals />
</div>
