import React from 'react';
import { Link } from 'react-router-dom';
import './EndScreen.css';

function EndScreen() {
  return (
    <div className="end-screen">
      <div className="end-screen-container">
        <h1>having fun?</h1>
        <div className="vertical-line"></div>
        <div className="options-container">
          <div className="option">
            <h2>replay game</h2>
            <button className="circle-button replay">
              <div className="replay-icon"></div>
            </button>
          </div>
          <div className="option">
            <h2>new game</h2>
            <button className="circle-button new-game">
              <div className="arrow-icon"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EndScreen; 