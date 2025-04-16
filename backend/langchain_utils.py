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

async def generate_game_cards(categories):
    try:
        print(f"Generating cards for categories: {categories}")
        prompt = ChatPromptTemplate.from_template(
            """Create 3 unique party game cards based on these categories: {categories}. 
            Each card should be a fun, engaging question or prompt that players can answer or act out.
            
            For example, if the categories were "funny" and "serious", you might return:
            [
                "If you could have any superpower for a day, what would it be and why?",
                "Describe your most embarrassing moment in 3 words or less",
                "What's the weirdest food combination you secretly love?"
            ]
            
            Important rules:
            1. Return ONLY a valid JSON array of strings
            2. Each string should be a complete question or prompt
            3. Make the prompts fun and engaging
            4. Keep responses concise but interesting
            
            Your response should be a JSON array of exactly 3 strings, like this:
            [
                "string 1",
                "string 2",
                "string 3"
            ]"""
        )
        chain = LLMChain(llm=llm, prompt=prompt)
        print("Running LLM chain...")
        result = await chain.arun({"categories": ", ".join(categories)})
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
