import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  adminId: { type: String, default: null }, // Placeholder for auth
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  coverImage: { type: String }, // URL/Path to cover image
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
  stats: {
    totalQuestions: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizUpload', required: true },
  text: { type: String, required: true },
  imageUrl: { type: String }, // Optional image URL for the question
  options: [{
    text: { type: String, required: true },
    imageUrl: { type: String }, // Optional image URL for the option
    isCorrect: { type: Boolean, required: true }
  }],
  points: { type: Number, default: 1 },
  explanation: { type: String } // Optional explanation for the answer
});

const scoreSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Or ObjectId if using User model
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizUpload', required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  timeSpent: { type: Number, default: 0 }, // Time in seconds
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOptionIndex: { type: Number },
    isCorrect: { type: Boolean }
  }],
  completedAt: { type: Date, default: Date.now }
});

export const QuizUpload = mongoose.model('QuizUpload', uploadSchema);
export const Question = mongoose.model('Question', questionSchema);
export const QuizScore = mongoose.model('QuizScore', scoreSchema);