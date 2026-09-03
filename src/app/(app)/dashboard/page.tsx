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
  { href: "/upload", label: "Upload Notes", icon: Upload, color: "bg-secondary/15 text-secondary hover:border-secondary/40" },
  { href: "/quiz", label: "Take a Quiz", icon: HelpCircle, color: "bg-success/15 text-success hover:border-success/40" },
  { href: "/flashcards", label: "Flashcards", icon: Layers, color: "bg-accent/15 text-accent hover:border-accent/40" },
  { href: "/planner", label: "Study Planner", icon: Calendar, color: "bg-primary/15 text-primary hover:border-primary/40" },
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
      <div className="bg-gradient-to-r from-primary/20 via-card to-secondary/10 border border-card-border rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {greeting}, {profile?.full_name?.split(" ")[0] || "Student"}!
            </h1>
            <p className="text-muted mt-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors self-start"
          >
            <Upload className="w-4 h-4" />
            Upload Notes
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-danger/15 flex items-center justify-center">
              <Flame className="w-5 h-5 text-danger" />
            </div>
            <span className="text-sm text-muted">Streak</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{stats?.current_streak || 0}</div>
          <p className="text-xs text-muted mt-1">Best: {stats?.longest_streak || 0} days</p>
        </div>

        {/* XP */}
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted">Total XP</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{stats?.xp || 0}</div>
          <p className="text-xs text-muted mt-1">Level {stats?.level || 1}</p>
        </div>

        {/* Level */}
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted">Level</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{stats?.level || 1}</div>
          <div className="mt-2">
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${xpProgress.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted mt-1">{xpProgress.current}/{xpProgress.needed} XP</p>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-muted">Sessions</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{stats?.total_study_sessions || 0}</div>
          <p className="text-xs text-muted mt-1">{stats?.total_quizzes || 0} quizzes done</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-4 p-5 rounded-2xl border border-card-border transition-all duration-200 ${action.color}`}
                >
                  <action.icon className="w-6 h-6" />
                  <div className="flex-1">
                    <span className="font-semibold text-foreground">{action.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted" />
                </Link>
              ))}
            </div>
          </div>

          {/* Daily Quests */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">Daily Quests</h2>
            </div>
            <div className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <div key={goal.id} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${goal.is_completed ? "bg-success/15" : "bg-surface"}`}>
                      {goal.goal_type === "study_sessions" && <Clock className={`w-4 h-4 ${goal.is_completed ? "text-success" : "text-muted"}`} />}
                      {goal.goal_type === "quizzes" && <HelpCircle className={`w-4 h-4 ${goal.is_completed ? "text-success" : "text-muted"}`} />}
                      {goal.goal_type === "flashcards" && <Layers className={`w-4 h-4 ${goal.is_completed ? "text-success" : "text-muted"}`} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${goal.is_completed ? "text-success line-through" : "text-foreground"}`}>
                        Complete {goal.target_count} {goal.goal_type.replace("_", " ")}
                      </p>
                      <div className="h-1.5 bg-surface rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${goal.is_completed ? "bg-success" : "bg-primary"}`}
                          style={{ width: `${Math.min((goal.completed_count / goal.target_count) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted">{goal.completed_count}/{goal.target_count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Target className="w-10 h-10 text-muted mx-auto mb-3" />
                  <p className="text-muted text-sm">No quests today yet. Start studying to unlock daily goals!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Activity Summary */}
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Activity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Study Sessions</span>
                <span className="text-sm font-semibold text-foreground">{stats?.total_study_sessions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Quizzes Taken</span>
                <span className="text-sm font-semibold text-foreground">{stats?.total_quizzes || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Flashcards Reviewed</span>
                <span className="text-sm font-semibold text-foreground">{stats?.total_flashcards || 0}</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-card-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-2">Study Tip</h3>
            <p className="text-sm text-muted leading-relaxed">
              Break your study sessions into 25-minute focused blocks with 5-minute breaks. This Pomodoro technique helps maintain concentration and improves retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
