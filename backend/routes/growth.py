from fastapi import APIRouter, Form, UploadFile, File, HTTPException
from database import growth_collection
from datetime import datetime
import os, shutil

router = APIRouter(prefix="/growth", tags=["Growth"])

# Folder to save uploaded images
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def add_growth(
    plant_id: str = Form(...),
    height: str = Form(...),
    health: str = Form(...),
    notes: str = Form(None),
    image: UploadFile = File(None)
):
    """
    Add a new growth record for a plant.
    Supports optional image upload.
    """
    try:
        image_path = None

        if image:
            # Ensure unique file names using timestamp
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"{timestamp}_{image.filename}"
            file_path = os.path.join(UPLOAD_DIR, filename)

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

            image_path = file_path

        record = {
            "plant_id": plant_id,
            "height": height,
            "health": health,
            "notes": notes,
            "image_path": image_path,
            "date": datetime.now()
        }

        result = growth_collection.insert_one(record)
        record["_id"] = str(result.inserted_id)

        return {"status": "success", "data": record}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{plant_id}")
def get_growth(plant_id: str):
    """
    Get all growth records for a specific plant.
    """
    try:
        records = list(growth_collection.find({"plant_id": plant_id}))
        for r in records:
            r["_id"] = str(r["_id"])
        return {"status": "success", "data": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))