# routes/plant.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import os
import shutil
from database import plants_collection, growth_collection
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ================= CREATE PLANT =================
@router.post("/plants/")
async def create_plant(
    name: str = Form(...),
    species: Optional[str] = Form(None),
    flowerId: Optional[str] = Form(None),
    flowerCatalog: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    specificLocation: Optional[str] = Form(None),
    climate: Optional[str] = Form(None),
    sunlight: Optional[str] = Form(None),
    soilType: Optional[str] = Form(None),
    wateringFrequency: Optional[str] = Form(None),
    fertilizerSchedule: Optional[str] = Form(None),
    lastWatered: Optional[str] = Form(None),
    initialSize: Optional[str] = Form(None),
    tracking: Optional[str] = Form("true"),
    image: UploadFile = File(None)
):
    try:
        image_path = None
        if image:
            file_path = os.path.join(UPLOAD_DIR, image.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            image_path = file_path

        plant = {
            "name": name,
            "species": species,
            "flowerId": flowerId,
            "flowerCatalog": flowerCatalog,
            "location": location,
            "specificLocation": specificLocation,
            "climate": climate,
            "sunlight": sunlight,
            "soilType": soilType,
            "wateringFrequency": wateringFrequency,
            "fertilizerSchedule": fertilizerSchedule,
            "lastWatered": lastWatered,
            "initialSize": initialSize,
            "tracking": tracking.lower() == "true",
            "image_path": image_path,
            "created_at": datetime.now()
        }

        result = plants_collection.insert_one(plant)
        plant["_id"] = str(result.inserted_id)
        return plant

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= GET ALL PLANTS =================
@router.get("/plants/")
def get_all_plants():
    plants = list(plants_collection.find({}))
    for p in plants:
        p["_id"] = str(p["_id"])
    return plants


# ================= GET BY NAME =================
@router.get("/plants/by-name/{name}")
def get_plant_by_name(name: str):
    plant = plants_collection.find_one({"name": name})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    plant["_id"] = str(plant["_id"])
    return plant


# ================= END =================