import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Image as ImageIcon, ArrowLeft, Save, Minus, Plus } from 'lucide-react';

interface QuestionOption {
    optionText: string;
    optionImageFile?: File;
    optionImagePreview?: string;
    optionImageUrl?: string;
    isCorrect: boolean;
}

interface Question {
    questionText: string;
    questionImageFile?: File;
    questionImagePreview?: string;
    questionImageUrl?: string;
    options: QuestionOption[];
    correctAnswer: string;
    solutionImageFile?: File;
    solutionImagePreview?: string;
    solutionImageUrl?: string;
    points: number;
    category: string;
    difficulty: string;
}

export function QuestionBankEdit() {
    const navigate = useNavigate();
    const { questionId } = useParams();
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestion();
    }, [questionId]);

    const fetchQuestion = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/question-bank/${questionId}`);
            if (!res.ok) throw new Error('Failed to fetch question');
            const data = await res.json();
            
            // Transform the data to match our state structure
            setQuestion({
                questionText: data.questionText || '',
                questionImageUrl: data.questionImageUrl,
                options: data.options.map((opt: any) => ({
                    optionText: opt.optionText || '',
                    optionImageUrl: opt.optionImageUrl,
                    isCorrect: opt.isCorrect
                })),
                correctAnswer: data.correctAnswer || '',
                solutionImageUrl: data.solutionImageUrl,
                points: data.points || 1,
                category: data.category || 'General',
                difficulty: data.difficulty || 'Medium'
            });
        } catch (error) {
            toast.error('Failed to load question');
            console.error(error);
            navigate('/admin/question-bank');
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && question) {
            setQuestion({
                ...question,
                questionImageFile: file,
                questionImagePreview: URL.createObjectURL(file)
            });
        }
    };

    const handleSolutionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && question) {
            setQuestion({
                ...question,
                solutionImageFile: file,
                solutionImagePreview: URL.createObjectURL(file)
            });
        }
    };

    const handleOptionImageChange = (optionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && question) {
            const newOptions = [...question.options];
            newOptions[optionIndex].optionImageFile = file;
            newOptions[optionIndex].optionImagePreview = URL.createObjectURL(file);
            setQuestion({ ...question, options: newOptions });
        }
    };

    const addOption = () => {
        if (!question) return;
        const optionLetter = String.fromCharCode(65 + question.options.length);
        setQuestion({
            ...question,
            options: [...question.options, {
                optionText: `Option ${optionLetter}`,
                isCorrect: false
            }]
        });
    };

    const removeOption = (optionIndex: number) => {
        if (!question || question.options.length <= 2) {
            toast.error('Must have at least 2 options');
            return;
        }
        const newOptions = question.options.filter((_, i) => i !== optionIndex);
        setQuestion({ ...question, options: newOptions });
    };

    const handleSubmit = async () => {
        if (!question) return;

        // Validation
        if (!question.questionText.trim() && !question.questionImageFile && !question.questionImageUrl) {
            toast.error('Please add question text or image');
            return;
        }
        const hasCorrect = question.options.some(opt => opt.isCorrect);
        if (!hasCorrect) {
            toast.error('Please mark at least one correct answer');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            
            const questionData = {
                questionText: question.questionText,
                options: question.options.map(opt => ({
                    optionText: opt.optionText,
                    isCorrect: opt.isCorrect
                })),
                correctAnswer: question.correctAnswer,
                points: question.points,
                category: question.category,
                difficulty: question.difficulty
            };

            formData.append('question', JSON.stringify(questionData));

            // Add images if they exist
            if (question.questionImageFile) {
                formData.append('questionImage', question.questionImageFile);
            }
            if (question.solutionImageFile) {
                formData.append('solutionImage', question.solutionImageFile);
            }
            question.options.forEach((opt, idx) => {
                if (opt.optionImageFile) {
                    formData.append(`optionImage_${idx}`, opt.optionImageFile);
                }
            });

            const res = await fetch(`http://localhost:5000/api/question-bank/${questionId}`, {
                method: 'PUT',
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update question');
            }

            toast.success('Question updated successfully!');
            navigate('/admin/question-bank');

        } catch (error: any) {
            toast.error(error.message || 'Failed to update question');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!question) {
        return <div className="flex justify-center items-center h-screen">Question not found</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/admin/question-bank')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
                    </Button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Edit Question
                    </h1>
                    <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                <Card className="border-2 border-purple-100">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                        <CardTitle className="text-lg">Question Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Question Text/Image */}
                        <div className="space-y-3">
                            <Label>Question Text</Label>
                            <Input
                                value={question.questionText}
                                onChange={(e) => setQuestion({ ...question, questionText: e.target.value })}
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
                                            onChange={handleQuestionImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {(question.questionImagePreview || question.questionImageUrl) && (
                                        <div className="relative">
                                            <img 
                                                src={question.questionImagePreview || `http://localhost:5000${question.questionImageUrl}`} 
                                                alt="Question" 
                                                className="h-32 rounded-lg border-2 border-purple-200" 
                                            />
                                            <button
                                                onClick={() => setQuestion({
                                                    ...question,
                                                    questionImageFile: undefined,
                                                    questionImagePreview: undefined,
                                                    questionImageUrl: undefined
                                                })}
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
                                    onClick={addOption}
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Option
                                </Button>
                            </div>
                            {question.options.map((option, optIdx) => (
                                <div key={optIdx} className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50">
                                    <input
                                        type="radio"
                                        name="correct"
                                        checked={option.isCorrect}
                                        onChange={() => {
                                            const newOptions = question.options.map((o, i) => ({
                                                ...o,
                                                isCorrect: i === optIdx
                                            }));
                                            setQuestion({ ...question, options: newOptions });
                                        }}
                                        className="mt-3"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            value={option.optionText}
                                            onChange={(e) => {
                                                const newOptions = [...question.options];
                                                newOptions[optIdx].optionText = e.target.value;
                                                setQuestion({ ...question, options: newOptions });
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
                                                    onChange={(e) => handleOptionImageChange(optIdx, e)}
                                                    className="hidden"
                                                />
                                            </label>
                                            {(option.optionImagePreview || option.optionImageUrl) && (
                                                <div className="relative">
                                                    <img 
                                                        src={option.optionImagePreview || `http://localhost:5000${option.optionImageUrl}`} 
                                                        alt={`Option ${optIdx + 1}`} 
                                                        className="h-16 rounded border" 
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newOptions = [...question.options];
                                                            delete newOptions[optIdx].optionImageFile;
                                                            delete newOptions[optIdx].optionImagePreview;
                                                            delete newOptions[optIdx].optionImageUrl;
                                                            setQuestion({ ...question, options: newOptions });
                                                        }}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                                                    >
                                                        <X className="w-2 h-2" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {question.options.length > 2 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => removeOption(optIdx)}
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
                                onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })}
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
                                            onChange={handleSolutionImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {(question.solutionImagePreview || question.solutionImageUrl) && (
                                        <div className="relative">
                                            <img 
                                                src={question.solutionImagePreview || `http://localhost:5000${question.solutionImageUrl}`} 
                                                alt="Solution" 
                                                className="h-32 rounded-lg border-2 border-green-200" 
                                            />
                                            <button
                                                onClick={() => setQuestion({
                                                    ...question,
                                                    solutionImageFile: undefined,
                                                    solutionImagePreview: undefined,
                                                    solutionImageUrl: undefined
                                                })}
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
                                    onChange={(e) => setQuestion({ ...question, points: parseInt(e.target.value) || 1 })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select
                                    value={question.category}
                                    onValueChange={(value) => setQuestion({ ...question, category: value })}
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
                                    onValueChange={(value) => setQuestion({ ...question, difficulty: value })}
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
            </div>
        </div>
    );
}
