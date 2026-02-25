// Session 3: Section primer endpoint
// Returns a spoiler-free ~300 word briefing on Book I calibrated to knowledge level.

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");

  if (!level) {
    return Response.json({ error: "level is required" }, { status: 400 });
  }

  // TODO (Session 3): Call OpenRouter with getPrimerPrompt(level)
  return Response.json(
    { error: "Primer feature coming in Session 3" },
    { status: 501 }
  );
}
