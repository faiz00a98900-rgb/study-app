"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Topic, Quiz as QuizType } from "@/types";
import type { GeneratedQuestion } from "@/types";
import { HelpCircle, CheckCircle, XCircle, Loader2, Trophy, ArrowRight, RotateCcw } from "lucide-react";

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <QuizContent />
    </Suspense>
  );
}

function QuizContent() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState(topicParam || "");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadTopics() {
      const { data } = await supabase.from("topics").select("*").order("importance_score", { ascending: false });
      if (data) setTopics(data);
    }
    loadTopics();
  }, [supabase]);

  async function generateQuiz() {
    if (!selectedTopic) return;
    setGenerating(true);
    setAnswers({});
    setShowResults(false);

    const topic = topics.find((t) => t.id === selectedTopic);
    const response = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic_name: topic?.name,
        topic_summary: topic?.summary,
        difficulty: topic?.difficulty || "intermediate",
      }),
    });

    const data = await response.json();
    setQuestions(data.questions || []);
    setGenerating(false);
  }

  async function submitQuiz() {
    setLoading(true);
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i]?.toLowerCase().trim() === q.correct_answer.toLowerCase().trim()) {
        score++;
      }
    });

    // Save quiz result
    const { data: { user } } = await supabase.auth.getUser();
    if (user && selectedTopic) {
      const { data: quiz } = await supabase
        .from("quizzes")
        .insert({
          user_id: user.id,
          topic_id: selectedTopic,
          difficulty: topics.find((t) => t.id === selectedTopic)?.difficulty || "intermediate",
          score,
          total_questions: questions.length,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Award XP
      await fetch("/api/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: "quiz_completion",
          bonus: score === questions.length ? 50 : 0,
        }),
      });
    }

    setShowResults(true);
    setLoading(false);
  }

  const score = questions.reduce((acc, q, i) => {
    return acc + (answers[i]?.toLowerCase().trim() === q.correct_answer.toLowerCase().trim() ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quiz</h1>
        <p className="text-muted mt-1">Test your knowledge with AI-generated questions</p>
      </div>

      {/* Topic Selection */}
      {!questions.length && !generating && (
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
                <option key={t.id} value={t.id}>{t.name} ({t.difficulty})</option>
              ))}
            </select>
            <button
              onClick={generateQuiz}
              disabled={!selectedTopic}
              className="px-6 py-3 btn-primary font-semibold rounded-full transition-all disabled:opacity-50"
            >
              Generate Quiz
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-foreground font-medium">Generating quiz questions...</p>
        </div>
      )}

      {/* Quiz Questions */}
      {questions.length > 0 && !showResults && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {topics.find((t) => t.id === selectedTopic)?.name} Quiz
            </h2>
            <span className="text-sm text-muted">{questions.length} questions</span>
          </div>

          {questions.map((q, index) => (
            <div key={index} className="bg-card border border-card-border rounded-xl p-5">
              <p className="text-foreground font-medium mb-4">
                <span className="text-primary mr-2">Q{index + 1}.</span>
                {q.question_text}
              </p>
              {q.question_type === "fill_blank" ? (
                <input
                  type="text"
                  value={answers[index] || ""}
                  onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 bg-surface border border-card-border rounded-xl text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary"
                />
              ) : (
                <div className="space-y-2">
                  {q.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => setAnswers({ ...answers, [index]: option })}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                        answers[index] === option
                          ? "bg-primary/15 border-primary text-foreground"
                          : "bg-surface border-card-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={submitQuiz}
            disabled={loading || Object.keys(answers).length < questions.length}
            className="w-full py-4 btn-primary font-semibold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="space-y-6">
          <div className="bg-card border border-card-border rounded-2xl p-8 text-center">
            <Trophy className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground">Quiz Complete!</h2>
            <p className="text-4xl font-bold text-primary mt-4">
              {score}/{questions.length}
            </p>
            <p className="text-muted mt-2">
              {score === questions.length ? "Perfect score! Amazing!" : score >= questions.length * 0.7 ? "Great job!" : "Keep practicing!"}
            </p>
          </div>

          {questions.map((q, index) => {
            const isCorrect = answers[index]?.toLowerCase().trim() === q.correct_answer.toLowerCase().trim();
            return (
              <div key={index} className={`bg-card border rounded-xl p-5 ${isCorrect ? "border-success/30" : "border-danger/30"}`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{q.question_text}</p>
                    {!isCorrect && (
                      <p className="text-sm text-danger mt-1">Your answer: {answers[index]}</p>
                    )}
                    <p className="text-sm text-success mt-1">Correct: {q.correct_answer}</p>
                    <p className="text-sm text-muted mt-2">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex gap-3">
            <button
              onClick={() => { setQuestions([]); setShowResults(false); }}
              className="flex-1 py-3 btn-primary font-semibold rounded-full transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              New Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
