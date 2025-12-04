/**
 * Excel Image Extractor
 * 
 * This script helps extract images from Excel files.
 * Since .xlsx files are actually ZIP files with embedded images in xl/media/,
 * we can extract them programmatically.
 * 
 * Usage:
 * node scripts/extractExcelImages.js path/to/yourfile.xlsx
 */

import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractImagesFromExcel(excelFilePath) {
    try {
        console.log(`📂 Processing: ${excelFilePath}\n`);

        // Create output directory
        const baseName = path.basename(excelFilePath, path.extname(excelFilePath));
        const outputDir = path.join(path.dirname(excelFilePath), `${baseName}_images`);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Excel files are ZIP archives
        const zip = new AdmZip(excelFilePath);
        const zipEntries = zip.getEntries();

        let imageCount = 0;
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];

        // Extract images from xl/media/ directory
        zipEntries.forEach((entry) => {
            const entryName = entry.entryName;
            
            // Check if it's in the media folder and is an image
            if (entryName.startsWith('xl/media/') && 
                imageExtensions.some(ext => entryName.toLowerCase().endsWith(ext))) {
                
                const fileName = path.basename(entryName);
                const outputPath = path.join(outputDir, fileName);
                
                // Extract the file
                zip.extractEntryTo(entry, outputDir, false, true);
                console.log(`✅ Extracted: ${fileName}`);
                imageCount++;
            }
        });

        if (imageCount === 0) {
            console.log('\n⚠️  No images found in the Excel file.');
            console.log('Images might be embedded differently or the file might not contain images.\n');
        } else {
            console.log(`\n🎉 Successfully extracted ${imageCount} images to: ${outputDir}\n`);
            console.log('Next steps:');
            console.log('1. Review the extracted images');
            console.log('2. Rename them to match your questions (e.g., q1.png, q1_option1.png)');
            console.log('3. Use the Admin Dashboard → Manage Quizzes → Create New Quiz Manually');
            console.log('4. Upload the images while creating questions\n');
        }

        return outputDir;

    } catch (error) {
        console.error('❌ Error extracting images:', error.message);
        throw error;
    }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('\n📘 Usage: node scripts/extractExcelImages.js <path-to-excel-file>\n');
    console.log('Example: node scripts/extractExcelImages.js ./myquestions.xlsx\n');
    process.exit(1);
}

const excelFile = args[0];

if (!fs.existsSync(excelFile)) {
    console.error(`\n❌ File not found: ${excelFile}\n`);
    process.exit(1);
}

extractImagesFromExcel(excelFile)
    .then(() => {
        console.log('✨ Done!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Failed:', error.message, '\n');
        process.exit(1);
    });
