import React, { useState, useEffect } from 'react';
// Removed useParams and Link imports
import './WordList.css'; // Assuming a CSS file exists or will be created

// Define the structure for a single question based on quiz.json
interface QuestionData {
  id: number;
  value: string; // Changed from 'word' to 'value'
  options: string[];
  correctAnswer: string;
  explanation: string;
  etymology: string;
  pronounciation: string;
  scriptContext: string;
  scriptContextTranslation: string;
}

// Define the structure for the entire quiz data
interface QuizData {
  questions: QuestionData[];
}

// Define the props the component will receive from App.tsx
interface WordListProps {
  season: string;
  episode: string;
  onStartQuiz: (season: string, episode: string, index: number) => void;
  onGoHome: () => void;
}

const WordList: React.FC<WordListProps> = ({ season, episode, onStartQuiz, onGoHome }) => {
  // State to hold the list of questions
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state on new fetch
        const response = await fetch(`/data/season${season}/episode${episode}/quiz.json`);
        if (!response.ok) {
          // Provide more specific error message if file not found
          if (response.status === 404) {
            throw new Error(`Quiz data not found for Season ${season}, Episode ${episode}.`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: QuizData = await response.json();
        // Ensure data.questions is an array before setting state
        if (Array.isArray(data.questions)) {
          setQuestions(data.questions);
        } else {
          console.error("Fetched data.questions is not an array:", data);
          setQuestions([]); // Set to empty array if data is invalid
          throw new Error("Invalid quiz data format received.");
        }
      } catch (e: unknown) {
        setError((e as Error).message);
        setQuestions([]); // Clear questions on error
      } finally {
        setLoading(false);
      }
    };

    // Fetch data only if season and episode are provided
    if (season && episode) {
      fetchQuizData();
    } else {
      // Handle cases where season/episode might be missing initially
      setLoading(false);
      setError("Season or episode not specified.");
    }
  }, [season, episode]); // Depend on props

  if (loading) {
    return <div className="loading">Loading word list...</div>;
  }

  if (error) {
    return <div className="error">Error loading word list: {error}</div>;
  }

  // Handle case where no questions are found
  if (questions.length === 0) {
    return (
      <div className="wordlist-container">
        <h1>シーズン {season} - エピソード {episode}</h1>
        <p>このエピソードには問題が見つかりませんでした。</p>
        <button onClick={onGoHome} className="home-button">Homeに戻る</button>
      </div>
    );
  }

  return (
    <div className="wordlist-container">
      <h1>シーズン {season} - エピソード {episode} の問題一覧</h1>
      <ul className="word-list">
        {questions.map((question, index) => (
          <li key={question.id || index} className="word-item"> {/* Use question.id if available, otherwise index */}
            <span className="word-value">{question.value}</span>
            <button
              onClick={() => onStartQuiz(season, episode, index)} // Pass index to start quiz from this question
              className="start-from-here-button"
            >
              ここから始める
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onGoHome} className="home-button">Homeに戻る</button>
    </div>
  );
};

export default WordList;
