// index page behavior: make entire card clickable and keyboard-activatable
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card[role="button"]');

  cards.forEach(card => {
    const link = card.querySelector('.card-link');
    const target = card.dataset.target || (link && link.getAttribute('href'));

    // click anywhere on the card
    card.addEventListener('click', (e) => {
      // ignore clicks on interactive children handled by browser
      if (e.target.tagName.toLowerCase() === 'a') return;
      if (target) window.location.href = target;
    });

    // keyboard activation (Enter or Space)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (target) window.location.href = target;
      }
    });

    // update aria-pressed on focus/blur for screen reader clarity
    card.addEventListener('focus', () => card.setAttribute('aria-pressed', 'true'));
    card.addEventListener('blur', () => card.setAttribute('aria-pressed', 'false'));
  });
});