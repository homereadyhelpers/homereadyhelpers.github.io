/**
 * HomeReady Helpers — AI Quote Generator backend.
 *
 * Architecture: the AI never states a dollar amount. Phase 1 (classify) matches
 * the customer's description to exact service codes from SERVICES below — a
 * forced, schema-constrained classification call, nothing else. Phase 2
 * (materials, only when needed) searches homedepot.com/lowes.com, opens the
 * real product page, and reports only the price it actually saw there. All
 * arithmetic (multiplying quantities, summing line items, applying the
 * materials markup) happens in plain code after that — never generated text.
 * This guarantees the same request always produces the same price.
 *
 * Deploy as a Cloudflare Worker. Required setup (see DEPLOY.md):
 *   - Secret:  ANTHROPIC_API_KEY
 *   - KV binding named RATE_LIMIT_KV, bound to the "homeready-quote-ratelimit"
 *     namespace (id: ed2f5781d2f443ce9aca960b9d6d1bb8)
 */

const ALLOWED_ORIGINS = new Set([
  "https://homereadyhelpers.com",
  "https://www.homereadyhelpers.com",
  "https://homereadyhelpers.github.io",
]);

const MODEL = "claude-haiku-4-5-20251001";

const RATE_LIMIT_MAX = 8; // requests per IP
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60; // per hour

// Sheet says "15-20% material markup" — using the upper bound since that's
// what's already published on the site's pricing page. Tell Andrew if 15%
// (or a rule for when each applies) is correct instead.
const MATERIAL_MARKUP = 0.2;

// ── EXACT SERVICE PRICING ─────────────────────────────────────────────────
// Source: Andrew's pricing spreadsheet (2026-07-08). This table is the ONLY
// source of dollar amounts for known services — the AI only ever picks which
// code(s) apply, never a price. Update prices here; nothing else needs to
// change. Anything the customer describes that isn't on this list falls back
// to a "call for a custom quote" response instead of an invented number.
const SERVICES = [
  { code: "drywall_minor_patch", category: "Drywall & Wall Services", label: "Minor drywall patch (1-2 holes)", hours: 0.75, price: 75 },
  { code: "drywall_medium_patch", category: "Drywall & Wall Services", label: "Medium drywall patch (3-5 areas)", hours: 1.5, price: 135 },
  { code: "drywall_large_patch", category: "Drywall & Wall Services", label: "Large drywall patch/finishing", hours: 3, price: 265 },
  { code: "caulking_small", category: "Drywall & Wall Services", label: "Caulking replacement (small area)", hours: 1, price: 125 },
  { code: "caulking_large", category: "Drywall & Wall Services", label: "Caulking replacement (large area)", hours: 3, price: 265 },
  { code: "sink_fixture_replacement", category: "Fixture & Installation", label: "Sink fixture replacement", hours: 2, price: 180 },
  { code: "interior_door_install", category: "Fixture & Installation", label: "Interior door installation", hours: 4, price: 360 },
  { code: "shelving_install", category: "Fixture & Installation", label: "Shelving/bracket installation", hours: 1.5, price: 135 },
  { code: "towel_bar_install", category: "Fixture & Installation", label: "Towel bar/hardware install", hours: 0.5, price: 125 },
  { code: "touchup_painting", category: "Painting & Finishing", label: "Touch-up/spot painting (one room)", hours: 2, price: 180 },
  { code: "single_room_painting", category: "Painting & Finishing", label: "Single room interior (walls)", hours: 6, price: 525 },
  { code: "full_interior_painting", category: "Painting & Finishing", label: "Full interior/trim (multiple rooms)", hours: 16, price: 1400 },
  { code: "cabinet_refinishing", category: "Painting & Finishing", label: "Cabinet refinishing", hours: 6, price: 525 },
  { code: "air_filter_replacement", category: "Home Maintenance", label: "Air filter replacement", hours: 0.5, price: 125 },
  { code: "light_fixture_replacement", category: "Home Maintenance", label: "Light fixture replacement", hours: 1, price: 125 },
  { code: "smoke_detector_batteries", category: "Home Maintenance", label: "Smoke detector battery replacement", hours: 0.5, price: 125 },
  { code: "general_maintenance_visit", category: "Home Maintenance", label: "General maintenance visit", hours: 1, price: 125 },
  { code: "vinyl_plank_flooring", category: "Flooring", label: "Vinyl plank flooring (100-150 sq ft)", hours: 5, price: 440 },
  { code: "laminate_flooring", category: "Flooring", label: "Laminate flooring (100-150 sq ft)", hours: 6, price: 530 },
  { code: "small_tile_area", category: "Flooring", label: "Small tile area (25-50 sq ft)", hours: 4, price: 360 },
  { code: "appliance_install", category: "Appliance & Equipment", label: "Appliance installation (dishwasher, range, etc.)", hours: 3, price: 270 },
  { code: "dryer_vent_cleaning", category: "Appliance & Equipment", label: "Dryer vent cleaning", hours: 1, price: 125 },
  { code: "furniture_assembly", category: "Assembly & Misc.", label: "Furniture assembly (simple items)", hours: 2, price: 180 },
  { code: "complex_furniture_assembly", category: "Assembly & Misc.", label: "Complex furniture assembly (larger items)", hours: 4, price: 360 },
  { code: "tv_wall_mounting", category: "Assembly & Misc.", label: "TV wall mounting", hours: 2, price: 175 },
  { code: "picture_hanging", category: "Assembly & Misc.", label: "Picture/mirror hanging (per group of 5-10)", hours: 1, price: 125 },
  { code: "toilet_seal_replacement", category: "Assembly & Misc.", label: "Toilet seal replacement", hours: 1.5, price: 135 },
  { code: "pressure_washing", category: "Assembly & Misc.", label: "Pressure washing, deck/patio (per 500 sq ft)", hours: 3, price: 270 },
];
const SERVICES_BY_CODE = Object.fromEntries(SERVICES.map((s) => [s.code, s]));

// ── PHASE 1: classify the job against the exact service list ─────────────
const CLASSIFY_SYSTEM_PROMPT = `You are the job-classification assistant for HomeReady Helpers LLC, a Christian and veteran-owned solo handyman business in North Alabama (owner: Andrew). Read the customer's plain-English job description and match it to the exact priced services below. You NEVER invent, calculate, or state a dollar amount — pricing is looked up separately from an exact rate table. Your only job is accurate classification.

EXACT PRICED SERVICES (match to these codes — use the code exactly as written, do not invent new ones):
${SERVICES.map((s) => `- ${s.code}: "${s.label}" (~${s.hours} hr)`).join("\n")}

OUT OF SCOPE: the business does NOT perform major plumbing, electrical, HVAC, or range hood work. If the job is clearly one of these (e.g. "rewire a breaker panel," "install new HVAC ductwork," "repipe a bathroom"), set status to "out_of_scope" and write a brief, friendly reason, suggesting a call to 951-526-1636.

CLASSIFICATION RULES:
- Match every distinct task in the description to a service code. A job can match multiple codes.
- If a task doesn't clearly match any listed service, do NOT force it onto the closest code. Instead set status to "needs_review", still list whatever DID match in matchedServices (if anything), and describe the unmatched part in reason so we can tell the customer it needs a quick look before we can price it.
- Set quantity greater than 1 only when the description clearly implies multiple units of the exact same service (e.g. "hang two groups of pictures" -> picture_hanging quantity 2; "1000 sq ft of pressure washing" -> pressure_washing quantity 2, since that service is priced per 500 sq ft). Default quantity is 1.
- Materials: the customer supplies all materials by default. Only include an entry in materialsNeeded when the customer explicitly says HomeReady Helpers should buy/supply a specific item — name it as a specific, searchable product (e.g. "Delta 4-inch centerset bathroom faucet", not just "a faucet").
- Subscription plans exist: Basic $99/mo (1 hr labor), Standard $149/mo (1.5 hr labor + $30 materials), Premium $199/mo (2 hrs labor + $60 materials), all with $88/hr overage. If the job sounds small and recurring ("monthly," "few little things," "ongoing"), set suggestPlan true and briefly explain which plan fits in planSuggestion. Otherwise leave it false.
- status is "priced" whenever at least one service matched and nothing needs review; "needs_review" if any part of the job doesn't match a listed service; "out_of_scope" only for the major-trades exclusions above.`;

const CLASSIFY_TOOL = {
  name: "classify_job",
  description: "Classify the described job against HomeReady Helpers' exact priced service list. Never state a price.",
  input_schema: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["priced", "needs_review", "out_of_scope"] },
      jobTitle: { type: "string", description: "Short title, e.g. 'Ceiling Fan Install + Faucet Replacement'" },
      reason: {
        type: "string",
        description:
          "For out_of_scope: a brief, friendly explanation. For needs_review: describe the part of the job that doesn't match a listed service.",
      },
      matchedServices: {
        type: "array",
        items: {
          type: "object",
          properties: {
            code: { type: "string", enum: SERVICES.map((s) => s.code) },
            quantity: { type: "number" },
          },
          required: ["code"],
        },
      },
      materialsNeeded: {
        type: "array",
        items: {
          type: "object",
          properties: { item: { type: "string" } },
          required: ["item"],
        },
      },
      suggestPlan: { type: "boolean" },
      planSuggestion: { type: "string" },
    },
    required: ["status", "matchedServices"],
  },
};

// ── PHASE 2: exact material price from a real product page ───────────────
const MATERIAL_SYSTEM_PROMPT = `Find the exact current price of a specific material on homedepot.com or lowes.com. Search first, then use web_fetch to open the single most relevant real product page, then report the price shown on that actual page using the report_material_price tool. Never estimate, round from memory, or invent a number — only report a price you actually saw on a fetched product page. If you can't find a clear match, set found to false.`;

const MATERIAL_TOOL = {
  name: "report_material_price",
  description: "Report the exact price found on a real Home Depot or Lowe's product page.",
  input_schema: {
    type: "object",
    properties: {
      found: { type: "boolean" },
      productName: { type: "string" },
      price: { type: "number" },
      sourceSite: { type: "string", enum: ["Home Depot", "Lowe's"] },
      sourceUrl: { type: "string" },
    },
    required: ["found"],
  },
};

const MATERIAL_WEB_SEARCH_TOOL = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 2,
  allowed_domains: ["homedepot.com", "lowes.com"],
};

const MATERIAL_WEB_FETCH_TOOL = {
  type: "web_fetch_20250910",
  name: "web_fetch",
  max_uses: 2,
  allowed_domains: ["homedepot.com", "lowes.com"],
};

function corsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

async function checkRateLimit(env, ip) {
  // Fail open if the KV binding isn't configured — a misconfigured
  // rate limiter should never take down the whole quote feature.
  if (!env.RATE_LIMIT_KV) return true;
  const key = `rl:${ip}`;
  const current = await env.RATE_LIMIT_KV.get(key);
  const count = current ? parseInt(current, 10) : 0;
  if (count >= RATE_LIMIT_MAX) return false;
  await env.RATE_LIMIT_KV.put(key, String(count + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });
  return true;
}

async function callClaude(env, { system, messages, tools, toolChoice, maxTokens, beta }) {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  };
  if (beta) headers["anthropic-beta"] = beta;
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
      tools,
      tool_choice: toolChoice,
    }),
  });
}

async function classifyJob(env, description) {
  const res = await callClaude(env, {
    system: CLASSIFY_SYSTEM_PROMPT,
    messages: [{ role: "user", content: description }],
    tools: [CLASSIFY_TOOL],
    toolChoice: { type: "tool", name: "classify_job" },
    maxTokens: 800,
  });
  if (!res.ok) return { error: true };
  const data = await res.json();
  const toolUse = (data.content || []).find(
    (b) => b.type === "tool_use" && b.name === "classify_job"
  );
  if (!toolUse) return { error: true };
  return { result: toolUse.input };
}

async function lookupMaterialPrice(env, itemDescription) {
  let messages = [{ role: "user", content: `Find the current price for: ${itemDescription}` }];
  for (let attempt = 0; attempt < 3; attempt++) {
    let res;
    try {
      res = await callClaude(env, {
        system: MATERIAL_SYSTEM_PROMPT,
        messages,
        tools: [MATERIAL_WEB_SEARCH_TOOL, MATERIAL_WEB_FETCH_TOOL, MATERIAL_TOOL],
        toolChoice: { type: "any" },
        maxTokens: 1500,
        beta: "web-fetch-2025-09-10",
      });
    } catch (err) {
      console.error("material lookup fetch threw", err);
      return { found: false };
    }
    if (!res.ok) {
      console.error("material lookup API error", res.status, await res.text());
      return { found: false };
    }
    const data = await res.json();
    const toolUse = (data.content || []).find(
      (b) => b.type === "tool_use" && b.name === "report_material_price"
    );
    if (toolUse) return toolUse.input;

    if (data.stop_reason === "pause_turn") {
      messages = [
        { role: "user", content: `Find the current price for: ${itemDescription}` },
        { role: "assistant", content: data.content },
      ];
      continue;
    }
    return { found: false };
  }
  return { found: false };
}

function buildPricedQuote(classification, matched, materialResults) {
  const lineItems = [];
  let subtotal = 0;
  let totalHours = 0;

  for (const m of matched) {
    const svc = SERVICES_BY_CODE[m.code];
    const qty = m.quantity && m.quantity > 0 ? m.quantity : 1;
    const amount = svc.price * qty;
    subtotal += amount;
    totalHours += svc.hours * qty;
    lineItems.push({
      label: qty > 1 ? `${svc.label} × ${qty}` : svc.label,
      amount: `$${amount.toLocaleString()}`,
      note: "Exact rate from our price list",
    });
  }

  for (const mat of materialResults) {
    const r = mat.result;
    if (r && r.found && typeof r.price === "number") {
      const withMarkup = Math.round(r.price * (1 + MATERIAL_MARKUP));
      subtotal += withMarkup;
      lineItems.push({
        label: `Materials: ${r.productName || mat.item}`,
        amount: `$${withMarkup.toLocaleString()}`,
        note: `$${r.price} at ${r.sourceSite || "the retailer"} + 20% sourcing fee`,
      });
    } else {
      lineItems.push({
        label: `Materials: ${mat.item}`,
        amount: "TBD",
        note: "Couldn't confirm an exact current price online — we'll price this material when we look at the job.",
      });
    }
  }

  let notes;
  if (classification.status === "needs_review" && classification.reason) {
    notes = `This estimate covers the part(s) of the job we could price exactly. ${classification.reason}`;
  }

  return {
    inScope: true,
    jobTitle: classification.jobTitle || "Job Estimate",
    estimateRange: { low: subtotal, high: subtotal },
    lineItems,
    timeEstimate: totalHours ? `About ${totalHours} hour${totalHours === 1 ? "" : "s"}` : undefined,
    notes,
    suggestPlan: !!classification.suggestPlan,
    planSuggestion: classification.planSuggestion,
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method === "GET") {
      return jsonResponse({ status: "ok", service: "homeready-quote-api" }, 200, origin);
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405, origin);
    }

    // Everything below is wrapped so that ANY unexpected failure (a
    // missing binding, a bad env var, whatever) still comes back as a
    // real JSON error with CORS headers attached — instead of a bare
    // platform error page with no CORS headers, which browsers report
    // to JS as an opaque "NetworkError" / "Failed to fetch".
    try {
      if (origin && !ALLOWED_ORIGINS.has(origin)) {
        return jsonResponse({ error: "Origin not allowed" }, 403, origin);
      }

      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const allowed = await checkRateLimit(env, ip);
      if (!allowed) {
        return jsonResponse(
          {
            error:
              "You've hit the hourly limit for instant quotes. Please call 951-526-1636 or try again in a bit.",
          },
          429,
          origin
        );
      }

      let description;
      try {
        const body = await request.json();
        description = typeof body.description === "string" ? body.description.trim() : "";
      } catch {
        return jsonResponse({ error: "Invalid request body" }, 400, origin);
      }

      if (description.length < 3 || description.length > 600) {
        return jsonResponse(
          { error: "Please describe the job in a sentence or two (up to 600 characters)." },
          400,
          origin
        );
      }

      if (!env.ANTHROPIC_API_KEY) {
        return jsonResponse(
          { error: "Quote service is not configured yet — the API key is missing." },
          500,
          origin
        );
      }

      const classifyRes = await classifyJob(env, description);
      if (classifyRes.error) {
        return jsonResponse(
          { error: "Couldn't generate a quote from that description. Please try rephrasing." },
          502,
          origin
        );
      }
      const c = classifyRes.result;

      if (c.status === "out_of_scope") {
        return jsonResponse(
          {
            quote: {
              inScope: false,
              declineReason:
                c.reason ||
                "That's outside what HomeReady Helpers handles — give us a call at 951-526-1636 and we're happy to point you in the right direction.",
            },
          },
          200,
          origin
        );
      }

      const matched = Array.isArray(c.matchedServices)
        ? c.matchedServices.filter((m) => m && SERVICES_BY_CODE[m.code])
        : [];

      if (matched.length === 0) {
        return jsonResponse(
          {
            quote: {
              inScope: false,
              declineReason: `This doesn't match one of our standard priced services yet, so we can't generate an instant quote for it. ${
                c.reason || ""
              } Call 951-526-1636 or fill out the request form and we'll get you an exact price after a quick look.`.trim(),
            },
          },
          200,
          origin
        );
      }

      const materialsNeeded = Array.isArray(c.materialsNeeded) ? c.materialsNeeded : [];
      const materialResults = await Promise.all(
        materialsNeeded
          .filter((m) => m && typeof m.item === "string" && m.item.trim())
          .map(async (m) => ({ item: m.item, result: await lookupMaterialPrice(env, m.item) }))
      );

      const quote = buildPricedQuote(c, matched, materialResults);
      return jsonResponse({ quote }, 200, origin);
    } catch (err) {
      return jsonResponse(
        {
          error: "Something went wrong generating that estimate. Please try again.",
          detail: String((err && err.message) || err),
        },
        500,
        origin
      );
    }
  },
};
