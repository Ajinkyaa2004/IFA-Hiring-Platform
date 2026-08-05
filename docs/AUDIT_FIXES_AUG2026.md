# Audit Remediation — August 2026

Response to the `SkillQuest_Audit_2026-08-05.xlsx` BUILD LIST. Every genuine
finding is fixed; items the audit got wrong against current `main` are noted.
Security items remain deliberately deferred (per Anmol, 5 Aug) — see the note
at the bottom.

## Fixed in this pass

| Audit # | Finding | Fix |
|---|---|---|
| 5 | Corrupt Unblock Me bank | All 41 levels repaired (ghost 0-length blocks removed, 1-cell pieces normalized, overlap resolved, one malformed target car rebuilt). Every level BFS-verified solvable; `optimalMoves` replaced with true solver minima. Scored runs now use a **fixed 17-level ramp identical for every candidate** (was: random 17-of-41). Repair/verify script: run the solver in `backend/scripts` conventions — see `SCORING_SYSTEM.md`. |
| 6 | Refresh = unlimited fresh 5-minute attempts | Attempt record (`startedAt`, `attempts`, `tabSwitches`) written on Start; refresh resumes the original wall-clock window; expired-while-away attempts are recorded as failed. Quit warning corrected. Tab-switch warnings persist across refresh. |
| 6b (found during fix) | Every tab switch counted twice (wrapper + in-game hook, and the hook also counted window blur) | Single listener in `GameWrapper`; per-game `useTabSwitchDetection` removed from all three games. |
| 4 (residual) | Minesweeper unusable on touch screens (right-click-only flags); boards overflow small phones at high levels | Long-press flagging (450 ms, with haptic tick) + cells now shrink to fit the viewport as the grid grows. Instructions updated. |
| 8 | Minesweeper luck & non-comparable boards | Boards seeded from candidate id + level + attempt (deterministic, auditable); mines placed only after the first click, excluding its neighbourhood. Mine-density selector restricted to practice mode. |
| 7 | Coarse ranking | Per-level moves/times persisted (Unblock Me `levelDetails`, Water Capacity `puzzleSteps`); leaderboard adds a second tie-breaker: excess moves vs solver optimum. |
| 9 | CSV export garbled per-game data (`[object Object]`) | Proper flattened, RFC-4180-escaped export: per-game scores, times, attempts, flags, tracker cid. |
| 10 | DQ/failed runs invisible to admins | Leaderboard API now returns `hasFailedGame` + `failureReasons` + per-game attempts; admin table shows a DQ/Failed badge with reasons on hover; flags included in CSV and webhook rows. |
| 11 (residual) | Water Capacity pre-game instructions described a different game | Rewritten to match the actual jug game. |
| 2 (the real gap) | Scores don't reach the hiring tracker | Backend now POSTs each newly completed game to `SHEETS_WEBHOOK_URL` (fire-and-forget, 8 s timeout, never blocks saving). Point it at the Google Apps Script that appends to the tracking Sheet. Unset = disabled. |
| 3 (the real gap) | No join key to the pipeline | Personal links `https://<app>/?cid=IFA-0043` are supported: the cid is captured at load, stored through profile + assessment as `trackerCid`, and included in the leaderboard, CSV export and webhook rows. Login stays Google OAuth (an open link is weaker identity than OAuth; the cid rides along instead of replacing auth). |
| — (not in audit) | **`DEV_MODE = true` shipped in Unblock Me** — candidates saw a "Debug: Win Level" button granting free score, and played all 41 levels instead of 17 | Debug mode is now a prop only the `/dev/unblock-me` sandbox sets. |
| — (not in audit) | Water Capacity puzzle order shuffled per candidate | Fixed order for everyone. |
| — (not in audit) | Admin dashboard averages chart read a field that doesn't exist (always 0) | Reads `puzzlesCompleted`. |
| — (not in audit) | In-progress/attempt records would have unlocked the next game early | All gating/completion checks now key off recorded `timeSpent`, not record presence. |

## Audit items that were already fine on current `main`

- **#1** Unblock Me "switched off": all four games are `available: true`; the
  assessment completes end-to-end (live completions exist in Atlas).
- **#2** "There is no backend": Express + MongoDB Atlas backend exists and is
  the system of record; results were never localStorage-only on this branch.
- **#3** "Any email + any password": no password auth exists — Google OAuth
  only, admin allowlisted.
- **#4** "iPhones cannot start any game": mobile devices skip the fullscreen
  requirement entirely (the two *residual* mobile issues above were real and
  are fixed).
- **#11** "No rules screen": a rules + per-game how-to screen shows before
  the timer starts (its Water Capacity copy was wrong; now fixed).
- **#12** "Save & Logout destroys the profile": it saves a partial profile to
  MongoDB before logging out.

## Operational steps for the hiring round

1. **Clean the database** — legacy rows contain impossible scores (one
   candidate has `waterCapacity: 15965`):
   `node scripts/cleanupCorruptAssessments.js` (dry run), then `--apply`.
2. **Set `SHEETS_WEBHOOK_URL`** in `backend/.env` to the Apps Script endpoint.
3. **Generate links** from the tracker: `https://<frontend>/?cid=<tracker-id>`.
4. Upload a Question Bank if the Question Game should be part of the round.

## Still deliberately out of scope (parked security, per Anmol 5 Aug)

- `POST /api/assessments` (and the other write endpoints) accept
  unauthenticated writes — a devtools-savvy candidate can still forge a
  score directly. This undermines the attempt-integrity work above; a
  shared-secret header is ~1 hour when security is unparked.
- Client-side timer/game logic remains trusting by design.
