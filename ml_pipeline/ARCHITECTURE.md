# 🏗️ ML Pipeline Architecture & Workflow

## Pipeline Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLOUDINARY ML PIPELINE FLOW                      │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: ENVIRONMENT SETUP
════════════════════════════════════════════════════════════════════════
┌─────────────────────┐
│ Python 3.8+         │
│ Virtual Environment │
│ pip install -r req  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ All Dependencies Installed              │
│ • tensorflow 2.14.0                     │
│ • cloudinary 1.35.0                    │
│ • numpy, opencv, requests, etc.        │
└──────────┬──────────────────────────────┘
           │


STEP 2: CONFIGURATION
════════════════════════════════════════════════════════════════════════
┌─────────────────────────────────────────┐
│ config.py (from config_template.py)     │
│ • cloud_name                            │
│ • api_key                               │
│ • api_secret                            │
│ • folder_path (Cloudinary folder)      │
│ • image_size: 224x224                  │
│ • batch_size: 32                       │
│ • epochs: 15                           │
└──────────┬──────────────────────────────┘
           │


STEP 3: DOWNLOAD IMAGES
════════════════════════════════════════════════════════════════════════
┌─────────────────────────────────────────┐
│   Cloudinary                            │
│   ☁️ florana/plants/                    │
│   └─ 500+ images                        │
└──────────┬──────────────────────────────┘
           │
           ▼ (download_dataset.py)
┌─────────────────────────────────────────┐
│ Pagination Handling                     │
│ • Request page 1 (500 images)           │
│ • Request page 2 (500 images)           │
│ • Request page N (remaining)            │
│ • Total: 1000+ images                   │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Download to Local Storage               │
│ • Validate each image                   │
│ • Skip corrupted/duplicates             │
│ • Save with proper extensions           │
│ ✅ 445 successful                       │
│ ⏭️ 2 skipped (duplicates)               │
│ ❌ 0 failed                             │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Output: dataset/ Folder Created         │
│ dataset/                                │
│ ├── class1/                             │
│ ├── class2/                             │
│ └── class3/                             │
└──────────┬──────────────────────────────┘
           │


STEP 4: ORGANIZE IMAGES (MANUAL)
════════════════════════════════════════════════════════════════════════
           User organizes files:
           
           dataset/
           ├── class1/                      (150 healthy plants)
           │   ├── plant_001.jpg
           │   ├── plant_002.jpg
           │   └── ... × 150
           │
           ├── class2/                      (145 diseased plants)
           │   ├── plant_151.jpg
           │   └── ... × 145
           │
           └── class3/                      (148 wilted plants)
               ├── plant_296.jpg
               └── ... × 148
           
           Total: 443 images organized


STEP 5: TRAIN MODEL
════════════════════════════════════════════════════════════════════════
┌─────────────────────────────────────────┐
│ train_model.py                          │
│ • Load images from dataset/             │
│ • Validate dataset structure            │
│ • Count classes: 3                      │
│ • Count images: 443                     │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Create Data Generators                  │
│ • Training: 354 images (80%)            │
│ • Validation: 89 images (20%)           │
│ • Augmentation:                         │
│   - Rotation ±20°                       │
│   - Zoom ±20%                           │
│   - Shift ±20%                          │
│   - Horizontal flip                     │
│ • Batch size: 32                        │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Build CNN Architecture                  │
│                                         │
│ Input(224×224×3)                        │
│    ↓                                    │
│ [Conv32→Conv32→MaxPool→Dropout]         │
│    ↓                                    │
│ [Conv64→Conv64→MaxPool→Dropout]         │
│    ↓                                    │
│ [Conv128→Conv128→MaxPool→Dropout]       │
│    ↓                                    │
│ [Conv256→Conv256→MaxPool→Dropout]       │
│    ↓                                    │
│ Flatten → Dense(512) → Dense(256) →     │
│    ↓                                    │
│ Dense(3) + Softmax [Output]             │
│                                         │
│ Total trainable params: 3,869,443       │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Training Loop (15 Epochs)               │
│                                         │
│ For each epoch:                         │
│ • Process 12 batches (354÷32)           │
│ • Forward pass                          │
│ • Calculate loss (categorical CE)       │
│ • Backpropagation                       │
│ • Update weights (Adam optimizer)       │
│ • Validation on 89 images               │
│                                         │
│ Epoch 1: acc=0.621, val_acc=0.719       │
│ Epoch 2: acc=0.734, val_acc=0.797       │
│ ...                                     │
│ Epoch 15: acc=0.928, val_acc=0.899      │
│                                         │
│ Early stopping: No improvement >5 epochs│
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Save Models                             │
│                                         │
│ • model.h5 - Final trained model        │
│ • best_model.h5 - Best checkpoint       │
│ • training_history.png - Plots          │
│   - Accuracy over epochs                │
│   - Loss over epochs                    │
└──────────┬──────────────────────────────┘
           │


STEP 6: RESULTS & DEPLOYMENT
════════════════════════════════════════════════════════════════════════
┌─────────────────────────────────────────┐
│ Output Files                            │
│                                         │
│ model.h5 (ready for production)         │
│ best_model.h5 (best checkpoint)         │
│ training_history.png (visualizations)   │
│                                         │
│ Final Metrics:                          │
│ • Training Accuracy: 92.81%             │
│ • Validation Accuracy: 89.89%           │
│ • Training Loss: 0.2134                 │
│ • Validation Loss: 0.3456               │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Use Model in Production                 │
│                                         │
│ from tensorflow.keras.models import     │
│   load_model                            │
│                                         │
│ model = load_model('model.h5')          │
│ prediction = model.predict(image)       │
│ class_idx = np.argmax(prediction)       │
│ confidence = prediction[class_idx]      │
│                                         │
│ Output: Class 0, Confidence: 94.2%     │
└─────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════


## Data Flow Architecture

```
               CLOUDINARY API
                    │
                    │ fetch_resources()
                    ▼
        ┌───────────────────────┐
        │ Resource List         │
        │ • public_id           │
        │ • secure_url          │
        │ • format (.jpg)       │
        │ • size                │
        └───────────┬───────────┘
                    │
                    │ download_image()
                    ▼
        ┌───────────────────────┐
        │ Local Storage         │
        │ dataset/              │
        │ ├── class1/           │
        │ ├── class2/           │
        │ └── class3/           │
        └───────────┬───────────┘
                    │
                    │ flow_from_directory()
                    ▼
        ┌───────────────────────┐
        │ ImageDataGenerator    │
        │ • Rescale 1/255       │
        │ • Augmentation        │
        │ • Batching (32)       │
        │ • Shuffling           │
        └───────────┬───────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
     ┌─────────┐         ┌──────────┐
     │Training │         │Validation│
     │(80%)    │         │(20%)     │
     │354 imgs │         │89 imgs   │
     └────┬────┘         └────┬─────┘
          │                   │
          └──────────┬────────┘
                     ▼
         ┌──────────────────────┐
         │  CNN Model           │
         │  3,869,443 params    │
         │                      │
         │  train step:         │
         │  • Forward pass      │
         │  • Loss calculation  │
         │  • Backprop          │
         │  • Weight update     │
         │                      │
         │  val step:           │
         │  • Forward pass      │
         │  • Metrics calc      │
         └────────┬─────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │ Output: model.h5            │
    │ • Weights (trained)         │
    │ • Architecture              │
    │ • Layer parameters          │
    │ Ready for inference!        │
    └─────────────────────────────┘
```


═══════════════════════════════════════════════════════════════════════════


## Error Handling Pipeline

```
                       ┌─ API Failures
                       │  • Network timeout
                       │  • Invalid credentials
                       │  • Rate limiting
                       │  → Report & Exit
                       │
    DOWNLOAD    ───────┼─ Image Failures
    DATASET     │       │  • Corrupted download
                       │  • Invalid format
                       │  • Size mismatch
                       │  → Skip & Continue
                       │
                       └─ Disk Issues
                          • No space
                          • Write permission
                          → Report & Exit


                       ┌─ Empty Folders
                       │  • No images found
                       │  • Wrong folder path
                       │  → User guidance
                       │
    TRAIN       ───────┼─ Image Issues
    MODEL       │       │  • Corrupted files
                       │  • Invalid formats
                       │  → Auto skip
                       │
                       └─ Memory Issues
                          • Out of RAM
                          • Batch too large
                          → Reduce batch_size
```


═══════════════════════════════════════════════════════════════════════════


## Performance Optimization

```
Image Processing Pipeline:
───────────────────────────

Original Image (4MB)
    ↓
[Resize to 224×224] (20KB)
    ↓
[Normalize to [0,1]] (20KB)
    ↓
[Batch 32 images] (640KB)
    ↓
[GPU Processing]
    ↓
[Output: logits]


Memory Usage by Component:
──────────────────────────

Model Weights:     ~14.5 MB
Batch (32 images): ~6.4 MB
Optimizer States:  ~30 MB
Loss/Metrics:      <1 MB
────────────────────────────
Total:            ~51 MB (CPU)
GPU:              ~100-200 MB


Speed Optimization:
───────────────────

• Prefetch on CPU while GPU processes
• Parallel image loading (4 workers)
• Data augmentation on CPU
• Mixed precision training (optional)

Estimated Times:
• 1 epoch: 45-60 seconds (CPU)
• 1 epoch: 20-30 seconds (GPU)
• 15 epochs: 11-15 minutes (CPU)
• 15 epochs: 5-7 minutes (GPU)
```
