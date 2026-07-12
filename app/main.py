# main.py

# File will start FastAPI
# Register the routes
# Launch the website

# Imports
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.api import status

app = FastAPI(title="ServerPulse", version="0.1.0")

app.include_router(status.router)

# Serve CSS/JS/Image
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Serve HTML page
templates = Jinja2Templates(directory="app/templates")

@app.get("/")
def root(request: Request):
    return templates.TemplateResponse(request, "index.html")
