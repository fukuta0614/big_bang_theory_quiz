// Defines the structure for a single quiz question
export interface QuestionData {
  value: string; // The question text itself (often a phrase from the script)
  options: string[]; // Multiple choice answers
  correctAnswer: string; // The correct answer among the options
  explanation: string; // Explanation shown after answering
  season: string; // Season number (e.g., "01")
  episode: string; // Episode number (e.g., "01")
}

// Defines the structure for the entire quiz data for an episode
export interface QuizData {
  questions: QuestionData[]; // An array of questions
}
