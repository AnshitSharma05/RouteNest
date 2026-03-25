import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  content: {
    type: String, // Store Gemini markdown output
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('Itinerary', itinerarySchema);
