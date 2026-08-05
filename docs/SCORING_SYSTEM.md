# 🏆 IFA SkillQuest Assessment Scoring System

## Overview
This document describes the scoring actually implemented in the codebase.
(Rewritten Aug 2026 — the previous version documented a formula that no
longer matched the code.)

---

## 1. Total Score

**File:** `frontend/src/lib/utils.ts` → `calculateTotalScore`

```
Total Score = (Unblock Me puzzles × 5)
            + (Water Capacity points × 5)
            + Minesweeper points          (already point-valued, no multiplier)
            + Question Game correct answers × 1
```

Computed in `GameWrapper.handleGameComplete` once Unblock Me, Minesweeper and
Water Capacity are all completed; the Question Game adds on top if played.

---

## 2. Per-Game Scoring

### 🚗 Unblock Me (first game)
- Fixed 17-level set (positions 0–16 of the bank), identical for every
  candidate, ordered easy → hard. **Every level is solver-verified solvable**
  and its `optimalMoves` is the BFS-computed true minimum.
- Score = puzzles completed × 5.
- Per-level `moves`, `optimalMoves` and `timeSec` are persisted in
  `games['unblock-me'].levelDetails` for efficiency analysis.
- Trial mode uses 3 separate easy levels (positions 17–19) that never appear
  in the scored set.

### 💣 Minesweeper (second game)
- Boards are **seeded from the candidate id + level + board attempt** — a
  candidate's board sequence is deterministic and reproducible.
- Mines are placed **after the first click**, excluding it and its neighbours
  — no first-click luck deaths.
- Score = (levels completed × 5) − wrong flags (floor 0). Mine hits are
  tracked as `errorRate`; `wrongFlags` and `levelsCompleted` are persisted.
- Mine-density selector is available in practice mode only; scored runs are
  locked to `normal`.

### 💧 Water Capacity (third game)
- Classic jug-measuring puzzles in a **fixed order** (same for everyone).
- Hard puzzle (3+ jugs) = 4 points, normal (≤2 jugs) = 2 points.
- Per-puzzle steps/scores persisted (`puzzleSteps`, `puzzleScores`).

### 📚 Question Game (fourth game, optional in total)
- 1 point per correct answer; `maxScore` stored alongside.

---

## 3. Leaderboard Ranking

**File:** `backend/server/controllers/leaderboardController.js`

1. **Total Score** — descending
2. **Total time spent** — ascending (tie-breaker)
3. **Excess moves vs solver optimum** (Unblock Me) — ascending (second
   tie-breaker, continuous separation)

Each row also carries `trackerCid`, per-game times, per-game attempt counts,
`hasFailedGame` and `failureReasons` so disqualifications are visible.

---

## 4. Attempt Integrity

- Pressing **Start** writes an attempt record (`startedAt`, `attempts`,
  `tabSwitches`) to MongoDB *before* the game begins.
- A mid-game refresh **resumes the original 5-minute window** computed from
  wall-clock `startedAt` — it can never grant fresh time. If the window
  expired while away, the attempt is recorded as failed.
- Tab-switch warnings are persisted, so refreshing cannot clear them.
  Disqualification occurs on the 3rd switch (single listener in
  `GameWrapper`; game components run no detection of their own).
