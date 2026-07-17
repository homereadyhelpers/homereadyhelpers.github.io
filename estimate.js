// Cloudflare Worker backing this page — see worker/quote-worker.js and worker/DEPLOY.md
const QUOTE_API_URL = "https://homeready-quote-api.homereadyhelpers.workers.dev/";

// ── Private preview lock: this page isn't public yet, so nothing below
// runs until the owner PIN is verified against the Worker (the PIN itself
// never ships in this file — only the Worker knows it). ──
(function initPinGate() {
  const gate = document.getElementById('pinGate');
  const form = document.getElementById('pinGateForm');
  const input = document.getElementById('pinGateInput');
  const error = document.getElementById('pinGateError');
  const submitBtn = document.getElementById('pinGateSubmit');

  if (localStorage.getItem('hr_owner_pin_ok') === '1') {
    gate.classList.add('unlocked');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.classList.remove('show');
    error.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking…';

    try {
      const res = await fetch(QUOTE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifyPin: input.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Incorrect PIN.');

      localStorage.setItem('hr_owner_pin_ok', '1');
      gate.classList.add('unlocked');
    } catch (err) {
      error.textContent = err.message || 'Incorrect PIN.';
      error.classList.add('show');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Unlock';
    }
  });
})();

// ── PWA: service worker + install tip ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

(function initInstallTip() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone || localStorage.getItem('hr_install_tip_dismissed') === '1') return;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const tip = document.getElementById('installTip');
  const tipText = document.getElementById('installTipText');
  if (!tip) return;

  tipText.textContent = isIOS
    ? 'Add this to your home screen: tap the Share icon, then "Add to Home Screen."'
    : 'Add this to your home screen for one-tap access — use your browser menu → "Install app" or "Add to Home Screen."';

  tip.classList.add('show');
  document.getElementById('installTipDismiss').addEventListener('click', () => {
    tip.classList.remove('show');
    localStorage.setItem('hr_install_tip_dismissed', '1');
  });
})();

const jobInput = document.getElementById('jobInput');
const charCount = document.getElementById('charCount');
const estimateBtn = document.getElementById('estimateBtn');
const errorBox = document.getElementById('estimateError');
const resultBox = document.getElementById('estimateResult');
const declineBox = document.getElementById('estimateDecline');
const addServicePrompt = document.getElementById('addServicePrompt');
const addServiceToggle = document.getElementById('addServiceToggle');
const addServiceForm = document.getElementById('addServiceForm');
const asError = document.getElementById('asError');
const asSubmit = document.getElementById('asSubmit');

let lastDescription = '';

function updateCharCount() {
  const len = jobInput.value.length;
  charCount.textContent = `${len} / 600`;
  charCount.classList.toggle('limit', len > 550);
}
jobInput.addEventListener('input', updateCharCount);
updateCharCount();

jobInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generateEstimate();
});
estimateBtn.addEventListener('click', generateEstimate);

function formatCurrency(n) {
  const num = Number(n);
  return '$' + (isNaN(num) ? '0' : num.toLocaleString());
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add('show');
}
function hideError() {
  errorBox.classList.remove('show');
  errorBox.textContent = '';
}
function hideResults() {
  resultBox.classList.remove('show');
  declineBox.classList.remove('show');
  addServicePrompt.hidden = true;
  addServiceForm.hidden = true;
}

async function requestQuote(body) {
  const res = await fetch(QUOTE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Got an unexpected response. Please try again.');
  }

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong generating that estimate.');
  }

  return data;
}

async function generateEstimate() {
  const description = jobInput.value.trim();
  if (!description) {
    showError('Tell us a bit about the job first.');
    return;
  }
  if (description.length < 3) {
    showError('Could you add a little more detail?');
    return;
  }

  hideError();
  hideResults();
  estimateBtn.disabled = true;
  estimateBtn.classList.add('loading');

  try {
    lastDescription = description;
    const data = await requestQuote({ description });
    renderQuote(data.quote);
  } catch (err) {
    showError(err.message || 'Network error — check your connection and try again.');
  } finally {
    estimateBtn.disabled = false;
    estimateBtn.classList.remove('loading');
  }
}

addServiceToggle.addEventListener('click', () => {
  addServiceForm.hidden = !addServiceForm.hidden;
});

addServiceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  asError.classList.remove('show');
  asError.textContent = '';

  const pin = document.getElementById('asPin').value;
  const label = document.getElementById('asLabel').value.trim();
  const hours = Number(document.getElementById('asHours').value);
  const price = Number(document.getElementById('asPrice').value);

  if (!pin || !label || !hours || !price) {
    asError.textContent = 'Fill in the PIN, service name, hours, and price.';
    asError.classList.add('show');
    return;
  }

  asSubmit.disabled = true;
  asSubmit.textContent = 'Saving…';

  try {
    const data = await requestQuote({
      description: lastDescription,
      addService: { pin, label, hours, price },
    });
    addServiceForm.reset();
    addServiceForm.hidden = true;
    renderQuote(data.quote);
  } catch (err) {
    asError.textContent = err.message || 'Could not save that service. Please try again.';
    asError.classList.add('show');
  } finally {
    asSubmit.disabled = false;
    asSubmit.textContent = 'Save & Get Estimate';
  }
});

function renderQuote(quote) {
  hideResults();

  if (!quote) {
    showError('Could not generate a quote from that description. Try rephrasing.');
    return;
  }

  if (quote.inScope === false) {
    document.getElementById('rDeclineReason').textContent =
      quote.declineReason || "That falls outside what HomeReady Helpers handles — give us a call and we'll point you in the right direction.";
    document.getElementById('rDeclineBadge').textContent =
      quote.declineType === 'unmatched' ? "Not on the Price List Yet" : 'Outside What We Handle';
    addServicePrompt.hidden = quote.declineType !== 'unmatched';
    declineBox.classList.add('show');
    declineBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  document.getElementById('rJobTitle').textContent = quote.jobTitle || 'Job Estimate';

  const lo = quote.estimateRange?.low ?? 0;
  const hi = quote.estimateRange?.high ?? lo;
  document.getElementById('rPrice').textContent =
    lo === hi ? formatCurrency(lo) : `${formatCurrency(lo)} – ${formatCurrency(hi)}`;

  const timeEl = document.getElementById('rTime');
  if (quote.timeEstimate) {
    timeEl.textContent = '⏱ ' + quote.timeEstimate;
    timeEl.style.display = '';
  } else {
    timeEl.style.display = 'none';
  }

  const container = document.getElementById('rLineItems');
  container.innerHTML = '';
  (quote.lineItems || []).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'estimate-line-item';
    const left = document.createElement('div');
    const label = document.createElement('div');
    label.className = 'estimate-line-label';
    label.textContent = item.label || '';
    left.appendChild(label);
    if (item.note) {
      const note = document.createElement('div');
      note.className = 'estimate-line-note';
      note.textContent = item.note;
      left.appendChild(note);
    }
    const amount = document.createElement('div');
    amount.className = 'estimate-line-amount';
    amount.textContent = item.amount || '';
    row.appendChild(left);
    row.appendChild(amount);
    container.appendChild(row);
  });

  const notesBox = document.getElementById('rNotesBox');
  if (quote.notes) {
    document.getElementById('rNotes').textContent = quote.notes;
    notesBox.style.display = '';
  } else {
    notesBox.style.display = 'none';
  }

  const planBox = document.getElementById('rPlanBox');
  if (quote.suggestPlan && quote.planSuggestion) {
    document.getElementById('rPlan').textContent = quote.planSuggestion;
    planBox.style.display = '';
  } else {
    planBox.style.display = 'none';
  }

  resultBox.classList.add('show');
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
