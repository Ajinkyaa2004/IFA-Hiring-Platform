import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { QuestionBank } from '../server/models/QuestionBank.js';

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

async function migrateQuestionBank() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('\n📚 Migrating Question Bank images...');
        
        const questions = await QuestionBank.find({
            $or: [
                { questionImageUrl: { $exists: true, $ne: null } },
                { solutionImageUrl: { $exists: true, $ne: null } },
                { 'options.optionImageUrl': { $exists: true } }
            ]
        });

        let questionImgCount = 0;
        let solutionImgCount = 0;
        let optionImgCount = 0;

        for (const question of questions) {
            let modified = false;

            // Migrate question image
            if (question.questionImageUrl && question.questionImageUrl.startsWith('/uploads/')) {
                const base64 = convertFileToBase64(question.questionImageUrl);
                if (base64) {
                    question.questionImageUrl = base64;
                    modified = true;
                    questionImgCount++;
                    console.log(`✅ Converted question image for: ${question.questionText.substring(0, 50)}...`);
                } else {
                    console.log(`❌ Failed to convert question image for: ${question.questionText.substring(0, 50)}...`);
                }
            }

            // Migrate solution image
            if (question.solutionImageUrl && question.solutionImageUrl.startsWith('/uploads/')) {
                const base64 = convertFileToBase64(question.solutionImageUrl);
                if (base64) {
                    question.solutionImageUrl = base64;
                    modified = true;
                    solutionImgCount++;
                    console.log(`✅ Converted solution image for: ${question.questionText.substring(0, 50)}...`);
                } else {
                    console.log(`❌ Failed to convert solution image for: ${question.questionText.substring(0, 50)}...`);
                }
            }

            // Migrate option images
            for (const option of question.options) {
                if (option.optionImageUrl && option.optionImageUrl.startsWith('/uploads/')) {
                    const base64 = convertFileToBase64(option.optionImageUrl);
                    if (base64) {
                        option.optionImageUrl = base64;
                        modified = true;
                        optionImgCount++;
                        console.log(`✅ Converted option image for: ${question.questionText.substring(0, 50)}...`);
                    } else {
                        console.log(`❌ Failed to convert option image for: ${question.questionText.substring(0, 50)}...`);
                    }
                }
            }

            if (modified) {
                await question.save();
            }
        }

        console.log('\n✨ Question Bank Migration Complete!');
        console.log(`📊 Summary:`);
        console.log(`   - Question images: ${questionImgCount}`);
        console.log(`   - Solution images: ${solutionImgCount}`);
        console.log(`   - Option images: ${optionImgCount}`);
        console.log(`   - Total images migrated: ${questionImgCount + solutionImgCount + optionImgCount}`);

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
    }
}

migrateQuestionBank();
