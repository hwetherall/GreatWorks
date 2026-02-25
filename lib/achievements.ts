import { createSupabaseServerClient } from "@/lib/supabase";
import type { Achievement } from "@/lib/types";

// Hard-coded criteria — avoids an extra DB query per unlock check
const ACHIEVEMENT_CRITERIA: Record<
  string,
  (counts: {
    annotations: number;
    sections: number;
    scholarAnnotations: number;
  }) => boolean
> = {
  first_enrichment: ({ annotations }) => annotations >= 1,
  five_enrichments: ({ annotations }) => annotations >= 5,
  first_section: ({ sections }) => sections >= 1,
  book1_halfway: ({ sections }) => sections >= 3,
  book1_complete: ({ sections }) => sections >= 6,
  scholar_unlocked: ({ scholarAnnotations }) => scholarAnnotations >= 1,
};

// Must mirror the seed in 003_gamification.sql
const ACHIEVEMENT_DATA: Record<string, Achievement> = {
  first_enrichment: {
    id: "first_enrichment",
    title: "First Enrichment",
    description: "You enriched your first passage.",
    icon: "✦",
  },
  five_enrichments: {
    id: "five_enrichments",
    title: "Close Reader",
    description: "Five passages enriched.",
    icon: "🔍",
  },
  first_section: {
    id: "first_section",
    title: "The Argument Read",
    description: "You completed your first section.",
    icon: "📜",
  },
  book1_halfway: {
    id: "book1_halfway",
    title: "Through the Fire",
    description: "Halfway through Book 1.",
    icon: "🔥",
  },
  book1_complete: {
    id: "book1_complete",
    title: "Book I Complete",
    description: "You have read Paradise Lost Book 1.",
    icon: "👑",
  },
  scholar_unlocked: {
    id: "scholar_unlocked",
    title: "Scholar Mode",
    description: "You engaged at the Scholar level.",
    icon: "🎓",
  },
};

export async function checkAndUnlockAchievements(
  sessionId: string
): Promise<Achievement[]> {
  const supabase = createSupabaseServerClient();

  // Fetch counts and already-unlocked in parallel
  const [annotationsRes, sectionsRes, scholarRes, unlockedRes] =
    await Promise.all([
      supabase
        .from("annotation_history")
        .select("id", { count: "exact", head: true })
        .eq("session_id", sessionId),
      supabase
        .from("section_progress")
        .select("id", { count: "exact", head: true })
        .eq("session_id", sessionId),
      supabase
        .from("annotation_history")
        .select("id", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .eq("knowledge_level", "scholar"),
      supabase
        .from("session_achievements")
        .select("achievement_id")
        .eq("session_id", sessionId),
    ]);

  const annotations = annotationsRes.count ?? 0;
  const sections = sectionsRes.count ?? 0;
  const scholarAnnotations = scholarRes.count ?? 0;
  const alreadyUnlocked = new Set(
    (unlockedRes.data ?? []).map((r) => r.achievement_id)
  );

  const counts = { annotations, sections, scholarAnnotations };
  const newlyUnlocked: Achievement[] = [];

  for (const [id, criterion] of Object.entries(ACHIEVEMENT_CRITERIA)) {
    if (alreadyUnlocked.has(id)) continue;
    if (!criterion(counts)) continue;

    const { error } = await supabase.from("session_achievements").insert({
      session_id: sessionId,
      achievement_id: id,
    });

    if (!error) {
      newlyUnlocked.push(ACHIEVEMENT_DATA[id]);
    }
  }

  return newlyUnlocked;
}
