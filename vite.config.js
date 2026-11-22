import { defineConfig, lazyPlugins } from "vite-plus";
import { configDefaults } from "vite-plus/test/config";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, "vendor/**", "storage/**"],
    },
    staged: {
        "*": "vp check --fix",
    },
    fmt: {
        ignorePatterns: [
            "docs/**",
            "public/**",
            "storage/**",
            "vendor/**",
            "resources/views/**",
            "lang/**",
            "report.html",
            "composer.json",
            "boost.json",
            "proposta-votacao.md",
            "APROVADOS PARA MOSTRA DE PROJETOS.md",
            "extras/**",
        ],
    },
    lint: {
        ignorePatterns: [
            "docs/**",
            "public/**",
            "storage/**",
            "vendor/**",
            "resources/views/**",
            "lang/**",
            "report.html",
            "composer.json",
            "boost.json",
            "proposta-votacao.md",
            "APROVADOS PARA MOSTRA DE PROJETOS.md",
            "extras/**",
        ],
        jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
        rules: { "vite-plus/prefer-vite-plus-imports": "error" },
        options: { typeAware: true, typeCheck: true },
    },
    plugins: lazyPlugins(() => [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/js/app.js",
                "resources/css/filament/admin/theme.css",
            ],
            refresh: true,
        }),
        tailwindcss(),
    ]),
});
