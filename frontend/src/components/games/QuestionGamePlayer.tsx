import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, FileText, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                        {coverImage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full h-32 sm:h-48 md:h-56 rounded-xl overflow-hidden shadow-lg"
                            >
                                <img
                                    src={`http://localhost:5000${coverImage}`}
                                    alt="Quiz Cover"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                        )}

                        {isSubmitted && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Card className="bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 border-0 shadow-xl">
                                    <CardContent className="pt-6 text-center text-white">
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Quiz Complete!</h2>
                                        <p className="text-sm sm:text-base text-white/80 mb-4">You scored</p>
                                        <p className="text-5xl sm:text-6xl font-bold mb-6">
                                            {score} <span className="text-2xl sm:text-3xl text-white/70">/ {maxScore}</span>
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
                                        className={`transition-all border-2 ${
                                            isSubmitted 
                                                ? isCorrect 
                                                    ? 'border-green-400 bg-green-50/50' 
                                                    : 'border-red-400 bg-red-50/50'
                                                : isAnswered
                                                    ? 'border-purple-300 bg-white shadow-md'
                                                    : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-md'
                                        }`}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start gap-3">
                                                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 font-bold text-sm sm:text-base ${
                                                    isSubmitted
                                                        ? isCorrect
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-red-500 text-white'
                                                        : isAnswered
                                                            ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                                                            : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <CardTitle className="text-base sm:text-lg leading-relaxed text-gray-800">
                                                        {q.text}
                                                    </CardTitle>
                                                    {q.imageUrl && (
                                                        <div className="rounded-lg overflow-hidden bg-gray-50 p-2">
                                                            <img 
                                                                src={`http://localhost:5000${q.imageUrl}`} 
                                                                alt="Question" 
                                                                className="max-h-48 sm:max-h-64 w-full object-contain rounded" 
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2 pt-0">
                                            {q.options.map((opt, idx) => {
                                                const isSelected = userAnswer === idx;
                                                const isCorrectOption = isSubmitted && correction?.correctOptionIndex === idx;

                                                let optionClass = "justify-start h-auto py-2.5 sm:py-3 px-3 sm:px-4 text-left w-full text-sm sm:text-base transition-all ";

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
                                                        ? "bg-gradient-to-r from-purple-100 to-blue-100 border-purple-400 text-purple-900 shadow-sm " 
                                                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 ";
                                                }

                                                return (
                                                    <div key={idx} className="relative">
                                                        <Button
                                                            variant="outline"
                                                            className={optionClass}
                                                            onClick={() => handleOptionSelect(q._id, idx)}
                                                            disabled={isSubmitted}
                                                        >
                                                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                                                                <span className="font-semibold opacity-70 shrink-0 text-xs sm:text-sm">
                                                                    {String.fromCharCode(65 + idx)}.
                                                                </span>
                                                                <div className="flex-1 text-left">
                                                                    {opt.text && <span className="block break-words">{opt.text}</span>}
                                                                    {opt.imageUrl && (
                                                                        <div className="mt-2 rounded overflow-hidden bg-gray-50 p-1">
                                                                            <img 
                                                                                src={`http://localhost:5000${opt.imageUrl}`} 
                                                                                alt={`Option ${String.fromCharCode(65 + idx)}`} 
                                                                                className="max-h-24 sm:max-h-32 w-full object-contain rounded"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Button>
                                                        {isSubmitted && isCorrectOption && (
                                                            <CheckCircle2 className="absolute right-2 sm:right-3 top-2 sm:top-3 text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                                                        )}
                                                        {isSubmitted && isSelected && !isCorrectOption && (
                                                            <XCircle className="absolute right-2 sm:right-3 top-2 sm:top-3 text-red-600 w-4 h-4 sm:w-5 sm:h-5" />
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {isSubmitted && correction?.explanation && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-900 text-xs sm:text-sm rounded-lg border border-blue-200"
                                                >
                                                    <strong className="block mb-1">💡 Explanation:</strong>
                                                    <span className="text-blue-800">{correction.explanation}</span>
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
                                className="flex justify-center pt-6 pb-8 sm:pb-12"
                            >
                                <Button 
                                    size="lg" 
                                    onClick={handleSubmit} 
                                    className="w-full sm:w-auto px-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white shadow-lg"
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
                            <Card className="border-2 border-purple-200 bg-white shadow-lg">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-purple-600" />
                                        Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Answered</span>
                                            <span className="font-bold text-purple-600">
                                                {answeredCount}/{questions.length}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercentage}%` }}
                                                transition={{ duration: 0.5 }}
                                                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Question Grid */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Questions</p>
                                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                                            {questions.map((q, index) => {
                                                const isAnswered = answers[q._id] !== undefined;
                                                const correction = corrections.find(c => c.questionId === q._id);
                                                const isCorrect = isSubmitted && correction && answers[q._id] === correction.correctOptionIndex;
                                                
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
                                                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                                            isSubmitted
                                                                ? isCorrect
                                                                    ? 'bg-green-500 text-white shadow-sm'
                                                                    : isAnswered
                                                                        ? 'bg-red-500 text-white shadow-sm'
                                                                        : 'bg-gray-200 text-gray-400'
                                                                : isAnswered
                                                                    ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md'
                                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {index + 1}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="text-xs space-y-1.5 pt-2 border-t">
                                        {!isSubmitted ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-blue-500"></div>
                                                    <span className="text-gray-600">Answered</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded bg-gray-100"></div>
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
                                <Card className="border-2 border-cyan-200 bg-white shadow-lg">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                                                <Clock className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Time Elapsed</p>
                                                <p className="text-lg font-bold text-gray-800">
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