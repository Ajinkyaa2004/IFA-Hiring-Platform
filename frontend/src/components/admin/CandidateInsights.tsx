import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApplicantProfile, Assessment } from '@/types';
import { Clock, Users, Bomb, Droplet, Car, Trophy, ChevronDown, User, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CandidateInsightsProps {
  profiles: ApplicantProfile[];
  assessments: Assessment[];
}

interface GameTimeData {
  name: string;
  unblockMe: number;
  minesweeper: number;
  waterCapacity: number;
  questionGame: number;
  unblockMeLevels: number;
  minesweeperLevels: number;
  waterCapacityLevels: number;
  questionGameLevels: number;
  createdAt: string;
  interestedRoles: string[];
  totalScore: number;
}

export const CandidateInsights: React.FC<CandidateInsightsProps> = ({ profiles, assessments }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'role' | 'score'>('score');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Get unique roles from all profiles
  const allRoles = Array.from(new Set(profiles.flatMap(p => p.interestedRoles))).sort();

  // Calculate time spent and levels data for each candidate
  const getTimeSpentData = (): GameTimeData[] => {
    let data = profiles
      .map(profile => {
        const assessment = assessments.find(a => a.userId === profile.userId || a.candidateId === profile.candidateId);
        if (!assessment) return null;

        return {
          name: profile.name,
          unblockMe: assessment.games['unblock-me']?.timeSpent || 0,
          minesweeper: assessment.games.minesweeper?.timeSpent || 0,
          waterCapacity: assessment.games['water-capacity']?.timeSpent || 0,
          questionGame: assessment.games['question-game']?.timeSpent || 0,
          unblockMeLevels: assessment.games['unblock-me']?.puzzlesCompleted || 0,
          minesweeperLevels: assessment.games.minesweeper?.puzzlesCompleted || 0,
          waterCapacityLevels: assessment.games['water-capacity']?.puzzlesCompleted || 0,
          questionGameLevels: assessment.games['question-game']?.puzzlesCompleted || 0,
          createdAt: profile.createdAt,
          interestedRoles: profile.interestedRoles,
          totalScore: assessment.totalScore || 0,
        };
      })
      .filter(Boolean) as GameTimeData[];

    // Filter by role if selected
    if (selectedRole !== 'all') {
      data = data.filter(candidate => candidate.interestedRoles.includes(selectedRole));
    }

    // Sort data
    if (sortBy === 'date') {
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'role') {
      data.sort((a, b) => {
        const roleA = a.interestedRoles[0] || '';
        const roleB = b.interestedRoles[0] || '';
        return roleA.localeCompare(roleB);
      });
    } else if (sortBy === 'score') {
      data.sort((a, b) => b.totalScore - a.totalScore);
    }

    return data;
  };

  const timeData = getTimeSpentData();

  // Calculate average times for each game
  const avgTimes = {
    unblockMe: timeData.reduce((sum, item) => sum + item.unblockMe, 0) / timeData.length || 0,
    minesweeper: timeData.reduce((sum, item) => sum + item.minesweeper, 0) / timeData.length || 0,
    waterCapacity: timeData.reduce((sum, item) => sum + item.waterCapacity, 0) / timeData.length || 0,
    questionGame: timeData.reduce((sum, item) => sum + item.questionGame, 0) / timeData.length || 0,
  };

  // Format time in minutes and seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get the maximum time for scaling the bars
  const maxTime = Math.max(
    ...timeData.flatMap(item => [item.unblockMe, item.minesweeper, item.waterCapacity, item.questionGame])
  );

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-xl border-2 border-game-purple-500/30 shadow-xl shadow-game-purple-500/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-game-purple-700 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Candidate Time Insights
          </CardTitle>
          <CardDescription className="text-game-purple-600/70 font-medium">
            Time spent analysis for each game across all candidates
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Average Time Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/5 to-purple-400/5 border-2 border-purple-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-700">Unblock Me</h3>
                  <p className="text-2xl font-extrabold text-purple-600">{formatTime(Math.round(avgTimes.unblockMe))}</p>
                  <p className="text-sm text-gray-600">Average Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-gradient-to-br from-game-purple-500/5 to-game-purple-400/5 border-2 border-game-purple-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-game-purple-600 to-game-purple-500 rounded-full flex items-center justify-center">
                  <Bomb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-game-purple-700">Minesweeper</h3>
                  <p className="text-2xl font-extrabold text-game-purple-600">{formatTime(Math.round(avgTimes.minesweeper))}</p>
                  <p className="text-sm text-gray-600">Average Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-game-teal-500/5 to-game-teal-400/5 border-2 border-game-teal-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-game-teal-600 to-game-teal-500 rounded-full flex items-center justify-center">
                  <Droplet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-game-teal-700">Water Capacity</h3>
                  <p className="text-2xl font-extrabold text-game-teal-600">{formatTime(Math.round(avgTimes.waterCapacity))}</p>
                  <p className="text-sm text-gray-600">Average Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Individual Candidate Grid */}
      <Card className="bg-white/80 backdrop-blur-xl border-2 border-game-purple-500/30 shadow-xl shadow-game-purple-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-game-purple-700 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Time Spent by Each Candidate
              </CardTitle>
              <CardDescription className="text-game-purple-600/70">
                Click on any candidate card to view their detailed game performance
              </CardDescription>
            </div>
            
            {/* Sorting Controls */}
            <div className="flex items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'role' | 'score')}
                  className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg bg-white hover:border-game-purple-400 focus:border-game-purple-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="score">Score (High to Low)</option>
                  <option value="date">Date (Newest First)</option>
                  <option value="role">Job Role (A-Z)</option>
                </select>
              </div>

              {/* Filter by Role Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Filter Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg bg-white hover:border-game-purple-400 focus:border-game-purple-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  {allRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {timeData.map((candidate, index) => {
              const uniqueKey = `${candidate.name}-${index}`;
              const isExpanded = expandedCard === uniqueKey;
              const gamesPlayed = [
                candidate.unblockMeLevels > 0,
                candidate.minesweeperLevels > 0,
                candidate.waterCapacityLevels > 0,
                candidate.questionGameLevels > 0
              ].filter(Boolean).length;
              const totalLevels = candidate.unblockMeLevels + candidate.minesweeperLevels + candidate.waterCapacityLevels + candidate.questionGameLevels;

              return (
                <motion.div
                  key={uniqueKey}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-2 border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all duration-200"
                  style={{ alignSelf: 'start' }}
                >
                  {/* Card Header - Always Visible */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedCard(isExpanded ? null : uniqueKey)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-game-purple-500 to-game-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-800 text-sm leading-tight truncate">{candidate.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {candidate.interestedRoles && candidate.interestedRoles.length > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-game-purple-100 text-game-purple-700">
                                {candidate.interestedRoles[0]}
                              </span>
                            )}
                            <p className="text-xs text-gray-500">{gamesPlayed}/4 games</p>
                          </div>
                          {candidate.createdAt && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(candidate.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0 ml-2"
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-1 text-xs text-gray-600 bg-purple-50 px-2 py-1 rounded-full">
                        <Trophy className="w-3 h-3 text-purple-600" />
                        <span className="font-semibold">{totalLevels}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span className="font-semibold">
                          {formatTime(candidate.unblockMe + candidate.minesweeper + candidate.waterCapacity + candidate.questionGame)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 overflow-hidden"
                      >
                        <div className="p-4 space-y-3 bg-gray-50">
                          {/* Unblock Me */}
                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Car className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Unblock Me</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Levels</span>
                                <span className="text-xs font-bold text-purple-600">{candidate.unblockMeLevels}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Time</span>
                                <span className="text-xs font-bold text-purple-600">{formatTime(candidate.unblockMe)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div 
                                  className="bg-gradient-to-r from-purple-600 to-purple-500 h-1.5 rounded-full"
                                  style={{ width: `${(candidate.unblockMe / maxTime) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Minesweeper */}
                          <div className="bg-white rounded-lg p-3 border border-game-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-game-purple-100 rounded-lg flex items-center justify-center">
                                  <Bomb className="w-4 h-4 text-game-purple-600" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Minesweeper</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Levels</span>
                                <span className="text-xs font-bold text-game-purple-600">{candidate.minesweeperLevels}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Time</span>
                                <span className="text-xs font-bold text-game-purple-600">{formatTime(candidate.minesweeper)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div 
                                  className="bg-gradient-to-r from-game-purple-600 to-game-purple-500 h-1.5 rounded-full"
                                  style={{ width: `${(candidate.minesweeper / maxTime) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Water Capacity */}
                          <div className="bg-white rounded-lg p-3 border border-game-teal-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-game-teal-100 rounded-lg flex items-center justify-center">
                                  <Droplet className="w-4 h-4 text-game-teal-600" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Water Capacity</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Levels</span>
                                <span className="text-xs font-bold text-game-teal-600">{candidate.waterCapacityLevels}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Time</span>
                                <span className="text-xs font-bold text-game-teal-600">{formatTime(candidate.waterCapacity)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div 
                                  className="bg-gradient-to-r from-game-teal-600 to-game-teal-500 h-1.5 rounded-full"
                                  style={{ width: `${(candidate.waterCapacity / maxTime) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Question Game */}
                          <div className="bg-white rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Question Game</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Score</span>
                                <span className="text-xs font-bold text-blue-600">{candidate.questionGameLevels}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Time</span>
                                <span className="text-xs font-bold text-blue-600">{formatTime(candidate.questionGame)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-600 to-blue-500 h-1.5 rounded-full"
                                  style={{ width: `${(candidate.questionGame / maxTime) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
