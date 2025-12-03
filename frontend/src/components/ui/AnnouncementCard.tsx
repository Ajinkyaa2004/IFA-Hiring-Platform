import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnouncementCardProps {
    title: string;
    content: string;
    onDismiss?: () => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ title, content, onDismiss }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="border-2 border-[#8558ed]/30 bg-gradient-to-r from-[#8558ed]/5 to-blue-500/5 shadow-lg relative">
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Dismiss announcement"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#8558ed]">
                            <Megaphone className="w-5 h-5" />
                            {title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-gray-700 prose prose-sm max-w-none announcement-content"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
};
