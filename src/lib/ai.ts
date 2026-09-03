import type { TopicAnalysis, GeneratedQuestion, GeneratedFlashcard, StudyPlanSession } from "@/types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-key") {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Mock data generators for development without API key
function mockTopicAnalysis(): TopicAnalysis[] {
  return [
    { name: "Introduction to Algorithms", summary: "Fundamental concepts of algorithm design and analysis", difficulty: "basic", importance_score: 0.9, subtopics: ["Time Complexity", "Space Complexity", "Big-O Notation"], key_concepts: ["Efficiency", "Correctness", "Optimization"] },
    { name: "Data Structures", summary: "Core data structures used in computer science", difficulty: "intermediate", importance_score: 0.95, subtopics: ["Arrays", "Linked Lists", "Trees", "Graphs"], key_concepts: ["Abstraction", "Operations", "Trade-offs"] },
    { name: "Graph Algorithms", summary: "Algorithms for traversing and searching graphs", difficulty: "advanced", importance_score: 0.85, subtopics: ["BFS", "DFS", "Dijkstra", "A* Search"], key_concepts: ["Traversal", "Shortest Path", "Heuristic"] },
    { name: "Dynamic Programming", summary: "Optimization technique for overlapping subproblems", difficulty: "advanced", importance_score: 0.8, subtopics: ["Memoization", "Tabulation", "State Definition"], key_concepts: ["Optimal Substructure", "Overlapping Subproblems"] },
    { name: "Sorting Algorithms", summary: "Various approaches to sorting data efficiently", difficulty: "intermediate", importance_score: 0.75, subtopics: ["Quick Sort", "Merge Sort", "Heap Sort"], key_concepts: ["Comparison-based", "Divide and Conquer", "Stability"] },
  ];
}

function mockQuestions(): GeneratedQuestion[] {
  return [
    { question_text: "What is the time complexity of Binary Search?", question_type: "mcq", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correct_answer: "O(log n)", explanation: "Binary search divides the search space in half each step, giving O(log n)." },
    { question_text: "A stack follows LIFO (Last In, First Out) principle.", question_type: "true_false", options: ["True", "False"], correct_answer: "True", explanation: "Stack is a LIFO data structure where the last element added is the first to be removed." },
    { question_text: "The worst-case time complexity of Quick Sort is ___", question_type: "fill_blank", options: [], correct_answer: "O(n^2)", explanation: "Quick Sort degrades to O(n^2) when the pivot is always the smallest or largest element." },
    { question_text: "Which data structure uses FIFO principle?", question_type: "mcq", options: ["Stack", "Queue", "Tree", "Graph"], correct_answer: "Queue", explanation: "Queue follows First In, First Out (FIFO) ordering." },
    { question_text: "BFS uses a stack for traversal.", question_type: "true_false", options: ["True", "False"], correct_answer: "False", explanation: "BFS (Breadth-First Search) uses a queue, not a stack, for level-order traversal." },
  ];
}

function mockFlashcards(): GeneratedFlashcard[] {
  return [
    { front: "What is Big-O Notation?", back: "A mathematical notation describing the upper bound of an algorithm's time or space complexity as input size grows." },
    { front: "Define Recursion", back: "A technique where a function calls itself to solve smaller instances of the same problem, with a base case to terminate." },
    { front: "What is a Hash Table?", back: "A data structure that maps keys to values using a hash function for O(1) average-case lookup, insertion, and deletion." },
    { front: "Explain DFS", back: "Depth-First Search traverses a graph by exploring as far as possible along each branch before backtracking. Uses a stack." },
    { front: "What is Dynamic Programming?", back: "An optimization technique that solves complex problems by breaking them into overlapping subproblems and storing their solutions." },
  ];
}

function mockStudyPlan(): StudyPlanSession[] {
  const today = new Date();
  const sessions: StudyPlanSession[] = [];
  const topics = ["Data Structures", "Graph Algorithms", "Dynamic Programming", "Sorting Algorithms", "Introduction to Algorithms"];
  const priorities: Array<"high" | "medium" | "low"> = ["high", "high", "medium", "medium", "low"];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    sessions.push({
      topic_name: topics[i % topics.length],
      date: date.toISOString().split("T")[0],
      time: i % 2 === 0 ? "09:00" : "14:00",
      duration_minutes: 45 + (i % 3) * 15,
      priority: priorities[i % priorities.length],
    });
  }
  return sessions;
}

export async function analyzeTopics(text: string, subject: string): Promise<TopicAnalysis[]> {
  try {
    const result = await callGemini(
      "You are an expert academic analyst. Extract topics from study notes and assess their importance and difficulty. Respond with valid JSON only.",
      `Analyze the following study notes for the subject "${subject}". Extract all topics and for each provide: name, summary, difficulty (basic/intermediate/advanced), importance_score (0-1), subtopics array, and key_concepts array.

Return JSON format: { "topics": [{ "name": "...", "summary": "...", "difficulty": "...", "importance_score": 0.8, "subtopics": [...], "key_concepts": [...] }] }

Notes:
${text.slice(0, 4000)}`
    );
    const parsed = JSON.parse(result);
    return parsed.topics || [];
  } catch (error) {
    if ((error as Error).message === "GEMINI_API_KEY_NOT_CONFIGURED") {
      return mockTopicAnalysis();
    }
    throw error;
  }
}

export async function generateQuestions(
  topicName: string,
  topicSummary: string,
  difficulty: string,
  count: number = 5
): Promise<GeneratedQuestion[]> {
  try {
    const result = await callGemini(
      "You are an expert quiz creator. Generate educational quiz questions. Respond with valid JSON only.",
      `Generate ${count} quiz questions about "${topicName}" (${topicSummary}) at ${difficulty} difficulty. Mix question types: mcq, true_false, fill_blank.

Return JSON format: { "questions": [{ "question_text": "...", "question_type": "mcq", "options": ["A", "B", "C", "D"], "correct_answer": "...", "explanation": "..." }] }`
    );
    const parsed = JSON.parse(result);
    return parsed.questions || [];
  } catch (error) {
    if ((error as Error).message === "GEMINI_API_KEY_NOT_CONFIGURED") {
      return mockQuestions().slice(0, count);
    }
    throw error;
  }
}

export async function generateFlashcards(
  topicName: string,
  topicSummary: string,
  count: number = 5
): Promise<GeneratedFlashcard[]> {
  try {
    const result = await callGemini(
      "You are an expert at creating study flashcards. Create concise, clear flashcards. Respond with valid JSON only.",
      `Generate ${count} flashcards about "${topicName}" (${topicSummary}). Each flashcard should have a clear front (question/concept) and back (answer/explanation).

Return JSON format: { "flashcards": [{ "front": "...", "back": "..." }] }`
    );
    const parsed = JSON.parse(result);
    return parsed.flashcards || [];
  } catch (error) {
    if ((error as Error).message === "GEMINI_API_KEY_NOT_CONFIGURED") {
      return mockFlashcards().slice(0, count);
    }
    throw error;
  }
}

export async function generateStudyPlan(
  topics: Array<{ name: string; difficulty: string; importance_score: number }>,
  examDate: string | null,
  studyHoursPerDay: number,
  preferredTimes: string
): Promise<StudyPlanSession[]> {
  try {
    const result = await callGemini(
      "You are an expert study planner. Create personalized study schedules. Respond with valid JSON only.",
      `Create a 7-day study plan given these topics: ${JSON.stringify(topics)}. Exam date: ${examDate || "none set"}. Available: ${studyHoursPerDay} hours/day, preferred time: ${preferredTimes}.

Return JSON: { "sessions": [{ "topic_name": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "duration_minutes": 45, "priority": "high/medium/low" }] }`
    );
    const parsed = JSON.parse(result);
    return parsed.sessions || [];
  } catch (error) {
    if ((error as Error).message === "GEMINI_API_KEY_NOT_CONFIGURED") {
      return mockStudyPlan();
    }
    throw error;
  }
}
