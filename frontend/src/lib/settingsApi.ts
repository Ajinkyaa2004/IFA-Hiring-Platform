const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getSettings = async () => {
    try {
        const response = await fetch(`${API_URL}/settings`);
        if (!response.ok) {
            throw new Error('Failed to fetch settings');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    }
};

export const updateSettings = async (settings: {
    communityWhatsappLink?: string;
    availableRoles?: string[];
    roleWhatsappLinks?: Record<string, string>;
    announcementTitle?: string;
    announcementContent?: string;
    showAnnouncement?: boolean;
}) => {
    try {
        const response = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to update settings: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};
