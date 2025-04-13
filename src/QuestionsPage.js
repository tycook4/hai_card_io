import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuestionsPage.css';

const QuestionsPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [themeInput, setThemeInput] = useState('');
  const navigate = useNavigate();

  const questions = [
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

  const progressPercentages = [13, 26, 55];

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
  };

  const handleThemeInputChange = (e) => {
    setThemeInput(e.target.value);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setThemeInput('');
    } else {
      // Navigate to game when all questions are answered
      navigate('/game');
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setThemeInput('');
    } else {
      navigate('/game');
    }
  };

  const handleSkipToGame = () => {
    navigate('/game');
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    
    if (question.type === 'multiple-choice') {
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
          disabled={questions[currentQuestion].type === 'multiple-choice' && selectedOption === null}
        >
          {currentQuestion === questions.length - 1 ? 'Start Game' : 'Next'}
        </button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPercentages[currentQuestion]}%` }}></div>
        <span className="progress-text">{progressPercentages[currentQuestion]}%</span>
      </div>
    </div>
  );
};

export default QuestionsPage; 