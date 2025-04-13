import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import Routes and Route
import './App.css';
import QuizScreen from './components/QuizScreen';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import QuestionList from './components/QuestionList'; // Import QuestionList

function App() {
  // Remove state related to showing quiz/review mode and season/episode selection
  // This will now be handled by routing

  // Remove handlers related to old navigation logic
  // const handleStartQuizFromHome = ...
  // const handleStartReview = ...
  // const handleGoHome = ...

  // Home component might need internal state for season selection now,
  // or we could lift it again if needed globally (e.g., using Context API later).
  // For now, let Home manage its season selection internally if needed,
  // or pass default props if required. The props passed below are simplified.

  // Note: The review mode functionality needs adjustment with routing.
  // A possible approach is a dedicated route like '/review' or passing state/params.
  // This implementation focuses on adding the QuestionList route first.
  // The existing review button in Home might need to be updated later
  // to navigate to a review route or use a different mechanism.

  return (
    <BrowserRouter>
      <Header />
      <div className="app-content"> {/* Added a wrapper for content */}
        <Routes>
          <Route
            path="/"
            element={
              <Home
                // Simplified props: Home now handles navigation via Links
                // It might need internal state for season selection
                // Pass initial/default season if necessary, or let Home fetch/manage it.
                // Example: Let Home default to '01' or fetch episode_list.json to determine available seasons.
                // For simplicity, removing season/setSeason props for now.
                // Home will need adjustment if it relied on these props for initial state.
                // onStartQuiz and onStartReview are removed as navigation is handled by Links.
              />
            }
          />
          <Route
            path="/quiz/season/:seasonNumber/episode/:episodeNumber"
            element={
              <QuizScreen
                // QuizScreen will get season/episode from useParams
                // and startIndex from useLocation state.
                // The review prop needs reconsideration with routing.
                // For now, assuming non-review mode.
                review={false} // Defaulting review to false
                // onGoHome is replaced by useNavigate hook within QuizScreen
              />
            }
          />
          <Route
            path="/season/:seasonNumber/episode/:episodeNumber/questions"
            element={<QuestionList />} // QuestionList uses useParams
          />
          {/* Add other routes here if needed, e.g., for review mode */}
          {/* <Route path="/review" element={<QuizScreen review={true} />} /> */}
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
