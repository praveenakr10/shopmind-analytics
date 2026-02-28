"""
ShopMind4 - Shopper Behavior Intelligence Platform
FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import segments, affinity, sentiment, predictions, strategy, metadata

app = FastAPI(
    title="ShopMind Behavior Intelligence API",
    description="Production-ready shopper behavior analytics platform",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──────────────────────────────────────────────────────────
app.include_router(segments.router)
app.include_router(affinity.router)
app.include_router(sentiment.router)
app.include_router(predictions.router)
app.include_router(strategy.router)
app.include_router(metadata.router)

# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "3.0.0",
        "modules": ["segments", "affinity", "sentiment", "predictions", "strategy"],
    }

@app.get("/")
def root():
    return {"message": "ShopMind Behavior Intelligence API v3.0", "docs": "/docs"}
