import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import QuizScreen from './components/QuizScreen';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import WordList from './components/WordList'; // Import WordList

function App() {
  const [season, setSeason] = useState('01');
  const [episode, setEpisode] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [showWordList, setShowWordList] = useState(false); // State for WordList visibility
  const [startQuestionIndex, setStartQuestionIndex] = useState(0); // State for starting index
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Handler for starting quiz from Home
  const handleStartQuizFromHome = (selectedSeason: string, selectedEpisode: string) => {
    setSeason(selectedSeason);
    setEpisode(selectedEpisode);
    setStartQuestionIndex(0); // Start from the beginning
    setIsReviewMode(false);
    setShowQuiz(true);
    setShowWordList(false); // Hide WordList
  };

  // Handler for showing WordList from Home
  const handleShowWordList = (selectedSeason: string, selectedEpisode: string) => {
    setSeason(selectedSeason);
    setEpisode(selectedEpisode);
    setShowWordList(true);
    setShowQuiz(false); // Hide Quiz
  };

  // Handler for starting quiz from WordList
  const handleStartQuizFromWordList = (selectedSeason: string, selectedEpisode: string, index: number) => {
    setSeason(selectedSeason);
    setEpisode(selectedEpisode);
    setStartQuestionIndex(index); // Set the starting index
    setIsReviewMode(false); // Ensure review mode is off
    setShowQuiz(true);
    setShowWordList(false); // Hide WordList
  };

  // Handler for starting review mode
  const handleStartReview = () => {
    // Set dummy season/episode for review mode as QuizScreen expects them,
    // even though it uses localStorage data.
    setSeason("Review");
    setEpisode("Mode");
    setIsReviewMode(true); // Turn review mode on
    setShowQuiz(true);
  };

  // Handler for returning home from quiz/review/wordlist
  const handleGoHome = () => {
    setShowQuiz(false);
    setShowWordList(false); // Also hide WordList when going home
    setIsReviewMode(false); // Reset review mode state
    // If returning from review mode, reset season to a default value
    if (season === "Review") {
      setSeason('01'); // Reset to season 1 or potentially the last selected valid season
    }
  }; // <-- Add missing closing brace here

  // Handler for going to WordList from QuizScreen
  const handleGoToWordList = (currentSeason: string, currentEpisode: string) => {
    setSeason(currentSeason);
    setEpisode(currentEpisode);
    setShowWordList(true);
    setShowQuiz(false);
  };

  return (
    <BrowserRouter>
      <div>
        <Header />
        {showWordList ? (
          <WordList
            season={season}
            episode={episode}
            onStartQuiz={handleStartQuizFromWordList}
            onGoHome={handleGoHome}
          />
        ) : showQuiz ? (
          <QuizScreen
            season={season}
            episode={episode}
            onGoHome={handleGoHome}
            onGoToWordList={handleGoToWordList} // Pass new handler
            review={isReviewMode}
            startIndex={startQuestionIndex} // Pass starting index
          />
        ) : (
          <Home
            season={season}
            setSeason={setSeason}
            onStartQuiz={handleStartQuizFromHome}
            onShowWordList={handleShowWordList} // Pass new handler
            onStartReview={handleStartReview}
          />
        )}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
