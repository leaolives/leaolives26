(() => {
  const cards = document.querySelectorAll('[data-match-start]');
  const formatDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });

  function updateMatchStatuses() {
    const now = new Date();
    cards.forEach((card) => {
      const start = new Date(card.dataset.matchStart);
      const duration = Number(card.dataset.matchDuration || 100);
      const end = new Date(start.getTime() + duration * 60 * 1000);
      const status = card.querySelector('.match-status');
      const date = card.querySelector('.match-date');
      const time = card.querySelector('.match-time');
      if (!status || Number.isNaN(start.getTime())) return;

      if (date) {
        const formatted = formatDate.format(start);
        date.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(',', ' •');
      }
      if (time) {
        time.textContent = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
      }

      status.classList.remove('status-upcoming', 'status-live', 'status-ended');
      if (now < start) {
        status.textContent = 'EM BREVE';
        status.classList.add('status-upcoming');
        card.dataset.matchStatus = 'upcoming';
      } else if (now < end) {
        status.textContent = 'AO VIVO';
        status.classList.add('status-live');
        card.dataset.matchStatus = 'live';
      } else {
        status.textContent = 'ENCERRADO';
        status.classList.add('status-ended');
        card.dataset.matchStatus = 'ended';
      }
    });
  }

  updateMatchStatuses();
  window.setInterval(updateMatchStatuses, 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateMatchStatuses();
  });
})();
