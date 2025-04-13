import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import QuestionsPage from './QuestionsPage';
import InstructionsPage from './InstructionsPage';
import SuperlativesPage from './SuperlativesPage';
import EndScreen from './EndScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="App">
            <div className="launch-page">
              <h1 className="title">Card.io</h1>
              <Link to="/instructions" className="start-button">Start</Link>
              <div className="decorative-elements">
                <div className="curve curve-1"></div>
                <div className="curve curve-2"></div>
                <div className="curve curve-3"></div>
                <div className="curve curve-4"></div>
                <div className="curve curve-5"></div>
                <div className="curve curve-6"></div>
              </div>
            </div>
          </div>
        } />
        <Route path="/instructions" element={<InstructionsPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/superlatives" element={<SuperlativesPage />} />
        <Route path="/end" element={<EndScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
