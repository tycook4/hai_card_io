import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GameplayPage.css';
import Card from './components/Card';

const GameplayPage = () => {
  const location = useLocation();
  const playerCount = location.state?.playerCount || 2; // Default to 2 if not specified
  const [completedCards, setCompletedCards] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [players, setPlayers] = useState(() => {
    // Generate initial players array based on count
    return Array(playerCount).fill(null).map((_, index) => ({
      name: `Player ${index + 1}`,
      points: 0
    }));
  });
  
  const navigate = useNavigate();
  
  // Sample card deck - you can expand this with more cards
  const cardDeck = [
    {
      content: "Tell a story about your most embarrassing moment",
      color: "#F6D55C"
    },
    {
      content: "What's your biggest fear?",
      color: "#3CAEA3"
    },
    {
      content: "If you could have any superpower, what would it be?",
      color: "#ED5535"
    },
    {
      content: "What's your favorite childhood memory?",
      color: "#20639B"
    },
    {
      content: "If you could travel anywhere right now, where would you go?",
      color: "#173F5F"
    }
  ];

  const handleCardClick = () => {
    setIsFlipped(true);
    
    // Wait for flip animation to complete before changing card
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % cardDeck.length);
      setCompletedCards((prev) => prev + 1);
      setIsFlipped(false);
    }, 800);
  };

  const handlePlayerClick = (playerIndex) => {
    setPlayers(players.map((player, index) => 
      index === playerIndex 
        ? { ...player, points: player.points + 1 }
        : player
    ));
  };

  return (
    <div className="gameplay-container">
      <header className="gameplay-header">
        <h1 className="logo">Card.io</h1>
        <button className="rules-button">rules</button>
      </header>

      <div className="main-content">
        <div className="players-section">
          {players.map((player, index) => (
            <div 
              key={index} 
              className="player-card"
              onClick={() => handlePlayerClick(index)}
            >
              <div className="player-avatar">
                <svg viewBox="0 0 24 24" className="user-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <div className="player-info">
                {player.name} {player.points} points
              </div>
            </div>
          ))}
        </div>

        <div className="cards-section">
          <div className="card-stack">
            {/* Background cards for visual effect */}
            <div className="card card-background" style={{ transform: 'rotate(-6deg)', backgroundColor: '#ED5535', zIndex: 1 }} />
            <div className="card card-background" style={{ transform: 'rotate(-3deg)', backgroundColor: '#3CAEA3', zIndex: 2 }} />
            
            {/* Main interactive card */}
            <Card
              content={cardDeck[currentCardIndex].content}
              color={cardDeck[currentCardIndex].color}
              isFlipped={isFlipped}
              rotation={0}
              zIndex={3}
              onClick={handleCardClick}
            />
          </div>
        </div>

        <div className="game-info">
          <div className="instructions-box">
            <p>Draw a card and follow the directions. When you're done with the card, click the profile of the player who won the card to keep track of points! Then repeat! Have fun!</p>
          </div>
          <div className="completed-cards">
            Completed Cards {completedCards}/30
          </div>
        </div>
      </div>

      <footer className="gameplay-footer">
        <button className="settings-button">
          <img src="/settings-icon.svg" alt="Settings" />
        </button>
        <div className="waste-bin">
          <img src="/waste-icon.svg" alt="Waste" />
        </div>
        <button className="ask-question-button">
          <img src="/question-icon.svg" alt="Ask Question" />
        </button>
      </footer>
    </div>
  );
};

export default GameplayPage; 