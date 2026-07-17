/**
 * Temporary stand-in for quote-worker.js while the Instant Estimate tool is
 * offline for further development. Paste this into the Cloudflare dashboard
 * (Edit code -> Deploy) to make the live API stop answering real requests
 * without deleting the Worker itself — so the ANTHROPIC_API_KEY / OWNER_PIN
 * secrets and the RATE_LIMIT_KV binding stay configured for when it's time
 * to relaunch. To relaunch, just paste quote-worker.js back in and Deploy.
 */
export default {
  async fetch() {
    return new Response(
      JSON.stringify({
        error: "The Instant Estimate tool is offline right now. Please call 951-526-1636 for a quote.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  },
};
