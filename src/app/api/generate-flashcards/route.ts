import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateFlashcards } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic_name, topic_summary, count } = body;

    if (!topic_name) {
      return NextResponse.json({ error: "Topic name is required" }, { status: 400 });
    }

    const flashcards = await generateFlashcards(
      topic_name,
      topic_summary || "",
      count || 5
    );

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error("Generate flashcards error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
