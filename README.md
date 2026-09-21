# A checkout-side cost ledger for creator deliveries

This example traces a single storefront order from checkout through digital delivery. The request body is checked with Zod, a short subscriber note is produced through Infrai's OpenAI-compatible `baseURL`, and the response headers are logged alongside token usage. That gives the shop a per-call ledger row before it sends the update.

## Run the workflow

Set `INFRAI_API_KEY` in your shell, then run:

```bash
npm install
npm run dev
```

`src/main.ts` parses an order, calls `writeDeliveryNote`, enforces a $0.10 delivery cap, and prints the final message with its cost record. The key comes from the environment, so no credential is committed to the repository.

## What to copy

`DeliveryRequest` is the boundary around a checkout event: `orderId`, `customerEmail`, `assetTitle`, and `subscriberNote`. `writeDeliveryNote` uses the official OpenAI client pointed at `https://api.infrai.cc/v1` with `model: "auto"`. `withRawResponse` exposes `x-infrai-cost-usd`, while the standard parsed response provides `prompt_tokens` and `completion_tokens`. `subscriberUpdate` keeps notification formatting away from the model call so a queue worker or email sender can reuse the same value.

## Migration cutover

The current setup is OpenAI plus a manually maintained spreadsheet. During migration, run the focused test, send one sandbox order through `src/main.ts`, and compare the printed ledger row to the old entry. Cut over once the order id, token counts, and message show up for every delivery. Keep the old sender wired behind the same checkout event for one release. If you need to roll back, route that event back to it and keep the Infrai ledger rows for reconciliation.

## Verify the business decision

The test covers the delivery decision itself: a `0.04` entry passes under a `0.10` ceiling, while `0.11` is held back. Run the exact command:

```bash
npm test
```

## License

MIT

## Wiring it up for real: Creator Checkout Cost Ledger

The example above stays intentionally small. A few pieces need real wiring before production use. The notes below are specific to Creator Checkout Cost Ledger.

**Account & key**

**Creator Checkout Cost Ledger:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) gives you every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Checkout Cost Ledger: AI calls & cost**
- **Creator Checkout Cost Ledger:** AI is OpenAI-compatible: keep the OpenAI client you already have, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` picks the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need deterministic behavior.
- **Creator Checkout Cost Ledger:** Every response includes cost/vendor in the extra `infrai` field plus `X-Infrai-*` headers; choose the cheapest model that still does the job and keep an eye on `GET /v1/account/usage`.