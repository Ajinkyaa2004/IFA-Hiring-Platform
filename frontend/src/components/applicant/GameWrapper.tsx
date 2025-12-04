import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getAssessmentByUserId, saveAssessment } from '@/lib/storage';
import { GameType, GameScore } from '@/types';
import { formatTime, calculateTotalScore } from '@/lib/utils';
import { Minesweeper } from '@/components/games/Minesweeper';
import { UnblockMe } from '@/components/games/UnblockMe';
import { WaterCapacity } from '@/components/games/WaterCapacity';
import { QuizSelection } from '@/components/games/QuizSelection';
import { QuestionGamePlayer } from '@/components/games/QuestionGamePlayer';
import { AlertTriangle, Maximize, X, Sparkles, Zap, Clock, Target, Shield, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const GAME_DURATION = 300; // 5 minutes in seconds

export const GameWrapper: React.FC = () => {
  const { gameType, quizId } = useParams<{ gameType: GameType; quizId: string }>();
  const [searchParams] = useSearchParams();
  const isTrial = searchParams.get('trial') === 'true';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [_isDisqualified, setIsDisqualified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGamePaused, setIsGamePaused] = useState(false);

  // ✅ UPDATED: Now async with MongoDB
  useEffect(() => {
    const checkGameAccess = async () => {
      if (!user || !gameType) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);

        // ✅ Fetch assessment from MongoDB (now async)
        const assessment = await getAssessmentByUserId(user.id);

        if (!assessment) {
          toast.error('Assessment not found. Please complete your profile first.', {
            duration: 3000,
            icon: '⚠️',
          });
          navigate('/applicant/assessment');
          return;
        }

        // Check if game is unlocked (new order: Unblock Me -> Minesweeper -> Water Capacity -> Question Game)
        if (gameType === 'minesweeper' && !assessment.games['unblock-me']) {
          toast.warning('Please complete Unblock Me first to unlock this game.', {
            duration: 3000,
            icon: '🔒',
          });
          navigate('/applicant/assessment');
          return;
        }
        if (gameType === 'water-capacity' && !assessment.games.minesweeper) {
          toast.warning('Please complete Minesweeper first to unlock this game.', {
            duration: 3000,
            icon: '🔒',
          });
          navigate('/applicant/assessment');
          return;
        }
        if (gameType === 'question-game' && 
            (!assessment.games['unblock-me'] || !assessment.games.minesweeper || !assessment.games['water-capacity'])) {
          toast.warning('Please complete Unblock Me, Minesweeper, and Water Capacity first to unlock Question Game.', {
            duration: 4000,
            icon: '🔒',
          });
          navigate('/applicant/assessment');
          return;
        }

        // Check if already completed (for scored mode)
        // Game is only completed if it has actual timeSpent data (was actually played)
        const gameData = assessment.games[gameType];
        const isActuallyCompleted = gameData && gameData.timeSpent !== undefined && gameData.timeSpent !== null;
        
        if (!isTrial && isActuallyCompleted) {
          toast.info('You have already completed this game.', {
            duration: 3000,
            icon: 'ℹ️',
          });
          navigate('/applicant/assessment');
          return;
        }
      } catch (error) {
        console.error('Error checking game access:', error);
        toast.error('Error loading game. Please try again.', {
          duration: 4000,
          icon: '❌',
        });
        navigate('/applicant/assessment');
      } finally {
        setIsLoading(false);
      }
    };

    checkGameAccess();
  }, [user, gameType, navigate, isTrial]);

  // Timer
  useEffect(() => {
    if (!gameStarted || isTrial || isGamePaused) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, isTrial, isGamePaused]);

  // Fullscreen monitoring
  useEffect(() => {
    if (!gameStarted || isTrial) return;

    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);

      if (!inFullscreen && gameStarted) {
        setIsGamePaused(true);
        toast.warning('Game paused! Please return to fullscreen to continue.', {
          duration: 5000,
          icon: '⏸️',
        });
      } else if (inFullscreen && isGamePaused) {
        setIsGamePaused(false);
        toast.success('Game resumed!', {
          duration: 2000,
          icon: '▶️',
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [gameStarted, isTrial, isGamePaused]);

  // Tab switching detection
  useEffect(() => {
    if (!gameStarted || isTrial) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setIsDisqualified(true);
            toast.error('You have been disqualified for excessive tab switching.', {
              duration: 5000,
              icon: '🚫',
            });
            navigate('/applicant/assessment');
          } else {
            setShowWarning(true);
            toast.warning(`Warning ${newCount}/3: Tab switching detected. Further violations will result in disqualification.`, {
              duration: 4000,
              icon: '⚠️',
            });
            setTimeout(() => setShowWarning(false), 3000);
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameStarted, navigate, isTrial]);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setGameStarted(true);
      toast.success('Game started! Good luck!', {
        duration: 2000,
        icon: '🚀',
      });
    } catch (err) {
      toast.error('Please enable fullscreen to start the assessment.', {
        duration: 4000,
        icon: '📺',
      });
    }
  };

  const resumeFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setIsGamePaused(false);
    } catch (err) {
      toast.error('Unable to enter fullscreen. Please try again.', {
        duration: 4000,
        icon: '📺',
      });
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  // ✅ UPDATED: Now async with MongoDB
  const handleGameComplete = useCallback(async (score: number, metadata: number, failed?: boolean, failureReason?: string) => {
    if (!user || !gameType) {
      return;
    }

    if (isTrial) {
      toast.success('Practice session completed!', {
        duration: 2000,
        icon: '✅',
      });
      exitFullscreen();
      navigate('/applicant/assessment');
      return;
    }

    try {
      // ✅ Fetch assessment from MongoDB (now async)
      const assessment = await getAssessmentByUserId(user.id);
      if (!assessment) {
        toast.error('Assessment not found.', {
          duration: 3000,
          icon: '⚠️',
        });
        return;
      }

      const gameScore: GameScore = {
        gameType,
        puzzlesCompleted: score,
        timeSpent: GAME_DURATION - timeRemaining,
        errorRate: gameType === 'minesweeper' ? metadata : undefined,
        minimumMoves: gameType !== 'minesweeper' ? metadata : undefined,
        completedAt: new Date().toISOString(),
        trialCompleted: false,
        failed: failed || false,
        failureReason: failureReason,
      };

      assessment.games[gameType] = gameScore;

      // Calculate total score if all games completed
      if (assessment.games.minesweeper && assessment.games['unblock-me'] && assessment.games['water-capacity']) {
        assessment.totalScore = calculateTotalScore(
          assessment.games.minesweeper.puzzlesCompleted,
          assessment.games['unblock-me'].puzzlesCompleted,
          assessment.games['water-capacity'].puzzlesCompleted,
          assessment.games['question-game']?.puzzlesCompleted || 0
        );
        assessment.completedAt = new Date().toISOString();

        toast.success('🎉 All games completed! View your results now!', {
          duration: 4000,
          icon: '🏆',
        });
      } else {
        toast.success(`${getGameTitle()} completed successfully!`, {
          duration: 3000,
          icon: '✅',
        });
      }

      // ✅ Save to MongoDB (now async)
      await saveAssessment(assessment);

      exitFullscreen();
      navigate('/applicant/assessment');
    } catch (error) {
      console.error('Error saving game completion:', error);
      toast.error('Error saving game progress. Please try again.', {
        duration: 4000,
        icon: '❌',
      });
    }
  }, [user, gameType, timeRemaining, navigate, isTrial]);

  const quitGame = () => {
    toast.warning('Progress will not be saved if you quit now!', {
      duration: 3000,
      icon: '⚠️',
      action: {
        label: 'Quit Anyway',
        onClick: () => {
          exitFullscreen();
          navigate('/applicant/assessment');
        },
      },
    });
  };

  const getGameTitle = () => {
    switch (gameType) {
      case 'minesweeper': return 'Minesweeper';
      case 'unblock-me': return 'Unblock Me';
      case 'water-capacity': return 'Water Capacity';
      case 'question-game': return 'Question Game';
      default: return 'Game';
    }
  };

  const renderGame = () => {
    switch (gameType) {
      case 'minesweeper':
        return <Minesweeper onComplete={handleGameComplete} timeRemaining={timeRemaining} isTrialMode={isTrial} />;
      case 'unblock-me':
        return <UnblockMe onComplete={handleGameComplete} timeRemaining={timeRemaining} isTrialMode={isTrial} />;
      case 'water-capacity':
        return <WaterCapacity onComplete={handleGameComplete} timeRemaining={timeRemaining} isTrialMode={isTrial} />;
      case 'question-game':
        return quizId ? (
          <QuestionGamePlayer uploadId={quizId} onComplete={(score, maxScore) => handleGameComplete(score, maxScore)} />
        ) : (
          <QuizSelection />
        );
      default:
        return <div>Invalid game type</div>;
    }
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#8558ed] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-[#8558ed] font-semibold">Loading game...</p>
        </motion.div>
      </div>
    );
  }

  if (!gameStarted && !isTrial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-3xl top-10 -left-20"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute w-80 h-80 bg-blue-400/20 rounded-full blur-3xl bottom-10 -right-20"
          />
        </div>

        {/* Floating Icons */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 pointer-events-none"
        >
          <Sparkles className="w-8 h-8 text-purple-400/30" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-32 right-16 pointer-events-none"
        >
          <Zap className="w-10 h-10 text-blue-400/30" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 15, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-24 left-20 pointer-events-none"
        >
          <Target className="w-7 h-7 text-cyan-400/30" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <Card className="bg-white/95 backdrop-blur-xl border-2 border-gray-200/50 shadow-2xl">
            <CardHeader className="text-center pb-4 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 mb-2 flex items-center justify-center gap-3">
                  <Sparkles className="w-10 h-10 text-purple-600" />
                  Ready to Start
                </CardTitle>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center justify-center gap-2"
                >
                  <Rocket className="w-6 h-6 text-blue-600" />
                  {getGameTitle()}
                </motion.p>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rules Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200/50 rounded-2xl"
              >
                <div className="flex items-start space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-gradient-to-tr from-purple-600 to-blue-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                  >
                    <Shield className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">📋 Important Assessment Rules:</p>
                    <ul className="space-y-3">
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>This game will run for exactly <strong className="text-blue-600">5 minutes</strong></span>
                      </motion.li>
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <Maximize className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>You must play in <strong className="text-purple-600">fullscreen mode</strong></span>
                      </motion.li>
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>Tab switching is monitored and limited to <strong className="text-orange-600">2 warnings</strong></span>
                      </motion.li>
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <Target className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                        <span>Your score is based on <strong className="text-cyan-600">puzzles/levels completed</strong></span>
                      </motion.li>
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <Zap className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <span>The timer <strong className="text-indigo-600">cannot be paused</strong> once started</span>
                      </motion.li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Game-Specific How to Play Instructions */}
              {gameType === 'question-game' && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 border-2 border-cyan-200/50 rounded-2xl"
                >
                  <p className="font-bold text-lg bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-600" />
                    📚 How to Play:
                  </p>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span>Answer multiple-choice questions within the time limit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span>Select the correct answer by clicking on the option</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span>Each question may have images to help you understand better</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span>Your score is based on the number of correct answers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span>Review all questions before submitting your answers</span>
                    </li>
                  </ul>
                </motion.div>
              )}

              {gameType === 'unblock-me' && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 border-2 border-orange-200/50 rounded-2xl"
                >
                  <p className="font-bold text-lg bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    🚗 How to Play:
                  </p>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Move blocks horizontally or vertically to create a path</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Click and drag blocks to move them in valid directions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Clear the path for the red block to exit through the opening</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Complete as many levels as possible within 5 minutes</span>
                    </li>
                  </ul>
                </motion.div>
              )}

              {gameType === 'minesweeper' && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200/50 rounded-2xl"
                >
                  <p className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    💣 How to Play:
                  </p>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Left-click to reveal cells, right-click to flag potential mines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Numbers show how many mines are in adjacent cells</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Use logic to deduce where mines are located</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Complete levels by revealing all safe cells without hitting mines</span>
                    </li>
                  </ul>
                </motion.div>
              )}

              {gameType === 'water-capacity' && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 border-2 border-teal-200/50 rounded-2xl"
                >
                  <p className="font-bold text-lg bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-teal-600" />
                    💧 How to Play:
                  </p>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>Calculate the total water capacity trapped between blocks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>Enter your answer in the input field and click Submit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>Water fills up to the lowest surrounding wall height</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>Solve as many puzzles as possible within 5 minutes</span>
                    </li>
                  </ul>
                </motion.div>
              )}

              {/* Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={enterFullscreen}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white shadow-lg"
                  >
                    <Maximize className="w-5 h-5 mr-2" />
                    Enter Fullscreen & Start
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => navigate('/applicant/assessment')}
                    variant="outline"
                    className="h-14 px-8 text-lg font-bold border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </Button>
                </motion.div>
              </motion.div>

              {/* Good Luck Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-lg font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>Good Luck! You've got this!</span>
                  <Rocket className="w-5 h-5 text-cyan-600" />
                </motion.p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with timer and warnings */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">{getGameTitle()}</h2>
            {isTrial && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                Practice Mode
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!isTrial && (
              <>
                <div className={`text-2xl font-mono font-bold ${timeRemaining < 60 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </div>
                {tabSwitchCount > 0 && (
                  <div className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                    Warnings: {tabSwitchCount}/3
                  </div>
                )}
              </>
            )}
            <Button onClick={quitGame} variant="destructive" size="sm">
              <X className="w-4 h-4 mr-2" />
              Quit
            </Button>
          </div>
        </div>
      </div>

      {/* Warning overlay */}
      {showWarning && !isTrial && !isGamePaused && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Warning: Stay in fullscreen and on this tab!</span>
          </div>
        </div>
      )}

      {/* Fullscreen Pause Overlay */}
      {isGamePaused && !isTrial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="text-center space-y-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex justify-center"
              >
                <div className="w-20 h-20 bg-gradient-to-tr from-[#8558ed] to-[#b18aff] rounded-full flex items-center justify-center">
                  <Maximize className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <div>
                <h2 className="text-3xl font-extrabold text-[#8558ed] mb-2">Game Paused</h2>
                <p className="text-gray-600 text-lg">
                  You exited fullscreen mode. The timer is paused.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 text-left">
                    <strong className="text-orange-600">Important:</strong> You must be in fullscreen mode to continue the assessment. Click the button below to resume.
                  </p>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={resumeFullscreen}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white shadow-lg"
                >
                  <Maximize className="w-5 h-5 mr-2" />
                  Return to Fullscreen & Resume
                </Button>
              </motion.div>

              <p className="text-xs text-gray-500">
                The game will automatically resume once you're back in fullscreen
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Game content */}
      <div className={`py-8 ${isGamePaused ? 'pointer-events-none blur-sm' : ''}`}>
        {renderGame()}
      </div>
    </div>
  );
};