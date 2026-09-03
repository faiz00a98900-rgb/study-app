import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateQuestions } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic_name, topic_summary, difficulty, count } = body;

    if (!topic_name) {
      return NextResponse.json({ error: "Topic name is required" }, { status: 400 });
    }

    const questions = await generateQuestions(
      topic_name,
      topic_summary || "",
      difficulty || "intermediate",
      count || 5
    );

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Generate quiz error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
