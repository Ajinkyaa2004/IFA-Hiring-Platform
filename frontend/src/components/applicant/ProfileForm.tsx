import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ApplicantProfile, LOCATIONS } from '@/types';
import { saveProfile, getProfileByUserId } from '@/lib/storage';
import { generateCandidateId } from '@/lib/utils';
import { toast } from 'sonner';
import { getSettings } from '@/lib/settingsApi';
import { LogOut, Sparkles, Target, Zap, Star, Flame, Trophy, Link2, Globe, User, Mail, Phone, GraduationCap, Award, MapPin, Briefcase, Code, Palette, TrendingUp, Users, Megaphone, Heart, MoreHorizontal, MessageSquare, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Floating icon component
const FloatingIcon: React.FC<{ Icon: React.ElementType; delay: number; x: string; y: string; color: string }> = ({ Icon, delay, x, y, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, rotate: 0 }}
    animate={{
      opacity: [0, 0.3, 0],
      scale: [0, 1, 0],
      rotate: [0, 360],
      y: [0, -80],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
  >
    <Icon className={`w-8 h-8 ${color}`} />
  </motion.div>
);

// Role icon mapping
const getRoleIcon = (role: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'Software Engineer': Code,
    'Data Analyst': TrendingUp,
    'Data Science': TrendingUp,
    'Financial Analyst': TrendingUp,
    'Statistician': TrendingUp,
    'Algo Traders': TrendingUp,
    'Virtual Assistant': Users,
    'Trader Technical Analyst': TrendingUp,
    'Workflow Automation': Code,
    'Social Media Manager': Megaphone,
    'Video Editor': Palette,
    'Business Development': Briefcase,
    'Sales and Marketing': Megaphone,
    'Product Manager': Briefcase,
    'UI/UX Designer': Palette,
    'HR Manager': Heart,
    'Other': MoreHorizontal,
  };
  return iconMap[role] || Briefcase;
};

export const ProfileForm: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [communityWhatsappLink, setCommunityWhatsappLink] = useState('');
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [roleWhatsappLinks, setRoleWhatsappLinks] = useState<Record<string, string>>({});
  const [hasJoinedCommunity, setHasJoinedCommunity] = useState(false);
  const [profile, setProfile] = useState<Partial<ApplicantProfile> & { telegramId?: string }>({
    name: '',
    email: user?.email || '',
    phone: '',
    collegeName: '',
    cgpa: '',
    location: '',
    telegramId: '',
    interestedRoles: [],
    resumeLink: '',
    websiteLink: '',
  });

  // Calculate form completion progress
  const calculateProgress = () => {
    const fields = [
      profile.name,
      profile.phone,
      profile.collegeName,
      profile.cgpa,
      profile.location,
      profile.telegramId,
      profile.interestedRoles?.length,
    ];
    const filledFields = fields.filter(f => f && f !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const progress = calculateProgress();
  // Load settings on mount and poll for updates
  useEffect(() => {
    let previousRolesCount = 0;
    
    const loadSettings = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoadingRoles(true);
        }
        
        const settings = await getSettings();
        console.log('📱 Loaded settings:', settings);
        console.log('📱 Available Roles from settings:', settings.availableRoles);
        
        if (settings.communityWhatsappLink) {
          console.log('✅ Community WhatsApp Link found:', settings.communityWhatsappLink);
          setCommunityWhatsappLink(settings.communityWhatsappLink);
        } else {
          console.log('⚠️ No community WhatsApp link configured');
        }
        
        if (settings.availableRoles && settings.availableRoles.length > 0) {
          console.log('✅ Available Roles found:', settings.availableRoles);
          
          // Check if roles have changed
          if (!isInitialLoad && previousRolesCount > 0 && settings.availableRoles.length !== previousRolesCount) {
            toast.info(`Roles updated! Now showing ${settings.availableRoles.length} roles`, {
              duration: 3000,
              icon: '🔄',
            });
          }
          
          previousRolesCount = settings.availableRoles.length;
          setAvailableRoles(settings.availableRoles);
        } else {
          console.log('⚠️ No available roles configured, using default ROLES');
          // Fallback to ROLES from types if no roles configured
          const { ROLES } = await import('@/types');
          setAvailableRoles(ROLES);
          previousRolesCount = ROLES.length;
        }
        
        if (settings.roleWhatsappLinks) {
          console.log('✅ Role WhatsApp Links found:', settings.roleWhatsappLinks);
          setRoleWhatsappLinks(settings.roleWhatsappLinks);
        } else {
          console.log('⚠️ No role WhatsApp links configured');
        }
      } catch (error) {
        console.error('❌ Error fetching settings:', error);
        // Fallback to default ROLES on error
        if (isInitialLoad) {
          const { ROLES } = await import('@/types');
          setAvailableRoles(ROLES);
          previousRolesCount = ROLES.length;
        }
      } finally {
        if (isInitialLoad) {
          setLoadingRoles(false);
        }
      }
    };
    
    // Initial load
    loadSettings(true);
    
    // Poll for updates every 10 seconds
    const pollInterval = setInterval(() => {
      loadSettings(false);
    }, 10000);
    
    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, []);

  // ✅ FIXED: Better profile loading with proper redirect
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setLoadingProfile(true);

        // ✅ Check if profile exists in MongoDB
        const existingProfile = await getProfileByUserId(user.id);

        if (existingProfile) {
          console.log('✅ Profile found:', existingProfile);
          console.log('✅ Profile completed status:', existingProfile.profileCompleted);

          // ✅ CRITICAL: If profile is complete, redirect to assessment
          if (existingProfile.profileCompleted === true) {
            console.log('✅ Profile is complete, redirecting to assessment dashboard...');
            toast.success('Profile loaded! Redirecting to assessment...', {
              duration: 1500,
              icon: '✅',
            });

            // ✅ Small delay to ensure state is set
            setTimeout(() => {
              navigate('/applicant/assessment');
            }, 500);
            return;
          }

          // Profile exists but incomplete - load it into form
          console.log('ℹ️ Profile incomplete, loading into form');
          setProfile({
            name: existingProfile.name || '',
            email: existingProfile.email || user.email || '',
            phone: existingProfile.phone || '',
            collegeName: existingProfile.collegeName || '',
            cgpa: existingProfile.cgpa || '',
            location: existingProfile.location || '',
            telegramId: (existingProfile as any).telegramId || '',
            interestedRoles: existingProfile.interestedRoles || [],
            resumeLink: existingProfile.resumeLink || '',
            websiteLink: existingProfile.websiteLink || '',
          });

          toast.info('Please complete your profile', {
            duration: 2000,
            icon: 'ℹ️',
          });
        } else {
          console.log('ℹ️ No profile found, showing empty form');

          // Pre-fill with user data from auth
          setProfile(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
          }));
        }
      } catch (error) {
        console.error('❌ Error loading profile:', error);
        toast.error('Error loading profile data', {
          duration: 3000,
          icon: '⚠️',
        });

        // Pre-fill with user data even on error
        setProfile(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
        }));
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('User not found. Please log in again.', {
        duration: 4000,
        icon: '⚠️',
      });
      return;
    }

    // Validate required fields
    if (!profile.name || !profile.phone || !profile.collegeName || !profile.cgpa ||
      !profile.location || !profile.telegramId || !profile.interestedRoles?.length) {
      toast.error('Please fill in all required fields', {
        duration: 4000,
        icon: '⚠️',
      });
      return;
    }

    // Validate community WhatsApp join
    if (communityWhatsappLink && !hasJoinedCommunity) {
      toast.error('Please join the WhatsApp community before submitting', {
        duration: 4000,
        icon: '⚠️',
      });
      return;
    }

    setLoading(true);

    try {
      const completeProfile: ApplicantProfile = {
        userId: user.id,
        candidateId: generateCandidateId(),
        name: profile.name,
        email: profile.email || user.email,
        phone: profile.phone,
        collegeName: profile.collegeName,
        cgpa: profile.cgpa,
        location: profile.location,
        telegramId: profile.telegramId,
        interestedRoles: profile.interestedRoles,
        resumeLink: profile.resumeLink,
        websiteLink: profile.websiteLink,
        profileCompleted: true, // ✅ CRITICAL: Set to true
        createdAt: new Date().toISOString(),
      };

      console.log('📝 Saving profile:', completeProfile);

      // ✅ Save to MongoDB
      await saveProfile(completeProfile);

      console.log('✅ Profile saved successfully!');

      toast.success('Profile saved successfully!', {
        duration: 2000,
        icon: '✅',
      });

      // Show success animation
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/applicant/assessment');
      }, 4000); // Increased timeout to allow user to see WhatsApp link
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      toast.error('Error saving profile. Please try again.', {
        duration: 4000,
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndLogout = async () => {
    if (!user) return;

    try {
      const partialProfile: ApplicantProfile = {
        userId: user.id,
        candidateId: generateCandidateId(),
        name: profile.name || '',
        email: profile.email || user.email || '',
        phone: profile.phone || '',
        collegeName: profile.collegeName || '',
        cgpa: profile.cgpa || '',
        location: profile.location || '',
        telegramId: profile.telegramId || '',
        interestedRoles: profile.interestedRoles || [],
        resumeLink: profile.resumeLink,
        websiteLink: profile.websiteLink,
        profileCompleted: false, // ✅ Mark as incomplete
        createdAt: new Date().toISOString(),
      };

      // Save partial profile to MongoDB
      await saveProfile(partialProfile);

      toast.success('Progress saved successfully!', {
        duration: 2000,
        icon: '💾',
      });

      setTimeout(() => logout(), 500);
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Error saving progress', {
        duration: 3000,
        icon: '⚠️',
      });
    }
  };

  const handleRoleToggle = (role: string) => {
    const currentRoles = profile.interestedRoles || [];
    if (currentRoles.includes(role)) {
      setProfile({
        ...profile,
        interestedRoles: currentRoles.filter((r) => r !== role),
      });
    } else {
      setProfile({
        ...profile,
        interestedRoles: [...currentRoles, role],
      });
    }
  };

  // Show loading state while fetching profile
  if (loadingProfile) {
    return (
      <div className="min-h-screen playful-gradient flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-game-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-game-purple-700 font-semibold">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen playful-gradient p-4 relative overflow-hidden"
    >
      {/* Floating Background Orbs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 bg-gradient-to-br from-game-purple-400/30 to-blue-400/20 rounded-full blur-3xl top-10 -left-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-80 h-80 bg-gradient-to-br from-orange-400/20 to-game-purple-400/30 rounded-full blur-3xl bottom-10 -right-20"
        />
      </div>

      {/* Floating background icons */}
      <FloatingIcon Icon={Sparkles} delay={0} x="10%" y="15%" color="text-game-purple-500" />
      <FloatingIcon Icon={Target} delay={1} x="85%" y="20%" color="text-orange-500" />
      <FloatingIcon Icon={Zap} delay={2} x="15%" y="70%" color="text-blue-500" />
      <FloatingIcon Icon={Star} delay={3} x="90%" y="75%" color="text-game-purple-400" />
      <FloatingIcon Icon={Flame} delay={4} x="50%" y="10%" color="text-orange-400" />
      <FloatingIcon Icon={Trophy} delay={5} x="20%" y="85%" color="text-blue-400" />

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-game-purple-500/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.9, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-2xl p-8 shadow-2xl shadow-game-purple-500/30 text-center max-w-md mx-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
                className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Profile Completed! 🎉</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Excellent! Your profile has been saved successfully.
                  <br />
                  <span className="font-medium text-game-purple-700">Redirecting to assessment...</span>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto py-8 relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-game-purple-700 via-game-purple-500 to-game-purple-400 bg-clip-text text-transparent drop-shadow-lg">
              Complete Your IFA Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Please fill in all the details before proceeding to the assessment
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={logout} className="border-2">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </motion.div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-game-purple-500/10 via-blue-500/5 to-orange-500/10 border-2 border-game-purple-500/20 shadow-lg shadow-game-purple-500/10">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-game-purple-700">Profile Completion</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-game-purple-700 to-game-purple-400 bg-clip-text text-transparent">
                  {progress}%
                </span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-game-purple-700 via-game-purple-500 to-game-purple-400 rounded-full relative"
                >
                  <motion.div
                    animate={{
                      x: [0, 100, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="relative border-0 bg-white/95 backdrop-blur-xl shadow-2xl shadow-game-purple-500/20 overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-game-purple-500/20 via-blue-500/20 to-orange-500/20 rounded-xl blur-sm -z-10"></div>
            <div className="absolute inset-[1px] bg-white/95 backdrop-blur-xl rounded-xl"></div>
            <div className="relative">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-game-purple-700 to-game-purple-500 bg-clip-text text-transparent">Applicant Information</CardTitle>
                <CardDescription>
                  All fields marked with * are required. Your Candidate ID will be generated automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-game-purple-700 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <User className="w-4 h-4 text-game-purple-600" />
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="rounded-xl border-2 border-game-purple-500/20 focus:border-game-purple-500 focus:ring-4 focus:ring-game-purple-500/10 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 hover:from-purple-50/20 hover:to-blue-50/20"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-game-purple-600" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-game-purple-600" />
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="rounded-xl border-2 border-game-purple-500/20 focus:border-game-purple-500 focus:ring-4 focus:ring-game-purple-500/10 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 hover:from-purple-50/20 hover:to-blue-50/20"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telegramId" className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-game-purple-600" />
                          Telegram ID *
                        </Label>
                        <Input
                          id="telegramId"
                          type="text"
                          placeholder="@username"
                          value={profile.telegramId}
                          onChange={(e) => setProfile({ ...profile, telegramId: e.target.value })}
                          className="rounded-xl border-2 border-game-purple-500/20 focus:border-game-purple-500 focus:ring-4 focus:ring-game-purple-500/10 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 hover:from-purple-50/20 hover:to-blue-50/20"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                  {/* Academic Information */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-game-purple-700 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Academic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="college" className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-game-purple-600" />
                          College Name *
                        </Label>
                        <Input
                          id="college"
                          value={profile.collegeName}
                          onChange={(e) => setProfile({ ...profile, collegeName: e.target.value })}
                          className="rounded-xl border-2 border-game-purple-500/20 focus:border-game-purple-500 focus:ring-4 focus:ring-game-purple-500/10 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 hover:from-purple-50/20 hover:to-blue-50/20"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cgpa" className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-game-purple-600" />
                          CGPA/GPA *
                        </Label>
                        <Input
                          id="cgpa"
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={profile.cgpa}
                          onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                          className="rounded-xl border-2 border-game-purple-500/20 focus:border-game-purple-500 focus:ring-4 focus:ring-game-purple-500/10 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 hover:from-purple-50/20 hover:to-blue-50/20"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Career Intent */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-game-purple-700 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Career Intent
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-game-purple-600" />
                        Preferred Location *
                      </Label>
                      <select
                        id="location"
                        className="flex h-10 w-full rounded-xl border-2 border-game-purple-500/20 focus:border-game-purple-500 focus:ring-4 focus:ring-game-purple-500/10 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 hover:from-purple-50/20 hover:to-blue-50/20 px-3 py-2 text-sm"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        required
                      >
                        <option value="">Select a location</option>
                        {LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-game-purple-600" />
                        Interested Roles * (Select at least one)
                      </Label>
                      {loadingRoles ? (
                        <div className="flex min-h-[200px] w-full rounded-xl border-2 border-game-purple-500/20 bg-gradient-to-r from-white to-purple-50/30 px-3 py-2 items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 border-4 border-game-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">Loading available roles...</p>
                          </div>
                        </div>
                      ) : (
                        <select
                          multiple
                          className="flex min-h-[200px] w-full rounded-xl border-2 border-game-purple-500/20 focus:border-game-purple-500 focus:ring-4 focus:ring-game-purple-500/10 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 hover:from-purple-50/20 hover:to-blue-50/20 px-3 py-2 text-sm"
                          value={profile.interestedRoles || []}
                          onChange={(e) => {
                            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                            setProfile({ ...profile, interestedRoles: selectedOptions });
                          }}
                          required
                        >
                          {availableRoles.length > 0 ? (
                            availableRoles.map((role) => (
                              <option key={role} value={role} className="py-2 px-3 hover:bg-game-purple-50">
                                {role}
                              </option>
                            ))
                          ) : (
                            <option disabled className="py-2 px-3 text-gray-400">
                              No roles available. Please contact admin.
                            </option>
                          )}
                        </select>
                      )}
                      <p className="text-xs text-gray-500">
                        Hold Ctrl (Windows) or Cmd (Mac) to select multiple roles
                      </p>
                      {!loadingRoles && availableRoles.length > 0 && (
                        <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          ✅ {availableRoles.length} roles available
                        </p>
                      )}
                      {profile.interestedRoles && profile.interestedRoles.length > 0 && (
                        <div className="space-y-3 mt-3">
                          {profile.interestedRoles.map((role) => {
                            const RoleIcon = getRoleIcon(role);
                            const roleLink = roleWhatsappLinks[role];
                            return (
                              <motion.div
                                key={role}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-game-purple-500/10 to-game-purple-400/10 border-2 border-game-purple-500/30 rounded-xl"
                              >
                                <div className="flex items-center gap-2">
                                  <RoleIcon className="w-5 h-5 text-game-purple-700" />
                                  <span className="font-medium text-game-purple-700">{role}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRoleToggle(role)}
                                    className="ml-2 text-game-purple-600 hover:text-game-purple-900 transition-colors font-bold text-lg"
                                  >
                                    ×
                                  </button>
                                </div>
                                {roleLink ? (
                                  <a
                                    href={roleLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      toast.success(`Opening WhatsApp group for ${role}`, {
                                        duration: 2000,
                                        icon: '📱',
                                      });
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                    Join Group
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-500 italic px-3">No group link yet</span>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Resume & Website Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-game-purple-700 flex items-center gap-2">
                      <Link2 className="w-5 h-5" />
                      Links & Portfolio
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="resumeLink" className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-game-purple-600" />
                          Resume Link (Google Drive, Dropbox, etc.)
                        </Label>
                        <Input
                          id="resumeLink"
                          type="url"
                          value={profile.resumeLink}
                          onChange={(e) => setProfile({ ...profile, resumeLink: e.target.value })}
                          placeholder="https://drive.google.com/..."
                          className="rounded-xl border-2 border-game-purple-500/20 focus:border-game-purple-500 focus:ring-4 focus:ring-game-purple-500/10 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 hover:from-purple-50/20 hover:to-blue-50/20"
                        />
                        <p className="text-xs text-gray-500">
                          Share a public link to your resume (PDF format recommended)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="websiteLink" className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-game-purple-600" />
                          Website/Portfolio Link (Optional)
                        </Label>
                        <Input
                          id="websiteLink"
                          type="url"
                          value={profile.websiteLink}
                          onChange={(e) => setProfile({ ...profile, websiteLink: e.target.value })}
                          placeholder="https://yourportfolio.com"
                          className="rounded-xl border-2 border-game-purple-500/20 focus:border-game-purple-500 focus:ring-4 focus:ring-game-purple-500/10 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 hover:from-purple-50/20 hover:to-blue-50/20"
                        />
                        <p className="text-xs text-gray-500">
                          Share your portfolio, GitHub, LinkedIn, or personal website
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mandatory Community WhatsApp Link */}
                  {communityWhatsappLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Users className="w-6 h-6 text-green-700 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-green-800 mb-2">
                            Join Our WhatsApp Community (Required) 📱
                          </h3>
                          <p className="text-sm text-green-700 mb-4">
                            Before submitting your profile, please join our WhatsApp community to stay connected and receive important updates.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <a
                              href={communityWhatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                toast.success('Opening WhatsApp Community', {
                                  duration: 2000,
                                  icon: '🎉',
                                });
                              }}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              <MessageSquare className="w-5 h-5" />
                              Join Community
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={hasJoinedCommunity}
                                onChange={(e) => setHasJoinedCommunity(e.target.checked)}
                                className="w-5 h-5 rounded border-2 border-green-500 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                              />
                              <span className="text-sm font-medium text-green-800">
                                I have joined the community
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                      {!hasJoinedCommunity && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-green-600 bg-white/50 p-2 rounded-lg border border-green-200"
                        >
                          ⚠️ Please check the box after joining the community to enable form submission.
                        </motion.p>
                      )}
                    </motion.div>
                  )}

                  <div className="flex justify-end space-x-4 pt-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveAndLogout}
                        disabled={loading}
                        className="border-2 border-game-purple-500/30 text-game-purple-700 hover:bg-game-purple-50"
                      >
                        Save & Logout
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        disabled={loading || !profile.interestedRoles?.length || (!!communityWhatsappLink && !hasJoinedCommunity)}
                        className="bg-gradient-to-r from-game-purple-700 via-game-purple-600 to-game-purple-500 hover:from-game-purple-800 hover:via-game-purple-700 hover:to-game-purple-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-game-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-game-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : 'Continue to Assessment'}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
