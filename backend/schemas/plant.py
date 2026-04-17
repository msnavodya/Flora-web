from pydantic import BaseModel
from typing import Optional

# ✅ CREATE schema (for adding plants)
class PlantCreate(BaseModel):
    name: str
    species: Optional[str] = None
    sunlight: str = "Partial Sun"
    tracking: bool = True
    image_path: Optional[str] = None


# ✅ READ schema (for returning to frontend)
class PlantRead(BaseModel):
    id: str   # 🔥 FIXED (MongoDB ObjectId → string)
    name: str
    species: Optional[str] = None
    sunlight: str = "Partial Sun"
    tracking: bool = True
    image_path: Optional[str] = None

    # Optional extra fields (used in your UI)
    info: Optional[str] = None
    badges: Optional[list] = []
    warning: Optional[bool] = False

    class Config:
        orm_mode = True