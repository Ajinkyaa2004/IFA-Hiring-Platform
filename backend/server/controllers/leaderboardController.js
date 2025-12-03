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

        return {
          candidateId: assessment.candidateId,
          name: profile?.name || 'Unknown',
          email: profile?.email || 'Unknown',
          collegeName: profile?.collegeName || 'Unknown',
          totalScore: assessment.totalScore,
          totalTimeSpent, // Include for sorting/display
          gameScores: {
            minesweeper: assessment.games.minesweeper?.puzzlesCompleted || 0,
            unblockMe: assessment.games['unblock-me']?.puzzlesCompleted || 0,
            waterCapacity: assessment.games['water-capacity']?.puzzlesCompleted || 0,
            questionGame: assessment.games['question-game']?.puzzlesCompleted || 0,
          },
          completedAt: assessment.completedAt,
        };
      })
    );

    // Sort by Total Score (Desc) -> Total Time Spent (Asc)
    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore; // Higher score first
      }
      return a.totalTimeSpent - b.totalTimeSpent; // Lower time first (tie-breaker)
    });

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};