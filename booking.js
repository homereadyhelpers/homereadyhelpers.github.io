// ── BOOKING WIDGET (Calendly-backed) ────────────────────────
const Booking = (() => {
  let selectedService = null;

  function init() {
    if (!document.getElementById('bookingServiceGrid')) return;
    renderServiceGrid();
  }

  function renderServiceGrid() {
    const grid = document.getElementById('bookingServiceGrid');
    grid.innerHTML = BOOKING_CONFIG.services.map(s => `
      <button type="button" class="booking-service-card" data-id="${s.id}">
        <div class="service-icon">${s.icon}</div>
        <div class="service-name">${s.name}</div>
        <div class="service-price">${s.price}</div>
        ${!s.calendlyUrl ? '<div class="booking-callfirst-tag">Call/Text to Schedule</div>' : ''}
      </button>
    `).join('');
    grid.querySelectorAll('.booking-service-card').forEach(card => {
      card.addEventListener('click', () => selectService(card.dataset.id));
    });
  }

  function selectService(id) {
    const service = BOOKING_CONFIG.services.find(s => s.id === id);
    if (!service) return;
    selectedService = service;

    if (!service.calendlyUrl) {
      document.getElementById('callfirstServiceName').textContent = service.name;
      showPanel('booking-callfirst');
      return;
    }

    document.getElementById('bookingSelectedService').innerHTML =
      `<span class="service-icon">${service.icon}</span> ${service.name} <span class="booking-price-pill">${service.price}</span>`;

    const noteEl = document.getElementById('bookingServiceNote');
    if (service.note) {
      noteEl.textContent = service.note;
      noteEl.hidden = false;
    } else {
      noteEl.hidden = true;
    }

    showPanel('booking-step-2');
    loadCalendlyWidget(service.calendlyUrl);
  }

  function loadCalendlyWidget(baseUrl) {
    const container = document.getElementById('calendlyEmbed');
    container.innerHTML = '';

    const params = new URLSearchParams(BOOKING_CONFIG.calendlyBrand);
    params.set('hide_event_type_details', '1');
    params.set('hide_gdpr_banner', '1');
    const url = `${baseUrl}?${params.toString()}`;

    if (window.Calendly) {
      window.Calendly.initInlineWidget({ url, parentElement: container });
    } else {
      // Calendly's widget script hasn't loaded yet (slow network) — retry briefly.
      let attempts = 0;
      const tryInit = setInterval(() => {
        attempts++;
        if (window.Calendly) {
          clearInterval(tryInit);
          window.Calendly.initInlineWidget({ url, parentElement: container });
        } else if (attempts > 20) {
          clearInterval(tryInit);
          container.innerHTML = `<p class="pricing-note">Scheduler is taking a moment to load. <a href="${url}" target="_blank" style="color:var(--green-light);text-decoration:underline;">Open it directly instead</a>.</p>`;
        }
      }, 250);
    }
  }

  function backToServices() { showPanel('booking-step-1'); }

  function showPanel(id) {
    document.querySelectorAll('.booking-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.booking-step').forEach(el => {
      const n = Number(el.dataset.step);
      const target = id === 'booking-step-2' ? 2 : 1;
      el.classList.toggle('active', n === target);
      el.classList.toggle('done', n < target);
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { backToServices };
})();
