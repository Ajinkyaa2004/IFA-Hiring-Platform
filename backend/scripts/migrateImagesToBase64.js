import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { Question, QuizUpload } from '../server/models/QuestionGame.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const convertFileToBase64 = (filepath) => {
    try {
        const fullPath = path.join(__dirname, '..', filepath.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) {
            const fileBuffer = fs.readFileSync(fullPath);
            const ext = path.extname(filepath).toLowerCase();
            let mimeType = 'image/png';
            
            if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
            else if (ext === '.gif') mimeType = 'image/gif';
            else if (ext === '.webp') mimeType = 'image/webp';
            
            const base64 = fileBuffer.toString('base64');
            return `data:${mimeType};base64,${base64}`;
        }
        return null;
    } catch (error) {
        console.error(`Error converting file ${filepath}:`, error.message);
        return null;
    }
};

async function migrateImages() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Migrate Quiz Cover Images
        console.log('\n📸 Migrating quiz cover images...');
        const quizzes = await QuizUpload.find({ coverImage: { $exists: true, $ne: null } });
        let quizCount = 0;
        
        for (const quiz of quizzes) {
            if (quiz.coverImage && quiz.coverImage.startsWith('/uploads/')) {
                const base64 = convertFileToBase64(quiz.coverImage);
                if (base64) {
                    quiz.coverImage = base64;
                    await quiz.save();
                    quizCount++;
                    console.log(`✅ Converted cover image for quiz: ${quiz.filename}`);
                } else {
                    console.log(`❌ Failed to convert cover image for quiz: ${quiz.filename}`);
                }
            }
        }

        // Migrate Question Images
        console.log('\n🖼️  Migrating question images...');
        const questions = await Question.find({ imageUrl: { $exists: true, $ne: null } });
        let questionImgCount = 0;
        
        for (const question of questions) {
            if (question.imageUrl && question.imageUrl.startsWith('/uploads/')) {
                const base64 = convertFileToBase64(question.imageUrl);
                if (base64) {
                    question.imageUrl = base64;
                    await question.save();
                    questionImgCount++;
                    console.log(`✅ Converted image for question: ${question._id}`);
                } else {
                    console.log(`❌ Failed to convert image for question: ${question._id}`);
                }
            }
        }

        // Migrate Option Images
        console.log('\n🎯 Migrating option images...');
        const questionsWithOptions = await Question.find({ 'options.imageUrl': { $exists: true } });
        let optionImgCount = 0;
        
        for (const question of questionsWithOptions) {
            let modified = false;
            
            for (const option of question.options) {
                if (option.imageUrl && option.imageUrl.startsWith('/uploads/')) {
                    const base64 = convertFileToBase64(option.imageUrl);
                    if (base64) {
                        option.imageUrl = base64;
                        modified = true;
                        optionImgCount++;
                        console.log(`✅ Converted option image for question: ${question._id}`);
                    } else {
                        console.log(`❌ Failed to convert option image for question: ${question._id}`);
                    }
                }
            }
            
            if (modified) {
                await question.save();
            }
        }

        console.log('\n✨ Migration Complete!');
        console.log(`📊 Summary:`);
        console.log(`   - Quiz cover images: ${quizCount}`);
        console.log(`   - Question images: ${questionImgCount}`);
        console.log(`   - Option images: ${optionImgCount}`);
        console.log(`   - Total images migrated: ${quizCount + questionImgCount + optionImgCount}`);

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
    }
}

migrateImages();
