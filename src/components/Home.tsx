import React, { useState, useEffect } from 'react';

interface HomeProps {
  onStartQuiz: (season: string, episode: string) => void;
  onStartReview: () => void;
}

interface EpisodeList {
  [season: string]: string[];
}

const Home: React.FC<HomeProps> = ({ onStartQuiz, onStartReview }) => {
  const [season, setSeason] = useState('01');
  const [episode, setEpisode] = useState('01');
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

  const handleStartQuiz = () => {
    onStartQuiz(season, episode);
  };

  const episodeOptions = episodeList[season] || [];

  return (
    <div>
      <h1>クイズを選択</h1>
      <div>
        <label htmlFor="season">シーズン:</label>
        <select
          id="season"
          value={season}
          onChange={(e) => {
            setSeason(e.target.value);
            setEpisode('01'); // Reset episode when season changes
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
      <div>
        <label htmlFor="episode">エピソード:</label>
        <select
          id="episode"
          value={episode}
          onChange={(e) => setEpisode(e.target.value)}
        >
          {episodeOptions.map((episodeTitle, index) => (
            <option key={index} value={String(index+1).padStart(2, '0')}>
              {episodeTitle}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleStartQuiz}>開始</button>
      <button onClick={onStartReview} className="home-button">
        復習モード
      </button>
      <button
        onClick={() => {
          if (window.confirm('復習データをクリアしますか？')) {
            localStorage.removeItem('incorrectQuestions');
            alert('復習データをクリアしました。');
          }
        }}
        style={{ marginLeft: '10px', backgroundColor: '#ffcccc' }}
      >
        復習データをクリア
      </button>
    </div>
  );
};

export default Home;
