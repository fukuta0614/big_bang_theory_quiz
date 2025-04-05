import { useState } from 'react'
import './App.css';
import QuizScreen from './components/QuizScreen';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);

  const handleStartQuizFromHome = (selectedSeason: string, selectedEpisode: string) => {
    setSeason(selectedSeason);
    setEpisode(selectedEpisode);
    setShowQuiz(true);
  };

  return (
    <div>
      {!showQuiz ? (
        <><Header /><Home onStartQuiz={handleStartQuizFromHome} /></>
      ) : (
        <QuizScreen season={season} episode={episode} onGoHome={() => setShowQuiz(false)} />
      )}
      <Footer />
    </div>
  );
}

export default App;
