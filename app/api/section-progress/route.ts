import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { checkAndUnlockAchievements } from "@/lib/achievements";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("gb_session")?.value;
  if (!sessionId) {
    return Response.json([]);
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("section_progress")
      .select("section_id")
      .eq("session_id", sessionId);

    if (error) {
      return Response.json([]);
    }

    return Response.json(data ?? []);
  } catch {
    return Response.json([]);
  }
}

export async function POST(request: NextRequest) {
  let sectionId: string;
  try {
    const body = await request.json();
    sectionId = body.sectionId;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!sectionId) {
    return Response.json({ error: "sectionId is required" }, { status: 400 });
  }

  const existingSessionId = request.cookies.get("gb_session")?.value;
  const sessionId = existingSessionId || crypto.randomUUID();

  const supabase = createSupabaseServerClient();

  // Upsert section completion
  try {
    await supabase
      .from("section_progress")
      .upsert(
        { session_id: sessionId, section_id: sectionId },
        { onConflict: "session_id,section_id" }
      );
  } catch {
    // Non-fatal — optimistic UI already updated on client
  }

  // Reading streak — fire-and-forget
  void (async () => {
    try {
      await supabase.rpc("upsert_reading_streak", {
        p_session_id: sessionId,
        p_sections: 1,
      });
    } catch {}
  })();

  // Achievement check
  let unlockedAchievements: { id: string; title: string; description: string; icon: string }[] = [];
  try {
    unlockedAchievements = await checkAndUnlockAchievements(sessionId);
  } catch {
    // Non-fatal
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  if (!existingSessionId) {
    headers.append(
      "Set-Cookie",
      `gb_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
    );
  }

  return new Response(
    JSON.stringify({ ok: true, unlockedAchievements }),
    { headers }
  );
}
