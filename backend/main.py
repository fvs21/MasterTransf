from fastapi import FastAPI
import uvicorn # Para correr el servidor
from app.routes import payments

app=FastAPI(title="HackMTY Banking Backend", version=1.0)

app.include_router(payments.router)
