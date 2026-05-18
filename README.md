# Florana

Smart plant-care experience, AI-assisted disease prediction, growth tracking, reminders, shopping, and admin management in one connected platform.

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React%20Router-DOM-CA4245?style=flat&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TensorFlow / Keras](https://img.shields.io/badge/TensorFlow%20%2F%20Keras-AI%20Model-FF6F00?style=flat&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Status](https://img.shields.io/badge/Status-Academic%20Complete-65A30D?style=flat)](#)

## Project Showcase

Florana combines a FastAPI backend, a React web client, and a TensorFlow training pipeline for identifying plant diseases from images, managing plant care, and supporting a flower marketplace flow.

## Project Overview

Florana is a full-stack plant-care platform built for users who want to:

- register and manage plants
- predict plant diseases from uploaded images
- track growth history
- manage care reminders
- browse seasonal flowers and place orders
- use a multilingual browser-based interface

This repository currently contains three main modules:

- `backend/` - FastAPI API, authentication, plant data, growth tracking, shop, payments, uploads, and disease prediction runtime
- `flora-web/` - React web client with login, dashboard, diagnosis, my plants, catalog, cart, settings, and feedback flows
- `ml_pipeline/` - dataset download, verification, and TensorFlow model training utilities

## Repository Status

- Primary branch: `main`
- Frontend folder: `flora-web/`
- Backend default URL: `http://localhost:8000`
- Frontend default URL: `http://localhost:3000`
- API prefix: `/api`
- Storage mode: MongoDB when configured, with local JSON fallback behavior in development

## Key Features

### Core Features

- User signup and login
- JWT-secured backend authentication
- Plant disease prediction from uploaded leaf images
- Plant registration with image upload and care details
- Plant profile lookup by name
- Growth record creation and history viewing
- Care reminder support
- Seasonal flower catalog and shopping cart
- PayPal-based order flow and payment capture endpoints
- Feedback, profile, help, settings, and multilingual UI support

### Web Client Areas

The React app in `flora-web/src/Components/` currently includes:

- login and signup
- home dashboard
- disease prediction
- my plants
- flower profile
- plant registration
- catalog
- seasonal catalog pages
- cart and checkout-related UI
- care reminder
- quick tips
- profile
- settings
- help
- about
- feedback

## Tech Stack

### Frontend

- React 19
- React Router DOM
- Axios
- Chart.js
- Framer Motion
- PayPal React SDK
- Stripe JS client library

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
|-- backend/              FastAPI backend, AI runtime, uploads, auth, routes, local JSON fallback files
|-- flora-web/            React web client
|-- ml_pipeline/          Dataset download and training workflow
|-- uploads/              Root-level uploaded assets used in local development
|-- package.json          Minimal root package manifest
|-- .gitignore
`-- README.md
```

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

### Production-style frontend build

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

Important active endpoints exposed by the current backend include:

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

Related docs:

- `ml_pipeline/README.md`
- `ml_pipeline/ARCHITECTURE.md`
- `ml_pipeline/SETUP_SUMMARY.md`

## Local Data and Uploads

When MongoDB is unavailable, the backend can use local JSON files such as:

- `backend/users.local.json`
- `backend/plants.local.json`
- `backend/products.local.json`
- `backend/orders.local.json`
- `backend/predictions.local.json`

Uploaded files are served during development from:

```text
/uploads/<filename>
```

## Documentation Map

- `README.md` - repository overview and setup
- `flora-web/README.md` - frontend-specific notes and commands
- `ml_pipeline/README.md` - end-to-end ML pipeline guide

## Contributor

- GitHub: `msnavodya`

## Contact

- Repository: `https://github.com/msnavodya/flora-web`
- Email: `sadininavodya@gmail.com`
- LinkedIn: `https://www.linkedin.com/in/sadini-navodya-0305362ab`

## Notes

- Keep secrets out of Git. Do not commit `.env`, `config.py`, local upload data, or generated datasets.
- If you want the cleanest GitHub branch view, keep `main` as the only long-lived branch and remove duplicate published branches after merging.
