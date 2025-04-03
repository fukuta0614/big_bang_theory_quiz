import React, { useState, useEffect } from 'react';
import './QuizScreen.css';
import Question from './Question';
import quizDataJson from '../../data/season01/episode01/quiz.json';

interface QuizScreenProps {
  season: string;
  episode: string;
  onGoHome: () => void;
}

interface QuestionData {
  type: string;
  value: string;
  definition: string;
  scriptContext: string;
  translation: string;
  options: string[];
  correctAnswer: string;
}

interface QuizData {
  questions: QuestionData[];
}

const QuizScreen: React.FC<QuizScreenProps> = ({ season, episode, onGoHome }) => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // const fetchQuizData = async () => {
    //   try {
    //     const response = await fetch(`../../data/season${season}/episode${episode}/quiz.json`);
    //     const data: QuizData = await response.json();
    //     setQuizData(data);
    //   } catch (error) {
    //     console.error('Error fetching quiz data:', error);
    //   }
    // };

    // fetchQuizData();

    setQuizData(quizDataJson as QuizData);

  }, [season, episode]);

  if (!quizData) {
    return <div>Loading...</div>;
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
  };

  const handleNextQuestionClick = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  return (
    <div className="quiz-container">
      <p>シーズン: {season} エピソード: {episode}</p>
      <Question
        question={currentQuestion.value}
        scriptContext={currentQuestion.scriptContext}
        options={currentQuestion.options}
        onAnswerClick={handleAnswerClick}
        showResult={showResult}
      />
      {showResult && (
        <div className="result-container">
          {selectedAnswer === currentQuestion.correctAnswer ? (
            <>
              <p className="correct-answer">正解！</p>
              <p className="definition">
                {currentQuestion.definition}
              </p>
            </>
          ) : (
            <>
              <p className="incorrect-answer">不正解！</p>
              <p className="definition">
                {currentQuestion.definition}
              </p>
            </>
          )}
          <p className="translation">
            {currentQuestion.translation}
          </p>
        </div>
      )}
      {currentQuestionIndex < quizData.questions.length - 1 ? (
        <button
          className="next-question-button"
          onClick={handleNextQuestionClick}
        >
          次の問題
        </button>
      ) : (
        <p className="quiz-finished">クイズは終了しました。</p>
      )}
      <button onClick={() => onGoHome()}>Homeに戻る</button>
    </div>
  );
}

export default QuizScreen;
