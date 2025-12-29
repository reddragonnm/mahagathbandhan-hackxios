# mahagathbandhan-hackxios

Full-stack application with React frontend and Express backend.

## Project Structure

```
├── frontend/          # React app with Tailwind CSS
└── backend/           # Express.js server
```

## Frontend

React application built with:
- Vite (build tool)
- Tailwind CSS (styling)
- JavaScript (no TypeScript)

### Setup
```bash
cd frontend
npm install
npm run dev
```

See [frontend/README.md](frontend/README.md) for more details.

## Backend

Express.js server with basic REST API setup.

### Setup
```bash
cd backend
npm install
npm start
```

See [backend/README.md](backend/README.md) for more details.

## Development

To run both frontend and backend simultaneously:

1. Terminal 1 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

2. Terminal 2 (Backend):
   ```bash
   cd backend
   npm start
   ```

Frontend will be available at: `http://localhost:5173`
Backend will be available at: `http://localhost:3000`
