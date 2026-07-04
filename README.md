# PUB FILMS Landing Page

Landing page cinematografica para a PUB FILMS, criada como site estatico premium em HTML, CSS e JavaScript.

## Estrutura

- `index.html`: conteudo e estrutura semantica da landing.
- `styles.css`: direcao visual, responsividade, estados e animacoes.
- `app.js`: preloader, timecode, canvas procedural, menu mobile, reveal on scroll e modal de showreel.

## Deploy no Cloudflare Pages

Configuracao sugerida:

- Framework preset: None
- Build command: vazio
- Build output directory: `/`

Tambem e possivel publicar diretamente com Wrangler:

```bash
wrangler pages deploy . --project-name pub-films-landing
```

