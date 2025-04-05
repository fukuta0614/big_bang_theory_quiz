import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom'; // Remove Routes, Route
import './App.css';
import QuizScreen from './components/QuizScreen';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [season, setSeason] = useState('');
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
  };

  return (
    <BrowserRouter>
      <div>
        {!showQuiz ? (
          // Pass handleStartReview to Home component
          <><Header /><Home onStartQuiz={handleStartQuizFromHome} onStartReview={handleStartReview} /></>
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
