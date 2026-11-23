const find = (selector, root = document) => root.querySelector(selector);
const all = (selector, root = document) => [...root.querySelectorAll(selector)];
const asset = (name) => '/assets/' + name;

const menu = find('#mobile-menu');
const toggle = find('.menu-toggle');

toggle.addEventListener('click', () => menu.showModal());
menu.addEventListener('click', (event) => {
  if (event.target === menu) menu.close();
  if (event.target.closest('[data-close-menu]')) {
    menu.close();
    find('#contato').focus({ preventScroll: true });
  }
});
const mobile = window.matchMedia('(max-width: 45rem)');
mobile.addEventListener('change', () => {
  if (!mobile.matches && menu.open) menu.close();
});

function getWorkPreference() {
  try {
    return sessionStorage.getItem('fair-work-preference') || '/trabalhos/';
  } catch {
    return '/trabalhos/';
  }
}

const backToWork = find('[data-back-to-work]');
if (backToWork) {
  const preference = getWorkPreference();
  if (preference.startsWith('/trabalhos/?')) backToWork.href = preference;
}

const toolbar = find('[data-toolbar]');
if (toolbar) {
  const grid = find('[data-work-grid]');
  const cards = all('.project-card', grid);
  const filters = all('[data-filter]', toolbar);
  const views = all('[data-view]', toolbar);
  const status = find('[data-result-count]');
  const initial = new URLSearchParams(location.search);
  let filter = filters.some((button) => button.dataset.filter === initial.get('tipo')) ? initial.get('tipo') : 'todos';
  let view = initial.get('ver') === 'lista' ? 'lista' : 'grade';

  function update(keepUrl = false) {
    let count = 0;
    for (const card of cards) {
      card.hidden = filter !== 'todos' && !card.dataset.categories.split(' ').includes(filter);
      if (!card.hidden) count += 1;
    }
    grid.classList.toggle('is-list', view === 'lista');
    for (const button of filters) button.setAttribute('aria-pressed', button.dataset.filter === filter);
    for (const button of views) button.setAttribute('aria-pressed', button.dataset.view === view);
    status.textContent = count === 1 ? '1 projeto encontrado' : count + ' projetos encontrados';

    const url = new URL(location.href);
    if (filter === 'todos') url.searchParams.delete('tipo');
    else url.searchParams.set('tipo', filter);
    if (view === 'grade') url.searchParams.delete('ver');
    else url.searchParams.set('ver', view);
    if (!keepUrl) history.replaceState(history.state, '', url);
    try {
      sessionStorage.setItem('fair-work-preference', url.pathname + url.search);
    } catch {
      // Browsing still works with session storage disabled.
    }
  }

  toolbar.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.filter) filter = button.dataset.filter;
    if (button.dataset.view) view = button.dataset.view;
    update();
  });
  toolbar.hidden = false;
  update(true);
}

for (const gallery of all('[data-gallery]')) {
  const groups = JSON.parse(find('[data-gallery-data]', gallery).textContent);
  const groupButtons = all('[data-gallery-group]', gallery);
  const thumbnails = find('[data-thumbnails]', gallery);
  const picture = find('[data-gallery-image]', gallery);
  const enlarge = find('[data-enlarge]', gallery);
  const description = find('[data-gallery-description]', gallery);
  const counter = find('[data-gallery-count]', gallery);
  const dialog = find('[data-lightbox]', gallery);
  const large = find('[data-lightbox-image]', gallery);
  const largeDescription = find('[data-lightbox-description]', gallery);
  let groupIndex = 0;
  let index = 0;

  function updateImage() {
    const images = groups[groupIndex].images;
    const [file, label] = images[index];
    picture.src = asset(file);
    picture.alt = label;
    description.textContent = label;
    counter.textContent = (index + 1) + ' / ' + images.length;
    enlarge.setAttribute('aria-label', 'Ampliar peça: ' + label);
    for (const button of thumbnails.children) {
      button.setAttribute('aria-pressed', Number(button.dataset.imageIndex) === index);
    }
    if (dialog.open) {
      large.src = asset(file);
      large.alt = label;
      largeDescription.textContent = label;
    }
  }

  function buildThumbnails() {
    thumbnails.replaceChildren(...groups[groupIndex].images.map(([file, label], position) => {
      const button = document.createElement('button');
      const thumb = document.createElement('img');
      button.type = 'button';
      button.dataset.imageIndex = position;
      button.setAttribute('aria-label', label);
      thumb.src = asset(file);
      thumb.loading = 'lazy';
      thumb.alt = '';
      button.append(thumb);
      return button;
    }));
    updateImage();
  }

  function step(direction) {
    const count = groups[groupIndex].images.length;
    index = (index + direction + count) % count;
    updateImage();
  }

  gallery.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-gallery-group')) {
      groupIndex = Number(button.dataset.galleryGroup);
      index = 0;
      for (const item of groupButtons) item.setAttribute('aria-pressed', item === button);
      buildThumbnails();
    }
    if (button.hasAttribute('data-image-index')) {
      index = Number(button.dataset.imageIndex);
      updateImage();
    }
    if (button.hasAttribute('data-gallery-step')) step(Number(button.dataset.galleryStep));
    if (button === enlarge) {
      dialog.showModal();
      updateImage();
    }
  });

  dialog.addEventListener('keydown', (event) => {
    const directions = { ArrowLeft: -1, ArrowRight: 1 };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    step(direction);
  });
  dialog.addEventListener('close', () => enlarge.focus({ preventScroll: true }));
  buildThumbnails();
}

for (const player of all('.film-player')) {
  const video = find('video', player);
  const play = find('.film-play', player);
  play.hidden = false;
  video.addEventListener('play', () => { play.hidden = true; });
  play.addEventListener('click', () => {
    video.play().then(() => video.focus({ preventScroll: true })).catch(() => {
      play.hidden = true;
      video.focus({ preventScroll: true });
    });
  });
}

const copyLink = find('[data-copy-link]');
if (copyLink && navigator.clipboard) {
  const feedback = find('[data-share-status]');
  const label = copyLink.firstChild;
  const original = label.textContent;
  let resetLabel;
  copyLink.hidden = false;
  copyLink.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.origin + location.pathname);
      feedback.textContent = 'Link copiado.';
    } catch {
      feedback.textContent = 'Não foi possível copiar o link. Use o endereço da página.';
    }
    label.textContent = feedback.textContent + ' ';
    clearTimeout(resetLabel);
    resetLabel = setTimeout(() => {
      label.textContent = original;
      feedback.textContent = '';
    }, 2800);
  });
}
