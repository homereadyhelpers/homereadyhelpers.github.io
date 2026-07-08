// Cloudflare Worker backing this page — see worker/quote-worker.js and worker/DEPLOY.md
const QUOTE_API_URL = "https://homeready-quote-api.homereadyhelpers.workers.dev/";

const jobInput = document.getElementById('jobInput');
const charCount = document.getElementById('charCount');
const estimateBtn = document.getElementById('estimateBtn');
const errorBox = document.getElementById('estimateError');
const resultBox = document.getElementById('estimateResult');
const declineBox = document.getElementById('estimateDecline');

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
    const res = await fetch(QUOTE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
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

    renderQuote(data.quote);
  } catch (err) {
    showError(err.message || 'Network error — check your connection and try again.');
  } finally {
    estimateBtn.disabled = false;
    estimateBtn.classList.remove('loading');
  }
}

function renderQuote(quote) {
  if (!quote) {
    showError('Could not generate a quote from that description. Try rephrasing.');
    return;
  }

  if (quote.inScope === false) {
    document.getElementById('rDeclineReason').textContent =
      quote.declineReason || "That falls outside what HomeReady Helpers handles — give us a call and we'll point you in the right direction.";
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
