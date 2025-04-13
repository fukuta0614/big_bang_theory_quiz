import React, { useState, useEffect } from 'react'; // Remove Dispatch, SetStateAction
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import './Home.css'; // Add CSS import for styling

// Remove HomeProps interface

// Define the structure for a single episode
interface EpisodeInfo {
  episode: string;
  title: string;
  outline: string;
}

// Update EpisodeList interface to match the new JSON structure
interface EpisodeList {
  [season: string]: EpisodeInfo[];
}

// Update component signature - remove props
const Home: React.FC = () => {
  // Add internal state for season
  const [season, setSeason] = useState('01'); // Default to season '01'
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

  const navigate = useNavigate(); // Add useNavigate hook

  // Removed handleStartQuiz as it's now per episode via Link

  const episodeOptions = episodeList[season] || [];
  // Remove handleStartEpisodeQuiz function

  // TODO: Update review mode button functionality for routing
  const handleStartReview = () => {
    // Navigate to the /review route
    navigate('/review');
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
          {/* Update onClick to use the local handleStartReview */}
          <button onClick={handleStartReview} className="home-button review-button">
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
          {/* Map over the array of episode objects */}
          {episodeOptions.map((episode) => {
            return (
              // Use episode.episode as the key
              <li key={episode.episode} className="episode-item">
                <div className="episode-info">
                  {/* Display episode number and title */}
                  <h3>{episode.episode}: {episode.title}</h3>
                  {/* Display the outline */}
                  <p className="synopsis">{episode.outline}</p>
                </div>
                {/* Link for starting quiz directly */}
                <Link to={`/quiz/season/${season}/episode/${episodeNumber}`}>
                   <button className="start-quiz-button">クイズ開始</button>
                </Link>
                {/* Link for viewing question list */}
                <Link to={`/season/${season}/episode/${episodeNumber}/questions`}>
                  <button>問題一覧</button> {/* Add class if needed */}
                </Link>

              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Home;
