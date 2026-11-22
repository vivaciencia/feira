<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'Votação Popular — VIVA Ciência 2026' }}</title>
    <meta name="description"
        content="Vote no projeto estudantil que mais te inspirou na VIVA Ciência 2026 e acompanhe o ranking ao vivo. Um voto por conta Google, com login Google.">
    <meta name="theme-color" content="#0a0e1a">

    <!-- Fonts (as mesmas do design system) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Exo:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet">

    <!-- Design system + extensões da votação -->
    <link rel="stylesheet" href="{{ asset('styles.css') }}">
    <link rel="stylesheet" href="{{ asset('votacao-ui-pro-max.css') }}">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js" defer></script>
    <script src="{{ asset('votacao-ui-pro-max.js') }}" defer></script>
    @vite('resources/js/app.js')
    @if (config('voting.turnstile_site_key'))
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" defer></script>
    @endif
</head>

<body class="vt-page">

    {{ $slot }}

    @stack('scripts')
</body>

</html>
