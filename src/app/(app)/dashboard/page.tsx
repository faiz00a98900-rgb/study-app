"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { xpForNextLevel } from "@/lib/gamification";
import type { UserStats, Profile, DailyGoal } from "@/types";
import Link from "next/link";
import {
  Flame,
  Trophy,
  Zap,
  Upload,
  HelpCircle,
  Layers,
  Calendar,
  Target,
  TrendingUp,
  BookOpen,
  Clock,
  ChevronRight,
} from "lucide-react";

const quickActions = [
  { href: "/upload", label: "Upload Notes", icon: Upload, desc: "Add new study material" },
  { href: "/quiz", label: "Take a Quiz", icon: HelpCircle, desc: "Test your knowledge" },
  { href: "/flashcards", label: "Flashcards", icon: Layers, desc: "Review key concepts" },
  { href: "/planner", label: "Study Planner", icon: Calendar, desc: "View your schedule" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [statsRes, profileRes, goalsRes] = await Promise.all([
        supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("daily_goals").select("*").eq("user_id", user.id).eq("date", new Date().toISOString().split("T")[0]),
      ]);
      if (statsRes.data) setStats(statsRes.data);
      if (profileRes.data) setProfile(profileRes.data);
      if (goalsRes.data) setGoals(goalsRes.data);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const xpProgress = stats ? xpForNextLevel(stats.xp) : { current: 0, needed: 100, progress: 0 };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="hero-gradient pattern-overlay rounded-3xl p-7 lg:p-9 relative overflow-hidden">
        <div className="blob w-48 h-48 bg-accent/30 -top-10 -right-10" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-cream tracking-tight">
              {greeting}, {profile?.full_name?.split(" ")[0] || "Student"}!
            </h1>
            <p className="text-cream/60 mt-1.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-cream text-primary font-semibold px-6 py-3 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5 self-start"
          >
            <Upload className="w-4 h-4" />
            Upload Notes
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Streak", value: stats?.current_streak || 0, sub: `Best: ${stats?.longest_streak || 0} days`, icon: Flame, iconBg: "bg-danger/10", iconColor: "text-danger" },
          { label: "Total XP", value: stats?.xp || 0, sub: `Level ${stats?.level || 1}`, icon: Zap, iconBg: "bg-primary/10", iconColor: "text-primary" },
          { label: "Level", value: stats?.level || 1, sub: `${xpProgress.current}/${xpProgress.needed} XP`, icon: Trophy, iconBg: "bg-secondary/10", iconColor: "text-secondary", showBar: true },
          { label: "Sessions", value: stats?.total_study_sessions || 0, sub: `${stats?.total_quizzes || 0} quizzes done`, icon: BookOpen, iconBg: "bg-success/10", iconColor: "text-success" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-card-border rounded-3xl p-5 card-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-2xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <span className="text-sm text-muted font-medium">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
            {stat.showBar ? (
              <div className="mt-2.5">
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${xpProgress.progress}%` }} />
                </div>
                <p className="text-xs text-muted mt-1.5">{stat.sub}</p>
              </div>
            ) : (
              <p className="text-xs text-muted mt-1.5">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="bg-card border border-card-border rounded-3xl p-5 card-lift flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-foreground">{action.label}</span>
                    <p className="text-xs text-muted mt-0.5">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Daily Quests */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">Daily Quests</h2>
            </div>
            <div className="bg-card border border-card-border rounded-3xl p-5 space-y-4">
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <div key={goal.id} className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${goal.is_completed ? "bg-success/10" : "bg-surface"}`}>
                      {goal.goal_type === "study_sessions" && <Clock className={`w-4 h-4 ${goal.is_completed ? "text-success" : "text-muted"}`} />}
                      {goal.goal_type === "quizzes" && <HelpCircle className={`w-4 h-4 ${goal.is_completed ? "text-success" : "text-muted"}`} />}
                      {goal.goal_type === "flashcards" && <Layers className={`w-4 h-4 ${goal.is_completed ? "text-success" : "text-muted"}`} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${goal.is_completed ? "text-success line-through" : "text-foreground"}`}>
                        Complete {goal.target_count} {goal.goal_type.replace("_", " ")}
                      </p>
                      <div className="h-1.5 bg-surface rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${goal.is_completed ? "bg-success" : "bg-primary"}`}
                          style={{ width: `${Math.min((goal.completed_count / goal.target_count) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted font-medium">{goal.completed_count}/{goal.target_count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                  <p className="text-muted text-sm">No quests today yet. Start studying to unlock daily goals!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="bg-card border border-card-border rounded-3xl p-5">
            <h3 className="font-bold text-foreground tracking-tight mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Activity
            </h3>
            <div className="space-y-3">
              {[
                { label: "Study Sessions", value: stats?.total_study_sessions || 0 },
                { label: "Quizzes Taken", value: stats?.total_quizzes || 0 },
                { label: "Flashcards Reviewed", value: stats?.total_flashcards || 0 },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-muted">{item.label}</span>
                  <span className="text-sm font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-card-border rounded-3xl p-5">
            <h3 className="font-bold text-foreground tracking-tight mb-2">Study Tip</h3>
            <p className="text-sm text-muted leading-relaxed">
              Break your study sessions into 25-minute focused blocks with 5-minute breaks. This Pomodoro technique helps maintain concentration and improves retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
