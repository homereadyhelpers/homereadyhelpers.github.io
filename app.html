<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
<title>HomeReady Helpers – Quote Generator</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --green: #22c55e;
    --green-dark: #16a34a;
    --green-light: #dcfce7;
    --black: #0f1010;
    --gray: #6b7280;
    --light: #f4f4f2;
    --white: #ffffff;
    --border: #e2e8f0;
    --shadow: 0 4px 24px rgba(0,0,0,0.09);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--light);
    color: var(--black);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* HEADER */
  .header {
    background: var(--black);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 3px solid var(--green);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .header-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: var(--green);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }
  .header-title { color: #fff; font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 800; line-height: 1.2; }
  .header-sub { color: var(--green); font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

  /* MAIN */
  .main { max-width: 660px; margin: 0 auto; padding: 20px 16px 80px; }

  /* CARD */
  .card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 18px;
    box-shadow: var(--shadow);
  }
  .card-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--gray); margin-bottom: 10px;
  }

  /* TEXTAREA */
  textarea {
    width: 100%; padding: 14px; border-radius: 12px;
    border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif;
    font-size: 15px; line-height: 1.7; color: var(--black);
    background: #fafafa; resize: vertical; outline: none;
    transition: border-color 0.2s;
    -webkit-appearance: none;
  }
  textarea:focus { border-color: var(--green); background: #fff; }

  /* BUTTON */
  .btn {
    display: block; width: 100%; padding: 15px 20px;
    background: var(--black); color: #fff;
    border: 2px solid var(--green); border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700;
    cursor: pointer; text-align: center; margin-top: 12px;
    transition: all 0.2s; -webkit-appearance: none;
    letter-spacing: 0.3px;
  }
  .btn:active { transform: scale(0.98); background: #1a1a1a; }
  .btn:disabled { background: #ccc; border-color: #ccc; cursor: not-allowed; transform: none; }

  /* LOADING */
  .spinner {
    display: inline-block; width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
    border-radius: 50%; animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ERROR */
  .error-box {
    background: #fef2f2; border: 1px solid #fca5a5; border-radius: 12px;
    padding: 14px 16px; color: #b91c1c; font-size: 14px;
    margin-bottom: 16px; display: none;
  }
  .error-box.show { display: block; }
  .debug-info { font-size: 11px; color: #9b1c1c; margin-top: 6px; font-family: monospace; word-break: break-all; display: none; }
  .debug-info.show { display: block; }

  /* RESULT CARD */
  .result-card {
    background: var(--white); border: 2px solid var(--green);
    border-radius: 16px; overflow: hidden; margin-bottom: 20px;
    box-shadow: 0 4px 30px rgba(34,197,94,0.15); display: none;
  }
  .result-card.show { display: block; }
  .result-header {
    background: var(--black); padding: 18px 20px;
  }
  .result-badge {
    display: inline-block; font-size: 10px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--green); margin-bottom: 5px;
  }
  .result-title {
    font-family: 'Playfair Display', serif; font-size: 19px;
    font-weight: 800; color: #fff; margin-bottom: 12px;
  }
  .result-pills { display: flex; gap: 10px; flex-wrap: wrap; }
  .pill-price {
    background: var(--green); color: #fff; border-radius: 10px;
    padding: 8px 16px; font-size: 16px; font-weight: 700;
  }
  .pill-time {
    background: #2a2a2a; color: #ddd; border-radius: 10px;
    padding: 8px 16px; font-size: 14px;
  }

  /* LINE ITEMS */
  .result-body { padding: 18px 20px; }
  .line-item {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 11px 0; border-bottom: 1px solid #f0f0f0; gap: 12px;
  }
  .line-item:last-child { border-bottom: none; }
  .line-label { font-size: 14px; color: var(--black); }
  .line-note { font-size: 12px; color: var(--gray); margin-top: 2px; }
  .line-amount { font-size: 14px; font-weight: 700; color: #166534; white-space: nowrap; }

  /* NOTES */
  .notes-box {
    background: var(--green-light); border-left: 3px solid var(--green);
    border-radius: 0 10px 10px 0; padding: 13px 15px; margin-top: 16px;
  }
  .notes-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #166534; margin-bottom: 5px; }
  .notes-text { font-size: 14px; color: #166534; line-height: 1.7; }

  /* PLAN SUGGESTION */
  .plan-box {
    background: #fffbeb; border: 1px solid #fde68a;
    border-radius: 10px; padding: 13px 15px; margin-top: 12px;
  }
  .plan-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #92400e; margin-bottom: 5px; }
  .plan-text { font-size: 13px; color: #78350f; line-height: 1.6; }

  /* MATERIALS NOTE */
  .materials-note {
    background: #f8f8f8; border-radius: 8px; padding: 9px 13px;
    font-size: 12px; color: var(--gray); margin-top: 12px;
  }

  /* HISTORY */
  .history-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--gray); margin-bottom: 10px;
  }
  .history-item {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 15px; margin-bottom: 8px;
    cursor: pointer; display: flex; justify-content: space-between;
    align-items: center; gap: 8px; transition: border-color 0.2s;
    -webkit-tap-highlight-color: rgba(34,197,94,0.1);
  }
  .history-item:active { border-color: var(--green); background: #f9fff9; }
  .history-name { font-size: 13px; color: #444; }
  .history-price { font-size: 13px; font-weight: 700; color: #166534; white-space: nowrap; }

  /* HINT */
  .hint { font-size: 12px; color: var(--gray); margin-top: 8px; }

  /* SAFE AREA (iPhone notch etc) */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .main { padding-bottom: calc(80px + env(safe-area-inset-bottom)); }
  }
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div class="header-icon">🔧</div>
  <div>
    <div class="header-title">HomeReady Helpers</div>
    <div class="header-sub">✝️ Christian &amp; Veteran Owned · Quote Generator</div>
  </div>
</div>

<!-- MAIN -->
<div class="main">

  <!-- INPUT CARD -->
  <div class="card">
    <div class="card-label">Describe the Job</div>
    <textarea id="jobInput" rows="4"
      placeholder="e.g. Customer needs a ceiling fan installed in the master bedroom, old fan removed, and a bathroom faucet replaced. About 20 min drive away."></textarea>
    <div class="hint">Tip: Include sq footage, room count, or any details that affect complexity.</div>
    <button class="btn" id="generateBtn" onclick="generateQuote()">
      Generate Quote →
    </button>
  </div>

  <!-- ERROR BOX -->
  <div class="error-box" id="errorBox">
    <strong>⚠️ Error</strong> — <span id="errorMsg"></span>
    <div class="debug-info" id="debugInfo"></div>
  </div>

  <!-- RESULT CARD -->
  <div class="result-card" id="resultCard">
    <div class="result-header">
      <div class="result-badge">✓ Estimate Ready</div>
      <div class="result-title" id="rJobTitle"></div>
      <div class="result-pills">
        <div class="pill-price" id="rPrice"></div>
        <div class="pill-time" id="rTime"></div>
      </div>
    </div>
    <div class="result-body">
      <div class="card-label">Breakdown</div>
      <div id="rLineItems"></div>
      <div class="notes-box" id="rNotesBox" style="display:none">
        <div class="notes-label">Notes</div>
        <div class="notes-text" id="rNotes"></div>
      </div>
      <div class="plan-box" id="rPlanBox" style="display:none">
        <div class="plan-label">💡 Subscription Opportunity</div>
        <div class="plan-text" id="rPlan"></div>
      </div>
      <div class="materials-note">
        📦 <strong>Customer provides all materials</strong> unless on a plan with a material allowance.
      </div>
    </div>
  </div>

  <!-- HISTORY -->
  <div id="historySection" style="display:none">
    <div class="history-label">Recent Quotes</div>
    <div id="historyList"></div>
  </div>

</div>

<script>
const SYSTEM_PROMPT = `You are the pricing engine for HomeReady Helpers LLC, a Christian and veteran-owned solo handyman business in North Alabama. Owner is Andrew. Generate honest, fair job quotes.

BUSINESS: $88/hr labor rate. $125 minimum service call. Customer always provides all materials.

SERVICE PRICING (labor only):
- Drywall patch: $75 small / $265 large or multiple
- Fixture install (light, fan, faucet): $125–$360
- Interior painting: $180 single room / $1,400 multiple rooms
- Flooring install: $360–$530
- Appliance install: $270
- Dryer vent cleaning: $125
- TV mount: $175
- Furniture assembly: $180–$360
- Toilet wax seal: $135
- Eaves/exterior lights: $125–$225

BACKSPLASH (labor only):
- Standard tile: $125 base + $8/sqft
- Glass/mosaic: $150 base + $10/sqft
- Herringbone/complex: $175 base + $12/sqft
- Demo add-on: $75–$150
- Backer board add-on: $75

PLANS: Basic $99/mo (1hr), Standard $149/mo (1.5hr + $30 materials), Premium $199/mo (2hr + $60 materials). Overage $88/hr.

RULES: Never quote below $125. Round to nearest $5. For multi-task jobs, add them together.

RESPOND ONLY WITH THIS EXACT JSON — no markdown, no explanation, nothing else:
{"jobTitle":"string","estimateRange":{"low":0,"high":0},"lineItems":[{"label":"string","amount":"string","note":"string"}],"timeEstimate":"string","notes":"string","suggestPlan":false,"planSuggestion":"string"}`;

let quoteHistory = [];

async function generateQuote() {
  const input = document.getElementById('jobInput').value.trim();
  if (!input) return;

  const btn = document.getElementById('generateBtn');
  const errorBox = document.getElementById('errorBox');
  const debugInfo = document.getElementById('debugInfo');
  const resultCard = document.getElementById('resultCard');

  // Reset state
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Pricing your job...';
  errorBox.classList.remove('show');
  debugInfo.classList.remove('show');
  resultCard.classList.remove('show');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: input }]
      })
    });

    const data = await response.json();

    // Check for API-level errors
    if (data.error) {
      showError('API error: ' + data.error.message, JSON.stringify(data));
      return;
    }

    // Extract text content
    const textBlock = (data.content || []).find(b => b.type === 'text');
    if (!textBlock || !textBlock.text) {
      showError('No text response from API.', JSON.stringify(data));
      return;
    }

    // Clean and parse JSON
    let raw = textBlock.text.trim();
    // Strip any markdown fences if present
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    // Find the JSON object in case there's surrounding text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      showError('Could not find JSON in response.', raw.substring(0, 300));
      return;
    }

    const quote = JSON.parse(jsonMatch[0]);
    renderQuote(quote, input);

  } catch (err) {
    if (err instanceof SyntaxError) {
      showError('Got a response but could not parse it as JSON.', err.message);
    } else {
      showError('Network error — check your connection and try again.', err.message);
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Generate Quote →';
  }
}

function showError(msg, debug) {
  const errorBox = document.getElementById('errorBox');
  const debugInfo = document.getElementById('debugInfo');
  document.getElementById('errorMsg').textContent = msg;
  errorBox.classList.add('show');
  if (debug) {
    debugInfo.textContent = debug;
    debugInfo.classList.add('show');
  }
}

function formatCurrency(n) {
  return '$' + Number(n).toLocaleString();
}

function renderQuote(q, inputText) {
  // Title
  document.getElementById('rJobTitle').textContent = q.jobTitle || 'Job Estimate';

  // Price range
  const lo = q.estimateRange?.low || 0;
  const hi = q.estimateRange?.high || 0;
  document.getElementById('rPrice').textContent = lo === hi
    ? formatCurrency(lo)
    : formatCurrency(lo) + ' – ' + formatCurrency(hi);

  // Time
  const timeEl = document.getElementById('rTime');
  if (q.timeEstimate) {
    timeEl.textContent = '⏱ ' + q.timeEstimate;
    timeEl.style.display = '';
  } else {
    timeEl.style.display = 'none';
  }

  // Line items
  const container = document.getElementById('rLineItems');
  container.innerHTML = '';
  (q.lineItems || []).forEach(item => {
    const div = document.createElement('div');
    div.className = 'line-item';
    div.innerHTML = `
      <div>
        <div class="line-label">${item.label || ''}</div>
        ${item.note ? `<div class="line-note">${item.note}</div>` : ''}
      </div>
      <div class="line-amount">${item.amount || ''}</div>
    `;
    container.appendChild(div);
  });

  // Notes
  const notesBox = document.getElementById('rNotesBox');
  if (q.notes) {
    document.getElementById('rNotes').textContent = q.notes;
    notesBox.style.display = '';
  } else {
    notesBox.style.display = 'none';
  }

  // Plan suggestion
  const planBox = document.getElementById('rPlanBox');
  if (q.suggestPlan && q.planSuggestion) {
    document.getElementById('rPlan').textContent = q.planSuggestion;
    planBox.style.display = '';
  } else {
    planBox.style.display = 'none';
  }

  // Show result
  document.getElementById('resultCard').classList.add('show');
  document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Save to history
  quoteHistory.unshift({ title: q.jobTitle, price: lo === hi ? formatCurrency(lo) : formatCurrency(lo) + '–' + formatCurrency(hi), input: inputText, quote: q });
  if (quoteHistory.length > 8) quoteHistory.pop();
  renderHistory();
}

function renderHistory() {
  const section = document.getElementById('historySection');
  const list = document.getElementById('historyList');
  if (quoteHistory.length < 2) { section.style.display = 'none'; return; }
  section.style.display = '';
  list.innerHTML = '';
  quoteHistory.slice(1).forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `<span class="history-name">${item.title}</span><span class="history-price">${item.price}</span>`;
    div.onclick = () => {
      document.getElementById('jobInput').value = item.input;
      renderQuote(item.quote, item.input);
    };
    list.appendChild(div);
  });
}

// Allow Enter key (Ctrl/Cmd+Enter) to submit
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generateQuote();
});
</script>
</body>
</html>
