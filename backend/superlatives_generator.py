import os
from dotenv import load_dotenv
import groq
import json
import logging
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Groq client
groq.api_key = os.getenv("GROQ_API_KEY")
if not groq.api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")

async def generate_player_superlatives(players: List[Dict[str, Any]], game_preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate superlatives for each player using Groq API with Mixtral."""
    try:
        superlatives = []
        
        for player in players:
            prompt = f"""
            Create a fun and personalized superlative for a player in a party game.
            
            Player Name: {player['name']}
            Points: {player['points']}
            Correct Answers: {', '.join(player['correct_answers'])}
            
            Game Theme: {game_preferences['theme']}
            Difficulty: {game_preferences['difficulty']}
            
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
            
            response = await groq.ChatCompletion.acreate(
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
                superlative = json.loads(content)
                superlative["name"] = player['name']
                superlatives.append(superlative)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON for player {player['name']}: {content}")
                superlatives.append({
                    "name": player['name'],
                    "title": "Party Superstar",
                    "traits": ["Enthusiastic", "Social", "Fun-loving"],
                    "explanation": "For being an amazing player!"
                })
        
        return superlatives
        
    except Exception as e:
        logger.error(f"Error generating superlatives: {e}")
        return [] 