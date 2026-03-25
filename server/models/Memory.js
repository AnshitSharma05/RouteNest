import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  story: {
    type: String,
    required: true,
  },
  pictures: [{
    type: String, // Storing base64 strings or URLs
  }],
  location: {
    type: String,
  },
  dateOfTrip: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('Memory', memorySchema);
