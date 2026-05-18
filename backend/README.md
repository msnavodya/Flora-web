# Florana Backend API

FastAPI backend for the Florana smart plant-care and flower marketplace platform. Handles authentication, plant management, disease prediction, shop operations, payments, and growth tracking.

## 📋 Project Overview

The Florana backend is a FastAPI-based REST API that serves the web and mobile clients. It provides:

- **Authentication** - JWT-secured user signup and login
- **Plant Management** - Register, retrieve, and manage user plants
- **Disease Prediction** - AI-powered plant disease detection from leaf images
- **Growth Tracking** - Record and retrieve plant growth history
- **Shop Operations** - Product listing, cart management, and order handling
- **Payment Processing** - PayPal payment integration
- **Care Reminders** - Scheduling and managing plant care reminders
- **Feedback** - User feedback collection and management
- **Local JSON Fallback** - Works without MongoDB during development

## 📁 Directory Structure

```text
backend/
├── main.py                      # FastAPI application entry point
├── database.py                  # MongoDB connection and utilities
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
├── .env                         # ⚠️ Local environment (create from .env.example)
├── render.yaml                  # Render.com deployment configuration
├── ai/                          # AI Model runtime
│   ├── plant_disease_model.keras   # Trained TensorFlow model
│   ├── class_names.json         # Disease classification labels
│   └── predict.py               # Prediction inference script
├── models/                      # Pydantic data models
│   ├── user.py                  # User model
│   ├── plant.py                 # Plant model
│   └── login_history.py         # Login history model
├── routes/                      # API route handlers
│   ├── auth.py                  # Authentication endpoints
│   ├── plant.py                 # Plant management endpoints
│   ├── growth.py                # Growth tracking endpoints
│   ├── shop.py                  # Shop and product endpoints
│   ├── payment.py               # Payment and order endpoints
│   └── prediction.py            # Disease prediction endpoints
├── schemas/                     # Pydantic request/response schemas
│   ├── user.py                  # User request schemas
│   └── plant.py                 # Plant request schemas
├── utils/                       # Utility modules
│   ├── jwt_auth.py              # JWT token utilities
│   ├── security.py              # Password hashing and security
│   ├── local_store.py           # Local JSON file storage
│   ├── auth_store.py            # Authentication data storage
│   └── paypal_client.py         # PayPal API integration
├── uploads/                     # User-uploaded images storage
│   └── [generated image files]
├── *.local.json                 # Local JSON storage files (generated at runtime)
│   ├── users.local.json
│   ├── plants.local.json
│   ├── predictions.local.json
│   ├── orders.local.json
│   ├── products.local.json
│   ├── growth.local.json
│   ├── login_history.local.json
│   └── feedback.local.json
└── README.md                    # This file
```

## 🔧 Prerequisites

- **Python** 3.10+
- **pip** package manager
- **MongoDB** (optional; backend uses local JSON fallback if unavailable)
- **FastAPI** 0.128.1+
- **Uvicorn** 0.40.0+
- **TensorFlow/Keras** for disease prediction

## 📦 Installation

### Step 1: Create Virtual Environment

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**On Mac/Linux:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### Step 2: Install Dependencies

```powershell
pip install -r requirements.txt
```

**Core Dependencies:**
- `fastapi==0.128.1` - Web framework
- `uvicorn==0.40.0` - ASGI server
- `pydantic==2.12.5` - Data validation
- `pymongo==4.15.4` - MongoDB client
- `tensorflow==2.20.0` - ML model inference
- `pillow==12.1.0` - Image processing
- `python-jose==3.5.0` - JWT token handling
- `passlib==1.7.4` - Password hashing

### Step 3: Configure Environment

```powershell
Copy-Item .env.example .env
```

Edit `.env` with your configuration:

```text
# Database
MONGO_URL=mongodb://localhost:27017
# If MONGO_URL is missing or unreachable, backend uses local JSON storage

# JWT Authentication
JWT_SECRET_KEY=your_long_random_secret_key_here_min_32_chars
JWT_ALGORITHM=HS256

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_SECRET=your_paypal_sandbox_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# CORS Configuration
FRONTEND_ORIGINS=http://localhost:3000,http://localhost:8081
CORS_ALLOW_ALL=true

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

## 🚀 Running the Backend

### Development Mode

```powershell
# Make sure virtual environment is activated
.\.venv\Scripts\Activate.ps1

# Start the server (auto-reloads on code changes)
python main.py
```

Or directly with Uvicorn:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Server URLs

- **API Base**: `http://localhost:8000`
- **Health Check**: `http://localhost:8000/api/health`
- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **ReDoc Documentation**: `http://localhost:8000/redoc`

## 📊 Data Storage

### MongoDB (Primary)

When MongoDB is configured and available:
- All data is persisted to MongoDB
- Set `MONGO_URL` in `.env`
- Connection attempts fail over to local JSON if MongoDB is unreachable

### Local JSON Fallback

When MongoDB is unavailable or `MONGO_URL` is not configured:
- Backend automatically uses local JSON files
- Files created in the `backend/` directory:
  - `users.local.json` - User accounts
  - `plants.local.json` - Plant registrations
  - `predictions.local.json` - Disease prediction history
  - `orders.local.json` - Shop orders
  - `products.local.json` - Shop products
  - `growth.local.json` - Plant growth records
  - `feedback.local.json` - User feedback
  - `login_history.local.json` - Login attempts

> ⚠️ **Note**: Local JSON storage is suitable for development and testing, but production deployments should use MongoDB or another persistent database.

## 🔌 API Endpoints

### Health & Status

- `GET /` - Root health check
- `GET /api` - API root
- `GET /api/health` - Detailed health check with database status

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login and JWT token generation

### Plants

- `GET /api/plants` - List all plants (legacy)
- `GET /api/plants/` - List user's registered plants
- `POST /api/plants/` - Register a new plant
- `DELETE /api/plants/{plant_id}` - Delete plant by ID
- `GET /api/plants/by-name/{name}` - Lookup plant by name

### Disease Prediction

- `POST /api/predict` - Predict disease from uploaded leaf image
- `GET /api/history` - Get prediction history

### Growth Tracking

- `POST /api/growth/` - Add growth record
- `GET /api/growth/{plant_id}` - Get growth history for plant

### Shop & Products

- `GET /api/shop/products` - List all shop products
- `POST /api/shop/products` - Add new product
- `DELETE /api/shop/products/{product_id}` - Delete product

### Payments & Orders

- `GET /api/paypal/config` - PayPal configuration
- `GET /api/paypal/status` - PayPal API status
- `POST /api/create-order` - Create PayPal order
- `POST /api/capture-order/{order_id}` - Capture PayPal payment
- `POST /api/payments/orders` - Create order record
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/orders/{order_id}` - Get order details

### Care Reminders

- `POST /api/care-reminder` - Schedule care reminder
- `GET /api/care-reminders/` - Get reminder settings
- `PUT /api/care-reminders/` - Update reminder settings

### Feedback

- `POST /api/feedback/` - Submit feedback
- `GET /api/feedback/` - Retrieve feedback
- `DELETE /api/feedback/` - Clear feedback

### Admin Routes (Protected)

- `GET /admin/summary` - Dashboard summary
- `GET /admin/users` - Manage users
- `GET /admin/plants` - Manage plants
- `GET /admin/products` - Manage products
- `GET /admin/feedback` - View all feedback
- `GET /admin/payments` - View orders/payments

## 🤖 AI Model Integration

### Disease Prediction

The backend includes a trained TensorFlow/Keras CNN model for plant disease classification.

**Supported Classes:**
- Botrytis (gray mold)
- Fresh Leaf (healthy reference)
- Leaf_Spot (fungal disease)
- Powdery_Mildew (powdery fungal)
- Rust (rust disease)

**Prediction Workflow:**
1. User uploads leaf image via `/api/predict`
2. Image is validated and preprocessed to 224x224 RGB
3. TensorFlow model performs inference
4. Confidence score is calculated
5. Low-confidence predictions return "Needs closer inspection"
6. Results saved to prediction history
7. Response sent to client with disease label and confidence

**Model Files:**
- `backend/ai/plant_disease_model.keras` - Trained model artifact
- `backend/ai/class_names.json` - Disease class labels

### Training New Models

To train and update the disease prediction model:

1. Use the [ml_pipeline](../ml_pipeline/) workflow
2. Download training images and organize by class
3. Run `train_model.py` to train
4. Copy the generated model to `backend/ai/`

For details, see [ml_pipeline/README.md](../ml_pipeline/README.md)

## 🔐 Security

### JWT Authentication

- User passwords are hashed with Passlib (bcrypt)
- JWT tokens are issued on successful login
- Protected endpoints require valid JWT in `Authorization: Bearer <token>` header
- Token expiration handled per route configuration

### CORS Configuration

- `CORS_ALLOW_ALL=true` enables all origins (development only)
- For production, set specific origins in `FRONTEND_ORIGINS`

### Environment Secrets

Never commit `.env` files or real credentials to Git. Use:
- `.env.example` for configuration template
- Platform secrets (GitHub Secrets, Render Environment, etc.) for production

## 📤 File Uploads

### Image Upload Handling

- Uploaded leaf images for disease prediction are saved to `backend/uploads/`
- Files are served via `/uploads/<filename>` during development
- Image size is validated (typically max 5MB)
- Supported formats: JPEG, PNG, GIF, BMP

### Upload Limits

Configure in `main.py`:
```python
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
```

## 🧪 Testing

### Run Pytest Suite

```powershell
# From backend directory
pytest tests/ -v

# Or from project root
npm run backend:test
```

### Test Coverage

The backend includes comprehensive pytest tests for:
- Authentication flows
- Plant CRUD operations
- Disease prediction inference
- Payment processing
- Local JSON storage fallback

## 📝 Logging

The backend logs important events including:
- Startup status and configuration
- Database connection attempts
- Failed authentication
- Prediction requests and results
- Payment operations
- Error details and stack traces

Logs output to console during development. For production, configure file-based logging.

## 🔧 Troubleshooting

### Issue: "MongoDB connection failed"
**Solution:** 
- Ensure MongoDB is running: `Get-Service MongoDB`
- Or set `MONGO_URL=""` to use local JSON storage

### Issue: "Port 8000 already in use"
**Solution:**
- Find process: `netstat -ano | findstr :8000`
- Kill process: `taskkill /PID <PID> /F`
- Or change port in `.env`

### Issue: "TensorFlow model not loading"
**Solution:**
- Verify `plant_disease_model.keras` exists in `ai/`
- Check file is not corrupted
- Reinstall TensorFlow: `pip install --upgrade tensorflow`

### Issue: "PayPal API errors"
**Solution:**
- Verify credentials in `.env`
- Check PayPal sandbox account has funds
- Test with `GET /api/paypal/status`

## 🚢 Deployment

### Render.com

Configuration included in `render.yaml`:

```bash
git push  # Automatic deployment
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t florana-backend .
docker run -p 8000:8000 florana-backend
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Uvicorn Documentation](https://www.uvicorn.org/)
- [MongoDB Python Driver](https://pymongo.readthedocs.io/)
- [TensorFlow Serving](https://www.tensorflow.org/serving)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)

## 🤝 Support

For backend-related issues:
1. Check the troubleshooting section above
2. Review logs for error messages
3. Verify environment variables in `.env`
4. Test endpoints using Swagger UI at `http://localhost:8000/docs`

## 📄 License

Part of the Florana project. For project licensing, see root [LICENSE](../LICENSE) or [README.md](../README.md).
