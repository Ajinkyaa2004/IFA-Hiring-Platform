import mongoose from 'mongoose';

// Question Bank Schema - Store reusable questions that admins can pick from
const questionBankSchema = new mongoose.Schema({
  questionText: { type: String },
  questionImageUrl: { type: String }, // Main question image
  options: [{
    optionText: { type: String },
    optionImageUrl: { type: String }, // Option image
    isCorrect: { type: Boolean, required: true }
  }],
  correctAnswer: { type: String }, // Text explanation or answer
  solutionImageUrl: { type: String }, // Solution/explanation image
  points: { type: Number, default: 1 },
  category: { type: String, default: 'General' }, // For organizing questions
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  tags: [{ type: String }], // For search/filter
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, default: 'admin' }, // Admin ID in future
  usageCount: { type: Number, default: 0 } // Track how many times used in quizzes
});

export const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);
