# Flora Web Frontend

This folder contains the React frontend for Florana, a smart plant-care and flower marketplace platform.

## Project Overview

Florana is a full-stack plant-care platform that helps users:
- Register and manage plants
- Predict plant diseases from uploaded leaf images using AI
- Track plant growth history with charts
- Manage care reminders and quick tips
- Browse seasonal flowers and place orders
- Explore community quick tips and feedback

For the full project overview, setup steps, backend notes, ML pipeline details, and API documentation, see the root [README.md](../README.md).

## Features

### Core Features Implemented

- **User Authentication** - JWT-secured signup, login, and profile management
- **Disease Prediction** - AI-powered plant disease identification from leaf images
- **Plant Management** - Register plants with images, track care details, and growth history
- **Growth Tracking** - Monitor plant growth with historical records and visual charts
- **Care Reminders** - Set and manage care reminder schedules
- **Plant Catalog** - Browse seasonal flower plants and products
- **Shopping Cart** - Add products to cart and proceed to checkout
- **PayPal Integration** - Secure payment processing for orders
- **Feedback System** - Submit and view user feedback
- **Multilingual Support** - Multiple language options for UI text
- **Profile & Settings** - User profile management, help, and settings screens
- **Local JSON Storage** - Fallback storage when MongoDB is unavailable

## Tech Stack

- **React** 19
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for backend API calls
- **Chart.js** - Data visualization for growth tracking
- **Framer Motion** - Animations and UI interactions
- **PayPal React SDK** - Payment integration
- **Stripe JS** - Additional payment processing support
- **Create React App** - Bootstrap and build tooling

## Project Structure

```text
flora-web/
├── src/
│   ├── Components/
│   │   ├── login/           Login and signup components
│   │   ├── home/            Dashboard and main screens
│   │   ├── predict/         Disease prediction UI
│   │   ├── myplants/        Plant registration and profile
│   │   ├── catalog/         Plant shop and seasonal catalog
│   │   ├── carereminder/    Reminder management
│   │   ├── quicktip/        Community tips and feedback
│   │   ├── profile/         User profile screens
│   │   ├── settings/        Application settings
│   │   ├── help/            Help documentation
│   │   ├── about/           About page
│   │   ├── feedback/        Feedback submission
│   │   └── topbar/          Navigation header
│   ├── App.js               Main app component
│   ├── App.css              Global styles
│   ├── index.js             React entry point
│   ├── index.css            Global CSS
│   └── api.js               Backend API utilities
├── public/                  Static assets
├── package.json             Dependencies and scripts
├── .env.example             Environment variable template
└── README.md                This file
```

## Component Areas

- **Authentication Pages** - Login, signup, and profile management
- **Home Dashboard** - User's main plant dashboard and overview
- **Disease Prediction** - Upload leaf images for AI diagnosis
- **My Plants** - Register, view, and manage plants
- **Plant Profile** - Detailed plant information and care history
- **Growth Tracking** - Visual charts and growth history
- **Catalog** - Browse and filter plant products
- **Seasonal Catalog** - View plants by season
- **Shopping Cart** - Cart management and checkout flow
- **Care Reminder** - Schedule and manage plant care reminders
- **Quick Tips** - Community-driven plant care tips
- **Payment/Checkout** - PayPal and payment method selection
- **Profile Settings** - User account and language preferences
- **Help & About** - Documentation and project information
- **Feedback** - Submit user feedback and suggestions

## Installation & Setup

### Prerequisites

- Node.js (v18+) and npm
- Backend API running on `http://localhost:8000`

### Quick Start

```powershell
# Install dependencies
npm install

# Copy environment file
Copy-Item .env.example .env

# Start development server
npm start
```

The app runs at `http://localhost:3000` and automatically proxies API calls to `http://localhost:8000/api`.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```text
REACT_APP_API_URL=http://localhost:8000
```

For production deployments, update `REACT_APP_API_URL` to your production backend URL.

## Scripts

```powershell
npm install            # Install dependencies
npm start              # Start development server (port 3000)
npm test               # Run test suite
npm run build          # Build for production
```

## API Integration

The frontend communicates with the FastAPI backend for:

- User authentication and JWT token management
- Plant data CRUD operations
- Disease prediction requests
- Growth history retrieval
- Shop product listing and cart management
- Payment creation and order confirmation
- Feedback submission and retrieval
- Care reminder scheduling

Backend API URL: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs` (Swagger UI)

## Development Notes

- The app uses React Router for navigation between screens
- Axios interceptors handle JWT authentication and error handling
- Local JSON fallback is supported when MongoDB is unavailable on the backend
- Chart.js is used for growth tracking visualizations
- PayPal SDK is integrated for payment processing

## Deployment

Build the production bundle:

```powershell
npm run build
```

Deploy the `build/` folder to:
- **Vercel** - Automatic deployments from Git
- **Netlify** - Connect GitHub repository
- **Traditional Hosting** - Copy build output and configure backend URL

## For Backend Setup

See [backend/](../backend/) for FastAPI server setup and configuration.

## For ML Pipeline

See [ml_pipeline/](../ml_pipeline/) for dataset download and model training workflow.

This project was bootstrapped with Create React App.
