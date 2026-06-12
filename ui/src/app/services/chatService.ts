// ============================================================
// Chat Service — DEV mock implementation
// DEV: Simulates authenticated AI assistant requests.
// Replace with real endpoint later:
//   POST /api/v1/chat
//   Headers: { Authorization: `Bearer ${token}` }
//   Body: { message, history }
// ============================================================

import type { ChatRequest, ChatResponse } from "../types";
import { mockChatResponses } from "../data/mockData";

export const chatService = {
  /**
   * Send a message to the AI assistant.
   * DEV: token is included in the request config to simulate auth.
   * In production, token goes into the Authorization header.
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // DEV: Simulates attaching token to request header
    const _requestConfig = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // DEV only — replace with real auth token from backend
        Authorization: `Bearer ${request.token}`,
      },
      body: JSON.stringify({ message: request.message, history: request.history }),
    };

    await delay(1000 + Math.random() * 800); // simulate LLM latency

    const reply = pickMockReply(request.message);

    return {
      reply,
      timestamp: new Date().toISOString(),
    };
  },
};

// ---- DEV: Simple keyword-based mock response picker ------------

function pickMockReply(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("score") || lower.includes("algorithm") || lower.includes("how"))
    return mockChatResponses.score;
  if (lower.includes("kamran") || lower.includes("35202") || lower.includes("ent-001"))
    return mockChatResponses.kamran;
  if (lower.includes("high risk") || lower.includes("critical") || lower.includes("flagged"))
    return mockChatResponses.high;
  if (lower.includes("help") || lower.includes("what can"))
    return mockChatResponses.help;

  return mockChatResponses.default;
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
