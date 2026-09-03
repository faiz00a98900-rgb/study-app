"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Topic, GeneratedFlashcard } from "@/types";
import { Layers, RotateCcw, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <FlashcardsContent />
    </Suspense>
  );
}

function FlashcardsContent() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState(topicParam || "");
  const [cards, setCards] = useState<GeneratedFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reviewHistory, setReviewHistory] = useState<Record<number, "again" | "hard" | "good" | "easy">>({});
  const supabase = createClient();

  useEffect(() => {
    async function loadTopics() {
      const { data } = await supabase.from("topics").select("*").order("importance_score", { ascending: false });
      if (data) setTopics(data);
    }
    loadTopics();
  }, [supabase]);

  async function generateFlashcards() {
    if (!selectedTopic) return;
    setGenerating(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewHistory({});

    const topic = topics.find((t) => t.id === selectedTopic);
    const response = await fetch("/api/generate-flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic_name: topic?.name,
        topic_summary: topic?.summary,
      }),
    });

    const data = await response.json();
    setCards(data.flashcards || []);
    setGenerating(false);
  }

  async function rateCard(rating: "again" | "hard" | "good" | "easy") {
    setReviewHistory({ ...reviewHistory, [currentIndex]: rating });

    // Save flashcard review
    const { data: { user } } = await supabase.auth.getUser();
    if (user && selectedTopic) {
      const card = cards[currentIndex];
      const difficultyMap = { again: 4, hard: 3, good: 2, easy: 1 };
      const intervalMap = { again: 1, hard: 3, good: 7, easy: 14 };

      await supabase.from("flashcards").insert({
        user_id: user.id,
        topic_id: selectedTopic,
        front: card.front,
        back: card.back,
        difficulty_rating: difficultyMap[rating],
        next_review_date: new Date(Date.now() + intervalMap[rating] * 86400000).toISOString().split("T")[0],
        times_reviewed: 1,
      });

      // Award XP
      await fetch("/api/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity: "flashcard_review" }),
      });
    }

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  }

  const reviewedCount = Object.keys(reviewHistory).length;
  const progress = cards.length > 0 ? (reviewedCount / cards.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Flashcards</h1>
        <p className="text-muted mt-1">Review concepts with spaced repetition flashcards</p>
      </div>

      {/* Topic Selection */}
      {cards.length === 0 && !generating && (
        <div className="bg-card border border-card-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Select a Topic</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="flex-1 px-4 py-3 bg-surface border border-card-border rounded-xl text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">Choose a topic...</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              onClick={generateFlashcards}
              disabled={!selectedTopic}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              Generate Flashcards
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-foreground font-medium">Creating flashcards...</p>
        </div>
      )}

      {/* Flashcard Interface */}
      {cards.length > 0 && (
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span className="text-sm text-muted">{reviewedCount} reviewed</span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          {/* Card */}
          <div
            className="perspective cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full min-h-[300px] transition-transform duration-500 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}>
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-card border border-card-border rounded-2xl p-8 flex flex-col items-center justify-center">
                <span className="text-xs text-muted uppercase tracking-wider mb-4">Question</span>
                <p className="text-xl font-semibold text-foreground text-center leading-relaxed">
                  {cards[currentIndex]?.front}
                </p>
                <p className="text-sm text-muted mt-6">Click to reveal answer</p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-card border border-primary/30 rounded-2xl p-8 flex flex-col items-center justify-center">
                <span className="text-xs text-primary uppercase tracking-wider mb-4">Answer</span>
                <p className="text-lg text-foreground text-center leading-relaxed">
                  {cards[currentIndex]?.back}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Buttons */}
          {isFlipped && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Again", rating: "again" as const, color: "bg-danger/15 text-danger hover:bg-danger/25" },
                { label: "Hard", rating: "hard" as const, color: "bg-accent/15 text-accent hover:bg-accent/25" },
                { label: "Good", rating: "good" as const, color: "bg-primary/15 text-primary hover:bg-primary/25" },
                { label: "Easy", rating: "easy" as const, color: "bg-success/15 text-success hover:bg-success/25" },
              ].map((btn) => (
                <button
                  key={btn.rating}
                  onClick={() => rateCard(btn.rating)}
                  className={`py-3 rounded-xl font-medium transition-colors ${btn.color}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsFlipped(false); }}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 text-muted hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>
            <button
              onClick={() => { setCards([]); setCurrentIndex(0); }}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              Back to Topics
            </button>
            <button
              onClick={() => { setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1)); setIsFlipped(false); }}
              disabled={currentIndex === cards.length - 1}
              className="flex items-center gap-1 text-muted hover:text-foreground disabled:opacity-30 transition-colors"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Completion */}
          {reviewedCount === cards.length && cards.length > 0 && (
            <div className="bg-success/10 border border-success/30 rounded-xl p-6 text-center">
              <Layers className="w-10 h-10 text-success mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground">All Cards Reviewed!</h3>
              <p className="text-muted text-sm mt-1">Great work! These cards will be scheduled for review based on your ratings.</p>
              <button
                onClick={() => { setCards([]); setCurrentIndex(0); setReviewHistory({}); }}
                className="mt-4 inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Study Another Topic
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
