from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from langchain_utils import generate_game_cards, generate_superlatives
import random

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
    gamePreferences: GamePreferences
    existingCards: Optional[List[str]] = None

class GameData(BaseModel):
    players: List[str]
    scores: dict

@app.post("/api/generate-cards")
async def generate_cards(request: CardRequest):
    try:
        cards = await generate_game_cards(request.gamePreferences, request.existingCards)
        
        # Add random colors to each card
        colors = ["#F6D55C", "#3CAEA3", "#ED5535", "#20639B", "#173F5F"]
        cards_with_colors = [
            {
                "content": card,
                "color": random.choice(colors)
            }
            for card in cards
        ]
        
        return {
            "success": True,
            "cards": cards_with_colors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-superlatives")
async def generate_superlatives_endpoint(game_data: GameData):
    try:
        superlatives = generate_superlatives(game_data.dict())
        return {
            "success": True,
            "superlatives": superlatives
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

