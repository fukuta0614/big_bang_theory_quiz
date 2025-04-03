import React, { useState } from 'react';
import quizData from '../../data/season01/episode01/quiz.json';
import './QuizScreen.css';

const QuizScreen: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

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
      <h1>Quiz Screen</h1>
      <div className="question-container">
        <h2>{currentQuestion.value}</h2>
        <p className="definition">{currentQuestion.definition}</p>
        <p className="script-context">
          ヒント: {currentQuestion.scriptContext}
        </p>
      </div>
      <ul className="options-list">
        {currentQuestion.options.map((option) => (
          <li key={option} className="option-item">
            <button
              className="option-button"
              onClick={() => handleAnswerClick(option)}
              disabled={showResult}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      {showResult && (
        <div className="result-container">
          {selectedAnswer === currentQuestion.correctAnswer ? (
            <p className="correct-answer">正解！</p>
          ) : (
            <p className="incorrect-answer">不正解！</p>
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
    </div>
  );
};

export default QuizScreen;
