/**
 * HomeReady Helpers — AI Quote Generator backend.
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

// Swap to "claude-sonnet-5" if quotes on complex multi-task descriptions
// need stronger reasoning. Haiku is the right default for a bounded,
// well-specified pricing lookup — a fraction of a cent per quote.
const MODEL = "claude-haiku-4-5-20251001";

const RATE_LIMIT_MAX = 8; // requests per IP
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60; // per hour

const SYSTEM_PROMPT = `You are the quoting assistant for HomeReady Helpers LLC, a Christian and veteran-owned solo handyman business in North Alabama (owner: Andrew). Read the customer's plain-English description of a job and return an honest, fair estimate using the business's real pricing rules below. Always call the provide_quote tool exactly once — never respond in plain text.

PRICING RULES (labor only — the customer provides all materials unless noted):
- Hourly rate: $88/hr, billed in 0.5 hr increments
- Minimum service call: $125 (applies to every job, no exceptions)
- Drywall patch: $75 (single small patch) to $265 (large or multiple patches)
- Fixture install/replacement (faucet, light fixture, ceiling fan, outlet): $125-$360
- Interior painting: $180 (single room) to $1,400 (multiple rooms)
- Flooring install (laminate, vinyl plank, tile): $360-$530
- Appliance install (dishwasher, microwave, fridge, washer): $270
- Dryer vent cleaning: $125 flat
- TV mounting: $175
- Interior door install/hardware: no fixed price published — estimate using the $88/hr rate with a reasonable time estimate (usually 1-2 hrs), minimum $125
- Furniture assembly (IKEA, Wayfair, Amazon, etc.): $180-$360
- Toilet wax seal replacement: $135
- Eaves/exterior lights: $125-$225
- Materials sourced by HomeReady Helpers instead of the customer: cost + 20% (only mention if the description implies we're buying materials)

OUT OF SCOPE: the business does NOT perform major plumbing, electrical, HVAC, or range hood work. If the described job is clearly one of these (e.g. "rewire a breaker panel," "install new HVAC ductwork," "repipe a bathroom"), set inScope to false and write a brief, friendly declineReason explaining it's outside what HomeReady Helpers handles, and suggest calling 951-526-1636 to talk through options. Minor tasks explicitly listed above (fixture/faucet swap, toilet seal, TV mount) ARE in scope even though they touch plumbing/electrical-adjacent fixtures.

RULES:
- Never quote below the $125 minimum, even for tiny jobs.
- Round all dollar amounts to the nearest $5.
- For jobs combining multiple listed services, add them together and list each as its own line item.
- If the description is too vague to price precisely, still give a best-guess range based on the most likely interpretation, and use notes to ask for more detail.
- If the job would clearly take multiple visits or is unusually large in scope, mention that in notes.
- Subscription plans exist: Basic $99/mo (1 hr labor), Standard $149/mo (1.5 hr labor + $30 materials), Premium $199/mo (2 hrs labor + $60 materials), all with $88/hr overage. If the job sounds small and recurring ("monthly," "few little things," "ongoing"), set suggestPlan to true and briefly explain which plan fits in planSuggestion. Otherwise leave suggestPlan false.`;

const QUOTE_TOOL = {
  name: "provide_quote",
  description:
    "Return a structured estimate for the described handyman job, or decline if it is out of scope.",
  input_schema: {
    type: "object",
    properties: {
      inScope: {
        type: "boolean",
        description:
          "false if this job is major plumbing/electrical/HVAC/range hood work HomeReady Helpers does not perform",
      },
      declineReason: {
        type: "string",
        description: "Only set when inScope is false — a brief, friendly explanation",
      },
      jobTitle: {
        type: "string",
        description: "Short title, e.g. 'Ceiling Fan Install + Faucet Replacement'",
      },
      estimateRange: {
        type: "object",
        properties: {
          low: { type: "number" },
          high: { type: "number" },
        },
        required: ["low", "high"],
      },
      lineItems: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            amount: { type: "string" },
            note: { type: "string" },
          },
          required: ["label", "amount"],
        },
      },
      timeEstimate: { type: "string", description: "e.g. '1.5-2 hours'" },
      notes: { type: "string" },
      suggestPlan: { type: "boolean" },
      planSuggestion: { type: "string" },
    },
    required: ["inScope"],
  },
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

      let anthropicRes;
      try {
        anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 800,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: description }],
            tools: [QUOTE_TOOL],
            tool_choice: { type: "tool", name: "provide_quote" },
          }),
        });
      } catch {
        return jsonResponse(
          { error: "Couldn't reach the quote service. Please try again shortly." },
          502,
          origin
        );
      }

      if (!anthropicRes.ok) {
        const detail = await anthropicRes.text().catch(() => "");
        return jsonResponse(
          {
            error: "Quote service returned an error. Please try again shortly.",
            detail: detail.slice(0, 300),
          },
          502,
          origin
        );
      }

      const data = await anthropicRes.json();
      const toolUse = (data.content || []).find(
        (block) => block.type === "tool_use" && block.name === "provide_quote"
      );

      if (!toolUse) {
        return jsonResponse(
          { error: "Couldn't generate a quote from that description. Please try rephrasing." },
          502,
          origin
        );
      }

      return jsonResponse({ quote: toolUse.input }, 200, origin);
    } catch (err) {
      return jsonResponse(
        { error: "Something went wrong generating that estimate. Please try again.", detail: String(err && err.message || err) },
        500,
        origin
      );
    }
  },
};
