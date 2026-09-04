"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { Upload, File, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import type { Subject, Note } from "@/types";

export default function UploadPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: subs } = await supabase.from("subjects").select("*").order("created_at", { ascending: false });
      if (subs) setSubjects(subs);
      const { data: noteData } = await supabase.from("notes").select("*").order("created_at", { ascending: false }).limit(10);
      if (noteData) setNotes(noteData);
    }
    loadData();
  }, [supabase]);

  async function addSubject() {
    if (!newSubjectName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("subjects")
      .insert({ user_id: user.id, name: newSubjectName.trim() })
      .select()
      .single();

    if (error) {
      setStatus({ type: "error", message: "Failed to add subject" });
      return;
    }
    setSubjects((prev) => [data, ...prev]);
    setSelectedSubject(data.id);
    setNewSubjectName("");
    setStatus(null);
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !selectedSubject) {
      setStatus({ type: "error", message: "Please select a subject first" });
      return;
    }

    setUploading(true);
    setStatus({ type: "info", message: "Uploading file..." });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("notes")
      .upload(fileName, file);

    if (uploadError) {
      setStatus({ type: "error", message: `Upload failed: ${uploadError.message}` });
      setUploading(false);
      return;
    }

    setStatus({ type: "info", message: "Processing with OCR..." });

    // Call our API route for OCR processing
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject_id", selectedSubject);
    formData.append("title", file.name);
    formData.append("file_url", fileName);
    formData.append("file_type", file.type);

    const response = await fetch("/api/process-upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    setUploading(false);

    if (!response.ok) {
      setStatus({ type: "error", message: result.error || "Processing failed" });
      return;
    }

    setStatus({ type: "success", message: "Notes processed successfully! Topics extracted." });

    // Refresh notes list
    const { data: noteData } = await supabase.from("notes").select("*").order("created_at", { ascending: false }).limit(10);
    if (noteData) setNotes(noteData);
  }, [selectedSubject, supabase]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "image/*": [".jpg", ".jpeg", ".png"] },
    maxFiles: 1,
    disabled: uploading || !selectedSubject,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Notes</h1>
        <p className="text-muted mt-1">Upload your study material and let AI analyze the content</p>
      </div>

      {/* Subject Selection */}
      <div className="bg-card border border-card-border rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Select Subject</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex-1 px-4 py-3 bg-surface border border-card-border rounded-2xl text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Choose a subject...</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="New subject name"
              className="px-4 py-3 bg-surface border border-card-border rounded-2xl text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
            />
            <button
              onClick={addSubject}
              className="px-6 py-3 btn-primary font-medium rounded-full transition-all whitespace-nowrap"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`bg-card border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-primary bg-primary/5"
            : selectedSubject
              ? "border-card-border hover:border-primary/50"
              : "border-card-border/50 opacity-50 cursor-not-allowed"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="text-foreground font-medium">Processing your notes...</p>
            <p className="text-muted text-sm">This may take a moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-muted mx-auto" />
            <div>
              <p className="text-foreground font-medium">
                {isDragActive ? "Drop your file here" : "Drag & drop your notes here"}
              </p>
              <p className="text-muted text-sm mt-1">or click to browse (PDF, JPG, PNG)</p>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      {status && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
          status.type === "success" ? "bg-success/10 border-success/30 text-success" :
          status.type === "error" ? "bg-danger/10 border-danger/30 text-danger" :
          "bg-primary/10 border-primary/30 text-primary"
        }`}>
          {status.type === "success" && <CheckCircle className="w-5 h-5" />}
          {status.type === "error" && <AlertCircle className="w-5 h-5" />}
          {status.type === "info" && <Loader2 className="w-5 h-5 animate-spin" />}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      {/* Recent Uploads */}
      {notes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Uploads</h2>
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="flex items-center gap-4 bg-card border border-card-border rounded-2xl p-4">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                  <File className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium truncate">{note.title}</p>
                  <p className="text-muted text-xs">
                    {new Date(note.created_at).toLocaleDateString()} &middot;{" "}
                    <span className={
                      note.status === "completed" ? "text-success" :
                      note.status === "error" ? "text-danger" : "text-accent"
                    }>
                      {note.status}
                    </span>
                  </p>
                </div>
                {note.ocr_confidence !== null && (
                  <span className="text-xs text-muted">OCR: {Math.round(note.ocr_confidence * 100)}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
