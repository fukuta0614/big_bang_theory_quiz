import { useState } from 'react'
import './App.css';
import QuizScreen from './components/QuizScreen';

function App() {
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);

  const handleSeasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSeason(event.target.value);
  };

  const handleEpisodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEpisode(event.target.value);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  return (
    <>
      {!showQuiz ? (
        <div>
          <h1>The Big Bang Theory Quiz</h1>
          <div>
            <label htmlFor="season">シーズン:</label>
            <select id="season" value={season} onChange={handleSeasonChange}>
              <option value="">選択してください</option>
              <option value="1">シーズン1</option>
              <option value="2">シーズン2</option>
              <option value="3">シーズン3</option>
              <option value="4">シーズン4</option>
              <option value="5">シーズン5</option>
              <option value="6">シーズン6</option>
              <option value="7">シーズン7</option>
              <option value="8">シーズン8</option>
              <option value="9">シーズン9</option>
              <option value="10">シーズン10</option>
              <option value="11">シーズン11</option>
              <option value="12">シーズン12</option>
            </select>
          </div>
          <div>
            <label htmlFor="episode">エピソード:</label>
            <select id="episode" value={episode} onChange={handleEpisodeChange}>
              <option value="">選択してください</option>
              {season &&
                Array.from({ length: 24 }, (_, i) => i + 1).map((episodeNumber) => (
                  <option key={episodeNumber} value={episodeNumber}>
                    エピソード{episodeNumber}
                  </option>
                ))}
            </select>
          </div>
          <button
            disabled={!season || !episode}
            onClick={handleStartQuiz}
          >
            開始
          </button>
        </div>
      ) : (
        <QuizScreen />
      )}
    </>
  );
}

export default App;
