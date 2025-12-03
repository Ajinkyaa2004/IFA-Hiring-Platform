import mongoose from 'mongoose';
import Settings from '../server/models/Settings.js';
import dotenv from 'dotenv';

dotenv.config();

async function addWhatsAppLinks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        let settings = await Settings.findOne();

        if (!settings) {
            console.log('Creating new settings...');
            settings = new Settings();
        }

        // Add community WhatsApp link
        settings.communityWhatsappLink = 'https://chat.whatsapp.com/COMMUNITY_LINK_HERE';

        // Add role-specific WhatsApp links (you can update these with real links)
        const roleLinks = new Map();
        roleLinks.set('Software Engineer', 'https://chat.whatsapp.com/SOFTWARE_ENG_GROUP');
        roleLinks.set('Data Analyst', 'https://chat.whatsapp.com/DATA_ANALYST_GROUP');
        roleLinks.set('Data Science', 'https://chat.whatsapp.com/DATA_SCIENCE_GROUP');
        roleLinks.set('Financial Analyst', 'https://chat.whatsapp.com/FINANCIAL_ANALYST_GROUP');
        roleLinks.set('Product Manager', 'https://chat.whatsapp.com/PRODUCT_MANAGER_GROUP');
        // Add more as needed...

        settings.roleWhatsappLinks = roleLinks;
        settings.updatedAt = new Date();
        settings.updatedBy = 'script';

        await settings.save();

        console.log('✅ WhatsApp links added successfully!');
        console.log('Community Link:', settings.communityWhatsappLink);
        console.log('Role Links:', Object.fromEntries(settings.roleWhatsappLinks));

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addWhatsAppLinks();
