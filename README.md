# Florana

Smart plant care, AI-assisted disease prediction, growth tracking, reminders, shopping, and admin support in one connected platform.

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React%20Router-DOM-CA4245?style=flat&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TensorFlow / Keras](https://img.shields.io/badge/TensorFlow%20%2F%20Keras-AI%20Model-FF6F00?style=flat&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Status](https://img.shields.io/badge/Status-Academic%20Complete-65A30D?style=flat)](#)

## Overview

Florana is a full-stack plant-care project built around three connected parts:

- `backend/` - FastAPI API for authentication, plant data, growth tracking, shopping, payments, uploads, and AI inference
- `flora-web/` - React web client for user-facing plant-care and marketplace flows
- `ml_pipeline/` - TensorFlow dataset download, verification, and training utilities

The platform currently supports:

- user signup and login
- plant registration and profile tracking
- disease prediction from uploaded leaf images
- growth history logging
- care reminder scheduling
- seasonal flower browsing and shopping cart flows
- PayPal-backed order handling
- multilingual UI support

## Repository Status

- Primary branch: `main`
- Frontend app: `flora-web/`
- Backend app: `backend/`
- Default frontend URL: `http://localhost:3000`
- Default backend URL: `http://localhost:8000`
- API prefix: `/api`
- Storage mode: MongoDB when configured, with local JSON fallback in development

## Tech Stack

### Frontend

- React 19
- React Router DOM
- Axios
- Chart.js
- Framer Motion
- Lucide React
- React Icons
- React Phone Input 2
- PayPal React SDK
- Stripe JS

### Backend

- FastAPI
- Uvicorn
- PyMongo
- Pydantic
- python-jose
- Passlib
- TensorFlow / Keras
- Pillow
- NumPy
- APScheduler

### ML Pipeline

- Python
- TensorFlow
- OpenCV
- Pillow
- Requests
- Cloudinary SDK

## Project Structure

```text
Florana/
|-- backend/              FastAPI backend, AI runtime, auth, routes, uploads, and local JSON fallback files
|-- flora-web/            React web client
|-- ml_pipeline/          Dataset download and model training workflow
|-- uploads/              Root-level uploaded assets used in local development
|-- package.json          Root utility manifest
|-- .gitignore
`-- README.md
```

## Frontend Areas

The React app in `flora-web/src/Components/` currently includes:

- `login/`, `signinform/`, `signupform/`
- `home/`
- `predict/`
- `myplants/`
- `flowerprofile/`
- `register/`
- `catalog/` and cart/season pages
- `carereminder/`
- `quicktip/`
- `profile/`
- `settings/`
- `help/`
- `aboutus/`
- `feedback/`
- `language/`
- shared navigation such as `topbar/` and `menu/`

## Quick Start

Use separate terminals for the backend and frontend.

### 1. Clone the repository

```powershell
git clone https://github.com/msnavodya/flora-web.git Florana
cd Florana
```

### 2. Start the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python main.py
```

Backend URLs:

- API root: `http://localhost:8000/api`
- docs: `http://localhost:8000/docs`
- health: `http://localhost:8000/api/health`

### 3. Start the web client

Open a new terminal:

```powershell
cd flora-web
npm install
Copy-Item .env.example .env
npm start
```

Frontend URL:

- web app: `http://localhost:3000`

### 4. Optional ML pipeline setup

```powershell
cd ml_pipeline
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python verify_setup.py
```

## Environment Variables

### Backend

Copy `backend/.env.example` to `backend/.env` and configure as needed:

```text
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_SECRET=your_paypal_sandbox_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/florana_db
FRONTEND_ORIGINS=https://your-app.vercel.app,https://your-app.netlify.app
JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
CORS_ALLOW_ALL=true
```

Notes:

- if `MONGO_URL` is missing or unreachable, the backend falls back to local JSON-backed storage for development flows
- if you want push reminders, add `backend/firebase-key.json` separately because it is not committed
- `CORS_ALLOW_ALL=true` is convenient locally, but you should tighten it for shared or production environments

### Frontend

Copy `flora-web/.env.example` to `flora-web/.env`:

```text
REACT_APP_API_URL=http://localhost:8000
```

The frontend also uses the `proxy` field in `flora-web/package.json` during local development.

## Running the Project

### Backend

From `backend/`:

```powershell
.\.venv\Scripts\Activate.ps1
python main.py
```

### Frontend

From `flora-web/`:

```powershell
npm start
```

### Production build

```powershell
cd flora-web
npm run build
```

### Frontend tests

```powershell
cd flora-web
npm test
```

## API Overview

Important active endpoints in the current backend include:

### Health and Root

- `GET /`
- `GET /api`
- `GET /api/health`

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Prediction and History

- `POST /api/predict`
- `GET /api/history`

### Plants

- `GET /api/plants`
- `GET /api/plants/`
- `POST /api/plants/`
- `DELETE /api/plants/{plant_id}`
- `GET /api/plants/by-name/{name}`

### Growth Tracking

- `POST /api/growth/`
- `GET /api/growth/{plant_id}`

### Shop

- `GET /api/shop/products`
- `POST /api/shop/products`
- `DELETE /api/shop/products/{product_id}`

### Payments

- `GET /api/paypal/config`
- `GET /api/paypal/debug`
- `GET /api/paypal/status`
- `POST /api/create-order`
- `POST /api/capture-order/{order_id}`
- `POST /api/webhooks/paypal`
- `POST /api/payments/orders`
- `POST /api/payments/orders/otp`
- `POST /api/payments/orders/verify`
- `POST /api/payments/orders/confirm`
- `GET /api/payments/orders/{order_id}`

### Care Reminder

- `POST /api/care-reminder`

## AI Model and ML Pipeline

The backend disease prediction flow loads model artifacts from:

```text
backend/ai/plant_disease_model.keras
backend/ai/class_names.json
```

The ML workflow in `ml_pipeline/` supports:

- Cloudinary dataset download
- dataset validation
- TensorFlow training
- saved model export
- training history output

Typical ML workflow:

```powershell
cd ml_pipeline
Copy-Item config_template.py config.py
python download_dataset.py
python train_model.py
```

## Local Data and Uploads

When MongoDB is unavailable, the backend can use local JSON files such as:

- `backend/users.local.json`
- `backend/plants.local.json`
- `backend/products.local.json`
- `backend/orders.local.json`
- `backend/predictions.local.json`
- `backend/growth.local.json`

Uploaded files are served during development from:

```text
/uploads/<filename>
```

## Documentation Map

- `README.md` - repository overview and setup
- `backend/README.md` - backend-specific notes
- `flora-web/README.md` - frontend-specific notes and commands
- `ml_pipeline/README.md` - end-to-end ML pipeline guide

## Contact

- Repository: `https://github.com/msnavodya/flora-web`
- GitHub: `msnavodya`
- Email: `sadininavodya@gmail.com`
- LinkedIn: `https://www.linkedin.com/in/sadini-navodya-0305362ab`

## Notes

- Keep secrets out of Git. Do not commit `.env`, `firebase-key.json`, `config.py`, generated datasets, or uploaded local files.
- The root `package.json` is not the main application entry point; day-to-day frontend work happens inside `flora-web/`.
