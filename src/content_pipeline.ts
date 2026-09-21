import { DeliveryRequest } from "./creator_checkout.js";

export function subscriberUpdate(request: DeliveryRequest, note: string): string {
  return `To ${request.customerEmail}: your download for ${request.assetTitle} is ready. ${note}`;
}
