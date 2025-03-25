import express from 'express';
import cors from 'cors';
import userRouter from './routes/userRoute.js';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Define __dirname and __filename for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173' // Matches your Vite frontend
}));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, './uploads'))); // Fixed static path

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', userRouter);

// Start server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});