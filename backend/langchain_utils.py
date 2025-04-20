import os
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
#from langchain_community.chat_models import ChatGroq
from langchain_groq import ChatGroq
import json

load_dotenv()

# Check if API key is set
if not os.getenv("GROQ_API_KEY"):
    raise ValueError("GROQ_API_KEY environment variable is not set")

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="mistral-saba-24b",  # Or llama3-8b-8192 when supported
    temperature=0.7
)

async def generate_game_cards(game_preferences, existing_cards=None):
    try:
        print(f"Generating cards with preferences: {game_preferences}")
        
        # Build the context based on game preferences first
        preferences_context = ""
        if game_preferences.goal:
            preferences_context += f"""The goal of the game was chosen from these options:
            - Get to know new friends
            - Tell-all with close friends
            - Casual chatty debates
            - Lightly competitive fun
            
            The selected goal is: {game_preferences.goal}
            This means the cards should help achieve this specific goal.\n\n"""
            
        if game_preferences.personalization:
            preferences_context += f"""The level of personalization was chosen from these options:
            - Not personalized at all
            - Doesn't need to start out personalized, can learn as it goes
            - Personalized to reference certain themes or ideas
            - Highly personalized for each player
            
            The selected level is: {game_preferences.personalization}
            Adjust the card content accordingly to match this level of personalization.\n\n"""
            
        if game_preferences.themes:
            preferences_context += f"""The players specifically mentioned they want to include these themes or topics:
            {game_preferences.themes}
            
            Make sure to incorporate these themes into the cards while keeping them fun and engaging.\n\n"""

        # Add context about existing cards to avoid repetition
        if existing_cards:
            preferences_context += f"""\nHere are the questions that have already been generated:
            {', '.join(existing_cards)}
            
            Make sure to generate completely new and different questions that haven't been used before.\n\n"""

        # Now build the prompt template with the context
        prompt_template = """Create 20 unique party game cards based on these preferences:

        {preferences_context}
        
        Each card should be a fun, engaging question or prompt that players can answer or act out.
        
        Important rules:
        1. Return ONLY a valid JSON array of strings
        2. Each string should be a complete question or prompt
        3. Make the prompts fun and engaging
        4. Keep responses concise but interesting
        5. Tailor the prompts to match the game's goal and themes
        6. Consider the context of how these preferences were chosen
        7. Generate exactly 20 unique questions
        8. Make sure the questions are different from any existing ones
        
        Your response should be a JSON array of exactly 20 strings, like this:
        [
            "string 1",
            "string 2",
            ...
            "string 20"
        ]"""

        prompt = ChatPromptTemplate.from_template(prompt_template)
        chain = LLMChain(llm=llm, prompt=prompt)
        print("Running LLM chain...")
        result = await chain.arun({
            "preferences_context": preferences_context
        })
        print(f"Raw LLM response: {result}")
        
        # Try to parse the response as JSON
        try:
            cards = json.loads(result)
            print(f"Parsed cards: {cards}")
            return cards
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            # If parsing fails, try to extract cards from the text response
            lines = [line.strip() for line in result.split("\n") if line.strip()]
            print(f"Extracted lines: {lines}")
            return lines if lines else ["Failed to generate cards"]
            
    except Exception as e:
        print(f"Error generating cards: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return ["Failed to generate cards"]

def generate_superlatives(game_data):
    prompt = ChatPromptTemplate.from_template(
        "Based on this game data: {game_data}, assign a fun superlative to each player. Be witty and creative, like 'Wildcard Energy' or 'Trivia King'."
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    result = chain.run({"game_data": str(game_data)})
    return result.split("\n")
