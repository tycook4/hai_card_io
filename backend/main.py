from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
from groq import Groq
import json
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
if not os.getenv("GROQ_API_KEY"):
    raise ValueError("GROQ_API_KEY environment variable is not set")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GamePreferences(BaseModel):
    theme: Optional[str] = "General"
    themes: Optional[str] = ""
    difficulty: Optional[str] = "Medium"
    number_of_players: Optional[int] = 2
    categories: Optional[List[str]] = ["General Knowledge", "Fun Facts", "Would You Rather"]

    def get_theme(self) -> str:
        """Get the theme, prioritizing the themes field if it exists."""
        return self.themes if self.themes else self.theme

class PlayerData(BaseModel):
    name: str
    points: int
    correctAnswers: List[str]

class SuperlativesRequest(BaseModel):
    players: List[PlayerData]
    gamePreferences: GamePreferences

class CardRequest(BaseModel):
    gamePreferences: GamePreferences
    existingCards: Optional[List[str]] = []

def parse_json_response(content: str) -> List[str]:
    """Parse JSON response, handling markdown code blocks if present."""
    try:
        # Try to parse the content directly first
        return json.loads(content)
    except json.JSONDecodeError:
        try:
            # If that fails, try to extract JSON from markdown code blocks
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
            else:
                # If no code blocks, try to find JSON array pattern
                match = re.search(r'\[\s*".*"\s*\]', content, re.DOTALL)
                if match:
                    json_str = match.group(0)
                else:
                    raise ValueError("No valid JSON found in response")
            
            return json.loads(json_str)
        except Exception as e:
            logger.error(f"Failed to parse JSON from response: {content}")
            logger.error(f"Error details: {str(e)}")
            return []

async def generate_game_cards(preferences: GamePreferences, existing_cards: List[str] = []) -> List[str]:
    """Generate game cards using Groq API with Mixtral."""
    try:
        prompt = f"""
        Generate 20 unique party game cards based on these preferences:
        - Theme: {preferences.get_theme()}
        - Difficulty: {preferences.difficulty}
        - Number of players: {preferences.number_of_players}
        - Categories: {', '.join(preferences.categories)}

        Each card should contain a single question or prompt that encourages players to share stories, opinions, or engage in light-hearted activities.
        Return your response as a JSON array of strings with ONLY the questions, no additional formatting or explanation.
        Example format: ["Question 1", "Question 2", "Question 3"]
        """
        
        response = client.chat.completions.create(
            model="mistral-saba-24b",
            messages=[
                {"role": "system", "content": "You are a creative party game designer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        content = response.choices[0].message.content
        cards = parse_json_response(content)
        if not isinstance(cards, list):
            cards = [str(cards)]
        return cards
            
    except Exception as e:
        logger.error(f"Error generating cards: {e}")
        return []

async def generate_player_superlatives(players: List[PlayerData], game_preferences: GamePreferences) -> List[Dict[str, Any]]:
    """Generate superlatives for each player using Groq API with Mixtral."""
    try:
        superlatives = []
        
        for player in players:
            prompt = f"""
            Create a fun and personalized superlative for a player in a party game.
            
            Player Name: {player.name}
            Points: {player.points}
            Correct Answers: {', '.join(player.correctAnswers)}
            
            Game Theme: {game_preferences.get_theme()}
            Difficulty: {game_preferences.difficulty}
            
            Return your response as a JSON object with:
            - title: A creative superlative title
            - traits: 3 personality traits that best describe the player
            - explanation: A brief explanation of why they earned this superlative
            
            Example format:
            {{
                "title": "The Social Butterfly",
                "traits": ["Outgoing", "Friendly", "Charismatic"],
                "explanation": "For being the life of the party!"
            }}
            """
            
            response = client.chat.completions.create(
                model="mistral-saba-24b",
                messages=[
                    {"role": "system", "content": "You are a creative party game host."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            content = response.choices[0].message.content
            try:
                superlative = parse_json_response(content)
                superlative["name"] = player.name
                superlatives.append(superlative)
            except Exception as e:
                logger.error(f"Failed to parse JSON for player {player.name}: {content}")
                logger.error(f"Error details: {str(e)}")
                superlatives.append({
                    "name": player.name,
                    "title": "Party Superstar",
                    "traits": ["Enthusiastic", "Social", "Fun-loving"],
                    "explanation": "For being an amazing player!"
                })
        
        return superlatives
        
    except Exception as e:
        logger.error(f"Error generating superlatives: {e}")
        return []

@app.post("/api/generate-cards")
async def generate_cards(request: CardRequest):
    try:
        cards = await generate_game_cards(request.gamePreferences, request.existingCards)
        return {"success": True, "cards": cards}
    except Exception as e:
        logger.error(f"Error generating cards: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-superlatives")
async def generate_superlatives(request: SuperlativesRequest):
    try:
        superlatives = await generate_player_superlatives(
            request.players,
            request.gamePreferences
        )
        return {"success": True, "superlatives": superlatives}
    except Exception as e:
        logger.error(f"Error generating superlatives: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

