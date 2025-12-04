# Question Bank System - Implementation Guide

## 🎯 Overview

You can now upload 10-20 questions with images to a question bank, and then select specific questions (e.g., first 10, last 10, or custom selection) to create quizzes.

## 📋 Features Implemented

### 1. **Question Bank Database Model** (`backend/server/models/QuestionBank.js`)
- Stores reusable questions separately from quizzes
- Supports:
  - Question text and/or image
  - 4 options with text and/or images each
  - Solution/explanation with text and/or image
  - Metadata: category, difficulty, points
  - Usage tracking (how many times used in quizzes)

### 2. **Backend API Endpoints** (`backend/server/routes/questionBank.js`)
- `POST /api/question-bank/upload` - Upload multiple questions to the bank
- `GET /api/question-bank/list` - Get all questions with filters (category, difficulty, search)
- `GET /api/question-bank/:id` - Get specific question
- `DELETE /api/question-bank/:id` - Delete question from bank
- `POST /api/question-bank/create-quiz-from-selection` - Create quiz from selected questions

### 3. **Question Bank Upload Interface** (`frontend/src/components/admin/QuestionBankUpload.tsx`)
Admin can upload multiple questions with:
- Question text and/or image
- 4 options (each with text and/or image)
- Correct answer marking
- Solution explanation (text and/or image)
- Points, category, difficulty level

### 4. **Question Bank Manager** (`frontend/src/components/admin/QuestionBankManager.tsx`)
Visual interface to:
- Browse all questions in the bank
- Search and filter by category, difficulty
- Select questions individually or use quick select:
  - First 5, First 10
  - Last 5, Last 10
  - Select All
- Create quiz from selected questions

## 🚀 How to Use

### Step 1: Upload Questions to Bank
1. Login as admin
2. Go to Admin Dashboard
3. Click **"Question Bank"** button (green button)
4. Click **"Upload Questions"**
5. Add 10-20 questions with:
   - Question images
   - Option images
   - Solution images
   - Set category (Math, Science, Logic, etc.)
   - Set difficulty (Easy, Medium, Hard)
6. Click **"Upload Questions"**

### Step 2: Create Quiz from Selected Questions
1. Go to **Question Bank** (from Admin Dashboard)
2. Use filters to find questions:
   - Search by text
   - Filter by category
   - Filter by difficulty
3. Select questions using:
   - **Quick Select buttons**: "First 10", "Last 10", etc.
   - **Manual selection**: Click on individual question cards
   - **Select All**: Select all filtered questions
4. Enter a quiz title
5. Click **"Create Quiz"**
6. Quiz will be created and you'll be taken to the player

### Step 3: Play the Quiz
- The quiz will display with all selected questions
- Questions and options will show images where provided
- After submission, solutions will be displayed

## 🎨 Admin Dashboard Changes

Added new **"Question Bank"** button (green) to the Admin Dashboard alongside existing features:
- Candidates
- Leaderboard
- Insights
- Settings
- Manage Quizzes
- **Question Bank** ← NEW

## 📁 Files Created/Modified

### Backend
- ✅ `backend/server/models/QuestionBank.js` - New database model
- ✅ `backend/server/routes/questionBank.js` - New API routes
- ✅ `backend/server.js` - Added question bank routes

### Frontend
- ✅ `frontend/src/components/admin/QuestionBankUpload.tsx` - Upload interface
- ✅ `frontend/src/components/admin/QuestionBankManager.tsx` - Browse/select interface
- ✅ `frontend/src/components/ui/checkbox.tsx` - Checkbox component for selection
- ✅ `frontend/src/components/admin/AdminDashboard.tsx` - Added navigation button
- ✅ `frontend/src/App.tsx` - Added new routes
- ✅ `frontend/src/components/games/QuestionGamePlayer.tsx` - Fixed image display

### Routes Added
- `/admin/question-bank` - Question bank manager
- `/admin/question-bank/upload` - Upload questions

## 🔧 Technical Details

### Database Schema
```javascript
{
  questionText: String,
  questionImageUrl: String,
  options: [{
    optionText: String,
    optionImageUrl: String,
    isCorrect: Boolean
  }],
  correctAnswer: String,
  solutionImageUrl: String,
  points: Number,
  category: String,
  difficulty: String (Easy/Medium/Hard),
  usageCount: Number,
  createdAt: Date
}
```

### API Response Format
Questions list returns:
```javascript
{
  questions: [...],
  total: number
}
```

Quiz creation returns:
```javascript
{
  upload: { quiz metadata },
  questions: [ quiz questions ]
}
```

## 🎯 Benefits

1. **Reusability**: Upload questions once, use in multiple quizzes
2. **Flexibility**: Select any subset of questions for a quiz
3. **Organization**: Category and difficulty filters
4. **Tracking**: See how many times each question has been used
5. **Efficiency**: Quick select options for common patterns (first 10, last 10)
6. **Rich Content**: Full image support for questions, options, and solutions

## 🔄 Workflow Example

**Scenario**: You have 20 probability questions and want to create different quizzes

1. Upload all 20 questions to question bank (one time)
2. Create "Easy Quiz" - Select first 10 questions
3. Create "Advanced Quiz" - Select last 10 questions
4. Create "Mixed Quiz" - Manually select questions 2, 5, 8, 12, 15, 18
5. All quizzes share the same question pool, no duplication needed!

## 📊 Features by Component

### QuestionBankUpload
- ✅ Multi-question upload
- ✅ Image upload for questions
- ✅ Image upload for options
- ✅ Image upload for solutions
- ✅ Category selection
- ✅ Difficulty selection
- ✅ Points configuration

### QuestionBankManager
- ✅ Grid view of all questions
- ✅ Search functionality
- ✅ Category filter
- ✅ Difficulty filter
- ✅ Individual selection
- ✅ Quick select (first N, last N)
- ✅ Select all filtered
- ✅ Visual selection state
- ✅ Usage count display
- ✅ Create quiz button

## 🐛 Bug Fixes Included

Fixed image display issue in `QuestionGamePlayer.tsx`:
- ✅ Question images now display correctly with backend URL prefix
- ✅ Option images now display (previously missing)
- ✅ Updated TypeScript interface to include imageUrl for options
- ✅ Proper image rendering with object-contain sizing

## 🎨 UI/UX Features

- **Color-coded buttons**: Green for Question Bank, Blue for Manage Quizzes
- **Visual feedback**: Selected questions highlighted with purple ring
- **Preview thumbnails**: See question/option images in manager
- **Badge system**: Category, difficulty, and usage badges
- **Responsive grid**: Adapts to screen size
- **Smooth animations**: Hover effects and transitions
- **Clear selection state**: Always shows count of selected questions

## 🚦 Next Steps

1. Start backend server: `cd backend && npm run dev:backend`
2. Start frontend server: `cd frontend && npm run dev`
3. Login as admin
4. Navigate to Question Bank
5. Upload your 10-20 questions
6. Select and create quizzes!

---

**Status**: ✅ Fully implemented and ready to use!
