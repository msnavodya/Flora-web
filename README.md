# Florana

Florana is a full-stack plant care and flower marketplace application. It combines a React mobile-first frontend, a FastAPI backend, local/MongoDB data storage, and a TensorFlow plant disease model for leaf image diagnosis.

## Features

- User signup, login, JWT authentication, and profile screens.
- Plant disease prediction from uploaded leaf images.
- My Plants dashboard with tracked plants, warnings, and profile pages.
- Growth tracking with image uploads.
- Care reminders and quick plant care tips.
- Seasonal flower catalog with buy/sell flows, cart, currency display, and checkout.
- PayPal integration and demo OTP payment flow.
- Feedback, help, settings, and multilingual UI support.
- Backend health checks, API docs, local JSON fallback storage, and optional MongoDB persistence.
- ML pipeline folder for dataset setup, verification, and model training.

## Tech Stack

### Frontend

- React 19
- React Router
- Axios
- Framer Motion
- Lucide React and React Icons
- Chart.js / React Chart.js
- PayPal React SDK
- Create React App

### Backend

- FastAPI
- Uvicorn
- TensorFlow / Keras
- Pillow and NumPy
- MongoDB via PyMongo
- JWT authentication
- PayPal Orders API
- APScheduler and optional Firebase push notifications

## Project Structure

```text
Florana/
  backend/        FastAPI API, auth, shop, payments, plant tracking, AI prediction
  florana/        React frontend application
  ml_pipeline/    Model training and dataset helper scripts
  uploads/        Local uploaded files, ignored by git
```

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.10+
- MongoDB, optional because the backend can fall back to local JSON files
- PayPal sandbox credentials, optional for PayPal checkout

### Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python main.py
```

The backend runs at `http://localhost:8000`.

Useful backend URLs:

- API root: `http://localhost:8000/api`
- Health check: `http://localhost:8000/api/health`
- Swagger docs: `http://localhost:8000/docs`

### Frontend Setup

```powershell
cd florana
npm install
Copy-Item .env.example .env
npm start
```

The React app runs at `http://localhost:3000` and points to `http://localhost:8000/api` during local development.

## Environment Variables

Backend variables are documented in `backend/.env.example`:

- `PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`
- `PAYPAL_BASE_URL`
- `MONGO_URL`
- `FRONTEND_ORIGINS`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `CORS_ALLOW_ALL`

Frontend variables are documented in `florana/.env.example`:

- `REACT_APP_API_URL`

Never commit real `.env` files, private keys, payment secrets, or Firebase service account files.

## ML Pipeline

The `ml_pipeline/` folder contains helper scripts and documentation for preparing datasets, verifying the setup, and training the plant disease model.

Start with:

```powershell
cd ml_pipeline
python verify_setup.py
```

The backend expects the trained model and class map at:

```text
backend/ai/plant_disease_model.keras
backend/ai/class_names.json
```

## Deployment Notes

- Frontend deployment files are included for Netlify/Vercel-style hosting.
- Backend deployment metadata is included in `backend/render.yaml`.
- Set production `REACT_APP_API_URL` to the deployed backend base URL.
- Configure `FRONTEND_ORIGINS` and disable broad CORS for production when possible.
- Configure MongoDB and PayPal environment variables in the hosting provider dashboard.

## Scripts

Frontend:

```powershell
cd florana
npm start
npm test
npm run build
```

Backend:

```powershell
cd backend
python main.py
```

ML pipeline:

```powershell
cd ml_pipeline
python verify_setup.py
python train_model.py
```

## License

No license file is currently included.
