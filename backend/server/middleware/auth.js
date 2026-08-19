import jwt from 'jsonwebtoken';

// Read lazily: ES module imports evaluate before server.js calls
// dotenv.config(), so a top-level read would always see undefined.
const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set — add it to backend/.env');
  }
  return process.env.JWT_SECRET;
};

export const signToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    getSecret(),
    { expiresIn: '7d' }
  );

// Requires a valid Bearer token; attaches { sub, role, email } as req.auth
export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.auth = jwt.verify(token, getSecret());
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
};

export const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.auth.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};
