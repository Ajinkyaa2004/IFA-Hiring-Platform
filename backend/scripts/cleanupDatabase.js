import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env quietly
dotenv.config({ path: join(__dirname, '../.env'), override: true });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const profileSchema = new mongoose.Schema({}, { strict: false });
const assessmentSchema = new mongoose.Schema({}, { strict: false });

const Profile = mongoose.model('Profile', profileSchema, 'profiles');
const Assessment = mongoose.model('Assessment', assessmentSchema, 'assessments');

const keepCandidates = [
  'Chirag Khati',
  'Valorant',
  'Yathendra Aashish Velpuri',
  'Anmol Pathak',
  'Ajinkya Dhumal',
  'Ankush Pal',
  'Eeshal Sai Kumar Teluri',
  'Piyush Kumar',
  'Rupesh K'
];

const fakeGameData = {
  'Anmol Pathak': {
    unblockMe: { puzzlesCompleted: 9, timeSpent: 285 },
    minesweeper: { puzzlesCompleted: 8, timeSpent: 320 },
    waterCapacity: { puzzlesCompleted: 9, timeSpent: 295 }
  },
  'Eeshal Sai Kumar Teluri': {
    unblockMe: { puzzlesCompleted: 8, timeSpent: 260 },
    minesweeper: { puzzlesCompleted: 7, timeSpent: 295 },
    waterCapacity: { puzzlesCompleted: 8, timeSpent: 275 }
  },
  'Yathendra Aashish Velpuri': {
    unblockMe: { puzzlesCompleted: 7, timeSpent: 245 },
    minesweeper: { puzzlesCompleted: 6, timeSpent: 280 },
    waterCapacity: { puzzlesCompleted: 7, timeSpent: 265 }
  },
  'Ankush Pal': {
    unblockMe: { puzzlesCompleted: 6, timeSpent: 220 },
    minesweeper: { puzzlesCompleted: 5, timeSpent: 245 },
    waterCapacity: { puzzlesCompleted: 6, timeSpent: 240 }
  },
  'Piyush Kumar': {
    unblockMe: { puzzlesCompleted: 5, timeSpent: 195 },
    minesweeper: { puzzlesCompleted: 4, timeSpent: 210 },
    waterCapacity: { puzzlesCompleted: 5, timeSpent: 215 }
  },
  'Rupesh K': {
    unblockMe: { puzzlesCompleted: 4, timeSpent: 175 },
    minesweeper: { puzzlesCompleted: 3, timeSpent: 190 },
    waterCapacity: { puzzlesCompleted: 4, timeSpent: 195 }
  },
  'Ajinkya Dhumal': {
    unblockMe: { puzzlesCompleted: 3, timeSpent: 75 },
    minesweeper: { puzzlesCompleted: 0, timeSpent: 16 },
    waterCapacity: { puzzlesCompleted: 0, timeSpent: 300 }
  },
  'Chirag Khati': {
    unblockMe: { puzzlesCompleted: 3, timeSpent: 155 },
    minesweeper: { puzzlesCompleted: 2, timeSpent: 170 },
    waterCapacity: { puzzlesCompleted: 3, timeSpent: 165 }
  },
  'Valorant': {
    unblockMe: { puzzlesCompleted: 2, timeSpent: 135 },
    minesweeper: { puzzlesCompleted: 1, timeSpent: 145 },
    waterCapacity: { puzzlesCompleted: 2, timeSpent: 150 }
  }
};

const cleanupDatabase = async () => {
  try {
    console.log('🧹 Starting database cleanup...\n');

    const allProfiles = await Profile.find({});
    console.log(`📊 Total profiles: ${allProfiles.length}`);

    const profilesToDelete = allProfiles.filter(p => !keepCandidates.includes(p.name));
    const profilesToKeep = allProfiles.filter(p => keepCandidates.includes(p.name));

    console.log(`✅ Keeping ${profilesToKeep.length} profiles`);
    console.log(`❌ Deleting ${profilesToDelete.length} profiles\n`);

    const profileIdsToDelete = profilesToDelete.map(p => p.userId);
    await Profile.deleteMany({ userId: { $in: profileIdsToDelete } });
    await Assessment.deleteMany({ userId: { $in: profileIdsToDelete } });
    
    console.log(`✅ Deleted ${profilesToDelete.length} profiles and their assessments\n`);
    
    // Remove duplicate profiles (keep only first occurrence of each name)
    console.log('🔍 Removing duplicate profiles...\n');
    const seenNames = new Set();
    const duplicatesToDelete = [];
    
    for (const profile of profilesToKeep) {
      if (seenNames.has(profile.name)) {
        duplicatesToDelete.push(profile.userId);
        console.log(`❌ Removing duplicate: ${profile.name}`);
      } else {
        seenNames.add(profile.name);
      }
    }
    
    if (duplicatesToDelete.length > 0) {
      await Profile.deleteMany({ userId: { $in: duplicatesToDelete } });
      await Assessment.deleteMany({ userId: { $in: duplicatesToDelete } });
      console.log(`✅ Deleted ${duplicatesToDelete.length} duplicate profiles\n`);
    }
    
    console.log('🎮 Adding fake game data...\n');

    // Get fresh list of profiles after duplicate removal
    const uniqueProfiles = await Profile.find({ userId: { $nin: duplicatesToDelete } });
    
    for (const profile of uniqueProfiles) {
      const gameData = fakeGameData[profile.name];
      
      if (gameData) {
        const totalScore = 
          gameData.unblockMe.puzzlesCompleted * 100 +
          gameData.minesweeper.puzzlesCompleted * 100 +
          gameData.waterCapacity.puzzlesCompleted * 100;

        await Assessment.findOneAndUpdate(
          { userId: profile.userId },
          {
            userId: profile.userId,
            candidateId: profile.candidateId,
            games: {
              'unblock-me': {
                gameType: 'unblock-me',
                puzzlesCompleted: gameData.unblockMe.puzzlesCompleted,
                timeSpent: gameData.unblockMe.timeSpent,
                minimumMoves: gameData.unblockMe.puzzlesCompleted * 8,
                completedAt: new Date().toISOString(),
                trialCompleted: false
              },
              'minesweeper': {
                gameType: 'minesweeper',
                puzzlesCompleted: gameData.minesweeper.puzzlesCompleted,
                timeSpent: gameData.minesweeper.timeSpent,
                errorRate: Math.random() * 0.3,
                completedAt: new Date().toISOString(),
                trialCompleted: false
              },
              'water-capacity': {
                gameType: 'water-capacity',
                puzzlesCompleted: gameData.waterCapacity.puzzlesCompleted,
                timeSpent: gameData.waterCapacity.timeSpent,
                minimumMoves: gameData.waterCapacity.puzzlesCompleted * 6,
                completedAt: new Date().toISOString(),
                trialCompleted: false
              }
            },
            totalScore: totalScore,
            completedAt: new Date().toISOString(),
            trialMode: {
              'unblock-me': false,
              'minesweeper': false,
              'water-capacity': false
            }
          },
          { upsert: true, new: true }
        );
        
        console.log(`✅ ${profile.name}: ${totalScore} points (${gameData.unblockMe.puzzlesCompleted + gameData.minesweeper.puzzlesCompleted + gameData.waterCapacity.puzzlesCompleted}/30 levels)`);
      }
    }

    const finalProfiles = await Profile.countDocuments();
    const finalAssessments = await Assessment.countDocuments();
    
    console.log('\n🎉 Database cleanup completed!');
    console.log(`📊 Final: ${finalProfiles} profiles, ${finalAssessments} assessments\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
};

connectDB().then(() => cleanupDatabase());
