import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { awardXP, XP_REWARDS } from "@/lib/gamification";
import type { UserStats } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { activity, bonus } = await request.json();

    if (!activity || !(activity in XP_REWARDS)) {
      return NextResponse.json({ error: "Invalid activity" }, { status: 400 });
    }

    // Get current stats
    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!stats) {
      return NextResponse.json({ error: "User stats not found" }, { status: 404 });
    }

    // Calculate new stats
    const updatedStats = awardXP(stats as UserStats, activity as keyof typeof XP_REWARDS, bonus || 0);

    // Update counters
    const counterUpdates: Record<string, string> = {
      study_session: "total_study_sessions",
      quiz_completion: "total_quizzes",
      flashcard_review: "total_flashcards",
    };

    const counterField = counterUpdates[activity];
    if (counterField) {
      (updatedStats as Record<string, unknown>)[counterField] = ((stats as Record<string, unknown>)[counterField] as number) + 1;
    }

    // Save to database
    await supabase.from("user_stats").update(updatedStats).eq("user_id", user.id);

    return NextResponse.json({ success: true, stats: updatedStats });
  } catch (error) {
    console.error("Award XP error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to award XP" },
      { status: 500 }
    );
  }
}
