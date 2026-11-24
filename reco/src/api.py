"""Recommendation API (see CONTRACT.md, section 5)."""
from fastapi import FastAPI

app = FastAPI(title="Flowshopper recommendations")


@app.get("/health")
def health():
    return {"status": "ok"}
