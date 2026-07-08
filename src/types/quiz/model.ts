export interface QuizQuestion {
  id: string;
  order: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  correctCount: number;
  wrongCount: number;
}
