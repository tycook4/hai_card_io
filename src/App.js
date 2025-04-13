import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import GameplayPage from './GameplayPage';
import InstructionsPage from './InstructionsPage';
import QuestionsPage from './QuestionsPage';
import SuperlativesPage from './SuperlativesPage';
import EndScreen from './EndScreen';

function LaunchPage() {
  const navigate = useNavigate();
  return (
    <div className="launch-page">
      <h1 className="title">Card.io</h1>
      <button className="start-button" onClick={() => navigate('/instructions')}>
        Start
      </button>
      <div className="decorative-elements">
        <div className="curve curve-1"></div>
        <div className="curve curve-2"></div>
        <div className="curve curve-3"></div>
        <div className="curve curve-4"></div>
        <div className="curve curve-5"></div>
        <div className="curve curve-6"></div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LaunchPage />} />
          <Route path="/instructions" element={<InstructionsPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/gameplay" element={<GameplayPage />} />
          <Route path="/superlatives" element={<SuperlativesPage />} />
        <Route path="/end" element={<EndScreen />} />
      </Routes>
      </div>
    </Router>
  );
}

export default App;
