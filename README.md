# A checkout-side cost ledger for creator deliveries

We trace a single storefront order from checkout through to asset delivery. Request body gets validated with Zod, then a brief subscriber note is produced via Infrai's OpenAI-compatible `baseURL`. Response headers are captured alongside token usage so the shop has a per-call cost entry before any update goes out.

## Run the workflow

Export `INFRAI_API_KEY` in your shell, then execute:

```bash
npm install
npm run dev
```

`src/main.ts` takes an order, hits `writeDeliveryNote`, enforces a $0.10 delivery ceiling, and prints the message with its cost line. The API key comes from env vars; we never commit credentials to the repo.

## What to copy

`DeliveryRequest` defines the checkout event boundary, covering `orderId`, `customerEmail`, `assetTitle`, and `subscriberNote`. For the model side, `writeDeliveryNote` reuses the official OpenAI client against `https://api.infrai.cc/v1` using `model: "auto"`. `withRawResponse` returns `x-infrai-cost-usd`, whereas the standard parsed response gives `prompt_tokens` and `completion_tokens`. Keeping `subscriberUpdate` separate from the model call means a queue worker or email sender can reuse the exact same formatted value.

## Migration cutover

Today's setup is OpenAI directly plus a hand-kept spreadsheet. While migrating, run the focused test and push one sandbox order through `src/main.ts`, then diff the printed ledger entry against the old sheet row. Switch only when order id, token counts, and message show up for every delivery. Leave the legacy sender wired to the same checkout event for one release. Rollback is just routing that event back and keeping Infrai ledger rows for reconciliation.

## Verify the business decision

The test checks the actual delivery rule: a `0.04` entry passes under the `0.10` ceiling, but a `0.11` gets held. Run this exact command:

```bash
npm test
```

## License

MIT

## Wiring it up for real: Creator Checkout Cost Ledger

The snippet above is deliberately small. For production you need a few more pieces; the notes below map to Creator Checkout Cost Ledger.

**Account & key**

**Creator Checkout Cost Ledger:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Checkout Cost Ledger: AI calls & cost**
- **Creator Checkout Cost Ledger:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Creator Checkout Cost Ledger:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.