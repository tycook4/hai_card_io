import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './SuperlativesPage.css';

function SuperlativesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(0);
  const [superlatives, setSuperlatives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get game data from location state
  const gameData = location.state?.gameData || { players: [], gamePreferences: {} };

  useEffect(() => {
    // Fetch superlatives from the backend
    const fetchSuperlatives = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8000/api/generate-superlatives', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gameData)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.superlatives)) {
          setSuperlatives(data.superlatives);
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching superlatives:', error);
        setError('Failed to load superlatives. Using default ones instead.');
        
        // Fallback to default superlatives
        const defaultSuperlatives = generateDefaultSuperlatives(gameData.players);
        setSuperlatives(defaultSuperlatives);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuperlatives();
  }, []);

  // Function to generate default superlatives if API call fails
  const generateDefaultSuperlatives = (players) => {
    const defaultTypes = [
      'Most Likely to Win Another Round',
      'Best Card Reader',
      'Most Creative Player',
      'Most Entertaining Reactions',
      'Most Competitive Player'
    ];

    const defaultTraits = [
      ['Quick-witted', 'Competitive', 'Strategic'],
      ['Attentive', 'Focused', 'Clear-minded'],
      ['Imaginative', 'Innovative', 'Artistic'],
      ['Expressive', 'Animated', 'Entertaining'],
      ['Determined', 'Driven', 'Ambitious']
    ];

    return defaultTypes.map((type, index) => {
      const randomPlayerIndex = Math.floor(Math.random() * players.length);
      return {
        title: type,
        name: players[randomPlayerIndex]?.name || 'Everyone',
        traits: defaultTraits[index]
      };
    });
  };

  const itemsPerPage = 3;
  const pageCount = Math.ceil(superlatives.length / itemsPerPage);
  
  const handleNextPage = () => {
    if (currentPage < pageCount - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigate('/questions');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="superlatives-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Generating superlatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="superlatives-page">
      <div className="superlatives-header">
        <h1>Superlatives</h1>
      </div>

      {error && <p className="error-message">{error}</p>}
      
      <div className="grid-container">
        <div className="superlatives-container" style={{ marginBottom: '2rem' }}>
          <div className="superlatives-grid">
            {superlatives.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((superlative, index) => (
              <div key={index} className="superlative-card">
                <h2 className="superlative-title">{superlative.title}</h2>
                <div className="superlative-winner">
                  <span className="winner-label">Winner:</span>
                  <span className="winner-name">{superlative.name}</span>
                </div>
                
                {superlative.traits && (
                  <div className="trait-container">
                    <h3>Player Traits:</h3>
                    <ul className="trait-list">
                      {superlative.traits.map((trait, traitIndex) => (
                        <li key={traitIndex} className="trait-item">{trait}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pagination-buttons">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="page-indicator">
          {currentPage + 1} / {pageCount}
        </span>
        <button
          onClick={handleNextPage}
          className="pagination-button"
        >
          {currentPage === pageCount - 1 ? 'Play Again' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export default SuperlativesPage;