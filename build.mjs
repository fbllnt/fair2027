import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { filters, projects } from './projects.mjs';

const email = 'hello@fair.com.ag';
const lead = projects[0];
const asset = (name) => '/assets/' + name;
const projectUrl = (project) => '/trabalhos/' + project.id + '/';
const plus = '<span class="plus" aria-hidden="true"></span>';
const img = (name, alt, attrs = '') => `<img src="${asset(name)}" alt="${alt}" ${attrs}>`;
const logo = (theme = '') => img('logo-fair.png', 'FAIR Creativity Shop', `class="logo ${theme}" width="513" height="134"`);

function nav(section) {
  return `<header class="site-header">
    <div class="shell header-inner">
      <a class="brand" href="/" aria-label="FAIR Creativity Shop, início">${logo()}</a>
      <nav class="desktop-nav" aria-label="Navegação principal">
        <a href="/trabalhos/" ${section === 'work' ? 'aria-current="page"' : ''}>Trabalhos</a>
        <a href="/sobre/" ${section === 'about' ? 'aria-current="page"' : ''}>Sobre</a>
        <a href="#contato" class="nav-contact">Contato ${plus}</a>
      </nav>
      <button class="menu-toggle" type="button" aria-haspopup="dialog" aria-controls="mobile-menu">Menu ${plus}</button>
    </div>
  </header>
  <dialog id="mobile-menu" class="mobile-menu" aria-labelledby="menu-title">
    <div class="menu-sheet">
      <div class="menu-top"><strong id="menu-title">Menu</strong><form method="dialog"><button class="plain-button" aria-label="Fechar menu">Fechar <span aria-hidden="true">×</span></button></form></div>
      <nav aria-label="Navegação móvel">
        <a href="/">Início</a>
        <a href="/trabalhos/" ${section === 'work' ? 'aria-current="page"' : ''}>Trabalhos</a>
        <a href="/sobre/" ${section === 'about' ? 'aria-current="page"' : ''}>Sobre</a>
        <a href="#contato" data-close-menu>Contato</a>
      </nav>
    </div>
  </dialog>`;
}

function footer() {
  return `<footer class="site-footer" id="contato" tabindex="-1">
    <div class="shell">
      <div class="footer-top">
        <span class="overline">São Paulo, Brasil</span>
        <a class="footer-title" href="mailto:${email}">Vamos<br>conversar? ${plus}</a>
        <a class="footer-email" href="mailto:${email}">${email}</a>
      </div>
      <div class="footer-bottom"><a class="brand" href="/" aria-label="FAIR Creativity Shop, início">${logo('is-light')}</a><span>FAIR Creativity Shop</span><a href="#top">Voltar ao topo</a></div>
    </div>
  </footer>`;
}

function page({ title, description, section, body, cover, preload }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#f5f3ed">
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  ${cover ? `<meta property="og:image" content="${asset(cover)}">` : ''}
  <title>${title}</title>
  <link rel="icon" href="/assets/favicon.png" type="image/png">
  <link rel="preload" href="/assets/space-grotesk.woff2" as="font" type="font/woff2" crossorigin>
  ${preload ? `<link rel="preload" as="image" href="${asset(preload)}">` : ''}
  <link rel="stylesheet" href="/styles.css">
  <script src="/app.js" defer></script>
</head>
<body id="top">
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  ${nav(section)}
  <main id="conteudo">${body}</main>
  ${footer()}
</body>
</html>`;
}

function card(project, { featured = false, heading = "h3" } = {}) {
  const loading = featured ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<article class="project-card${featured ? ' is-featured' : ''}" data-categories="${project.categories.join(' ')}" style="--project-color:${project.color}">
    <a class="card-link" href="${projectUrl(project)}" aria-label="Ver projeto ${project.title}">
      <div class="card-image">${img(project.cover, project.coverAlt, loading)}${featured ? `<span class="featured-label overline">${project.title} ${plus}</span>` : ''}</div>
      <div class="card-caption">
        <div><p class="client overline">${project.client}</p><${heading} class="card-title">${project.title}</${heading}></div>
        <p class="card-type">${project.type}</p><span class="card-action" aria-hidden="true">${plus}</span>
      </div>
    </a>
  </article>`;
}

function home() {
  return page({ title: 'FAIR Creativity Shop', description: 'Agência criativa independente de São Paulo. Explore os trabalhos da FAIR Creativity Shop.', cover: lead.cover, preload: lead.cover, body: `
    <section class="home-intro shell" aria-labelledby="home-title">
      <p class="overline intro-label"><span class="accent-square"></span> Agência independente</p>
      <div class="intro-grid">
        <h1 id="home-title">Ideias em cena<span class="period">.</span></h1>
        <div class="intro-note">
          <p>Campanhas, conteúdo e experiências para marcas que querem fazer parte da conversa.</p>
          <a class="text-link" href="/trabalhos/">Explorar trabalhos ${plus}</a>
        </div>
      </div>
    </section>
    <section class="shell home-feature" aria-label="Projeto em destaque">${card(lead, { featured: true, heading: "h2" })}</section>
    <section class="shell home-work" aria-labelledby="selected-title">
      <div class="section-heading"><h2 id="selected-title">Trabalhos<br>selecionados<span class="period">.</span></h2><a class="text-link" href="/trabalhos/">Ver todos os trabalhos ${plus}</a></div>
      <div class="home-grid">${projects.slice(1).map((project) => card(project)).join('')}</div>
    </section>
    <section class="home-about shell" aria-labelledby="home-about-title">
      <div class="about-panel">
        <p class="overline">Sobre a FAIR</p>
        <h2 id="home-about-title">Uma casa<br>de ideias.</h2>
        <div><p>Estratégia e criação do primeiro insight à peça que chega na rua.</p><a class="text-link" href="/sobre/">Conheça a FAIR ${plus}</a></div>
      </div>
    </section>` });
}

function work() {
  return page({ title: 'Trabalhos | FAIR Creativity Shop', description: 'Campanhas, ativações e projetos digitais da FAIR Creativity Shop.', section: 'work', cover: lead.cover, body: `
    <section class="shell work-page" aria-labelledby="work-title">
      <div class="page-heading"><p class="overline"><span class="accent-square"></span> Portfólio</p><h1 id="work-title">Trabalhos<span class="period">.</span></h1></div>
      <div class="work-toolbar" data-toolbar hidden>
        <div class="filters" role="group" aria-label="Filtrar por tipo de projeto">${filters.map(([id, label]) => `<button type="button" data-filter="${id}" aria-pressed="${id === 'todos'}">${label}</button>`).join('')}</div>
        <div class="view-options" role="group" aria-label="Visualização dos trabalhos">
          <button type="button" data-view="grade" aria-pressed="true"><i class="grid-icon" aria-hidden="true"></i>Grade</button>
          <button type="button" data-view="lista" aria-pressed="false"><i class="list-icon" aria-hidden="true"></i>Lista</button>
        </div>
      </div>
      <p class="sr-only" role="status" data-result-count></p>
      <div class="work-grid" data-work-grid>${projects.map((project) => card(project, { heading: "h2" })).join('')}</div>
    </section>` });
}

function gallery(groups) {
  if (!groups) return '';
  const first = groups[0].images[0];
  return `<section class="case-gallery shell" aria-labelledby="gallery-title" data-gallery>
    <div class="section-heading"><h2 id="gallery-title">Desdobramentos<span class="period">.</span></h2>
      ${groups.length > 1 ? `<div class="gallery-groups" role="group" aria-label="Tipos de peça">${groups.map((group, i) => `<button type="button" data-gallery-group="${i}" aria-pressed="${i === 0}">${group.label}</button>`).join('')}</div>` : ''}
    </div>
    <figure class="gallery-figure">
      <button type="button" class="gallery-image" data-enlarge aria-label="Ampliar peça">${img(first[0], first[1], 'loading="lazy" data-gallery-image')}</button>
      <figcaption class="gallery-caption">
        <p data-gallery-description aria-live="polite">${first[1]}</p>
        <div class="gallery-controls"><span class="counter" data-gallery-count aria-label="Posição na galeria"></span><button data-gallery-step="-1" type="button" class="gallery-prev" aria-label="Peça anterior"><span class="chevron"></span></button><button data-gallery-step="1" type="button" aria-label="Próxima peça"><span class="chevron"></span></button></div>
      </figcaption>
    </figure>
    <div class="thumbnails" role="group" aria-label="Selecionar peça" data-thumbnails></div>
    <dialog class="lightbox" aria-label="Peça ampliada" data-lightbox>
      <div class="lightbox-inner">
        <form method="dialog"><button type="submit" class="plain-button" aria-label="Fechar imagem ampliada">Fechar <span aria-hidden="true">×</span></button></form>
        <img alt="" data-lightbox-image>
        <div class="lightbox-controls"><button type="button" data-gallery-step="-1">Anterior</button><p data-lightbox-description aria-live="polite"></p><button type="button" data-gallery-step="1">Próxima</button></div>
      </div>
    </dialog>
    <script type="application/json" data-gallery-data>${JSON.stringify(groups)}</script>
  </section>`;
}

function film(project) {
  if (!project.video) return '';
  return `<section class="case-film shell" aria-labelledby="film-title">
    <div class="film-heading"><h2 id="film-title">${project.videoTitle}</h2><span class="overline">Filme</span></div>
    <div class="film-player">
      <video controls playsinline preload="none" poster="${asset(project.poster)}" aria-label="${project.videoTitle}">
        <source src="${asset(project.video)}" type="video/mp4">
        ${project.captions ? `<track kind="captions" src="${asset(project.captions)}" srclang="pt" label="Português">` : ''}
        <a href="${asset(project.video)}">Assistir ao filme</a>
      </video>
      <button class="film-play" type="button" aria-label="Assistir ao filme" hidden><span aria-hidden="true"></span> Assistir ao filme</button>
    </div>
  </section>`;
}

function casePage(project, i) {
  const next = projects[(i + 1) % projects.length];
  return page({ title: project.title + ' | FAIR Creativity Shop', description: project.summary, section: 'work', cover: project.cover, preload: project.cover, body: `
    <article class="case-page">
      <div class="shell case-head">
        <a class="back-link" href="/trabalhos/" data-back-to-work><span class="chevron" aria-hidden="true"></span> Todos os trabalhos</a>
        <div class="case-heading">
          <div><p class="client overline"><span class="accent-square"></span> ${project.client}</p><h1>${project.title}</h1></div>
          <div class="case-type"><p>${project.type}</p>${project.year ? `<span>${project.year}</span>` : ''}</div>
        </div>
        <div class="case-cover" style="--project-color:${project.color}">${img(project.cover, project.coverAlt, 'fetchpriority="high"')}</div>
      </div>
      <section class="case-context shell" aria-labelledby="context-title">
        <span class="overline">A ideia</span><div><h2 id="context-title">${project.headline}</h2><p>${project.summary}</p><p>${project.story}</p></div>
      </section>
      ${film(project)}
      ${gallery(project.gallery)}
      <section class="case-credits shell" aria-labelledby="credits-title">
        <h2 class="overline" id="credits-title">Ficha técnica</h2>
        <dl>${project.credits.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join('')}</dl>
        <div class="case-actions">${project.external ? `<a class="text-link" href="${project.external[1]}" target="_blank" rel="noopener">${project.external[0]} ${plus}</a>` : ''}<button class="text-link share-button" type="button" data-copy-link hidden>Copiar link do projeto ${plus}</button><span class="sr-only" data-share-status role="status"></span></div>
      </section>
      <section class="next-project shell" aria-label="Próximo projeto">
        <a href="${projectUrl(next)}">
          <div><span class="overline">Próximo projeto</span><strong>${next.title}</strong></div>
          <span class="next-image">${img(next.cover, '', 'loading="lazy"')}</span>
          <span class="card-action" aria-hidden="true">${plus}</span>
        </a>
      </section>
    </article>` });
}

function about() {
  return page({ title: 'Sobre | FAIR Creativity Shop', description: 'Conheça a FAIR Creativity Shop, agência criativa independente de São Paulo.', section: 'about', body: `
    <section class="shell about-page" aria-labelledby="about-title">
      <div class="page-heading"><p class="overline"><span class="accent-square"></span> Sobre a FAIR</p><h1 id="about-title">Uma casa<br>de ideias<span class="period">.</span></h1></div>
      <div class="about-intro">
        <p class="overline">FAIR Creativity Shop</p>
        <div><h2>Criação independente, de São Paulo.</h2><p>A FAIR começou em 2020, fundada pelo diretor de criação Juliano Ribas. Trabalhamos com marcas para transformar estratégia em campanhas, conteúdo e experiências que encontram as pessoas na rua, na tela e ao vivo.</p><a href="/trabalhos/" class="text-link">Conheça os trabalhos ${plus}</a></div>
      </div>
      <div class="clients">
        <h2>Algumas marcas com quem trabalhamos<span class="period">.</span></h2>
        <ul>${['Agibank', 'Athletico Paranaense', 'Beep Saúde', 'Hinode', 'InfinitePay', 'Ligga Telecom', 'MetLife', 'Midea', 'Stone'].map((name) => `<li>${name}</li>`).join('')}</ul>
      </div>
    </section>` });
}

const pages = [
  ['index.html', home()],
  ['trabalhos/index.html', work()],
  ['sobre/index.html', about()],
  ...projects.map((project, i) => [projectUrl(project).slice(1) + 'index.html', casePage(project, i)]),
];

for (const [path, html] of pages) {
  const output = join('dist', path);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
}
