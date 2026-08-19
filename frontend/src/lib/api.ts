import { User, ApplicantProfile, Assessment, LeaderboardEntry } from '@/types';

// API Base URL - reads from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAuthToken = (): string | null => localStorage.getItem('ifa_auth_token');
export const setAuthToken = (token: string | null): void => {
  if (token) localStorage.setItem('ifa_auth_token', token);
  else localStorage.removeItem('ifa_auth_token');
};

// Generic API call function with error handling
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = getAuthToken();
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== AUTH / USER API ====================

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    apiCall<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string): Promise<AuthResponse> =>
    apiCall<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
};

export const userApi = {
  // Get all users (admin only)
  getAll: (): Promise<User[]> => apiCall<User[]>('/users'),
};

// ==================== PROFILE API ====================

export const profileApi = {
  // Get all profiles
  getAll: (): Promise<ApplicantProfile[]> => apiCall<ApplicantProfile[]>('/profiles'),
  
  // Get profile by user ID
  getByUserId: (userId: string): Promise<ApplicantProfile> => apiCall<ApplicantProfile>(`/profiles/user/${userId}`),
  
  // Create or update profile
  createOrUpdate: (profileData: ApplicantProfile): Promise<ApplicantProfile> => apiCall<ApplicantProfile>('/profiles', {
    method: 'POST',
    body: JSON.stringify(profileData),
  }),
};

// ==================== ASSESSMENT API ====================

export const assessmentApi = {
  // Get all assessments
  getAll: (): Promise<Assessment[]> => apiCall<Assessment[]>('/assessments'),
  
  // Get assessment by user ID
  getByUserId: (userId: string): Promise<Assessment> => apiCall<Assessment>(`/assessments/user/${userId}`),
  
  // Create or update assessment
  createOrUpdate: (assessmentData: Assessment): Promise<Assessment> => apiCall<Assessment>('/assessments', {
    method: 'POST',
    body: JSON.stringify(assessmentData),
  }),
};

// ==================== LEADERBOARD API ====================

export const leaderboardApi = {
  // Get leaderboard
  get: (): Promise<LeaderboardEntry[]> => apiCall<LeaderboardEntry[]>('/leaderboard'),
};
