import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("gb_session")?.value;
  if (!sessionId) {
    return Response.json([]);
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("annotation_history")
    .select(
      "id, chapter_id, line_start, line_end, passage, knowledge_level, annotation_content, created_at"
    )
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data ?? []);
}
