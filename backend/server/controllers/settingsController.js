import Settings from '../models/Settings.js';

// Get settings
export const getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();

        // If no settings exist, create default settings
        if (!settings) {
            settings = await Settings.create({
                communityWhatsappLink: '',
                availableRoles: [],
                roleWhatsappLinks: new Map(),
                announcementTitle: '',
                announcementContent: '',
                showAnnouncement: false,
                updatedAt: new Date(),
                updatedBy: 'system',
            });
        }

        res.json(settings);
    } catch (error) {
        next(error);
    }
};

// Update settings (admin only)
export const updateSettings = async (req, res, next) => {
    try {
        const { communityWhatsappLink, availableRoles, roleWhatsappLinks, announcementTitle, announcementContent, showAnnouncement } = req.body;
        
        console.log('📥 Received availableRoles:', availableRoles);
        console.log('📥 Type:', typeof availableRoles, 'Length:', availableRoles?.length);

        let settings = await Settings.findOne();

        if (!settings) {
            // Create new settings if none exist
            settings = await Settings.create({
                communityWhatsappLink: communityWhatsappLink || '',
                availableRoles: availableRoles || [],
                roleWhatsappLinks: roleWhatsappLinks ? new Map(Object.entries(roleWhatsappLinks)) : new Map(),
                announcementTitle: announcementTitle || '',
                announcementContent: announcementContent || '',
                showAnnouncement: showAnnouncement || false,
                updatedAt: new Date(),
                updatedBy: req.user?.email || 'admin',
            });
        } else {
            // Update existing settings
            settings.communityWhatsappLink = communityWhatsappLink || '';
            if (availableRoles !== undefined) {
                settings.availableRoles = availableRoles;
            }
            if (roleWhatsappLinks) {
                settings.roleWhatsappLinks = new Map(Object.entries(roleWhatsappLinks));
            }
            settings.announcementTitle = announcementTitle || '';
            settings.announcementContent = announcementContent || '';
            settings.showAnnouncement = showAnnouncement !== undefined ? showAnnouncement : false;
            settings.updatedAt = new Date();
            settings.updatedBy = req.user?.email || 'admin';
            await settings.save();
        }

        res.json(settings);
    } catch (error) {
        next(error);
    }
};
