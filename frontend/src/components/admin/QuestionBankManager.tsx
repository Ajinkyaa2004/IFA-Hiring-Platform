import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Image as ImageIcon, CheckCircle2, Upload as UploadIcon, Trash2, Pencil } from 'lucide-react';

interface BankQuestion {
    _id: string;
    questionText: string;
    questionImageUrl?: string;
    options: {
        optionText: string;
        optionImageUrl?: string;
        isCorrect: boolean;
    }[];
    correctAnswer: string;
    solutionImageUrl?: string;
    points: number;
    category: string;
    difficulty: string;
    usageCount: number;
    createdAt: string;
}

export function QuestionBankManager() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<BankQuestion[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<BankQuestion[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [quizTitle, setQuizTitle] = useState('');
    const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
    const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [questions, searchTerm, categoryFilter, difficultyFilter]);

    const fetchQuestions = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/question-bank/list');
            if (!res.ok) throw new Error('Failed to fetch questions');
            const data = await res.json();
            setQuestions(data.questions);
        } catch (error) {
            toast.error('Failed to load question bank');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...questions];

        if (searchTerm) {
            filtered = filtered.filter(q => 
                q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.correctAnswer.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== 'All') {
            filtered = filtered.filter(q => q.category === categoryFilter);
        }

        if (difficultyFilter !== 'All') {
            filtered = filtered.filter(q => q.difficulty === difficultyFilter);
        }

        setFilteredQuestions(filtered);
    };

    const toggleQuestionSelection = (questionId: string) => {
        const newSelected = new Set(selectedQuestions);
        if (newSelected.has(questionId)) {
            newSelected.delete(questionId);
        } else {
            newSelected.add(questionId);
        }
        setSelectedQuestions(newSelected);
    };

    const selectRange = (type: 'first' | 'last', count: number) => {
        const newSelected = new Set<string>();
        const questionsToSelect = type === 'first' 
            ? filteredQuestions.slice(0, count)
            : filteredQuestions.slice(-count);
        
        questionsToSelect.forEach(q => newSelected.add(q._id));
        setSelectedQuestions(newSelected);
        toast.success(`Selected ${type} ${count} questions`);
    };

    const selectAll = () => {
        const newSelected = new Set(filteredQuestions.map(q => q._id));
        setSelectedQuestions(newSelected);
        toast.success(`Selected all ${filteredQuestions.length} questions`);
    };

    const clearSelection = () => {
        setSelectedQuestions(new Set());
        toast.info('Selection cleared');
    };

    const editQuestion = (questionId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent card selection when clicking edit
        navigate(`/admin/question-bank/edit/${questionId}`);
    };

    const deleteQuestion = async (questionId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent card selection when clicking delete
        
        // Show confirmation toast with action
        toast.warning('Delete this question?', {
            description: 'This action cannot be undone.',
            duration: 5000,
            action: {
                label: 'Delete',
                onClick: async () => {
                    try {
                        const res = await fetch(`http://localhost:5000/api/question-bank/${questionId}`, {
                            method: 'DELETE'
                        });

                        if (!res.ok) {
                            throw new Error('Failed to delete question');
                        }

                        toast.success('Question deleted successfully');
                        // Remove from selected if it was selected
                        const newSelected = new Set(selectedQuestions);
                        newSelected.delete(questionId);
                        setSelectedQuestions(newSelected);
                        // Refresh the list
                        fetchQuestions();
                    } catch (error: any) {
                        toast.error(error.message || 'Failed to delete question');
                        console.error(error);
                    }
                }
            },
        });
    };

    const createQuizFromSelection = async () => {
        if (selectedQuestions.size === 0) {
            toast.error('Please select at least one question');
            return;
        }

        if (!quizTitle.trim()) {
            toast.error('Please enter a quiz title');
            return;
        }

        setIsCreatingQuiz(true);
        try {
            const res = await fetch('http://localhost:5000/api/question-bank/create-quiz-from-selection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: quizTitle,
                    selectedQuestionIds: Array.from(selectedQuestions)
                })
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
            setIsCreatingQuiz(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading Question Bank...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Question Bank
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {questions.length} total questions • {selectedQuestions.size} selected
                        </p>
                    </div>
                    <Button onClick={() => navigate('/admin/question-bank/upload')} size="lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Questions
                    </Button>
                </div>

                {/* Selection Actions */}
                {selectedQuestions.size > 0 && (
                    <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                    <span className="font-medium text-purple-900">
                                        {selectedQuestions.size} question{selectedQuestions.size !== 1 ? 's' : ''} selected
                                    </span>
                                    <Button variant="outline" size="sm" onClick={clearSelection}>
                                        Clear Selection
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter quiz title..."
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                        className="w-64"
                                    />
                                    <Button 
                                        onClick={createQuizFromSelection}
                                        disabled={isCreatingQuiz}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        <UploadIcon className="w-4 h-4 mr-2" />
                                        {isCreatingQuiz ? 'Creating...' : 'Create Quiz'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters & Quick Select */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filters & Quick Select
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Search</Label>
                                <div className="relative mt-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search questions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Categories</SelectItem>
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
                                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Levels</SelectItem>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className="text-sm text-gray-600 mr-2">Quick Select:</span>
                            <Button variant="outline" size="sm" onClick={() => selectRange('first', 5)}>First 5</Button>
                            <Button variant="outline" size="sm" onClick={() => selectRange('first', 10)}>First 10</Button>
                            <Button variant="outline" size="sm" onClick={() => selectRange('last', 5)}>Last 5</Button>
                            <Button variant="outline" size="sm" onClick={() => selectRange('last', 10)}>Last 10</Button>
                            <Button variant="outline" size="sm" onClick={selectAll}>Select All ({filteredQuestions.length})</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQuestions.map((question, index) => (
                        <Card 
                            key={question._id} 
                            className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedQuestions.has(question._id) ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                            }`}
                            onClick={() => toggleQuestionSelection(question._id)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Checkbox 
                                            checked={selectedQuestions.has(question._id)}
                                            onCheckedChange={() => toggleQuestionSelection(question._id)}
                                        />
                                        <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Badge variant="outline" className="text-xs">{question.category}</Badge>
                                        <Badge 
                                            variant={
                                                question.difficulty === 'Easy' ? 'default' :
                                                question.difficulty === 'Medium' ? 'secondary' : 'destructive'
                                            }
                                            className="text-xs"
                                        >
                                            {question.difficulty}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={(e) => editQuestion(question._id, e)}
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={(e) => deleteQuestion(question._id, e)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {question.questionImageUrl ? (
                                    <img 
                                        src={`http://localhost:5000${question.questionImageUrl}`} 
                                        alt="Question" 
                                        className="w-full h-32 object-contain rounded border"
                                    />
                                ) : (
                                    <p className="text-sm line-clamp-2">{question.questionText}</p>
                                )}
                                
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    {question.questionImageUrl && <ImageIcon className="w-3 h-3" />}
                                    {question.options.some(o => o.optionImageUrl) && (
                                        <Badge variant="outline" className="text-xs">Image Options</Badge>
                                    )}
                                    {question.solutionImageUrl && (
                                        <Badge variant="outline" className="text-xs">Solution Image</Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-xs text-gray-500">
                                        Used {question.usageCount}x
                                    </span>
                                    <span className="text-xs font-medium text-purple-600">
                                        {question.points} pt{question.points !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredQuestions.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500">No questions found. Try adjusting your filters or upload new questions.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
