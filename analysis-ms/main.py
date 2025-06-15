from fastapi import FastAPI
from routes import analytics

app = FastAPI(title="Aleph Analysis Service")

app.include_router(analytics.router, prefix="/api/v1/analytics")
