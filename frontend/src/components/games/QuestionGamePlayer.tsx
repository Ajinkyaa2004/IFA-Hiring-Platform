import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Question {
    _id: string;
    text: string;
    options: { text: string; _id: string }[];
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
            const res = await fetch(`http://localhost:5000/api/question-game/upload/${id}`);
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
                ? `http://localhost:5000/api/question-game/quiz/${id}`
                : `http://localhost:5000/api/question-game/quiz/latest`;

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

    const handleSubmit = async () => {
        // Check if all questions are answered (optional, maybe allow partial submission?)
        if (Object.keys(answers).length < questions.length) {
            toast.warning(`You have answered ${Object.keys(answers).length} out of ${questions.length} questions.`);
            if (!window.confirm("Are you sure you want to submit? Unanswered questions will be marked incorrect.")) {
                return;
            }
        }

        try {
            const formattedAnswers = Object.entries(answers).map(([qId, optIdx]) => ({
                questionId: qId,
                selectedOptionIndex: optIdx
            }));

            const timeSpent = Math.floor((Date.now() - startTime) / 1000);

            const res = await fetch('http://localhost:5000/api/question-game/score', {
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

    if (loading) return <div className="flex justify-center items-center h-screen">Loading Quiz...</div>;
    if (questions.length === 0) return <div className="flex justify-center items-center h-screen">No questions found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {coverImage && (
                    <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-md mb-6">
                        <img
                            src={`http://localhost:5000${coverImage}`}
                            alt="Quiz Cover"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Debug Info */}
                <div className="text-xs text-gray-400 text-center">
                    Debug: Quiz ID: {activeUploadId} | Cover: {coverImage || 'None'}
                </div>

                {isSubmitted && (
                    <Card className="bg-primary/5 border-primary">
                        <CardHeader>
                            <CardTitle className="text-center text-3xl">Quiz Results</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-lg text-gray-600">You scored</p>
                            <p className="text-5xl font-bold text-primary my-4">
                                {score} <span className="text-2xl text-gray-400">/ {maxScore}</span>
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Button variant="outline" onClick={() => {
                                    const firstQuestion = document.getElementById('question-0');
                                    if (firstQuestion) {
                                        firstQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }}>
                                    Review Answers
                                </Button>
                                <Button onClick={() => {
                                    if (onComplete) {
                                        onComplete(score, maxScore);
                                    } else {
                                        navigate(-1);
                                    }
                                }}>
                                    Finish & Save
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {questions.map((q, index) => {
                    const userAnswer = answers[q._id];
                    const correction = corrections.find(c => c.questionId === q._id);
                    const isCorrect = isSubmitted && correction && userAnswer === correction.correctOptionIndex;

                    return (
                        <Card
                            key={q._id}
                            id={`question-${index}`}
                            className={`transition-all ${isSubmitted ? (isCorrect ? 'border-green-500 bg-green-50/30' : 'border-red-500 bg-red-50/30') : ''}`}
                        >
                            <CardHeader className="flex flex-row items-start gap-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                                    {index + 1}
                                </span>
                                <div className="space-y-2 w-full">
                                    <CardTitle className="text-lg leading-relaxed">{q.text}</CardTitle>
                                    {q.imageUrl && (
                                        <img src={q.imageUrl} alt="Question" className="max-h-64 rounded-lg object-contain" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 pl-16">
                                {q.options.map((opt, idx) => {
                                    const isSelected = userAnswer === idx;
                                    const isCorrectOption = isSubmitted && correction?.correctOptionIndex === idx;

                                    let optionClass = "justify-start h-auto py-3 px-4 text-left w-full whitespace-normal ";

                                    if (isSubmitted) {
                                        if (isCorrectOption) optionClass += "bg-green-100 border-green-500 text-green-800 hover:bg-green-100 ";
                                        else if (isSelected && !isCorrectOption) optionClass += "bg-red-100 border-red-500 text-red-800 hover:bg-red-100 ";
                                        else optionClass += "opacity-50 ";
                                    } else {
                                        optionClass += isSelected ? "border-primary bg-primary/5 text-primary " : "hover:bg-gray-50 ";
                                    }

                                    return (
                                        <div key={idx} className="relative">
                                            <Button
                                                variant="outline"
                                                className={optionClass}
                                                onClick={() => handleOptionSelect(q._id, idx)}
                                                disabled={isSubmitted}
                                            >
                                                <span className="mr-3 font-medium opacity-70">{String.fromCharCode(65 + idx)}.</span>
                                                {opt.text}
                                            </Button>
                                            {isSubmitted && isCorrectOption && (
                                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
                                            )}
                                            {isSubmitted && isSelected && !isCorrectOption && (
                                                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 w-5 h-5" />
                                            )}
                                        </div>
                                    );
                                })}

                                {isSubmitted && correction?.explanation && (
                                    <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-100">
                                        <strong>Explanation:</strong> {correction.explanation}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                {!isSubmitted && (
                    <div className="flex justify-end pt-8 pb-20">
                        <Button size="lg" onClick={handleSubmit} className="w-full sm:w-auto px-8">
                            Submit Quiz
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}