import React, { useState } from 'react';
// Remove Link import

interface HomeProps {
  onStartQuiz: (season: string, episode: string) => void;
  onStartReview: () => void; // Add onStartReview prop
}

const Home: React.FC<HomeProps> = ({ onStartQuiz, onStartReview }) => { // Destructure onStartReview
  const [season, setSeason] = useState('01');
  const [episode, setEpisode] = useState('01');

  const handleStartQuiz = () => {
    onStartQuiz(season, episode);
  };

  return (
    <div>
      <h1>クイズを選択</h1>
      <div>
        <label htmlFor="season">シーズン:</label>
        <select
          id="season"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((seasonNumber) => (
            <option key={seasonNumber} value={String(seasonNumber).padStart(2, '0')}>
              {seasonNumber}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="episode">エピソード:</label>
        <select
          id="episode"
          value={episode}
          onChange={(e) => setEpisode(e.target.value)}
        >
          {Array.from({ length: 24 }, (_, i) => i + 1).map((episodeNumber) => (
            <option key={episodeNumber} value={String(episodeNumber).padStart(2, '0')}>
              {episodeNumber}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleStartQuiz}>開始</button>
      {/* Change Link to button calling onStartReview */}
      <button onClick={onStartReview} className="home-button">
        復習モード
      </button>
      {/* Add button to clear localStorage */}
      <button
        onClick={() => {
          if (window.confirm('復習データをクリアしますか？ (Clear review data?)')) {
            localStorage.removeItem('incorrectQuestions');
            alert('復習データをクリアしました。(Review data cleared.)');
          }
        }}
        style={{ marginLeft: '10px', backgroundColor: '#ffcccc' }} // Add some styling
      >
        復習データをクリア
      </button>
    </div>
  );
};

export default Home;
