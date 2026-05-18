# Florana

Florana is a plant care and flower marketplace platform built around a FastAPI backend, a React legacy web client, and a machine learning pipeline for plant disease diagnosis.

## Project Overview

Florana helps users manage plant care, identify diseases from leaf images, browse and purchase plants, and track growth over time. The current local repository includes:

- `backend/` — FastAPI backend with authentication, plant tracking, shop and payment APIs, image uploads, and TensorFlow disease prediction.
- `flora-web/` — React legacy web client for browsing plants, managing profiles, and interacting with the backend.
- `ml_pipeline/` — Dataset preparation and model training helpers for the disease prediction workflow.
- `uploads/` — Local development storage for uploaded images.

## Key Features

- User registration, login, and JWT-based authentication.
- Plant disease prediction from leaf images using a Keras model.
- Plant registration, growth tracking, and care reminders.
- Seasonal shop and checkout flows with PayPal support.
- Feedback collection and admin-aware APIs.
- Local JSON fallback storage when MongoDB is unavailable.
- ML pipeline support for dataset download, verification, and model training.

## Tech Stack

- Backend: FastAPI, Uvicorn, PyMongo, TensorFlow / Keras, Pillow, NumPy
- Frontend: React, React Router, Axios, Chart.js, PayPal React SDK
- ML Pipeline: Python scripts for dataset setup, model training, and export

## Repository Structure

```text
.
├── backend/        FastAPI API, auth, plant and shop routes, AI model runtime
├── flora-web/      React legacy web client
├── ml_pipeline/    Dataset and training workflow for disease detection
├── uploads/        Local file upload storage
├── package.json    Root node dependencies
└── README.md       Project overview and setup instructions
```

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.10+
- MongoDB (optional; backend has local JSON fallback)
- PayPal sandbox credentials (optional for checkout)

### Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python main.py
```

The backend defaults to `http://localhost:8000`.

### Frontend Setup

```powershell
cd flora-web
npm install
Copy-Item .env.example .env
npm start
```

The legacy React app runs at `http://localhost:3000` and communicates with the backend at `http://localhost:8000/api` during local development.

### ML Pipeline Setup

```powershell
cd ml_pipeline
python verify_setup.py
```

The backend uses the trained model and class map from:

```text
backend/ai/plant_disease_model.keras
backend/ai/class_names.json
```

## Environment Variables

### Backend

Copy `backend/.env.example` to `backend/.env` and configure:

- `MONGO_URL`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`
- `PAYPAL_BASE_URL`
- `FRONTEND_ORIGINS`
- `CORS_ALLOW_ALL`

### Frontend

Copy `flora-web/.env.example` to `flora-web/.env` and configure:

- `REACT_APP_API_URL`

> Do not commit `.env` files or any secret credentials.

## Running the Project

### Start backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python main.py
```

### Start legacy web client

```powershell
cd flora-web
npm start
```

## Useful Backend Endpoints

- `GET /api/health` — Health check
- `POST /api/auth/signup` — Register user
- `POST /api/auth/login` — Login user
- `POST /api/predict` — Predict disease from uploaded image
- `GET /api/plants` — List registered plants
- `POST /api/shop/products` — Add product
- `POST /api/payments/confirm` — Confirm payment
- `GET /api/feedback` — Fetch feedback

## ML Pipeline

The `ml_pipeline/` folder contains documentation and scripts for dataset download, model training, and export.

```powershell
cd ml_pipeline
python verify_setup.py
python train_model.py
```

## Notes

- This repository uses local file storage in `uploads/` for development.
- MongoDB is optional on first run; the backend can use local JSON fallback.
- The legacy web client in `flora-web/` is the current frontend available locally.

## License

No open-source license file is currently included.
