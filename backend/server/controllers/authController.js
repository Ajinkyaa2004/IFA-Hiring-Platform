import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// POST /api/users/register — applicants only; admins are seeded, never self-registered
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const id = newId();
    const user = await User.create({
      id,
      googleId: `local:${id}`,
      email: normalizedEmail,
      name: name.trim(),
      role: 'applicant',
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date(),
    });

    res.status(201).json({ user: user.toJSON(), token: signToken(user) });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Same message for unknown email and wrong password — no account probing
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ user: user.toJSON(), token: signToken(user) });
  } catch (error) {
    next(error);
  }
};
