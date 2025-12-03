import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Play, Clock, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface Quiz {
    _id: string;
    filename: string;
    originalName: string;
    coverImage?: string;
    totalQuestions: number;
    totalPoints: number;
    createdAt: string;
}

export const QuizSelection: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/question-game/list');
            if (!res.ok) throw new Error('Failed to fetch quizzes');
            const data = await res.json();
            setQuizzes(data);
        } catch (error) {
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-game-purple-700">Available Quizzes</h1>
                <p className="text-gray-600">Select a quiz to start your assessment</p>
            </div>

            {quizzes.length === 0 ? (
                <Card className="text-center p-8">
                    <CardContent>
                        <p className="text-gray-500">No quizzes available at the moment.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quizzes.map((quiz, index) => (
                        <motion.div
                            key={quiz._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-game-purple-200 overflow-hidden">
                                {quiz.coverImage ? (
                                    <div className="h-40 w-full overflow-hidden bg-gray-100">
                                        <img
                                            src={`http://localhost:5000${quiz.coverImage}`}
                                            alt={quiz.originalName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-40 w-full bg-game-purple-50 flex items-center justify-center">
                                        <FileText className="w-16 h-16 text-game-purple-200" />
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl truncate">
                                        {!quiz.coverImage && <FileText className="w-5 h-5 text-game-purple-600 flex-shrink-0" />}
                                        <span className="truncate">{quiz.originalName.replace('.pdf', '')}</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Created on {new Date(quiz.createdAt).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {quiz.totalQuestions} Questions
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Trophy className="w-4 h-4" />
                                            {quiz.totalPoints} Points
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full bg-game-purple-600 hover:bg-game-purple-700"
                                        onClick={() => navigate(`/applicant/game/question-game/${quiz._id}`)}
                                    >
                                        <Play className="w-4 h-4 mr-2" /> Start Quiz
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};