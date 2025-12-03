import React from 'react';
import { UnblockMe } from '@/components/games/UnblockMe';

export const UnblockMeDev: React.FC = () => {
  const handleComplete = (score: number, totalMoves: number, failed?: boolean, failureReason?: string) => {
    console.log('Game Completed!', { score, totalMoves, failed, failureReason });
    alert(`Game Over! Score: ${score}, Moves: ${totalMoves}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Unblock Me - Dev Mode</h1>
        <UnblockMe 
            onComplete={handleComplete} 
            timeRemaining={9999} 
            isTrialMode={true} 
        />
    </div>
  );
};
