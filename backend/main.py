# backend/main.py

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import os
import io
import json
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from datetime import datetime
from bson import ObjectId

# ----------------- Import Routers -----------------
from routes.auth import router as auth_router
from routes.plant import router as plant_router
from routes.growth import router as growth_router
from routes.shop import router as shop_router

from database import prediction_collection, plants_collection

# ----------------- Firebase Push Notifications -----------------
from apscheduler.schedulers.background import BackgroundScheduler
import firebase_admin
from firebase_admin import credentials, messaging

FIREBASE_KEY_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "firebase-key.json")

if os.path.exists(FIREBASE_KEY_PATH):
    try:
        cred = credentials.Certificate(FIREBASE_KEY_PATH)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized")
    except Exception as e:
        print("Firebase initialization failed:", e)
else:
    print("Firebase disabled: firebase-key.json not found")

# ----------------- FastAPI App Setup -----------------
app = FastAPI(title="Florana Backend")

# Static files for uploaded images
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= STARTUP EVENT =================
@app.on_event("startup")
def startup_event():
    """Print startup information."""
    from database import connection_status

    print("\n" + "=" * 60)
    print("FLORANA BACKEND STARTUP")
    print("=" * 60)
    print("Server: http://127.0.0.1:8000")
    print("Docs: http://127.0.0.1:8000/docs")
    print("Health: http://127.0.0.1:8000/health")
    print(f"Database: {connection_status}")

    if connection_status == "disconnected":
        print("\nWARNING: MongoDB is not connected!")
        print("To start MongoDB:")
        print("   Windows: net start MongoDB or mongod")
        print("   macOS: brew services start mongodb-community")
        print("   Linux: sudo systemctl start mongod")
        print("\nAuth endpoints will return 503 until MongoDB is running.")

    print("=" * 60 + "\n")


# Routers
app.include_router(auth_router)
app.include_router(plant_router)
app.include_router(growth_router)
app.include_router(shop_router)


# ================= HEALTH CHECK ENDPOINT =================
@app.get("/health")
def health_check():
    """Check backend and database health status."""
    from database import check_db_connection

    db_status = check_db_connection()

    return {
        "status": "ok" if db_status["status"] == "success" else "degraded",
        "server": "Florana Backend",
        "database": db_status,
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/")
def read_root():
    """Root endpoint."""
    from database import connection_status

    return {
        "message": "Welcome to Florana Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "database_status": connection_status,
    }


# ================= Load AI Model =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ai", "plant_disease_model.keras")
CLASS_PATH = os.path.join(BASE_DIR, "ai", "class_names.json")

try:
    model = load_model(MODEL_PATH)
    print("AI model loaded successfully")
except Exception as e:
    print("Error loading model:", e)
    model = None

try:
    with open(CLASS_PATH, "r") as f:
        class_data = json.load(f)
    if isinstance(class_data, dict):
        class_names = {v: k for k, v in class_data.items()}
    else:
        class_names = {i: name for i, name in enumerate(class_data)}
    print("Class names loaded successfully")
except Exception as e:
    print("Error loading class names:", e)
    class_names = {}


# ----------------- Helpers -----------------
def save_prediction(filename: str, prediction: str, confidence: float):
    prediction_collection.insert_one(
        {
            "image_name": filename,
            "prediction": prediction,
            "confidence": confidence,
            "date": datetime.now(),
        }
    )


def save_plant(name: str, disease: str, confidence: float):
    plants_collection.insert_one(
        {
            "plant_name": name,
            "disease": disease,
            "confidence": confidence,
            "date": datetime.now(),
            "tracking": True,
        }
    )


def predict_image(file_bytes: bytes):
    if model is None:
        raise HTTPException(status_code=500, detail="AI model not loaded")
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    prediction = model.predict(img_array)
    class_index = int(np.argmax(prediction))
    confidence = float(np.max(prediction))
    return class_names.get(class_index, "Unknown"), confidence


# ----------------- AI ROUTES -----------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Invalid image format")
    file_bytes = await file.read()
    prediction, confidence = predict_image(file_bytes)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    save_prediction(filename, prediction, confidence)
    save_plant(filename, prediction, confidence)
    return {
        "status": "success",
        "prediction": prediction,
        "confidence": confidence,
        "image_url": f"/uploads/{filename}",
    }


# ----------------- HISTORY -----------------
@app.get("/history")
def get_history():
    records = list(prediction_collection.find({}, {"_id": 0}))
    return {"status": "success", "data": records}


# ----------------- PLANTS -----------------
@app.get("/plants")
def get_all_plants():
    plants = []
    for p in plants_collection.find():
        plants.append(
            {
                "id": str(p["_id"]),
                "name": p.get("plant_name", "Unknown"),
                "info": p.get("disease", ""),
                "badges": [p.get("disease")] if p.get("disease") else [],
                "warning": True if p.get("confidence", 0) < 0.8 else False,
                "image_path": f"uploads/{p.get('plant_name')}" if p.get("plant_name") else None,
                "tracking": p.get("tracking", True),
            }
        )
    return plants


@app.delete("/plants/{plant_id}")
def delete_plant(plant_id: str):
    try:
        result = plants_collection.delete_one({"_id": ObjectId(plant_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Plant not found")
        return {"message": "Plant deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ----------------- CARE REMINDER -----------------
scheduler = BackgroundScheduler()
scheduler.start()
care_reminders = []


def send_care_notification(token: str, task: str):
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title="Plant Care Reminder",
                body=f"Time to {task} your plant!",
            ),
            token=token,
        )
        messaging.send(message)
        print(f"Notification sent. Task: {task}")
    except Exception as e:
        print("Notification error:", e)


def schedule_care(reminder: dict):
    hour, minute = map(int, reminder["time"].split(":"))
    task = reminder.get("task", "water")
    scheduler.add_job(
        send_care_notification,
        "cron",
        hour=hour,
        minute=minute,
        args=[reminder["token"], task],
        id=f"{reminder['token']}_{task}",
        replace_existing=True,
    )


@app.post("/care-reminder")
async def set_care_reminder(data: dict):
    time = data.get("time")
    token = data.get("token")
    task = data.get("task", "water")
    if not time or not token:
        raise HTTPException(status_code=400, detail="Missing time or token")
    reminder = {"time": time, "token": token, "task": task}
    care_reminders.append(reminder)
    schedule_care(reminder)
    return {"message": "Care reminder set successfully"}


# ----------------- ROOT -----------------
@app.get("/")
def root():
    return {"message": "Florana API running"}
