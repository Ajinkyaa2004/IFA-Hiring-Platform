import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSettings, updateSettings } from '@/lib/settingsApi';
import { toast } from 'sonner';
import { MessageSquare, Save, ExternalLink, Megaphone, Eye, EyeOff, Bold, Italic, List, Highlighter, Users, Link, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { ROLES } from '@/types';

export const AdminSettings: React.FC = () => {
    const [communityWhatsappLink, setCommunityWhatsappLink] = useState('');
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [newRole, setNewRole] = useState('');
    const [roleWhatsappLinks, setRoleWhatsappLinks] = useState<Record<string, string>>({});
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertTag = (tag: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        let newText = '';
        let newCursorPos = 0;

        if (tag === 'ul') {
            newText = text.substring(0, start) + `<ul>\n  <li>${selectedText || 'List item'}</li>\n</ul>` + text.substring(end);
            if (!selectedText) {
                newCursorPos = start + 9; // Position inside <li>
            } else {
                newCursorPos = start + newText.length;
            }
        } else {
            newText = text.substring(0, start) + `<${tag}>${selectedText}</${tag}>` + text.substring(end);
            if (!selectedText) {
                newCursorPos = start + tag.length + 2; // Position between tags
            } else {
                newCursorPos = start + newText.length;
            }
        }

        setAnnouncementContent(newText);

        setTimeout(() => {
            textarea.focus();
            if (!selectedText) {
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    useEffect(() => {
        loadSettings();
    }, []);
    
    const loadSettings = async () => {
        try {
            setLoadingSettings(true);
            const settings = await getSettings();
            setCommunityWhatsappLink(settings.communityWhatsappLink || '');
            setAvailableRoles(settings.availableRoles || []);
            setRoleWhatsappLinks(settings.roleWhatsappLinks || {});
            setAnnouncementTitle(settings.announcementTitle || '');
            setAnnouncementContent(settings.announcementContent || '');
            setShowAnnouncement(settings.showAnnouncement || false);
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Failed to load settings', {
                duration: 3000,
                icon: '⚠️',
            });
        } finally {
            setLoadingSettings(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('💾 Saving settings with availableRoles:', availableRoles);
            await updateSettings({ 
                communityWhatsappLink,
                availableRoles,
                roleWhatsappLinks,
                announcementTitle, 
                announcementContent, 
                showAnnouncement 
            });
            console.log('✅ Settings saved successfully');
            toast.success('Settings saved successfully!', {
                duration: 2000,
                icon: '✅',
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save settings', {
                duration: 3000,
                icon: '❌',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleLinkChange = (role: string, link: string) => {
        setRoleWhatsappLinks(prev => ({
            ...prev,
            [role]: link
        }));
    };

    const handleAddRole = () => {
        if (!newRole.trim()) {
            toast.error('Please enter a role name', {
                duration: 2000,
                icon: '⚠️',
            });
            return;
        }
        if (availableRoles.includes(newRole.trim())) {
            toast.error('This role already exists', {
                duration: 2000,
                icon: '⚠️',
            });
            return;
        }
        setAvailableRoles(prev => [...prev, newRole.trim()]);
        setNewRole('');
        toast.success(`Role "${newRole.trim()}" added`, {
            duration: 2000,
            icon: '✅',
        });
    };

    const handleRemoveRole = (role: string) => {
        setAvailableRoles(prev => prev.filter(r => r !== role));
        // Also remove the WhatsApp link for this role
        setRoleWhatsappLinks(prev => {
            const updated = { ...prev };
            delete updated[role];
            return updated;
        });
        toast.success(`Role "${role}" removed`, {
            duration: 2000,
            icon: '🗑️',
        });
    };

    const handleAddPredefinedRole = (role: string) => {
        if (availableRoles.includes(role)) {
            toast.error('This role is already added', {
                duration: 2000,
                icon: '⚠️',
            });
            return;
        }
        setAvailableRoles(prev => [...prev, role]);
        toast.success(`Role "${role}" added`, {
            duration: 2000,
            icon: '✅',
        });
    };

    if (loadingSettings) {
        return (
            <div className="flex items-center justify-center p-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-8 h-8 border-4 border-[#8558ed] border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-2 border-[#8558ed]/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl text-[#8558ed]">
                        <MessageSquare className="w-6 h-6" />
                        Application Settings
                    </CardTitle>
                    <CardDescription>
                        Configure application-wide settings that will be displayed to users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Community WhatsApp Link Section */}
                        <div className="space-y-4">
                            <Label htmlFor="communityWhatsappLink" className="flex items-center gap-2 text-lg font-semibold text-[#8558ed]">
                                <Users className="w-5 h-5" />
                                Community WhatsApp Link (Mandatory)
                            </Label>
                            <Input
                                id="communityWhatsappLink"
                                type="url"
                                value={communityWhatsappLink}
                                onChange={(e) => setCommunityWhatsappLink(e.target.value)}
                                placeholder="https://chat.whatsapp.com/..."
                                className="rounded-xl border-2 border-[#8558ed]/20 focus:border-[#8558ed] focus:ring-4 focus:ring-[#8558ed]/10"
                            />
                            <p className="text-sm text-gray-500 flex items-start gap-2">
                                <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    All users must join this WhatsApp community before submitting their profile.
                                </span>
                            </p>
                            {communityWhatsappLink && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 bg-green-50 border border-green-200 rounded-lg"
                                >
                                    <p className="text-sm text-green-800 font-medium mb-1">Preview:</p>
                                    <a
                                        href={communityWhatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-green-600 hover:text-green-700 underline flex items-center gap-1"
                                    >
                                        {communityWhatsappLink}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </motion.div>
                            )}
                        </div>

                        {/* Manage Available Roles Section */}
                        <div className="space-y-4 pt-6 border-t-2 border-[#8558ed]/10">
                            <Label className="flex items-center gap-2 text-lg font-semibold text-[#8558ed]">
                                <Briefcase className="w-5 h-5" />
                                Manage Available Roles
                            </Label>
                            <p className="text-sm text-gray-500 mb-4">
                                Add or remove roles that will be available for applicants to select in their profile form.
                            </p>
                            
                            {/* Add New Role */}
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                                    placeholder="Enter new role name..."
                                    className="rounded-xl border-2 border-[#8558ed]/20 focus:border-[#8558ed] focus:ring-4 focus:ring-[#8558ed]/10"
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddRole}
                                    className="bg-gradient-to-r from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white font-semibold whitespace-nowrap"
                                >
                                    Add Role
                                </Button>
                            </div>

                            {/* Quick Add from Predefined Roles */}
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500">Quick add from common roles:</p>
                                <div className="flex flex-wrap gap-2">
                                    {ROLES.filter(role => !availableRoles.includes(role)).slice(0, 6).map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => handleAddPredefinedRole(role)}
                                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-[#8558ed]/10 text-gray-700 hover:text-[#8558ed] rounded-lg transition-colors border border-gray-300 hover:border-[#8558ed]/30"
                                        >
                                            + {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Current Available Roles */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Current Available Roles ({availableRoles.length})
                                </Label>
                                {availableRoles.length === 0 ? (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                        <p className="text-sm text-yellow-700">No roles added yet. Add roles to make them available for applicants.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-br from-purple-50/50 to-blue-50/30 rounded-lg border border-[#8558ed]/20">
                                        {availableRoles.map((role) => (
                                            <motion.div
                                                key={role}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-[#8558ed]/30 rounded-lg shadow-sm"
                                            >
                                                <span className="text-sm font-medium text-gray-800">{role}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRole(role)}
                                                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                                                    title="Remove role"
                                                >
                                                    ×
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Role-Specific WhatsApp Links Section */}
                        <div className="space-y-4 pt-6 border-t-2 border-[#8558ed]/10">
                            <Label className="flex items-center gap-2 text-lg font-semibold text-[#8558ed]">
                                <Link className="w-5 h-5" />
                                Role-Specific WhatsApp Group Links
                            </Label>
                            <p className="text-sm text-gray-500 mb-4">
                                Configure WhatsApp group links for each available role. Users will see the link next to their selected roles.
                            </p>
                            {availableRoles.length === 0 ? (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                    <p className="text-sm text-gray-600">Add roles above to configure their WhatsApp group links.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2 border-2 border-[#8558ed]/10 rounded-xl">
                                    {availableRoles.map((role) => (
                                        <div key={role} className="space-y-2 p-3 bg-gradient-to-br from-white to-purple-50/20 rounded-lg border border-[#8558ed]/10">
                                            <Label htmlFor={`role-${role}`} className="text-sm font-medium text-gray-700">
                                                {role}
                                            </Label>
                                            <Input
                                                id={`role-${role}`}
                                                type="url"
                                                value={roleWhatsappLinks[role] || ''}
                                                onChange={(e) => handleRoleLinkChange(role, e.target.value)}
                                                placeholder="https://chat.whatsapp.com/..."
                                                className="text-sm rounded-lg border border-[#8558ed]/20 focus:border-[#8558ed] focus:ring-2 focus:ring-[#8558ed]/10"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Announcement Section */}
                        <div className="space-y-4 pt-6 border-t-2 border-[#8558ed]/10">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2 text-lg font-semibold text-[#8558ed]">
                                    <Megaphone className="w-5 h-5" />
                                    Login Page Announcement
                                </Label>
                                <button
                                    type="button"
                                    onClick={() => setShowAnnouncement(!showAnnouncement)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors ${showAnnouncement
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {showAnnouncement ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    {showAnnouncement ? 'Visible' : 'Hidden'}
                                </button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="announcementTitle">Announcement Title</Label>
                                <Input
                                    id="announcementTitle"
                                    value={announcementTitle}
                                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                                    placeholder="e.g., Important Notice, New Rules, etc."
                                    className="rounded-xl border-2 border-[#8558ed]/20 focus:border-[#8558ed] focus:ring-4 focus:ring-[#8558ed]/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="announcementContent">Announcement Content</Label>
                                <div className="flex gap-2 mb-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => insertTag('b')}
                                        className="h-8 w-8 p-0"
                                        title="Bold"
                                    >
                                        <Bold className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => insertTag('i')}
                                        className="h-8 w-8 p-0"
                                        title="Italic"
                                    >
                                        <Italic className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => insertTag('mark')}
                                        className="h-8 w-8 p-0"
                                        title="Highlight"
                                    >
                                        <Highlighter className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => insertTag('ul')}
                                        className="h-8 w-8 p-0"
                                        title="List"
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    id="announcementContent"
                                    value={announcementContent}
                                    onChange={(e) => setAnnouncementContent(e.target.value)}
                                    placeholder="Enter your announcement here..."
                                    rows={6}
                                    className="w-full rounded-xl border-2 border-[#8558ed]/20 focus:border-[#8558ed] focus:ring-4 focus:ring-[#8558ed]/10 p-3 font-mono text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Tip: Select text and click a button to format it.
                                </p>
                            </div>

                            {(announcementTitle || announcementContent) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
                                >
                                    <p className="text-sm font-semibold text-blue-800 mb-2">Preview:</p>
                                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                                        {announcementTitle && (
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">{announcementTitle}</h3>
                                        )}
                                        {announcementContent && (
                                            <div
                                                className="text-gray-700 prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: announcementContent }}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white font-semibold px-6"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {loading ? 'Saving...' : 'Save Settings'}
                                </Button>
                            </motion.div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};
