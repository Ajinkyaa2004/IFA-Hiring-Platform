import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';

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
    const [file, setFile] = useState<File | null>(null);
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
            const res = await fetch('http://localhost:5000/api/question-game/uploads');
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

            const res = await fetch('http://localhost:5000/api/question-game/manual', {
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

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('pdf', file);

        setIsUploading(true);
        try {
            const res = await fetch('http://localhost:5000/api/question-game/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Upload failed');
            }

            toast.success('PDF uploaded and processed successfully!');
            setFile(null);
            fetchUploads();

            // Redirect to the game
            if (res.ok) {
                const data = await res.json();
                const uploadId = data.upload?._id || data._id;
                if (uploadId) {
                    navigate(`/game/quiz/${uploadId}`);
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload PDF');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Quizzes</h1>
                <Button
                    onClick={() => navigate('/admin/create-quiz')}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Image-Based Quiz
                </Button>
            </div>

            {/* Previous Uploads Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Previous Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {uploads.map((upload) => (
                            <div key={upload._id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
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
                                    <Button variant="outline" onClick={() => navigate(`/game/quiz/${upload._id}`)}>
                                        Play Quiz
                                    </Button>
                                    <Button variant="secondary" onClick={() => navigate(`/admin/questions/${upload._id}`)}>
                                        Manage
                                    </Button>
                                    <Button variant="ghost" onClick={() => navigate(`/admin/scores/${upload._id}`)}>
                                        Scores
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={async () => {
                                            if (!confirm('Are you sure you want to delete this quiz?')) return;
                                            try {
                                                const res = await fetch(`http://localhost:5000/api/question-game/upload/${upload._id}`, {
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
                        {uploads.length === 0 && <p className="text-gray-500 text-center py-4">No quizzes found.</p>}
                    </div>
                </CardContent>
            </Card>


            {/* AI Quiz Generation Section */}
            <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-blue-600">✨</span> AI Quiz Generator
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <div className="text-center space-y-2">
                            <p className="text-lg font-medium">Upload a Document</p>
                            <p className="text-sm text-gray-500">
                                Upload a PDF, DOCX, or TXT file and we'll automatically generate a quiz for you.
                            </p>
                        </div>

                        <div className="flex gap-4 items-center w-full max-w-md">
                            <Input
                                type="file"
                                accept=".pdf,.docx,.txt,.md,.xlsx"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="bg-white"
                            />
                            <Button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isUploading ? 'Generating...' : 'Generate Quiz'}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                            Supported formats: PDF, DOCX, XLSX, TXT, MD (Max 10MB)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Manual Quiz Creation Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Create Quiz Manually</CardTitle>
                </CardHeader>
                <CardContent>
                    {!isCreating ? (
                        <div className="text-center py-8 space-y-4">
                            <p className="text-gray-500">Create a new quiz from scratch by adding questions manually.</p>
                            <Button onClick={() => setIsCreating(true)} className="bg-game-purple-600 hover:bg-game-purple-700">
                                <Plus className="w-4 h-4 mr-2" /> Create New Quiz
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Quiz Title</label>
                                <Input
                                    placeholder="e.g., General Knowledge Quiz 1"
                                    value={manualTitle}
                                    onChange={(e) => setManualTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cover Image (Optional)</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                                />
                                <p className="text-xs text-gray-500">Upload an image to display on the quiz card.</p>
                            </div>

                            <div className="space-y-4">
                                {manualQuestions.map((q, qIdx) => (
                                    <Card key={qIdx} className="border border-gray-200">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-medium">Question {qIdx + 1}</h4>
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
                                                    <label className="text-sm font-medium">Options</label>
                                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
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
                                                    <label className="text-xs text-gray-500">Points</label>
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
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Question
                            </Button>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button onClick={handleManualSubmit} disabled={isUploading}>
                                    {isUploading ? 'Saving...' : 'Save & Publish Quiz'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}