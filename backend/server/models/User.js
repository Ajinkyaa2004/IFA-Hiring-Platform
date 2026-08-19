import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: {  // ✅ Add custom id field
    type: String,
    unique: true,
    required: true,
  },
  // Legacy field from the Google OAuth era. New local accounts get a unique
  // "local:<id>" placeholder so the existing unique index stays satisfied.
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // bcrypt hash — never serialized (stripped in toJSON below)
  passwordHash: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
  role: {
    type: String,
    enum: ['applicant', 'admin', 'employee', 'client'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Transform to remove MongoDB _id
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    delete ret.googleId;
    return ret;
  }
});

export default mongoose.model('User', userSchema);
