import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuestionsPage.css';

const QuestionsPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [themeInput, setThemeInput] = useState('');
  const [playerCount, setPlayerCount] = useState(2); // Default to 2 players
  const [gamePreferences, setGamePreferences] = useState({
    goal: null,
    personalization: null,
    themes: ''
  });
  const navigate = useNavigate();

  const questions = [
    {
      type: 'player-count',
      title: "How many players will be joining?",
      min: 2,
      max: 8
    },
    {
      type: 'multiple-choice',
      title: "What's the goal of your game night?",
      options: [
        "Get to know new friends",
        "Tell-all with close friends",
        "Casual chatty debates",
        "Lightly competitive fun"
      ]
    },
    {
      type: 'multiple-choice',
      title: "How personalized would you like your game to be?",
      options: [
        "Not personalized at all",
        "Doesn't need to start out personalized, can learn as it goes",
        "Personalized to reference certain themes or ideas",
        "Highly personalized for each player"
      ]
    },
    {
      type: 'text-input',
      title: "What topics, themes, or ideas would you like to include?",
      placeholder: "Enter your topics, themes, or ideas here..."
    }
  ];

  const progressPercentages = [10, 25, 50, 75];

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
  };

  const handleThemeInputChange = (e) => {
    setThemeInput(e.target.value);
  };

  const handlePlayerCountChange = (value) => {
    setPlayerCount(Math.max(questions[0].min, Math.min(questions[0].max, value)));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      // Save current answer before moving to next question
      if (currentQuestion === 1) {
        setGamePreferences(prev => ({ ...prev, goal: questions[1].options[selectedOption] }));
      } else if (currentQuestion === 2) {
        setGamePreferences(prev => ({ ...prev, personalization: questions[2].options[selectedOption] }));
      } else if (currentQuestion === 3) {
        setGamePreferences(prev => ({ ...prev, themes: themeInput }));
      }

      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setThemeInput('');
    } else {
      // Save final answer and navigate
      setGamePreferences(prev => ({ ...prev, themes: themeInput }));
      navigate('/gameplay', { 
        state: { 
          playerCount,
          gamePreferences: {
            ...gamePreferences,
            themes: themeInput
          }
        } 
      });
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setThemeInput('');
    } else {
      navigate('/gameplay', { 
        state: { 
          playerCount,
          gamePreferences
        } 
      });
    }
  };

  const handleSkipToGame = () => {
    navigate('/gameplay', { 
      state: { 
        playerCount,
        gamePreferences
      } 
    });
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    
    if (question.type === 'player-count') {
      return (
        <div className="player-count-container">
          <div className="player-count-controls">
            <button 
              className="player-count-button"
              onClick={() => handlePlayerCountChange(playerCount - 1)}
              disabled={playerCount <= question.min}
            >
              -
            </button>
            <span className="player-count">{playerCount}</span>
            <button 
              className="player-count-button"
              onClick={() => handlePlayerCountChange(playerCount + 1)}
              disabled={playerCount >= question.max}
            >
              +
            </button>
          </div>
          <p className="player-count-hint">Min: {question.min}, Max: {question.max} players</p>
        </div>
      );
    } else if (question.type === 'multiple-choice') {
      return (
        <div className="options-container">
          {question.options.map((option, index) => (
            <div 
              key={index} 
              className={`option ${selectedOption === index ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(index)}
            >
              <div className="checkbox"></div>
              <span>{option}</span>
            </div>
          ))}
        </div>
      );
    } else if (question.type === 'text-input') {
      return (
        <div className="input-container">
          <textarea
            className="theme-input"
            value={themeInput}
            onChange={handleThemeInputChange}
            placeholder={question.placeholder}
          />
        </div>
      );
    }
  };

  const calculateProgress = () => {
    const totalQuestions = questions.length;
    const currentProgress = ((currentQuestion + 1) / totalQuestions) * 100;
    return Math.round(currentProgress);
  };

  return (
    <div className="questions-page">
      <h1 className="question-title">{questions[currentQuestion].title}</h1>
      
      {renderQuestion()}

      <div className="buttons-container">
        <button className="button skip-game" onClick={handleSkipToGame}>Skip straight to game</button>
        <button className="button skip-question" onClick={handleSkipQuestion}>Skip this question</button>
        <button 
          className="button next" 
          onClick={handleNext}
          disabled={
            (questions[currentQuestion].type === 'multiple-choice' && selectedOption === null) ||
            (questions[currentQuestion].type === 'player-count' && !playerCount)
          }
        >
          {currentQuestion === questions.length - 1 ? 'Start Game' : 'Next'}
        </button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${calculateProgress()}%` }}></div>
        <span className="progress-text">Question {currentQuestion + 1} of {questions.length}</span>
      </div>
    </div>
  );
};

export default QuestionsPage; 