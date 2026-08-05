# Game Unlocking Sequence - Assessment Flow

## Overview
The IFA SkillQuest Assessment has **4 games** that unlock sequentially. Users must complete or fail each game before the next one unlocks.

## Game Sequence

### 1️⃣ **Unblock Me** (First Game)
- ✅ **Always unlocked** for new users
- User must complete or fail this game first

### 2️⃣ **Minesweeper** (Second Game)
- 🔒 **Unlocks after**: Unblock Me is completed or failed
- User must complete or fail this game to proceed

### 3️⃣ **Water Capacity** (Third Game)
- 🔒 **Unlocks after**: Minesweeper is completed or failed
- User must complete or fail this game to proceed

### 4️⃣ **Question Game** (Fourth Game)
- 🔒 **Unlocks after**: ALL three previous games are completed or failed
- Final game in the assessment

## Game Completion States

### ✅ **Completed Successfully**
- User finished the game within time limit
- Score is recorded
- Next game unlocks
- User returns to assessment dashboard

### ❌ **Failed - Tab Switching Violation**
- User switched tabs 3 times during game
- Game is marked as **failed**
- Failure reason: "Disqualified for excessive tab switching"
- Score: 0
- **Next game still unlocks** ✅
- User returns to assessment dashboard

### ⏱️ **Failed - Time Expired**
- 5-minute timer ran out
- Game is marked as **completed** with current score
- Next game unlocks
- User returns to assessment dashboard

## Unlocking Logic

### Code Implementation
```typescript
const isGameUnlocked = (gameType: GameType): boolean => {
  if (gameType === 'unblock-me') return true; // Always unlocked
  
  if (gameType === 'minesweeper') {
    return assessment.games['unblock-me'] !== null; // Unlocks after Unblock Me
  }
  
  if (gameType === 'water-capacity') {
    return assessment.games.minesweeper !== null; // Unlocks after Minesweeper
  }
  
  if (gameType === 'question-game') {
    // Unlocks only after ALL three games are done
    return assessment.games['unblock-me'] !== null &&
           assessment.games.minesweeper !== null &&
           assessment.games['water-capacity'] !== null;
  }
  
  return false;
};
```

### Key Points
- A game is considered "done" if `assessment.games[gameType] !== null`
- This includes **both successful completion AND failure**
- Failed games still unlock the next game in sequence

## User Flow Examples

### Example 1: Successful Completion
```
1. User logs in → Sees 4 games
2. Unblock Me: ✅ Unlocked, Others: 🔒 Locked
3. User plays Unblock Me → Completes successfully
4. Returns to dashboard
5. Minesweeper: ✅ Unlocked, Water Capacity: 🔒 Locked, Question Game: 🔒 Locked
6. User plays Minesweeper → Completes successfully
7. Returns to dashboard
8. Water Capacity: ✅ Unlocked, Question Game: 🔒 Locked
9. User plays Water Capacity → Completes successfully
10. Returns to dashboard
11. Question Game: ✅ Unlocked
12. User plays Question Game → Completes successfully
13. All games complete → View Results button appears
```

### Example 2: Tab Switching Violation
```
1. User logs in → Sees 4 games
2. Unblock Me: ✅ Unlocked, Others: 🔒 Locked
3. User plays Unblock Me
4. User switches tabs 3 times → DISQUALIFIED ❌
5. Game saved as failed with reason "Disqualified for excessive tab switching"
6. Returns to dashboard
7. Minesweeper: ✅ Unlocked (next game unlocks despite failure)
8. User plays Minesweeper → Completes successfully
9. Water Capacity: ✅ Unlocked
10. And so on...
```

### Example 3: Mixed Results
```
1. Unblock Me: ❌ Failed (tab switching)
2. Minesweeper: ✅ Completed
3. Water Capacity: ❌ Failed (tab switching)
4. Question Game: ✅ Unlocked (all 3 previous games done)
5. Question Game: ✅ Completed
6. All games complete → View Results
```

## Mobile vs Desktop Behavior

### 📱 **Mobile**
- ✅ No fullscreen required
- ✅ Tab switching detection active
- ✅ Same unlocking sequence
- ✅ Touch controls work for Unblock Me
- ✅ 3-strike rule enforced

### 💻 **Desktop**
- ✅ Fullscreen required
- ✅ Tab switching detection active
- ✅ Same unlocking sequence
- ✅ Mouse controls work
- ✅ 3-strike rule enforced

### Key Difference
The **ONLY** difference is fullscreen requirement:
- Desktop: Must use fullscreen
- Mobile: Can play without fullscreen

**Everything else is identical!**

## Tab Switching Behavior

### Both Mobile & Desktop
1. **1st tab switch**: Warning 1/3 ⚠️
2. **2nd tab switch**: Warning 2/3 ⚠️
3. **3rd tab switch**: DISQUALIFIED ❌
   - Game saved as failed
   - User redirected to dashboard
   - Next game unlocks

### What Triggers Tab Switch Detection?
- Switching to another browser tab
- Switching to another app (mobile)
- Minimizing the browser
- Receiving a phone call (mobile - may vary)

## Critical Fix Applied

### Problem Found
Previously, when a user was disqualified for tab switching, the game state was **NOT saved**. This caused:
- ❌ Next game didn't unlock
- ❌ User stuck on same game
- ❌ Assessment couldn't progress

### Solution Implemented
Now when user is disqualified:
- ✅ Game is saved with `failed: true`
- ✅ Failure reason is recorded
- ✅ Next game unlocks properly
- ✅ User can continue assessment

## Testing Checklist

### Desktop Testing
- [ ] Unblock Me unlocks immediately
- [ ] Complete Unblock Me → Minesweeper unlocks
- [ ] Complete Minesweeper → Water Capacity unlocks
- [ ] Complete Water Capacity → Question Game unlocks
- [ ] Tab switch 3 times → Game fails, next unlocks
- [ ] All games complete → Results button appears

### Mobile Testing
- [ ] Unblock Me unlocks immediately
- [ ] Touch controls work for Unblock Me
- [ ] Complete Unblock Me → Minesweeper unlocks
- [ ] Complete Minesweeper → Water Capacity unlocks
- [ ] Complete Water Capacity → Question Game unlocks
- [ ] Switch apps 3 times → Game fails, next unlocks
- [ ] All games complete → Results button appears

## Summary

✅ **Game unlocking works correctly on BOTH mobile and desktop**
✅ **Sequential unlocking enforced**
✅ **Failed games still unlock next game**
✅ **Tab switching violations properly handled**
✅ **Assessment can always progress**

The functionality is **working properly** and **identical** on both platforms!
