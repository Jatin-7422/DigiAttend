from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.attendance import router as attendance_router

app = FastAPI(
    title="DigiAttend API",
    description="Backend API services for the DigiAttend Web Application",
    version="1.0.0"
)

# CORS MIDDLEWARE SETUP
# allow_origins=["*"] completely resolves any localhost:5173 cross-origin blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REGISTER ROUTERS
app.include_router(attendance_router)

# ROOT ENDPOINT
@app.get("/")
def home():
    return {
        "status": "online",
        "message": "DigiAttend Backend Running Successfully"
    }