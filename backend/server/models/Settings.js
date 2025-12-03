import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    communityWhatsappLink: {
        type: String,
        default: '',
    },
    availableRoles: {
        type: [String],
        default: [],
    },
    roleWhatsappLinks: {
        type: Map,
        of: String,
        default: new Map(),
    },
    announcementTitle: {
        type: String,
        default: '',
    },
    announcementContent: {
        type: String,
        default: '',
    },
    showAnnouncement: {
        type: Boolean,
        default: false,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: String,
        default: 'admin',
    },
});

// Transform to remove MongoDB _id and convert Map to object
settingsSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
        // Convert Map to plain object for JSON serialization
        if (ret.roleWhatsappLinks instanceof Map) {
            ret.roleWhatsappLinks = Object.fromEntries(ret.roleWhatsappLinks);
        }
        return ret;
    }
});

export default mongoose.model('Settings', settingsSchema);
