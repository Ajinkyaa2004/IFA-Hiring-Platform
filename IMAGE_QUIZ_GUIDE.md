# Image-Based Quiz Creation Guide

## ✨ New Feature: Create Quizzes with Images!

You can now create quizzes where both **questions AND answers** can be images. Perfect for probability diagrams, visual problems, or any scenario where images communicate better than text.

---

## 🚀 How to Create an Image-Based Quiz

### Step 1: Navigate to Quiz Creator
1. Go to **Admin Dashboard** → **Manage Quizzes**
2. Click the **"Create Image-Based Quiz"** button (purple gradient button at top right)

### Step 2: Add Quiz Details
- **Quiz Title**: Give your quiz a meaningful name (e.g., "Probability & Statistics Quiz")
- **Cover Image** (Optional): Upload a cover image for your quiz

### Step 3: Create Questions

For each question, you can:

#### Question Content:
- **Text**: Type the question text (optional if using image)
- **Question Image**: Upload an image showing the problem/diagram
  - Click "Upload Image" button
  - Select your image file
  - Preview will show immediately

#### Answer Options:
Each question has 4 options. For each option:
- **Option Text**: Type the option text
- **Option Image**: Upload an image for that option (e.g., diagrams, graphs, charts)
  - Click the small "Image" button next to each option
  - Select the image file
  - Preview shows inline

#### Mark Correct Answer:
- Click the **radio button** next to the correct option
- Only one option can be marked as correct

#### Additional Settings:
- **Points**: Set how many points this question is worth (default: 1)
- **Explanation**: Add an explanation that shows after submission (optional)

### Step 4: Add More Questions
- Click **"Add Another Question"** button at the bottom
- Repeat Step 3 for each question
- You can have as many questions as you want

### Step 5: Review & Create
- Review all questions
- Click **"Create Quiz"** button at top right
- Wait for upload to complete
- You'll be redirected to play the quiz

---

## 🎮 Quiz Player Features

### For Students Taking the Quiz:

1. **Navigation**:
   - ✅ **Next Button**: Move to next question
   - ✅ **Previous Button**: Go back to review previous questions
   - ✅ Progress bar shows how many questions completed

2. **Answering Questions**:
   - Click on any option (A, B, C, or D) to select your answer
   - Selected option highlights in purple
   - You can change your answer anytime before submitting

3. **Submission**:
   - When on the last question, **"Submit Quiz"** button appears
   - System warns if you have unanswered questions
   - Confirm submission

4. **Results**:
   - **Score displayed** at top: "X / Y" with percentage
   - ✅ Correct answers highlighted in **green**
   - ❌ Your wrong answers highlighted in **red**
   - 💡 **Explanation** shown for each question (if added)
   - Navigate through all questions to review

---

## 📊 Quiz Management

### View All Quizzes
In "Manage Quizzes" page, you can see:
- Quiz title and creation date
- Number of questions
- Status (completed/processing)
- Actions:
  - **Play Quiz**: Take/preview the quiz
  - **Manage**: Edit questions
  - **Scores**: View all student scores
  - **Delete**: Remove the quiz

### Edit Questions
Click **"Manage"** on any quiz to:
- Edit question text
- Change options
- Update correct answers
- Add/edit explanations
- (Note: Currently can't change images after creation - delete and recreate if needed)

---

## 💡 Tips for Creating Great Quizzes

### For Your Probability Questions:

1. **Question Images**:
   - Use clear diagrams showing the problem setup
   - Include all decks/cards/elements in the image
   - Make sure text in images is readable

2. **Option Images**:
   - Each option should show the specific configuration
   - Keep options visually similar in size
   - Number or label options clearly (Option 1, Option 2, etc.)

3. **Text Guidelines**:
   - If image is self-explanatory, question text can be simple: "Select the goal that is more likely to be met"
   - Add context in question text if image alone isn't clear
   - Keep option text short if using images (or leave blank)

4. **Explanations**:
   - Add why the answer is correct
   - Explain the probability calculation
   - Help students learn from mistakes

---

## 🔧 Technical Specifications

- **Supported Image Formats**: JPG, JPEG, PNG, GIF, BMP
- **Maximum File Size**: 10MB per image
- **Recommended Image Size**: 800x600 pixels for questions, 400x300 for options
- **Storage**: All images stored in `/backend/uploads/` directory

---

## 📝 Example Workflow

### Scenario: Creating Your Probability Quiz

1. **Extract images from Excel**:
   - Manually save each diagram from Excel as PNG
   - Name them: `q1.png`, `q1_opt1.png`, `q1_opt2.png`, etc.

2. **Create Quiz**:
   - Title: "Probability - Card Drawing Quiz"
   - Cover: A nice probability themed image

3. **Question 1**:
   - Text: "Select the goal that is more likely to be met when drawing one card from each deck."
   - Question Image: Upload the diagram showing both decks
   - Option 1 Image: Upload "star" configuration
   - Option 2 Image: Upload "circle" configuration  
   - Mark correct option
   - Explanation: "The star configuration has higher probability because..."

4. **Repeat** for all questions

5. **Create & Test**:
   - Click "Create Quiz"
   - Take the quiz yourself to test
   - Navigate with Next/Previous
   - Submit and review results

---

## 🆘 Troubleshooting

### Images Not Showing?
- Check file size < 10MB
- Ensure file format is supported
- Try refreshing the page
- Check browser console for errors

### Can't Upload Images?
- Backend server must be running
- Check uploads folder permissions
- Verify backend route is registered

### Quiz Not Saving?
- Ensure at least one question exists
- Each question must have correct answer marked
- Check network tab for API errors

---

## 🎯 Next Steps

You're ready to create amazing image-based quizzes! 

1. Click **"Create Image-Based Quiz"**
2. Start with your probability questions
3. Upload images for questions and options
4. Test the quiz yourself
5. Share with students!

Need help? The quiz creator has helpful tooltips and validation messages.
