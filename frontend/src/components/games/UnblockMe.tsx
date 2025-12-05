import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTabSwitchDetection } from '@/hooks/useTabSwitchDetection';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Target, Sparkles, Zap, Star, Trophy, MousePointer, Keyboard, CheckCircle2 } from 'lucide-react';

interface UnblockMeProps {
  onComplete: (score: number, totalMoves: number, failed?: boolean, failureReason?: string) => void;
  timeRemaining: number;
  isTrialMode?: boolean;
}

type Block = {
  id: number;
  row: number;
  col: number;
  length: number;
  isHorizontal: boolean;
  isTarget: boolean;
};

type Level = {
  name: string;
  difficulty: 'Easy' | 'Hard';
  optimalMoves: number;
  blocks: Block[];
};

export const UnblockMe: React.FC<UnblockMeProps> = ({ onComplete, timeRemaining, isTrialMode = false }) => {
  const GRID_SIZE = 6;
  // Responsive cell size based on screen width
  const getCellSize = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 50; // mobile
      if (window.innerWidth < 1024) return 60; // tablet
      return 65; // desktop (reduced from 80)
    }
    return 65;
  };
  const [CELL_SIZE, setCellSize] = useState(getCellSize());
  const TOTAL_TIME = 300;
  const navigate = useNavigate();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [moves, setMoves] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [levelMoves, setLevelMoves] = useState<number[]>(Array(17).fill(0));
  const [levelTimes, setLevelTimes] = useState<number[]>(Array(17).fill(0));
  const [score, setScore] = useState(0);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tempPosition, setTempPosition] = useState<{ row: number; col: number } | null>(null);
  const [levelStartTime, setLevelStartTime] = useState<number>(TOTAL_TIME);
  const [lastLevelScore, setLastLevelScore] = useState(0);

  const gridRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);
  const hasCompletedRef = useRef(false);

  // Tab switch detection - only enabled when not in trial mode
  useTabSwitchDetection({
    maxViolations: 3,
    enabled: !isTrialMode,
    onDisqualified: () => {
      onComplete(puzzlesCompleted, totalMoves, true, 'Disqualified due to tab switching violations');
      navigate('/applicant/assessment');
    },
  });

  const allLevels: Level[] = [
    // Easy Levels (1-10)
    {
      name: 'Level 1',
      difficulty: 'Easy',
      optimalMoves: 7,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 1, col: 4, length: 3, isHorizontal: false, isTarget: false },
        { id: 3, row: 1, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 3, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 4, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 1, col: 0, length: 3, isHorizontal: true, isTarget: false },
        { id: 8, row: 3, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 4, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 5, col: 2, length: 3, isHorizontal: true, isTarget: false },
      ],
    },
    {
      name: 'Level 2',
      difficulty: 'Easy',
      optimalMoves: 9,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 3, col: 1, length: 3, isHorizontal: false, isTarget: false },
        { id: 5, row: 2, col: 2, length: 3, isHorizontal: false, isTarget: false },
        { id: 7, row: 2, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 2, length: 3, isHorizontal: true, isTarget: false },
        { id: 6, row: 1, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 1, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 4, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 5, col: 2, length: 2, isHorizontal: true, isTarget: false },
      ],
    },
    {
      name: 'Level 3',
      difficulty: 'Easy',
      optimalMoves: 11,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 3, col: 1, length: 3, isHorizontal: false, isTarget: false },
        { id: 5, row: 2, col: 2, length: 3, isHorizontal: false, isTarget: false },
        { id: 7, row: 2, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 2, length: 3, isHorizontal: true, isTarget: false },
        { id: 6, row: 1, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 1, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 4, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 5, col: 2, length: 2, isHorizontal: true, isTarget: false }
      ],
    },
    {
      name: 'Level 4',
      difficulty: 'Easy',
      optimalMoves: 8,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 3, col: 1, length: 3, isHorizontal: false, isTarget: false },
        { id: 5, row: 2, col: 2, length: 3, isHorizontal: false, isTarget: false },
        { id: 7, row: 2, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 2, length: 3, isHorizontal: true, isTarget: false },
        { id: 6, row: 1, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 1, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 4, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 5, col: 2, length: 2, isHorizontal: true, isTarget: false }
      ],
    },
    {
      name: 'Level 5',
      difficulty: 'Easy',
      optimalMoves: 10,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 3, row: 0, col: 3, length: 3, isHorizontal: true, isTarget: false },
        { id: 4, row: 3, col: 5, length: 3, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 6, row: 3, col: 2, length: 2, isHorizontal: true, isTarget: false },
        { id: 7, row: 4, col: 0, length: 3, isHorizontal: true, isTarget: false },
        { id: 8, row: 3, col: 4, length: 3, isHorizontal: false, isTarget: false },
        { id: 9, row: 5, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 3, col: 0, length: 2, isHorizontal: true, isTarget: false }
      ],
    },
    {
      name: 'Level 6',
      difficulty: 'Easy',
      optimalMoves: 12,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 1, col: 3, length: 3, isHorizontal: false, isTarget: false },
        { id: 3, row: 2, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 3, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 4, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 4, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 0, col: 1, length: 3, isHorizontal: true, isTarget: false },
        { id: 8, row: 0, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 1, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 5, col: 2, length: 3, isHorizontal: true, isTarget: false }
      ],
    },
    {
      name: 'Level 7',
      difficulty: 'Easy',
      optimalMoves: 9,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 1, col: 2, length: 3, isHorizontal: false, isTarget: false },
        { id: 3, row: 4, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 3, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 0, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 4, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 5, col: 1, length: 3, isHorizontal: true, isTarget: false },
        { id: 8, row: 0, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 3, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 4, col: 2, length: 3, isHorizontal: true, isTarget: false }
      ],
    },
    {
      name: 'Level 8',
      difficulty: 'Easy',
      optimalMoves: 11,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 1, col: 3, length: 3, isHorizontal: false, isTarget: false },
        { id: 4, row: 2, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 0, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 1, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 7, row: 3, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 4, col: 3, length: 3, isHorizontal: true, isTarget: false },
        { id: 9, row: 5, col: 0, length: 2, isHorizontal: true, isTarget: false },
      ],
    },
    {
      name: 'Level 9',
      difficulty: 'Easy',
      optimalMoves: 10,
      blocks: [
        { id: 1, row: 2, col: 1, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 2, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 1, col: 3, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 0, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 3, col: 2, length: 3, isHorizontal: true, isTarget: false },
        { id: 7, row: 4, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 5, col: 3, length: 2, isHorizontal: true, isTarget: false },
      ],
    },
    {
      name: 'Level 10',
      difficulty: 'Easy',
      optimalMoves: 13,
      blocks: [
        { id: 1, row: 2, col: 2, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 2, col: 0, length: 3, isHorizontal: false, isTarget: false },
        { id: 3, row: 2, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 0, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 4, col: 3, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 5, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 1, col: 2, length: 3, isHorizontal: true, isTarget: false },
        { id: 8, row: 1, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 4, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 0, col: 1, length: 3, isHorizontal: true, isTarget: false }
      ],
    },
    // Hard Levels (11-20)
    {
      name: 'Level 11',
      difficulty: 'Hard',
      optimalMoves: 15,
      blocks: [
        { id: 1, row: 2, col: 2, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 2, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 2, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 11, row: 0, col: 5, length: 3, isHorizontal: false, isTarget: false },
        { id: 12, row: 4, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 3, col: 2, length: 2, isHorizontal: true, isTarget: false },
        { id: 7, row: 3, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 4, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 5, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 5, col: 3, length: 3, isHorizontal: true, isTarget: false },
      ],
    },
    {
      name: 'Level 12',
      difficulty: 'Hard',
      optimalMoves: 18,
      blocks: [
        { id: 1, row: 2, col: 3, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 2, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 3, col: 3, length: 3, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 3, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 7, row: 4, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 5, col: 0, length: 3, isHorizontal: true, isTarget: false },
      ],
    },
    {
      name: 'Level 13',
      difficulty: 'Hard',
      optimalMoves: 16,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 2, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 2, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 2, col: 3, length: 3, isHorizontal: false, isTarget: false },
        { id: 8, row: 3, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 9, row: 4, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 2, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 1, col: 4, length: 2, isHorizontal: true, isTarget: false },
      ],
    },
    {
      name: 'Level 14',
      difficulty: 'Hard',
      optimalMoves: 17,
      blocks: [
        { id: 1, row: 2, col: 1, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 1, col: 3, length: 3, isHorizontal: false, isTarget: false },
        { id: 3, row: 0, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 0, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 5, col: 2, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 0, col: 2, length: 3, isHorizontal: true, isTarget: false },
        { id: 8, row: 4, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 4, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 3, col: 0, length: 3, isHorizontal: true, isTarget: false }
      ],
    },
    {
      name: 'Level 15',
      difficulty: 'Hard',
      optimalMoves: 19,
      blocks: [
        { id: 1, row: 2, col: 2, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 4, length: 3, isHorizontal: false, isTarget: false },
        { id: 3, row: 0, col: 0, length: 0, isHorizontal: false, isTarget: false },
        { id: 5, row: 4, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 2, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 3, col: 2, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 5, col: 3, length: 3, isHorizontal: true, isTarget: false },
        { id: 8, row: 4, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 1, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 0, col: 2, length: 2, isHorizontal: true, isTarget: false }
      ],
    },
    {
      name: 'Level 16',
      difficulty: 'Hard',
      optimalMoves: 20,
      blocks: [
        { id: 1, row: 2, col: 1, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 0, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 2, col: 5, length: 3, isHorizontal: false, isTarget: false },
        { id: 5, row: 0, col: 3, length: 3, isHorizontal: false, isTarget: false },
        { id: 6, row: 3, col: 4, length: 3, isHorizontal: false, isTarget: false },
        { id: 7, row: 0, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 3, col: 0, length: 3, isHorizontal: true, isTarget: false },
        { id: 9, row: 4, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 5, col: 1, length: 3, isHorizontal: true, isTarget: false },
      ],
    },
    {
      name: 'Level 17',
      difficulty: 'Hard',
      optimalMoves: 21,
      blocks: [
        { id: 1, row: 2, col: 1, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 2, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 0, col: 3, length: 2, isHorizontal: false, isTarget: false },
        { id: 6, row: 1, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 2, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 8, row: 0, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 3, col: 2, length: 3, isHorizontal: true, isTarget: false },
        { id: 10, row: 4, col: 1, length: 3, isHorizontal: true, isTarget: false },
        { id: 11, row: 5, col: 2, length: 3, isHorizontal: true, isTarget: false },

      ],
    },
    {
      name: 'Level 18',
      difficulty: 'Hard',
      optimalMoves: 22,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 0, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 1, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 3, length: 2, isHorizontal: false, isTarget: false },
        { id: 6, row: 2, col: 4, length: 3, isHorizontal: false, isTarget: false },
        { id: 7, row: 3, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 8, row: 2, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 9, row: 1, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 3, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 11, row: 4, col: 1, length: 3, isHorizontal: true, isTarget: false },
        { id: 12, row: 5, col: 0, length: 2, isHorizontal: true, isTarget: false },
      ],
    },
    {
      name: 'Level 19',
      difficulty: 'Hard',
      optimalMoves: 23,
      blocks: [
        { id: 1, row: 2, col: 2, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 2, col: 1, length: 4, isHorizontal: false, isTarget: false },
        { id: 3, row: 1, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 2, col: 4, length: 3, isHorizontal: false, isTarget: false },
        { id: 6, row: 3, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 0, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 1, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 3, col: 2, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 4, col: 2, length: 2, isHorizontal: true, isTarget: false },
        { id: 11, row: 5, col: 3, length: 3, isHorizontal: true, isTarget: false },
      ],
    },
    {
      name: 'Level 20',
      difficulty: 'Hard',
      optimalMoves: 25,
      blocks: [
        { id: 1, row: 2, col: 1, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 0, length: 3, isHorizontal: false, isTarget: false },
        { id: 3, row: 0, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 2, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 6, row: 0, col: 3, length: 3, isHorizontal: false, isTarget: false },
        { id: 7, row: 2, col: 4, length: 3, isHorizontal: false, isTarget: false },
        { id: 8, row: 2, col: 5, length: 3, isHorizontal: false, isTarget: false },
        { id: 9, row: 3, col: 2, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 4, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 11, row: 4, col: 0, length: 0, isHorizontal: true, isTarget: false },
        { id: 12, row: 5, col: 4, length: 2, isHorizontal: true, isTarget: false },
      ],
    },
    {
      name: 'Level 21',
      difficulty: 'Hard',
      optimalMoves: 25,
      blocks: [
        // The Target Car (Horizontal, Length 2, must exit from the right side)
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },

        // Blocking Vehicles
        { id: 2, row: 0, col: 0, length: 2, isHorizontal: false, isTarget: false }, // Vertical
        { id: 3, row: 0, col: 5, length: 3, isHorizontal: false, isTarget: false }, // Vertical
        { id: 4, row: 3, col: 4, length: 2, isHorizontal: false, isTarget: false }, // Vertical
        { id: 5, row: 1, col: 2, length: 3, isHorizontal: true, isTarget: false }, // Horizontal
        { id: 6, row: 0, col: 2, length: 2, isHorizontal: true, isTarget: false }, // Horizontal
        { id: 7, row: 3, col: 0, length: 3, isHorizontal: true, isTarget: false }, // Horizontal
        { id: 8, row: 4, col: 2, length: 2, isHorizontal: true, isTarget: false }, // Horizontal
        { id: 9, row: 5, col: 0, length: 2, isHorizontal: true, isTarget: false }, // Horizontal
        { id: 10, row: 5, col: 4, length: 2, isHorizontal: true, isTarget: false }  // Horizontal
      ],
    },
    {
      name: 'Level 22',
      difficulty: 'Hard',
      optimalMoves: 25,
      blocks: [
        { id: 1, row: 2, col: 2, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 1, col: 5, length: 3, isHorizontal: false, isTarget: false },
        { id: 3, row: 4, col: 3, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 3, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 2, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 4, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 5, col: 0, length: 3, isHorizontal: true, isTarget: false },
        { id: 8, row: 5, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 1, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 0, col: 1, length: 3, isHorizontal: true, isTarget: false }
      ],
    },
    {
      name: 'Level 23',
      difficulty: 'Hard',
      optimalMoves: 25,
      blocks: [

        { id: 1, row: 2, col: 1, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 0, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 4, row: 1, col: 5, length: 3, isHorizontal: false, isTarget: false },
        { id: 5, row: 2, col: 0, length: 3, isHorizontal: false, isTarget: false },
        { id: 6, row: 3, col: 2, length: 3, isHorizontal: true, isTarget: false },
        { id: 7, row: 4, col: 3, length: 0, isHorizontal: false, isTarget: false },
        { id: 8, row: 5, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 4, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 0, col: 4, length: 2, isHorizontal: false, isTarget: false }
      ],
    },
    {
      name: 'Level 24',
      difficulty: 'Hard',
      optimalMoves: 25,
      blocks: [

        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 1, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 1, col: 5, length: 3, isHorizontal: false, isTarget: false },
        { id: 5, row: 2, col: 4, length: 3, isHorizontal: false, isTarget: false },
        { id: 6, row: 3, col: 0, length: 3, isHorizontal: true, isTarget: false },
        { id: 7, row: 4, col: 1, length: 3, isHorizontal: true, isTarget: false },
        { id: 8, row: 5, col: 3, length: 3, isHorizontal: true, isTarget: false },
        { id: 9, row: 2, col: 0, length: 0, isHorizontal: true, isTarget: false },
        { id: 10, row: 4, col: 0, length: 2, isHorizontal: false, isTarget: false }
      ],
    },
    {
      name: 'Level 25',
      difficulty: 'Hard',
      optimalMoves: 25,
      blocks: [

        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 0, length: 1, isHorizontal: false, isTarget: false },
        { id: 3, row: 0, col: 1, length: 3, isHorizontal: true, isTarget: false },
        { id: 4, row: 1, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 5, length: 3, isHorizontal: false, isTarget: false },
        { id: 6, row: 3, col: 0, length: 3, isHorizontal: false, isTarget: false },
        { id: 7, row: 2, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 8, row: 5, col: 1, length: 3, isHorizontal: true, isTarget: false },
        { id: 9, row: 2, col: 2, length: 0, isHorizontal: true, isTarget: false },
        { id: 10, row: 4, col: 2, length: 2, isHorizontal: true, isTarget: false }
      ],
    },
    {
      name: 'Level 26',
      difficulty: 'Hard',
      optimalMoves: 25,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 1, col: 3, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 4, col: 1, length: 3, isHorizontal: true, isTarget: false },
        { id: 4, row: 2, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 6, row: 0, col: 0, length: 0, isHorizontal: false, isTarget: false },
        { id: 7, row: 0, col: 3, length: 3, isHorizontal: true, isTarget: false },
        { id: 8, row: 1, col: 0, length: 3, isHorizontal: true, isTarget: false },
        { id: 9, row: 3, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 5, col: 2, length: 2, isHorizontal: true, isTarget: false }
      ],
    },
    {
      name: 'Level 27',
      difficulty: 'Hard',
      optimalMoves: 25,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 2, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 0, col: 3, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 1, col: 0, length: 0, isHorizontal: false, isTarget: false },
        { id: 5, row: 2, col: 3, length: 3, isHorizontal: false, isTarget: false },
        { id: 6, row: 1, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 7, row: 4, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 5, col: 2, length: 3, isHorizontal: true, isTarget: false },
        { id: 9, row: 1, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 2, col: 4, length: 2, isHorizontal: false, isTarget: false }
      ],
    },
    {
      name: 'Level 28',
      difficulty: 'Hard',
      optimalMoves: 25,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 0, col: 1, length: 3, isHorizontal: true, isTarget: false },
        { id: 4, row: 0, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 0, row: 0, col: 0, length: 0, isHorizontal: false, isTarget: false }, // Corrected ID 1 to 5
        { id: 0, row: 0, col: 0, length: 0, isHorizontal: false, isTarget: false },
        { id: 6, row: 2, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 4, col: 2, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 5, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 0, row: 0, col: 0, length: 0, isHorizontal: true, isTarget: false },
        { id: 10, row: 1, col: 5, length: 2, isHorizontal: false, isTarget: false }
      ],
    },
    {
      name: 'Level 29',
      difficulty: 'Hard',
      optimalMoves: 25,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 2, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 0, col: 3, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 1, col: 0, length: 0, isHorizontal: false, isTarget: false },
        { id: 5, row: 2, col: 3, length: 3, isHorizontal: false, isTarget: false },
        { id: 6, row: 1, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 7, row: 4, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 5, col: 2, length: 3, isHorizontal: true, isTarget: false },
        { id: 9, row: 1, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 2, col: 4, length: 2, isHorizontal: false, isTarget: false }
      ],
    },
  ];

  const DEV_MODE = false;

  const selectedLevels = useMemo(() => {
    if (DEV_MODE) {
      return allLevels;
    }
    if (isTrialMode) {
      // Trial mode: Pick 3 random levels from all 20
      const shuffled = [...allLevels].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    } else {
      // Actual game: Pick 17 random levels from all 20
      const shuffled = [...allLevels].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 17);
    }
  }, [isTrialMode]);

  useEffect(() => {
    loadLevel(0);
    hasInitializedRef.current = true;
  }, []);

  // Handle window resize for responsive cell size
  useEffect(() => {
    const handleResize = () => {
      setCellSize(getCellSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle time running out
  useEffect(() => {
    if (timeRemaining === 0 && !isTrialMode && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete(puzzlesCompleted, totalMoves);
    }
  }, [timeRemaining, isTrialMode, puzzlesCompleted, totalMoves, onComplete]);

  // Handle game completion
  useEffect(() => {
    if (allLevelsComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      // Pass the number of levels completed (puzzlesCompleted) and total moves
      onComplete(puzzlesCompleted, totalMoves);
    }
  }, [allLevelsComplete, puzzlesCompleted, totalMoves, onComplete]);

  const loadLevel = (levelIndex: number) => {
    if (levelIndex >= selectedLevels.length) {
      setAllLevelsComplete(true);
      return;
    }

    const lvl = selectedLevels[levelIndex];
    if (!isLayoutValid(lvl.blocks)) {
      console.error(`Level ${levelIndex + 1} has an invalid layout (overlap or OOB).`);
    }

    setBlocks(lvl.blocks.map((b) => ({ ...b })));
    setMoves(0);
    setLevelComplete(false);
    setCurrentLevel(levelIndex);
    setLevelStartTime(timeRemaining);
  };

  const isLayoutValid = (bks: Block[]) => {
    const seen = new Set<string>();
    for (const b of bks) {
      for (let i = 0; i < b.length; i++) {
        const r = b.isHorizontal ? b.row : b.row + i;
        const c = b.isHorizontal ? b.col + i : b.col;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
        const key = `${r},${c}`;
        if (seen.has(key)) return false;
        seen.add(key);
      }
    }
    return true;
  };

  const calculateLevelScore = (levelIndex: number, moves: number, _timeSpent: number) => {
    const level = selectedLevels[levelIndex];
    if (!level) return 0;

    const optimal = level.optimalMoves;
    let score = 5; // Base score for completing the level

    // Deduct 1 point for every extra move over optimal
    const extraMoves = Math.max(0, moves - optimal);
    score -= extraMoves;

    // Minimum score of 1 point for completing a level
    return Math.max(score, 1);
  };

  const calculateTotalScore = () => {
    let total = 0;
    for (let i = 0; i <= currentLevel; i++) {
      if (levelMoves[i] > 0 || i === currentLevel) {
        const used = i === currentLevel ? moves : levelMoves[i];
        const timeSpent = i === currentLevel ? (levelStartTime - timeRemaining) : levelTimes[i];
        total += calculateLevelScore(i, used, timeSpent);
      }
    }
    // Add completion bonus if all levels finished
    if (currentLevel === selectedLevels.length - 1 && allLevelsComplete) {
      total += 200; // Completion bonus
    }
    return Math.round(total);
  };

  const checkWin = (currentBlocks: Block[]) => {
    const target = currentBlocks.find((b) => b.isTarget);
    if (target && target.col === GRID_SIZE - target.length) {
      setLevelComplete(true);
      setPuzzlesCompleted(prev => prev + 1);

      const newLevelMoves = [...levelMoves];
      newLevelMoves[currentLevel] = moves;
      setLevelMoves(newLevelMoves);

      const timeSpent = levelStartTime - timeRemaining;
      const newLevelTimes = [...levelTimes];
      newLevelTimes[currentLevel] = timeSpent;
      setLevelTimes(newLevelTimes);

      const levelScoreVal = calculateLevelScore(currentLevel, moves, timeSpent);
      setLastLevelScore(levelScoreVal);

      const newScore = calculateTotalScore();
      setScore(newScore);

      if (currentLevel < selectedLevels.length - 1) {
        setTimeout(() => loadLevel(currentLevel + 1), 2500);
      } else {
        setAllLevelsComplete(true);
      }
    }
  };

  const canMoveBlock = (block: Block, newRow: number, newCol: number): boolean => {
    if (block.isHorizontal) {
      if (newCol < 0 || newCol + block.length > GRID_SIZE) return false;
    } else {
      if (newRow < 0 || newRow + block.length > GRID_SIZE) return false;
    }

    for (let other of blocks) {
      if (other.id === block.id) continue;

      for (let i = 0; i < block.length; i++) {
        const checkRow = block.isHorizontal ? newRow : newRow + i;
        const checkCol = block.isHorizontal ? newCol + i : newCol;

        for (let j = 0; j < other.length; j++) {
          const otherRow = other.isHorizontal ? other.row : other.row + j;
          const otherCol = other.isHorizontal ? other.col + j : other.col;

          if (checkRow === otherRow && checkCol === otherCol) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleMouseDown = (id: number, e: React.MouseEvent) => {
    if (levelComplete || allLevelsComplete) return;

    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedBlock(id);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTempPosition({ row: block.row, col: block.col });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedBlock === null || !gridRef.current) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const block = blocks.find((b) => b.id === draggedBlock);
      if (!block) return;

      const gridRect = gridRef.current!.getBoundingClientRect();
      const x = e.clientX - gridRect.left - dragOffset.x;
      const y = e.clientY - gridRect.top - dragOffset.y;

      let newRow = block.row;
      let newCol = block.col;

      if (block.isHorizontal) {
        newCol = Math.round(x / CELL_SIZE);
        newCol = Math.max(0, Math.min(GRID_SIZE - block.length, newCol));
      } else {
        newRow = Math.round(y / CELL_SIZE);
        newRow = Math.max(0, Math.min(GRID_SIZE - block.length, newRow));
      }

      if (canMoveBlock(block, newRow, newCol)) {
        setTempPosition({ row: newRow, col: newCol });
      }
    });
  };

  const handleMouseUp = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (draggedBlock === null || tempPosition === null) return;

    const block = blocks.find((b) => b.id === draggedBlock);
    if (!block) return;

    if (block.row !== tempPosition.row || block.col !== tempPosition.col) {
      const newBlocks = blocks.map((b) =>
        b.id === draggedBlock ? { ...b, row: tempPosition.row, col: tempPosition.col } : b
      );
      setBlocks(newBlocks);
      setMoves((m) => m + 1);
      setTotalMoves((t) => t + 1);
      checkWin(newBlocks);
    }

    setDraggedBlock(null);
    setTempPosition(null);
  };

  const getBlockPosition = (b: Block) => {
    if (draggedBlock === b.id && tempPosition) {
      return {
        top: tempPosition.row * CELL_SIZE,
        left: tempPosition.col * CELL_SIZE,
      };
    }
    return {
      top: b.row * CELL_SIZE,
      left: b.col * CELL_SIZE,
    };
  };

  const getBlockColor = (b: Block) => {
    if (b.isTarget) return 'bg-gradient-to-br from-red-500 to-red-600';

    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-600',
      'bg-gradient-to-br from-emerald-500 to-emerald-600',
    ];
    return colors[b.id % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen playful-gradient p-4 relative overflow-hidden"
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
      </div>

      {/* Floating Icons */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 pointer-events-none"
      >
        <Sparkles className="w-8 h-8 text-[#8558ed]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-32 right-16 pointer-events-none"
      >
        <Zap className="w-10 h-10 text-[#b18aff]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 15, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-24 left-20 pointer-events-none"
      >
        <Star className="w-7 h-7 text-[#8558ed]/30" />
      </motion.div>

      <div className="max-w-6xl mx-auto py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8558ed] via-[#b18aff] to-[#8558ed] drop-shadow-[0_0_25px_rgba(133,88,237,0.3)] tracking-tight mb-2 flex items-center justify-center gap-3"
          >
            <Car className="w-12 h-12 text-[#8558ed]" />
            Unblock Me Quest
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#8558ed]/80 font-medium flex items-center justify-center gap-2"
          >
            <Car className="w-5 h-5" />
            Move blocks to free the red car!
          </motion.p>
        </motion.div>

        {DEV_MODE && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => {
                setLevelComplete(true);
                setPuzzlesCompleted((prev) => prev + 1);

                const newLevelMoves = [...levelMoves];
                newLevelMoves[currentLevel] = moves;
                setLevelMoves(newLevelMoves);

                const timeSpent = levelStartTime - timeRemaining;
                const newLevelTimes = [...levelTimes];
                newLevelTimes[currentLevel] = timeSpent;
                setLevelTimes(newLevelTimes);

                const levelScoreVal = calculateLevelScore(currentLevel, moves, timeSpent);
                setLastLevelScore(levelScoreVal);

                const newScore = calculateTotalScore();
                setScore(newScore);

                if (currentLevel < selectedLevels.length - 1) {
                  setTimeout(() => loadLevel(currentLevel + 1), 2500);
                } else {
                  setAllLevelsComplete(true);
                }
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors z-50 relative"
            >
              Debug: Win Level
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-lg shadow-[#8558ed]/10"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-tr from-[#8558ed] to-[#b18aff] w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.div>
              <div>
                <div className="text-[10px] sm:text-xs text-[#030303]/60 font-medium">{selectedLevels[currentLevel]?.name} - {selectedLevels[currentLevel]?.difficulty}</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#8558ed]">Level {currentLevel + 1}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-lg shadow-[#8558ed]/10"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-tr from-green-500 to-emerald-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.div>
              <div>
                <div className="text-[10px] sm:text-xs text-[#030303]/60 font-medium">Total Score</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{score}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-lg shadow-[#8558ed]/10"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-tr from-yellow-500 to-orange-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.div>
              <div>
                <div className="text-[10px] sm:text-xs text-[#030303]/60 font-medium">Level Score</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{lastLevelScore}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-lg shadow-[#8558ed]/10"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-tr from-blue-500 to-cyan-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.div>
              <div>
                <div className="text-[10px] sm:text-xs text-[#030303]/60 font-medium">Moves</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                  {moves}
                  {levelComplete && moves > selectedLevels[currentLevel]?.optimalMoves && (
                    <span className="text-sm sm:text-base md:text-lg text-orange-500 ml-1">
                      (+{moves - selectedLevels[currentLevel]?.optimalMoves})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Level Progress Removed */}

        {/* Level Complete Animation */}
        <AnimatePresence>
          {levelComplete && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-4 flex justify-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-green-500/30 flex items-center gap-3"
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8" />
                </motion.span>
                <span className="text-2xl font-bold">Level Complete!</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Board and Instructions Side by Side */}
        <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6 lg:gap-8 justify-center">
          {/* Instructions - Left Side */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full lg:w-64 order-2 lg:order-1"
          >
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-[#8558ed]/10">
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#8558ed]" />
                <h3 className="text-base sm:text-lg font-bold text-[#8558ed]">How to Play</h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[#030303]/70">
                <p className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 sm:w-5 sm:h-5 text-[#8558ed]" />
                  <span><strong>Click a block</strong> to select it</span>
                </p>
                <p className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 text-[#8558ed]" />
                  <span><strong>Drag blocks</strong> to move them</span>
                </p>
                <p className="flex items-center gap-2">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 text-[#8558ed]" />
                  <span><strong>Move the red car</strong> to the exit!</span>
                </p>
                <p className="flex items-center gap-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#8558ed]" />
                  <span>Complete in <strong>≤{selectedLevels[currentLevel]?.optimalMoves} moves</strong></span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Game Board - Right Side */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="order-1 lg:order-2 mx-auto"
          >
            <div
              className="relative"
              style={{
                width: GRID_SIZE * CELL_SIZE + (CELL_SIZE < 65 ? 32 : 48) + (CELL_SIZE < 65 ? 30 : 40) + 8,
                height: GRID_SIZE * CELL_SIZE + (CELL_SIZE < 65 ? 32 : 48),
              }}
            >
              <div
                ref={gridRef}
                className="absolute rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-100 shadow-2xl shadow-[#8558ed]/20 overflow-hidden border-2 border-white/40"
                style={{
                  width: GRID_SIZE * CELL_SIZE + (CELL_SIZE < 65 ? 32 : 48),
                  height: GRID_SIZE * CELL_SIZE + (CELL_SIZE < 65 ? 32 : 48),
                  padding: CELL_SIZE < 65 ? '16px' : '24px',
                  left: 0,
                  top: 0,
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Grid cells */}
                <div
                  className="absolute grid"
                  style={{
                    inset: CELL_SIZE < 65 ? '16px' : '24px',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  }}
                >
                  {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                    <div key={i} className="border border-amber-300/40" />
                  ))}
                </div>

                {/* Blocks */}
                {blocks.map((block) => {
                  const position = getBlockPosition(block);
                  const isDragging = draggedBlock === block.id;

                  return (
                    <motion.div
                      key={block.id}
                      onMouseDown={(e) => handleMouseDown(block.id, e)}
                      whileHover={{ scale: isDragging ? 1 : 1.02 }}
                      className={`absolute rounded-lg sm:rounded-xl shadow-lg cursor-grab active:cursor-grabbing select-none ${getBlockColor(
                        block
                      )} ${isDragging ? 'shadow-2xl z-30 ring-2 sm:ring-4 ring-white/50' : 'hover:shadow-xl z-10'}`}
                      style={{
                        top: position.top + (CELL_SIZE < 65 ? 16 : 24),
                        left: position.left + (CELL_SIZE < 65 ? 16 : 24),
                        width: block.isHorizontal ? block.length * CELL_SIZE : CELL_SIZE,
                        height: block.isHorizontal ? CELL_SIZE : block.length * CELL_SIZE,
                        transition: 'top 80ms ease-out, left 80ms ease-out',
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        {block.isTarget ? (
                          <motion.svg
                            animate={{ rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-white drop-shadow-2xl"
                            style={{ width: CELL_SIZE * 0.6, height: CELL_SIZE * 0.6 }}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                          </motion.svg>
                        ) : (
                          <div className="flex gap-1.5">
                            {block.isHorizontal ? (
                              <>
                                <div className="h-2.5 w-2.5 rounded-full bg-white/70 shadow-sm" />
                                <div className="h-2.5 w-2.5 rounded-full bg-white/70 shadow-sm" />
                              </>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-white/70 shadow-sm" />
                                <div className="h-2.5 w-2.5 rounded-full bg-white/70 shadow-sm" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Exit indicator */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 rounded-r-lg sm:rounded-r-xl shadow-xl z-50"
                style={{
                  left: GRID_SIZE * CELL_SIZE + (CELL_SIZE < 65 ? 32 : 48) + 8,
                  top: (CELL_SIZE < 65 ? 16 : 24) + 2 * CELL_SIZE + (CELL_SIZE - CELL_SIZE) / 2,
                  width: CELL_SIZE < 65 ? 30 : 40,
                  height: CELL_SIZE,
                }}
                aria-label="Exit"
              >
                <motion.svg
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-white drop-shadow-lg"
                  style={{ width: CELL_SIZE * 0.4, height: CELL_SIZE * 0.4 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </motion.svg>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};