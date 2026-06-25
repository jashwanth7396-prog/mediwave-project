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

Backend environment variables:

```env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/mediwave
MONGODB_DB_NAME=mediwave
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

For deployment, set `MONGODB_URI` to your MongoDB Atlas connection string. The backend also accepts `MONGO_URI`, `MONGO_URL`, or `DATABASE_URL`, but `MONGODB_URI` is the recommended name.

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

Frontend environment variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

For Vercel, set `VITE_API_BASE_URL` to your deployed backend API URL, for example `https://your-backend-url.onrender.com/api`.

## Deployment Checklist

1. Deploy the backend first on Render, Railway, or another Node host.
2. Add backend env vars: `MONGODB_URI`, `MONGODB_DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CORS_ORIGIN`.
3. Set `CORS_ORIGIN` to your Vercel frontend URL when you want to restrict browser access, for example `https://mediwave-project.vercel.app`.
4. Deploy the frontend on Vercel from the `frontend/` folder.
5. Add frontend env var `VITE_API_BASE_URL` with the backend URL ending in `/api`.

### MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user and password under Database Access.
3. Add `0.0.0.0/0` under Network Access while deploying, or add your backend host's outbound IP if your provider gives one.
4. Copy the Node.js connection string from Atlas.
5. Replace `<password>` with your database user's password and use database name `mediwave`:
   ```env
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/mediwave?retryWrites=true&w=majority
   ```
6. Put that value in your backend hosting service environment variables. Do not put it in the frontend or commit it to Git.

After the backend deploys, open:

```text
https://your-backend-url/api/health
```

Then set this in Vercel for the frontend:

```env
VITE_API_BASE_URL=https://your-backend-url/api
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
