"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudySession, Topic } from "@/types";
import { Calendar, Clock, CheckCircle, Circle, SkipForward, Loader2 } from "lucide-react";

export default function PlannerPage() {
  const [sessions, setSessions] = useState<Array<StudySession & { topic?: Topic }>>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    const { data } = await supabase
      .from("study_sessions")
      .select("*, topic:topics(*)")
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true });
    if (data) setSessions(data as Array<StudySession & { topic?: Topic }>);
    setLoading(false);
  }

  async function generatePlan() {
    setGenerating(true);
    const response = await fetch("/api/generate-plan");
    if (response.ok) {
      await loadSessions();
    }
    setGenerating(false);
  }

  async function updateSessionStatus(sessionId: string, status: "completed" | "skipped" | "scheduled") {
    await supabase
      .from("study_sessions")
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", sessionId);

    // Award XP for completing a session
    if (status === "completed") {
      await fetch("/api/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity: "study_session" }),
      });
    }

    await loadSessions();
  }

  // Group sessions by date
  const groupedSessions = sessions.reduce<Record<string, typeof sessions>>((acc, session) => {
    const date = session.scheduled_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  const priorityColors: Record<string, string> = {
    high: "border-l-danger",
    medium: "border-l-accent",
    low: "border-l-success",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Planner</h1>
          <p className="text-muted mt-1">Your personalized study schedule based on topic priority</p>
        </div>
        <button
          onClick={generatePlan}
          disabled={generating}
          className="inline-flex items-center gap-2 btn-primary font-medium px-5 py-2.5 rounded-full transition-all text-sm disabled:opacity-50 self-start"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
          {generating ? "Generating..." : "Generate Plan"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-card border border-card-border rounded-3xl p-12 text-center">
          <Calendar className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Study Plan Yet</h3>
          <p className="text-muted text-sm mb-6">
            Upload notes and analyze topics first, then generate a personalized study plan.
          </p>
          <button
            onClick={generatePlan}
            disabled={generating}
            className="inline-flex items-center gap-2 btn-primary font-medium px-6 py-3 rounded-full transition-all disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Generate Study Plan
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSessions).map(([date, dateSessions]) => {
            const dateObj = new Date(date + "T00:00:00");
            const isToday = date === new Date().toISOString().split("T")[0];
            return (
              <div key={date}>
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  {isToday && <span className="w-2 h-2 rounded-full bg-primary" />}
                  {isToday ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  <span className="text-muted text-sm font-normal">({dateSessions.length} sessions)</span>
                </h2>
                <div className="space-y-3">
                  {dateSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`bg-card border border-card-border rounded-2xl p-4 border-l-4 ${
                        priorityColors[session.topic?.difficulty === "advanced" ? "high" : session.topic?.difficulty === "intermediate" ? "medium" : "low"] || "border-l-muted"
                      } ${session.status === "completed" ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => updateSessionStatus(session.id, session.status === "completed" ? "scheduled" : "completed")}
                          className="shrink-0"
                        >
                          {session.status === "completed" ? (
                            <CheckCircle className="w-6 h-6 text-success" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted hover:text-primary transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold ${session.status === "completed" ? "text-muted line-through" : "text-foreground"}`}>
                            {session.topic?.name || "Study Session"}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-muted flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {session.scheduled_time} &middot; {session.duration_minutes}min
                            </span>
                          </div>
                        </div>
                        {session.status === "scheduled" && (
                          <button
                            onClick={() => updateSessionStatus(session.id, "skipped")}
                            className="text-muted hover:text-danger transition-colors"
                            title="Skip session"
                          >
                            <SkipForward className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
