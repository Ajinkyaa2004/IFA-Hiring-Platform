import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Trash2, Save, ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Question {
    _id: string;
    text: string;
    options: { text: string; isCorrect: boolean; _id: string }[];
    points: number;
    explanation?: string;
}

export function QuestionEditor() {
    const { uploadId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (uploadId) fetchQuestions(uploadId);
    }, [uploadId]);

    const fetchQuestions = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/question-game/quiz/${id}?admin=true`);
            const data = await res.json();
            setQuestions(data);
        } catch (error) {
            toast.error('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (question: Question) => {
        try {
            const res = await fetch(`${API_BASE_URL}/question-game/question/${question._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(question)
            });
            if (!res.ok) throw new Error('Failed to update');
            toast.success('Question updated');
        } catch (error) {
            toast.error('Failed to update question');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/question-game/question/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete');
            setQuestions(questions.filter(q => q._id !== id));
            toast.success('Question deleted');
        } catch (error) {
            toast.error('Failed to delete question');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/admin/uploads')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-2xl font-bold">Edit Questions</h1>
            </div>

            {questions.map((q, qIdx) => (
                <Card key={q._id}>
                    <CardHeader className="flex flex-row justify-between items-start">
                        <CardTitle className="text-lg">Question {qIdx + 1}</CardTitle>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(q._id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Question Text</label>
                            <Textarea
                                value={q.text}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                    const newQ = [...questions];
                                    newQ[qIdx].text = e.target.value;
                                    setQuestions(newQ);
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, oIdx) => (
                                <div key={opt._id || oIdx} className="flex gap-2 items-center">
                                    <input
                                        type="radio"
                                        name={`correct-${q._id}`}
                                        checked={opt.isCorrect}
                                        onChange={() => {
                                            const newQ = [...questions];
                                            newQ[qIdx].options.forEach((o, i) => o.isCorrect = i === oIdx);
                                            setQuestions(newQ);
                                        }}
                                    />
                                    <Input
                                        value={opt.text}
                                        onChange={(e) => {
                                            const newQ = [...questions];
                                            newQ[qIdx].options[oIdx].text = e.target.value;
                                            setQuestions(newQ);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Explanation</label>
                            <Textarea
                                value={q.explanation || ''}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                    const newQ = [...questions];
                                    newQ[qIdx].explanation = e.target.value;
                                    setQuestions(newQ);
                                }}
                                placeholder="Explanation for the correct answer..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={() => handleUpdate(q)}>
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}