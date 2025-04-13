import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom'; // Import hooks
import './QuizScreen.css';
import Question from './Question';

// Remove props: season, episode, onGoHome
interface QuizScreenProps {
  review?: boolean; // Keep review prop for now, needs routing adjustment later
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
  season: string; // Remove duplicate season property
  episode: string;
}

interface QuizData {
  questions: QuestionData[];
}

// Remove props from signature
const QuizScreen: React.FC<QuizScreenProps> = ({ review }) => {
  // Get params, location, and navigate function
  const { seasonNumber, episodeNumber } = useParams<{ seasonNumber: string; episodeNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine start index from location state (only if not in review mode)
  const startIndex = !review && location.state?.startIndex ? location.state.startIndex : 0;

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  // Initialize currentQuestionIndex with startIndex
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(startIndex);
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
          // Fetch using params if not in review mode
          if (!seasonNumber || !episodeNumber) {
             console.error("Season or episode number missing in URL");
             setQuizData({ questions: [] });
             return; // Exit if params are missing
          }
          const response = await fetch(`/data/season${seasonNumber}/episode${episodeNumber}/quiz.json`); // Use params and correct path
          if (!response.ok) { // Check response status
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          data = await response.json();
        }
        setQuizData(data);
        // Reset index to startIndex when data loads (important if navigating between episodes/lists)
        setCurrentQuestionIndex(startIndex);
        // Reset user answers when data loads
        setUserAnswers(new Array(data.questions.length).fill(null));
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        setQuizData({ questions: [] });
      }
    };

    fetchQuizData();
    // Update dependencies: use seasonNumber, episodeNumber from params
  }, [seasonNumber, episodeNumber, review, startIndex]); // Add startIndex dependency

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

    // Ensure quizData and questions exist before fetching context
    if (quizData?.questions && quizData.questions.length > currentQuestionIndex) {
      fetchScriptContext();
    }
    // Dependencies remain quizData and currentQuestionIndex
  }, [quizData, currentQuestionIndex]); // Remove season/episode props from dependencies

  // Add a check for empty questions after loading
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    // Handle the case where there are no questions (e.g., review mode with no incorrect answers)
    if (review) {
      return (
        <div>
          <p>復習する問題はありません。</p>
          {/* Use navigate instead of onGoHome */}
          <button onClick={() => navigate('/')}>Homeに戻る</button>
        </div>
      );
    }
    // Handle loading or error state more explicitly if needed
    return <div>Loading quiz...</div>;
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
          // Use const as questions is not reassigned here
          const questions: QuestionData[] = JSON.parse(storedQuestions);
          // Filter out correctly answered questions based on the latest userAnswers
          const filteredQuestions = questions.filter((question, index) => {
            // Ensure index is within bounds of userAnswers
            return index < userAnswers.length && userAnswers[index] !== question.correctAnswer;
          });
          // Save the filtered list
          localStorage.setItem('incorrectQuestions', JSON.stringify(filteredQuestions));
        }
      } else {
          // Save incorrect questions only if seasonNumber and episodeNumber are defined
          if (quizData && seasonNumber && episodeNumber) {
            const incorrectQuestions = quizData.questions
              .filter((question, index) => userAnswers[index] !== null && userAnswers[index] !== question.correctAnswer)
              // seasonNumber and episodeNumber are confirmed strings here
              .map(q => ({ ...q, season: seasonNumber, episode: episodeNumber }));

            const storedQuestions = localStorage.getItem('incorrectQuestions');
            // Use const as questions is not reassigned here
            const existingQuestions: QuestionData[] = storedQuestions ? JSON.parse(storedQuestions) : [];
            // Add new incorrect questions, avoiding duplicates
            const updatedQuestions = [...existingQuestions]; // Create a new array
            incorrectQuestions.forEach(newQuestion => {
              // Check against existingQuestions
              if (!existingQuestions.find(q => q.season === newQuestion.season && q.episode === newQuestion.episode && q.value === newQuestion.value)) {
                 updatedQuestions.push(newQuestion); // Add to the new array
              }
            });
            localStorage.setItem('incorrectQuestions', JSON.stringify(updatedQuestions));
          } else {
            console.warn("Cannot save incorrect questions: seasonNumber or episodeNumber is undefined.");
          }
      }
      navigate('/'); // Use navigate instead of onGoHome
    }
  };

  // Display season/episode from params if not in review mode
  const displaySeason = review ? "Review" : seasonNumber;
  const displayEpisode = review ? "Mode" : episodeNumber;

  return (
    <div className="quiz-container">
      {/* Display season/episode info */}
      <p>シーズン: {displaySeason} エピソード: {displayEpisode}</p>
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
          // Save incorrect questions to local storage, only if season/episode defined
          let incorrectQuestions: QuestionData[] = []; // Initialize empty array
          if (quizData && seasonNumber && episodeNumber) { // Check if params are defined
             incorrectQuestions = quizData.questions
              .filter((question, index) => userAnswers[index] !== null && userAnswers[index] !== question.correctAnswer)
              // seasonNumber and episodeNumber are confirmed strings here
              .map(q => ({ ...q, season: seasonNumber, episode: episodeNumber }));
          }

          if (incorrectQuestions.length > 0) { // Only proceed if there are incorrect questions to save
            const storedQuestions = localStorage.getItem('incorrectQuestions');
            const existingQuestions: QuestionData[] = storedQuestions ? JSON.parse(storedQuestions) : [];
            // Add new incorrect questions, avoiding duplicates
            const updatedQuestions = [...existingQuestions];
            incorrectQuestions.forEach(newQuestion => {
               if (!existingQuestions.find(q => q.season === newQuestion.season && q.episode === newQuestion.episode && q.value === newQuestion.value)) {
                  updatedQuestions.push(newQuestion);
               }
            });
            localStorage.setItem('incorrectQuestions', JSON.stringify(updatedQuestions));
          } else if (!seasonNumber || !episodeNumber) {
             console.warn("Cannot save incorrect questions on Home button click: seasonNumber or episodeNumber is undefined.");
          }
      }
      navigate('/'); // Use navigate instead of onGoHome
    }}>Homeに戻る</button>
    </div>
  );
}

export default QuizScreen;
