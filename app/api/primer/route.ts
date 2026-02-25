import { NextRequest } from "next/server";
import { getPrimerPrompt, KnowledgeLevel, KNOWLEDGE_LEVELS } from "@/lib/prompts";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") as KnowledgeLevel | null;

  if (!level) {
    return Response.json({ error: "level is required" }, { status: 400 });
  }

  if (!KNOWLEDGE_LEVELS.includes(level)) {
    return Response.json({ error: "Invalid level" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OpenRouter API key not configured" },
      { status: 500 }
    );
  }

  const prompt = getPrimerPrompt(level);

  let upstream: Response;
  try {
    upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL || "https://greatbooks.vercel.app",
        "X-Title": "Great Books",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4.6",
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_tokens: 800,
        temperature: 0.75,
      }),
    });
  } catch (err) {
    return Response.json(
      { error: `Failed to reach OpenRouter: ${err}` },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const errText = await upstream.text();
    return Response.json(
      { error: `OpenRouter error: ${errText}` },
      { status: upstream.status }
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
