import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Upload, X, Image as ImageIcon, ArrowLeft, Save, Minus } from 'lucide-react';

interface QuestionOption {
    text: string;
    imageFile?: File;
    imagePreview?: string;
    isCorrect: boolean;
}

interface Question {
    text: string;
    imageFile?: File;
    imagePreview?: string;
    options: QuestionOption[];
    points: number;
    explanation: string;
}

export function ManualQuizCreator() {
    const navigate = useNavigate();
    const [quizTitle, setQuizTitle] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string>('');
    const [questions, setQuestions] = useState<Question[]>([
        {
            text: '',
            options: [
                { text: 'Option 1', isCorrect: true },
                { text: 'Option 2', isCorrect: false },
                { text: 'Option 3', isCorrect: false },
                { text: 'Option 4', isCorrect: false }
            ],
            points: 1,
            explanation: ''
        }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleQuestionImageChange = (questionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newQuestions = [...questions];
            newQuestions[questionIndex].imageFile = file;
            newQuestions[questionIndex].imagePreview = URL.createObjectURL(file);
            setQuestions(newQuestions);
        }
    };

    const handleOptionImageChange = (questionIndex: number, optionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newQuestions = [...questions];
            newQuestions[questionIndex].options[optionIndex].imageFile = file;
            newQuestions[questionIndex].options[optionIndex].imagePreview = URL.createObjectURL(file);
            setQuestions(newQuestions);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            text: '',
            options: [
                { text: 'Option 1', isCorrect: true },
                { text: 'Option 2', isCorrect: false },
                { text: 'Option 3', isCorrect: false },
                { text: 'Option 4', isCorrect: false }
            ],
            points: 1,
            explanation: ''
        }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length === 1) {
            toast.error('Quiz must have at least one question');
            return;
        }
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const addOption = (questionIndex: number) => {
        const newQuestions = [...questions];
        const optionNumber = newQuestions[questionIndex].options.length + 1;
        newQuestions[questionIndex].options.push({
            text: `Option ${optionNumber}`,
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

    const handleSubmit = async () => {
        // Validation
        if (!quizTitle.trim()) {
            toast.error('Please enter a quiz title');
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim() && !q.imageFile) {
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
            formData.append('title', quizTitle);

            // Add cover image
            if (coverImage) {
                formData.append('coverImage', coverImage);
            }

            // Process questions and collect images
            const questionsData = questions.map((q, qIdx) => {
                const questionData: any = {
                    text: q.text || `Question ${qIdx + 1}`,
                    points: q.points,
                    explanation: q.explanation,
                    options: q.options.map((opt, optIdx) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        optionImageIndex: opt.imageFile ? `q${qIdx}_opt${optIdx}` : undefined
                    }))
                };

                if (q.imageFile) {
                    questionData.questionImageIndex = `q${qIdx}`;
                }

                return questionData;
            });

            formData.append('questions', JSON.stringify(questionsData));

            // Add question images
            questions.forEach((q, qIdx) => {
                if (q.imageFile) {
                    formData.append(`questionImage_q${qIdx}`, q.imageFile);
                }
                q.options.forEach((opt, optIdx) => {
                    if (opt.imageFile) {
                        formData.append(`optionImage_q${qIdx}_opt${optIdx}`, opt.imageFile);
                    }
                });
            });

            const res = await fetch('http://localhost:5000/api/question-game/manual-with-images', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create quiz');
            }

            const data = await res.json();
            toast.success('Quiz created successfully!');
            navigate(`/game/quiz/${data.upload._id}`);

        } catch (error: any) {
            toast.error(error.message || 'Failed to create quiz');
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
                    <Button variant="ghost" onClick={() => navigate('/admin/uploads')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quizzes
                    </Button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Create Image-Based Quiz
                    </h1>
                    <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Creating...' : 'Create Quiz'}
                    </Button>
                </div>

                {/* Quiz Title & Cover */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quiz Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Quiz Title *</Label>
                            <Input
                                id="title"
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                                placeholder="e.g., Probability & Statistics Quiz"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="cover">Cover Image (Optional)</Label>
                            <div className="mt-2 flex items-start gap-4">
                                <label className="cursor-pointer">
                                    <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
                                        <Upload className="w-4 h-4" />
                                        <span className="text-sm">Choose Image</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverImageChange}
                                        className="hidden"
                                    />
                                </label>
                                {coverPreview && (
                                    <div className="relative">
                                        <img src={coverPreview} alt="Cover" className="h-24 rounded-lg" />
                                        <button
                                            onClick={() => {
                                                setCoverImage(null);
                                                setCoverPreview('');
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
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
                                    value={question.text}
                                    onChange={(e) => {
                                        const newQuestions = [...questions];
                                        newQuestions[qIdx].text = e.target.value;
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
                                        {question.imagePreview && (
                                            <div className="relative">
                                                <img src={question.imagePreview} alt="Question" className="h-32 rounded-lg border-2 border-purple-200" />
                                                <button
                                                    onClick={() => {
                                                        const newQuestions = [...questions];
                                                        delete newQuestions[qIdx].imageFile;
                                                        delete newQuestions[qIdx].imagePreview;
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
                                                value={option.text}
                                                onChange={(e) => {
                                                    const newQuestions = [...questions];
                                                    newQuestions[qIdx].options[optIdx].text = e.target.value;
                                                    setQuestions(newQuestions);
                                                }}
                                                placeholder={`Option ${optIdx + 1}`}
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
                                                {option.imagePreview && (
                                                    <div className="relative">
                                                        <img src={option.imagePreview} alt={`Option ${optIdx + 1}`} className="h-16 rounded border" />
                                                        <button
                                                            onClick={() => {
                                                                const newQuestions = [...questions];
                                                                delete newQuestions[qIdx].options[optIdx].imageFile;
                                                                delete newQuestions[qIdx].options[optIdx].imagePreview;
                                                                setQuestions(newQuestions);
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
                                                onClick={() => removeOption(qIdx, optIdx)}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Points & Explanation */}
                            <div className="grid grid-cols-2 gap-4">
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
                                    <Label>Explanation (Optional)</Label>
                                    <Input
                                        value={question.explanation}
                                        onChange={(e) => {
                                            const newQuestions = [...questions];
                                            newQuestions[qIdx].explanation = e.target.value;
                                            setQuestions(newQuestions);
                                        }}
                                        placeholder="Why is this the correct answer?"
                                        className="mt-1"
                                    />
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
