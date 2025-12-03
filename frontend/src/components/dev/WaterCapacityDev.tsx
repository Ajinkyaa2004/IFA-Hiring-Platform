import React from 'react';
import { WaterCapacity } from '@/components/games/WaterCapacity';

export const WaterCapacityDev: React.FC = () => {
    const handleComplete = (score: number, totalSteps: number, failed?: boolean, failureReason?: string) => {
        console.log('Game Completed!', { score, totalSteps, failed, failureReason });
        alert(`Game Over! Score: ${score}, Steps: ${totalSteps}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-center mb-8">Water Capacity - Dev Mode</h1>
            <WaterCapacity
                onComplete={handleComplete}
                timeRemaining={9999}
                isTrialMode={true}
            />
        </div>
    );
};
