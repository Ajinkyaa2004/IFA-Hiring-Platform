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
  // Calculate total score based on raw performance without caps
  // Assign points per puzzle: Minesweeper (5), Unblock Me (6), Water Capacity (3)
  const minesweeperPoints = minesweeperScore * 5;
  const unblockMePoints = unblockMeScore * 6;
  const waterCapacityPoints = waterCapacityScore * 3;
  // Question Game score is already in points (e.g. 8/10), so we add it directly.
  // We multiply by 10 to give it more weight relative to the other games if needed,
  // but for now let's keep it raw or maybe x10 to match the scale of other games?
  // If other games give ~150 points total, and quiz is 10, it's negligible.
  // Let's multiply by 10 to make a 10/10 quiz worth 100 points.
  const questionGamePoints = questionGameScore * 10;

  return Math.round(minesweeperPoints + unblockMePoints + waterCapacityPoints + questionGamePoints);
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