import express from 'express';
import fs from 'fs';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { QuizUpload, Question, QuizScore } from '../models/QuestionGame.js';
import { parsePDF, parseDOCX, parseText, parseXLSX, generateQuestionsFromText } from '../services/questionGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// ... (existing code)



const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Rate limiter: 5 uploads per hour per IP
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: 'Too many uploads from this IP, please try again after an hour' }
});

// POST /api/question-game/upload
router.post('/upload', uploadLimiter, upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        // 1. Create Upload Record
        const quizUpload = new QuizUpload({
            adminId: req.body.adminId || null,
            filename: req.file.filename || 'upload.pdf',
            originalName: req.file.originalname,
            status: 'processing'
        });
        await quizUpload.save();

        // 2. Process File
        let text = '';
        const mimeType = req.file.mimetype;
        const originalName = req.file.originalname.toLowerCase();

        if (mimeType === 'application/pdf' || originalName.endsWith('.pdf')) {
            text = await parsePDF(req.file.buffer);
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            originalName.endsWith('.docx')
        ) {
            text = await parseDOCX(req.file.buffer);
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            originalName.endsWith('.xlsx')
        ) {
            text = await parseXLSX(req.file.buffer);
        } else if (
            mimeType === 'text/plain' ||
            originalName.endsWith('.txt') ||
            originalName.endsWith('.md')
        ) {
            text = await parseText(req.file.buffer);
        } else {
            // Try text fallback for unknown types
            console.warn(`Unknown file type: ${mimeType}, attempting text parse.`);
            text = await parseText(req.file.buffer);
        }

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from file.' });
        }

        // 3. Generate Questions
        const generatedQuestions = await generateQuestionsFromText(text);

        // 4. Save Questions
        const savedQuestions = [];
        for (const q of generatedQuestions) {
            const question = new Question({
                uploadId: quizUpload._id,
                text: q.text,
                options: q.options.map((opt, idx) => ({
                    text: opt,
                    isCorrect: idx === q.correctOptionIndex
                })),
                points: q.points || 1,
                explanation: q.explanation
            });
            await question.save();
            savedQuestions.push(question);
        }

        // 5. Update Upload Status
        quizUpload.status = 'completed';
        quizUpload.stats.totalQuestions = savedQuestions.length;
        quizUpload.stats.totalPoints = savedQuestions.reduce((sum, q) => sum + q.points, 0);
        await quizUpload.save();

        res.json({ upload: quizUpload, questions: savedQuestions });

    } catch (error) {
        console.error("Upload processing error:", error);

        // Log to file for debugging
        try {
            fs.appendFileSync('backend_errors.txt', `${new Date().toISOString()} - Upload Error: ${error.message}\nStack: ${error.stack}\n\n`);
        } catch (logErr) {
            console.error("Failed to write to error log:", logErr);
        }

        res.status(500).json({ error: 'Processing failed: ' + error.message });
    }
});

// Imports moved to top
// import path from 'path';
// import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ... (existing imports)

// POST /api/question-game/manual - Manual Quiz Creation with Cover Image
router.post('/manual', upload.single('coverImage'), async (req, res) => {
    try {
        console.log("Manual quiz creation request received");
        console.log("Body:", req.body);
        // console.log("File:", req.file); // Buffer might be large

        let { title, questions } = req.body;

        // Parse questions if it's a string (which it will be from FormData)
        if (typeof questions === 'string') {
            try {
                questions = JSON.parse(questions);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid questions format' });
            }
        }

        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'Invalid data. Title and questions are required.' });
        }

        let coverImagePath = null;
        if (req.file) {
            // Manually save the file since we are using memoryStorage
            const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
            // uploads folder is in backend root, which is parent of routes folder? 
            // No, server.js is in backend root. routes is in backend/server/routes.
            // So process.cwd() is backend.
            const uploadDir = path.join(process.cwd(), 'uploads');

            // Ensure directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, req.file.buffer);
            coverImagePath = `/uploads/${filename}`;
        }

        // 1. Create Upload Record
        const quizUpload = new QuizUpload({
            filename: title,
            originalName: title,
            coverImage: coverImagePath,
            status: 'completed',
            stats: {
                totalQuestions: questions.length,
                totalPoints: questions.reduce((sum, q) => sum + (parseInt(q.points) || 1), 0)
            }
        });
        await quizUpload.save();

        // 2. Save Questions
        const savedQuestions = [];
        for (const q of questions) {
            const question = new Question({
                uploadId: quizUpload._id,
                text: q.text,
                options: q.options.map(opt => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect
                })),
                points: parseInt(q.points) || 1,
                explanation: q.explanation
            });
            await question.save();
            savedQuestions.push(question);
        }

        res.json({ upload: quizUpload, questions: savedQuestions });

    } catch (error) {
        console.error("Manual creation error:", error);
        res.status(500).json({ error: 'Failed to create quiz: ' + error.message });
    }
});

// ...

// GET /api/question-game/quiz/:id - Get questions for a specific quiz
router.get('/quiz/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.query.admin === 'true';

        const questions = await Question.find({ uploadId: id });

        if (!questions) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // If not admin, maybe we should hide correct answers? 
        // For now, the frontend game logic might rely on checking answers locally or sending them back.
        // If the game logic is client-side, we need to send answers but maybe encrypted or just trust the client for this MVP.
        // But typically we shouldn't send isCorrect to client.
        // However, the current GameWrapper seems to handle logic.
        // Let's check QuestionGamePlayer.tsx later if needed. 
        // For Dev Mode (admin=true), we definitely send everything.

        if (!isAdmin) {
            // Optional: Mask answers if needed for security in future
            // const safeQuestions = questions.map(q => ({
            //    ...q.toObject(),
            //    options: q.options.map(o => ({ text: o.text, _id: o._id })) 
            // }));
            // return res.json(safeQuestions);
        }

        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// POST /api/question-game/score - Submit quiz score
router.post('/score', async (req, res) => {
    try {
        const { userId, uploadId, answers, timeSpent } = req.body;

        const quizUpload = await QuizUpload.findById(uploadId);
        if (!quizUpload) return res.status(404).json({ error: 'Quiz not found' });

        const questions = await Question.find({ uploadId });

        let score = 0;
        let maxScore = 0;
        const corrections = [];

        // Calculate score
        for (const q of questions) {
            const questionPoints = q.points || 1;
            maxScore += questionPoints;

            const userAnswer = answers.find(a => a.questionId === q._id.toString());
            const correctOptionIndex = q.options.findIndex(o => o.isCorrect);

            if (userAnswer && userAnswer.selectedOptionIndex === correctOptionIndex) {
                score += questionPoints;
            }

            corrections.push({
                questionId: q._id,
                correctOptionIndex,
                explanation: q.explanation
            });
        }

        // Save score
        const quizScore = new QuizScore({
            userId: userId || 'guest',
            uploadId,
            score,
            maxScore,
            timeSpent,
            answers
        });
        await quizScore.save();

        res.json({
            score: quizScore,
            corrections
        });

    } catch (error) {
        console.error("Score submission error:", error);
        res.status(500).json({ error: 'Failed to submit score' });
    }
});

// GET /api/question-game/uploads - List all uploads for admin
router.get('/uploads', async (req, res) => {
    try {
        const uploads = await QuizUpload.find()
            .sort({ createdAt: -1 });
        res.json(uploads);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch uploads' });
    }
});

// GET /api/question-game/list - List available quizzes for players
router.get('/list', async (req, res) => {
    try {
        const uploads = await QuizUpload.find({ status: 'completed' })
            .select('filename originalName coverImage totalQuestions totalPoints createdAt')
            .sort({ createdAt: -1 });
        res.json(uploads);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// GET /api/question-game/upload/:id - Get single upload details
router.get('/upload/:id', async (req, res) => {
    try {
        const id = req.params.id.trim();
        console.log(`Fetching upload details for ID: '${id}'`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const upload = await QuizUpload.findOne({ _id: id });

        if (!upload) {
            console.log(`Upload not found for ID: ${id}`);
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json(upload);
    } catch (error) {
        console.error(`Error fetching upload ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch quiz details' });
    }
});

// DELETE /api/question-game/upload/:id - Delete a quiz and its questions
router.delete('/upload/:id', async (req, res) => {
    try {
        const id = req.params.id.trim();
        console.log(`Deleting upload for ID: '${id}'`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // Find and delete the upload
        const upload = await QuizUpload.findOneAndDelete({ _id: id });

        if (!upload) {
            console.log(`Upload not found for deletion: ${id}`);
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Delete associated questions
        await Question.deleteMany({ uploadId: id });

        // Delete associated scores
        await QuizScore.deleteMany({ uploadId: id });

        // Optional: Delete file from filesystem if needed
        if (upload.coverImage && upload.coverImage.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), upload.coverImage);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error("Failed to delete cover image file:", err);
                }
            }
        }

        console.log(`Successfully deleted quiz ${id}`);
        res.json({ message: 'Quiz deleted successfully' });

    } catch (error) {
        console.error(`Error deleting upload ${req.params.id}:`, error);
        try {
            fs.appendFileSync('delete_error.log', `${new Date().toISOString()} - Error: ${error.message}\nStack: ${error.stack}\n`);
        } catch (e) { }
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
});

// GET /api/question-game/scores/:uploadId - Get scores for a specific quiz
router.get('/scores/:uploadId', async (req, res) => {
    try {
        const { uploadId } = req.params;
        const scores = await QuizScore.find({ uploadId })
            .populate('userId', 'name email')
            .sort({ score: -1 });
        res.json(scores);
    } catch (error) {
        console.error('Error fetching scores:', error);
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

export default router;