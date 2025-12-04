import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, FileText, Clock, Flag, Award, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_BASE_URL.replace('/api', '');

interface Question {
    _id: string;
    text: string;
    options: { text: string; _id: string; imageUrl?: string }[];
    points: number;
    imageUrl?: string;
}

interface Correction {
    questionId: string;
    correctOptionIndex: number;
    explanation?: string;
}

interface QuestionGamePlayerProps {
    uploadId?: string;
    onComplete?: (score: number, maxScore: number) => void;
}

export function QuestionGamePlayer({ uploadId: propUploadId, onComplete }: QuestionGamePlayerProps = {}) {
    const { uploadId: paramUploadId } = useParams();
    const [activeUploadId, setActiveUploadId] = useState<string | undefined>(propUploadId || paramUploadId);
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<{ [key: string]: number }>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [maxScore, setMaxScore] = useState(0);
    const [corrections, setCorrections] = useState<Correction[]>([]);
    const [loading, setLoading] = useState(true);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());

    const [coverImage, setCoverImage] = useState<string | null>(null);

    useEffect(() => {
        // If activeUploadId is provided, fetch specific quiz. Otherwise, fetch latest.
        if (activeUploadId) {
            fetchQuestions(activeUploadId);
            fetchQuizDetails(activeUploadId);
        } else {
            fetchQuestions();
        }
        setStartTime(Date.now());
    }, [activeUploadId]);

    const fetchQuizDetails = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/question-game/upload/${id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.coverImage) {
                    setCoverImage(data.coverImage);
                }
            }
        } catch (error) {
            console.error("Failed to fetch quiz details", error);
        }
    };

    const fetchQuestions = async (id?: string) => {
        try {
            const url = id
                ? `${API_BASE_URL}/question-game/quiz/${id}`
                : `${API_BASE_URL}/question-game/quiz/latest`;

            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch quiz');

            const data = await res.json();

            // Handle response format difference (latest returns object with questions and uploadId)
            if (data.questions) {
                setQuestions(data.questions);
                if (!id && data.uploadId) {
                    setActiveUploadId(data.uploadId);
                    // Fetch details for the latest quiz too if we just got the ID
                    fetchQuizDetails(data.uploadId);
                }
            } else {
                setQuestions(data);
            }
        } catch (error) {
            toast.error('Failed to load quiz');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId: string, optionIndex: number) => {
        if (isSubmitted) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const submitQuiz = async () => {
        try {
            const formattedAnswers = Object.entries(answers).map(([qId, optIdx]) => ({
                questionId: qId,
                selectedOptionIndex: optIdx
            }));

            const timeSpent = Math.floor((Date.now() - startTime) / 1000);

            const res = await fetch(`${API_BASE_URL}/question-game/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'guest-user', // Replace with real auth
                    uploadId: activeUploadId,
                    answers: formattedAnswers,
                    timeSpent
                })
            });

            if (!res.ok) throw new Error('Failed to submit');

            const result = await res.json();
            setScore(result.score.score);
            setMaxScore(result.score.maxScore);
            setCorrections(result.corrections);
            setIsSubmitted(true);
            toast.success('Quiz Submitted!');

            // if (onComplete) {
            //     onComplete(result.score.score, result.score.maxScore);
            // }

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Submission error', error);
            toast.error('Failed to submit quiz');
        }
    };

    const handleSubmit = async () => {
        // Check if all questions are answered (optional, maybe allow partial submission?)
        if (Object.keys(answers).length < questions.length) {
            toast.warning(`You have answered ${Object.keys(answers).length} out of ${questions.length} questions.`, {
                description: 'Unanswered questions will be marked incorrect.',
                duration: 5000,
                action: {
                    label: 'Submit Anyway',
                    onClick: () => submitQuiz()
                },
            });
            return;
        }

        await submitQuiz();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Quiz...</p>
                </div>
            </div>
        );
    }
    
    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex justify-center items-center">
                <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No questions found.</p>
                </div>
            </div>
        );
    }

    const answeredCount = Object.keys(answers).length;
    const progressPercentage = (answeredCount / questions.length) * 100;
    const bookmarkedCount = bookmarkedQuestions.size;

    // Calculate milestones
    const getMilestone = () => {
        if (progressPercentage === 100) return { text: 'Quiz Complete!', icon: Award, color: 'text-game-teal-600' };
        if (progressPercentage >= 75) return { text: 'Almost There!', icon: Target, color: 'text-game-orange-500' };
        if (progressPercentage >= 50) return { text: 'Halfway Done!', icon: Target, color: 'text-game-purple-500' };
        if (progressPercentage >= 25) return { text: 'Good Start!', icon: Target, color: 'text-blue-500' };
        return null;
    };

    const currentMilestone = getMilestone();

    // Toggle bookmark
    const toggleBookmark = (questionId: string) => {
        setBookmarkedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
                toast.info('Question unflagged for review');
            } else {
                newSet.add(questionId);
                toast.success('Question flagged for review');
            }
            return newSet;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 px-3 sm:px-4">
            {/* Quick Navigation Bar */}
            {!isSubmitted && (
                <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
                >
                    <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-game-teal-600" />
                            <div>
                                <p className="text-xs text-gray-500">Progress</p>
                                <p className="text-sm font-bold text-gray-800">{answeredCount}/{questions.length}</p>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md">
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    className="h-full bg-game-teal-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {bookmarkedCount > 0 && (
                                <button
                                    onClick={() => {
                                        const firstBookmarked = questions.findIndex(q => bookmarkedQuestions.has(q._id));
                                        if (firstBookmarked !== -1) {
                                            const element = document.getElementById(`question-${firstBookmarked}`);
                                            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-game-orange-50 text-game-orange-600 hover:bg-game-orange-100 transition-colors text-sm font-medium"
                                >
                                    <Flag className="w-4 h-4" />
                                    <span>{bookmarkedCount}</span>
                                </button>
                            )}
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                className="bg-game-teal-500 hover:bg-game-teal-600 text-white text-xs"
                            >
                                Submit Quiz
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="max-w-5xl mx-auto" style={{ marginTop: isSubmitted ? '0' : '60px' }}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                        {coverImage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full h-24 sm:h-32 rounded-lg overflow-hidden shadow-md"
                            >
                                <img
                                    src={coverImage?.startsWith('data:') ? coverImage : `${BACKEND_URL}${coverImage}`}
                                    alt="Quiz Cover"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.error('Failed to load cover image');
                                        e.currentTarget.parentElement!.style.display = 'none';
                                    }}
                                />
                            </motion.div>
                        )}

                        {isSubmitted && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Card className="bg-game-teal-500 border-0 shadow-lg">
                                    <CardContent className="py-6 text-center text-white">
                                        <div className="flex items-center justify-center mb-3">
                                            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-bold mb-1">Quiz Complete!</h2>
                                        <p className="text-xs sm:text-sm text-white/80 mb-3">You scored</p>
                                        <p className="text-4xl sm:text-5xl font-bold mb-4">
                                            {score} <span className="text-xl sm:text-2xl text-white/70">/ {maxScore}</span>
                                        </p>
                                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                                            <Button 
                                                variant="secondary" 
                                                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                                                onClick={() => {
                                                    const firstQuestion = document.getElementById('question-0');
                                                    if (firstQuestion) {
                                                        firstQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }
                                                }}
                                            >
                                                Review Answers
                                            </Button>
                                            <Button 
                                                className="bg-white text-purple-600 hover:bg-white/90"
                                                onClick={() => {
                                                    if (onComplete) {
                                                        onComplete(score, maxScore);
                                                    } else {
                                                        navigate(-1);
                                                    }
                                                }}
                                            >
                                                Finish & Save
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {questions.map((q, index) => {
                            const userAnswer = answers[q._id];
                            const correction = corrections.find(c => c.questionId === q._id);
                            const isCorrect = isSubmitted && correction && userAnswer === correction.correctOptionIndex;
                            const isAnswered = answers[q._id] !== undefined;

                            return (
                                <motion.div
                                    key={q._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card
                                        id={`question-${index}`}
                                        className={`transition-all border ${
                                            isSubmitted 
                                                ? isCorrect 
                                                    ? 'border-green-400 bg-green-50' 
                                                    : 'border-red-400 bg-red-50'
                                                : isAnswered
                                                    ? 'border-game-teal-400 bg-white shadow-sm'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <CardHeader className="pb-2 pt-4">
                                            <div className="flex items-start gap-2">
                                                <div className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full shrink-0 font-bold text-xs sm:text-sm ${
                                                    isSubmitted
                                                        ? isCorrect
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-red-500 text-white'
                                                        : isAnswered
                                                            ? 'bg-game-teal-500 text-white'
                                                            : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <CardTitle className="text-sm sm:text-base leading-snug text-gray-800 flex-1">
                                                            {q.text}
                                                        </CardTitle>
                                                        {!isSubmitted && (
                                                            <button
                                                                onClick={() => toggleBookmark(q._id)}
                                                                className={`p-1.5 rounded-md transition-all ${
                                                                    bookmarkedQuestions.has(q._id)
                                                                        ? 'bg-game-orange-100 text-game-orange-600 hover:bg-game-orange-200'
                                                                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                                }`}
                                                                title={bookmarkedQuestions.has(q._id) ? 'Remove flag' : 'Flag for review'}
                                                            >
                                                                <Flag className="w-4 h-4" fill={bookmarkedQuestions.has(q._id) ? 'currentColor' : 'none'} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {q.imageUrl && (
                                                        <div className="rounded overflow-hidden bg-gray-50 p-1">
                                                            <img 
                                                                src={q.imageUrl?.startsWith('data:') ? q.imageUrl : `${BACKEND_URL}${q.imageUrl}`} 
                                                                alt="Question" 
                                                                className="max-h-32 sm:max-h-40 w-full object-contain rounded" 
                                                                onError={(e) => {
                                                                    console.error('Failed to load question image:', q.imageUrl?.substring(0, 50));
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-1.5 pt-0">
                                            {q.options.map((opt, idx) => {
                                                const isSelected = userAnswer === idx;
                                                const isCorrectOption = isSubmitted && correction?.correctOptionIndex === idx;

                                                let optionClass = "justify-start h-auto py-2 px-3 text-left w-full text-xs sm:text-sm transition-all ";

                                                if (isSubmitted) {
                                                    if (isCorrectOption) {
                                                        optionClass += "bg-green-100 border-green-500 text-green-800 hover:bg-green-100 ";
                                                    } else if (isSelected && !isCorrectOption) {
                                                        optionClass += "bg-red-100 border-red-500 text-red-800 hover:bg-red-100 ";
                                                    } else {
                                                        optionClass += "opacity-40 border-gray-200 ";
                                                    }
                                                } else {
                                                    optionClass += isSelected 
                                                        ? "bg-game-teal-50 border-game-teal-400 text-game-teal-900 " 
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 ";
                                                }

                                                return (
                                                    <div key={idx} className="relative">
                                                        <Button
                                                            variant="outline"
                                                            className={optionClass}
                                                            onClick={() => handleOptionSelect(q._id, idx)}
                                                            disabled={isSubmitted}
                                                        >
                                                            <div className="flex items-center gap-2 w-full">
                                                                <span className="font-semibold opacity-70 shrink-0 text-xs">
                                                                    {String.fromCharCode(65 + idx)}.
                                                                </span>
                                                                <div className="flex-1 text-left">
                                                                    {opt.text && <span className="block break-words">{opt.text}</span>}
                                                                    {opt.imageUrl && (
                                                                        <div className="mt-1.5 rounded overflow-hidden bg-gray-50 p-1">
                                                                            <img 
                                                                                src={opt.imageUrl?.startsWith('data:') ? opt.imageUrl : `${BACKEND_URL}${opt.imageUrl}`} 
                                                                                alt={`Option ${String.fromCharCode(65 + idx)}`} 
                                                                                className="max-h-20 sm:max-h-24 w-full object-contain rounded"
                                                                                onError={(e) => {
                                                                                    console.error('Failed to load option image:', opt.imageUrl?.substring(0, 50));
                                                                                    e.currentTarget.style.display = 'none';
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Button>
                                                        {isSubmitted && isCorrectOption && (
                                                            <CheckCircle2 className="absolute right-2 top-2 text-green-600 w-4 h-4" />
                                                        )}
                                                        {isSubmitted && isSelected && !isCorrectOption && (
                                                            <XCircle className="absolute right-2 top-2 text-red-600 w-4 h-4" />
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {isSubmitted && correction?.explanation && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-2 p-2 bg-blue-50 text-blue-900 text-xs rounded border border-blue-200"
                                                >
                                                    <strong className="block mb-0.5 text-xs">💡 Explanation:</strong>
                                                    <span className="text-blue-800 text-xs">{correction.explanation}</span>
                                                </motion.div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}

                        {!isSubmitted && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-center pt-4 pb-6"
                            >
                                <Button 
                                    size="default" 
                                    onClick={handleSubmit} 
                                    className="w-full sm:w-auto px-8 bg-game-teal-500 hover:bg-game-teal-600 text-white"
                                >
                                    Submit Quiz
                                </Button>
                            </motion.div>
                        )}
                    </div>

                    {/* Progress Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-4">
                            {/* Progress Card */}
                            <Card className="border border-gray-200 bg-white shadow-sm">
                                <CardHeader className="pb-2 pt-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-game-teal-600" />
                                        Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-gray-600">Answered</span>
                                            <span className="font-bold text-game-teal-600">
                                                {answeredCount}/{questions.length}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercentage}%` }}
                                                transition={{ duration: 0.5 }}
                                                className="h-full bg-game-teal-500 rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Milestone Achievement */}
                                    {currentMilestone && (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="p-2 bg-gradient-to-r from-game-teal-50 to-game-purple-50 rounded-lg border border-game-teal-200"
                                        >
                                            <div className="flex items-center gap-2">
                                                <currentMilestone.icon className={`w-4 h-4 ${currentMilestone.color}`} />
                                                <span className="text-xs font-semibold text-gray-700">{currentMilestone.text}</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Bookmarked Questions */}
                                    {!isSubmitted && bookmarkedCount > 0 && (
                                        <div className="p-2 bg-game-orange-50 rounded-lg border border-game-orange-200">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <Flag className="w-3.5 h-3.5 text-game-orange-600" />
                                                    <span className="text-xs font-semibold text-game-orange-800">Flagged</span>
                                                </div>
                                                <span className="text-xs font-bold text-game-orange-600">{bookmarkedCount}</span>
                                            </div>
                                            <p className="text-xs text-gray-600">Review these later</p>
                                        </div>
                                    )}

                                    {/* Question Grid */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1.5">Questions</p>
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {questions.map((q, index) => {
                                                const isAnswered = answers[q._id] !== undefined;
                                                const correction = corrections.find(c => c.questionId === q._id);
                                                const isCorrect = isSubmitted && correction && answers[q._id] === correction.correctOptionIndex;
                                                const isBookmarked = bookmarkedQuestions.has(q._id);
                                                
                                                return (
                                                    <motion.button
                                                        key={q._id}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => {
                                                            const element = document.getElementById(`question-${index}`);
                                                            if (element) {
                                                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                            }
                                                        }}
                                                        className={`aspect-square rounded flex items-center justify-center text-xs font-bold transition-all relative ${
                                                            isSubmitted
                                                                ? isCorrect
                                                                    ? 'bg-green-500 text-white'
                                                                    : isAnswered
                                                                        ? 'bg-red-500 text-white'
                                                                        : 'bg-gray-200 text-gray-400'
                                                                : isAnswered
                                                                    ? 'bg-game-teal-500 text-white'
                                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {index + 1}
                                                        {isBookmarked && !isSubmitted && (
                                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-game-orange-500 rounded-full border border-white" />
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="text-xs space-y-1 pt-2 border-t">
                                        {!isSubmitted ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded bg-game-teal-500"></div>
                                                    <span className="text-gray-600">Answered</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded bg-gray-100"></div>
                                                    <span className="text-gray-600">Pending</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded bg-green-500"></div>
                                                    <span className="text-gray-600">Correct</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded bg-red-500"></div>
                                                    <span className="text-gray-600">Incorrect</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Timer Card (if you want to add it) */}
                            {!isSubmitted && (
                                <Card className="border border-gray-200 bg-white shadow-sm">
                                    <CardContent className="py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-game-orange-500 rounded">
                                                <Clock className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Time Elapsed</p>
                                                <p className="text-sm font-bold text-gray-800">
                                                    {Math.floor((Date.now() - startTime) / 60000)}:{String(Math.floor(((Date.now() - startTime) % 60000) / 1000)).padStart(2, '0')}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}