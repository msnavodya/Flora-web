from fastapi import APIRouter, UploadFile, File, HTTPException
from ai.predict import predict_image

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    print("Received prediction request for file:", file.filename)  # Debug: log request
    try:
        if not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
            raise HTTPException(status_code=400, detail="Invalid image format")

        contents = await file.read()
        # prediction helper returns dict with 'disease' and 'confidence'
        result = predict_image(contents)

        return {
            "prediction": result.get("disease", "Unknown"),
            "confidence": round(result.get("confidence", 0) * 100, 2)
        }

    except Exception as e:
        print("Prediction error:", e)  # Debug: log error
        raise HTTPException(status_code=500, detail=str(e))
