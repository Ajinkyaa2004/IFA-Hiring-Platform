import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Zap, Clock } from 'lucide-react';

export const HackathonNotification: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Check if notification should be shown (until Dec 3, 2025)
        const endDate = new Date('2025-12-03T23:59:59');
        const now = new Date();
        
        // Only show if current date is before or on end date
        if (now > endDate) {
            setIsVisible(false);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
            >
                <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1 sm:py-2 pointer-events-auto">
                    <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-lg shadow-xl border border-white/20">
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-20">
                            <motion.div
                                animate={{
                                    backgroundPosition: ['0% 0%', '100% 100%'],
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    repeatType: 'reverse',
                                }}
                                className="w-full h-full"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                    backgroundSize: '30px 30px',
                                }}
                            />
                        </div>

                        <div className="relative flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2.5">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                {/* Animated Icon */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: 'reverse',
                                    }}
                                    className="flex-shrink-0 hidden sm:block"
                                >
                                    <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                </motion.div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                        <h3 className="text-white font-bold text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2">
                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="hidden xs:inline">GAME THEORY HACKATHON SCHEDULE</span>
                                            <span className="xs:hidden">HACKATHON</span>
                                        </h3>
                                        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] sm:text-xs font-semibold border border-white/30">
                                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            Dec 3, 2025
                                        </span>
                                    </div>
                                    <p className="text-white/90 text-xs mt-0.5 hidden sm:block">
                                        Join us for an exciting event! Check your schedule and get ready to compete! 🚀
                                    </p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDismiss}
                                className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 transition-colors"
                                aria-label="Dismiss notification"
                            >
                                <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </motion.button>
                        </div>

                        {/* Animated bottom border */}
                        <motion.div
                            animate={{
                                x: ['-100%', '100%'],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="absolute bottom-0 left-0 w-1/3 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
