import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuestionsPage.css';

const PersonalizationQuestion = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  const options = [
    "Not personalized at all",
    "Doesn't need to start out personalized, can learn as it goes",
    "Personalized to reference certain themes or ideas",
    "Highly personalized for each player"
  ];

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    // Here you would typically save the answer and navigate to the next question
    navigate('/final-question');
  };

  return (
    <div className="questions-page">
      <h1 className="question-title">How personalized would you like your game to be?</h1>
      
      <div className="options-container">
        {options.map((option, index) => (
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

      <div className="buttons-container">
        <button className="button skip-game">Skip straight to game</button>
        <button className="button skip-question">Skip this question</button>
        <button className="button next" onClick={handleNext}>Next</button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '26%' }}></div>
        <span className="progress-text">26%</span>
      </div>
    </div>
  );
};

export default PersonalizationQuestion; 