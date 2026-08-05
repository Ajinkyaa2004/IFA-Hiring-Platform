import Assessment from '../models/Assessment.js';
import Profile from '../models/Profile.js';

// Get leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    // Fetch all completed assessments
    const assessments = await Assessment.find({ completedAt: { $ne: null } });

    const leaderboard = await Promise.all(
      assessments.map(async (assessment) => {
        const profile = await Profile.findOne({ userId: assessment.userId });

        // Calculate total time spent across all games
        const timeSpent = {
          minesweeper: assessment.games.minesweeper?.timeSpent || 0,
          unblockMe: assessment.games['unblock-me']?.timeSpent || 0,
          waterCapacity: assessment.games['water-capacity']?.timeSpent || 0,
          questionGame: assessment.games['question-game']?.timeSpent || 0,
        };
        const totalTimeSpent = Object.values(timeSpent).reduce((a, b) => a + b, 0);

        // Moves above the solver-verified optimum (Unblock Me) — a continuous
        // efficiency signal used as the second tie-breaker
        const levelDetails = assessment.games['unblock-me']?.levelDetails || [];
        const totalExcessMoves = levelDetails.reduce(
          (sum, d) => sum + Math.max(0, (d.moves ?? 0) - (d.optimalMoves ?? 0)),
          0
        );

        // Disqualifications and failures must be visible to reviewers
        const failureReasons = [];
        for (const key of ['unblock-me', 'minesweeper', 'water-capacity', 'question-game']) {
          const game = assessment.games[key];
          if (game?.failed) failureReasons.push(`${key}: ${game.failureReason || 'failed'}`);
        }

        return {
          candidateId: assessment.candidateId,
          trackerCid: assessment.trackerCid || null,
          name: profile?.name || 'Unknown',
          email: profile?.email || 'Unknown',
          collegeName: profile?.collegeName || 'Unknown',
          totalScore: assessment.totalScore,
          totalTimeSpent, // Include for sorting/display
          totalExcessMoves,
          gameScores: {
            minesweeper: assessment.games.minesweeper?.puzzlesCompleted || 0,
            unblockMe: assessment.games['unblock-me']?.puzzlesCompleted || 0,
            waterCapacity: assessment.games['water-capacity']?.puzzlesCompleted || 0,
            questionGame: assessment.games['question-game']?.puzzlesCompleted || 0,
          },
          gameTimes: timeSpent,
          attempts: {
            minesweeper: assessment.games.minesweeper?.attempts || 0,
            unblockMe: assessment.games['unblock-me']?.attempts || 0,
            waterCapacity: assessment.games['water-capacity']?.attempts || 0,
            questionGame: assessment.games['question-game']?.attempts || 0,
          },
          hasFailedGame: failureReasons.length > 0,
          failureReasons,
          completedAt: assessment.completedAt,
        };
      })
    );

    // Sort: Total Score (Desc) -> Total Time (Asc) -> Excess Moves (Asc)
    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore; // Higher score first
      }
      if (a.totalTimeSpent !== b.totalTimeSpent) {
        return a.totalTimeSpent - b.totalTimeSpent; // Lower time first
      }
      return a.totalExcessMoves - b.totalExcessMoves; // Fewer wasted moves first
    });

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};