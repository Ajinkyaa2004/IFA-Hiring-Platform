import express from 'express';
import multer from 'multer';
import { QuestionBank } from '../models/QuestionBank.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to convert uploaded file to base64 data URL
const saveUploadedFile = (file) => {
    const base64 = file.buffer.toString('base64');
    const mimeType = file.mimetype || 'image/png';
    return `data:${mimeType};base64,${base64}`;
};

// POST /api/question-bank/upload - Upload multiple questions to bank
router.post('/upload', upload.any(), async (req, res) => {
    try {
        console.log("Question bank upload request received");
        
        let { questions } = req.body;

        // Parse questions if it's a string
        if (typeof questions === 'string') {
            try {
                questions = JSON.parse(questions);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid questions format' });
            }
        }

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'Questions array is required' });
        }

        // Process uploaded files
        const fileMap = {};
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach(file => {
                fileMap[file.fieldname] = saveUploadedFile(file);
            });
        }

        // Save questions to bank
        const savedQuestions = [];
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            
            // Get question image if exists
            const questionImageKey = `questionImage_${i}`;
            const questionImageUrl = fileMap[questionImageKey] || undefined;

            // Get solution image if exists
            const solutionImageKey = `solutionImage_${i}`;
            const solutionImageUrl = fileMap[solutionImageKey] || undefined;

            const questionBank = new QuestionBank({
                questionText: q.questionText || '',
                questionImageUrl: questionImageUrl,
                options: q.options.map((opt, optIdx) => {
                    // Get option image if exists
                    const optionImageKey = `optionImage_${i}_${optIdx}`;
                    const optionImageUrl = fileMap[optionImageKey] || undefined;
                    
                    return {
                        optionText: opt.optionText || '',
                        optionImageUrl: optionImageUrl,
                        isCorrect: opt.isCorrect
                    };
                }),
                correctAnswer: q.correctAnswer || '',
                solutionImageUrl: solutionImageUrl,
                points: parseInt(q.points) || 1,
                category: q.category || 'General',
                difficulty: q.difficulty || 'Medium',
                tags: q.tags || []
            });
            
            await questionBank.save();
            savedQuestions.push(questionBank);
        }

        res.json({ 
            message: `Successfully added ${savedQuestions.length} questions to the bank`,
            questions: savedQuestions 
        });

    } catch (error) {
        console.error("Question bank upload error:", error);
        res.status(500).json({ error: 'Failed to upload questions: ' + error.message });
    }
});

// GET /api/question-bank/list - Get all questions from bank with optional filters
router.get('/list', async (req, res) => {
    try {
        const { category, difficulty, tags, search, limit, skip } = req.query;
        
        let query = {};
        
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (tags) query.tags = { $in: tags.split(',') };
        if (search) {
            query.$or = [
                { questionText: { $regex: search, $options: 'i' } },
                { correctAnswer: { $regex: search, $options: 'i' } }
            ];
        }

        const questions = await QuestionBank.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit) || 100)
            .skip(parseInt(skip) || 0);

        const total = await QuestionBank.countDocuments(query);

        res.json({ questions, total });

    } catch (error) {
        console.error("Error fetching question bank:", error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// GET /api/question-bank/:id - Get specific question by ID
router.get('/:id', async (req, res) => {
    try {
        const question = await QuestionBank.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        console.error("Error fetching question:", error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});

// PUT /api/question-bank/:id - Update question in bank
router.put('/:id', upload.any(), async (req, res) => {
    try {
        console.log("Question bank update request received");
        
        let { question } = req.body;

        // Parse question if it's a string
        if (typeof question === 'string') {
            try {
                question = JSON.parse(question);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid question format' });
            }
        }

        if (!question) {
            return res.status(400).json({ error: 'Question data is required' });
        }

        // Process uploaded files
        const fileMap = {};
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach(file => {
                fileMap[file.fieldname] = saveUploadedFile(file);
            });
        }

        // Get existing question
        const existingQuestion = await QuestionBank.findById(req.params.id);
        if (!existingQuestion) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Update question fields
        const updateData = {
            questionText: question.questionText || existingQuestion.questionText,
            questionImageUrl: fileMap['questionImage'] || existingQuestion.questionImageUrl,
            options: question.options.map((opt, optIdx) => {
                const optionImageKey = `optionImage_${optIdx}`;
                return {
                    optionText: opt.optionText || '',
                    optionImageUrl: fileMap[optionImageKey] || existingQuestion.options[optIdx]?.optionImageUrl,
                    isCorrect: opt.isCorrect
                };
            }),
            correctAnswer: question.correctAnswer || existingQuestion.correctAnswer,
            solutionImageUrl: fileMap['solutionImage'] || existingQuestion.solutionImageUrl,
            points: parseInt(question.points) || existingQuestion.points,
            category: question.category || existingQuestion.category,
            difficulty: question.difficulty || existingQuestion.difficulty
        };

        const updatedQuestion = await QuestionBank.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json({ 
            message: 'Question updated successfully',
            question: updatedQuestion 
        });

    } catch (error) {
        console.error("Question bank update error:", error);
        res.status(500).json({ error: 'Failed to update question: ' + error.message });
    }
});

// DELETE /api/question-bank/:id - Delete question from bank
router.delete('/:id', async (req, res) => {
    try {
        const question = await QuestionBank.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

// POST /api/question-bank/create-quiz-from-selection - Create quiz from selected questions
router.post('/create-quiz-from-selection', async (req, res) => {
    try {
        const { title, selectedQuestionIds, coverImageUrl } = req.body;

        if (!title || !selectedQuestionIds || !Array.isArray(selectedQuestionIds) || selectedQuestionIds.length === 0) {
            return res.status(400).json({ error: 'Title and selected questions are required' });
        }

        // Import models here to avoid circular dependency
        const { QuizUpload, Question } = await import('../models/QuestionGame.js');

        // Fetch selected questions from bank
        const bankQuestions = await QuestionBank.find({ _id: { $in: selectedQuestionIds } });

        if (bankQuestions.length !== selectedQuestionIds.length) {
            return res.status(400).json({ error: 'Some selected questions not found' });
        }

        // Create quiz upload
        const quizUpload = new QuizUpload({
            filename: title,
            originalName: title,
            coverImage: coverImageUrl || null,
            status: 'completed',
            stats: {
                totalQuestions: bankQuestions.length,
                totalPoints: bankQuestions.reduce((sum, q) => sum + (q.points || 1), 0)
            }
        });
        await quizUpload.save();

        // Create questions for the quiz
        const savedQuestions = [];
        for (const bankQ of bankQuestions) {
            const question = new Question({
                uploadId: quizUpload._id,
                text: bankQ.questionText,
                imageUrl: bankQ.questionImageUrl,
                options: bankQ.options.map(opt => ({
                    text: opt.optionText,
                    imageUrl: opt.optionImageUrl,
                    isCorrect: opt.isCorrect
                })),
                points: bankQ.points,
                explanation: bankQ.correctAnswer // Use correctAnswer as explanation
            });
            await question.save();
            savedQuestions.push(question);

            // Increment usage count
            await QuestionBank.findByIdAndUpdate(bankQ._id, { $inc: { usageCount: 1 } });
        }

        res.json({ upload: quizUpload, questions: savedQuestions });

    } catch (error) {
        console.error("Error creating quiz from selection:", error);
        res.status(500).json({ error: 'Failed to create quiz: ' + error.message });
    }
});

export default router;
