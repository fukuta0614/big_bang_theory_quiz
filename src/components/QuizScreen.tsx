import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
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
  // Removed unused userAnswers state
  const [showResultModal, setShowResultModal] = useState(false); // Renamed for clarity
  const [scriptContext, setScriptContext] = useState<string>('');
  const [isInWordList, setIsInWordList] = useState(false); // State for word list toggle

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        let data: QuizData;
        if (review) {
          // Fetch from wordListQuestions for review mode
          const storedQuestions = localStorage.getItem('wordListQuestions');
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
        // Removed userAnswers reset
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        setQuizData({ questions: [] });
      }
    };

    fetchQuizData();
    // Update dependencies: use seasonNumber, episodeNumber from params
  }, [seasonNumber, episodeNumber, review, startIndex]); // Add startIndex dependency

  // Effect to check if the current question is in the word list
  useEffect(() => {
    if (!quizData || !quizData.questions || quizData.questions.length === 0) return;
    const currentQuestion = quizData.questions[currentQuestionIndex];
    if (!currentQuestion) return; // Add check for currentQuestion existence

    const storedWordList = localStorage.getItem('wordListQuestions');
    const wordList: QuestionData[] = storedWordList ? JSON.parse(storedWordList) : [];

    // Use a more robust check, comparing season, episode, and value/id
    const questionExists = wordList.some(
      q => q.season === currentQuestion.season &&
           q.episode === currentQuestion.episode &&
           q.value === currentQuestion.value // Assuming value is unique enough, or use ID if available
    );
    setIsInWordList(questionExists);
  }, [quizData, currentQuestionIndex]);

  // Removed useEffect that reset userAnswers

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

  // Function to toggle question in word list
  const handleToggleWordList = useCallback(() => {
    if (!quizData || !quizData.questions || quizData.questions.length === 0) return;
    const currentQuestion = quizData.questions[currentQuestionIndex];
     if (!currentQuestion) return; // Add check for currentQuestion existence

    const storedWordList = localStorage.getItem('wordListQuestions');
    let wordList: QuestionData[] = storedWordList ? JSON.parse(storedWordList) : [];

    // Use a more robust check for existence
    const questionIndex = wordList.findIndex(
      q => q.season === currentQuestion.season &&
           q.episode === currentQuestion.episode &&
           q.value === currentQuestion.value // Assuming value is unique enough, or use ID if available
    );

    if (questionIndex > -1) {
      // Remove from list
      wordList = wordList.filter((_, index) => index !== questionIndex);
      setIsInWordList(false);
    } else {
      // Add to list (ensure season/episode are added if missing)
      const questionToAdd = {
        ...currentQuestion,
        season: currentQuestion.season || seasonNumber || '', // Ensure season/episode are present
        episode: currentQuestion.episode || episodeNumber || '',
      };
      wordList.push(questionToAdd);
      setIsInWordList(true);
    }

    localStorage.setItem('wordListQuestions', JSON.stringify(wordList));
  }, [quizData, currentQuestionIndex, seasonNumber, episodeNumber]); // Add dependencies

  // Add a check for empty questions after loading
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    // Handle the case where there are no questions (e.g., review mode with an empty word list)
    if (review) {
      return (
        <div>
          <p>単語帳に登録された問題はありません。</p>
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
    // Removed userAnswers update
  };

  // Renamed and repurposed for the modal's button
  const handleModalCloseAndNext = () => {
    setShowResultModal(false); // Close the modal
    setSelectedAnswer(null);
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // If it's the last question, just navigate home
      // Removed saving incorrectQuestions logic
      navigate('/'); // Use navigate instead of onGoHome
    }
  };

  // Display season/episode from params if not in review mode
  const displaySeason = review ? "単語帳" : seasonNumber; // Changed "Review" to "単語帳"
  const displayEpisode = review ? "" : episodeNumber; // Removed "Mode"

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
              {currentQuestionIndex < quizData.questions.length - 1 ? '次の問題へ' : 'Homeへ'} {/* Changed final button text */}
            </button>
            {/* Add Word List Toggle Button Inside Modal */}
            <button onClick={handleToggleWordList} className="wordlist-toggle-button modal-wordlist-toggle">
              {isInWordList ? '単語帳から削除' : '単語帳に追加'}
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        <button
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
          className="navigation-button"
        >
          前の問題
        </button>
        <button
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
          disabled={currentQuestionIndex === quizData.questions.length - 1}
          className="navigation-button"
        >
          次の問題
        </button>
      </div>

  {/* Removed the original next button and quiz finished message */}
  {/* The logic is now handled by the modal button and the Home button */}
  <button onClick={() => navigate(`/season/${seasonNumber}/episode/${episodeNumber}/questions`)}>問題一覧に戻る</button>

  <button className="home-button" onClick={() => {
    // Removed saving incorrectQuestions logic
    navigate('/'); // Use navigate instead of onGoHome
  }}>Homeに戻る</button>
    </div>
  );
}

export default QuizScreen;
