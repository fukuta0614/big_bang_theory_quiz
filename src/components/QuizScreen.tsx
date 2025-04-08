import React, { useState, useEffect } from 'react';
import './QuizScreen.css';
import Question from './Question';

interface QuizScreenProps {
  season: string;
  episode: string;
  onGoHome: () => void;
  review?: boolean;
}

interface QuestionData {
  id: number;
  value: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  etymology: string;
  pronounciation: string;
  scriptContext: string;
  scriptContextTranslation: string;
  season: string; // Add season
  episode: string; // Add episode
}

interface QuizData {
  questions: QuestionData[];
}

const QuizScreen: React.FC<QuizScreenProps> = ({ season, episode, onGoHome, review }) => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResultModal, setShowResultModal] = useState(false); // Renamed for clarity
  const [scriptContext, setScriptContext] = useState<string>('');

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        let data: QuizData;
        if (review) {
          const storedQuestions = localStorage.getItem('incorrectQuestions');
          if (storedQuestions) {
            data = { questions: JSON.parse(storedQuestions) };
          } else {
            data = { questions: [] };
          }
        } else {
          const response = await fetch(`../../data/season${season}/episode${episode}/quiz.json`);
          data = await response.json();
        }
        setQuizData(data);
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        // Optionally set quizData to an empty state or show an error message
        setQuizData({ questions: [] });
      }
    };

    fetchQuizData();
  }, [season, episode, review]);

  useEffect(() => {
    if (quizData) {
      setUserAnswers(new Array(quizData.questions.length).fill(null));
    }
  }, [quizData]);

  useEffect(() => {
    const fetchScriptContext = async () => {
      if (!quizData || !quizData.questions || quizData.questions.length === 0) return; // Add check for empty questions
      const currentQuestion = quizData.questions[currentQuestionIndex];

      const questionValue = currentQuestion.value;
      const scriptContextRaw = currentQuestion.scriptContext;

      let line = scriptContextRaw;
      const parts = line.split(': ');
      if (parts.length > 1) {
        const speaker = parts[0];
        const body = parts.slice(1).join(': ');
        line = `<strong>${speaker}</strong>:<br />${body}`;
      }
      line = line.replace(questionValue, `<strong>${questionValue}</strong>`);
      const context = line + '<br />';

      setScriptContext(context);
    };

    if (quizData && quizData.questions && quizData.questions.length > 0) { // Add check for empty questions
      fetchScriptContext();
    }
    // Add currentQuestion as a dependency to refetch when it changes
  }, [quizData, currentQuestionIndex, season, episode]);

  // Add a check for empty questions after loading
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    // Handle the case where there are no questions (e.g., review mode with no incorrect answers)
    if (review) {
      return (
        <div>
          <p>復習する問題はありません。</p>
          <button onClick={onGoHome}>Homeに戻る</button>
        </div>
      );
    }
    return <div>Loading...</div>;
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResultModal(true); // Show the modal
    // Update userAnswers array with the selected answer
    setUserAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[currentQuestionIndex] = answer;
      return newAnswers;
    });
  };

  // Renamed and repurposed for the modal's button
  const handleModalCloseAndNext = () => {
    setShowResultModal(false); // Close the modal
    setSelectedAnswer(null);
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // If it's the last question, save results and navigate home
      if (review) {
        // Remove correctly answered questions from local storage
        const storedQuestions = localStorage.getItem('incorrectQuestions');
        if (storedQuestions) {
          let questions: QuestionData[] = JSON.parse(storedQuestions);
          // Filter out correctly answered questions based on the latest userAnswers
          questions = questions.filter((question, index) => {
            // Ensure index is within bounds of userAnswers
            return index < userAnswers.length && userAnswers[index] !== question.correctAnswer;
          });
          localStorage.setItem('incorrectQuestions', JSON.stringify(questions));
        }
      } else {
        // Save incorrect questions to local storage, including season and episode
        const incorrectQuestions = quizData ? quizData.questions
          // Only consider questions that were actually answered AND were incorrect
          .filter((question, index) => userAnswers[index] !== null && userAnswers[index] !== question.correctAnswer)
          .map(q => ({ ...q, season, episode })) // Add season/episode
          : [];
        const storedQuestions = localStorage.getItem('incorrectQuestions');
        const questions: QuestionData[] = storedQuestions ? JSON.parse(storedQuestions) : [];
        // Add new incorrect questions, avoiding duplicates
        incorrectQuestions.forEach(newQuestion => {
          if (!questions.find(q => q.season === newQuestion.season && q.episode === newQuestion.episode && q.value === newQuestion.value)) {
            questions.push(newQuestion);
          }
        });
        localStorage.setItem('incorrectQuestions', JSON.stringify(questions));
      }
      onGoHome(); // Navigate home
    }
  };


  return (
    <div className="quiz-container">
      <p>シーズン: {season} エピソード: {episode}</p>
      <Question
        question={currentQuestion.value}
        options={currentQuestion.options}
        onAnswerClick={handleAnswerClick}
        showResult={showResultModal} // Pass the modal visibility state to disable buttons
        scriptContext={scriptContext}
        pronounciation={currentQuestion.pronounciation}
      />

      {/* Modal for displaying the result */}
      {showResultModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {selectedAnswer === currentQuestion.correctAnswer ? (
              <>
                <h3 className="correct-answer">正解！</h3>
                <p className="explanation">{currentQuestion.explanation}</p>
                <p className="explanation">{currentQuestion.etymology}</p>
                <p className="explanation">{currentQuestion.scriptContext}</p>
                <p className="explanation">{currentQuestion.scriptContextTranslation}</p>
              </>
            ) : (
              <>
                <h3 className="incorrect-answer">不正解！</h3>
                <p className="explanation">{currentQuestion.explanation}</p>
                <p className="explanation">{currentQuestion.etymology}</p>
                <p className="explanation">{currentQuestion.scriptContext}</p>
                <p className="explanation">{currentQuestion.scriptContextTranslation}</p>
              </>
            )}
            <button onClick={handleModalCloseAndNext} className="modal-button">
              {currentQuestionIndex < quizData.questions.length - 1 ? '次の問題へ' : '結果を保存してHomeへ'}
            </button>
          </div>
        </div>
      )}

      {/* Removed the original next button and quiz finished message */}
      {/* The logic is now handled by the modal button and the Home button */}

      <button className="home-button" onClick={() => {
        if (review) {
          // Remove correctly answered questions from local storage
          const storedQuestions = localStorage.getItem('incorrectQuestions');
          if (storedQuestions) {
            let questions: QuestionData[] = JSON.parse(storedQuestions);
            // Filter out correctly answered questions
            questions = questions.filter((question, index) => {
              return userAnswers[index] !== question.correctAnswer;
            });
            localStorage.setItem('incorrectQuestions', JSON.stringify(questions));
          }
        } else {
          // Save incorrect questions to local storage, including season and episode
          const incorrectQuestions = quizData ? quizData.questions
            // Only consider questions that were actually answered AND were incorrect
            .filter((question, index) => userAnswers[index] !== null && userAnswers[index] !== question.correctAnswer)
            .map(q => ({ ...q, season, episode })) // Add season/episode to each incorrect question
            : [];
          const storedQuestions = localStorage.getItem('incorrectQuestions');
          const questions: QuestionData[] = storedQuestions ? JSON.parse(storedQuestions) : [];
          // Add new incorrect questions, avoiding duplicates based on season, episode, and value
          incorrectQuestions.forEach(newQuestion => {
            if (!questions.find(q => q.season === newQuestion.season && q.episode === newQuestion.episode && q.value === newQuestion.value)) {
              questions.push(newQuestion);
            }
          });
          localStorage.setItem('incorrectQuestions', JSON.stringify(questions));
        }
        onGoHome();
      }}>Homeに戻る</button>
    </div>
  );
}

export default QuizScreen;
