import Assessment from '../models/Assessment.js';

const GAME_KEYS = ['minesweeper', 'unblock-me', 'water-capacity', 'question-game'];

// A game result is final only when timeSpent is recorded — in-progress
// attempt records (startedAt, no timeSpent) are not completions.
const isCompleted = (game) => game && game.timeSpent !== undefined && game.timeSpent !== null;

// Fire-and-forget push of newly completed game results to the hiring
// tracker's ingestion endpoint (e.g. a Google Apps Script that appends to a
// Sheet). Configured via SHEETS_WEBHOOK_URL; a missing URL disables it.
// Never throws — a tracker outage must not break score saving.
const pushCompletionsToWebhook = async (before, after) => {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url || !after) return;

  const rows = [];
  for (const key of GAME_KEYS) {
    const prevGame = before?.games?.[key];
    const nextGame = after.games?.[key];
    if (isCompleted(nextGame) && !isCompleted(prevGame)) {
      rows.push({
        event: 'game_completed',
        candidateId: after.candidateId,
        trackerCid: after.trackerCid || null,
        userId: after.userId,
        game: key,
        score: nextGame.puzzlesCompleted ?? 0,
        timeSpentSec: nextGame.timeSpent ?? null,
        attempts: nextGame.attempts ?? 1,
        tabSwitches: nextGame.tabSwitches ?? 0,
        failed: !!nextGame.failed,
        failureReason: nextGame.failureReason || null,
        minimumMoves: nextGame.minimumMoves ?? null,
        errorRate: nextGame.errorRate ?? null,
        levelDetails: nextGame.levelDetails ?? null,
        completedAt: nextGame.completedAt || null,
        totalScore: after.totalScore ?? 0,
        assessmentCompletedAt: after.completedAt || null,
      });
    }
  }
  if (rows.length === 0) return;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (error) {
    console.error('⚠️ Webhook push failed (scores are safe in MongoDB):', error.message);
  }
};

// Create or update assessment
export const createOrUpdateAssessment = async (req, res, next) => {
  try {
    const assessmentData = req.body;

    if (!assessmentData.userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Snapshot the previous state so newly completed games can be detected
    const previous = await Assessment.findOne({ userId: assessmentData.userId }).lean();

    const assessment = await Assessment.findOneAndUpdate(
      { userId: assessmentData.userId },
      assessmentData,
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    // Push newly completed games to the hiring tracker (fire-and-forget)
    pushCompletionsToWebhook(previous, assessment.toObject()).catch(() => {});
    
    // ✅ Transform _id to id
    const assessmentObject = assessment.toObject();
    assessmentObject.id = assessmentObject._id.toString();
    delete assessmentObject._id;
    delete assessmentObject.__v;
    
    res.status(200).json(assessmentObject);
  } catch (error) {
    next(error);
  }
};

// Get assessment by userId
export const getAssessmentByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const assessment = await Assessment.findOne({ userId });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // ✅ Transform _id to id
    const assessmentObject = assessment.toObject();
    assessmentObject.id = assessmentObject._id.toString();
    delete assessmentObject._id;
    delete assessmentObject.__v;

    res.json(assessmentObject);
  } catch (error) {
    next(error);
  }
};

// Get all assessments
export const getAllAssessments = async (req, res, next) => {
  try {
    const assessments = await Assessment.find();
    
    const transformedAssessments = assessments.map(assessment => {
      const assessmentObject = assessment.toObject();
      assessmentObject.id = assessmentObject._id.toString();
      delete assessmentObject._id;
      delete assessmentObject.__v;
      return assessmentObject;
    });
    
    res.json(transformedAssessments);
  } catch (error) {
    next(error);
  }
};
