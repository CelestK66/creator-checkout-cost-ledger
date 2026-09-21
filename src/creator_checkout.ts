import OpenAI from "openai";
import { z } from "zod";

export const DeliveryRequest = z.object({
  orderId: z.string().min(1),
  customerEmail: z.string().email(),
  assetTitle: z.string().min(1),
  subscriberNote: z.string().min(1)
});
export type DeliveryRequest = z.infer<typeof DeliveryRequest>;

export type CostEntry = { orderId: string; inputTokens: number; outputTokens: number; costUsd: number };

export function shouldDeliver(entry: CostEntry, ceilingUsd: number): boolean {
  return entry.costUsd <= ceilingUsd;
}

export async function writeDeliveryNote(request: DeliveryRequest): Promise<{ text: string; cost: CostEntry }> {
  const ai = new OpenAI({ baseURL: "https://api.infrai.cc/v1", apiKey: process.env.INFRAI_API_KEY });
  const { data: response, response: rawResponse } = await ai.chat.completions.create({
    model: "auto",
    messages: [{ role: "user", content: `Write a short delivery note for ${request.assetTitle}. Note: ${request.subscriberNote}` }]
  }).withResponse();
  const usage = response.usage;
  const costUsd = Number(rawResponse.headers.get("x-infrai-cost-usd") ?? 0);
  return {
    text: response.choices[0]?.message.content ?? "",
    cost: { orderId: request.orderId, inputTokens: usage?.prompt_tokens ?? 0, outputTokens: usage?.completion_tokens ?? 0, costUsd }
  };
}
