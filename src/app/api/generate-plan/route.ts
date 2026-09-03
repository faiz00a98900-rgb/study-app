import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStudyPlan } from "@/lib/ai";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get user's topics and profile
    const [topicsRes, profileRes] = await Promise.all([
      supabase.from("topics").select("*").eq("user_id", user.id).order("importance_score", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

    const topics = topicsRes.data || [];
    const profile = profileRes.data;

    // Get earliest exam date from subjects
    const { data: subjects } = await supabase.from("subjects").select("exam_date").eq("user_id", user.id).not("exam_date", "is", null);
    const examDate = subjects?.[0]?.exam_date || null;

    if (topics.length === 0) {
      return NextResponse.json({ error: "No topics found. Upload notes first." }, { status: 400 });
    }

    // Generate study plan
    const planSessions = await generateStudyPlan(
      topics.map((t) => ({ name: t.name, difficulty: t.difficulty, importance_score: t.importance_score })),
      examDate,
      profile?.study_hours_per_day || 2,
      profile?.preferred_times || "morning"
    );

    // Clear old unscheduled sessions for this user
    await supabase.from("study_sessions").delete().eq("user_id", user.id).eq("status", "scheduled");

    // Insert new sessions
    const sessionsToInsert = planSessions.map((session) => {
      const matchingTopic = topics.find((t) => t.name.toLowerCase().includes(session.topic_name.toLowerCase()) || session.topic_name.toLowerCase().includes(t.name.toLowerCase()));
      return {
        user_id: user.id,
        topic_id: matchingTopic?.id || topics[0].id,
        scheduled_date: session.date,
        scheduled_time: session.time,
        duration_minutes: session.duration_minutes,
        status: "scheduled",
      };
    });

    if (sessionsToInsert.length > 0) {
      await supabase.from("study_sessions").insert(sessionsToInsert);
    }

    return NextResponse.json({ success: true, sessions: sessionsToInsert.length });
  } catch (error) {
    console.error("Generate plan error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate plan" },
      { status: 500 }
    );
  }
}
