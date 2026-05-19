# Flora Web Frontend

This folder contains the React frontend for Florana, a smart plant-care and flower marketplace platform.

## Overview

The frontend covers the main user-facing flows for:

- signup and login
- plant registration and management
- AI disease prediction
- growth tracking
- care reminders
- flower browsing and seasonal catalog views
- shopping cart and checkout UI
- feedback, profile, help, and settings pages
- multilingual language switching

For the full project overview, backend setup, ML pipeline details, and API notes, see the root [README.md](../README.md).

## Tech Stack

- React 19
- React Router DOM
- Axios
- Chart.js and React ChartJS 2
- Framer Motion
- Lucide React
- React Icons
- React Phone Input 2
- PayPal React SDK
- Stripe JS
- Create React App

## Project Structure

```text
flora-web/
|-- public/                    Static assets
|-- src/
|   |-- Components/
|   |   |-- aboutus/           About page
|   |   |-- carereminder/      Reminder scheduling UI
|   |   |-- catalog/           Catalog, cart, and season pages
|   |   |-- feedback/          User feedback screens
|   |   |-- flowerprofile/     Plant detail view
|   |   |-- help/              Help page
|   |   |-- home/              Main dashboard
|   |   |-- language/          Language context and translations
|   |   |-- login/             Landing/login screen
|   |   |-- menu/              Shared menu UI
|   |   |-- mobile/            Mobile-specific layout helpers
|   |   |-- myplants/          Plant tracking pages
|   |   |-- predict/           Disease prediction UI
|   |   |-- profile/           User profile screens
|   |   |-- quicktip/          Quick-tip pages
|   |   |-- register/          Plant registration form
|   |   |-- settings/          User settings
|   |   |-- signinform/        Sign-in form
|   |   |-- signupform/        Sign-up form
|   |   |-- topbar/            Shared top navigation
|   |   `-- PayPalButton/      PayPal checkout helper
|   |-- api.js                 Backend API utilities and warm-up call
|   |-- App.js                 Route definitions
|   |-- App.css                Global layout styles
|   |-- index.js               React entry point
|   `-- index.css              Global CSS
|-- .env.example               Environment variable template
|-- package.json               Frontend dependencies and scripts
`-- README.md                  This file
```

## Routes

The current app routes in `src/App.js` include:

- `/`
- `/signin`
- `/signup`
- `/home`
- `/catalog`
- `/season/:season`
- `/cart`
- `/myplants`
- `/flower/:plantName`
- `/register`
- `/predict`
- `/settings`
- `/about`
- `/help`
- `/profile`
- `/feedback`
- `/care`
- `/quicktip`

## Setup

### Prerequisites

- Node.js 18 or newer
- npm
- Backend API running on `http://localhost:8000`

### Quick Start

```powershell
cd flora-web
npm install
Copy-Item .env.example .env
npm start
```

The app runs at `http://localhost:3000`.

During local development, the frontend proxies API calls to `http://localhost:8000` through the `proxy` field in `package.json`.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```text
REACT_APP_API_URL=http://localhost:8000
```

For deployed environments, set `REACT_APP_API_URL` to your public backend URL.

## Scripts

```powershell
npm start
npm test
npm run build
```

## API Integration

The frontend communicates with the FastAPI backend for:

- authentication and token handling
- plant CRUD and tracking flows
- disease prediction requests
- growth history retrieval
- catalog and cart data
- payment and order confirmation
- feedback submission
- care reminder scheduling

Backend docs are available at `http://localhost:8000/docs` when the API is running locally.

## Development Notes

- Routing is defined in [App.js](/abs/path/c:/Users/SADINI/Desktop/Florana/flora-web/src/App.js).
- `api.js` performs a backend warm-up request on app load.
- The UI includes multilingual support through the `language/` context.
- Production builds are generated into `build/`.

## Deployment

Build the production bundle with:

```powershell
npm run build
```

Deploy the generated `build/` directory to platforms such as Vercel or Netlify after pointing the frontend at the correct backend URL.
