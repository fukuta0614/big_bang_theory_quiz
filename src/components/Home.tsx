import React, { useState, useEffect, Dispatch, SetStateAction } from 'react'; // Import Dispatch and SetStateAction
import './Home.css'; // Add CSS import for styling

interface HomeProps {
  season: string;
  setSeason: Dispatch<SetStateAction<string>>;
  onStartQuiz: (season: string, episode: string) => void;
  onShowWordList: (season: string, episode: string) => void; // Add prop for showing word list
  onStartReview: () => void;
}

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

// Update component signature to receive new props
const Home: React.FC<HomeProps> = ({ season, setSeason, onStartQuiz, onShowWordList, onStartReview }) => {
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

  // Get the array of episode objects for the selected season, default to empty array if not found
  const episodeOptions: EpisodeInfo[] = episodeList[season] || [];

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
                <div className="episode-buttons"> {/* Container for buttons */}
                  <button
                    // Pass episode.episode to the handler
                    onClick={() => handleStartEpisodeQuiz(episode.episode)}
                    className="start-quiz-button"
                  >
                    クイズ開始
                  </button>
                  <button
                    onClick={() => onShowWordList(season, episode.episode)} // Call the new handler
                    className="word-list-button" // Add a class for styling if needed
                  >
                    問題一覧
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Home;
