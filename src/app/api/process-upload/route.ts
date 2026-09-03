import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { performOCR } from "@/lib/ocr";
import { analyzeTopics } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const subjectId = formData.get("subject_id") as string;
    const title = formData.get("title") as string;
    const fileUrl = formData.get("file_url") as string;
    const fileType = formData.get("file_type") as string;

    if (!file || !subjectId) {
      return NextResponse.json({ error: "Missing file or subject" }, { status: 400 });
    }

    // Create note record
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        subject_id: subjectId,
        title,
        file_url: fileUrl,
        file_type: fileType,
        status: "processing",
      })
      .select()
      .single();

    if (noteError) {
      return NextResponse.json({ error: noteError.message }, { status: 500 });
    }

    // Perform OCR
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { text, confidence } = await performOCR(fileBuffer, fileType);

    // Update note with OCR text
    await supabase.from("notes").update({ raw_text: text, ocr_confidence: confidence }).eq("id", note.id);

    // Get subject name for AI analysis
    const { data: subject } = await supabase.from("subjects").select("name").eq("id", subjectId).single();

    // AI Topic Analysis
    const topicAnalysis = await analyzeTopics(text, subject?.name || "General");

    // Store topics in database
    const topicRows = topicAnalysis.map((t) => ({
      note_id: note.id,
      subject_id: subjectId,
      user_id: user.id,
      name: t.name,
      summary: t.summary,
      difficulty: t.difficulty,
      importance_score: t.importance_score,
    }));

    if (topicRows.length > 0) {
      await supabase.from("topics").insert(topicRows);
    }

    // Update note status
    await supabase.from("notes").update({ status: "completed" }).eq("id", note.id);

    return NextResponse.json({
      success: true,
      note,
      topics: topicAnalysis,
      text_length: text.length,
      confidence,
    });
  } catch (error) {
    console.error("Upload processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    );
  }
}
