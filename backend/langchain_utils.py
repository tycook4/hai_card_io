import os
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
#from langchain_community.chat_models import ChatGroq
from langchain_groq import ChatGroq

load_dotenv()

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="mixtral-8x7b-32768",  # Or llama3-8b-8192 when supported
    temperature=0.7
)

def generate_game_cards(categories):
    prompt = ChatPromptTemplate.from_template(
        "Create 3 unique party game cards based on these categories: {categories}. Each card should have a name and a short description."
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    result = chain.run({"categories": ", ".join(categories)})
    return result.split("\n")

def generate_superlatives(game_data):
    prompt = ChatPromptTemplate.from_template(
        "Based on this game data: {game_data}, assign a fun superlative to each player. Be witty and creative, like 'Wildcard Energy' or 'Trivia King'."
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    result = chain.run({"game_data": str(game_data)})
    return result.split("\n")
