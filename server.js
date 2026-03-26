import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import our previously proprietary Vercel Serverless Functions
import obstaclesHandler from './api/gemini/obstacles.js';
import eulogyHandler from './api/gemini/eulogy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Standard containerization middleware
app.use(cors());
app.use(express.json());

// API Routes perfectly matching the Vite frontend fetch structure
app.post('/api/gemini/obstacles', obstaclesHandler);
app.post('/api/gemini/eulogy', eulogyHandler);

// Serve the statically compiled Vite frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve index.html for single-page routing natively
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Listen dynamically on the Google Cloud Run assigned Process.Env.PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`[Cloud Run API Container] Express monolithic server executing securely on runtime port ${PORT}`);
});
