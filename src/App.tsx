import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom'; // Remove Routes, Route
import './App.css';
import QuizScreen from './components/QuizScreen';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  // Initialize season state, perhaps with '01' or load from storage if needed later
  const [season, setSeason] = useState('01');
  const [episode, setEpisode] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false); // Add state for review mode

  // Handler for starting a normal quiz
  const handleStartQuizFromHome = (selectedSeason: string, selectedEpisode: string) => {
    setSeason(selectedSeason);
    setEpisode(selectedEpisode);
    setIsReviewMode(false); // Ensure review mode is off
    setShowQuiz(true);
  };

  // Handler for starting review mode (to be called from Home)
  const handleStartReview = () => {
    // Set dummy season/episode for review mode as QuizScreen expects them,
    // even though it uses localStorage data.
    setSeason("Review");
    setEpisode("Mode");
    setIsReviewMode(true); // Turn review mode on
    setShowQuiz(true);
  };

  // Handler for returning home from quiz/review
  const handleGoHome = () => {
    setShowQuiz(false);
    setIsReviewMode(false); // Reset review mode state
    // If returning from review mode, reset season to a default value
    if (season === "Review") {
      setSeason('01'); // Reset to season 1 or potentially the last selected valid season
    }
  };

  return (
    <BrowserRouter>
      <div>
        {!showQuiz ? (
          // Pass season state and setter to Home component
          <><Header /><Home
            season={season} // Pass current season
            setSeason={setSeason} // Pass function to update season
            onStartQuiz={handleStartQuizFromHome}
            onStartReview={handleStartReview}
          /></>
        ) : (
          // Pass review prop and updated onGoHome handler
          <QuizScreen
            season={season}
            episode={episode}
            onGoHome={handleGoHome}
            review={isReviewMode} // Pass review state
          />
        )}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
