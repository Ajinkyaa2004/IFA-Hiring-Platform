import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

const mammoth = require('mammoth');
const xlsx = require('xlsx');

export async function parsePDF(buffer) {
    console.log(`Attempting to parse PDF. Buffer size: ${buffer.length} bytes`);
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error("PDF Parse Error:", error);
        throw new Error("Failed to parse PDF: " + error.message);
    }
}

export async function parseDOCX(buffer) {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (error) {
        console.error("DOCX Parse Error:", error);
        throw new Error("Failed to parse DOCX: " + error.message);
    }
}

export async function parseXLSX(buffer) {
    try {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_csv(sheet);
    } catch (error) {
        console.error("XLSX Parse Error:", error);
        throw new Error("Failed to parse XLSX: " + error.message);
    }
}

export async function parseText(buffer) {
    try {
        return buffer.toString('utf-8');
    } catch (error) {
        console.error("Text Parse Error:", error);
        throw new Error("Failed to parse Text file: " + error.message);
    }
}

export async function generateQuestionsFromText(text) {
    if (!openai) {
        console.warn("OPENAI_API_KEY missing, using fallback generator.");
        return generateFallbackQuestions(text);
    }

    try {
        const prompt = `
      Analyze the following text. 
      If the text contains multiple-choice questions, EXTRACT THEM EXACTLY AS THEY APPEAR. Do not rephrase or generate new questions if valid ones exist.
      If the text is just content (notes, articles), generate 10 relevant multiple-choice questions based on it.
      
      Return the output as a JSON array of objects.
      Each object must have:
      - "text": The question string (verbatim if extracted).
      - "options": An array of 4 strings (possible answers).
      - "correctOptionIndex": The index (0-3) of the correct answer.
      - "points": Integer (default 1).
      - "explanation": A brief explanation of why the answer is correct.

      Text:
      ${text.substring(0, 15000)} 
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant that extracts or generates quizzes from text." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        const result = JSON.parse(content);
        return result.questions || result; // Handle { questions: [...] } or [...]
    } catch (error) {
        console.error("OpenAI Generation Error:", error);
        return generateFallbackQuestions(text);
    }
}

function generateFallbackQuestions(text) {
    // Simple rule-based fallback if AI fails
    const sentences = text.split(/[.!?]/).filter(s => s.length > 20 && s.length < 100).slice(0, 5);
    return sentences.map((sentence, i) => ({
        text: `What is related to: "${sentence.substring(0, 20)}..."?`,
        options: [
            sentence,
            "Incorrect Option A",
            "Incorrect Option B",
            "Incorrect Option C"
        ],
        correctOptionIndex: 0,
        points: 1,
        explanation: "This is a fallback question generated from the text."
    }));
}