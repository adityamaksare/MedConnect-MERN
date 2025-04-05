# Doctor Appointment System Deployment Guide

This guide explains how to deploy the Doctor Appointment System (MedConnect) to various cloud platforms.

## Prerequisites

Before deployment, make sure you have:

1. A GitHub account with your code pushed to a repository
2. MongoDB Atlas account with a database cluster set up
3. Account on your preferred deployment platform (Render, Vercel, or Netlify)

## Option 1: Render.com (Recommended)

Render allows you to deploy both the backend and frontend together using a unified configuration.

### One-Click Deployment

1. Log in to your Render account
2. Create a new "Blueprint" deployment
3. Connect your GitHub repository
4. Let Render detect the `render.yaml` file to set up the services

### Manual Setup

#### Backend Deployment:

1. In Render dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - Name: `medconnect-backend`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: Node
   - Plan: Free

4. Add environment variables:
   - `NODE_ENV`: production
   - `PORT`: 5001
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secure JWT secret
   - `JWT_EXPIRES_IN`: 30d

5. Click "Create Web Service"

#### Frontend Deployment:

1. Click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - Name: `medconnect-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

4. Click "Create Static Site"

## Option 2: Vercel Deployment

### Frontend Deployment:

1. Log in to Vercel and click "New Project"
2. Import your GitHub repository
3. Configure project settings:
   - Framework Preset: Create React App
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/build`
   - Root Directory: `/` (or set to `frontend` if you have a mono-repo setup)

4. Deploy

### Backend Deployment:

For Vercel Serverless Functions:

1. Create a `vercel.json` file in your backend directory:
```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "server.js" }
  ]
}
```

2. Deploy the backend separately

## Option 3: Netlify Deployment (Frontend Only)

1. Log in to Netlify
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `build`

5. Add environment variables if needed
6. Click "Deploy site"

## Connecting Frontend to Backend

Make sure your frontend is configured to use the correct backend URL:

1. Update `PRODUCTION_API_URL` in `frontend/src/utils/api.js` to point to your deployed backend URL:
```javascript
const PRODUCTION_API_URL = 'https://medconnect-backend.onrender.com/api';
```

## Post-Deployment Verification

After deployment:

1. Test user registration and login
2. Test booking appointments
3. Check doctor profiles
4. Verify doctor dashboard functionality
5. Test user profile updates

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure that your backend CORS configuration includes your frontend domain
2. **404 Page Errors**: Make sure your SPA redirects are configured properly in `_redirects` or `vercel.json`
3. **Connection Issues**: Check that your frontend is using the correct backend URL
4. **MongoDB Connection Errors**: Verify your MongoDB connection string and ensure your IP is whitelisted

### How to Debug:

1. Check server logs in your deployment platform
2. Use browser developer tools to inspect network requests
3. Test API endpoints using Postman or similar tools
4. Examine database logs in MongoDB Atlas

## Maintenance

- Regularly update dependencies
- Monitor performance metrics
- Set up automated backups for your database
- Consider setting up CI/CD pipelines for continuous deployment 