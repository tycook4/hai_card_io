import os
from dotenv import load_dotenv
import groq
import json
import logging
from typing import List, Dict, Any
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Groq client
groq.api_key = os.getenv("GROQ_API_KEY")
if not groq.api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")

async def generate_game_cards(theme: str, difficulty: str, number_of_players: int, categories: List[str]) -> List[str]:
    """Generate game cards using Groq API with Mixtral."""
    try:
        prompt = f"""
        Generate 20 unique party game cards based on these preferences:
        - Theme: {theme}
        - Difficulty: {difficulty}
        - Number of players: {number_of_players}
        - Categories: {', '.join(categories)}

        Each card should contain a single question or prompt that encourages players to share stories, opinions, or engage in light-hearted activities.
        Return your response as a JSON array of strings with ONLY the questions, no additional formatting or explanation.
        Example format: ["Question 1", "Question 2", "Question 3"]
        """
        
        response = await groq.ChatCompletion.acreate(
            model="mistral-saba-24b",
            messages=[
                {"role": "system", "content": "You are a creative party game designer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        content = response.choices[0].message.content
        try:
            cards = json.loads(content)
            if not isinstance(cards, list):
                cards = [str(cards)]
            return cards
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from response: {content}")
            return []
            
    except Exception as e:
        logger.error(f"Error generating cards: {e}")
        return []

def get_random_color() -> str:
    """Return a random color from a curated list of colors that work well with white text."""
    colors = [
        "#1E40AF", "#1E3A8A", "#1E293B", "#1F2937", "#1F2937",  # Blues
        "#7C3AED", "#6D28D9", "#5B21B6", "#4C1D95", "#4C1D95",  # Purples
        "#BE185D", "#9D174D", "#831843", "#6B21A8", "#6B21A8",  # Pinks
        "#047857", "#065F46", "#064E3B", "#064E3B", "#064E3B",  # Greens
        "#B45309", "#92400E", "#78350F", "#78350F", "#78350F",  # Oranges
    ]
    return random.choice(colors)
