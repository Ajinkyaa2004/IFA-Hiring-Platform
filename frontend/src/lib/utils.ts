import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCandidateId(): string {
  const prefix = "IFA";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function calculateTotalScore(
  minesweeperScore: number,
  unblockMeScore: number,
  waterCapacityScore: number,
  questionGameScore: number = 0
): number {
  // SIMPLE SCORING LOGIC:
  // - Unblock Me: 5 points per puzzle solved
  // - Water Capacity: 5 points per level completed
  // - Minesweeper: 5 points per level completed (already includes -1 per wrong flag in game logic)
  // - Question Game: 1 point per correct answer

  const unblockMePoints = unblockMeScore * 5;
  const waterCapacityPoints = waterCapacityScore * 5;
  const minesweeperPoints = minesweeperScore; // Minesweeper score in DB is already calculated points
  const questionGamePoints = questionGameScore * 1; // 1 point per correct answer

  return Math.round(unblockMePoints + waterCapacityPoints + minesweeperPoints + questionGamePoints);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}