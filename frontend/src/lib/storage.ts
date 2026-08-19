import { User, ApplicantProfile, Assessment, LeaderboardEntry } from '@/types';
import { userApi, profileApi, assessmentApi, leaderboardApi } from './api';

// ==================== USER MANAGEMENT ====================

export const getUsers = async (): Promise<User[]> => {
  try {
    const users = await userApi.getAll();
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('ifa_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('ifa_current_user');
  }
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem('ifa_current_user');
  return data ? JSON.parse(data) : null;
};

// ==================== PROFILE MANAGEMENT ====================

export const saveProfile = async (profile: ApplicantProfile): Promise<void> => {
  try {
    await profileApi.createOrUpdate(profile);
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

export const getProfiles = async (): Promise<ApplicantProfile[]> => {
  try {
    const profiles = await profileApi.getAll();
    return profiles;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
};

export const getProfileByUserId = async (userId: string): Promise<ApplicantProfile | null> => {
  try {
    const profile = await profileApi.getByUserId(userId);
    return profile;
  } catch (error) {
    // ✅ FIXED: Return null for 404 errors (profile not found)
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
      return null;
    }
    console.error('Error fetching profile:', error);
    return null;
  }
};

// ==================== ASSESSMENT MANAGEMENT ====================

export const saveAssessment = async (assessment: Assessment): Promise<void> => {
  try {
    await assessmentApi.createOrUpdate(assessment);
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw error;
  }
};

export const getAssessments = async (): Promise<Assessment[]> => {
  try {
    const assessments = await assessmentApi.getAll();
    return assessments;
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return [];
  }
};

export const getAssessmentByUserId = async (userId: string): Promise<Assessment | null> => {
  try {
    const assessment = await assessmentApi.getByUserId(userId);
    return assessment;
  } catch (error) {
    // ✅ FIXED: Return null for 404 errors (assessment not found)
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
      return null;
    }
    console.error('Error fetching assessment:', error);
    return null;
  }
};

// ==================== LEADERBOARD ====================

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const leaderboard = await leaderboardApi.get();
    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

// Admin accounts are seeded server-side (backend/scripts/seedAuthUsers.js) —
// the client never creates privileged users.
