import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InstructionsPage.css';

const InstructionsPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const pages = [
    {
      title: "How to Play",
      description: "Card.io combines traditional party games you know and love with AI technology to create endless unique game nights for any group. You can start by telling us a little about your group in order to personalize your game experience. Then, we'll use our AI to integrate this information into the different cards listed below to tailor the game to your group. All you need is one device where each player will 'draw' different types of cards from.",
      cardTypes: [
        {
          color: "#F6D55C",
          title: "Never Have I Ever",
          description: "This card will have a statement starting with 'Never have I ever...' and if the player who draws the card has not done the thing on the card, they get to keep it. If they have done what is on the card, they must give up the card."
        },
        {
          color: "#3CAEA3",
          title: "Most Likely To",
          description: "The player who draws this card will read the 'Most likely to...' statement and decide which player it fits best. That player gets to keep the card."
        },
        {
          color: "#20639B",
          title: "Fishbowl",
          description: "The player who draws this card must explain the person, place, or thing listed on the card without using any words on the card. This first person to guess what is on the card gets to keep the card."
        },
        {
          color: "#ED553B",
          title: "Dare",
          description: "The player who draws this card must complete the dare listed on the card in order to keep the card. If they cannot complete the action, they must give up the card."
        }
      ],
      playingInstructions: "Each player will take turns 'drawing' a card from the deck and will follow the rules of the card type. This results in the player keeping the card or discarding it. Once the group is ready to be done playing, the number of cards for each player will be counted to declare a winner!"
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

  return (
    <div className="instructions-page">
      <h1 className="title">{pages[currentPage].title}</h1>
      
      <div className="description">
        {pages[currentPage].description}
      </div>

      <h2 className="subtitle">Types of Cards</h2>
      
      <div className="card-types">
        {pages[currentPage].cardTypes.map((card, index) => (
          <div key={index} className="card-type">
            <div className="color-indicator" style={{ backgroundColor: card.color }}></div>
            <div className="card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="subtitle">Playing the Game</h2>
      <div className="playing-instructions">
        {pages[currentPage].playingInstructions}
      </div>

      <div className="navigation">
        <div className="buttons">
          <button className="skip-button" onClick={handleSkipToGame}>Skip to Game</button>
          <button className="next-button" onClick={handleNext}>
            {currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPage; 