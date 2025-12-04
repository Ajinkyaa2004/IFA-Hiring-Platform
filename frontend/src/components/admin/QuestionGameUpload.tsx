import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Upload {
    _id: string;
    filename: string;
    status: string;
    stats: {
        totalQuestions: number;
        totalPoints: number;
    };
    createdAt: string;
}

export function QuestionGameUpload() {
    const [uploads, setUploads] = useState<Upload[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Manual Creation State
    const [isCreating, setIsCreating] = useState(false);
    const [manualTitle, setManualTitle] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [manualQuestions, setManualQuestions] = useState([
        {
            text: '',
            options: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ],
            points: 1
        }
    ]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchUploads();
    }, []);

    const fetchUploads = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/question-game/uploads`);
            if (!res.ok) {
                throw new Error('Failed to fetch uploads');
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setUploads(data);
            } else {
                setUploads([]);
                console.error('Received non-array data for uploads:', data);
            }
        } catch (error) {
            console.error('Failed to fetch uploads', error);
            toast.error('Failed to fetch uploads');
            setUploads([]);
        }
    };

    const handleManualSubmit = async () => {
        if (!manualTitle.trim()) {
            toast.error('Please enter a quiz title');
            return;
        }
        if (manualQuestions.some(q => !q.text.trim() || q.options.some(o => !o.text.trim()))) {
            toast.error('Please fill in all question fields');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('title', manualTitle);
            formData.append('questions', JSON.stringify(manualQuestions));
            if (coverImage) {
                formData.append('coverImage', coverImage);
            }

            const res = await fetch(`${API_BASE_URL}/question-game/manual`, {
                method: 'POST',
                body: formData // Browser sets Content-Type to multipart/form-data automatically
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create quiz');
            }

            const data = await res.json();
            toast.success('Quiz created successfully!');

            // Redirect to game
            if (data.upload && data.upload._id) {
                navigate(`/game/quiz/${data.upload._id}`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create quiz');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header with Create Button */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-blue-600">Manage Quizzes</h1>
                    <Button
                        onClick={() => navigate('/admin/create-quiz')}
                        size="lg"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Image-Based Quiz
                    </Button>
                </div>

            {/* Previous Uploads Section */}
            <Card className="border-2 border-gray-200">
                <CardHeader className="bg-game-teal-50">
                    <CardTitle className="text-game-teal-700">Previous Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {uploads.map((upload) => (
                            <div key={upload._id} className="flex justify-between items-center p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                <div>
                                    <p className="font-medium">{upload.filename}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(upload.createdAt).toLocaleDateString()} •
                                        {upload.stats?.totalQuestions || 0} Questions •
                                        <span className={`ml-2 capitalize ${upload.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {upload.status}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => navigate(`/game/quiz/${upload._id}`)}
                                        className="bg-green-500 hover:bg-green-600 text-white border-0"
                                    >
                                        Play Quiz
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => navigate(`/admin/questions/${upload._id}`)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                                    >
                                        Manage
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => navigate(`/admin/scores/${upload._id}`)}
                                        className="hover:bg-gray-200 text-gray-700"
                                    >
                                        Scores
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={async () => {
                                            if (!confirm('Are you sure you want to delete this quiz?')) return;
                                            try {
                                                const res = await fetch(`${API_BASE_URL}/question-game/upload/${upload._id}`, {
                                                    method: 'DELETE'
                                                });
                                                if (res.ok) {
                                                    toast.success('Quiz deleted');
                                                    fetchUploads();
                                                } else {
                                                    const err = await res.json();
                                                    throw new Error(err.error || 'Failed to delete');
                                                }
                                            } catch (err: any) {
                                                toast.error(err.message || 'Could not delete quiz');
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {uploads.length === 0 && <p className="text-gray-500 text-center py-8">No quizzes found.</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Manual Quiz Creation Section */}
            <Card className="border-2 border-gray-200">
                <CardHeader className="bg-game-orange-50">
                    <CardTitle className="text-game-orange-700">Create Quiz Manually</CardTitle>
                </CardHeader>
                <CardContent>
                    {!isCreating ? (
                        <div className="text-center py-8 space-y-4">
                            <p className="text-gray-600">Create a new quiz from scratch by adding questions manually.</p>
                            <Button 
                                onClick={() => setIsCreating(true)} 
                                className="bg-game-orange-500 hover:bg-game-orange-600 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Create New Quiz
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Quiz Title</label>
                                <Input
                                    placeholder="e.g., General Knowledge Quiz 1"
                                    value={manualTitle}
                                    onChange={(e) => setManualTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Cover Image (Optional)</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                                />
                                <p className="text-xs text-gray-500">Upload an image to display on the quiz card.</p>
                            </div>

                            <div className="space-y-4">
                                {manualQuestions.map((q, qIdx) => (
                                    <Card key={qIdx} className="border-2 border-gray-200 bg-game-teal-50">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-game-teal-700">Question {qIdx + 1}</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => {
                                                        const newQ = [...manualQuestions];
                                                        newQ.splice(qIdx, 1);
                                                        setManualQuestions(newQ);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                <Input
                                                    placeholder="Question text"
                                                    value={q.text}
                                                    onChange={(e) => {
                                                        const newQ = [...manualQuestions];
                                                        newQ[qIdx].text = e.target.value;
                                                        setManualQuestions(newQ);
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-sm font-medium text-gray-700">Options</label>
                                                    <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-300">
                                                        Select the radio button to mark the correct answer
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className="flex gap-2 items-center">
                                                            <input
                                                                type="radio"
                                                                name={`correct-${qIdx}`}
                                                                checked={opt.isCorrect}
                                                                onChange={() => {
                                                                    const newQ = [...manualQuestions];
                                                                    newQ[qIdx].options.forEach((o, i) => o.isCorrect = i === oIdx);
                                                                    setManualQuestions(newQ);
                                                                }}
                                                                className="accent-game-teal-500"
                                                            />
                                                            <Input
                                                                placeholder={`Option ${oIdx + 1}`}
                                                                value={opt.text}
                                                                onChange={(e) => {
                                                                    const newQ = [...manualQuestions];
                                                                    newQ[qIdx].options[oIdx].text = e.target.value;
                                                                    setManualQuestions(newQ);
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="w-24">
                                                    <label className="text-xs font-medium text-game-orange-700">Points</label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={q.points}
                                                        onChange={(e) => {
                                                            const newQ = [...manualQuestions];
                                                            newQ[qIdx].points = parseInt(e.target.value) || 1;
                                                            setManualQuestions(newQ);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => setManualQuestions([...manualQuestions, {
                                    text: '',
                                    options: [
                                        { text: '', isCorrect: true },
                                        { text: '', isCorrect: false },
                                        { text: '', isCorrect: false },
                                        { text: '', isCorrect: false }
                                    ],
                                    points: 1
                                }])}
                                className="w-full bg-green-500 hover:bg-green-600 text-white border-0"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Question
                            </Button>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setIsCreating(false)}
                                    className="hover:bg-gray-100 text-gray-700"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleManualSubmit} 
                                    disabled={isUploading}
                                    className="bg-game-orange-500 hover:bg-game-orange-600 text-white"
                                >
                                    {isUploading ? 'Saving...' : 'Save & Publish Quiz'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            </div>
        </div>
    );
}