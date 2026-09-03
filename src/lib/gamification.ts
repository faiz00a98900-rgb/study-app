import type { UserStats } from "@/types";

// XP rewards
export const XP_REWARDS = {
  study_session: 50,
  quiz_completion: 30,
  flashcard_review: 10,
  daily_goal: 25,
  perfect_quiz: 50, // bonus
  streak_milestone: 100, // every 7 days
} as const;

// Level calculation: level = floor(sqrt(xp / 100)) + 1
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// XP needed for next level
export function xpForNextLevel(currentXp: number): { current: number; needed: number; progress: number } {
  const currentLevel = calculateLevel(currentXp);
  const nextLevelXp = currentLevel * currentLevel * 100;
  const currentLevelXp = (currentLevel - 1) * (currentLevel - 1) * 100;
  const progress = ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return {
    current: currentXp - currentLevelXp,
    needed: nextLevelXp - currentLevelXp,
    progress: Math.min(progress, 100),
  };
}

// Update streak based on last active date
export function updateStreak(stats: UserStats): Pick<UserStats, "current_streak" | "longest_streak" | "last_active_date"> {
  const today = new Date().toISOString().split("T")[0];
  const lastActive = stats.last_active_date;

  if (!lastActive) {
    return { current_streak: 1, longest_streak: Math.max(stats.longest_streak, 1), last_active_date: today };
  }

  const lastDate = new Date(lastActive);
  const todayDate = new Date(today);
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day - no change
    return { current_streak: stats.current_streak, longest_streak: stats.longest_streak, last_active_date: today };
  } else if (diffDays === 1) {
    // Consecutive day - increment streak
    const newStreak = stats.current_streak + 1;
    return { current_streak: newStreak, longest_streak: Math.max(stats.longest_streak, newStreak), last_active_date: today };
  } else {
    // Streak broken - reset
    return { current_streak: 1, longest_streak: stats.longest_streak, last_active_date: today };
  }
}

// Generate daily goals based on user progress
export function generateDailyGoals(stats: UserStats): Array<{ goal_type: string; target_count: number }> {
  const goals: Array<{ goal_type: string; target_count: number }> = [];

  // Always include a study session goal
  goals.push({ goal_type: "study_sessions", target_count: Math.min(stats.total_study_sessions < 5 ? 1 : 2, 3) });

  // Quiz goal
  if (stats.total_quizzes < 10) {
    goals.push({ goal_type: "quizzes", target_count: 1 });
  }

  // Flashcard goal
  goals.push({ goal_type: "flashcards", target_count: 5 });

  return goals;
}

// Award XP and update stats
export function awardXP(stats: UserStats, activity: keyof typeof XP_REWARDS, bonus: number = 0): Partial<UserStats> {
  const xpGained = XP_REWARDS[activity] + bonus;
  const newXp = stats.xp + xpGained;
  const newLevel = calculateLevel(newXp);
  const streakUpdate = updateStreak(stats);

  return {
    xp: newXp,
    level: newLevel,
    ...streakUpdate,
  };
}
