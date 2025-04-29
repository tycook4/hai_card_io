import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './InstructionsPage.css';

const InstructionsPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const fromGame = location.state?.fromGame || false;
  const isPopup = window.location.pathname !== '/instructions';

  const pages = [
    {
      title: "How to Play",
      description: "Card.io combines traditional party games you know and love with AI technology to create endless unique game nights for any group. You can start by telling us a little about your group in order to personalize your game experience. Then, we'll use our AI to integrate this information into the different cards to tailor the game to your group. All you need is one device where each player will 'draw' cards from.",
      playingInstructions: "Each player will take turns 'drawing' a card from the deck and will follow the instructions on the card. This results in the player keeping the card or discarding it. Once the group is ready to be done playing, the number of cards for each player will be counted to declare a winner!"
    }
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigate('/questions');
    }
  };

  const handleSkipToGame = () => {
    navigate('/gameplay');
  };

  const handleBackToGame = () => {
    navigate(-1); // Go back to the previous page (game)
  };

  return (
    <div className="instructions-page">
      <h1 className="title">{pages[currentPage].title}</h1>
      
      <div className="description">
        {pages[currentPage].description}
      </div>

      <h2 className="subtitle">Playing the Game</h2>
      <div className="playing-instructions">
        {pages[currentPage].playingInstructions}
      </div>

      {!isPopup && (
        <div className="navigation">
          <div className="buttons">
            {fromGame ? (
              <button className="back-button" onClick={handleBackToGame}>Back to Game</button>
            ) : (
              <>
                <button className="skip-button" onClick={handleSkipToGame}>Skip to Game</button>
                <button className="next-button" onClick={handleNext}>
                  {currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructionsPage; 