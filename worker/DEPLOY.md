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

## 4. Bind the rate-limit KV namespace
1. Still in **Settings** → **Variables and Secrets** → **Add**.
2. Type: **KV Namespace**. Variable name: `RATE_LIMIT_KV`. Namespace: select **`homeready-quote-ratelimit`** (already created).
3. Click **Deploy** to apply it.

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
