import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

interface FeedbackRequestBody {
  rating?: unknown;
  feedbackText?: unknown;
  name?: unknown;
}

function parseAndValidate(body: FeedbackRequestBody): {
  rating: number;
  feedbackText: string;
  name: string | null;
} | null {
  if (!Number.isInteger(body.rating)) return null;
  const rating = body.rating as number;
  if (rating < 1 || rating > 5) return null;

  if (typeof body.feedbackText !== "string") return null;
  const feedbackText = body.feedbackText.trim();
  if (!feedbackText) return null;

  const trimmedName =
    typeof body.name === "string" ? body.name.trim() : "";

  return {
    rating,
    feedbackText,
    name: trimmedName.length > 0 ? trimmedName : null,
  };
}

export async function POST(request: NextRequest) {
  let parsedBody: ReturnType<typeof parseAndValidate>;

  try {
    const body = (await request.json()) as FeedbackRequestBody;
    parsedBody = parseAndValidate(body);
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!parsedBody) {
    return Response.json(
      { error: "rating (1-5) and feedbackText are required" },
      { status: 400 }
    );
  }

  const existingSessionId = request.cookies.get("gb_session")?.value;
  const sessionId = existingSessionId || crypto.randomUUID();

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("feedback_submissions").insert({
    session_id: sessionId,
    rating: parsedBody.rating,
    feedback_text: parsedBody.feedbackText,
    name: parsedBody.name,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  if (!existingSessionId) {
    headers.append(
      "Set-Cookie",
      `gb_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
    );
  }

  return new Response(JSON.stringify({ ok: true }), { headers });
}
