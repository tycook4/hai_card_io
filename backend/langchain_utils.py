import os
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain.chains import LLMChain
from langchain_groq import ChatGroq
import json
import re
from typing import List, Dict, Any, Optional

load_dotenv()

# Check if API key is set
if not os.getenv("GROQ_API_KEY"):
    raise ValueError("GROQ_API_KEY environment variable is not set")

# Initialize the language model
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama3-8b-8192",  # Or "mixtral-8x7b-32768" or other Groq models
    temperature=0.7
)

async def generate_game_cards(game_preferences, existing_cards=None):
    if existing_cards is None:
        existing_cards = []
    
    # Build context from game preferences
    preferences_context = ""
    if game_preferences.get("goal"):
        preferences_context += f"The goal of the game is: {game_preferences['goal']}. "
    
    if game_preferences.get("personalization"):
        preferences_context += f"The level of personalization should be: {game_preferences['personalization']}. "
    
    if game_preferences.get("themes"):
        preferences_context += f"The game should incorporate these themes: {game_preferences['themes']}. "
    
    # Add existing cards to avoid repetition
    existing_cards_text = ""
    if existing_cards and len(existing_cards) > 0:
        existing_cards_text = "Here are the questions that have already been generated, DO NOT repeat any of these:\n"
        for i, card in enumerate(existing_cards):
            if isinstance(card, dict) and "content" in card:
                existing_cards_text += f"{i+1}. {card['content']}\n"
            else:
                existing_cards_text += f"{i+1}. {card}\n"
    
    # Create the prompt template
    prompt = PromptTemplate(
        input_variables=["preferences_context", "existing_cards"],
        template="""
You are a creative party game designer. Generate 20 unique party game cards that are fun, engaging, and promote social interaction.

{preferences_context}

{existing_cards}

Each card should contain a single question or prompt that encourages players to share stories, opinions, or engage in light-hearted activities.

Return your response as a JSON array of strings with ONLY the questions, no additional formatting or explanation.
Example format: ["Question 1", "Question 2", "Question 3"]

Make sure the questions are diverse, inclusive, and appropriate for adults in social settings.
Do not include any game mechanics or instructions in the questions themselves.
"""
    )
    
    # Create the chain
    chain = LLMChain(llm=llm, prompt=prompt)
    
    # Run the chain
    try:
        result = await chain.ainvoke({
            "preferences_context": preferences_context,
            "existing_cards": existing_cards_text
        })
        
        output = result.get("text", "").strip()
        
        # Try to extract JSON array from the output
        try:
            # Find JSON array by looking for text between [ and ]
            json_pattern = re.compile(r'\[\s*".*"\s*\]', re.DOTALL)
            match = json_pattern.search(output)
            
            if match:
                json_str = match.group(0)
                cards = json.loads(json_str)
            else:
                # Try to clean up the output to make it valid JSON
                cleaned_output = output.replace("```json", "").replace("```", "").strip()
                cards = json.loads(cleaned_output)
                
            # Convert to list of strings if needed
            if not isinstance(cards, list):
                cards = [str(cards)]
            
            return cards
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Output that couldn't be parsed: {output}")
            
            # Fallback to manual parsing if JSON parsing fails
            try:
                # Look for numbered items or quoted strings
                item_pattern = re.compile(r'"([^"]+)"|\'([^\']+)\'|\d+\.\s*(.+)$', re.MULTILINE)
                matches = item_pattern.findall(output)
                
                cards = []
                for match in matches:
                    # Use the first non-empty group
                    card = next((group for group in match if group), "")
                    if card:
                        cards.append(card)
                
                if cards:
                    return cards
            except Exception as parsing_error:
                print(f"Manual parsing failed: {parsing_error}")
        
            # Last resort fallback
            return ["What's your favorite movie and why?", 
                    "If you could travel anywhere in the world, where would you go?", 
                    "What's the most embarrassing thing that happened to you recently?"]
    except Exception as e:
        print(f"Error generating cards: {e}")
        # Emergency fallback cards
        return ["Tell us about your favorite hobby.",
                "What's something you're proud of accomplishing?",
                "If you could have any superpower, what would it be?"]

def generate_superlatives(game_data):
    prompt = ChatPromptTemplate.from_template(
        "Based on this game data: {game_data}, assign a fun superlative to each player. Be witty and creative, like 'Wildcard Energy' or 'Trivia King'."
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    result = chain.run({"game_data": str(game_data)})
    return result.split("\n")

async def generate_superlatives(player_name: str, answered_cards: List[str], points: int) -> Dict[str, Any]:
    """
    Generate a personalized superlative for a player based on the cards they answered correctly.
    
    Args:
        player_name: Name of the player
        answered_cards: List of questions/prompts the player answered correctly
        points: Total points the player scored
        
    Returns:
        Dict containing the player's superlative title and traits
    """
    # Create contextual information about the player's performance
    cards_text = "\n".join([f"- {card}" for card in answered_cards])
    
    # Create the prompt template
    prompt = PromptTemplate(
        input_variables=["player_name", "cards_text", "points"],
        template="""
You are creating personalized "superlative awards" for players in a party game.

Player: {player_name}
Points Scored: {points}

This player correctly answered the following questions/prompts:
{cards_text}

Based on the content of these questions and their performance, create a unique and personalized superlative award for this player.

Return your response in JSON format with the following structure:
{{
  "title": "A creative and unique superlative title that reflects their personality based on their answers",
  "traits": ["3-5 personality traits or characteristics that this player demonstrated"]
}}

Be creative, positive, and personalized in your superlative title. Analyze the themes in their correctly answered questions to determine what personality traits or interests they might have.
"""
    )
    
    # Create the chain
    chain = LLMChain(llm=llm, prompt=prompt)
    
    # Run the chain
    result = await chain.ainvoke({
        "player_name": player_name,
        "cards_text": cards_text,
        "points": points
    })
    
    output = result.get("text", "").strip()
    
    # Try to extract JSON data from the output
    try:
        # Clean up the output to make it valid JSON
        cleaned_output = output.replace("```json", "").replace("```", "").strip()
        superlative_data = json.loads(cleaned_output)
        
        # Ensure the required fields are present
        if "title" not in superlative_data:
            superlative_data["title"] = "Party Superstar"
            
        if "traits" not in superlative_data or not isinstance(superlative_data["traits"], list):
            superlative_data["traits"] = ["Enthusiastic", "Social", "Fun-loving"]
            
        return superlative_data
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error in superlatives: {e}")
        print(f"Output that couldn't be parsed: {output}")
        
        # Fallback data if JSON parsing fails
        return {
            "title": f"{player_name} the Party Superstar",
            "traits": ["Enthusiastic", "Social", "Fun-loving", "Creative"]
        }
