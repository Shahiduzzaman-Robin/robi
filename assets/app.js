const counters = document.querySelectorAll('.counter');

function animateCounter(counter) {
  const target = Number(counter.dataset.target || 0);
  if (!target) return;

  const duration = 900;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.floor(target * eased).toString();
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = target.toString();
    }
  }

  requestAnimationFrame(tick);
}

counters.forEach((counter, index) => {
  setTimeout(() => animateCounter(counter), 120 * index);
});

const searchInput = document.getElementById('termSearch');
const noResultsPanel = document.getElementById('noResults');
const chips = Array.from(document.querySelectorAll('.chip'));
const backToTop = document.querySelector('.back-to-top');
let activeFilter = 'all';

function initBackToTop() {
  if (!backToTop) return;

  backToTop.addEventListener('click', (event) => {
    event.preventDefault();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  });
}

function attachSearch(cards) {
  if (!searchInput || cards.length === 0) return;

  function matchesChipFilter(card, filterValue) {
    if (filterValue === 'all') return true;

    const text = card.textContent.toLowerCase();
    const keywords = (card.dataset.keywords || '').toLowerCase();
    const source = card.dataset.sheet || '';
    const corpus = `${text} ${keywords}`;

    if (filterValue === 'sheet1') return source === '1';
    if (filterValue === 'sheet2') return source === '2';

    if (filterValue === 'recharge') {
      return /recharge|easyload|c2c|c2s|pos|deno|lifting|plb|dap/.test(corpus);
    }

    if (filterValue === 'systems') {
      return /crm|sfa|rdms|dobs|portal|dashboard|tracker|system/.test(corpus);
    }

    if (filterValue === 'finance') {
      return /roi|revenue|bank guarantee|bg|bep|commission|incentive/.test(corpus);
    }

    return true;
  }

  function filterCards() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const keywords = (card.dataset.keywords || '').toLowerCase();
      const queryMatch = !query || text.includes(query) || keywords.includes(query);
      const chipMatch = matchesChipFilter(card, activeFilter);
      const match = queryMatch && chipMatch;

      card.hidden = !match;
      if (match) visibleCount += 1;
    });

    if (noResultsPanel) {
      noResultsPanel.hidden = visibleCount !== 0;
    }
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter || 'all';
      chips.forEach((item) => item.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      filterCards();
    });
  });

  searchInput.addEventListener('input', filterCards);
  filterCards();
}

function init() {
  initBackToTop();

  const sheet1Grid = document.getElementById('sheet1Grid');
  const sheet2Section = document.getElementById('sheet2');
  const sheet2Grid = document.getElementById('sheet2Grid');

  if (sheet1Grid && sheet2Section && sheet2Grid) {
    while (sheet2Grid.firstElementChild) {
      sheet1Grid.appendChild(sheet2Grid.firstElementChild);
    }
    sheet2Section.remove();
  }

  const combinedCards = Array.from(document.querySelectorAll('.combined-term-grid .term-card'));
  if (combinedCards.length > 0) {
    attachSearch(combinedCards);
    return;
  }

  const termGrid = document.getElementById('termGrid');
  if (!termGrid) return;

  const cards = Array.from(termGrid.querySelectorAll('.term-card'));
  attachSearch(cards);
}

init();
