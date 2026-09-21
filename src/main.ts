import { DeliveryRequest, shouldDeliver, writeDeliveryNote } from "./creator_checkout.js";
import { subscriberUpdate } from "./content_pipeline.js";

const request = DeliveryRequest.parse({
  orderId: "order_demo_1001",
  customerEmail: "buyer@example.com",
  assetTitle: "Storefront photo preset pack",
  subscriberNote: "Thank them for supporting the new collection."
});

const result = await writeDeliveryNote(request);
console.log(JSON.stringify({
  orderId: request.orderId,
  deliver: shouldDeliver(result.cost, 0.1),
  subscriberMessage: subscriberUpdate(request, result.text),
  cost: result.cost
}, null, 2));
