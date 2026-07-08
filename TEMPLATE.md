# Reskinning this for a new service business

This site was built for HomeReady Helpers LLC, but nothing about the structure is specific
to handyman work. To launch it for a new client, work through this checklist top to bottom.
There's no build step — it's all plain HTML/CSS/JS, so every change below is a direct file edit.

Budget a few hours for a simple trade with similar-shaped pricing (flat rates + ranges), more
for a business whose pricing structure genuinely differs (e.g. project-based bids instead of
hourly + minimums).

## 1. Branding (colors, fonts, logo)

- **Colors** — `style.css`, the `:root` block at the top. Six variables control the whole
  site's palette (`--black`, `--green`, `--green-light`, `--green-dark`, `--white`, `--grey`).
  Swap these and everything cascades — cards, buttons, badges, nav, footer.
- **Fonts** — same `:root` block (`--font-display`, `--font-body`, `--font-accent`), plus the
  Google Fonts `<link>` in the `<head>` of both `index.html` and `estimate.html` — keep them in sync.
- **Logo** — replace `IMG_2296.png` with the new client's logo (same filename, or update every
  `<img src="IMG_2296.png">` reference — there are 3 in `index.html`, 2 in `estimate.html`).
  Then regenerate the app icons from the new logo (`icons/icon-192.png`, `icons/icon-512.png`,
  `icons/icon-512-maskable.png`, `icons/apple-touch-icon.png`) — a solid background color behind
  a centered, padded version of the logo works well; see the icon-generation script used for
  this build if you want to reuse the approach.

## 2. Business identity (name, phone, service area, socials)

Search both `index.html` and `estimate.html` for these and replace every occurrence:
- `HomeReady Helpers` / `HomeReady Helpers LLC`
- `951-526-1636` (both the visible text and every `tel:9515261636` href)
- `North Alabama`
- `https://forms.gle/g29sGJyyHtXctqeb6` (the booking/quote-request form — point at the new
  client's own form or booking link)
- The `<title>` and `<meta name="description">` tags, and the matching `og:title` /
  `og:description` / `og:url` tags, in both pages
- `manifest.json` — `name`, `short_name`, `description`

## 3. Trust signals & values

`index.html` has several sections that are specific to *this* business's identity, not generic
to any service company — decide what applies to the new client and rewrite or remove:
- Hero badges (Veteran Owned / Christian Values / Licensed & Insured)
- The "Who We Are" bio text in the About section
- The four `.about-value` cards (Integrity / Quality / Reliability / Community)
- The four `.why-card` cards (Why HomeReady Helpers section)
- Footer badges
- The Bible verse in the booking section (only relevant if the new client shares that framing)

## 4. Services & pricing — the biggest rewrite

This is the part that changes most between businesses. Rewrite:
- The 9 `.service-card` entries in `index.html` (icon, name, description, starting price)
- The full labor-rates table, subscription plan cards, and hour-package table in the Pricing
  section
- **Keep these numbers consistent with the Worker's system prompt** (next section) — the whole
  point of the estimate tool is that the AI quotes match what's actually posted on the site.

## 5. Backend — a new Worker per client

Each client needs their **own** Cloudflare Worker, KV namespace, and Anthropic API key — this
template does not share infrastructure between clients (see `worker/DEPLOY.md` for the full
deploy steps). Per client:
1. Create a new KV namespace for rate limiting (any name, just keep it consistent with the binding).
2. Deploy a new Worker with a client-specific name.
3. In `worker/quote-worker.js`, rewrite:
   - `ALLOWED_ORIGINS` — the new client's real domain(s)
   - `SYSTEM_PROMPT` — their business name/owner, their actual pricing rules, and their real
     scope exclusions (what they *don't* do)
4. Add their own `ANTHROPIC_API_KEY` secret and `RATE_LIMIT_KV` binding.
5. Update `QUOTE_API_URL` at the top of `estimate.js` to point at their new Worker's URL.

## 6. Payment methods & business policies

Search for `Cash · Zelle · Venmo`, the Venmo processing-fee note, and the "materials cost + 20%"
language — these are specific business policies, not universal to every service company.

## What ISN'T templated (yet)

Everything above is a manual find-and-replace across a handful of files — fine for launching a
second or third client by hand, but it doesn't scale past that. If this takes off and you want
to spin up new clients without touching code each time, the next real step is turning the
business-specific values into a single config file (or a proper multi-tenant platform with an
admin dashboard) — worth revisiting once you've validated the idea with a couple of real
customers.
