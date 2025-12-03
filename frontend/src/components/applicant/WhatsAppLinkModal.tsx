import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight, Sparkles } from 'lucide-react';

interface WhatsAppLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    whatsappLink: string;
    gameTitle: string;
    gameNumber: number;
}

export const WhatsAppLinkModal: React.FC<WhatsAppLinkModalProps> = ({
    isOpen,
    onClose,
    whatsappLink,
    gameTitle,
    gameNumber,
}) => {
    const handleWhatsAppClick = () => {
        if (whatsappLink) {
            window.open(whatsappLink, '_blank', 'noopener,noreferrer');
        }
    };

    const getGameColor = () => {
        switch (gameNumber) {
            case 1: return 'orange';
            case 2: return 'purple';
            case 3: return 'teal';
            default: return 'purple';
        }
    };

    const color = getGameColor();
    const isFinalGame = gameNumber === 3;

    const colorClasses = {
        orange: {
            gradient: 'from-orange-500 to-orange-400',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            text: 'text-orange-700',
            button: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
        },
        purple: {
            gradient: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            text: 'text-purple-700',
            button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
        },
        teal: {
            gradient: 'from-teal-500 to-teal-600',
            bg: 'bg-teal-50',
            border: 'border-teal-200',
            text: 'text-teal-700',
            button: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
        },
    };

    const classes = colorClasses[color as keyof typeof colorClasses];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="pointer-events-auto w-full max-w-md"
                        >
                            <div className={`bg-white rounded-2xl shadow-2xl border-2 ${classes.border} overflow-hidden`}>
                                {/* Header with gradient */}
                                <div className={`bg-gradient-to-r ${classes.gradient} p-6 text-white relative overflow-hidden`}>
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 180, 360],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                        className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
                                    />
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, -180, -360],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                        className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"
                                    />
                                    
                                    <div className="relative z-10">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: 'spring' }}
                                            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4"
                                        >
                                            <Sparkles className="w-8 h-8" />
                                        </motion.div>
                                        <h2 className="text-2xl font-bold mb-2">
                                            {isFinalGame ? '🎉 Congratulations!' : '🎮 Game Completed!'}
                                        </h2>
                                        <p className="text-white/90">
                                            You've successfully completed {gameTitle}!
                                        </p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className={`${classes.bg} ${classes.border} border-2 rounded-xl p-4 mb-6`}>
                                        <p className={`${classes.text} font-semibold mb-2 flex items-center gap-2`}>
                                            <MessageCircle className="w-5 h-5" />
                                            {isFinalGame 
                                                ? 'Join our main community group!' 
                                                : `Join Game ${gameNumber} Discussion Group`
                                            }
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            {isFinalGame 
                                                ? 'Connect with other applicants, get updates, and stay informed about next steps.'
                                                : 'Connect with fellow players, share strategies, and discuss your experience!'
                                            }
                                        </p>
                                    </div>

                                    {whatsappLink ? (
                                        <div className="space-y-3">
                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button
                                                    onClick={handleWhatsAppClick}
                                                    className={`w-full bg-gradient-to-r ${classes.button} text-white font-semibold py-6 text-lg shadow-lg`}
                                                >
                                                    <MessageCircle className="w-5 h-5 mr-2" />
                                                    Join WhatsApp Group
                                                </Button>
                                            </motion.div>

                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button
                                                    onClick={onClose}
                                                    variant="outline"
                                                    className="w-full border-2 border-gray-300 hover:bg-gray-50 py-6 text-lg font-medium"
                                                >
                                                    Continue
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            </motion.div>

                                            <p className="text-xs text-center text-gray-500 mt-2">
                                                You can join the group later from your dashboard
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-gray-500 mb-4">
                                                No WhatsApp group link has been set up yet.
                                            </p>
                                            <Button
                                                onClick={onClose}
                                                variant="outline"
                                                className="border-2 border-gray-300 hover:bg-gray-50"
                                            >
                                                Continue
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
