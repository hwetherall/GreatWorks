// Session 2: Inline annotation endpoint
// This will accept a passage + line range + knowledge level and return an AI-enriched annotation.

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { passage, lineRange, level } = await request.json();

  if (!passage || !level) {
    return Response.json(
      { error: "passage and level are required" },
      { status: 400 }
    );
  }

  // TODO (Session 2): Call OpenRouter with getAnnotationPrompt(passage, lineRange, level)
  return Response.json(
    {
      error: "Annotation feature coming in Session 2",
      passage,
      lineRange,
      level,
    },
    { status: 501 }
  );
}
