import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './GamePage.css';

const GamePage = () => {
  const [players, setPlayers] = useState([]);
  const [completedCards, setCompletedCards] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState({ content: 'C', color: '#ed553b' });
  const [isDrawing, setIsDrawing] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isNameClicked, setIsNameClicked] = useState(false);

  useEffect(() => {
    const savedPlayers = localStorage.getItem('cardioPlayers');
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
  }, []);

  // Temporary deck for testing - this will be replaced with AI-generated content
  const demoCards = [
    { content: 'A', color: '#f6d55c' },
    { content: 'B', color: '#20aeb3' },
    { content: 'D', color: '#3baaa3' },
    { content: 'E', color: '#ed553b' },
  ];

  const handlePlayerClick = (index) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].points += 1;
    setPlayers(updatedPlayers);
    localStorage.setItem('cardioPlayers', JSON.stringify(updatedPlayers));
    setCompletedCards(completedCards + 1);
  };

  const handleNameClick = (index, event) => {
    // If we're already editing a name, don't do anything
    if (editingPlayer !== null) return;

    // Use a timer to detect double clicks
    if (!isNameClicked) {
      setIsNameClicked(true);
      setTimeout(() => {
        if (isNameClicked) {
          // Single click - award point
          handlePlayerClick(index);
        }
        setIsNameClicked(false);
      }, 250);
    } else {
      // Double click - enter edit mode
      setIsNameClicked(false);
      setEditingPlayer(index);
    }

    event.stopPropagation();
  };

  const handleNameChange = (index, newName) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].name = newName;
    setPlayers(updatedPlayers);
    localStorage.setItem('cardioPlayers', JSON.stringify(updatedPlayers));
  };

  const handleNameSubmit = (e) => {
    if (e.key === 'Enter') {
      setEditingPlayer(null);
    }
  };

  const drawCard = () => {
    if (isDrawing) return; // Prevent drawing while animation is in progress
    
    setIsDrawing(true);
    setIsFlipped(true);
    
    // Simulate drawing a random card
    const randomCard = demoCards[Math.floor(Math.random() * demoCards.length)];
    
    // Wait for the flip animation before showing new card
    setTimeout(() => {
      setCurrentCard(randomCard);
      setIsFlipped(false);
    }, 300);

    // Reset drawing state after animation
    setTimeout(() => {
      setIsDrawing(false);
    }, 600);
  };

  return (
    <div className="game-page">
      <header>
        <h1 className="game-title">Card.io</h1>
        <div className="completed-cards">
          Completed Cards {completedCards}/30
        </div>
      </header>

      <div className="game-content">
        <div className="players-list">
          {players.map((player, index) => (
            <div 
              key={player.id} 
              className="player-profile"
            >
              <div className="player-avatar" onClick={() => handlePlayerClick(index)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M20 21a8 8 0 10-16 0"/>
                </svg>
              </div>
              <div className="player-info">
                {editingPlayer === index ? (
                  <input
                    type="text"
                    className="player-name-input"
                    value={player.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    onKeyDown={handleNameSubmit}
                    onBlur={() => setEditingPlayer(null)}
                    autoFocus
                  />
                ) : (
                  <div 
                    className="player-name" 
                    onClick={(e) => handleNameClick(index, e)}
                    title="Click to award point, double-click to edit name"
                  >
                    {player.name}
                  </div>
                )}
                <div className="player-points">{player.points} points</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-area">
          <div className="card-stack" onClick={drawCard}>
            <div className="card card-1"></div>
            <div className="card card-2"></div>
            <div className="card card-3"></div>
            <div className="card card-4"></div>
            <div className="card card-5"></div>
            <div className="card card-6"></div>
            <div className="card card-7"></div>
            <div className="card card-8"></div>
            <div 
              className={`card active-card ${isFlipped ? 'flipped' : ''}`}
              style={{ backgroundColor: currentCard.color }}
            >
              <div className="card-inner">
                <div className="card-front">
                  <span className="card-content">{currentCard.content}</span>
                </div>
                <div className="card-back">
                  <span className="card-back-design">★</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="game-controls">
          <button className="waste-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12"/>
            </svg>
          </button>
        </div>
      </div>

      <footer className="game-footer">
        <Link to="/settings" className="settings-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </Link>
        <button className="rules-button">Rules</button>
        <Link to="/help" className="help-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
        </Link>
      </footer>
    </div>
  );
};

export default GamePage; 