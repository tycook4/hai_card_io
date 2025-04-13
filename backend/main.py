from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from langchain_utils import generate_game_cards, generate_superlatives

app = FastAPI()

# Allow frontend on localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate-cards")
async def generate_cards(request: Request):
    data = await request.json()
    categories = data.get("categories", [])
    cards = generate_game_cards(categories)
    return {"cards": cards}

@app.post("/api/generate-superlatives")
async def generate_supes(request: Request):
    data = await request.json()
    game_data = data.get("gameData", [])
    superlatives = generate_superlatives(game_data)
    return {"superlatives": superlatives}

