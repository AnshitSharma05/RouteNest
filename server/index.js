import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import memoryRoutes from './routes/memories.js';
import recommendationRoutes from './routes/recommendations.js';
import itineraryRoutes from './routes/itineraries.js';
import uploadRoutes from './routes/upload.js';
import publicRoutes from './routes/public.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('RouteNest API is running');
});

// Mock database connection for now until URI is provided
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } else {
      console.log('No MONGODB_URI found in .env, skipping connection for now.');
    }
  } catch (err) {
    console.error('MongoDB connection error', err);
  }
};

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
