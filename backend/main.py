from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import re

from websocket_manager import ws_manager

app = FastAPI()

# Function to dynamically allow 192.168.*.* IPs
def allow_origin(origin: str) -> bool:
    return re.match(r"http://192\.168\.\d+\.\d+:3000$", origin) is not None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Static origins
    allow_origin_regex=r"http://192\.168\.\d+\.\d+:3000",  # Allow any 192.168.x.x:3000
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.websocket("/ws/playlists")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect("playlists", websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect("playlists", websocket)
        print("WebSocket disconnected")

@app.websocket("/ws/uploaders")
async def websocket_uploader_endpoint(websocket: WebSocket):
    await ws_manager.connect("uploaders", websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect("uploaders", websocket)
        print("WebSocket disconnected")


@app.get("/api")
def read_root():
    return {"message": "Welcome to the API"}


from api import api_router
app.include_router(api_router, prefix="/api")

from fastapi.staticfiles import StaticFiles

app.mount("/metadata", StaticFiles(directory="metadata"), name="metadata")