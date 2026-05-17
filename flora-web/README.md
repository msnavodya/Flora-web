# Flora Web Frontend

This folder contains the React frontend for Flora Web.

For the full project overview, setup steps, backend notes, ML pipeline notes, and deployment guidance, see the root [README.md](../README.md).

## Scripts

```powershell
npm install
npm start
npm test
npm run build
```

## Environment

Copy `.env.example` to `.env` and set:

```text
REACT_APP_API_URL=http://localhost:8000
```

The app automatically uses `http://localhost:8000/api` when running in a local browser.

## Main Areas

- Authentication and profile pages
- Home dashboard and AI disease diagnosis
- Plant catalog, cart, checkout, and PayPal flow
- My Plants, growth tracking, and care reminders
- Feedback, help, settings, and language support

This project was bootstrapped with Create React App.
