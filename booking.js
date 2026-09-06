// ── BOOKING WIDGET ───────────────────────────────────────────
const Booking = (() => {
  let selectedService = null;
  let selectedDate = null; // 'YYYY-MM-DD'
  let selectedWindow = 'Morning (8am–12pm)';
  let viewYear, viewMonth;

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MAX_MONTHS_AHEAD = 3;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function toISO(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
  function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent); }

  function init() {
    if (!document.getElementById('bookingServiceGrid')) return;
    renderServiceGrid();
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();

    document.getElementById('calPrev').addEventListener('click', () => shiftMonth(-1));
    document.getElementById('calNext').addEventListener('click', () => shiftMonth(1));

    document.querySelectorAll('.window-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.window-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedWindow = btn.dataset.window;
      });
    });

    document.getElementById('bookingForm').addEventListener('submit', onSubmit);
  }

  function renderServiceGrid() {
    const grid = document.getElementById('bookingServiceGrid');
    grid.innerHTML = BOOKING_CONFIG.services.map(s => `
      <button type="button" class="booking-service-card" data-id="${s.id}">
        <div class="service-icon">${s.icon}</div>
        <div class="service-name">${s.name}</div>
        <div class="service-price">${s.price}</div>
        ${!s.bookable ? '<div class="booking-callfirst-tag">Call/Text to Schedule</div>' : ''}
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

    if (!service.bookable) {
      document.getElementById('callfirstServiceName').textContent = service.name;
      showPanel('booking-callfirst');
      return;
    }

    document.getElementById('bookingSelectedService').innerHTML =
      `<span class="service-icon">${service.icon}</span> ${service.name} <span class="booking-price-pill">${service.price}</span>`;
    selectedDate = null;
    renderCalendar();
    goToStep(2);
  }

  function backToServices() { goToStep(1); }

  function shiftMonth(dir) {
    const now = new Date();
    let m = viewMonth + dir, y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    const monthsFromNow = (y - now.getFullYear()) * 12 + (m - now.getMonth());
    if (monthsFromNow < 0 || monthsFromNow > MAX_MONTHS_AHEAD) return;
    viewMonth = m; viewYear = y;
    renderCalendar();
  }

  function renderCalendar() {
    document.getElementById('calMonthLabel').textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
    const grid = document.getElementById('calGrid');
    grid.innerHTML = '';

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const earliest = new Date(today);
    earliest.setDate(earliest.getDate() + BOOKING_CONFIG.leadDays);

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      grid.insertAdjacentHTML('beforeend', '<div class="cal-cell cal-empty"></div>');
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(viewYear, viewMonth, d);
      const iso = toISO(viewYear, viewMonth, d);
      const isPast = dateObj < earliest;
      const isClosed = BOOKING_CONFIG.closedWeekdays.includes(dateObj.getDay());
      const isBooked = BOOKING_CONFIG.bookedDates.includes(iso);
      const disabled = isPast || isClosed || isBooked;

      let cls = 'cal-cell';
      if (disabled) cls += ' cal-disabled';
      if (isBooked) cls += ' cal-booked';
      if (iso === selectedDate) cls += ' cal-selected';

      grid.insertAdjacentHTML('beforeend',
        `<button type="button" class="${cls}" data-date="${iso}" ${disabled ? 'disabled' : ''}>${d}</button>`);
    }

    grid.querySelectorAll('.cal-cell:not(.cal-empty):not(.cal-disabled)').forEach(cell => {
      cell.addEventListener('click', () => selectDate(cell.dataset.date));
    });

    const now = new Date();
    const monthsFromNow = (viewYear - now.getFullYear()) * 12 + (viewMonth - now.getMonth());
    document.getElementById('calPrev').disabled = monthsFromNow <= 0;
    document.getElementById('calNext').disabled = monthsFromNow >= MAX_MONTHS_AHEAD;
  }

  function selectDate(iso) {
    selectedDate = iso;
    renderCalendar();
    updateSummary();
    goToStep(3);
  }

  function updateSummary() {
    const d = new Date(selectedDate + 'T00:00:00');
    const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    document.getElementById('bookingSummary').innerHTML = `
      <div class="booking-summary-row"><strong>${selectedService.icon} ${selectedService.name}</strong></div>
      <div class="booking-summary-row">${label}</div>
    `;
  }

  function onSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('bkName').value.trim();
    const phone = document.getElementById('bkPhone').value.trim();
    const address = document.getElementById('bkAddress').value.trim();
    const notes = document.getElementById('bkNotes').value.trim();

    const d = new Date(selectedDate + 'T00:00:00');
    const dateLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const lines = [
      'New booking request:',
      `Service: ${selectedService.name}`,
      `Date: ${dateLabel}`,
      `Window: ${selectedWindow}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Address: ${address}`,
    ];
    if (notes) lines.push(`Notes: ${notes}`);

    const body = encodeURIComponent(lines.join('\n'));
    const sep = isIOS() ? '&' : '?';
    window.location.href = `sms:${BOOKING_CONFIG.phone}${sep}body=${body}`;

    showPanel('booking-confirm');
  }

  function goToStep(step) {
    showPanel('booking-step-' + step);
    document.querySelectorAll('.booking-step').forEach(el => {
      const n = Number(el.dataset.step);
      el.classList.toggle('active', n === step);
      el.classList.toggle('done', n < step);
    });
  }

  function showPanel(id) {
    document.querySelectorAll('.booking-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  function reset() {
    selectedService = null;
    selectedDate = null;
    document.getElementById('bookingForm').reset();
    goToStep(1);
  }

  document.addEventListener('DOMContentLoaded', init);

  return { goToStep, backToServices, reset };
})();
