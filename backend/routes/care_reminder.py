from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

router = APIRouter(prefix="/care_reminder", tags=["CareReminder"])

# Simulate DB with in-memory storage
CARE_REMINDERS = []

# Get all reminders
@router.get("/")
def get_reminders():
    return {"status": "success", "data": CARE_REMINDERS}

# Add a new reminder (watering, fertilizing, etc.)
@router.post("/add")
def add_reminder(task: str, time: str):
    reminder = {
        "id": len(CARE_REMINDERS) + 1,
        "task": task,
        "time": time,
        "created_at": datetime.now().isoformat(),
    }
    CARE_REMINDERS.append(reminder)
    return {"status": "success", "data": reminder}

# Delete reminder
@router.delete("/delete/{reminder_id}")
def delete_reminder(reminder_id: int):
    global CARE_REMINDERS
    CARE_REMINDERS = [r for r in CARE_REMINDERS if r["id"] != reminder_id]
    return {"status": "success", "message": "Reminder deleted"}