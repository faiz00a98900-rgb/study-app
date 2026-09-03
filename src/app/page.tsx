import Link from "next/link";
import {
  BookOpen,
  Brain,
  Upload,
  Calendar,
  HelpCircle,
  Layers,
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Notes",
    description: "Upload PDFs, images, or documents. Our OCR extracts text from any format.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Brain,
    title: "AI Topic Analysis",
    description: "AI identifies topics, difficulty, and importance from your notes automatically.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Calendar,
    title: "Smart Study Planner",
    description: "Get a personalized timetable based on exam dates, difficulty, and your schedule.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: HelpCircle,
    title: "AI Quiz Generator",
    description: "Practice with auto-generated quizzes: MCQs, True/False, Fill-in-the-blanks.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Layers,
    title: "Spaced Repetition Flashcards",
    description: "Smart flashcards that schedule reviews based on your memory strength.",
    color: "text-danger",
    bg: "bg-danger/10",
  },
  {
    icon: Trophy,
    title: "Gamification & Streaks",
    description: "Earn XP, level up, maintain streaks, and complete daily quests.",
    color: "text-primary-hover",
    bg: "bg-primary-hover/10",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-card-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground">StudyAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 lg:px-12 py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Learning Platform
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Upload Your Notes.
            <br />
            <span className="text-primary">Let AI Plan Your Study.</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
            Transform your study material into a personalized learning journey with AI-generated
            study plans, quizzes, flashcards, and gamified progress tracking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Start Studying Smarter
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-card-border hover:border-primary/50 text-foreground font-medium px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Core Loop */}
      <section className="px-6 lg:px-12 py-16 bg-surface border-y border-card-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
            {[
              { icon: Upload, label: "Upload Notes" },
              { icon: Brain, label: "AI Analysis" },
              { icon: Calendar, label: "Study Plan" },
              { icon: HelpCircle, label: "Quiz & Practice" },
              { icon: Flame, label: "XP & Streaks" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{step.label}</span>
                {i < 4 && <ArrowRight className="w-4 h-4 text-muted mx-2 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Everything You Need to Study Smarter
            </h2>
            <p className="text-muted text-lg mt-4 max-w-2xl mx-auto">
              From uploading notes to acing exams, StudyAI covers your entire learning workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-card-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 lg:px-12 py-16 bg-surface border-y border-card-border">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { icon: Zap, value: "AI-Powered", label: "Topic Analysis" },
            { icon: Brain, value: "Adaptive", label: "Learning Loop" },
            { icon: Flame, value: "Streaks", label: "& Gamification" },
            { icon: Trophy, value: "Personalized", label: "Study Plans" },
          ].map((stat) => (
            <div key={stat.label}>
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Study Routine?
          </h2>
          <p className="text-muted text-lg mb-8">
            Join StudyAI and let artificial intelligence create the perfect study plan for you.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 border-t border-card-border text-center">
        <p className="text-muted text-sm">StudyAI - AI-Powered Gamified Study System</p>
      </footer>
    </div>
  );
}
