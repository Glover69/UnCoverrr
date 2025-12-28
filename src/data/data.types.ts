export type GameQuestion = {
  id: string;                    // Unique question ID
  albumCover: string;            // Image URL
  albumName: string;             // "Blonde"
  correctAnswer: string;         // "Frank Ocean"
  options: string[];             // ["Frank Ocean", "Tyler the Creator", "Kendrick Lamar", "Drake"]
  genre?: string;                // "R&B" (optional, for hints)
  difficulty?: 'easy' | 'medium' | 'hard';
  releaseDate?: string;          // 2016 (optional extra info)
}


export type GameData = {
  questions: GameQuestion[];     // Array of 100 questions
  totalQuestions: number;        // 100
  generatedAt?: string;           // Timestamp
}
