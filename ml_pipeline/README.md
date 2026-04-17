# 🌤️ CloudinaryML Pipeline - Complete Image Classification Workflow

A complete Python pipeline for downloading images from Cloudinary and training a TensorFlow CNN model for image classification.

## 📋 Project Overview

This pipeline provides an end-to-end solution for:
- ✅ **Download**: Fetch images from Cloudinary with pagination support (handles 500+ images)
- ✅ **Organize**: Automatically structure dataset for the ML model
- ✅ **Train**: Build and train a CNN model using TensorFlow
- ✅ **Evaluate**: Monitor accuracy and loss with visualizations
- ✅ **Save**: Export trained model as `model.h5` for production use

## 📁 File Structure

```
ml_pipeline/
├── requirements.txt          # Python dependencies
├── config_template.py        # Configuration template (rename to config.py)
├── config.py                 # ⚠️ Your actual credentials (create from template)
├── download_dataset.py       # Step 1: Download images from Cloudinary
├── train_model.py            # Step 2: Train the CNN model
├── dataset/                  # Created after download (do not commit)
│   ├── class1/              # Organize images by class
│   ├── class2/
│   └── class3/
├── model.h5                  # Final trained model (created after training)
├── best_model.h5            # Best checkpoint during training
└── training_history.png     # Training accuracy/loss plot
```

## 🔧 Prerequisites

- **Python**: 3.8+ (recommended: 3.10+)
- **Cloudinary Account**: With API credentials (cloud_name, api_key, api_secret)
- **Disk Space**: At least 2GB for downloading images
- **Internet**: For Cloudinary API calls

## 📦 Installation Steps

### Step 1: Create Virtual Environment (Recommended)

```powershell
# Navigate to ml_pipeline folder
cd c:\Users\SADINI\Desktop\Florana\ml_pipeline

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1
```

**On Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```powershell
pip install -r requirements.txt
```

**Installation Details:**
- `cloudinary==1.35.0` - Cloudinary API client
- `python-dotenv==1.0.0` - Environment variable management
- `tensorflow==2.14.0` - Deep learning framework
- `numpy==1.24.3` - Numerical computing
- `opencv-python==4.8.0.74` - Image processing
- `pillow==10.0.0` - Image library
- `matplotlib==3.7.2` - Data visualization
- `requests==2.31.0` - HTTP library

This will take 5-10 minutes depending on your internet speed. Go grab a coffee! ☕

## ⚙️ Configuration Setup

### Step 1: Get Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings → API Keys
3. Copy your:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

### Step 2: Create Configuration File

```powershell
# Copy template to actual config file
Copy-Item config_template.py config.py
```

### Step 3: Edit config.py

Open `config.py` in VS Code and fill in:

```python
CLOUDINARY_CONFIG = {
    "cloud_name": "your_actual_cloud_name",      # e.g., "djf5o9q2k"
    "api_key": "your_actual_api_key",            # e.g., "123456789"
    "api_secret": "your_actual_api_secret"       # e.g., "abc_def_xyz"
}

DATASET_CONFIG = {
    "folder_path": "your/cloudinary/folder",     # e.g., "florana/plants"
    "local_dataset_dir": "./dataset",            # Where to save images
    "training_split": 0.8,                       # 80% train, 20% validation
    "image_size": (224, 224),                    # Model input size
    "batch_size": 32                             # Images per batch
}

MODEL_CONFIG = {
    "epochs": 15,                                # Number of training epochs
    "learning_rate": 0.001,                      # Optimizer learning rate
    "model_save_path": "./model.h5",             # Save location
    "log_dir": "./logs"
}
```

⚠️ **IMPORTANT**: Do NOT commit `config.py` to Git! Add it to `.gitignore`:

```
echo config.py >> .gitignore
```

## 🚀 Execution Guide

### Step 1: Download Images from Cloudinary

```powershell
# Make sure virtual environment is activated
python download_dataset.py
```

**What happens:**
1. ✅ Validates Cloudinary credentials
2. 🔍 Searches for all images in your folder
3. 📥 Downloads images with progress tracking
4. 📁 Creates placeholder class folders (class1, class2, class3)
5. ⏭️ Skips duplicate downloads automatically

**Expected Output:**
```
============================================================
🌤️  Cloudinary Image Downloader
============================================================

✅ Cloudinary configured successfully

✅ Dataset folder ready: c:\Users\SADINI\Desktop\Florana\ml_pipeline\dataset

🔍 Searching for images in Cloudinary folder: 'florana/plants'...
   📄 Fetching page 1...
   ✅ Found 245 images on page 1
   📄 Fetching page 2...
   ✅ Found 200 images on page 2

✅ Total images found: 445

📥 Downloading 445 images...

[1/445] florana/plants/rose-red-001
        ✅ Downloaded
[2/445] florana/plants/rose-pink-002
        ✅ Downloaded
...

============================================================
📊 Download Summary:
   ✅ Successful: 443
   ⏭️  Skipped:     2
   ❌ Failed:      0
============================================================
```

### Step 2: Organize Images by Class (Manual)

After downloading, organize images into class folders:

```
dataset/
├── class1/          # e.g., "Healthy Plants"
│   ├── image1.jpg
│   ├── image2.png
│   └── ...
├── class2/          # e.g., "Diseased Plants"
│   ├── image1.jpg
│   └── ...
└── class3/          # e.g., "Wilted Plants"
    └── image1.jpg
```

💡 **Tips:**
- Use image browsers to quickly sort and move files
- Minimum 50 images per class for good results
- More data = better model accuracy

### Step 3: Train the Model

```powershell
python train_model.py
```

**What happens:**
1. 🔍 Validates dataset structure
2. 🏗️ Builds CNN architecture (4 convolutional blocks + fully connected layers)
3. 📊 Creates data generators with augmentation
4. 🚀 Trains the model for 15 epochs
5. 📈 Monitors accuracy and loss in real-time
6. 💾 Saves best checkpoint as `best_model.h5`
7. 💾 Saves final model as `model.h5`
8. 📉 Generates training history plot

**Expected Output:**
```
============================================================
🤖 TensorFlow CNN Image Classifier
============================================================

🔍 Validating dataset structure...
   📂 class1: 150 images
   📂 class2: 145 images
   📂 class3: 148 images

✅ Dataset validated!
   Total Classes: 3
   Total Images: 443

🏗️  Building CNN Model...
Model: "sequential"
_________________________________________________________________
 Layer (type)                Output Shape              Param #
=================================================================
 conv2d (Conv2D)             (None, 224, 224, 32)     896
 conv2d_1 (Conv2D)           (None, 224, 224, 32)     9248
 max_pooling2d (MaxPooling2  (None, 112, 112, 32)     0
 dropout (Dropout)           (None, 112, 112, 32)     0
 ...
=================================================================
Total params: 3,869,443
Trainable params: 3,869,443
Non-trainable params: 0
_________________________________________________________________

📊 Creating Data Generators...
✅ Data generators created
   Batch Size: 32

📈 Training Configuration:
   Training Samples: 354
   Validation Samples: 89
   Steps per Epoch: 12
   Validation Steps: 3

🚀 Starting Model Training...

Epoch 1/15
12/12 [==============================] - 45s 4s/step - loss: 1.0982 - accuracy: 0.6213 - val_loss: 0.8523 - val_accuracy: 0.7191
Epoch 2/15
12/12 [==============================] - 42s 3s/step - loss: 0.7854 - accuracy: 0.7341 - val_loss: 0.6234 - val_accuracy: 0.7966
...
Epoch 15/15
12/12 [==============================] - 38s 3s/step - loss: 0.2134 - accuracy: 0.9281 - val_loss: 0.3456 - val_accuracy: 0.8989

✅ Model saved successfully: c:\Users\SADINI\Desktop\Florana\ml_pipeline\model.h5

✅ Training history plot saved: training_history.png

============================================================
✅ Training Complete!
============================================================

📊 Final Results:
   Training Accuracy:   0.9281
   Validation Accuracy: 0.8989
   Training Loss:       0.2134
   Validation Loss:     0.3456
```

## 📊 Monitoring Training Progress

During training, watch these metrics:

- **Accuracy**: Should increase gradually (0.0 to 1.0)
- **Loss**: Should decrease gradually
- **Val_Accuracy**: Validation accuracy (if it plateaus, training may be complete)
- **Early Stopping**: Stops if validation loss doesn't improve for 5 epochs

## 🔍 Troubleshooting

### Issue: "config.py not found!"
**Solution:**
```powershell
Copy-Item config_template.py config.py
# Then edit config.py with your credentials
```

### Issue: "Cloudinary API Error"
**Solutions:**
1. Check credentials in `config.py` are correct
2. Verify API key has proper permissions
3. Check internet connection
4. Ensure folder path is correct (or leave empty for root)

### Issue: "No images found in dataset"
**Solutions:**
1. Check images were downloaded: `ls dataset/`
2. Verify images are in class subfolders, not root
3. Check supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`

### Issue: "Out of Memory" during training
**Solutions:**
1. Reduce `batch_size` in config.py (e.g., 16 or 8)
2. Reduce `image_size` (e.g., 128x128 instead of 224x224)
3. Close other applications

### Issue: "Model not improving"
**Solutions:**
1. Increase `epochs` in config.py
2. Collect more training data (minimum 50-100 per class)
3. Increase `learning_rate` slightly (e.g., 0.01)
4. Try different image augmentation settings

## 📈 Understanding the Model

### Architecture (4-Block CNN):

```
Input (224x224x3)
    ↓
[Conv32 + Conv32 + MaxPool + Dropout]  ← Block 1
    ↓
[Conv64 + Conv64 + MaxPool + Dropout]  ← Block 2
    ↓
[Conv128 + Conv128 + MaxPool + Dropout] ← Block 3
    ↓
[Conv256 + Conv256 + MaxPool + Dropout] ← Block 4
    ↓
Flatten (256 feature maps)
    ↓
Dense(512) + Dropout
    ↓
Dense(256) + Dropout
    ↓
Dense(num_classes) + Softmax  ← Output
```

### Model Hyperparameters:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Optimizer | Adam | Adaptive learning rate |
| Loss | Categorical Crossentropy | Multi-class classification |
| Image Size | 224x224 | Standard CNN input |
| Batch Size | 32 | Balance between speed and memory |
| Epochs | 15 | Training iterations (auto-stops if no improvement) |
| Dropout | 0.25-0.5 | Prevent overfitting |
| Learning Rate | 0.001 | Step size for weight updates |

## 🎯 Output Files

After successful execution:

| File | Purpose |
|------|---------|
| `model.h5` | Final trained model (for production) |
| `best_model.h5` | Best checkpoint (if better than final) |
| `training_history.png` | Accuracy/loss plots |
| `dataset/` | Downloaded images organized by class |

## 💾 Using the Model in Production

```python
from tensorflow.keras.models import load_model
import cv2
import numpy as np

# Load the trained model
model = load_model('model.h5')

# Load and preprocess image
image = cv2.imread('test_image.jpg')
image = cv2.resize(image, (224, 224))
image = image / 255.0  # Normalize
image = np.expand_dims(image, 0)  # Add batch dimension

# Make prediction
predictions = model.predict(image)
class_index = np.argmax(predictions[0])
confidence = predictions[0][class_index]

print(f"Predicted Class: {class_index}")
print(f"Confidence: {confidence:.2%}")
```

## 📚 Additional Resources

- [TensorFlow Documentation](https://www.tensorflow.org/api_docs)
- [Cloudinary API Docs](https://cloudinary.com/documentation/admin_api)
- [CNN Image Classification Guide](https://www.tensorflow.org/tutorials/images/classification)
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)

## ✅ Checklist

Before starting:

- [ ] Python 3.8+ installed
- [ ] Cloudinary account with API credentials
- [ ] Virtual environment created
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `config.py` created and filled with credentials
- [ ] At least 100+ images in Cloudinary folder
- [ ] 2GB+ disk space available

## 🎓 Learning Path

1. **Understand**: Read model architecture in comments
2. **Download**: Run `download_dataset.py` and organize images
3. **Train**: Run `train_model.py` and observe metrics
4. **Analyze**: Check `training_history.png` for insights
5. **Deploy**: Use `model.h5` in your application
6. **Iterate**: Improve by adding more data or tuning parameters

## 🤝 Support

For issues:
1. Check Troubleshooting section above
2. Review configuration in `config.py`
3. Check console output for error messages
4. Verify file permissions and disk space

Happy training! 🚀
