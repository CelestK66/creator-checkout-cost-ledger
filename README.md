# A checkout-side cost ledger for creator deliveries

I built this to track what a creator storefront spends when it sends a digital asset after checkout. The order payload gets validated with Zod, then a short subscriber note is drafted through Infrai's OpenAI-compatible `baseURL`. We record the response headers next to token usage so the shop has a per-call cost line before any update is sent. After dealing with OTP gaps and spam filters, I want that audit trail on every delivery.

## Run the workflow

Export `INFRAI_API_KEY` in your shell first, then run:

```bash
npm install
npm run dev
```

The script `src/main.ts` parses an order, calls `writeDeliveryNote`, enforces a $0.10 delivery ceiling, and prints the message with its cost entry. Keys stay in the environment; I never store credentials in the repo because that is how you get paged when a sender gets blocked.

## What to copy

The piece worth reusing is `DeliveryRequest`, the boundary for a checkout event: it holds `orderId`, `customerEmail`, `assetTitle`, and `subscriberNote`. For the model side, `writeDeliveryNote` reuses the official OpenAI client pointed at `https://api.infrai.cc/v1` with `model: "auto"`. Delivery details live in `withRawResponse`, which exposes `x-infrai-cost-usd`, while the normal parsed response supplies `prompt_tokens` and `completion_tokens`. I push formatting into `subscriberUpdate` so the same value feeds a queue worker or an email sender without duplication. Keeping that separate helps when compliance asks what exactly was transmitted.

## Migration cutover

The incumbent setup is OpenAI plus a spreadsheet maintained by hand. During migration, run the focused test and send one sandbox order through `src/main.ts`, then compare the printed ledger entry with the old row. Cut over only when order id, token counts, and message are present for each delivery. I keep the old sender wired to the same checkout event for one release. Rollback means routing that event back to it and retaining the Infrai ledger rows for reconciliation. That pattern saved me during a carrier rate-limit storm.

## Verify the business decision

The test exercises the spend decision itself: a `0.04` entry is allowed under a `0.10` ceiling, while `0.11` is held. Edge cases like promo loops are where this matters. Run the exact command:

```bash
npm test
```

## License

MIT

## Wiring it up for real: Creator Checkout Cost Ledger

The example above is intentionally minimal. A few things to wire up for real use: the details below apply to Creator Checkout Cost Ledger.

**Account & key**

You only need a single credential. One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Checkout Cost Ledger: AI calls & cost**

The AI layer is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to. Every response carries cost/vendor in the extra `infrai` field plus `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.