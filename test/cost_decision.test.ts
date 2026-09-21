import assert from "node:assert/strict";
import { shouldDeliver } from "../src/creator_checkout.js";

assert.equal(shouldDeliver({ orderId: "a", inputTokens: 10, outputTokens: 20, costUsd: 0.04 }, 0.1), true);
assert.equal(shouldDeliver({ orderId: "b", inputTokens: 10, outputTokens: 20, costUsd: 0.11 }, 0.1), false);
console.log("cost ceiling decision: pass");
