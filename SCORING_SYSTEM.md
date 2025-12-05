# 🏆 IFA SkillQuest Assessment Scoring System

## Overview
This document details the exact scoring algorithms implemented in the IFA SkillQuest platform.

---

## 1. Total Score Calculation

### Formula
```
Total Score = (Minesweeper × 5) + (Unblock Me × 6) + (Water Capacity × 3) + (Quiz Score × 10)
```

### Implementation Location
**File:** `frontend/src/lib/utils.ts`

```typescript
export function calculateTotalScore(
  minesweeperScore: number,
  unblockMeScore: number,
  waterCapacityScore: number,
  questionGameScore: number = 0
): number {
  const minesweeperPoints = minesweeperScore * 5;
  const unblockMePoints = unblockMeScore * 6;
  const waterCapacityPoints = waterCapacityScore * 3;
  const questionGamePoints = questionGameScore * 10;

  return Math.round(minesweeperPoints + unblockMePoints + waterCapacityPoints + questionGamePoints);
}
```

### Multiplier Rationale
- **Minesweeper (×5)**: High volume of small puzzles; requires scaling
- **Unblock Me (×6)**: Fewer levels but higher difficulty per level
- **Water Capacity (×3)**: Moderate number of puzzles with high base points
- **Quiz Score (×10)**: Converts typical score (e.g., 8/10) into comparable metric (80 points)

---

## 2. Leaderboard Ranking & Tie-Breaker

### Sorting Algorithm
**File:** `backend/server/controllers/leaderboardController.js`

```javascript
leaderboard.sort((a, b) => {
  if (b.totalScore !== a.totalScore) {
    return b.totalScore - a.totalScore; // Higher score first
  }
  return a.totalTimeSpent - b.totalTimeSpent; // Lower time first (tie-breaker)
});
```

### Logic
1. **Primary Sort**: Total Score (Highest to Lowest)
2. **Tie-Breaker**: Total Time Spent (Lowest to Highest)

**Example:**
- Candidate A: Score 2000, Time 15 mins → Rank #2
- Candidate B: Score 2000, Time 12 mins → Rank #1

---

## 3. Individual Game Scoring

### 🧩 Unblock Me (Logical Reasoning)

**File:** `frontend/src/components/games/UnblockMe.tsx`

#### Level Score Formula
```typescript
Level Score = 5 (Base) - (moves - optimal)
Minimum Score = 1 point per level
```

#### Implementation
```typescript
const calculateLevelScore = (levelIndex: number, moves: number, _timeSpent: number) => {
  const level = selectedLevels[levelIndex];
  if (!level) return 0;

  const optimal = level.optimalMoves;
  let score = 5; // Base score

  // Deduct 1 point for every extra move over optimal
  const extraMoves = Math.max(0, moves - optimal);
  score -= extraMoves;

  return Math.max(score, 1); // Minimum 1 point
};
```

#### Completion Bonus
- **200 points** for finishing all 10 levels

#### Total Score Calculation
```typescript
const calculateTotalScore = () => {
  let total = 0;
  for (let i = 0; i <= currentLevel; i++) {
    total += calculateLevelScore(i, levelMoves[i], levelTimes[i]);
  }
  if (allLevelsComplete) {
    total += 200; // Completion bonus
  }
  return Math.round(total);
};
```

#### Objectives Measured
- Problem-solving efficiency
- Optimal pathfinding
- Planning ahead

---

### 💣 Minesweeper (Pattern Recognition)

**File:** `frontend/src/components/games/Minesweeper.tsx`

#### Level Score Formula
```typescript
Level Score = 150 (Base) + Grid Bonus + Speed Bonus + Accuracy Bonus - Error Penalty
Minimum Score = 20 points per level
```

#### Implementation
```typescript
const calculateLevelScore = (currentLevel: number, timeSpent: number, levelErr: number, currentGridSize: number) => {
  const baseScore = 150;
  
  // Grid bonus: larger grids = more points
  const gridBonus = (currentGridSize - 8) * 20; // +20 per size above 8x8
  
  // Speed bonus: faster completion = more points (max 100)
  const speedBonus = Math.max(100 - timeSpent, 0);
  
  // Accuracy bonus: 100 points for 0 errors
  const accuracyBonus = levelErr === 0 ? 100 : 0;
  
  // Error penalty: -30 points per error (hitting a mine)
  const errorPenalty = levelErr * 30;
  
  const levelScore = baseScore + gridBonus + speedBonus + accuracyBonus - errorPenalty;
  return Math.max(Math.round(levelScore), 20);
};
```

#### Scoring Components
| Component | Value | Description |
|-----------|-------|-------------|
| Base Score | 150 points | Per level completion |
| Grid Bonus | +20 per size | Larger grids = more points |
| Speed Bonus | 0-100 points | Faster = higher bonus |
| Accuracy Bonus | 100 points | Zero errors in level |
| Error Penalty | -30 per error | Hitting a mine |

#### Objectives Measured
- Risk assessment
- Attention to detail
- Speed under pressure
- Pattern recognition

---

### 💧 Water Capacity (Cognitive Flexibility)

**File:** `frontend/src/components/games/WaterCapacity.tsx`

#### Puzzle Score Formula
```typescript
Puzzle Score = 120 (Base) + Complexity Bonus + Efficiency Bonus - Step Penalty
Minimum Score = 20 points per puzzle
```

#### Implementation
```typescript
const calculatePuzzleScore = (puzzleIndex: number, stepsUsed: number) => {
  const puzzle = puzzles[puzzleIndex];
  const numberOfJugs = puzzle.jugs.length;
  const baseScore = 120;
  
  // Complexity bonus: more jugs = higher multiplier
  const complexityBonus = (numberOfJugs - 2) * 30; // +30 per jug above 2
  
  // Calculate optimal steps
  const avgCapacity = puzzle.jugs.reduce((sum, j) => sum + j.capacity, 0) / numberOfJugs;
  const optimalSteps = Math.ceil(numberOfJugs * 2 + Math.log2(avgCapacity));
  
  // Efficiency bonus: 60 points for solving within optimal steps
  const efficiencyBonus = stepsUsed <= optimalSteps ? 60 : 0;
  
  // Penalty: -8 points per extra step
  const excessSteps = Math.max(0, stepsUsed - optimalSteps);
  const stepPenalty = excessSteps * 8;
  
  const puzzleScore = baseScore + complexityBonus + efficiencyBonus - stepPenalty;
  return Math.max(Math.round(puzzleScore), 20);
};
```

#### Completion Bonus
- **300 points** for finishing all puzzles

#### Scoring Components
| Component | Value | Description |
|-----------|-------|-------------|
| Base Score | 120 points | Per puzzle completion |
| Complexity Bonus | +30 per jug | More jugs = higher difficulty |
| Efficiency Bonus | 60 points | Solving within optimal steps |
| Step Penalty | -8 per step | Extra steps beyond optimal |
| Completion Bonus | 300 points | Finishing all puzzles |

#### Objectives Measured
- Planning and foresight
- Working memory
- Mathematical reasoning
- Algorithmic thinking

---

### 📝 Question Game (Domain Knowledge)

**File:** `frontend/src/components/games/QuestionGamePlayer.tsx`

#### Scoring
- **Raw Score**: Number of correct answers (e.g., 8/10)
- **Weight Multiplier**: ×10 in final calculation
- **Example**: 8 correct answers → 8 × 10 = **80 points** in total score

#### Implementation
Score is passed directly from the quiz component:
```typescript
onComplete(score, maxScore) // score = number correct, maxScore = total questions
```

#### Objectives Measured
- Technical/domain-specific knowledge
- Reading comprehension
- Decision-making under time pressure

---

## 4. Example Score Calculation

### Scenario
A candidate completes all games with the following performance:

| Game | Performance | Game Score | Multiplier | Contribution |
|------|-------------|------------|------------|--------------|
| Minesweeper | 10 levels, avg 200 pts/level | 2000 | ×5 | 10,000 |
| Unblock Me | 10 levels, 50 total pts | 50 | ×6 | 300 |
| Water Capacity | 20 puzzles, 150 pts/puzzle | 3000 | ×3 | 9,000 |
| Question Game | 8/10 correct | 8 | ×10 | 80 |
| **Total Score** | | | | **19,380** |

### Time Breakdown
- Minesweeper: 180 seconds
- Unblock Me: 240 seconds
- Water Capacity: 210 seconds
- Question Game: 120 seconds
- **Total Time: 750 seconds (12.5 minutes)**

---

## 5. Data Storage

### MongoDB Schema
**File:** `backend/server/models/Assessment.js`

```javascript
games: {
  'game-type': {
    puzzlesCompleted: Number,    // Raw score from game
    timeSpent: Number,            // Seconds spent
    errorRate: Number,            // Minesweeper only
    minimumMoves: Number,         // Unblock Me, Water Capacity
    maxScore: Number,             // Question Game only
    completedAt: Date,
    failed: Boolean,
    failureReason: String
  }
}
totalScore: Number,               // Calculated using formula
completedAt: Date
```

---

## 6. Key Implementation Notes

### Score Calculation Timing
- **Individual Games**: Scores calculated during gameplay for feedback
- **Total Score**: Calculated when all 3 primary games completed
- **Question Game**: Added to total if completed (optional)

### Game Completion Detection
**File:** `frontend/src/components/applicant/GameWrapper.tsx`
```typescript
if (assessment.games.minesweeper && 
    assessment.games['unblock-me'] && 
    assessment.games['water-capacity']) {
  assessment.totalScore = calculateTotalScore(
    assessment.games.minesweeper.puzzlesCompleted,
    assessment.games['unblock-me'].puzzlesCompleted,
    assessment.games['water-capacity'].puzzlesCompleted,
    assessment.games['question-game']?.puzzlesCompleted || 0
  );
}
```

### Results Display
**File:** `frontend/src/components/applicant/Results.tsx`
- Shows total score out of 100 (though actual scores can exceed 100)
- Displays performance rating based on score thresholds
- Individual game cards show detailed metrics
- Question Game shows "X/Y points" format

---

## 7. Performance Ratings

Based on total score:
| Score Range | Rating | Icon |
|-------------|--------|------|
| ≥ 70 | Outstanding Performance! | 🎉 |
| ≥ 50 | Great Job! | 🏆 |
| ≥ 30 | Good Effort! | 🎖️ |
| > 0 | Keep Improving! | 📈 |
| 0 | Assessment Incomplete | ⚠️ |

---

## Summary

The scoring system is designed to:
1. **Reward efficiency**: Better performance = higher scores
2. **Balance difficulty**: Different games weighted appropriately
3. **Ensure fairness**: Tie-breaker using time spent
4. **Provide feedback**: Detailed metrics for improvement
5. **Measure holistically**: Multiple cognitive skills assessed

All scoring is automated, deterministic, and stored persistently in MongoDB.
