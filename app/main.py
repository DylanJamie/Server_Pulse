# main.py

# File will start FastAPI
# Register the routes
# Launch the website

# Imports
from fastapi import FastAPI
from app.api import status

app = FastAPI(title="ServerPulse", version="0.1.0")

app.include_router(status.router)

@app.get("/")
def root():
    return {"message": "ServerPulse is running"}
