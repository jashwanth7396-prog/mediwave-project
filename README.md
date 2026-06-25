# MediWave

MediWave is an enterprise-grade pharmacy inventory and returns management platform with a modern SaaS dashboard experience.

## Architecture

- Frontend: React 18, Vite, Tailwind CSS, React Router DOM, Axios, React Hook Form, Recharts, Framer Motion.
- Backend: Node.js, Express, MongoDB, Mongoose, JWT auth, bcryptjs, multer, node-cron, nodemailer.

## Folder Structure

- `backend/`
  - `config/` - database connection
  - `controllers/` - API business logic
  - `middleware/` - auth and error handling
  - `models/` - Mongoose schemas
  - `routes/` - Express routes
  - `services/` - email and cron utilities
  - `utils/` - report generation
  - `cron/` - scheduled jobs
  - `uploads/` - file uploads

- `frontend/`
  - `assets/` - static assets
  - `components/` - reusable UI components
  - `context/` - React context providers
  - `layouts/` - shared page layout
  - `pages/` - feature pages
  - `routes/` - route guards
  - `services/` - API service layer
  - `styles/` - Tailwind styles

## Getting Started

### Backend

1. Navigate to `backend/`
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Copy `.env.example` to `.env` and set values.
4. Start the backend:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Copy `.env.example` to `.env`.
4. Start the frontend:
   ```bash
   npm run dev
   ```

## API Documentation

### Auth
- `POST /api/auth/register` - register a new user
- `POST /api/auth/login` - login and receive JWT
- `GET /api/auth/profile` - fetch current user profile

### Medicines
- `GET /api/medicines` - list medicines with search and filter
- `POST /api/medicines` - add medicine
- `GET /api/medicines/:id` - fetch medicine
- `PUT /api/medicines/:id` - update medicine
- `DELETE /api/medicines/:id` - remove medicine
- `GET /api/medicines/summary` - dashboard summary

### Damaged Stock
- `GET /api/damaged` - list damaged stock
- `POST /api/damaged` - add damaged stock record
- `PUT /api/damaged/:id` - update damaged record
- `DELETE /api/damaged/:id` - remove damaged record

### Return Requests
- `GET /api/returns` - list return requests
- `POST /api/returns` - submit return request
- `PUT /api/returns/:id` - update request status
- `DELETE /api/returns/:id` - delete request

### Notifications
- `GET /api/notifications` - user notifications
- `PUT /api/notifications/:id/read` - mark as read

### Audit Logs
- `GET /api/audit` - list audit logs

### Reports
- `GET /api/reports/medicines/csv` - export medicines as CSV
- `GET /api/reports/medicines/excel` - export medicines as Excel

## Notes

- The backend schedules a daily expiry monitoring job to create notifications for upcoming expiry items.
- JWT is required for protected routes; tokens are stored in `localStorage` for frontend requests.
- Tailwind and Framer Motion deliver a modern dashboard UI.
