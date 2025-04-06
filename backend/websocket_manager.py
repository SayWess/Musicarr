from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, group: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(group, []).append(websocket)

    def disconnect(self, group: str, websocket: WebSocket):
        self.active_connections[group].remove(websocket)

    async def send_message(self, group: str, message: str):
        print(f"Sending message to group {group}: {message}")
        for connection in self.active_connections.get(group, []):
            print(f"Sending message to connection {connection}: {message}")
            await connection.send_json(message)

    async def broadcast(self, message: str):
        for group in self.active_connections:
            for connection in self.active_connections[group]:
                await connection.send_json(message)

# Create a singleton instance
ws_manager = ConnectionManager()
