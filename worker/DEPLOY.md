# Deploying the Quote Generator backend (Cloudflare Worker)

This only needs to be done once. Everything happens in the Cloudflare dashboard — no command line required.

## 1. Create the Worker
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**.
2. Choose **"Create Worker"** (the plain Hello World template is fine).
3. Name it `homeready-quote-api` and click **Deploy**.

## 2. Paste in the code
1. On the Worker's page, click **Edit code**.
2. Select all the existing placeholder code and delete it.
3. Paste in the entire contents of [`quote-worker.js`](./quote-worker.js) from this folder.
4. Click **Deploy** (top right) to save it.

## 3. Add the API key as a secret
1. Go back to the Worker's **Settings** tab → **Variables and Secrets** → **Add**.
2. Type: **Secret**. Variable name: `ANTHROPIC_API_KEY`. Value: paste your Anthropic API key.
3. Click **Deploy** to apply it.

Note: once saved, the value is hidden everywhere in the dashboard — this is expected, that's what keeps it safe.

## 3b. Add your owner PIN as a secret (enables "add this service" on the estimate page)
1. Same place — **Settings** → **Variables and Secrets** → **Add**.
2. Type: **Secret**. Variable name: `OWNER_PIN`. Value: a PIN only you know (numbers or letters, your choice).
3. Click **Deploy** to apply it.

Without this secret set, the "Missing this service? Add it" prompt on the estimate page will always say adding isn't set up yet — it never accepts a guessed PIN.

## 4. Bind the rate-limit KV namespace
KV/storage bindings live on a separate tab from plain variables and secrets.
1. In **Settings** → **Bindings** → **Add**.
2. Choose **KV Namespace**. Variable name: `RATE_LIMIT_KV`. Namespace: select **`homeready-quote-ratelimit`** (already created).
3. Click **Add binding**, then **Deploy** to apply it.

## 5. Grab the Worker's URL
On the Worker's **Overview** tab you'll see its live URL — something like:

```
https://homeready-quote-api.<your-subdomain>.workers.dev
```

Send that URL back — that's the only thing needed to wire up the site's quote page. No keys, no secrets.

## Sanity check (optional)
Visiting the URL directly in a browser should return:
```json
{"status":"ok","service":"homeready-quote-api"}
```

## Material price lookups (Home Depot / Lowe's)
No extra setup needed — this is built into the Worker code, not a separate binding. When a
job clearly needs HomeReady Helpers to source a specific material, Claude can search
homedepot.com/lowes.com (only those two sites, capped at 2 searches per quote) to price it
before finalizing the estimate. This only fires occasionally per the system prompt's rules
(never for routine labor-only jobs), and adds a small per-search fee on top of normal token
costs only on the quotes where it actually searches.

## Exact, deterministic pricing (no more "different estimate every time")
The Worker no longer lets the AI state a dollar amount anywhere. Labor pricing comes from a
fixed `SERVICES` table in `quote-worker.js`, copied directly from Andrew's pricing spreadsheet
— the AI only picks which service code(s) match the job description (a forced classification
call), and plain JavaScript does the multiplication/summing. Material prices come from the
same live Home Depot/Lowe's search above, but now the flow is: search → open the real product
page → report only the price actually shown on that page (also a forced tool call, no
estimating). Same job description in = same price out, every time.

**To update labor prices:** edit the `price`/`hours` fields in the `SERVICES` array near the
top of `quote-worker.js` and redeploy — nothing else needs to change.

**Unlisted services:** if a customer describes something that isn't one of the priced
services, the tool now declines with a "call for a custom quote" message instead of guessing
a number. That decline screen also has a collapsed "Missing this service? Add it to your
price list" link — only you should have the PIN (see step 3b above), so customers browsing
the public link just see the normal decline unless they know it. Entering the PIN plus a
service name/hours/price saves it permanently (in the same KV namespace as rate limiting)
and immediately re-runs the estimate with the new service included — no redeploy needed, it
takes effect right away for all future quotes too.
