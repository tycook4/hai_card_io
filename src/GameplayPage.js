import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GameplayPage.css';
import Card from './components/Card';

const GameplayPage = () => {
  const location = useLocation();
  const { playerCount, gamePreferences } = location.state || { playerCount: 2, gamePreferences: {} };
  const [completedCards, setCompletedCards] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [cardDeck, setCardDeck] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usedCards, setUsedCards] = useState([]);
  const [cardsInitialized, setCardsInitialized] = useState(false);
  const [playerPerformance, setPlayerPerformance] = useState({});
  
  const [players, setPlayers] = useState(() => {
    return Array(playerCount).fill(null).map((_, index) => ({
      name: `Player ${index + 1}`,
      points: 0,
      correctCards: []
    }));
  });
  
  useEffect(() => {
    const initialPerformance = {};
    players.forEach(player => {
      initialPerformance[player.name] = {
        correctCards: []
      };
    });
    setPlayerPerformance(initialPerformance);
  }, []);

  const navigate = useNavigate();
  
  const fetchCards = async (existingCards = []) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/api/generate-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gamePreferences,
          existingCards
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !Array.isArray(data.cards)) {
        throw new Error('Invalid response format from server');
      }

      const colors = ["#F6D55C", "#3CAEA3", "#ED5535", "#20639B", "#173F5F"];
      const coloredCards = data.cards.map((card, index) => ({
        ...card,
        color: colors[index % colors.length]
      }));

      setCardDeck(prevDeck => [...prevDeck, ...coloredCards]);
      setIsLoading(false);
      setCardsInitialized(true);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [gamePreferences]);

  const getRandomColor = () => {
    const colors = ["#F6D55C", "#3CAEA3", "#ED5535", "#20639B", "#173F5F"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleRulesClick = () => {
    navigate('/instructions');
  };

  const handleEndGame = () => {
    const gameData = {
      players: players.map(player => ({
        name: player.name,
        points: player.points,
        correctAnswers: playerPerformance[player.name]?.correctCards || []
      })),
      gamePreferences: gamePreferences
    };
    
    navigate('/superlatives', { state: { gameData } });
  };

  const handleCardClick = () => {
    setIsFlipped(true);
    
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        
        if (newIndex + 5 >= cardDeck.length) {
          const usedCardContents = cardDeck.slice(0, newIndex).map(card => card.content);
          setUsedCards(usedCardContents);
          fetchCards(usedCardContents);
        }
        
        return newIndex;
      });
      setIsFlipped(false);
    }, 800);
  };

  const handlePlayerClick = (playerIndex) => {
    if (editingPlayer !== null) return;

    const player = players[playerIndex];
    const currentCard = cardDeck[currentCardIndex % cardDeck.length];

    setPlayers(players.map((p, index) => 
      index === playerIndex 
        ? { 
            ...p, 
            points: p.points + 1, 
            correctCards: [...p.correctCards, currentCard.content] 
          }
        : p
    ));

    setPlayerPerformance(prev => {
      const updatedPerformance = { ...prev };
      
      const playerName = player.name;
      if (!updatedPerformance[playerName]) {
        updatedPerformance[playerName] = { correctCards: [] };
      }
      
      updatedPerformance[playerName].correctCards.push({
        content: currentCard.content,
        color: currentCard.color
      });
      
      return updatedPerformance;
    });

    setCompletedCards((prev) => prev + 1);
  };

  const handleNameEdit = (playerIndex) => {
    setEditingPlayer(playerIndex);
  };

  const handleNameChange = (event, playerIndex) => {
    if (event.key === 'Enter') {
      const oldName = players[playerIndex].name;
      const newName = event.target.value.trim();
      
      if (newName) {
        setPlayers(players.map((player, index) => 
          index === playerIndex 
            ? { ...player, name: newName }
            : player
        ));
        
        setPlayerPerformance(prev => {
          const updatedPerformance = { ...prev };
          
          if (updatedPerformance[oldName]) {
            updatedPerformance[newName] = updatedPerformance[oldName];
            delete updatedPerformance[oldName];
          } else {
            updatedPerformance[newName] = { correctCards: [] };
          }
          
          return updatedPerformance;
        });
      }
      setEditingPlayer(null);
    } else if (event.key === 'Escape') {
      setEditingPlayer(null);
    }
  };

  const handleTrashClick = () => {
    setIsFlipped(true);
    
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % cardDeck.length);
      setIsFlipped(false);
    }, 800);
  };

  return (
    <div className="gameplay-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <h2>Generating your personalized cards...</h2>
            <p>Creating fun questions based on your preferences</p>
          </div>
        </div>
      )}
      
      <header className="gameplay-header">
        <h1 className="logo">Card.io</h1>
        <div className="header-buttons">
          <button className="rules-button" onClick={handleRulesClick}>Rules</button>
          <button className="end-game-button" onClick={handleEndGame}>End Game</button>
        </div>
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
                {editingPlayer === index ? (
                  <input
                    type="text"
                    className="player-name-input"
                    defaultValue={player.name}
                    autoFocus
                    onKeyDown={(e) => handleNameChange(e, index)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <strong>{player.name}</strong>
                    <button 
                      className="edit-name-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNameEdit(index);
                      }}
                    >
                      ✎
                    </button>
                  </>
                )}
                <span className="points-text"> {player.points} points</span>
              </div>
            </div>
          ))}
        </div>

        <div className="cards-section">
          <div className="card-stack">
            <div className="card card-background" style={{ transform: 'rotate(-12deg)', backgroundColor: '#F6D55C', zIndex: 1 }} />
            <div className="card card-background" style={{ transform: 'rotate(-9deg)', backgroundColor: '#20639B', zIndex: 2 }} />
            <div className="card card-background" style={{ transform: 'rotate(-6deg)', backgroundColor: '#ED5535', zIndex: 3 }} />
            <div className="card card-background" style={{ transform: 'rotate(-3deg)', backgroundColor: '#3CAEA3', zIndex: 4 }} />
            
            {cardDeck.length > 0 ? (
              <Card
                content={cardDeck[currentCardIndex % cardDeck.length].content}
                color={cardDeck[currentCardIndex % cardDeck.length].color}
                isFlipped={isFlipped}
                rotation={0}
                zIndex={5}
                onClick={handleCardClick}
              />
            ) : !isLoading ? (
              <div className="empty-card">No cards available</div>
            ) : null}
          </div>
        </div>

        <div className="game-info">
          <div className="instructions-box">
            <p>Draw a card and follow the directions. When you're done with the card, click the profile of the player who won the card to keep track of points! Then repeat! Have fun!</p>
          </div>
          <div className="completed-cards">
            Completed Cards: {completedCards}
          </div>
        </div>
      </div>

      <footer className="gameplay-footer">
        <div className="waste-bin" onClick={handleTrashClick}>
          <img src="/waste-icon.svg" alt="Waste" />
        </div>
      </footer>
    </div>
  );
};

export default GameplayPage;