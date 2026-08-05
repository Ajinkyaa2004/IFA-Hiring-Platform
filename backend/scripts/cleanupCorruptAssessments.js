// Finds (and with --apply, deletes) assessment rows whose scores are
// physically impossible — artifacts of older game versions and score
// exploits that would otherwise pollute a real hiring round's ranking.
//
//   node scripts/cleanupCorruptAssessments.js           # dry run (report only)
//   node scripts/cleanupCorruptAssessments.js --apply   # actually delete
//
// Sanity bounds per 5-minute game (generous):
//   unblock-me      max 17 puzzles (fixed scored set size)
//   minesweeper     max 500 points (~100 levels — far beyond humanly possible)
//   water-capacity  max 240 points (a puzzle every 5s at 4 points each)
//   question-game   max 200 correct answers

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const BOUNDS = {
  'unblock-me': 17,
  minesweeper: 500,
  'water-capacity': 240,
  'question-game': 200,
};

const apply = process.argv.includes('--apply');

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const Assessment = mongoose.connection.collection('assessments');

  const all = await Assessment.find({}).toArray();
  const corrupt = [];

  for (const a of all) {
    const reasons = [];
    for (const [game, bound] of Object.entries(BOUNDS)) {
      const score = a.games?.[game]?.puzzlesCompleted;
      if (typeof score === 'number' && (score < 0 || score > bound)) {
        reasons.push(`${game}=${score} (bound ${bound})`);
      }
    }
    if (reasons.length) corrupt.push({ id: a._id, candidateId: a.candidateId, totalScore: a.totalScore, reasons });
  }

  console.log(`Scanned ${all.length} assessments — ${corrupt.length} corrupt:`);
  corrupt.forEach(c =>
    console.log(`  ${c.candidateId} (total ${c.totalScore}): ${c.reasons.join(', ')}`)
  );

  if (apply && corrupt.length) {
    const result = await Assessment.deleteMany({ _id: { $in: corrupt.map(c => c.id) } });
    console.log(`\nDeleted ${result.deletedCount} corrupt assessment(s).`);
  } else if (corrupt.length) {
    console.log('\nDry run — re-run with --apply to delete these rows.');
  }

  await mongoose.disconnect();
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
