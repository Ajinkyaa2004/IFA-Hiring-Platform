import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Sparkles, Zap, Star, Target, Droplet, Droplets, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { useTabSwitchDetection } from '@/hooks/useTabSwitchDetection';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Jug {
  id: number;
  capacity: number;
  current: number;
  color: string;
}

interface Puzzle {
  jugs: { capacity: number; color: string }[];
  target: number;
  targetJug: number;
}

interface WaterCapacityProps {
  onComplete: (score: number, totalSteps: number, failed?: boolean, failureReason?: string) => void;
  timeRemaining: number;
  isTrialMode?: boolean;
}

const TRIAL_PUZZLES: Puzzle[] = [
  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 4, color: 'bg-cyan-400' }], target: 2, targetJug: 1 },
  { jugs: [{ capacity: 2, color: 'bg-blue-400' }, { capacity: 6, color: 'bg-cyan-400' }], target: 4, targetJug: 1 },
  { jugs: [{ capacity: 5, color: 'bg-blue-400' }, { capacity: 7, color: 'bg-cyan-400' }], target: 3, targetJug: 0 },
  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }], target: 4, targetJug: 1 },
];

// Main puzzles with 100 distinct levels generated for challenge
const MAIN_PUZZLES: Puzzle[] = [
  { jugs: [{ capacity: 4, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }, { capacity: 23, color: 'bg-purple-400' }], target: 1, targetJug: 0 },
  { jugs: [{ capacity: 24, color: 'bg-blue-400' }, { capacity: 12, color: 'bg-cyan-400' }, { capacity: 7, color: 'bg-purple-400' }], target: 4, targetJug: 1 },
  { jugs: [{ capacity: 11, color: 'bg-blue-400' }, { capacity: 20, color: 'bg-cyan-400' }, { capacity: 14, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 1, targetJug: 0 },
  { jugs: [{ capacity: 25, color: 'bg-blue-400' }, { capacity: 11, color: 'bg-cyan-400' }, { capacity: 4, color: 'bg-purple-400' }], target: 2, targetJug: 2 },
  { jugs: [{ capacity: 9, color: 'bg-blue-400' }, { capacity: 4, color: 'bg-cyan-400' }, { capacity: 12, color: 'bg-purple-400' }], target: 3, targetJug: 1 },

  { jugs: [{ capacity: 11, color: 'bg-blue-400' }, { capacity: 23, color: 'bg-cyan-400' }, { capacity: 5, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 18, targetJug: 1 },
  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 23, color: 'bg-cyan-400' }], target: 4, targetJug: 1 },
  { jugs: [{ capacity: 12, color: 'bg-blue-400' }, { capacity: 13, color: 'bg-cyan-400' }, { capacity: 7, color: 'bg-purple-400' }], target: 1, targetJug: 2 },
  { jugs: [{ capacity: 9, color: 'bg-blue-400' }, { capacity: 10, color: 'bg-cyan-400' }], target: 4, targetJug: 1 },
  { jugs: [{ capacity: 18, color: 'bg-blue-400' }, { capacity: 11, color: 'bg-cyan-400' }, { capacity: 21, color: 'bg-purple-400' }, { capacity: 6, color: 'bg-pink-400' }], target: 8, targetJug: 0 },
  { jugs: [{ capacity: 24, color: 'bg-blue-400' }, { capacity: 25, color: 'bg-cyan-400' }, { capacity: 21, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 15, targetJug: 0 },
  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 10, color: 'bg-cyan-400' }, { capacity: 19, color: 'bg-purple-400' }, { capacity: 23, color: 'bg-pink-400' }], target: 18, targetJug: 2 },
  { jugs: [{ capacity: 18, color: 'bg-blue-400' }, { capacity: 20, color: 'bg-cyan-400' }], target: 12, targetJug: 1 },
  { jugs: [{ capacity: 21, color: 'bg-blue-400' }, { capacity: 12, color: 'bg-cyan-400' }, { capacity: 4, color: 'bg-purple-400' }, { capacity: 13, color: 'bg-pink-400' }], target: 17, targetJug: 0 },
  { jugs: [{ capacity: 8, color: 'bg-blue-400' }, { capacity: 12, color: 'bg-cyan-400' }, { capacity: 14, color: 'bg-purple-400' }], target: 2, targetJug: 2 },

  { jugs: [{ capacity: 17, color: 'bg-blue-400' }, { capacity: 10, color: 'bg-cyan-400' }, { capacity: 3, color: 'bg-purple-400' }], target: 3, targetJug: 2 },
  { jugs: [{ capacity: 24, color: 'bg-blue-400' }, { capacity: 18, color: 'bg-cyan-400' }, { capacity: 13, color: 'bg-purple-400' }], target: 2, targetJug: 1 },
  { jugs: [{ capacity: 8, color: 'bg-blue-400' }, { capacity: 9, color: 'bg-cyan-400' }, { capacity: 11, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 7, targetJug: 3 },
  { jugs: [{ capacity: 16, color: 'bg-blue-400' }, { capacity: 20, color: 'bg-cyan-400' }, { capacity: 13, color: 'bg-purple-400' }, { capacity: 7, color: 'bg-pink-400' }], target: 12, targetJug: 2 },
  { jugs: [{ capacity: 24, color: 'bg-blue-400' }, { capacity: 17, color: 'bg-cyan-400' }, { capacity: 10, color: 'bg-purple-400' }], target: 8, targetJug: 2 },
  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 4, color: 'bg-cyan-400' }], target: 4, targetJug: 1 },
  { jugs: [{ capacity: 8, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }, { capacity: 14, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 6, targetJug: 2 },
  { jugs: [{ capacity: 11, color: 'bg-blue-400' }, { capacity: 10, color: 'bg-cyan-400' }, { capacity: 18, color: 'bg-purple-400' }], target: 4, targetJug: 0 },
  { jugs: [{ capacity: 11, color: 'bg-blue-400' }, { capacity: 3, color: 'bg-cyan-400' }, { capacity: 23, color: 'bg-purple-400' }], target: 1, targetJug: 1 },
  { jugs: [{ capacity: 20, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }, { capacity: 23, color: 'bg-purple-400' }], target: 11, targetJug: 2 },
  { jugs: [{ capacity: 8, color: 'bg-blue-400' }, { capacity: 16, color: 'bg-cyan-400' }, { capacity: 13, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 12, targetJug: 3 },

  { jugs: [{ capacity: 19, color: 'bg-blue-400' }, { capacity: 7, color: 'bg-cyan-400' }], target: 4, targetJug: 1 },
  { jugs: [{ capacity: 6, color: 'bg-blue-400' }, { capacity: 7, color: 'bg-cyan-400' }], target: 4, targetJug: 0 },
  { jugs: [{ capacity: 17, color: 'bg-blue-400' }, { capacity: 20, color: 'bg-cyan-400' }, { capacity: 9, color: 'bg-purple-400' }], target: 14, targetJug: 0 },
  { jugs: [{ capacity: 10, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }, { capacity: 14, color: 'bg-purple-400' }], target: 1, targetJug: 0 },
  { jugs: [{ capacity: 13, color: 'bg-blue-400' }, { capacity: 21, color: 'bg-cyan-400' }, { capacity: 14, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 12, targetJug: 1 },
  { jugs: [{ capacity: 20, color: 'bg-blue-400' }, { capacity: 22, color: 'bg-cyan-400' }], target: 8, targetJug: 0 },
  { jugs: [{ capacity: 12, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }], target: 8, targetJug: 0 },
  { jugs: [{ capacity: 24, color: 'bg-blue-400' }, { capacity: 19, color: 'bg-cyan-400' }, { capacity: 6, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 2, targetJug: 2 },
  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 20, color: 'bg-cyan-400' }, { capacity: 21, color: 'bg-purple-400' }], target: 8, targetJug: 1 },

  { jugs: [{ capacity: 8, color: 'bg-blue-400' }, { capacity: 25, color: 'bg-cyan-400' }, { capacity: 20, color: 'bg-purple-400' }, { capacity: 12, color: 'bg-pink-400' }], target: 4, targetJug: 2 },
  { jugs: [{ capacity: 10, color: 'bg-blue-400' }, { capacity: 20, color: 'bg-cyan-400' }, { capacity: 6, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 9, targetJug: 0 },
  { jugs: [{ capacity: 16, color: 'bg-blue-400' }, { capacity: 18, color: 'bg-cyan-400' }, { capacity: 4, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 17, targetJug: 1 },

  { jugs: [{ capacity: 17, color: 'bg-blue-400' }, { capacity: 6, color: 'bg-cyan-400' }], target: 3, targetJug: 0 },

  { jugs: [{ capacity: 17, color: 'bg-blue-400' }, { capacity: 20, color: 'bg-cyan-400' }, { capacity: 6, color: 'bg-purple-400' }, { capacity: 22, color: 'bg-pink-400' }], target: 3, targetJug: 0 },

  { jugs: [{ capacity: 20, color: 'bg-blue-400' }, { capacity: 19, color: 'bg-cyan-400' }, { capacity: 4, color: 'bg-purple-400' }, { capacity: 5, color: 'bg-pink-400' }], target: 18, targetJug: 0 },
  { jugs: [{ capacity: 21, color: 'bg-blue-400' }, { capacity: 15, color: 'bg-cyan-400' }], target: 3, targetJug: 0 },
  { jugs: [{ capacity: 12, color: 'bg-blue-400' }, { capacity: 20, color: 'bg-cyan-400' }, { capacity: 7, color: 'bg-purple-400' }], target: 5, targetJug: 2 },
  { jugs: [{ capacity: 8, color: 'bg-blue-400' }, { capacity: 4, color: 'bg-cyan-400' }, { capacity: 6, color: 'bg-purple-400' }], target: 6, targetJug: 0 },
  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 11, color: 'bg-cyan-400' }, { capacity: 12, color: 'bg-purple-400' }, { capacity: 6, color: 'bg-pink-400' }], target: 5, targetJug: 3 },
  { jugs: [{ capacity: 9, color: 'bg-blue-400' }, { capacity: 19, color: 'bg-cyan-400' }, { capacity: 21, color: 'bg-purple-400' }, { capacity: 14, color: 'bg-pink-400' }], target: 17, targetJug: 1 },
  { jugs: [{ capacity: 18, color: 'bg-blue-400' }, { capacity: 19, color: 'bg-cyan-400' }], target: 14, targetJug: 1 },
  { jugs: [{ capacity: 10, color: 'bg-blue-400' }, { capacity: 12, color: 'bg-cyan-400' }], target: 12, targetJug: 1 },
  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }, { capacity: 7, color: 'bg-purple-400' }], target: 3, targetJug: 0 },
  { jugs: [{ capacity: 10, color: 'bg-blue-400' }, { capacity: 3, color: 'bg-cyan-400' }, { capacity: 5, color: 'bg-purple-400' }], target: 8, targetJug: 0 },

  { jugs: [{ capacity: 18, color: 'bg-blue-400' }, { capacity: 3, color: 'bg-cyan-400' }, { capacity: 15, color: 'bg-purple-400' }, { capacity: 7, color: 'bg-pink-400' }], target: 11, targetJug: 2 },
  { jugs: [{ capacity: 18, color: 'bg-blue-400' }, { capacity: 21, color: 'bg-cyan-400' }, { capacity: 5, color: 'bg-purple-400' }], target: 15, targetJug: 0 },
  { jugs: [{ capacity: 11, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }, { capacity: 14, color: 'bg-purple-400' }], target: 3, targetJug: 1 },
  { jugs: [{ capacity: 9, color: 'bg-blue-400' }, { capacity: 19, color: 'bg-cyan-400' }, { capacity: 12, color: 'bg-purple-400' }], target: 4, targetJug: 1 },
  { jugs: [{ capacity: 25, color: 'bg-blue-400' }, { capacity: 13, color: 'bg-cyan-400' }, { capacity: 9, color: 'bg-purple-400' }], target: 19, targetJug: 0 },
  { jugs: [{ capacity: 8, color: 'bg-blue-400' }, { capacity: 4, color: 'bg-cyan-400' }, { capacity: 13, color: 'bg-purple-400' }], target: 1, targetJug: 1 },
  { jugs: [{ capacity: 13, color: 'bg-blue-400' }, { capacity: 6, color: 'bg-cyan-400' }, { capacity: 23, color: 'bg-purple-400' }], target: 5, targetJug: 1 },
  { jugs: [{ capacity: 9, color: 'bg-blue-400' }, { capacity: 23, color: 'bg-cyan-400' }], target: 11, targetJug: 1 },
  { jugs: [{ capacity: 17, color: 'bg-blue-400' }, { capacity: 20, color: 'bg-cyan-400' }, { capacity: 6, color: 'bg-purple-400' }], target: 7, targetJug: 1 },
  { jugs: [{ capacity: 18, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }, { capacity: 14, color: 'bg-purple-400' }], target: 2, targetJug: 1 },
  { jugs: [{ capacity: 24, color: 'bg-blue-400' }, { capacity: 17, color: 'bg-cyan-400' }, { capacity: 6, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 15, targetJug: 3 },
  { jugs: [{ capacity: 25, color: 'bg-blue-400' }, { capacity: 13, color: 'bg-cyan-400' }, { capacity: 7, color: 'bg-purple-400' }], target: 1, targetJug: 0 },
  { jugs: [{ capacity: 5, color: 'bg-blue-400' }, { capacity: 14, color: 'bg-cyan-400' }, { capacity: 7, color: 'bg-purple-400' }], target: 3, targetJug: 1 },

  { jugs: [{ capacity: 13, color: 'bg-blue-400' }, { capacity: 21, color: 'bg-cyan-400' }], target: 2, targetJug: 0 },
  { jugs: [{ capacity: 18, color: 'bg-blue-400' }, { capacity: 7, color: 'bg-cyan-400' }, { capacity: 15, color: 'bg-purple-400' }, { capacity: 23, color: 'bg-pink-400' }], target: 22, targetJug: 3 },
  { jugs: [{ capacity: 24, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }, { capacity: 22, color: 'bg-purple-400' }], target: 17, targetJug: 2 },
  { jugs: [{ capacity: 16, color: 'bg-blue-400' }, { capacity: 18, color: 'bg-cyan-400' }, { capacity: 21, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 5, targetJug: 0 },
  { jugs: [{ capacity: 16, color: 'bg-blue-400' }, { capacity: 11, color: 'bg-cyan-400' }, { capacity: 22, color: 'bg-purple-400' }], target: 14, targetJug: 0 },
  { jugs: [{ capacity: 13, color: 'bg-blue-400' }, { capacity: 23, color: 'bg-cyan-400' }], target: 3, targetJug: 0 },
  { jugs: [{ capacity: 16, color: 'bg-blue-400' }, { capacity: 19, color: 'bg-cyan-400' }, { capacity: 15, color: 'bg-purple-400' }], target: 15, targetJug: 1 },
  { jugs: [{ capacity: 25, color: 'bg-blue-400' }, { capacity: 11, color: 'bg-cyan-400' }, { capacity: 4, color: 'bg-purple-400' }, { capacity: 20, color: 'bg-pink-400' }], target: 6, targetJug: 0 },
  { jugs: [{ capacity: 15, color: 'bg-blue-400' }, { capacity: 22, color: 'bg-cyan-400' }, { capacity: 23, color: 'bg-purple-400' }], target: 10, targetJug: 0 },
  { jugs: [{ capacity: 5, color: 'bg-blue-400' }, { capacity: 6, color: 'bg-cyan-400' }], target: 5, targetJug: 0 },
  { jugs: [{ capacity: 8, color: 'bg-blue-400' }, { capacity: 24, color: 'bg-cyan-400' }, { capacity: 11, color: 'bg-purple-400' }, { capacity: 7, color: 'bg-pink-400' }], target: 7, targetJug: 2 },

  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }], target: 2, targetJug: 0 },
  { jugs: [{ capacity: 12, color: 'bg-blue-400' }, { capacity: 13, color: 'bg-cyan-400' }], target: 10, targetJug: 0 },
  { jugs: [{ capacity: 9, color: 'bg-blue-400' }, { capacity: 13, color: 'bg-cyan-400' }, { capacity: 5, color: 'bg-purple-400' }, { capacity: 15, color: 'bg-pink-400' }], target: 13, targetJug: 1 },
  { jugs: [{ capacity: 10, color: 'bg-blue-400' }, { capacity: 11, color: 'bg-cyan-400' }, { capacity: 20, color: 'bg-purple-400' }, { capacity: 14, color: 'bg-pink-400' }], target: 7, targetJug: 2 },
  { jugs: [{ capacity: 17, color: 'bg-blue-400' }, { capacity: 20, color: 'bg-cyan-400' }, { capacity: 5, color: 'bg-purple-400' }, { capacity: 22, color: 'bg-pink-400' }], target: 9, targetJug: 1 },
  { jugs: [{ capacity: 14, color: 'bg-blue-400' }, { capacity: 22, color: 'bg-cyan-400' }], target: 8, targetJug: 0 },

  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 20, color: 'bg-cyan-400' }, { capacity: 13, color: 'bg-purple-400' }, { capacity: 7, color: 'bg-pink-400' }], target: 6, targetJug: 3 },
  { jugs: [{ capacity: 10, color: 'bg-blue-400' }, { capacity: 4, color: 'bg-cyan-400' }, { capacity: 5, color: 'bg-purple-400' }], target: 10, targetJug: 0 },
  { jugs: [{ capacity: 8, color: 'bg-blue-400' }, { capacity: 11, color: 'bg-cyan-400' }, { capacity: 23, color: 'bg-purple-400' }], target: 10, targetJug: 1 },
  { jugs: [{ capacity: 20, color: 'bg-blue-400' }, { capacity: 23, color: 'bg-cyan-400' }, { capacity: 21, color: 'bg-purple-400' }, { capacity: 7, color: 'bg-pink-400' }], target: 13, targetJug: 1 },
  { jugs: [{ capacity: 8, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }, { capacity: 7, color: 'bg-purple-400' }], target: 1, targetJug: 2 },

  { jugs: [{ capacity: 24, color: 'bg-blue-400' }, { capacity: 7, color: 'bg-cyan-400' }], target: 4, targetJug: 0 },
  { jugs: [{ capacity: 8, color: 'bg-blue-400' }, { capacity: 19, color: 'bg-cyan-400' }, { capacity: 22, color: 'bg-purple-400' }, { capacity: 14, color: 'bg-pink-400' }], target: 4, targetJug: 0 },
  { jugs: [{ capacity: 10, color: 'bg-blue-400' }, { capacity: 14, color: 'bg-cyan-400' }], target: 8, targetJug: 1 },
];

export const WaterCapacity: React.FC<WaterCapacityProps> = ({ onComplete, timeRemaining, isTrialMode = false }) => {
  const navigate = useNavigate();
  const [jugs, setJugs] = useState<Jug[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [steps, setSteps] = useState(0);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [puzzleSteps, setPuzzleSteps] = useState<number[]>([]);
  const [puzzleScores, setPuzzleScores] = useState<number[]>([]);

  // Randomize the puzzle order for each game session
  const puzzles = useMemo(() => {
    const puzzleArray = isTrialMode ? TRIAL_PUZZLES : MAIN_PUZZLES;

    // Fisher-Yates shuffle algorithm
    const shuffled = [...puzzleArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [isTrialMode]);

  const activePuzzle = useMemo(
    () => (puzzles.length > 0 ? puzzles[currentPuzzle % puzzles.length] : null),
    [puzzles, currentPuzzle]
  );

  // Tab switch detection - only enabled when not in trial mode
  useTabSwitchDetection({
    maxViolations: 3,
    enabled: !isTrialMode,
    onDisqualified: () => {
      // Mark as failed and navigate to assessment page
      const finalScore = calculateTotalScore();
      onComplete(finalScore, totalSteps, true, 'Disqualified due to tab switching violations');
      navigate('/applicant/assessment');
    },
  });

  const initializePuzzle = useCallback((puzzleIndex: number) => {
    if (puzzles.length === 0) {
      setJugs([]);
      return;
    }

    const puzzle = puzzles[puzzleIndex % puzzles.length];
    const newJugs: Jug[] = puzzle.jugs.map((jug, index) => ({
      id: index,
      capacity: jug.capacity,
      current: 0,
      color: jug.color,
    }));
    setJugs(newJugs);
    setSteps(0);
  }, [puzzles]);

  useEffect(() => {
    setCurrentPuzzle(0);
    setPuzzlesCompleted(0);
    setSteps(0);
    setTotalSteps(0);
    setScore(0);
    setPuzzleSteps([]);
    setPuzzleScores([]);
  }, [isTrialMode]);

  useEffect(() => {
    initializePuzzle(currentPuzzle);
  }, [currentPuzzle, initializePuzzle]);

  // Scoring calculation functions
  const calculatePuzzleScore = useCallback((puzzleIndex: number, stepsUsed: number) => {
    if (!puzzles[puzzleIndex]) return 0;

    const puzzle = puzzles[puzzleIndex];
    const numberOfJugs = puzzle.jugs.length;

    // Base score per puzzle
    const baseScore = 120;

    // Complexity bonus: more jugs = higher multiplier
    const complexityBonus = (numberOfJugs - 2) * 30; // +30 points per jug above 2

    // Estimate optimal steps (heuristic based on jugs and capacities)
    const avgCapacity = puzzle.jugs.reduce((sum, j) => sum + j.capacity, 0) / numberOfJugs;
    const optimalSteps = Math.ceil(numberOfJugs * 2 + Math.log2(avgCapacity));

    // Efficiency bonus: 60 points for solving within optimal steps
    const efficiencyBonus = stepsUsed <= optimalSteps ? 60 : 0;

    // Penalty: -8 points per extra step beyond optimal
    const excessSteps = Math.max(0, stepsUsed - optimalSteps);
    const stepPenalty = excessSteps * 8;

    const puzzleScore = baseScore + complexityBonus + efficiencyBonus - stepPenalty;
    return Math.max(Math.round(puzzleScore), 20); // Minimum 20 points per puzzle
  }, [puzzles]);

  const calculateTotalScore = useCallback(() => {
    const totalPuzzleScore = puzzleScores.reduce((sum, s) => sum + s, 0);

    // Completion bonus for finishing all puzzles
    const completionBonus = puzzlesCompleted >= puzzles.length ? 300 : 0;

    return totalPuzzleScore + completionBonus;
  }, [puzzleScores, puzzlesCompleted, puzzles.length]);

  useEffect(() => {
    if (timeRemaining === 0 && !isTrialMode) {
      const finalScore = calculateTotalScore();
      onComplete(finalScore, totalSteps);
    }
  }, [timeRemaining, totalSteps, onComplete, isTrialMode, calculateTotalScore]);

  useEffect(() => {
    if (!activePuzzle) {
      return;
    }

    const targetJug = jugs[activePuzzle.targetJug];

    if (targetJug && targetJug.current === activePuzzle.target) {
      // Calculate score for this puzzle
      const puzzleScore = calculatePuzzleScore(currentPuzzle, steps);
      const newPuzzleSteps = [...puzzleSteps, steps];
      const newPuzzleScores = [...puzzleScores, puzzleScore];

      setPuzzleSteps(newPuzzleSteps);
      setPuzzleScores(newPuzzleScores);
      setScore(newPuzzleScores.reduce((sum, s) => sum + s, 0));

      setShowSuccess(true);
      setTimeout(() => {
        setPuzzlesCompleted(prev => prev + 1);
        setCurrentPuzzle(prev => prev + 1);
        setShowSuccess(false);
      }, 1500);
    }
  }, [jugs, activePuzzle, currentPuzzle, steps, puzzleSteps, puzzleScores, calculatePuzzleScore]);

  const fillJug = (jugId: number) => {
    const newJugs = jugs.map(jug =>
      jug.id === jugId ? { ...jug, current: jug.capacity } : jug
    );
    setJugs(newJugs);
    setSteps(prev => prev + 1);
    setTotalSteps(prev => prev + 1);
  };

  const emptyJug = (jugId: number) => {
    const newJugs = jugs.map(jug =>
      jug.id === jugId ? { ...jug, current: 0 } : jug
    );
    setJugs(newJugs);
    setSteps(prev => prev + 1);
    setTotalSteps(prev => prev + 1);
  };

  const pourJug = (fromId: number, toId: number) => {
    const fromJug = jugs[fromId];
    const toJug = jugs[toId];

    if (fromJug.current === 0 || toJug.current === toJug.capacity) return;

    const amountToPour = Math.min(fromJug.current, toJug.capacity - toJug.current);

    const newJugs = jugs.map(jug => {
      if (jug.id === fromId) {
        return { ...jug, current: jug.current - amountToPour };
      } else if (jug.id === toId) {
        return { ...jug, current: jug.current + amountToPour };
      }
      return jug;
    });

    setJugs(newJugs);
    setSteps(prev => prev + 1);
    setTotalSteps(prev => prev + 1);
  };

  const resetPuzzle = () => {
    initializePuzzle(currentPuzzle);
  };

  if (!activePuzzle) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 relative overflow-hidden"
    >
      {/* Animated Background Orbs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 bg-[#8558ed]/20 rounded-full blur-3xl top-10 -left-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-80 h-80 bg-[#b18aff]/20 rounded-full blur-3xl bottom-10 -right-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute w-72 h-72 bg-[#8558ed]/15 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Floating Icons */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 pointer-events-none hidden sm:block"
      >
        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#8558ed]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-32 right-16 pointer-events-none hidden sm:block"
      >
        <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-[#b18aff]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 15, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-24 left-20 pointer-events-none hidden sm:block"
      >
        <Star className="w-5 h-5 sm:w-7 sm:h-7 text-[#8558ed]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 18, 0],
          rotate: [0, -12, 0],
        }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-32 right-24 pointer-events-none hidden sm:block"
      >
        <Target className="w-7 h-7 sm:w-9 sm:h-9 text-[#b18aff]/30" />
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-4 sm:mb-6 lg:mb-8"
      >
        <motion.h1
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8558ed] via-[#b18aff] to-[#8558ed] 
           animate-gradient-x drop-shadow-[0_0_25px_rgba(133,88,237,0.3)] tracking-tight mb-2 flex items-center justify-center gap-2 sm:gap-3"
        >
          <Droplets className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#8558ed]" />
          <span className="hidden sm:inline">Water Capacity Quest</span>
          <span className="sm:hidden">Water Capacity</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs sm:text-sm lg:text-base text-[#8558ed]/80 font-medium flex items-center justify-center gap-2"
        >
          <Droplet className="w-4 h-4 sm:w-5 sm:h-5" />
          Measure the exact amount of water!
        </motion.p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 justify-center w-full max-w-4xl px-2"
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 shadow-lg shadow-[#8558ed]/10"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-tr from-[#8558ed] to-[#b18aff] w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-[10px] sm:text-xs text-[#030303]/60 font-medium">Puzzle</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#8558ed]">{currentPuzzle + 1}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 shadow-lg shadow-[#8558ed]/10"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-tr from-green-500 to-emerald-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
            >
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-[10px] sm:text-xs text-[#030303]/60 font-medium">Done</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{puzzlesCompleted}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 shadow-lg shadow-[#8558ed]/10"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-tr from-blue-500 to-cyan-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
            >
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-[10px] sm:text-xs text-[#030303]/60 font-medium">Steps</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{steps}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 shadow-lg shadow-[#8558ed]/10"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-tr from-yellow-500 to-orange-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-[10px] sm:text-xs text-[#030303]/60 font-medium">Score</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{score}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-3 sm:mb-4 px-2"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl shadow-green-500/30 flex items-center gap-2 sm:gap-3"
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </motion.span>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold">Puzzle Solved!</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Board and Instructions Side by Side */}
      <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6 lg:gap-8 justify-center w-full max-w-6xl px-2">
        {/* Instructions - Left Side */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full lg:w-64 order-2 lg:order-1"
        >
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-[#8558ed]/10 lg:sticky lg:top-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#8558ed]" />
              <h3 className="text-base sm:text-lg font-bold text-[#8558ed]">How to Play</h3>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-[#030303]/70">
              <p className="flex items-center gap-2">
                <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-[#8558ed] flex-shrink-0" />
                <span><strong>Fill</strong> jugs to their capacity</span>
              </p>
              <p className="flex items-center gap-2">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-[#8558ed] flex-shrink-0" />
                <span><strong>Empty</strong> jugs completely</span>
              </p>
              <p className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#8558ed] flex-shrink-0" />
                <span><strong>Pour</strong> water between jugs</span>
              </p>
              <p className="flex items-center gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#8558ed] flex-shrink-0" />
                <span>Reach the <strong>exact target</strong> amount!</span>
              </p>
            </div>
          </div>
        </motion.div >

        {/* Game Board - Right Side */}
        < motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-[#8558ed]/20 order-1 lg:order-2 w-full lg:w-auto overflow-x-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-[#8558ed]/10 to-[#b18aff]/10 rounded-xl sm:rounded-2xl border-2 border-[#8558ed]/20"
          >
            <p className="text-sm sm:text-base lg:text-lg font-bold text-[#030303] flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#8558ed]" />
              <span className="hidden sm:inline">Goal: Get exactly</span>
              <span className="sm:hidden">Get</span>
              <span className="text-[#8558ed] text-2xl sm:text-3xl mx-1 sm:mx-2">{activePuzzle.target}L</span>
              <span>in Jug {activePuzzle.targetJug + 1}</span>
            </p>
          </motion.div>

          <div className="flex justify-center gap-4 sm:gap-8 lg:gap-12 flex-wrap">
            {jugs.map((jug, index) => (
              <motion.div
                key={jug.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
                className="flex flex-col items-center space-y-3 sm:space-y-4"
              >
                <div className="text-base sm:text-lg font-bold text-[#8558ed]">Jug {index + 1}</div>

                {/* Jug visualization */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-20 h-40 sm:w-24 sm:h-48 lg:w-28 lg:h-56 border-3 sm:border-4 border-[#8558ed] rounded-b-xl sm:rounded-b-2xl bg-gradient-to-b from-white/80 to-gray-100/80 overflow-hidden shadow-xl"
                >
                  <motion.div
                    className={`absolute bottom-0 w-full ${jug.color} transition-all duration-500`}
                    style={{ height: `${(jug.current / jug.capacity) * 100}%` }}
                    animate={{
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="text-sm sm:text-lg lg:text-xl font-extrabold text-[#030303] bg-white/90 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg shadow-lg border-2 border-[#8558ed]/30"
                    >
                      {jug.current}/{jug.capacity}L
                    </motion.span>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <div className="flex flex-col space-y-1.5 sm:space-y-2 w-full">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => fillJug(jug.id)}
                      disabled={jug.current === jug.capacity}
                      className="w-full bg-gradient-to-r from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white disabled:opacity-50 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                    >
                      <Droplet className="w-3 h-3 sm:w-4 sm:h-4" />
                      Fill
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => emptyJug(jug.id)}
                      disabled={jug.current === 0}
                      variant="outline"
                      className="w-full border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10 disabled:opacity-50 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                    >
                      <Droplets className="w-3 h-3 sm:w-4 sm:h-4" />
                      Empty
                    </Button>
                  </motion.div>
                  {jugs.map((targetJug) =>
                    targetJug.id !== jug.id ? (
                      <motion.div key={`pour-${jug.id}-${targetJug.id}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => pourJug(jug.id, targetJug.id)}
                          disabled={jug.current === 0 || targetJug.current === targetJug.capacity}
                          variant="secondary"
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white disabled:opacity-50 text-xs sm:text-sm py-1.5 sm:py-2"
                        >
                          Pour → {targetJug.id + 1}
                        </Button>
                      </motion.div>
                    ) : null
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 sm:mt-8 flex justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={resetPuzzle} variant="outline" className="border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Reset Puzzle
              </Button>
            </motion.div>
          </motion.div>
        </motion.div >
      </div >

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 5s ease infinite; }
      `}</style>
    </motion.div >
  );
};
