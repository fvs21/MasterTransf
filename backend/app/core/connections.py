from fastapi import WebSocket, Depends, Request
from typing import Set, Dict

class ConnectionManager:
    def __init__(self) -> None:
        self._channels: Dict[str, Set[WebSocket]] = {}

    async def connect(self, channel: str, websocket: WebSocket):
        await websocket.accept()

        if channel not in self._channels:
            self._channels[channel] = set()
        self._channels[channel].add(websocket)

    def disconnect(self, channel: str, websocket: WebSocket):
        conns = self._channels.get(channel)
        
        if not conns:
            return
        
        conns.discard(websocket)
        if not conns:
            del self._channels[channel]

    async def broadcast(self, channel: str, message: str):
        conns = self._channels.get(channel)
        
        if not conns:
            return
        
        for conn in conns:
            try:
                await conn.send_text(message)
            except Exception:
                self.disconnect(channel, conn)

manager = ConnectionManager()

async def notify_channel(channel: str, message: str):
    await manager.broadcast(channel, message)