import { requireAuth } from './auth.js';

// Middleware to ensure user is a company
export function requireCompany(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Only companies can access this resource' });
    }
    next();
  });
}

