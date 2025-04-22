from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from langchain_utils import generate_game_cards, generate_superlatives
import random
import re

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class GamePreferences(BaseModel):
    goal: Optional[str] = None
    personalization: Optional[str] = None
    themes: Optional[str] = None

class CardRequest(BaseModel):
    gamePreferences: Dict[str, Any]
    existingCards: Optional[List[Dict[str, Any]]] = None

class PlayerCard(BaseModel):
    content: str
    color: str

class Player(BaseModel):
    name: str
    points: int
    cards: List[PlayerCard] = []

class GameData(BaseModel):
    players: List[Player]

class SuperlativeRequest(BaseModel):
    gameData: GameData

class SuperlativesRequest(BaseModel):
    players: List[Dict[str, Any]]
    gamePreferences: Dict[str, Any]

@app.post("/api/generate-cards")
async def generate_cards(request: CardRequest):
    if not request.gamePreferences:
        raise HTTPException(status_code=400, detail="Game preferences are required")
    
    # Map frontend preference keys to what backend expects
    game_prefs = {
        "goal": request.gamePreferences.get("goal"),
        "personalization": request.gamePreferences.get("personalization"),
        "themes": request.gamePreferences.get("themes")
    }
    
    # Generate cards using LangChain
    cards = await generate_game_cards(game_prefs, request.existingCards)
    
    # Add color to each card
    colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#33FFF5", "#F5FF33"]
    cards_with_colors = []
    
    for card in cards:
        # Handle both string and dictionary cards
        if isinstance(card, str):
            card_with_color = {"content": card, "color": random.choice(colors)}
        else:
            card_with_color = {**card, "color": random.choice(colors)}
        cards_with_colors.append(card_with_color)
    
    return {"success": True, "cards": cards_with_colors}

@app.post("/api/generate-superlatives")
async def generate_superlatives(request: SuperlativesRequest):
    if not request.players or len(request.players) == 0:
        raise HTTPException(status_code=400, detail="Player data is required")
    
    try:
        # Import here to avoid circular imports
        from superlatives_generator import generate_player_superlatives
        
        # Log player data for debugging
        print(f"Generating superlatives for {len(request.players)} players")
        for i, player in enumerate(request.players):
            print(f"Player {i+1}: {player.get('name', 'Unknown')}")
            correct_answers = player.get("correctAnswers", [])
            print(f"  Has {len(correct_answers)} correct answers")
        
        # Debug mode with faster fallbacks - set to True to skip LLM calls
        debug_mode = False
        
        if debug_mode:
            # Generate fallback superlatives for faster testing
            fallback_titles = [
                "Mystery Participant", 
                "Unpredictable Challenger", 
                "Dark Horse Competitor",
                "Surprise Strategist",
                "Enigmatic Gamer",
                "Quick Thinker",
                "Creative Mind",
                "Star Player",
                "Team Mastermind",
                "Game Champion"
            ]
            
            fallback_traits = [
                ["Enigmatic", "Unpredictable", "Intriguing"],
                ["Mysterious", "Strategic", "Surprising"],
                ["Unconventional", "Adaptable", "Clever"],
                ["Unexpected", "Resourceful", "Witty"],
                ["Analytical", "Thoughtful", "Subtle"],
                ["Fast", "Sharp", "Decisive"],
                ["Imaginative", "Original", "Inventive"],
                ["Skilled", "Enthusiastic", "Talented"],
                ["Smart", "Tactical", "Organized"],
                ["Competitive", "Determined", "Focused"]
            ]
            
            superlatives = []
            for i, player in enumerate(request.players):
                index = i % len(fallback_titles)
                superlatives.append({
                    "name": player.get("name", "Player"),
                    "title": fallback_titles[index],
                    "traits": fallback_traits[index]
                })
        else:
            # Normal LLM-based generation
            superlatives = await generate_player_superlatives(request.players, request.gamePreferences)
        
        # Log generated superlatives
        print(f"Generated {len(superlatives)} superlatives")
        for i, sup in enumerate(superlatives):
            print(f"Superlative {i+1}: {sup.get('title', 'Unknown')} for {sup.get('name', 'Unknown')}")
        
        return {"success": True, "superlatives": superlatives}
    except Exception as e:
        print(f"Error in generate_superlatives endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate superlatives: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

