# PUB FILMS Landing Page

Landing page cinematográfica para a PUB FILMS, criada como site estático premium em HTML, CSS e JavaScript.

## Estrutura

- `index.html`: conteúdo e estrutura semântica da landing.
- `styles.css`: direção visual, responsividade, estados e animações.
- `app.js`: preloader, vídeos ambiente com lazy loading, Film Orbit 3D, menu mobile e reveal on scroll.

## Deploy no Cloudflare Pages

Configuração sugerida:

- Framework preset: None
- Build command: vazio
- Build output directory: `/`

Também é possível publicar diretamente com Wrangler:

```bash
wrangler pages deploy . --project-name pub-films-landing
```
