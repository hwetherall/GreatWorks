// Session 3: Chat endpoint
// Context-aware chat about Paradise Lost, calibrated to knowledge level.

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { messages, level } = await request.json();

  if (!messages || !level) {
    return Response.json(
      { error: "messages and level are required" },
      { status: 400 }
    );
  }

  // TODO (Session 3): Call OpenRouter with streaming, using getChatSystemPrompt(level)
  return Response.json(
    { error: "Chat feature coming in Session 3" },
    { status: 501 }
  );
}
