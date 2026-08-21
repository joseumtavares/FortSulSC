const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const navWrap = document.querySelector('.nav-wrap');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  mainNav.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  mainNav.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('resize', () => {
  if (window.innerWidth > 820) closeMenu();
});

let headerThreshold = navWrap.offsetTop + navWrap.offsetHeight;
window.addEventListener('scroll', () => {
  const shouldStick = window.scrollY > headerThreshold;
  navWrap.classList.toggle('is-sticky', shouldStick);
}, { passive: true });

const filters = document.querySelectorAll('.filter-button');
const cards = document.querySelectorAll('.solution-card');
const emptyMessage = document.querySelector('.filter-empty');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });

    const filter = button.dataset.filter;
    let visibleCards = 0;
    cards.forEach((card) => {
      const categories = card.dataset.category.split(' ');
      const visible = filter === 'todos' || categories.includes(filter);
      card.classList.toggle('is-hidden', !visible);
      if (visible) visibleCards += 1;
    });
    emptyMessage.hidden = visibleCards > 0;
  });
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.getElementById('year').textContent = new Date().getFullYear();
