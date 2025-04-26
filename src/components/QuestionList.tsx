import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuestionList.css';

// Change 'word' to 'value' to match quiz.json structure
interface QuizItem {
  value: string;
  // Add other fields from your quiz.json structure if needed
  // e.g., id: number; options: string[]; correctAnswer: string; etc.
}

const QuestionList: React.FC = () => {
  const { seasonNumber, episodeNumber } = useParams<{ seasonNumber: string; episodeNumber: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      if (!seasonNumber || !episodeNumber) {
        setError("Season or episode number is missing.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/data/season${seasonNumber}/episode${episodeNumber}/quiz.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Adjust to expect an object with a 'questions' array
        const data: { questions: QuizItem[] } = await response.json();
        // Set state with the nested array
        setQuestions(data.questions);
      } catch (err) {
        console.error("Could not fetch questions:", err);
        setError("問題リストの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [seasonNumber, episodeNumber]);

  const handleStartFromQuestion = (index: number) => {
    navigate(`/quiz/season/${seasonNumber}/episode/${episodeNumber}`, { state: { startIndex: index } });
  };

  if (loading) {
    return <div className="question-list-container">読み込み中...</div>;
  }

  if (error) {
    return <div className="question-list-container error">{error}</div>;
  }

  return (
    <div className="question-list-container">
      <h1>シーズン {seasonNumber} エピソード {episodeNumber} 問題一覧</h1>
      <button onClick={() => navigate('/')} className="back-button">ホームに戻る</button>
      {questions.length > 0 ? (
        <ul className="question-list">
          {questions.map((question, index) => (
            <li key={index} className="question-list-item">
              {/* Display question.value instead of question.word */}
              <span>{index + 1}. {question.value}</span>
              <button onClick={() => handleStartFromQuestion(index)}>
                ここから始める
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>このエピソードには問題がありません。</p>
      )}
    </div>
  );
};

export default QuestionList;
