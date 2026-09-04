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
  ArrowRight,
  Sparkles,
  GraduationCap,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Notes",
    description: "Upload PDFs, images, or documents. AI extracts and understands your content instantly.",
  },
  {
    icon: Brain,
    title: "AI Topic Analysis",
    description: "AI identifies important topics, difficulty levels, and key concepts from your notes.",
  },
  {
    icon: Calendar,
    title: "Smart Study Planner",
    description: "Get a personalized study timetable based on exam dates and topic priority.",
  },
  {
    icon: HelpCircle,
    title: "AI Quiz Generator",
    description: "Practice with auto-generated quizzes — MCQs, True/False, and Fill-in-the-blanks.",
  },
  {
    icon: Layers,
    title: "Spaced Repetition",
    description: "Smart flashcards that schedule reviews based on how well you remember each concept.",
  },
  {
    icon: Trophy,
    title: "Gamification & Streaks",
    description: "Earn XP, level up, maintain study streaks, and complete daily quests.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#FAF5EF" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-16 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#5C1F2C" }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "#5C1F2C", fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            StudyAI
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="text-sm font-medium hidden sm:block"
            style={{ color: "#4A3F3A" }}
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="text-sm font-bold text-white px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "#5C1F2C" }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 lg:px-16 pt-16 pb-24 lg:pt-24 lg:pb-36 max-w-5xl">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
          style={{ background: "#F0E8DD", color: "#4A3F3A" }}
        >
          <Sparkles className="w-4 h-4" style={{ color: "#5C1F2C" }} />
          AI study assistant for college students
        </div>

        {/* Headline */}
        <h1
          className="leading-[1.05] tracking-tight mb-8"
          style={{ color: "#5C1F2C", fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          <span className="block text-5xl lg:text-6xl font-bold">
            Turn Your Notes Into
          </span>
          <span className="block text-6xl lg:text-8xl font-bold mt-2">
            Your Exam Strategy.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed" style={{ color: "#6B5E57" }}>
          Upload your notes or PDF and let AI find the important questions you should focus on.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg text-base"
            style={{ background: "#5C1F2C" }}
          >
            Generate Questions Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 text-base"
            style={{ background: "#FFFFFF", color: "#4A3F3A", border: "1px solid #E0D6CC" }}
          >
            See How It Works
          </Link>
        </div>

        {/* Footer tagline */}
        <p className="text-sm font-medium" style={{ color: "#6B5E57" }}>
          Study less randomly. Study what matters.
        </p>
      </section>

      {/* Features Section */}
      <section className="px-6 lg:px-16 py-24" style={{ background: "#F5EDE4" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl lg:text-5xl font-bold tracking-tight mb-5"
              style={{ color: "#5C1F2C", fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Everything You Need to Study Smarter
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#6B5E57" }}>
              From uploading notes to acing exams, StudyAI covers your entire learning workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="rounded-3xl p-7 card-lift animate-fade-in"
                style={{ background: "#FFFFFF", border: "1px solid #E8DDD3", animationDelay: `${idx * 80}ms` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "#FAF5EF" }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: "#5C1F2C" }} />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2" style={{ color: "#2D1B1B" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B5E57" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-16 py-24" style={{ background: "#FAF5EF" }}>
        <div
          className="max-w-4xl mx-auto rounded-[40px] p-12 lg:p-16 text-center relative overflow-hidden"
          style={{ background: "#5C1F2C" }}
        >
          <div className="blob w-64 h-64 top-0 right-0 opacity-15" style={{ background: "#A85A6A" }} />
          <div className="relative z-10">
            <h2
              className="text-3xl lg:text-5xl font-bold tracking-tight mb-5"
              style={{ color: "#FAF5EF", fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Ready to Transform Your Study Routine?
            </h2>
            <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "rgba(250,245,239,0.65)" }}>
              Join StudyAI and let artificial intelligence create the perfect study plan for you.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 font-bold px-10 py-4 rounded-full transition-all hover:shadow-xl hover:-translate-y-0.5 text-lg"
              style={{ background: "#FAF5EF", color: "#5C1F2C" }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-16 py-10 text-center" style={{ background: "#FAF5EF", borderTop: "1px solid #E8DDD3" }}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#5C1F2C" }}>
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold" style={{ color: "#5C1F2C" }}>StudyAI</span>
        </div>
        <p className="text-sm" style={{ color: "#6B5E57" }}>AI-Powered Gamified Study System</p>
      </footer>
    </div>
  );
}
