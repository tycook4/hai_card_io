import React from 'react';
import './Card.css';

const Card = ({ content, color, isFlipped, rotation, zIndex, onClick }) => {
  return (
    <div 
      className={`card ${isFlipped ? 'flipped' : ''}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        zIndex: zIndex
      }}
      onClick={onClick}
    >
      <div className="card-inner">
        <div className="card-front" style={{ backgroundColor: color }}>
          {content}
        </div>
        <div className="card-back" style={{ backgroundColor: color }}>
          <span>Card.io</span>
        </div>
      </div>
    </div>
  );
};

export default Card; 