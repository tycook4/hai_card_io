import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SuperlativesPage.css';

function SuperlativesPage() {
  const navigate = useNavigate();
  const allSuperlatives = [
    {
      name: "tyler",
      title: "the class clown",
      traits: ["lighthearted", "loyal", "collaborative"]
    },
    {
      name: "kate",
      title: "most likely to be catfished",
      traits: ["lighthearted", "loyal", "collaborative"]
    },
    {
      name: "bridget",
      title: "a victim of senioritis",
      traits: ["lighthearted", "loyal", "collaborative"]
    },
    {
      name: "alex",
      title: "most likely to succeed",
      traits: ["ambitious", "focused", "determined"]
    },
    {
      name: "jordan",
      title: "best all around",
      traits: ["friendly", "smart", "athletic"]
    }
  ];

  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(allSuperlatives.length / itemsPerPage);
  
  const currentSuperlatives = allSuperlatives.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage === totalPages - 1) {
      navigate('/end');
    } else {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div className="superlatives-page">
      <div className="superlatives-container">
        <div className="header-container">
          <h1>superlatives</h1>
          <div className="pagination-nav">
            <button 
              className="nav-arrow prev"
              onClick={prevPage}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              ←
            </button>
            <button 
              className="nav-arrow next"
              onClick={nextPage}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        </div>
        <p className="description">lorem ipsum dolor sit amet</p>
        <div className="superlatives-content">
          {currentSuperlatives.map((superlative, index) => (
            <div key={index} className="superlative-card">
              <div className="user-circle" />
              <h2 className="user-name">{superlative.name}</h2>
              <h3 className="superlative-title">{superlative.title}</h3>
              <div className="trait-buttons">
                {superlative.traits.map((trait, traitIndex) => (
                  <div key={traitIndex} className="trait-button">
                    {trait}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="navigation-buttons">
          <Link to="/questions" className="nav-button">Back to Questions</Link>
          <Link to="/" className="nav-button">Home</Link>
        </div>
      </div>
    </div>
  );
}

export default SuperlativesPage; 