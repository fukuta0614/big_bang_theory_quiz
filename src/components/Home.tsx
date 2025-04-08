import React, { useState, useEffect, Dispatch, SetStateAction } from 'react'; // Import Dispatch and SetStateAction
import './Home.css'; // Add CSS import for styling

interface HomeProps {
  season: string; // Add season prop
  setSeason: Dispatch<SetStateAction<string>>; // Add setSeason prop
  onStartQuiz: (season: string, episode: string) => void;
  onStartReview: () => void;
}

interface EpisodeList {
  [season: string]: string[];
}

// Update component signature to receive new props
const Home: React.FC<HomeProps> = ({ season, setSeason, onStartQuiz, onStartReview }) => {
  // Remove internal season state, use props instead
  // const [season, setSeason] = useState('01');
  const [episodeList, setEpisodeList] = useState<EpisodeList>({});

  useEffect(() => {
    const fetchEpisodeList = async () => {
      try {
        const response = await fetch('/data/episode_list.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: EpisodeList = await response.json();
        setEpisodeList(data);
      } catch (error) {
        console.error("Could not fetch episode list:", error);
      }
    };

    fetchEpisodeList();
  }, []);

  // Removed handleStartQuiz as it's now per episode
  // const handleStartQuiz = () => {
  //   onStartQuiz(season, episode);
  // };

  const episodeOptions = episodeList[season] || [];

  // Function to handle starting quiz for a specific episode
  const handleStartEpisodeQuiz = (episodeNumber: string) => {
    onStartQuiz(season, episodeNumber);
  };

  return (
    <div className="home-container">
      <h1>エピソードを選択</h1>
      <div className="controls-container">
        <div className="season-selector">
          <label htmlFor="season">シーズン:</label>
        <select
          id="season"
          value={season}
          onChange={(e) => {
            setSeason(e.target.value);
            // setEpisode('01'); // No longer needed
          }}
        >
            {Object.keys(episodeList)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map((seasonNumber) => (
              <option key={seasonNumber} value={seasonNumber}>
              {seasonNumber}
              </option>
            ))}
        </select>
        </div>
        <div className="review-controls">
          <button onClick={onStartReview} className="home-button review-button">
            復習モード
          </button>
          <button
            onClick={() => {
              if (window.confirm('復習データをクリアしますか？')) {
                localStorage.removeItem('incorrectQuestions');
                alert('復習データをクリアしました。');
              }
            }}
            className="home-button clear-button"
          >
            復習データをクリア
          </button>
        </div>
      </div>

      <div className="episode-list-container">
        <h2>シーズン {season} のエピソード</h2>
        <ul className="episode-list">
          {episodeOptions.map((episodeTitleWithNumber, index) => {
            const episodeNumber = String(index + 1).padStart(2, '0');
            // Extract title (remove the leading number and space)
            const titleMatch = episodeTitleWithNumber.match(/^\d+\s+(.*)/);
            const episodeTitle = titleMatch ? titleMatch[1] : episodeTitleWithNumber;
            return (
              <li key={episodeNumber} className="episode-item">
                <div className="episode-info">
                  <h3>{episodeNumber}: {episodeTitle}</h3>
                  <p className="synopsis">あらすじは準備中です。</p> {/* Dummy Synopsis */}
                </div>
                <button
                  onClick={() => handleStartEpisodeQuiz(episodeNumber)}
                  className="start-quiz-button"
                >
                  クイズ開始
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Home;
