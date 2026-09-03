export interface Profile {
  id: string;
  full_name: string;
  academic_level: string;
  course: string;
  study_hours_per_day: number;
  preferred_times: string;
  created_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  exam_date: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  file_url: string;
  file_type: string;
  raw_text: string | null;
  ocr_confidence: number | null;
  status: "uploading" | "processing" | "completed" | "error";
  created_at: string;
}

export interface Topic {
  id: string;
  note_id: string;
  subject_id: string;
  user_id: string;
  name: string;
  summary: string;
  difficulty: "basic" | "intermediate" | "advanced";
  importance_score: number;
  is_mastered: boolean;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  topic_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: "scheduled" | "completed" | "skipped";
  completed_at: string | null;
  topic?: Topic;
}

export interface Quiz {
  id: string;
  user_id: string;
  topic_id: string;
  difficulty: string;
  score: number | null;
  total_questions: number;
  completed_at: string | null;
  created_at: string;
  topic?: Topic;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "mcq" | "true_false" | "fill_blank" | "multiple_select" | "scenario" | "conceptual" | "numerical";
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizAnswer {
  id: string;
  quiz_question_id: string;
  quiz_id: string;
  user_id: string;
  selected_answer: string;
  is_correct: boolean;
}

export interface Flashcard {
  id: string;
  user_id: string;
  topic_id: string;
  front: string;
  back: string;
  difficulty_rating: number;
  next_review_date: string;
  times_reviewed: number;
  created_at: string;
  topic?: Topic;
}

export interface UserStats {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_study_sessions: number;
  total_quizzes: number;
  total_flashcards: number;
}

export interface DailyGoal {
  id: string;
  user_id: string;
  date: string;
  goal_type: string;
  target_count: number;
  completed_count: number;
  is_completed: boolean;
}

export interface TopicAnalysis {
  name: string;
  summary: string;
  difficulty: "basic" | "intermediate" | "advanced";
  importance_score: number;
  subtopics: string[];
  key_concepts: string[];
}

export interface GeneratedQuestion {
  question_text: string;
  question_type: "mcq" | "true_false" | "fill_blank";
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

export interface StudyPlanSession {
  topic_name: string;
  topic_id?: string;
  date: string;
  time: string;
  duration_minutes: number;
  priority: "high" | "medium" | "low";
}
