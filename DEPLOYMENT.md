# MediWave Deployment

## Backend

Recommended host: Render web service.

If using the `render.yaml` blueprint, Render will create the backend service and ask for the secret values.

Set these environment variables:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/mediwave?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://mediwave-project.vercel.app
```

Backend settings if creating manually:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

After deploy, open:

```text
https://your-backend-url/api/health
```

Expected result:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## Frontend

Recommended host: Vercel.

Set this environment variable:

```env
VITE_API_BASE_URL=https://your-backend-url/api
```

Vercel settings:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Redeploy the frontend after changing `VITE_API_BASE_URL`.
