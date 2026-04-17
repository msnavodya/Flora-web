from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from database import products_collection
from bson import ObjectId
import os
from datetime import datetime

router = APIRouter(prefix="/shop", tags=["Shop"])

# 📁 Upload folder
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ================= GET PRODUCTS =================
@router.get("/products")
def get_products():
    if products_collection is None:
        raise HTTPException(status_code=503, detail="Database connection failed. Please start MongoDB.")
    
    products = []

    for p in products_collection.find():
        products.append({
            "id": str(p["_id"]),
            "name": p.get("name", ""),
            "price": p.get("price", 0),
            "season": p.get("season", "Spring"),
            "image": p.get("image", None),
            "stock": p.get("stock", 10)
        })

    return products


# ================= ADD PRODUCT (WITH IMAGE) =================
@router.post("/products")
async def add_product(
    name: str = Form(...),
    price: float = Form(...),
    season: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        if products_collection is None:
            raise HTTPException(status_code=503, detail="Database connection failed. Please start MongoDB.")
        
        # ✅ Save image
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(await file.read())

        # ✅ Save to DB
        result = products_collection.insert_one({
            "name": name,
            "price": price,
            "season": season,
            "image": f"uploads/{filename}",
            "stock": 10,
            "created_at": datetime.now()
        })

        return {
            "message": "Product added successfully 🌱",
            "id": str(result.inserted_id)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= DELETE PRODUCT =================
@router.delete("/products/{product_id}")
def delete_product(product_id: str):
    try:
        if products_collection is None:
            raise HTTPException(status_code=503, detail="Database connection failed. Please start MongoDB.")
        
        product = products_collection.find_one({"_id": ObjectId(product_id)})

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # ✅ Delete image file
        if product.get("image"):
            image_path = product["image"]
            if os.path.exists(image_path):
                os.remove(image_path)

        # ✅ Delete from DB
        products_collection.delete_one({"_id": ObjectId(product_id)})

        return {"message": "Product deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))