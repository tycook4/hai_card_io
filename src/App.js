import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import GameplayPage from './GameplayPage';
import QuestionsPage from './QuestionsPage';

function LaunchPage() {
  const navigate = useNavigate();

  return (
    <div className="launch-page">
      <h1 className="title">Card.io</h1>
      <button className="start-button" onClick={() => navigate('/questions')}>
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
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/gameplay" element={<GameplayPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
