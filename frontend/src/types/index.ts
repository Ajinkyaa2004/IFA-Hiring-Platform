export type UserRole = "applicant" | "admin" | "employee" | "client";

// Local email + password accounts (JWT sessions)
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  createdAt: string;
}

export interface ApplicantProfile {
  userId: string;
  candidateId: string;
  name: string;
  email: string;
  phone: string;
  collegeName: string;
  cgpa: string;
  location: string;
  telegramId: string; // Added for profile contact via Telegram
  interestedRoles: string[];
  resumeUrl?: string;
  resumeLink?: string;
  websiteLink?: string;
  profileCompleted: boolean;
  trackerCid?: string; // hiring-tracker candidate id from the ?cid= link
  createdAt: string;
}

export type GameType = "minesweeper" | "unblock-me" | "water-capacity" | "question-game";

// Per-level breakdown for Unblock Me — moves vs solver-verified optimum
export interface LevelDetail {
  level: number;
  moves: number;
  optimalMoves: number;
  timeSec: number;
}

export interface GameScore {
  gameType: GameType;
  puzzlesCompleted: number;
  // Absent while an attempt is in progress — its presence is the
  // "actually completed" marker used across the app.
  timeSpent?: number; // in seconds
  errorRate?: number;
  minimumMoves?: number;
  maxScore?: number; // For question game to store max possible score
  completedAt?: string;
  trialCompleted: boolean;
  failed?: boolean;
  failureReason?: string;
  // Attempt integrity: written when the candidate presses Start, so a
  // mid-game refresh resumes the same 5-minute window instead of a fresh one.
  startedAt?: string;
  attempts?: number;
  tabSwitches?: number;
  inProgress?: boolean;
  // Granular metrics for continuous ranking
  levelDetails?: LevelDetail[];   // unblock-me
  puzzleSteps?: number[];         // water-capacity
  puzzleScores?: number[];        // water-capacity
  wrongFlags?: number;            // minesweeper
  levelsCompleted?: number;       // minesweeper (score is points, this is levels)
}

export interface Assessment {
  userId: string;
  candidateId: string;
  // Candidate id assigned by the hiring tracker (?cid= link) — the join key
  // between platform scores and the recruiting pipeline.
  trackerCid?: string;
  games: {
    minesweeper: GameScore | null;
    "unblock-me": GameScore | null;
    "water-capacity": GameScore | null;
    "question-game": GameScore | null;
  };
  totalScore: number;
  completedAt?: string;
  currentGame?: GameType;
  trialMode: {
    minesweeper: boolean;
    "unblock-me": boolean;
    "water-capacity": boolean;
    "question-game": boolean;
  };
}

export interface LeaderboardEntry {
  candidateId: string;
  trackerCid?: string;
  name: string;
  email: string;
  collegeName: string;
  location: string;
  totalScore: number;
  totalTimeSpent?: number; // Added for tie-breaking display
  totalExcessMoves?: number; // moves above solver optimum — second tie-breaker
  completedAt: string;
  gameScores: {
    minesweeper: number;
    unblockMe: number;
    waterCapacity: number;
    questionGame: number;
  };
  gameTimes?: {
    minesweeper: number;
    unblockMe: number;
    waterCapacity: number;
    questionGame: number;
  };
  attempts?: {
    minesweeper: number;
    unblockMe: number;
    waterCapacity: number;
    questionGame: number;
  };
  hasFailedGame?: boolean;
  failureReasons?: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  message: string;
  timestamp: string;
  relatedQuestions?: string[];
  feedback?: "positive" | "negative" | null;
}

export const LOCATIONS = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Remote",
  "Other"
];

export const ROLES = [
  "Software Engineer",
  "Data Analyst",
  "Data Science",
  "Financial Analyst",
  "Statistician",
  "Algo Traders",
  "Virtual Assistant",
  "Trader Technical Analyst",
  "Workflow Automation",
  "Social Media Manager",
  "Video Editor",
  "Business Development",
  "Sales and Marketing",
  "Product Manager",
  "UI/UX Designer",
  "HR Manager",
  "Other"
];

export const MESSAGE_TEMPLATES = {
  "interview-invitation": {
    name: "Interview Invitation",
    email:
      "Dear {name}, Congratulations! You have been shortlisted for an interview. Please check your email for details.",
    whatsapp:
      "Hi {name}! 🎉 You're invited for an interview. Check your email for details.",
    telegram:
      "Congratulations {name}! You've been shortlisted for an interview. Details in your email."
  },
  "assessment-complete": {
    name: "Assessment Complete",
    email:
      "Dear {name}, Thank you for completing the assessment. We will review your performance and get back to you soon.",
    whatsapp:
      "Hi {name}! Thanks for completing the assessment. We'll be in touch soon! 👍",
    telegram:
      "Thanks for completing the assessment, {name}! We'll review and get back to you."
  },
  "application-received": {
    name: "Application Received",
    email:
      "Dear {name}, We have received your application. Good luck with the assessment!",
    whatsapp: "Hi {name}! Your application is received. Best of luck! 🍀",
    telegram: "Application received, {name}! Good luck with your assessment."
  }
};