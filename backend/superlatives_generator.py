from typing import List, Dict, Any
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
import os
import json

async def generate_player_superlatives(players: List[Dict[str, Any]], game_preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate personalized superlatives for each player based on their game performance and preferences.
    
    Args:
        players: List of player data including name, correct answers, and game stats
        game_preferences: The preferences used to generate the game content
        
    Returns:
        List of superlatives for each player
    """
    superlatives = []
    
    # Build context from game preferences
    preferences_context = ""
    if "goal" in game_preferences:
        preferences_context += f"The game's goal is to {game_preferences['goal']}. "
    if "personalization" in game_preferences:
        preferences_context += f"The level of personalization is {game_preferences['personalization']}. "
    if "themes" in game_preferences and game_preferences["themes"]:
        themes_text = game_preferences["themes"]
        preferences_context += f"The game themes are: {themes_text}. "
    
    # Fallback superlatives in case LLM fails
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
    
    # Process each player
    for i, player in enumerate(players):
        player_name = player.get("name", "Unknown Player")
        print(f"Processing superlative for {player_name}")
        
        # Get the questions the player answered correctly
        correct_answers = player.get("correctAnswers", [])
        
        # Process correct answers to extract content, handling both string and dict formats
        formatted_answers = []
        for answer in correct_answers:
            if isinstance(answer, dict) and "content" in answer:
                formatted_answers.append(answer["content"])
            elif isinstance(answer, str):
                formatted_answers.append(answer)
        
        # If player has no correct answers, use a fallback
        if not formatted_answers:
            index = i % len(fallback_titles)
            superlatives.append({
                "name": player_name,
                "title": fallback_titles[index],
                "traits": fallback_traits[index]
            })
            print(f"No correct answers for {player_name}, using fallback")
            continue
        
        # Format the text for the prompt
        correct_answers_text = "\n- " + "\n- ".join(formatted_answers)
        
        try:
            # Initialize the LLM with a unique temperature for each player
            # Start with a single model - reduce API complexity
            player_model = ChatGroq(
                model_name="llama3-8b-8192",  # Simpler model may be more reliable for structured output
                temperature=0.5 + (i * 0.05),  # Less variation but still unique
                groq_api_key=os.getenv("GROQ_API_KEY"),
            )
            
            # Build the prompt for this player - simplify for more reliable output
            prompt = """You are creating a funny superlative award for a player in a party game.

Player Name: {player_name}
Questions they answered correctly:
{correct_answers}

Create a superlative title and 3 personality traits for this player.
Return ONLY a valid JSON object with 'title' and 'traits' keys. The traits should be a list of 3 adjectives.

Example: {{"title": "Master of Random Knowledge", "traits": ["Clever", "Quick-thinking", "Encyclopedic"]}}"""
            
            formatted_prompt = prompt.format(
                player_name=player_name,
                correct_answers=correct_answers_text
            )
            
            # Get the response from the LLM
            response = await player_model.ainvoke(formatted_prompt)
            result_text = response.content.strip()
            
            print(f"Raw response for {player_name}: {result_text}")
            
            # Extract JSON from the response
            superlative_data = None
            
            # Try various methods to extract valid JSON
            try:
                # Method 1: Try to parse the whole response as JSON
                superlative_data = json.loads(result_text)
            except json.JSONDecodeError:
                try:
                    # Method 2: Look for JSON between code blocks
                    if "```json" in result_text:
                        json_str = result_text.split("```json")[1].split("```")[0].strip()
                        superlative_data = json.loads(json_str)
                    elif "```" in result_text:
                        json_str = result_text.split("```")[1].strip()
                        superlative_data = json.loads(json_str)
                except (json.JSONDecodeError, IndexError):
                    try:
                        # Method 3: Find anything that looks like {" ... "}
                        import re
                        pattern = r'\{(?:[^{}]|(?R))*\}'
                        matches = re.findall(r'\{.*?\}', result_text, re.DOTALL)
                        if matches:
                            for potential_json in matches:
                                try:
                                    superlative_data = json.loads(potential_json)
                                    if "title" in superlative_data and "traits" in superlative_data:
                                        break
                                except:
                                    continue
                    except:
                        pass
            
            # Verify we have valid data with required fields
            if superlative_data and "title" in superlative_data and "traits" in superlative_data:
                # Add the player name to the superlative
                superlative_data["name"] = player_name
                superlatives.append(superlative_data)
                print(f"Successfully generated superlative for {player_name}")
            else:
                # Use fallback
                print(f"Invalid superlative data format for {player_name}, using fallback")
                raise ValueError("Invalid data format")
                
        except Exception as e:
            print(f"Error generating superlative for {player_name}: {str(e)}")
            # Create a unique fallback for this player
            index = i % len(fallback_titles)
            superlatives.append({
                "name": player_name,
                "title": fallback_titles[index],
                "traits": fallback_traits[index]
            })
    
    # Ensure we have at least one superlative
    if not superlatives:
        superlatives = [{
            "name": "Everyone",
            "title": "Party Champions",
            "traits": ["Fun-loving", "Sociable", "Entertaining"]
        }]
    
    return superlatives 