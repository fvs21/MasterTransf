from fastapi import FastAPI, WebSocket
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.routes import payments, token, auth, users, protected
from app.core.database import init_db
import uvicorn
from app.core.connections import ConnectionManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    app.state.manager = ConnectionManager()
    yield

app = FastAPI(title="HackMTY Banking Backend", version=1.0, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(payments.router)
app.include_router(token.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(protected.router)

@app.get("/")
def ping():
    return {"success": True}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)