const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const navWrap = document.querySelector('.nav-wrap');

if (menuButton && mainNav) {
  const menuLabel = menuButton.querySelector('.sr-only');

  function setMenuLabel(isOpen) {
    if (menuLabel) menuLabel.textContent = isOpen ? 'Fechar menu' : 'Abrir menu';
  }

  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    setMenuLabel(false);
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    mainNav.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
    setMenuLabel(!isOpen);
  });

  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  });
}

if (navWrap) {
  let headerThreshold = navWrap.offsetTop + navWrap.offsetHeight;

  function updateHeaderThreshold() {
    const wasSticky = navWrap.classList.contains('is-sticky');
    if (wasSticky) navWrap.classList.remove('is-sticky');
    headerThreshold = navWrap.offsetTop + navWrap.offsetHeight;
    if (wasSticky) navWrap.classList.add('is-sticky');
  }

  window.addEventListener('resize', updateHeaderThreshold);
  window.addEventListener('load', updateHeaderThreshold);

  window.addEventListener('scroll', () => {
    const shouldStick = window.scrollY > headerThreshold;
    navWrap.classList.toggle('is-sticky', shouldStick);
  }, { passive: true });
}

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
    if (emptyMessage) emptyMessage.hidden = visibleCards > 0;
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

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const whatsappDialog = document.getElementById('whatsapp-dialog');
const whatsappTriggers = document.querySelectorAll('[data-whatsapp-trigger]');
let whatsappTrigger = null;

if (whatsappDialog instanceof HTMLDialogElement) {
  const closeWhatsappDialog = whatsappDialog.querySelector('[data-whatsapp-close]');
  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getFocusableElements() {
    return [...whatsappDialog.querySelectorAll(focusableSelector)].filter((element) => !element.hasAttribute('hidden'));
  }

  function openWhatsappDialog(trigger) {
    whatsappTrigger = trigger;
    whatsappDialog.showModal();
    document.body.classList.add('dialog-open');
    closeWhatsappDialog.focus();
  }

  function closeDialog() {
    whatsappDialog.close();
  }

  whatsappTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openWhatsappDialog(trigger);
    });
  });

  closeWhatsappDialog.addEventListener('click', closeDialog);

  whatsappDialog.addEventListener('click', (event) => {
    if (event.target === whatsappDialog) closeDialog();
  });

  whatsappDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (!firstElement || !lastElement) return;

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  whatsappDialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    whatsappTrigger?.focus();
    whatsappTrigger = null;
  });
}
