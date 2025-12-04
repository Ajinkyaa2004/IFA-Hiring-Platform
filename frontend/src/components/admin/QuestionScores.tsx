import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Score {
    _id: string;
    userId: { name: string; email: string } | string;
    score: number;
    maxScore: number;
    completedAt: string;
}

export function QuestionScores() {
    const { uploadId } = useParams();
    const navigate = useNavigate();
    const [scores, setScores] = useState<Score[]>([]);

    useEffect(() => {
        if (uploadId) fetchScores(uploadId);
    }, [uploadId]);

    const fetchScores = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/question-game/scores/${id}`);
            const data = await res.json();
            setScores(data);
        } catch (error) {
            console.error('Failed to fetch scores');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Player Scores</h1>
                <Button variant="outline" onClick={() => navigate('/admin/uploads')}>Back</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {scores.map((s, i) => (
                            <div key={s._id} className="flex justify-between items-center p-4 border-b last:border-0">
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-lg w-8">{i + 1}.</span>
                                    <div>
                                        <p className="font-medium">
                                            {typeof s.userId === 'object' && s.userId ? (s.userId.name || s.userId.email) : 'Guest User'}
                                        </p>
                                        <p className="text-xs text-gray-500">{new Date(s.completedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-primary">{s.score}</span>
                                    <span className="text-gray-400 text-sm"> / {s.maxScore}</span>
                                </div>
                            </div>
                        ))}
                        {scores.length === 0 && <p className="text-center text-gray-500 py-4">No scores recorded yet.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}