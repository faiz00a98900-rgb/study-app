"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Topic, Subject } from "@/types";
import { Brain, Star, TrendingUp, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import Link from "next/link";

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"importance" | "difficulty" | "name">("importance");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const [topicsRes, subsRes] = await Promise.all([
        supabase.from("topics").select("*").order("importance_score", { ascending: false }),
        supabase.from("subjects").select("*"),
      ]);
      if (topicsRes.data) setTopics(topicsRes.data);
      if (subsRes.data) setSubjects(subsRes.data);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const filteredTopics = topics
    .filter((t) => selectedSubject === "all" || t.subject_id === selectedSubject)
    .sort((a, b) => {
      if (sortBy === "importance") return b.importance_score - a.importance_score;
      if (sortBy === "difficulty") {
        const order = { advanced: 3, intermediate: 2, basic: 1 };
        return order[b.difficulty] - order[a.difficulty];
      }
      return a.name.localeCompare(b.name);
    });

  const difficultyColors: Record<string, string> = {
    basic: "bg-success/15 text-success",
    intermediate: "bg-accent/15 text-accent",
    advanced: "bg-danger/15 text-danger",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Topics</h1>
          <p className="text-muted mt-1">AI-extracted topics ranked by importance and difficulty</p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm self-start"
        >
          <BookOpen className="w-4 h-4" />
          Upload More Notes
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-card-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2.5 bg-surface border border-card-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary"
        >
          <option value="importance">Sort by Importance</option>
          <option value="difficulty">Sort by Difficulty</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Topics List */}
      {filteredTopics.length === 0 ? (
        <div className="bg-card border border-card-border rounded-2xl p-12 text-center">
          <Brain className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Topics Yet</h3>
          <p className="text-muted text-sm">Upload your notes to see AI-extracted topics here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic, index) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              rank={index + 1}
              difficultyColors={difficultyColors}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic, rank, difficultyColors }: { topic: Topic; rank: number; difficultyColors: Record<string, string> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank */}
        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-sm font-bold text-muted">
          #{rank}
        </div>

        {/* Importance Bar */}
        <div className="w-16">
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${topic.importance_score * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted">{Math.round(topic.importance_score * 100)}%</span>
        </div>

        {/* Topic Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{topic.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[topic.difficulty] || ""}`}>
              {topic.difficulty}
            </span>
            {topic.is_mastered && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">Mastered</span>
            )}
          </div>
          <p className="text-muted text-sm mt-0.5 truncate">{topic.summary}</p>
        </div>

        {/* Expand */}
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted" />
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-card-border pt-3">
          <p className="text-sm text-foreground leading-relaxed">{topic.summary}</p>
          <div className="flex items-center gap-4 mt-3">
            <Link
              href={`/quiz?topic=${topic.id}`}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              Take Quiz
            </Link>
            <Link
              href={`/flashcards?topic=${topic.id}`}
              className="text-sm text-secondary hover:text-secondary/80 font-medium"
            >
              Study Flashcards
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
