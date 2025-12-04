import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Upload, X, Image as ImageIcon, ArrowLeft, Save, Minus } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface QuestionOption {
    optionText: string;
    optionImageFile?: File;
    optionImagePreview?: string;
    isCorrect: boolean;
}

interface Question {
    questionText: string;
    questionImageFile?: File;
    questionImagePreview?: string;
    options: QuestionOption[];
    correctAnswer: string;
    solutionImageFile?: File;
    solutionImagePreview?: string;
    points: number;
    category: string;
    difficulty: string;
}

export function QuestionBankUpload() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([
        {
            questionText: '',
            options: [
                { optionText: 'Option A', isCorrect: true },
                { optionText: 'Option B', isCorrect: false },
                { optionText: 'Option C', isCorrect: false },
                { optionText: 'Option D', isCorrect: false }
            ],
            correctAnswer: '',
            points: 1,
            category: 'General',
            difficulty: 'Medium'
        }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleQuestionImageChange = (questionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newQuestions = [...questions];
            newQuestions[questionIndex].questionImageFile = file;
            newQuestions[questionIndex].questionImagePreview = URL.createObjectURL(file);
            setQuestions(newQuestions);
        }
    };

    const handleSolutionImageChange = (questionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newQuestions = [...questions];
            newQuestions[questionIndex].solutionImageFile = file;
            newQuestions[questionIndex].solutionImagePreview = URL.createObjectURL(file);
            setQuestions(newQuestions);
        }
    };

    const handleOptionImageChange = (questionIndex: number, optionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newQuestions = [...questions];
            newQuestions[questionIndex].options[optionIndex].optionImageFile = file;
            newQuestions[questionIndex].options[optionIndex].optionImagePreview = URL.createObjectURL(file);
            setQuestions(newQuestions);
        }
    };

    const addOption = (questionIndex: number) => {
        const newQuestions = [...questions];
        const optionLetter = String.fromCharCode(65 + newQuestions[questionIndex].options.length);
        newQuestions[questionIndex].options.push({
            optionText: `Option ${optionLetter}`,
            isCorrect: false
        });
        setQuestions(newQuestions);
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        const newQuestions = [...questions];
        if (newQuestions[questionIndex].options.length <= 2) {
            toast.error('Must have at least 2 options');
            return;
        }
        newQuestions[questionIndex].options.splice(optionIndex, 1);
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            questionText: '',
            options: [
                { optionText: 'Option A', isCorrect: true },
                { optionText: 'Option B', isCorrect: false },
                { optionText: 'Option C', isCorrect: false },
                { optionText: 'Option D', isCorrect: false }
            ],
            correctAnswer: '',
            points: 1,
            category: 'General',
            difficulty: 'Medium'
        }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length === 1) {
            toast.error('Must have at least one question');
            return;
        }
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validation
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText.trim() && !q.questionImageFile) {
                toast.error(`Question ${i + 1}: Please add question text or image`);
                return;
            }
            const hasCorrect = q.options.some(opt => opt.isCorrect);
            if (!hasCorrect) {
                toast.error(`Question ${i + 1}: Please mark at least one correct answer`);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Process questions and collect images
            const questionsData = questions.map((q, qIdx) => {
                return {
                    questionText: q.questionText,
                    options: q.options.map((opt, optIdx) => ({
                        optionText: opt.optionText,
                        isCorrect: opt.isCorrect
                    })),
                    correctAnswer: q.correctAnswer,
                    points: q.points,
                    category: q.category,
                    difficulty: q.difficulty
                };
            });

            formData.append('questions', JSON.stringify(questionsData));

            // Add question images, solution images, and option images
            questions.forEach((q, qIdx) => {
                if (q.questionImageFile) {
                    formData.append(`questionImage_${qIdx}`, q.questionImageFile);
                }
                if (q.solutionImageFile) {
                    formData.append(`solutionImage_${qIdx}`, q.solutionImageFile);
                }
                q.options.forEach((opt, optIdx) => {
                    if (opt.optionImageFile) {
                        formData.append(`optionImage_${qIdx}_${optIdx}`, opt.optionImageFile);
                    }
                });
            });

            const res = await fetch(`${API_BASE_URL}/question-bank/upload`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to upload questions');
            }

            const data = await res.json();
            toast.success(`Successfully added ${data.questions.length} questions to the bank!`);
            navigate('/admin/question-bank');

        } catch (error: any) {
            toast.error(error.message || 'Failed to upload questions');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/admin/question-bank')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
                    </Button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Upload Questions to Bank
                    </h1>
                    <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Uploading...' : 'Upload Questions'}
                    </Button>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-700">
                            💡 <strong>Tip:</strong> Upload 10-20 questions with images and solutions to your question bank. 
                            Later, you can select specific questions (e.g., first 10, last 10) to create quizzes.
                        </p>
                    </CardContent>
                </Card>

                {/* Questions */}
                {questions.map((question, qIdx) => (
                    <Card key={qIdx} className="border-2 border-purple-100">
                        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
                            <CardTitle className="text-lg">Question {qIdx + 1}</CardTitle>
                            {questions.length > 1 && (
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeQuestion(qIdx)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Question Text/Image */}
                            <div className="space-y-3">
                                <Label>Question Text</Label>
                                <Input
                                    value={question.questionText}
                                    onChange={(e) => {
                                        const newQuestions = [...questions];
                                        newQuestions[qIdx].questionText = e.target.value;
                                        setQuestions(newQuestions);
                                    }}
                                    placeholder="Enter question text (optional if using image)"
                                />
                                
                                <div>
                                    <Label>Question Image (Optional)</Label>
                                    <div className="mt-2 flex items-start gap-4">
                                        <label className="cursor-pointer">
                                            <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
                                                <ImageIcon className="w-4 h-4" />
                                                <span className="text-sm">Upload Image</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleQuestionImageChange(qIdx, e)}
                                                className="hidden"
                                            />
                                        </label>
                                        {question.questionImagePreview && (
                                            <div className="relative">
                                                <img src={question.questionImagePreview} alt="Question" className="h-32 rounded-lg border-2 border-purple-200" />
                                                <button
                                                    onClick={() => {
                                                        const newQuestions = [...questions];
                                                        delete newQuestions[qIdx].questionImageFile;
                                                        delete newQuestions[qIdx].questionImagePreview;
                                                        setQuestions(newQuestions);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Answer Options ({question.options.length})</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addOption(qIdx)}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Option
                                    </Button>
                                </div>
                                {question.options.map((option, optIdx) => (
                                    <div key={optIdx} className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50">
                                        <input
                                            type="radio"
                                            name={`correct-${qIdx}`}
                                            checked={option.isCorrect}
                                            onChange={() => {
                                                const newQuestions = [...questions];
                                                newQuestions[qIdx].options.forEach((o, i) => {
                                                    o.isCorrect = i === optIdx;
                                                });
                                                setQuestions(newQuestions);
                                            }}
                                            className="mt-3"
                                        />
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                value={option.optionText}
                                                onChange={(e) => {
                                                    const newQuestions = [...questions];
                                                    newQuestions[qIdx].options[optIdx].optionText = e.target.value;
                                                    setQuestions(newQuestions);
                                                }}
                                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                            />
                                            <div className="flex items-center gap-2">
                                                <label className="cursor-pointer">
                                                    <div className="flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 rounded hover:border-purple-500 transition-colors">
                                                        <ImageIcon className="w-3 h-3" />
                                                        <span>Image</span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleOptionImageChange(qIdx, optIdx, e)}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {option.optionImagePreview && (
                                                    <div className="relative">
                                                        <img src={option.optionImagePreview} alt={`Option ${optIdx + 1}`} className="h-16 rounded border" />
                                                        <button
                                                            onClick={() => {
                                                                const newQuestions = [...questions];
                                                                delete newQuestions[qIdx].options[optIdx].optionImageFile;
                                                                delete newQuestions[qIdx].options[optIdx].optionImagePreview;
                                                                setQuestions(newQuestions);
                                                            }}
                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                                                        >
                                                            <X className="w-2 h-2" />
                                                        </button>
                                                    </div>
                                                )}?
                                            </div>
                                        </div>
                                        {question.options.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => removeOption(qIdx, optIdx)}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Solution */}
                            <div className="space-y-3">
                                <Label>Correct Answer Explanation (Text)</Label>
                                <Input
                                    value={question.correctAnswer}
                                    onChange={(e) => {
                                        const newQuestions = [...questions];
                                        newQuestions[qIdx].correctAnswer = e.target.value;
                                        setQuestions(newQuestions);
                                    }}
                                    placeholder="Explain why this is the correct answer"
                                />
                                
                                <div>
                                    <Label>Solution Image (Optional)</Label>
                                    <div className="mt-2 flex items-start gap-4">
                                        <label className="cursor-pointer">
                                            <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
                                                <Upload className="w-4 h-4" />
                                                <span className="text-sm">Upload Solution</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleSolutionImageChange(qIdx, e)}
                                                className="hidden"
                                            />
                                        </label>
                                        {question.solutionImagePreview && (
                                            <div className="relative">
                                                <img src={question.solutionImagePreview} alt="Solution" className="h-32 rounded-lg border-2 border-green-200" />
                                                <button
                                                    onClick={() => {
                                                        const newQuestions = [...questions];
                                                        delete newQuestions[qIdx].solutionImageFile;
                                                        delete newQuestions[qIdx].solutionImagePreview;
                                                        setQuestions(newQuestions);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Points</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={question.points}
                                        onChange={(e) => {
                                            const newQuestions = [...questions];
                                            newQuestions[qIdx].points = parseInt(e.target.value) || 1;
                                            setQuestions(newQuestions);
                                        }}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <Select
                                        value={question.category}
                                        onValueChange={(value) => {
                                            const newQuestions = [...questions];
                                            newQuestions[qIdx].category = value;
                                            setQuestions(newQuestions);
                                        }}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Math">Math</SelectItem>
                                            <SelectItem value="Science">Science</SelectItem>
                                            <SelectItem value="History">History</SelectItem>
                                            <SelectItem value="Geography">Geography</SelectItem>
                                            <SelectItem value="Logic">Logic</SelectItem>
                                            <SelectItem value="Coding">Coding</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Difficulty</Label>
                                    <Select
                                        value={question.difficulty}
                                        onValueChange={(value) => {
                                            const newQuestions = [...questions];
                                            newQuestions[qIdx].difficulty = value;
                                            setQuestions(newQuestions);
                                        }}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Easy">Easy</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Hard">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Add Question Button */}
                <Button onClick={addQuestion} variant="outline" className="w-full" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Question
                </Button>
            </div>
        </div>
    );
}
