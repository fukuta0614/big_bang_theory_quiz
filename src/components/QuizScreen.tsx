import React, { useState, useEffect, useCallback } from 'react';
import './QuizScreen.css';
import Question from './Question';
import ResultModal from './ResultModal'; // Import the new modal component
import { QuizData } from '../types'; // Import types
import {
  fetchQuizDataForEpisode,
  fetchScriptContextForQuestion,
  saveIncorrectQuestionsToStorage,
  updateIncorrectQuestionsInStorage,
} from '../utils/quizUtils'; // Import utility functions

interface QuizScreenProps {
  season: string;
  episode: string;
  onGoHome: () => void;
  review?: boolean;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ season, episode, onGoHome, review }) => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]); // Initialize as empty array
  const [showResultModal, setShowResultModal] = useState(false);
  const [scriptContext, setScriptContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Fetch Quiz Data
  useEffect(() => {
    const loadQuiz = async () => {
      setIsLoading(true);
      const data = await fetchQuizDataForEpisode(season, episode, review);
      setQuizData(data);
      if (data) {
        // Initialize userAnswers based on the fetched questions
        setUserAnswers(new Array(data.questions.length).fill(null));
      }
      setIsLoading(false);
    };
    loadQuiz();
  }, [season, episode, review]);

  // Fetch Script Context when question changes
  useEffect(() => {
    const loadScriptContext = async () => {
      if (quizData && quizData.questions.length > 0) {
        const currentQuestion = quizData.questions[currentQuestionIndex];
        // Determine the correct season/episode for the context fetch
        const questionSeason = review ? currentQuestion.season : season;
        const questionEpisode = review ? currentQuestion.episode : episode;
        // Pass the full question object including potentially updated season/episode
        const context = await fetchScriptContextForQuestion({
            ...currentQuestion,
            season: questionSeason,
            episode: questionEpisode
        });
        setScriptContext(context);
      } else {
        setScriptContext(''); // Clear context if no questions
      }
    };

    if (!isLoading) { // Only fetch context after initial data load
        loadScriptContext();
    }
  }, [quizData, currentQuestionIndex, isLoading, review, season, episode]); // Add dependencies

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer);
    // Update userAnswers immediately
    setUserAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      if (currentQuestionIndex < newAnswers.length) {
          newAnswers[currentQuestionIndex] = answer;
      }
      return newAnswers;
    });
    setShowResultModal(true); // Show the modal
  };

  const handleModalCloseAndNext = useCallback(() => {
    setShowResultModal(false);
    setSelectedAnswer(null); // Reset selected answer for the next question

    const isLast = currentQuestionIndex >= (quizData?.questions.length ?? 0) - 1;

    if (isLast) {
      // Save results before navigating home
      if (quizData) {
        if (review) {
          updateIncorrectQuestionsInStorage(quizData.questions, userAnswers);
        } else {
          saveIncorrectQuestionsToStorage(quizData.questions, userAnswers, season, episode);
        }
      }
      onGoHome();
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  }, [currentQuestionIndex, quizData, userAnswers, review, season, episode, onGoHome]);


  const handleGoHomeClick = useCallback(() => {
    // Save results even if leaving mid-quiz
    if (quizData) {
      if (review) {
        // In review mode, only update based on answers given *so far*
        updateIncorrectQuestionsInStorage(quizData.questions, userAnswers);
      } else {
        // In normal mode, save any incorrect answers encountered *so far*
        saveIncorrectQuestionsToStorage(quizData.questions, userAnswers, season, episode);
      }
    }
    onGoHome();
  }, [quizData, userAnswers, review, season, episode, onGoHome]);


  // --- Render Logic ---

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle case where there are no questions (e.g., review mode with no incorrect answers)
  if (!quizData || quizData.questions.length === 0) {
    return (
      <div className="quiz-container">
        <p>{review ? '復習する問題はありません。' : 'クイズデータの読み込みに失敗しました。'}</p>
        <button onClick={onGoHome} className="home-button">Homeに戻る</button>
      </div>
    );
  }

  // Ensure currentQuestionIndex is valid
  if (currentQuestionIndex >= quizData.questions.length) {
     console.error("Invalid question index detected.");
     // Optionally reset or show an error
     return (
        <div className="quiz-container">
            <p>エラーが発生しました。Homeに戻ってください。</p>
            <button onClick={onGoHome} className="home-button">Homeに戻る</button>
        </div>
     );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="quiz-container">
      <p>
        シーズン: {review ? currentQuestion.season : season} エピソード: {review ? currentQuestion.episode : episode} (問題 {currentQuestionIndex + 1}/{quizData.questions.length})
      </p>
      <Question
        question={currentQuestion.value}
        options={currentQuestion.options}
        onAnswerClick={handleAnswerClick}
        // Disable options while modal is shown
        showResult={showResultModal}
        scriptContext={scriptContext}
      />

      <ResultModal
        isOpen={showResultModal}
        isCorrect={isCorrect}
        explanation={currentQuestion.explanation}
        onClose={handleModalCloseAndNext}
        isLastQuestion={isLastQuestion}
      />

      <button className="home-button" onClick={handleGoHomeClick}>
        Homeに戻る (結果保存)
      </button>
    </div>
  );
};

export default QuizScreen;
